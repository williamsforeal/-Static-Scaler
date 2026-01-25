import type { AdCopyRecord, AdGeneratorForm, GenerateAdCopyResponse } from '@/types/scaler';

const BASE_URL = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL || 'https://williamsforeal.app.n8n.cloud/webhook';

const ENDPOINTS = {
  adCopy: `${BASE_URL}/dd6af9ad-c56d-40f4-b32d-079819744720`,
  generateImages: `${BASE_URL}/fa17dba4-b0bd-4849-accd-78d71e79452e`,
  generatePrompts: `${BASE_URL}/15acdc45-1172-472a-b410-67f78d1482f8`,
};

// Fetch all Ad Copy records
export async function fetchAdCopyRecords(): Promise<AdCopyRecord[]> {
  const response = await fetch(ENDPOINTS.adCopy, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch records: ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

// Fetch single Ad Copy record by ID
export async function fetchAdCopyRecord(recordId: string): Promise<AdCopyRecord> {
  const response = await fetch(`${ENDPOINTS.adCopy}?recordId=${recordId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch record: ${response.statusText}`);
  }

  return response.json();
}

// Trigger ad copy generation
export async function triggerGenerateAdCopy(formData: AdGeneratorForm): Promise<GenerateAdCopyResponse> {
  const response = await fetch(ENDPOINTS.adCopy, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fullConcept: formData.fullConcept,
      avatarTarget: formData.avatarTarget || null,
      angle: formData.angle || null,
      awarenessLevel: formData.awarenessLevel || null,
      format: formData.format || null,
      cta: formData.cta || null,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate ad copy: ${response.statusText}`);
  }

  return response.json();
}

// Trigger image generation for a record (GET with query param)
export async function triggerGenerateImages(recordId: string): Promise<any> {
  const response = await fetch(`${ENDPOINTS.generateImages}?recordId=${recordId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to trigger image generation: ${response.statusText}`);
  }

  return response.json();
}

// Trigger prompt generation for a record (GET with query param)
export async function triggerGeneratePrompts(recordId: string): Promise<any> {
  const response = await fetch(`${ENDPOINTS.generatePrompts}?recordId=${recordId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to trigger prompt generation: ${response.statusText}`);
  }

  return response.json();
}
