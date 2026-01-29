# Testing Guide

This guide covers testing the end-to-end pipeline after setup.

## Prerequisites

- n8n workflows built and active
- Bannerbear templates configured
- Airtable schema set up
- Frontend deployed or running locally
- Test Airtable records with prompts ready

## Test 1: Single Record Pipeline

### Step 1: Prepare Test Data

1. Open Airtable
2. Go to your Ad Copy table
3. Create or select a test record with:
   - Full Concept or Headline filled in
   - CTA filled in
   - Generate Image Prompts = "Done"
   - Image Prompts field has at least one prompt

### Step 2: Test via Frontend

1. Open the app (local: `http://localhost:8080` or production URL)
2. Navigate to Batch Processing page
3. Select ONE record
4. Click "Process {1} Records"
5. Watch for:
   - Progress indicator
   - Status updates
   - Completion message

### Step 3: Verify in Airtable

1. Go to Images table
2. Find the new record (or check the linked record)
3. Verify:
   - ✅ Base Image URL is populated
   - ✅ Final Image URL is populated (if overlay enabled)
   - ✅ Status = "Generated"
   - ✅ Generated At timestamp is set
   - ✅ Seed, Model, Width, Height are populated

### Step 4: Verify Images

1. Click Base Image URL → Should open fal.ai generated image
2. Click Final Image URL → Should open Bannerbear composited image
3. Verify:
   - Base image has no text
   - Final image has headline and CTA overlay
   - Images are correct dimensions

## Test 2: Batch Pipeline

### Step 1: Prepare Multiple Records

1. Select 5-10 records in Airtable
2. Ensure all have prompts ready
3. Note their record IDs

### Step 2: Test Batch Processing

1. Go to Batch Processing page
2. Select multiple records (5-10)
3. Click "Process {N} Records"
4. Monitor:
   - Batch ID returned
   - Progress bar updating
   - Completed count increasing

### Step 3: Check Status

1. Use the status endpoint or refresh the page
2. Verify progress updates in real-time
3. Wait for completion

### Step 4: Verify All Records

1. Check each record in Airtable Images table
2. Verify all have:
   - Base Image URL
   - Final Image URL (if overlay enabled)
   - Status = "Generated"
   - No errors

## Test 3: Error Handling

### Test API Failure

1. Temporarily use invalid API key
2. Trigger pipeline
3. Verify:
   - Error is caught gracefully
   - Airtable Status = "Failed"
   - Error message is recorded
   - Frontend shows error notification

### Test Missing Prompt

1. Use record without Image Prompts
2. Trigger pipeline
3. Verify:
   - Falls back to Full Concept
   - Or shows appropriate error

### Test Bannerbear Failure

1. Use invalid template ID
2. Trigger pipeline with overlay enabled
3. Verify:
   - Base image still generated
   - Error logged but doesn't crash
   - Status reflects partial success

## Test 4: Performance

### Measure Single Record Time

1. Start timer
2. Process one record
3. Measure:
   - fal.ai generation time (~10-30s)
   - Bannerbear compositing time (~5-15s)
   - Total pipeline time (~20-60s)

### Measure Batch Time

1. Process 10 records
2. Measure total time
3. Calculate average per record
4. Verify parallel processing is working

## Test 5: Edge Cases

### Empty Record Set
- Select 0 records → Should disable button

### Very Long Text
- Use extremely long headline/CTA
- Verify Bannerbear handles it correctly

### Special Characters
- Use text with emojis, special chars
- Verify encoding is correct

### Large Batch
- Process 50+ records
- Monitor for rate limiting
- Verify all complete

## Debugging Checklist

If tests fail, check:

1. **n8n Workflows:**
   - Are workflows active?
   - Check execution logs in n8n
   - Verify webhook URLs match

2. **API Keys:**
   - Are keys valid?
   - Do they have quota remaining?
   - Are they set in correct environment?

3. **Airtable:**
   - Does PAT have write permissions?
   - Are field names correct?
   - Is table ID correct?

4. **Bannerbear:**
   - Are template UIDs correct?
   - Do layer names match?
   - Are templates active?

5. **Frontend:**
   - Check browser console for errors
   - Verify environment variables are loaded
   - Check network tab for failed requests

## Success Criteria

✅ Single record processes in < 60 seconds
✅ Batch of 10 processes in < 5 minutes
✅ All images have valid URLs
✅ All Airtable records updated correctly
✅ No errors in console or logs
✅ Progress updates in real-time
✅ Error handling works gracefully

## Next Steps After Testing

1. **Optimize:** Adjust batch sizes based on performance
2. **Monitor:** Set up logging and alerts
3. **Scale:** Increase batch sizes gradually
4. **Automate:** Set up scheduled processing if needed
