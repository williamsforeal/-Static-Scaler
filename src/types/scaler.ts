// Scaler Types — Airtable Data Models

export type JobStatus = 'DRAFT' | 'COPY_READY' | 'RENDERING' | 'ASSET_READY' | 'FAILED';

export type Avatar = 'Chronic Pain Sufferer' | 'Weekend Warrior' | 'Active Senior' | 'Desk Worker' | 'New Parent';

export type AdFormat = 'X-Ray Agitation' | 'Problem-Solution' | 'Testimonial Proof' | 'Before-After' | 'Mechanism Reveal';

export type PsychAngle = 'Fear of Loss' | 'Identity Shift' | 'Social Proof' | 'Authority' | 'Scarcity';

export type AntiAltAngle = 'Surgery Alternative' | 'Pills Alternative' | 'PT Alternative' | 'Chiro Alternative';

export type BenefitAngle = 'Pain Relief' | 'Mobility' | 'Sleep Quality' | 'Active Lifestyle' | 'Independence';

export type ConditionAngle = 'Back Pain' | 'Knee Pain' | 'Shoulder Pain' | 'Hip Pain' | 'Neck Pain';

export interface Job {
  id: string;
  avatar: Avatar;
  symptom: string;
  format: AdFormat;
  storyBrandMode: boolean;
  psychAngle?: PsychAngle;
  antiAltAngle?: AntiAltAngle;
  benefitAngle?: BenefitAngle;
  conditionAngle?: ConditionAngle;
  offerGuarantee: string;
  status: JobStatus;
  createdAt: string;
  copyOutputId?: string;
}

export interface CopyOutput {
  id: string;
  jobId: string;
  hooks: Hook[];
  primaryTextVariants: string[];
  visualDirection: VisualDirection;
  beliefs: string[];
  mechanismPhrase: string;
}

export interface Hook {
  id: string;
  text: string;
  isWinner: boolean;
}

export interface VisualDirection {
  style: string;
  context: string;
  colorTone: string;
  cameraFraming: string;
}

export interface Asset {
  id: string;
  jobId: string;
  imageUrl: string;
  variantType: 'Direct Response' | 'StoryBrand';
  format: string;
  ratio: '1:1' | '4:5' | '9:16' | '16:9';
  status: 'pending' | 'ready' | 'failed';
}

// Form types
export interface NewJobFormData {
  avatar: Avatar;
  symptom: string;
  format: AdFormat;
  storyBrandMode: boolean;
  psychAngle?: PsychAngle;
  antiAltAngle?: AntiAltAngle;
  benefitAngle?: BenefitAngle;
  conditionAngle?: ConditionAngle;
  offerGuarantee: string;
}
