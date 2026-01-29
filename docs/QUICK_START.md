# Quick Start Guide: Mass Production Pipeline

Get your ad production pipeline running in 5 steps.

## Step 1: Fix Code Issues (5 minutes)

✅ **Already done:** 
- Fixed hardcoded Airtable table ID in `scripts/images_schema_update_FIXED.js`
- Fixed unsafe array access in `src/lib/fal.ts`

## Step 2: Set Up Environment Variables (5 minutes)

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in all required values:
   - Supabase credentials (for database)
   - fal.ai API key (for image generation)
   - Bannerbear API key (for text overlays)
   - Airtable credentials (for schema setup and data storage)

**See:** `.env.example` for all required variables with descriptions

## Step 3: Set Up Airtable Schema (10 minutes)

1. Ensure your `.env` file has Airtable credentials configured:
   ```
   AIRTABLE_BASE_ID=your-base-id
   AIRTABLE_TABLE_ID=your-images-table-id
   AIRTABLE_PAT=your-personal-access-token
   ```

2. Run the schema script:
   ```bash
   node --env-file=.env scripts/images_schema_update_FIXED.js
   ```

3. Verify fields were created in Airtable Images table

**See:** [Airtable Schema Guide](./AIRTABLE_SCHEMA.md) for details

## Step 4: Create Bannerbear Templates (30 minutes)

1. Go to [Bannerbear Dashboard](https://www.bannerbear.com/app/templates)
2. Create 3 templates:
   - Square (1080x1080)
   - Story (1080x1920)  
   - Landscape (1200x628)
3. Name layers exactly: `background`, `headline_text`, `cta_button`
4. Copy Template UIDs from each template
5. Update `src/data/bannerbear-templates.ts` with real UIDs

**See:** [Bannerbear Setup Guide](./BANNERBEAR_SETUP.md) for detailed instructions

## Step 5: Build n8n Workflows (2-4 hours)

This is the critical step that enables mass production.

1. Log into [n8n Cloud](https://williamsforeal.app.n8n.cloud)
2. Create three workflows following the guide:
   - `pipeline-start` - Single record processing
   - `pipeline-batch` - Batch processing
   - `pipeline-status` - Status checking

**See:** [n8n Workflow Guide](../n8n-hosting/WORKFLOW_GUIDE.md) for step-by-step instructions

**Important:** Set these environment variables in n8n:
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE_ID`
- `AIRTABLE_PAT`
- `FAL_API_KEY`
- `BANNERBEAR_API_KEY`
- `BANNERBEAR_TEMPLATE_SQUARE`
- `BANNERBEAR_TEMPLATE_STORY`
- `BANNERBEAR_TEMPLATE_LANDSCAPE`

## Step 6: Deploy Frontend (15 minutes)

1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy to Vercel:
   - Connect GitHub repo to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy automatically on push

**See:** [Deployment Guide](./DEPLOYMENT.md) for detailed instructions

## Step 7: Test End-to-End (30 minutes)

1. **Test Single Record:**
   - Go to Batch Processing page
   - Select one record
   - Click "Process"
   - Verify image URLs appear in Airtable

2. **Test Batch:**
   - Select 5-10 records
   - Start batch processing
   - Monitor progress
   - Verify all records updated in Airtable

## Troubleshooting

**Workflow not found:**
- Verify webhook URLs match exactly in `src/lib/n8n.ts`
- Check workflows are active in n8n

**Images not generating:**
- Check fal.ai API key is valid
- Verify API quota hasn't been exceeded
- Check browser console for errors

**Bannerbear failing:**
- Verify template UIDs are correct
- Check layer names match exactly
- Verify Bannerbear API key is valid

**Airtable not updating:**
- Check Personal Access Token has write permissions
- Verify table ID is correct
- Check field names match schema

## What Success Looks Like

✅ Click "Process" on Batch Processing page
✅ See progress bar updating
✅ Check Airtable Images table
✅ See Base Image URL and Final Image URL populated
✅ Status field shows "Generated"
✅ Generated At timestamp is set

## Next Steps After Setup

1. **Optimize:** Adjust batch sizes based on API rate limits
2. **Monitor:** Set up error tracking and alerts
3. **Scale:** Increase batch sizes as you validate the pipeline
4. **Automate:** Set up scheduled batch processing if needed

## Getting Help

- Check workflow execution logs in n8n
- Review browser console for frontend errors
- Verify API keys are valid and have quota
- Check Airtable for error messages in Error field
