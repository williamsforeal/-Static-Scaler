# Airtable Schema Setup

This document describes the required Airtable schema for the Images table.

## Required Fields

The Images table must have the following fields:

### Core Fields

| Field Name | Type | Options | Description |
|------------|------|---------|-------------|
| **Base Image URL** | Single line text | - | URL of the AI-generated image from fal.ai |
| **Final Image URL** | Single line text | - | URL of the composited image with text overlay from Bannerbear |
| **Status** | Single select | Generated, Approved, Rejected, Used, Failed | Current status of the image |
| **Generated At** | Date & time | ISO format, 24-hour, PST timezone | Timestamp when image was generated |
| **Error** | Long text | - | Error message if generation failed |

### Metadata Fields

| Field Name | Type | Options | Description |
|------------|------|---------|-------------|
| **Seed** | Number | Precision: 0 | Random seed used for image generation |
| **Model** | Single line text | - | fal.ai model used (e.g., "fal-ai/flux/schnell") |
| **Width** | Number | Precision: 0 | Image width in pixels |
| **Height** | Number | Precision: 0 | Image height in pixels |
| **Prompt Used** | Long text | - | The exact prompt sent to fal.ai |
| **Prompt Index** | Number | Precision: 0 | Index of prompt used (if multiple prompts exist) |

### Relationship Fields

| Field Name | Type | Options | Description |
|------------|------|---------|-------------|
| **Source Ad Copy** | Multiple record links | Links to Ad Copy table | Reference to the ad copy record that generated this image |
| **Source Prompt** | Multiple record links | Links to Prompts table (or Ad Copy table) | Reference to the prompt record used |

## Setting Up the Schema

### Option 1: Use the Script (Recommended)

1. Ensure your `.env` file has:
   ```
   AIRTABLE_BASE_ID=your-base-id
   AIRTABLE_TABLE_ID=your-images-table-id
   AIRTABLE_PAT=your-personal-access-token
   ```

2. Run the schema update script:
   ```bash
   node --env-file=.env scripts/images_schema_update_FIXED.js
   ```

3. The script will:
   - Create missing fields
   - Skip fields that already exist
   - Report any errors

### Option 2: Manual Setup

1. Open your Airtable base
2. Go to the Images table
3. Add each field manually using the specifications above

## Field Details

### Status Field Options

The Status field should have these exact options:

- **Generated** (Yellow) - Image has been created
- **Approved** (Green) - Image has been approved for use
- **Rejected** (Red) - Image was rejected
- **Used** (Blue) - Image is currently being used in ads
- **Failed** (Gray) - Image generation failed

### Generated At Field Settings

- **Date Format:** ISO (YYYY-MM-DD)
- **Time Format:** 24-hour (HH:mm)
- **Time Zone:** America/Los_Angeles

### Linked Record Fields

**Source Ad Copy:**
- Links to your Ad Copy table
- Allows multiple links (one image can reference multiple ad copies)

**Source Prompt:**
- Links to your Prompts table (or Ad Copy table if prompts are stored there)
- Allows multiple links

## Table Relationships

```
Ad Copy Table
    ↓ (linked via Source Ad Copy)
Images Table
    ↑ (linked via Source Prompt)
Prompts Table (optional)
```

## Verification

After running the script, verify:

1. All fields exist in the Images table
2. Field types match the specifications
3. Status field has all 5 options
4. Linked record fields point to correct tables
5. No duplicate field names

## Troubleshooting

**Script fails with "DUPLICATE_FIELD_NAME":**
- Field already exists, this is OK
- Script will skip it and continue

**Linked table ID error:**
- Verify the table ID in your `.env` file matches the actual table
- Check that the linked table exists in your base

**Permission errors:**
- Verify your Personal Access Token has write access
- Check that the token hasn't expired
- Ensure you have permission to modify the base schema

## Next Steps

After schema is set up:

1. Test creating a record manually in Airtable
2. Verify all fields are editable
3. Test the pipeline to ensure it writes to these fields correctly
4. Set up views/filters in Airtable for easy management
