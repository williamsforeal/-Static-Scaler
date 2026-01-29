/**
 * fal.ai Service Module
 *
 * This module provides typed functions for interacting with fal.ai's image generation APIs.
 *
 * Supported Models:
 * - fal-ai/flux/dev          : High quality, slower (~10-20s)
 * - fal-ai/flux-lora         : Custom LoRA models
 * - fal-ai/fast-sdxl         : Fast SDXL generation (~2-5s)
 * - fal-ai/flux/schnell      : Fastest FLUX model (~2-4s)
 *
 * Usage:
 *   import { generateImage, generateImageBatch } from '@/lib/fal';
 *   const result = await generateImage({ prompt: "a beautiful sunset" });
 */

import { fal } from "@fal-ai/client";

// Initialize fal client with API key
// Note: In production, this should go through a backend proxy
const FAL_KEY = import.meta.env.VITE_FAL_KEY;

if (FAL_KEY && FAL_KEY !== 'your-fal-api-key-here') {
  fal.config({
    credentials: FAL_KEY,
  });
}

// =============================================================================
// TYPES
// =============================================================================

export interface FalImage {
  url: string;
  width: number;
  height: number;
  content_type: string;
}

export interface GenerateImageInput {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numImages?: number;
  seed?: number;
  guidanceScale?: number;
  numInferenceSteps?: number;
}

export interface GenerateImageResult {
  images: FalImage[];
  seed: number;
  prompt: string;
  timings?: {
    inference: number;
  };
  has_nsfw_concepts?: boolean[];
}

export interface QueueStatus {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  queue_position?: number;
  logs?: Array<{ message: string; timestamp: string }>;
}

// Model-specific types
export type FalModel =
  | 'fal-ai/flux/dev'
  | 'fal-ai/flux/schnell'
  | 'fal-ai/flux-lora'
  | 'fal-ai/fast-sdxl'
  | 'fal-ai/stable-diffusion-v3-medium';

// =============================================================================
// SIMPLE GENERATION (Synchronous - for fast models)
// =============================================================================

/**
 * Generate a single image using fal.ai
 * Best for: Quick generation with fast models like flux/schnell or fast-sdxl
 *
 * @example
 * const result = await generateImage({
 *   prompt: "a serene mountain landscape at sunset",
 *   width: 1024,
 *   height: 1024
 * });
 * console.log(result.images[0].url);
 */
export async function generateImage(
  input: GenerateImageInput,
  model: FalModel = 'fal-ai/flux/schnell'
): Promise<GenerateImageResult> {
  const result = await fal.run(model, {
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
  });

  return result.data as GenerateImageResult;
}

/**
 * Generate multiple images with different prompts
 * Runs in parallel for efficiency
 *
 * @example
 * const results = await generateImageBatch([
 *   { prompt: "variant A - modern style" },
 *   { prompt: "variant B - vintage style" },
 *   { prompt: "variant C - minimal style" }
 * ]);
 */
export async function generateImageBatch(
  inputs: GenerateImageInput[],
  model: FalModel = 'fal-ai/flux/schnell'
): Promise<GenerateImageResult[]> {
  const promises = inputs.map(input => generateImage(input, model));
  return Promise.all(promises);
}

// =============================================================================
// QUEUE-BASED GENERATION (Asynchronous - for longer jobs)
// =============================================================================

/**
 * Submit an image generation job to the queue
 * Best for: Longer running jobs, training, or when you need status updates
 *
 * @example
 * const { requestId } = await submitImageJob({
 *   prompt: "detailed artwork..."
 * }, 'fal-ai/flux/dev');
 *
 * // Later, check status or get result
 * const status = await getJobStatus(requestId, 'fal-ai/flux/dev');
 */
export async function submitImageJob(
  input: GenerateImageInput,
  model: FalModel = 'fal-ai/flux/dev'
): Promise<{ requestId: string }> {
  const result = await fal.queue.submit(model, {
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
  });

  return { requestId: result.request_id };
}

/**
 * Check the status of a queued job
 */
export async function getJobStatus(
  requestId: string,
  model: FalModel = 'fal-ai/flux/dev'
): Promise<QueueStatus> {
  const status = await fal.queue.status(model, {
    requestId,
    logs: true,
  });

  return status as QueueStatus;
}

/**
 * Get the result of a completed job
 */
export async function getJobResult(
  requestId: string,
  model: FalModel = 'fal-ai/flux/dev'
): Promise<GenerateImageResult> {
  const result = await fal.queue.result(model, {
    requestId,
  });

  return result.data as GenerateImageResult;
}

// =============================================================================
// STREAMING GENERATION (Real-time updates)
// =============================================================================

