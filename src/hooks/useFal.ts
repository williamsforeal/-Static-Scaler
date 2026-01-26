/**
 * React Query hooks for fal.ai integration
 *
 * These hooks provide a clean way to use fal.ai in React components
 * with automatic loading states, error handling, and caching.
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import {
  generateImage,
  generateImageBatch,
  generateAdVariants,
  submitImageJob,
  getJobStatus,
  getJobResult,
  isFalConfigured,
  type GenerateImageInput,
  type GenerateImageResult,
  type AdPrompts,
  type AdVariantResults,
  type FalModel,
  type QueueStatus,
} from '@/lib/fal';

// =============================================================================
// CONFIGURATION CHECK
// =============================================================================

/**
 * Hook to check if fal.ai is properly configured
 */
export function useFalConfig() {
  return useQuery({
    queryKey: ['fal-config'],
    queryFn: () => ({ configured: isFalConfigured() }),
    staleTime: Infinity,
  });
}

// =============================================================================
// SYNCHRONOUS GENERATION HOOKS
// =============================================================================

/**
 * Hook for generating a single image
 *
 * @example
 * const { mutate, isPending, data, error } = useGenerateImage();
 *
 * // Trigger generation
 * mutate({ prompt: "a beautiful sunset" });
 *
 * // In JSX
 * {isPending && <Spinner />}
 * {data && <img src={data.images[0].url} />}
 */
export function useGenerateImage(model?: FalModel) {
  return useMutation({
    mutationFn: (input: GenerateImageInput) => generateImage(input, model),
  });
}

/**
 * Hook for batch image generation
 *
 * @example
 * const { mutate, isPending } = useGenerateImageBatch();
 * mutate([
 *   { prompt: "variant 1" },
 *   { prompt: "variant 2" },
 *   { prompt: "variant 3" }
 * ]);
 */
export function useGenerateImageBatch(model?: FalModel) {
  return useMutation({
    mutationFn: (inputs: GenerateImageInput[]) => generateImageBatch(inputs, model),
  });
}

/**
 * Hook for generating ad variants (A/B/StoryBrand)
 *
 * @example
 * const { mutate, isPending, data } = useGenerateAdVariants();
 * mutate({
 *   variantA: "Product shot prompt",
 *   variantB: "Lifestyle prompt",
 *   storyBrand: "Hero image prompt"
 * });
 */
export function useGenerateAdVariants(options?: { width?: number; height?: number; model?: FalModel }) {
  return useMutation({
    mutationFn: (prompts: AdPrompts) => generateAdVariants(prompts, options),
  });
}

// =============================================================================
// QUEUE-BASED HOOKS (for longer running jobs)
// =============================================================================

interface QueuedJobState {
  requestId: string | null;
  status: QueueStatus | null;
  result: GenerateImageResult | null;
  error: Error | null;
  isSubmitting: boolean;
  isPolling: boolean;
}

/**
 * Hook for queue-based image generation with status tracking
 *
 * @example
 * const {
 *   submit,
 *   status,
 *   result,
 *   isSubmitting,
 *   isPolling
 * } = useQueuedImageGeneration();
 *
 * // Submit a job
 * submit({ prompt: "detailed artwork" });
 *
 * // Track progress
 * {status?.status === 'IN_PROGRESS' && <ProgressBar />}
 * {result && <img src={result.images[0].url} />}
 */
export function useQueuedImageGeneration(model: FalModel = 'fal-ai/flux/dev') {
  const [state, setState] = useState<QueuedJobState>({
    requestId: null,
    status: null,
    result: null,
    error: null,
    isSubmitting: false,
    isPolling: false,
  });

  const submit = useCallback(
    async (input: GenerateImageInput) => {
      setState((s) => ({
        ...s,
        isSubmitting: true,
        error: null,
        result: null,
        status: null,
      }));

      try {
        // Submit job
        const { requestId } = await submitImageJob(input, model);
        setState((s) => ({ ...s, requestId, isSubmitting: false, isPolling: true }));

        // Poll for completion
        let currentStatus: QueueStatus;
        do {
          await new Promise((r) => setTimeout(r, 2000));
          currentStatus = await getJobStatus(requestId, model);
          setState((s) => ({ ...s, status: currentStatus }));
        } while (currentStatus.status !== 'COMPLETED' && currentStatus.status !== 'FAILED');

        if (currentStatus.status === 'FAILED') {
          throw new Error('Image generation failed');
        }

        // Get result
        const result = await getJobResult(requestId, model);
        setState((s) => ({ ...s, result, isPolling: false }));
        return result;
      } catch (error) {
        setState((s) => ({
          ...s,
          error: error as Error,
          isSubmitting: false,
          isPolling: false,
        }));
        throw error;
      }
    },
    [model]
  );

  const reset = useCallback(() => {
    setState({
      requestId: null,
      status: null,
      result: null,
      error: null,
      isSubmitting: false,
      isPolling: false,
    });
  }, []);

  return {
    submit,
    reset,
    ...state,
    isLoading: state.isSubmitting || state.isPolling,
  };
}

