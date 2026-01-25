// Scaler Types — Airtable Data Models

export type AvatarTarget = 
  | 'Desk Workers' 
  | 'Women 45+' 
  | 'Gift Buyers'
  | 'Hobbyists' 
  | 'Professionals' 
  | 'General';

export type Angle = 
  | 'Curiosity' 
  | 'Identity' 
  | 'Pain' 
  | 'Social Proof'
  | 'Us vs Them' 
  | 'Urgency' 
  | 'Gift' 
  | 'Cost' 
  | 'Science'
  | 'Transformation' 
  | 'Risk Reversal' 
  | 'Scarcity' 
  | 'Direct Offer';

export type AwarenessLevel = 
  | 'Unaware' 
  | 'Problem Aware' 
  | 'Solution Aware' 
  | 'Product Aware';

export type AdFormat = 
  | 'FMT1 - X-Ray Agitation' 
  | 'FMT2 - Problem-Solution'
  | 'FMT3 - Testimonial Proof' 
  | 'FMT4 - Before-After'
  | 'FMT5 - Mechanism Reveal';

export type GenerateStatus = 'Ready' | 'Running' | 'Done' | 'Error';

export interface ImageAttachment {
  id: string;
  url: string;
  filename: string;
}

export interface AdCopyRecord {
  id: string;
  fullConcept: string;
  headline: string;
  bodyCopy: string;
  visual: string;
  angle: Angle | null;
  avatarTarget: AvatarTarget | null;
  awarenessLevel: AwarenessLevel | null;
  format: AdFormat | null;
  tags: string[];
  cta: string | null;
  generateImagePrompts: GenerateStatus | null;
  prompts: {
    variantA: string | null;
    variantB: string | null;
    storyBrand: string | null;
  };
  images: ImageAttachment[];
  createdAt: string;
}

export interface AdGeneratorForm {
  avatarTarget: AvatarTarget | '';
  angle: Angle | '';
  awarenessLevel: AwarenessLevel | '';
  format: AdFormat | '';
  fullConcept: string;
  cta: string;
}

export interface GenerateAdCopyResponse {
  recordId: string;
  status: GenerateStatus;
}
