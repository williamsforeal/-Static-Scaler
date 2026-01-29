/**
 * MAGPIE Command Center Types
 *
 * Types for the multi-agent intelligence dashboard.
 * Adapted from matrix-command-center for AdScaler integration.
 */

// =============================================================================
// AGENT TYPES
// =============================================================================

export type AgentStatus = 'active' | 'idle' | 'error' | 'offline';

export interface Agent {
  /** Unique identifier (e.g., 'ARCH-01', 'PROM-01') */
  id: string;
  /** Display name (e.g., 'Systems Architect', 'Prompt Engineer') */
  name: string;
  /** AI model used (e.g., 'Claude 3.5 Sonnet', 'GPT-4o') */
  model: string;
  /** Primary responsibility description */
  responsibility: string;
  /** Current status */
  status: AgentStatus;
  /** Current task being worked on (if active) */
  currentTask?: string;
  /** Last activity timestamp (ISO string) */
  lastActive?: string;
  /** Key metric for this agent */
  metric?: {
    label: string;
    value: string | number;
  };
}

// =============================================================================
// PRODUCT INTELLIGENCE TYPES
// =============================================================================

export type TrendVelocity = 'up' | 'down' | 'stable';

export interface Product {
  /** Unique identifier */
  id: string;
  /** Product name */
  name: string;
  /** Product description */
  description?: string;
  /** Category (e.g., 'Personalized Gifts', 'Pet Products') */
  category: string;
  /** Opportunity score (0-100) */
  score: number;
  /** Estimated margin in dollars */
  margin: number;
  /** Platforms where trending (e.g., 'TikTok, Pinterest') */
  trendingOn: string[];
  /** Trend direction */
  velocity: TrendVelocity;
  /** Interest level (search volume indicator) */
  interest: number;
  /** Creation timestamp */
  createdAt?: string;
  /** Airtable record ID if linked */
  airtableRecordId?: string;
}

// =============================================================================
// ACTIVITY FEED TYPES
// =============================================================================

export type ActivityEventType =
  | 'product'
  | 'test'
  | 'campaign'
  | 'agent'
  | 'flow'
  | 'trend'
  | 'opportunity'
  | 'error';

export interface ActivityEvent {
  /** Unique identifier */
  id: string;
  /** Event type for icon/styling */
  type: ActivityEventType;
  /** Event title/headline */
  title: string;
  /** Detailed description */
  description: string;
  /** Associated agent ID (if applicable) */
  agentId?: string;
  /** Event timestamp (ISO string) */
  timestamp: string;
  /** Associated metric (if applicable) */
  metric?: {
    label: string;
    value: string;
  };
  /** Source of the event */
  source?: string;
}

// =============================================================================
// METRICS & STATS TYPES
// =============================================================================

export type MetricStatus = 'up' | 'down' | 'neutral';

export interface Metric {
  /** Metric label */
  label: string;
  /** Current value */
  value: string | number;
  /** Change from previous period (percentage) */
  trend?: number;
  /** Direction indicator */
  status?: MetricStatus;
}

export interface DashboardStats {
  /** Products analyzed today */
  productsAnalyzed: Metric;
  /** High-score opportunities (score > 80) */
  highScoreOpportunities: Metric;
  /** Currently running tests */
  activeTests: Metric;
  /** Average opportunity score */
  avgOpportunityScore: Metric;
}

// =============================================================================
// AUTOMATION FLOW TYPES
// =============================================================================

export type FlowStatus = 'active' | 'inactive' | 'error';

export interface AutomationFlow {
  /** Unique identifier */
  id: string;
  /** Flow name */
  name: string;
  /** Current status */
  status: FlowStatus;
  /** Last execution timestamp */
  lastRun?: string;
  /** Total executions count */
  executions: number;
  /** Associated webhook URL */
  webhookUrl?: string;
  /** Description of what this flow does */
  description?: string;
}

// =============================================================================
// CREATIVE VARIANT TYPES
// =============================================================================

export interface CreativeVariant {
  /** Unique identifier */
  id: string;
  /** Hook/headline used */
  hook: string;
  /** Marketing angle */
  angle: string;
  /** Target avatar segment */
  avatarSegment: string;
  /** Agent that created this */
  createdBy: string;
  /** Creation timestamp */
  timestamp: string;
  /** Associated image URL */
  imageUrl?: string;
  /** Performance score if tested */
  performanceScore?: number;
}

// =============================================================================
// TREND DATA TYPES
// =============================================================================

export type Platform = 'tiktok' | 'instagram' | 'facebook' | 'pinterest' | 'reddit' | 'google';

export interface TrendDataPoint {
  /** Trend topic/keyword */
  topic: string;
  /** Platform source */
  platform: Platform;
  /** Trend score */
  score: number;
  /** Velocity (rate of change) */
  velocity: number;
  /** Collection timestamp */
  collectedAt: string;
  /** Raw data from platform */
  rawData?: Record<string, unknown>;
}

export interface TrendSummary {
  /** Platform name */
  platform: Platform;
  /** Number of trends found */
  trendCount: number;
  /** Average trend score */
  avgScore: number;
  /** Top trending topic */
  topTrend?: string;
}

// =============================================================================
// SUPABASE TABLE TYPES (for direct queries)
// =============================================================================

export interface ProductOpportunitiesRow {
  id: string;
  name: string;
  description: string | null;
  category: string;
  opportunity_score: number;
  estimated_margin: number;
  trending_platforms: string[];
  airtable_record_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentStatusRow {
  id: string;
  name: string;
  model: string;
  responsibility: string;
  status: AgentStatus;
  current_task: string | null;
  last_active: string | null;
  metric_label: string | null;
  metric_value: string | null;
}

export interface ActivityLogRow {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  agent_id: string | null;
  source: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface TrendingTopicsRow {
  id: string;
  topic: string;
  platform: Platform;
  score: number;
  velocity: number;
  raw_data: Record<string, unknown> | null;
  collected_at: string;
}

// =============================================================================
// MAPPING FUNCTIONS (Supabase row → App type)
// =============================================================================

export function mapProductRow(row: ProductOpportunitiesRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    category: row.category,
    score: row.opportunity_score,
    margin: row.estimated_margin,
    trendingOn: row.trending_platforms || [],
    velocity: 'stable', // Calculate from history if needed
    interest: row.opportunity_score, // Use score as proxy
    createdAt: row.created_at,
    airtableRecordId: row.airtable_record_id || undefined,
  };
}

export function mapAgentRow(row: AgentStatusRow): Agent {
  return {
    id: row.id,
    name: row.name,
    model: row.model,
    responsibility: row.responsibility,
    status: row.status,
    currentTask: row.current_task || undefined,
    lastActive: row.last_active || undefined,
    metric: row.metric_label
      ? { label: row.metric_label, value: row.metric_value || '' }
      : undefined,
  };
}

export function mapActivityRow(row: ActivityLogRow): ActivityEvent {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    agentId: row.agent_id || undefined,
    timestamp: row.created_at,
    source: row.source || undefined,
  };
}

export function mapTrendRow(row: TrendingTopicsRow): TrendDataPoint {
  return {
    topic: row.topic,
    platform: row.platform,
    score: row.score,
    velocity: row.velocity,
    collectedAt: row.collected_at,
    rawData: row.raw_data || undefined,
  };
}
