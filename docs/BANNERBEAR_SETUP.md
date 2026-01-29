# Bannerbear Template Setup Guide

This guide walks you through creating Bannerbear templates and configuring them in the application.

## Step 1: Create Templates in Bannerbear

1. Go to [Bannerbear Dashboard](https://www.bannerbear.com/app/templates)
2. Click "Create New Template"
3. Create three templates:

### Template 1: Square Format (1080x1080)

**Canvas Settings:**
- Width: 1080px
- Height: 1080px

**Layers to Create:**

1. **Background Layer** (Image)
   - Name: `background`
   - Type: Image
   - Position: X: 0, Y: 0
   - Size: Width: 1080, Height: 1080
   - Fit Mode: Cover

2. **Headline Layer** (Text)
   - Name: `headline_text`
   - Type: Text
   - Position: X: 54 (5% margin), Y: 54 (top 5%)
   - Max Width: 972px (90% of canvas)
   - Font: Bold, large size (48-72pt)
   - Color: White (#FFFFFF)
   - Text Shadow: Enabled (black, 3px blur)
   - Auto-resize: Enabled

3. **CTA Layer** (Text with Background)
   - Name: `cta_button`
   - Type: Text
   - Position: X: 54, Y: 918 (bottom 15%)
   - Background Color: Your brand color (e.g., #007AFF)
   - Padding: 20px horizontal, 15px vertical
   - Font: Bold, medium size (36-48pt)
   - Color: White
   - Border Radius: 8px

4. **Subtext Layer** (Optional Text)
   - Name: `body_text`
   - Type: Text
   - Position: Below headline_text
   - Max Width: 972px
   - Font: Regular, medium size (24-36pt)
   - Color: White with shadow

**Save Template** and copy the Template UID from the URL or settings.

### Template 2: Story Format (1080x1920)

**Canvas Settings:**
- Width: 1080px
- Height: 1920px

**Layers:** Same structure as Square, but adjust positions:
- Headline: Top 10% (Y: 192)
- CTA: Bottom 15% (Y: 1632)

### Template 3: Landscape Format (1200x628)

**Canvas Settings:**
- Width: 1200px
- Height: 628px

**Layers:** Same structure, but:
- Headline: Top 10% (Y: 63)
- CTA: Bottom 10% (Y: 565)
- No subtext layer (limited space)

## Step 2: Get Template UIDs

After creating each template:

1. Click on the template in Bannerbear dashboard
2. The Template UID is in the URL: `https://www.bannerbear.com/app/templates/{TEMPLATE_UID}`
3. Copy the UID (it looks like: `abc123def456`)

## Step 3: Update Application Configuration

Edit `src/data/bannerbear-templates.ts`:

```typescript
export const BANNERBEAR_TEMPLATES: Record<AdFormat, BannerbearTemplateConfig> = {
  square: {
    templateId: 'YOUR_ACTUAL_SQUARE_TEMPLATE_UID', // Replace this
    // ... rest of config
  },
  story: {
    templateId: 'YOUR_ACTUAL_STORY_TEMPLATE_UID', // Replace this
    // ... rest of config
  },
  landscape: {
    templateId: 'YOUR_ACTUAL_LANDSCAPE_TEMPLATE_UID', // Replace this
    // ... rest of config
  },
};
```

## Step 4: Verify Layer Names Match

The layer names in your Bannerbear templates MUST match exactly:

- Background image layer: `background`
- Headline text layer: `headline_text`
- CTA button layer: `cta_button`
- Subtext layer (optional): `body_text`

If your templates use different names, either:
1. Rename layers in Bannerbear to match, OR
2. Update `src/data/bannerbear-templates.ts` to use your layer names

## Step 5: Test Template Rendering

Use the Bannerbear API directly to test:

```bash
curl -X POST https://api.bannerbear.com/v2/images \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "YOUR_TEMPLATE_UID",
    "modifications": [
      {
        "name": "background",
        "image_url": "https://example.com/test-image.jpg"
      },
      {
        "name": "headline_text",
        "text": "Test Headline"
      },
      {
        "name": "cta_button",
        "text": "Shop Now"
      }
    ],
    "synchronous": true
  }'
```

## Troubleshooting

**Template not found:**
- Verify the Template UID is correct
- Check that the template is active (not archived)

**Layer not found:**
- Verify layer names match exactly (case-sensitive)
- Check that layers exist in the template

**Image not rendering:**
- Verify the base image URL is accessible
- Check that image format is supported (JPG, PNG)

**Text not appearing:**
- Verify text layer names match
- Check that text color contrasts with background
- Ensure text fits within layer bounds
