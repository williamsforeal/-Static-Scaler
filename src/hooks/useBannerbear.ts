/**
 * React Query hooks for Bannerbear integration
 *
 * Provides hooks for generating composite images with text overlays.
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import {
  generateCompositeImage,
  generateAndWaitForComposite,
  generateBatchComposites,
  getBannerbearImage,
  listBannerbearTemplates,
  isBannerbearConfigured,
  getAvailableFormats,
} from '@/lib/bannerbear';
import { areBannerbearTemplatesConfigured, getUnconfiguredTemplates } from '@/data/bannerbear-templates';
import type { AdOverlayConfig, CompositeImageResult, BannerbearImage } from '@/types/bannerbear';

// =============================================================================
// CONFIGURATION HOOKS
// =============================================================================

/**
 * Check if Bannerbear is properly configured (API key + templates)
 */
export function useBannerbearConfig() {
  return useQuery({
    queryKey: ['bannerbear-config'],
    queryFn: () => ({
      apiKeyConfigured: isBannerbearConfigured(),
      templatesConfigured: areBannerbearTemplatesConfigured(),
      unconfiguredTemplates: getUnconfiguredTemplates(),
      availableFormats: getAvailableFormats(),
    }),
    staleTime: Infinity,
  });
}

/**
 * Fetch available templates from Bannerbear account
 */
export function useBannerbearTemplates() {
  return useQuery({
    queryKey: ['bannerbear-templates'],
    queryFn: listBannerbearTemplates,
    enabled: isBannerbearConfigured(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// =============================================================================
// GENERATION HOOKS
// =============================================================================

/**
 * Hook for generating a single composite image
 *
 * @example
 * const { mutate, isPending, data } = useGenerateComposite();
 *
 * mutate({
 *   baseImageUrl: 'https://fal.media/...',
 *   overlay: { headline: 'Your Headline', cta: 'Shop Now', format: 'square' }
 * });
 */
export function useGenerateComposite() {
  return useMutation({
    mutationFn: (params: { baseImageUrl: string; overlay: AdOverlayConfig }) =>
      generateAndWaitForComposite(params),
  });
}

/**
 * Hook for generating composite with async start (returns UID for polling)
 */
export function useStartComposite() {
  return useMutation({
    mutationFn: (params: {
      baseImageUrl: string;
      overlay: AdOverlayConfig;
      webhookUrl?: string;
    }) => generateCompositeImage(params),
  });
}

/**
 * Hook for polling a Bannerbear image status
 */
export function useBannerbearImage(uid: string | null, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ['bannerbear-image', uid],
    queryFn: () => getBannerbearImage(uid!),
    enabled: !!uid,
    refetchInterval: options?.refetchInterval ?? false,
  });
}

// =============================================================================
// BATCH PROCESSING HOOKS
// =============================================================================

interface BatchCompositeState {
  results: CompositeImageResult[];
  completed: number;
  total: number;
  isProcessing: boolean;
  error: Error | null;
}

/**
 * Hook for batch composite image generation with progress tracking
 *
 * @example
 * const { processBatch, progress, results, isProcessing } = useBatchComposite();
 *
 * await processBatch([
 *   { baseImageUrl: 'url1', overlay: {...} },
 *   { baseImageUrl: 'url2', overlay: {...} },
 * ]);
 *
 * console.log(`${progress.completed}/${progress.total} complete`);
 */
export function useBatchComposite() {
  const [state, setState] = useState<BatchCompositeState>({
    results: [],
    completed: 0,
    total: 0,
    isProcessing: false,
    error: null,
  });

  const processBatch = useCallback(
    async (
      items: Array<{ baseImageUrl: string; overlay: AdOverlayConfig }>
    ): Promise<CompositeImageResult[]> => {
      setState({
        results: [],
        completed: 0,
        total: items.length,
        isProcessing: true,
        error: null,
      });

      try {
        const results = await generateBatchComposites({
          items,
          onProgress: (completed, total) => {
            setState(s => ({ ...s, completed, total }));
          },
        });

        setState(s => ({ ...s, results, isProcessing: false }));
        return results;
      } catch (error) {
        setState(s => ({
          ...s,
          isProcessing: false,
          error: error as Error,
        }));
        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      results: [],
      completed: 0,
      total: 0,
      isProcessing: false,
      error: null,
    });
  }, []);

  return {
    processBatch,
    reset,
    results: state.results,
    progress: { completed: state.completed, total: state.total },
    isProcessing: state.isProcessing,
    error: state.error,
  };
}

// =============================================================================
// COMBINED PIPELINE HOOK
// =============================================================================

interface CompositeGenerationState {
  baseImageUrl: string | null;
  result: CompositeImageResult | null;
  status: 'idle' | 'generating' | 'completed' | 'failed';
  error: Error | null;
}

/**
 * Simple hook for generating a composite image from a base URL
 *
 * @example
 * const { generate, result, status, error } = useCompositeGeneration();
 *
 * await generate({
 *   baseImageUrl: 'https://fal.media/...',
 *   overlay: { headline: 'Your Text', cta: 'Buy Now', format: 'square' }
 * });
 */
export function useCompositeGeneration() {
  const [state, setState] = useState<CompositeGenerationState>({
    baseImageUrl: null,
    result: null,
    status: 'idle',
    error: null,
  });

  const generate = useCallback(
    async (params: {
      baseImageUrl: string;
      overlay: AdOverlayConfig;
    }): Promise<CompositeImageResult> => {
      setState({
        baseImageUrl: params.baseImageUrl,
        result: null,
        status: 'generating',
        error: null,
      });

      try {
        const result = await generateAndWaitForComposite(params);
        setState(s => ({
          ...s,
          result,
          status: result.status === 'completed' ? 'completed' : 'failed',
          error: result.error ? new Error(result.error) : null,
        }));
        return result;
      } catch (error) {
        setState(s => ({
          ...s,
          status: 'failed',
          error: error as Error,
        }));
        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      baseImageUrl: null,
      result: null,
      status: 'idle',
      error: null,
    });
  }, []);

  return {
    generate,
    reset,
    baseImageUrl: state.baseImageUrl,
    result: state.result,
    status: state.status,
    error: state.error,
    isConfigured: isBannerbearConfigured(),
  };
}
