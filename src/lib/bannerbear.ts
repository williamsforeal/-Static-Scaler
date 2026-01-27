/**
 * Bannerbear API Client
 *
 * Provides functions for generating images with text overlays using Bannerbear.
 * Used in the ad creative pipeline to composite headlines and CTAs onto AI-generated images.
 *
 * Usage:
 *   import { generateCompositeImage, getBannerbearImage } from '@/lib/bannerbear';
 *
 *   const result = await generateCompositeImage({
 *     baseImageUrl: 'https://fal.media/...',
 *     overlay: { headline: 'Your Headline', cta: 'Shop Now', format: 'square' }
 *   });
 */

import type {
  BannerbearImageRequest,
  BannerbearImage,
  BannerbearTemplate,
  BannerbearTemplateConfig,
  AdOverlayConfig,
  CompositeImageResult,
  AdFormat,
} from '@/types/bannerbear';
import { BANNERBEAR_TEMPLATES } from '@/data/bannerbear-templates';

// =============================================================================
// CONFIGURATION
// =============================================================================

const BANNERBEAR_API_KEY = import.meta.env.VITE_BANNERBEAR_API_KEY;
const BANNERBEAR_BASE_URL = 'https://api.bannerbear.com/v2';

/**
 * Check if Bannerbear is properly configured
 */
export function isBannerbearConfigured(): boolean {
  return Boolean(BANNERBEAR_API_KEY && BANNERBEAR_API_KEY !== 'your-bannerbear-api-key-here');
}

// =============================================================================
// LOW-LEVEL API FUNCTIONS
// =============================================================================

/**
 * Make an authenticated request to the Bannerbear API
 */
