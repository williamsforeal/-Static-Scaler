/**
 * Bannerbear Template Configuration
 *
 * This file maps your Bannerbear template IDs to their configurations.
 * Update the templateId values with your actual template UIDs from Bannerbear.
 *
 * To get your template IDs:
 * 1. Go to https://www.bannerbear.com/app/templates
 * 2. Click on each template
 * 3. Copy the UID from the URL or settings
 *
 * Layer naming convention:
 * - 'background' or 'main_image' for the AI-generated base image
 * - 'headline' or 'headline_text' for the main headline
 * - 'cta' or 'cta_button' for the call-to-action
 * - 'subtext' or 'body_text' for optional secondary text
 */

import type { BannerbearTemplateConfig, AdFormat } from '@/types/bannerbear';

/**
 * Template configurations mapped by ad format
 *
 * IMPORTANT: Replace 'YOUR_TEMPLATE_ID_HERE' with actual Bannerbear template UIDs
 */
export const BANNERBEAR_TEMPLATES: Record<AdFormat, BannerbearTemplateConfig> = {
  /**
   * Square format (1080x1080)
   * Best for: Instagram/Facebook feed posts
   */
  square: {
    templateId: 'YOUR_SQUARE_TEMPLATE_ID_HERE', // TODO: Replace with actual template UID
    name: 'Ad Creative - Square',
    format: 'square',
    width: 1080,
    height: 1080,
    layers: {
      background: 'background',      // Image layer - receives fal.ai output
      headline: 'headline_text',     // Text layer - top of image
      cta: 'cta_button',            // Text layer - bottom of image
      subtext: 'body_text',         // Optional - below headline
    },
  },

  /**
   * Story/Reel format (1080x1920)
   * Best for: Instagram/Facebook Stories, TikTok, Reels
   */
  story: {
    templateId: 'YOUR_STORY_TEMPLATE_ID_HERE', // TODO: Replace with actual template UID
    name: 'Ad Creative - Story',
    format: 'story',
    width: 1080,
    height: 1920,
    layers: {
      background: 'background',
      headline: 'headline_text',
      cta: 'cta_button',
      subtext: 'body_text',
    },
  },

  /**
   * Landscape format (1200x628)
   * Best for: Facebook link ads, Twitter cards
   */
  landscape: {
    templateId: 'YOUR_LANDSCAPE_TEMPLATE_ID_HERE', // TODO: Replace with actual template UID
    name: 'Ad Creative - Landscape',
    format: 'landscape',
    width: 1200,
    height: 628,
    layers: {
      background: 'background',
      headline: 'headline_text',
      cta: 'cta_button',
      // No subtext for landscape - limited space
    },
  },
};

/**
 * Check if templates are properly configured
 */
export function areBannerbearTemplatesConfigured(): boolean {
  return Object.values(BANNERBEAR_TEMPLATES).every(
    template => !template.templateId.includes('YOUR_') && !template.templateId.includes('_HERE')
  );
}

/**
 * Get a list of which templates still need configuration
 */
export function getUnconfiguredTemplates(): AdFormat[] {
  return (Object.entries(BANNERBEAR_TEMPLATES) as [AdFormat, BannerbearTemplateConfig][])
    .filter(([, config]) => config.templateId.includes('YOUR_') || config.templateId.includes('_HERE'))
    .map(([format]) => format);
}

/**
 * Template design guidelines for creating Bannerbear templates
 *
 * When creating templates in Bannerbear, follow these guidelines:
 *
 * 1. LAYER NAMING:
 *    - Name your background/image layer: 'background'
 *    - Name your headline layer: 'headline_text'
 *    - Name your CTA layer: 'cta_button'
 *    - Name your body text layer (optional): 'body_text'
 *
 * 2. BACKGROUND LAYER:
 *    - Type: Image
 *    - Position: Full canvas (0,0)
 *    - Size: Match canvas dimensions
 *    - Fit mode: Cover (to fill while maintaining aspect ratio)
 *
 * 3. HEADLINE LAYER:
 *    - Type: Text
 *    - Position: Top 15-20% of canvas
 *    - Font: Bold, high contrast color (white with shadow recommended)
 *    - Max width: 80-90% of canvas width
 *    - Auto-resize: Enable for varying text lengths
 *
 * 4. CTA LAYER:
 *    - Type: Text (with background for button effect)
 *    - Position: Bottom 15-20% of canvas
 *    - Style: Button-like with background color
 *    - Padding: Add internal padding for button appearance
 *
 * 5. SAFE ZONES:
 *    - Keep text away from center where AI image subjects typically appear
 *    - Leave margins (5-10%) on all sides
 *    - Consider platform UI overlays (profile pics, engagement buttons)
 *
 * 6. TEXT READABILITY:
 *    - Use drop shadow or text stroke for contrast
 *    - Consider semi-transparent background behind text
 *    - Set minimum font sizes for readability
 */
export const TEMPLATE_DESIGN_GUIDELINES = {
  square: {
    headlineZone: { top: '5%', height: '20%' },
    ctaZone: { bottom: '5%', height: '15%' },
    safeMargins: '5%',
  },
  story: {
    headlineZone: { top: '10%', height: '15%' },
    ctaZone: { bottom: '15%', height: '10%' },
    safeMargins: '5%',
  },
  landscape: {
    headlineZone: { top: '10%', height: '25%' },
    ctaZone: { bottom: '10%', height: '20%' },
    safeMargins: '3%',
  },
};