// =============================================================================
// STREAMING HOOKS (real-time status updates)
// =============================================================================

interface StreamingState {
  status: QueueStatus | null;
  result: GenerateImageResult | null;
  error: Error | null;
  isGenerating: boolean;
  progress: number; // 0-100
}

/**
 * Hook for streaming image generation with real-time status
 *
 * @example
 * const { generate, status, progress, result, isGenerating } = useStreamingImageGeneration();
 *
 * // Generate with progress tracking
 * generate({ prompt: "a beautiful sunset" });
 *
 * // Show progress
 * {isGenerating && <ProgressBar value={progress} />}
 */
export function useStreamingImageGeneration(model: FalModel = 'fal-ai/flux/schnell') {
  const [state, setState] = useState<StreamingState>({
    status: null,
    result: null,
    error: null,
    isGenerating: false,
    progress: 0,
  });

  const generate = useCallback(
    async (input: GenerateImageInput) => {
      setState({
        status: null,
        result: null,
        error: null,
        isGenerating: true,
        progress: 0,
      });

      try {
        const { fal } = await import('@fal-ai/client');

        const result = await fal.subscribe(model, {
          input: {
            prompt: input.prompt,
            negative_prompt: input.negativePrompt,
            image_size: {
              width: input.width || 1024,
              height: input.height || 1024,
            },
            num_images: input.numImages || 1,
            seed: input.seed,
            guidance_scale: input.guidanceScale || 7.5,
            num_inference_steps: input.numInferenceSteps || 28,
          },
          onQueueUpdate: (update) => {
            const status = update as QueueStatus;
            let progress = 0;

            switch (status.status) {
              case 'IN_QUEUE':
                progress = 10;
                break;
              case 'IN_PROGRESS':
                progress = 50;
                break;
              case 'COMPLETED':
                progress = 100;
                break;
            }

            setState((s) => ({ ...s, status, progress }));
          },
        });

        const data = result.data as GenerateImageResult;
        setState((s) => ({
          ...s,
          result: data,
          isGenerating: false,
          progress: 100,
        }));

        return data;
      } catch (error) {
        setState((s) => ({
          ...s,
          error: error as Error,
          isGenerating: false,
        }));
        throw error;
      }
    },
    [model]
  );

  const reset = useCallback(() => {
    setState({
      status: null,
      result: null,
      error: null,
      isGenerating: false,
      progress: 0,
    });
  }, []);

  return {
    generate,
    reset,
    ...state,
  };
}

// =============================================================================
// COMBINED HOOK (most common use case)
// =============================================================================

/**
 * All-in-one hook for image generation
 * Automatically chooses the best method based on the model
 *
 * @example
 * const { generate, result, isLoading, progress, error } = useFalGeneration();
 *
 * // Simple usage
 * await generate({ prompt: "a sunset" });
 *
 * // With options
 * await generate({
 *   prompt: "detailed artwork",
 *   width: 1024,
 *   height: 768
 * }, { model: 'fal-ai/flux/dev' });
 */
export function useFalGeneration() {
  const [result, setResult] = useState<GenerateImageResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const generate = useCallback(
    async (
      input: GenerateImageInput,
      options?: { model?: FalModel }
    ): Promise<GenerateImageResult> => {
      const model = options?.model || 'fal-ai/flux/schnell';

      setIsLoading(true);
      setError(null);
      setResult(null);
      setProgress(0);

      try {
        const { fal } = await import('@fal-ai/client');

        const result = await fal.subscribe(model, {
          input: {
            prompt: input.prompt,
            negative_prompt: input.negativePrompt,
            image_size: {
              width: input.width || 1024,
              height: input.height || 1024,
            },
            num_images: input.numImages || 1,
            seed: input.seed,
            guidance_scale: input.guidanceScale || 7.5,
            num_inference_steps: input.numInferenceSteps || 28,
          },
          onQueueUpdate: (update) => {
            const status = update as QueueStatus;
            switch (status.status) {
              case 'IN_QUEUE':
                setProgress(20);
                break;
              case 'IN_PROGRESS':
                setProgress(60);
                break;
              case 'COMPLETED':
                setProgress(100);
                break;
            }
          },
        });

        const data = result.data as GenerateImageResult;
        setResult(data);
        setProgress(100);
        return data;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
    setProgress(0);
  }, []);

  return {
    generate,
    reset,
    result,
    error,
    isLoading,
    progress,
    isConfigured: isFalConfigured(),
  };
}