export interface StreamCallbacks {
  onQueueUpdate?: (status: QueueStatus) => void;
  onResult?: (result: GenerateImageResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Generate image with real-time status updates
 * Best for: UI feedback during generation
 *
 * @example
 * await generateImageWithStream(
 *   { prompt: "a beautiful sunset" },
 *   {
 *     onQueueUpdate: (status) => console.log('Status:', status.status),
 *     onResult: (result) => console.log('Done!', result.images[0].url),
 *     onError: (error) => console.error('Failed:', error)
 *   }
 * );
 */
export async function generateImageWithStream(
  input: GenerateImageInput,
  callbacks: StreamCallbacks,
  model: FalModel = 'fal-ai/flux/dev'
): Promise<GenerateImageResult> {
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
      callbacks.onQueueUpdate?.(update as QueueStatus);
    },
  });

  const data = result.data as GenerateImageResult;
  callbacks.onResult?.(data);
  return data;
}

// =============================================================================
// AD-SPECIFIC HELPERS
// =============================================================================

/**
 * Generate ad creative variants from prompts
 * Optimized for your ad generation workflow
 *
 * @example
 * const variants = await generateAdVariants({
 *   variantA: "Product shot with dramatic lighting",
 *   variantB: "Lifestyle image showing product in use",
 *   storyBrand: "Hero image with transformation theme"
 * });
 */
export interface AdPrompts {
  variantA: string;
  variantB: string;
  storyBrand: string;
}

export interface AdVariantResults {
  variantA: GenerateImageResult;
  variantB: GenerateImageResult;
  storyBrand: GenerateImageResult;
}

export async function generateAdVariants(
  prompts: AdPrompts,
  options?: {
    width?: number;
    height?: number;
    model?: FalModel;
  }
): Promise<AdVariantResults> {
  const model = options?.model || 'fal-ai/flux/schnell';
  const width = options?.width || 1024;
  const height = options?.height || 1024;

  const [variantA, variantB, storyBrand] = await Promise.all([
    generateImage({ prompt: prompts.variantA, width, height }, model),
    generateImage({ prompt: prompts.variantB, width, height }, model),
    generateImage({ prompt: prompts.storyBrand, width, height }, model),
  ]);

  return { variantA, variantB, storyBrand };
}

// =============================================================================
// AD CREATIVE PIPELINE (fal.ai → Bannerbear)
// =============================================================================

import type { AdOverlayConfig, AdFormat } from '@/types/bannerbear';
import {
  generateAndWaitForComposite,
  isBannerbearConfigured,
} from '@/lib/bannerbear';

/**
 * Input for the full ad creative pipeline
 */
export interface AdCreativeInput {
  /** The image generation prompt - will be enhanced with no-text modifiers */
  prompt: string;
  /** Negative prompt to avoid unwanted elements */
  negativePrompt?: string;
  /** Image dimensions (width) */
  width?: number;
  /** Image dimensions (height) */
  height?: number;
  /** Seed for reproducibility */
  seed?: number;
  /** Text overlay configuration for Bannerbear */
  overlay: AdOverlayConfig;
  /** fal.ai model to use */
  model?: FalModel;
}

/**
 * Result from the ad creative pipeline
 */
export interface AdCreativeResult {
  /** The base image from fal.ai (no text) */
  baseImage: {
    url: string;
    width: number;
    height: number;
  };
  /** The final composited image with text overlay (if Bannerbear configured) */
  finalImage?: {
    url: string;
    bannerbearUid: string;
  };
  /** Seed used for this generation */
  seed: number;
  /** Whether Bannerbear overlay was applied */
  hasOverlay: boolean;
  /** Timing information */
  timing: {
    falGenerationMs?: number;
    bannerbearMs?: number;
    totalMs: number;
  };
}

/**
 * Enhance a prompt for ad image generation
 * Adds modifiers to prevent text and ensure clean composition
 */
export function enhancePromptForAds(prompt: string): string {
  // Don't add modifiers if they already exist
  if (prompt.includes('--no text') || prompt.includes('no text')) {
    return prompt;
  }

  // Add essential modifiers for ad-friendly images
  return `${prompt}, clean composition, no text, no watermark, no logo, professional photography`;
}

/**
 * Get the default negative prompt for ad images
 */
export function getAdNegativePrompt(customNegative?: string): string {
  const base = 'text, words, letters, watermark, logo, signature, writing, captions, subtitles, blurry, low quality';
  return customNegative ? `${customNegative}, ${base}` : base;
}

/**
 * Generate a complete ad creative: fal.ai base image → Bannerbear text overlay
 *
 * This is the main pipeline function that combines:
 * 1. AI image generation via fal.ai (with no-text prompting)
 * 2. Text overlay compositing via Bannerbear
 *
 * @example
 * const result = await generateAdCreative({
 *   prompt: "Professional product photography of a sleek water bottle, studio lighting, negative space on left",
 *   overlay: {
 *     headline: "Stay Hydrated",
 *     cta: "Shop Now",
 *     format: "square"
 *   }
 * });
 *
 * // Use result.finalImage.url for the complete ad creative
 * // Or result.baseImage.url for just the AI-generated image
 */
