import { Job, CopyOutput, Asset, Hook } from '@/types/scaler';

// Mock Jobs
export const mockJobs: Job[] = [
  {
    id: 'job_001',
    avatar: 'Chronic Pain Sufferer',
    symptom: 'Wakes up every morning with lower back stiffness that takes hours to subside',
    format: 'X-Ray Agitation',
    storyBrandMode: true,
    psychAngle: 'Fear of Loss',
    conditionAngle: 'Back Pain',
    offerGuarantee: '60-Day Relief Guarantee',
    status: 'ASSET_READY',
    createdAt: '2024-01-20T10:30:00Z',
    copyOutputId: 'copy_001',
  },
  {
    id: 'job_002',
    avatar: 'Active Senior',
    symptom: 'Knee pain prevents playing with grandchildren',
    format: 'Problem-Solution',
    storyBrandMode: false,
    benefitAngle: 'Active Lifestyle',
    conditionAngle: 'Knee Pain',
    offerGuarantee: '60-Day Relief Guarantee',
    status: 'COPY_READY',
    createdAt: '2024-01-19T14:15:00Z',
    copyOutputId: 'copy_002',
  },
  {
    id: 'job_003',
    avatar: 'Desk Worker',
    symptom: 'Shoulder tension from 8+ hours at computer daily',
    format: 'Mechanism Reveal',
    storyBrandMode: false,
    antiAltAngle: 'PT Alternative',
    conditionAngle: 'Shoulder Pain',
    offerGuarantee: '60-Day Relief Guarantee',
    status: 'RENDERING',
    createdAt: '2024-01-18T09:00:00Z',
    copyOutputId: 'copy_003',
  },
  {
    id: 'job_004',
    avatar: 'Weekend Warrior',
    symptom: 'Hip pain after every golf round',
    format: 'Before-After',
    storyBrandMode: true,
    psychAngle: 'Identity Shift',
    conditionAngle: 'Hip Pain',
    offerGuarantee: '60-Day Relief Guarantee',
    status: 'DRAFT',
    createdAt: '2024-01-17T16:45:00Z',
  },
];

// Mock Hooks
const mockHooks: Hook[] = [
  { id: 'h1', text: 'Your spine is silently compressing while you sleep', isWinner: true },
  { id: 'h2', text: 'That morning stiffness isn\'t normal aging', isWinner: false },
  { id: 'h3', text: 'What 20 years of back research revealed about pain cycles', isWinner: false },
  { id: 'h4', text: 'The hidden reason stretching makes back pain worse', isWinner: false },
  { id: 'h5', text: '3 AM wake-ups from back pain have one surprising cause', isWinner: false },
  { id: 'h6', text: 'Why your mattress company won\'t tell you this', isWinner: false },
];

// Mock Copy Outputs
export const mockCopyOutputs: Record<string, CopyOutput> = {
  'copy_001': {
    id: 'copy_001',
    jobId: 'job_001',
    hooks: mockHooks,
    primaryTextVariants: [
      'Every morning, the same routine. You open your eyes, and before your feet even hit the floor, you already know. That familiar tightness in your lower back is waiting for you. It takes 30 minutes just to feel human again.',
      'They told you it was just part of getting older. That everyone deals with morning stiffness. But deep down, you know something is wrong. Because it\'s getting worse, not better.',
      'You\'ve tried everything. The stretches. The pillows. The expensive mattress. Nothing works for more than a few days. Because they\'re all treating the symptom, not the cause.',
    ],
    visualDirection: {
      style: 'Documentary-style, raw and authentic',
      context: 'Middle-aged person in bedroom at dawn, visible discomfort',
      colorTone: 'Desaturated blues and grays, warm sunrise highlight',
      cameraFraming: 'Medium close-up, eye-level, slightly handheld feel',
    },
    beliefs: ['Pain is not inevitable', 'Morning stiffness has a root cause', 'Relief is possible without surgery'],
    mechanismPhrase: 'Spinal Decompression Protocol',
  },
  'copy_002': {
    id: 'copy_002',
    jobId: 'job_002',
    hooks: [
      { id: 'h1', text: 'Grandkids don\'t wait for your knees to feel better', isWinner: false },
      { id: 'h2', text: 'The playground used to be your happy place', isWinner: true },
      { id: 'h3', text: 'You promised to teach them how to ride a bike', isWinner: false },
    ],
    primaryTextVariants: [
      'They run to you with open arms, but you can\'t pick them up like you used to.',
      'Watching from the bench while other grandparents play. That\'s not the legacy you planned.',
      'Every step you take with them matters. Don\'t let knee pain steal those moments.',
    ],
    visualDirection: {
      style: 'Warm, emotional, lifestyle',
      context: 'Park setting, grandparent watching children play',
      colorTone: 'Golden hour warmth, soft focus background',
      cameraFraming: 'Wide establishing shot, emotional close-ups',
    },
    beliefs: ['You deserve active golden years', 'Mobility equals freedom', 'Joint pain is reversible'],
    mechanismPhrase: 'Joint Restoration Matrix',
  },
};

// Mock Assets
export const mockAssets: Asset[] = [
  {
    id: 'asset_001',
    jobId: 'job_001',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
    variantType: 'Direct Response',
    format: 'Static',
    ratio: '1:1',
    status: 'ready',
  },
  {
    id: 'asset_002',
    jobId: 'job_001',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    variantType: 'Direct Response',
    format: 'Static',
    ratio: '4:5',
    status: 'ready',
  },
  {
    id: 'asset_003',
    jobId: 'job_001',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    variantType: 'StoryBrand',
    format: 'Static',
    ratio: '1:1',
    status: 'ready',
  },
  {
    id: 'asset_004',
    jobId: 'job_001',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    variantType: 'StoryBrand',
    format: 'Static',
    ratio: '4:5',
    status: 'ready',
  },
];

export const avatarOptions = [
  'Chronic Pain Sufferer',
  'Weekend Warrior', 
  'Active Senior',
  'Desk Worker',
  'New Parent',
] as const;

export const formatOptions = [
  'X-Ray Agitation',
  'Problem-Solution',
  'Testimonial Proof',
  'Before-After',
  'Mechanism Reveal',
] as const;

export const psychAngleOptions = [
  'Fear of Loss',
  'Identity Shift',
  'Social Proof',
  'Authority',
  'Scarcity',
] as const;

export const antiAltOptions = [
  'Surgery Alternative',
  'Pills Alternative',
  'PT Alternative',
  'Chiro Alternative',
] as const;

export const benefitOptions = [
  'Pain Relief',
  'Mobility',
  'Sleep Quality',
  'Active Lifestyle',
  'Independence',
] as const;

export const conditionOptions = [
  'Back Pain',
  'Knee Pain',
  'Shoulder Pain',
  'Hip Pain',
  'Neck Pain',
] as const;
