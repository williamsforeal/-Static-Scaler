/**
 * IMAGES TABLE SCHEMA UPDATE - FIXED
 * Run: node --env-file=.env scripts/images_schema_update_FIXED.js
 * Or with dotenv: node scripts/images_schema_update_FIXED.js (after installing dotenv)
 */

// Load environment variables
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_ID = process.env.AIRTABLE_TABLE_ID;
const PAT = process.env.AIRTABLE_PAT;

// Validate required environment variables
if (!BASE_ID || !TABLE_ID || !PAT) {
  console.error('❌ Error: Missing required environment variables.');
  console.error('Please ensure the following are set in your .env file:');
  console.error('  - AIRTABLE_BASE_ID');
  console.error('  - AIRTABLE_TABLE_ID');
  console.error('  - AIRTABLE_PAT');
  console.error('\nRun with: node --env-file=.env scripts/images_schema_update_FIXED.js');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${PAT}`,
  'Content-Type': 'application/json'
};

const fieldsToCreate = [
  {
    name: 'Source Ad Copy',
    type: 'multipleRecordLinks',
    options: { linkedTableId: TABLE_ID }  // Use environment variable instead of hardcoded value
  },
  {
    name: 'Source Prompt',
    type: 'multipleRecordLinks', 
    options: { linkedTableId: TABLE_ID }  // Use environment variable instead of hardcoded value
  },
  { name: 'Prompt Index', type: 'number', options: { precision: 0 } },
  { name: 'Prompt Used', type: 'multilineText' },
  { name: 'Seed', type: 'number', options: { precision: 0 } },
  { name: 'Model', type: 'singleLineText' },
  { name: 'Width', type: 'number', options: { precision: 0 } },
  { name: 'Height', type: 'number', options: { precision: 0 } },
  {
    name: 'Status',
    type: 'singleSelect',
    options: {
      choices: [
        { name: 'Generated', color: 'yellowBright' },
        { name: 'Approved', color: 'greenBright' },
        { name: 'Rejected', color: 'redBright' },
        { name: 'Used', color: 'blueBright' },
        { name: 'Failed', color: 'grayBright' }
      ]
    }
  },
  {
    name: 'Generated At',
    type: 'dateTime',
    options: {
      dateFormat: { name: 'iso' },
      timeFormat: { name: '24hour' },
      timeZone: 'America/Los_Angeles'
    }
  },
  { name: 'Error', type: 'multilineText' }
];

async function createField(fieldConfig) {
  const url = `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables/${TABLE_ID}/fields`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(fieldConfig)
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log(`✅ Created: ${fieldConfig.name} (${data.id})`);
    return { success: true };
  } else if (data.error?.type === 'DUPLICATE_FIELD_NAME') {
    console.log(`⏭️  Exists: ${fieldConfig.name}`);
    return { success: true, skipped: true };
  } else {
    console.error(`❌ Failed: ${fieldConfig.name}`, JSON.stringify(data.error));
    return { success: false };
  }
}

async function main() {
  console.log('IMAGES TABLE SCHEMA UPDATE');
  console.log(`Base: ${BASE_ID} | Table: ${TABLE_ID}\n`);
  
  for (const field of fieldsToCreate) {
    await createField(field);
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log('\nDone. Check Airtable to verify fields created.');
}

main();
