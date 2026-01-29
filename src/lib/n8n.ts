import type { AdCopyRecord, AdGeneratorForm, GenerateAdCopyResponse } from '@/types/scaler';
import type { AdFormat } from '@/types/bannerbear';

const BASE_URL = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL || 'https://williamsforeal.app.n8n.cloud/webhook';

const ENDPOINTS = {
  // Existing endpoints
  adCopy: `${BASE_URL}/dd6af9ad-c56d-40f4-b32d-079819744720`,
  generateImages: `${BASE_URL}/fa17dba4-b0bd-4849-accd-78d71e79452e`,
  generatePrompts: `${BASE_URL}/15acdc45-1172-472a-b410-67f78d1482f8`,

  // Pipeline endpoints (create these webhooks in n8n)
  pipelineStart: `${BASE_URL}/pipeline-start`,
  pipelineBatch: `${BASE_URL}/pipeline-batch`,
  pipelineStatus: `${BASE_URL}/pipeline-status`,
  bannerbearWebhook: `${BASE_URL}/bannerbear-webhook`,

  // MAGPIE endpoints
  magpieOpportunities: `${BASE_URL}/magpie-opportunities`,
  magpieStartTest: `${BASE_URL}/magpie-test`,
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

// Trigger image generation for a record
export async function triggerGenerateImages(recordId: string): Promise<void> {
  const response = await fetch(ENDPOINTS.generateImages, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recordId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to trigger image generation: ${response.statusText}`);
  }
}

// Trigger prompt generation for a record
export async function triggerGeneratePrompts(recordId: string): Promise<void> {
  const response = await fetch(ENDPOINTS.generatePrompts, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recordId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to trigger prompt generation: ${response.statusText}`);
  }
}

// =============================================================================
// CREATIVE PIPELINE ENDPOINTS
// =============================================================================

export interface PipelineStartParams {
  /** Airtable record ID */
  recordId: string;
  /** Skip Bannerbear text overlay */
  skipOverlay?: boolean;
  /** Override ad format */
  format?: AdFormat;
  /** Use high-quality model (slower) */
  highQuality?: boolean;
}

export interface PipelineStartResponse {
  /** Pipeline job ID for tracking */
  pipelineId: string;
  /** Current status */
  status: 'queued' | 'processing' | 'completed' | 'failed';
  /** Estimated completion time in seconds */
  estimatedTime?: number;
}

/**
 * Trigger the full creative pipeline for a single record
 * Flow: Airtable → LLM (prompts) → fal.ai (images) → Bannerbear (overlay)
 */
export async function triggerCreativePipeline(
  params: PipelineStartParams
): Promise<PipelineStartResponse> {
  const response = await fetch(ENDPOINTS.pipelineStart, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to start pipeline: ${response.statusText}`);
  }

  return response.json();
}

export interface BatchPipelineParams {
  /** Array of Airtable record IDs */
  recordIds: string[];
  /** Skip Bannerbear text overlay for all */
  skipOverlay?: boolean;
  /** Use high-quality model for all (slower) */
  highQuality?: boolean;
}

export interface BatchPipelineResponse {
  /** Batch job ID for tracking */
  batchId: string;
  /** Number of jobs queued */
  jobCount: number;
  /** Estimated total time in seconds */
  estimatedTime?: number;
}

/**
 * Trigger batch processing for multiple records
 */
export async function triggerBatchPipeline(
  params: BatchPipelineParams
): Promise<BatchPipelineResponse> {
  const response = await fetch(ENDPOINTS.pipelineBatch, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to start batch pipeline: ${response.statusText}`);
  }

  return response.json();
}

export interface PipelineStatusResponse {
  /** Pipeline or batch ID */
  id: string;
  /** Current status */
  status: 'queued' | 'processing' | 'completed' | 'failed';
  /** Progress percentage (0-100) */
  progress: number;
  /** Number of completed items (for batch) */
  completed?: number;
  /** Total items (for batch) */
  total?: number;
  /** Results when completed */
  results?: Array<{
    recordId: string;
    status: 'success' | 'failed';
    baseImageUrl?: string;
    finalImageUrl?: string;
    error?: string;
  }>;
  /** Error message if failed */
  error?: string;
}

/**
 * Get the status of a pipeline or batch job
 */
export async function getPipelineStatus(
  id: string,
  type: 'pipeline' | 'batch' = 'pipeline'
): Promise<PipelineStatusResponse> {
  const response = await fetch(`${ENDPOINTS.pipelineStatus}?id=${id}&type=${type}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get pipeline status: ${response.statusText}`);
  }

  return response.json();
}

// =============================================================================
// MAGPIE ENDPOINTS
// =============================================================================

export interface MagpieTestParams {
  /** Product ID to test */
  productId: string;
  /** Test budget in dollars */
  budget?: number;
  /** Target platforms */
  platforms?: string[];
  /** Number of ad variants to create */
  variants?: number;
}

export interface MagpieTestResponse {
  /** Test campaign ID */
  testId: string;
  /** Status */
  status: 'created' | 'running' | 'completed';
  /** Number of ads created */
  adsCreated: number;
}

/**
 * Start a product test campaign via MAGPIE
 */
export async function startMagpieTest(
  params: MagpieTestParams
): Promise<MagpieTestResponse> {
  const response = await fetch(ENDPOINTS.magpieStartTest, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to start MAGPIE test: ${response.statusText}`);
  }

  return response.json();
}
