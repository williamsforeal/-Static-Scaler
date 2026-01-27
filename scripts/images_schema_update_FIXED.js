/**
 * IMAGES TABLE SCHEMA UPDATE - FIXED
 * Run: node images_schema_update_FIXED.js
 */

const BASE_ID = 'appvPrfjiuXIhdNuW';  // No trailing slash
const TABLE_ID = 'tblmoUjbAv5NKIyhs'; // Your Images table
const PAT = 'patRsb9JbV5AE178v.d1ac5ce45c62c8b95e421a44f939a5674a492bb5770c850c161710dd64497c38';

const headers = {
  'Authorization': `Bearer ${PAT}`,
  'Content-Type': 'application/json'
};

const fieldsToCreate = [
  {
    name: 'Source Ad Copy',
    type: 'multipleRecordLinks',
    options: { linkedTableId: 'tblmoUjbAv5NKIyhs' }  // CORRECT ID
  },
  {
    name: 'Source Prompt',
    type: 'multipleRecordLinks', 
    options: { linkedTableId: 'tblmoUjbAv5NKIyhs' }  // CORRECT ID
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
