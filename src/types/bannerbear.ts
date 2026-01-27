/**
 * Bannerbear Types
 *
 * TypeScript interfaces for Bannerbear API integration.
 * Bannerbear is used for compositing text overlays onto AI-generated base images.
 */

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

export interface BannerbearModification {
  /** Layer name in the Bannerbear template (e.g., 'headline', 'cta', 'background') */
  name: string;
  /** Text content for text layers */
  text?: string;
  /** Image URL for image layers */
  image_url?: string;
  /** Color override (hex format) */
  color?: string;
  /** Background color for text layers */
  background?: string;
}

export interface BannerbearImageRequest {
  /** Template ID from Bannerbear dashboard */
  template: string;
  /** Array of layer modifications */
  modifications: BannerbearModification[];
  /** Optional webhook URL for async completion notification */
  webhook_url?: string;
  /** Optional metadata to pass through */
  metadata?: Record<string, string>;
  /** Render synchronously (slower but returns final URL immediately) */
  synchronous?: boolean;
}

export interface BannerbearImage {
  /** Unique identifier for this image generation */
  uid: string;
  /** Current status of the image generation */
  status: 'pending' | 'completed' | 'failed';
  /** URL of the generated image (available when status is 'completed') */
  image_url?: string;
  /** URL of the generated image in PNG format */
  image_url_png?: string;
  /** URL of the generated image in JPEG format */
  image_url_jpg?: string;
  /** Template ID used */
  template: string;
  /** Modifications applied */
  modifications: BannerbearModification[];
  /** Webhook URL if provided */
  webhook_url?: string;
  /** Metadata passed through */
  metadata?: Record<string, string>;
  /** Creation timestamp */
  created_at: string;
  /** Completion timestamp */
  completed_at?: string;
  /** Error message if failed */
  error_message?: string;
}

export interface BannerbearTemplate {
  /** Template unique identifier */
  uid: string;
  /** Template name */
  name: string;
  /** Template width in pixels */
  width: number;
  /** Template height in pixels */
  height: number;
  /** Array of layer names available in this template */
  available_modifications: string[];
  /** Template preview URL */
  preview_url?: string;
  /** Whether template is active */
  status: 'active' | 'archived';
  /** Creation timestamp */
  created_at: string;
}

// =============================================================================
// APPLICATION-SPECIFIC TYPES
// =============================================================================

export type AdFormat = 'square' | 'story' | 'landscape';

export interface BannerbearTemplateConfig {
  /** Template UID from Bannerbear */
  templateId: string;
  /** Human-readable name */
  name: string;
  /** Ad format type */
  format: AdFormat;
  /** Dimensions */
  width: number;
  height: number;
  /** Required layer names for this template */
  layers: {
    background: string;
    headline: string;
    cta: string;
    subtext?: string;
  };
}

export interface AdOverlayConfig {
  /** Headline text to overlay */
  headline: string;
  /** Call-to-action text */
  cta: string;
  /** Optional subtext */
  subtext?: string;
  /** Template format to use */
  format: AdFormat;
  /** Optional color overrides */
  colors?: {
    headline?: string;
    cta?: string;
    ctaBackground?: string;
  };
}

export interface CompositeImageResult {
  /** UID of the Bannerbear job */
  uid: string;
  /** Status of the generation */
  status: 'pending' | 'completed' | 'failed';
  /** Final composited image URL */
  imageUrl?: string;
  /** Base image URL (from fal.ai) */
  baseImageUrl: string;
  /** Template used */
  template: BannerbearTemplateConfig;
  /** Overlay configuration used */
  overlay: AdOverlayConfig;
  /** Error message if failed */
  error?: string;
}

// =============================================================================
// WEBHOOK PAYLOAD TYPES
// =============================================================================

export interface BannerbearWebhookPayload {
  /** Event type */
  event: 'image.completed' | 'image.failed';
  /** Image data */
  data: BannerbearImage;
}