export async function generateAdCreative(
  input: AdCreativeInput
): Promise<AdCreativeResult> {
  const startTime = Date.now();
  let falEndTime: number | undefined;

  // Step 1: Determine dimensions based on format
  const formatDimensions: Record<AdFormat, { width: number; height: number }> = {
    square: { width: 1080, height: 1080 },
    story: { width: 1080, height: 1920 },
    landscape: { width: 1200, height: 628 },
  };

  const dims = formatDimensions[input.overlay.format];
  const width = input.width || dims.width;
  const height = input.height || dims.height;

  // Step 2: Generate base image with fal.ai
  const enhancedPrompt = enhancePromptForAds(input.prompt);
  const negativePrompt = getAdNegativePrompt(input.negativePrompt);

  const baseResult = await generateImage(
    {
      prompt: enhancedPrompt,
      negativePrompt,
      width,
      height,
      seed: input.seed,
      numImages: 1,
    },
    input.model || 'fal-ai/flux/schnell'
  );

  falEndTime = Date.now();
  
  // Validate that images array exists and has at least one element
  if (!baseResult.images || baseResult.images.length === 0) {
    throw new Error('Image generation failed: No images returned from fal.ai API');
  }
  
  const baseImage = baseResult.images[0];

  // Step 3: If Bannerbear is configured, apply text overlay
  let finalImage: AdCreativeResult['finalImage'];

  if (isBannerbearConfigured()) {
    try {
      const compositeResult = await generateAndWaitForComposite({
        baseImageUrl: baseImage.url,
        overlay: input.overlay,
      });

      if (compositeResult.status === 'completed' && compositeResult.imageUrl) {
        finalImage = {
          url: compositeResult.imageUrl,
          bannerbearUid: compositeResult.uid,
        };
      }
    } catch (error) {
      console.warn('Bannerbear overlay failed, returning base image only:', error);
      // Continue without overlay - base image is still valid
    }
  }

  const endTime = Date.now();

  return {
    baseImage: {
      url: baseImage.url,
      width: baseImage.width,
      height: baseImage.height,
    },
    finalImage,
    seed: baseResult.seed,
    hasOverlay: !!finalImage,
    timing: {
      falGenerationMs: falEndTime ? falEndTime - startTime : undefined,
      bannerbearMs: falEndTime && finalImage ? endTime - falEndTime : undefined,
      totalMs: endTime - startTime,
    },
  };
}

/**
 * Generate multiple ad creatives with different overlay configurations
 *
 * @example
 * const results = await generateAdCreativeBatch({
 *   prompt: "Product photography of headphones",
 *   variants: [
 *     { overlay: { headline: "Premium Sound", cta: "Listen Now", format: "square" }},
 *     { overlay: { headline: "Music Freedom", cta: "Shop Now", format: "story" }},
 *   ]
 * });
 */
export async function generateAdCreativeBatch(params: {
  prompt: string;
  negativePrompt?: string;
  variants: Array<{
    overlay: AdOverlayConfig;
    width?: number;
    height?: number;
    seed?: number;
  }>;
  model?: FalModel;
  onProgress?: (completed: number, total: number) => void;
}): Promise<AdCreativeResult[]> {
  const { prompt, negativePrompt, variants, model, onProgress } = params;
  const results: AdCreativeResult[] = [];
  let completed = 0;

  // Process variants in parallel with limited concurrency
  const CONCURRENCY = 3;
  const chunks: typeof variants[] = [];

  for (let i = 0; i < variants.length; i += CONCURRENCY) {
    chunks.push(variants.slice(i, i + CONCURRENCY));
  }

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(variant =>
        generateAdCreative({
          prompt,
          negativePrompt,
          overlay: variant.overlay,
          width: variant.width,
          height: variant.height,
          seed: variant.seed,
          model,
        }).then(result => {
          completed++;
          onProgress?.(completed, variants.length);
          return result;
        })
      )
    );
    results.push(...chunkResults);
  }

  return results;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if fal.ai is properly configured
 */
export function isFalConfigured(): boolean {
  return Boolean(FAL_KEY && FAL_KEY !== 'your-fal-api-key-here');
}

/**
 * Get available models and their characteristics
 */
export function getAvailableModels(): Array<{
  id: FalModel;
  name: string;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'standard' | 'high' | 'highest';
  description: string;
}> {
  return [
    {
      id: 'fal-ai/flux/schnell',
      name: 'FLUX Schnell',
      speed: 'fast',
      quality: 'high',
      description: 'Fastest FLUX model, great quality (~2-4s)',
    },
    {
      id: 'fal-ai/fast-sdxl',
      name: 'Fast SDXL',
      speed: 'fast',
      quality: 'standard',
      description: 'Quick SDXL generation (~2-5s)',
    },
    {
      id: 'fal-ai/flux/dev',
      name: 'FLUX Dev',
      speed: 'medium',
      quality: 'highest',
      description: 'Highest quality FLUX model (~10-20s)',
    },
    {
      id: 'fal-ai/flux-lora',
      name: 'FLUX LoRA',
      speed: 'medium',
      quality: 'high',
      description: 'FLUX with custom LoRA models',
    },
    {
      id: 'fal-ai/stable-diffusion-v3-medium',
      name: 'SD3 Medium',
      speed: 'medium',
      quality: 'high',
      description: 'Stable Diffusion 3 medium model',
    },
  ];
}
