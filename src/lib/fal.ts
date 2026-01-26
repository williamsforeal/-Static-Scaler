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