async function bannerbearFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!isBannerbearConfigured()) {
    throw new Error('Bannerbear API key not configured. Add VITE_BANNERBEAR_API_KEY to your .env file.');
  }

  const response = await fetch(`${BANNERBEAR_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${BANNERBEAR_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Bannerbear API error: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Create an image from a Bannerbear template
 */
export async function createBannerbearImage(
  request: BannerbearImageRequest
): Promise<BannerbearImage> {
  return bannerbearFetch<BannerbearImage>('/images', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get the status/result of a Bannerbear image by UID
 */
export async function getBannerbearImage(uid: string): Promise<BannerbearImage> {
  return bannerbearFetch<BannerbearImage>(`/images/${uid}`);
}

/**
 * List all templates in your Bannerbear account
 */
export async function listBannerbearTemplates(): Promise<BannerbearTemplate[]> {
  return bannerbearFetch<BannerbearTemplate[]>('/templates');
}

/**
 * Get a specific template by UID
 */
export async function getBannerbearTemplate(uid: string): Promise<BannerbearTemplate> {
  return bannerbearFetch<BannerbearTemplate>(`/templates/${uid}`);
}

// =============================================================================
// HIGH-LEVEL PIPELINE FUNCTIONS
// =============================================================================

/**
 * Get the template configuration for a given ad format
 */
export function getTemplateForFormat(format: AdFormat): BannerbearTemplateConfig {
  const template = BANNERBEAR_TEMPLATES[format];
  if (!template) {
    throw new Error(`No Bannerbear template configured for format: ${format}`);
  }
  return template;
}

/**
 * Generate a composite image with text overlay
 *
 * @param baseImageUrl - URL of the AI-generated base image (from fal.ai)
 * @param overlay - Text overlay configuration
 * @returns Promise with the composite image result
 *
 * @example
 * const result = await generateCompositeImage({
 *   baseImageUrl: 'https://fal.media/files/abc123.jpg',
 *   overlay: {
 *     headline: 'Transform Your Morning Routine',
 *     cta: 'Shop Now',
 *     format: 'square'
 *   }
 * });
 */
export async function generateCompositeImage(params: {
  baseImageUrl: string;
  overlay: AdOverlayConfig;
  webhookUrl?: string;
  synchronous?: boolean;
}): Promise<CompositeImageResult> {
  const { baseImageUrl, overlay, webhookUrl, synchronous = false } = params;
  const template = getTemplateForFormat(overlay.format);

  // Build modifications array
  const modifications = [
    {
      name: template.layers.background,
      image_url: baseImageUrl,
    },
    {
      name: template.layers.headline,
      text: overlay.headline,
      ...(overlay.colors?.headline && { color: overlay.colors.headline }),
    },
    {
      name: template.layers.cta,
      text: overlay.cta,
      ...(overlay.colors?.cta && { color: overlay.colors.cta }),
      ...(overlay.colors?.ctaBackground && { background: overlay.colors.ctaBackground }),
    },
  ];

  // Add subtext if provided and template supports it
  if (overlay.subtext && template.layers.subtext) {
    modifications.push({
      name: template.layers.subtext,
      text: overlay.subtext,
    });
  }

  // Create the image
  const response = await createBannerbearImage({
    template: template.templateId,
    modifications,
    webhook_url: webhookUrl,
    synchronous,
    metadata: {
      base_image_url: baseImageUrl,
      format: overlay.format,
    },
  });

  return {
    uid: response.uid,
    status: response.status,
    imageUrl: response.image_url,
    baseImageUrl,
    template,
    overlay,
    error: response.error_message,
  };
}

/**
 * Poll for Bannerbear image completion
 *
 * @param uid - The UID of the Bannerbear image job
 * @param maxAttempts - Maximum number of polling attempts (default: 30)
 * @param intervalMs - Milliseconds between polls (default: 2000)
 * @returns Promise with the completed image
 */
export async function pollBannerbearCompletion(
  uid: string,
  maxAttempts = 30,
  intervalMs = 2000
): Promise<BannerbearImage> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const image = await getBannerbearImage(uid);

    if (image.status === 'completed') {
      return image;
    }

    if (image.status === 'failed') {
      throw new Error(`Bannerbear image generation failed: ${image.error_message}`);
    }

    // Still pending, wait and try again
    await new Promise(resolve => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new Error(`Bannerbear image generation timed out after ${maxAttempts * intervalMs / 1000}s`);
}

/**
 * Generate a composite image and wait for completion
 *
 * Combines generateCompositeImage + polling for a simpler API.
 *
 * @example
 * const result = await generateAndWaitForComposite({
 *   baseImageUrl: 'https://fal.media/files/abc123.jpg',
 *   overlay: { headline: 'Your Headline', cta: 'Shop Now', format: 'square' }
 * });
 * console.log('Final image:', result.imageUrl);
 */
export async function generateAndWaitForComposite(params: {
  baseImageUrl: string;
  overlay: AdOverlayConfig;
}): Promise<CompositeImageResult> {
  // Start the generation
  const initial = await generateCompositeImage({
    ...params,
    synchronous: false, // Use async for better reliability
  });

  // If already completed (rare with async), return immediately
  if (initial.status === 'completed' && initial.imageUrl) {
    return initial;
  }

  // Poll for completion
  const completed = await pollBannerbearCompletion(initial.uid);

  return {
    ...initial,
    status: completed.status,
    imageUrl: completed.image_url,
    error: completed.error_message,
  };
}

// =============================================================================
// BATCH PROCESSING
// =============================================================================

export interface BatchCompositeParams {
  items: Array<{
    baseImageUrl: string;
    overlay: AdOverlayConfig;
  }>;
  onProgress?: (completed: number, total: number) => void;
}

/**
 * Generate multiple composite images in parallel
 *
 * @example
 * const results = await generateBatchComposites({
 *   items: [
 *     { baseImageUrl: 'url1', overlay: { headline: 'A', cta: 'Buy', format: 'square' }},
 *     { baseImageUrl: 'url2', overlay: { headline: 'B', cta: 'Buy', format: 'square' }},
 *   ],
 *   onProgress: (done, total) => console.log(`${done}/${total} complete`)
 * });
 */
export async function generateBatchComposites(
  params: BatchCompositeParams
): Promise<CompositeImageResult[]> {
  const { items, onProgress } = params;
  const results: CompositeImageResult[] = [];
  let completed = 0;

  // Process in parallel with a concurrency limit
  const CONCURRENCY = 5;
  const chunks: typeof items[] = [];

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    chunks.push(items.slice(i, i + CONCURRENCY));
  }

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(item =>
        generateAndWaitForComposite(item)
          .then(result => {
            completed++;
            onProgress?.(completed, items.length);
            return result;
          })
          .catch(error => {
            completed++;
            onProgress?.(completed, items.length);
            // Return error result instead of throwing
            return {
              uid: '',
              status: 'failed' as const,
              imageUrl: undefined,
              baseImageUrl: item.baseImageUrl,
              template: getTemplateForFormat(item.overlay.format),
              overlay: item.overlay,
              error: error.message,
            };
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
 * Get available ad formats and their dimensions
 */
export function getAvailableFormats(): Array<{
  format: AdFormat;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
}> {
  return [
    { format: 'square', name: 'Square (Feed)', width: 1080, height: 1080, aspectRatio: '1:1' },
    { format: 'story', name: 'Story/Reel', width: 1080, height: 1920, aspectRatio: '9:16' },
    { format: 'landscape', name: 'Landscape (Link)', width: 1200, height: 628, aspectRatio: '1.91:1' },
  ];
}

/**
 * Validate that an overlay configuration is complete
 */
export function validateOverlayConfig(overlay: Partial<AdOverlayConfig>): overlay is AdOverlayConfig {
  return Boolean(overlay.headline && overlay.cta && overlay.format);
}
