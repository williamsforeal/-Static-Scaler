/**
 * MAGPIE Data Hooks
 *
 * React Query hooks for fetching MAGPIE Command Center data from Supabase.
 * These hooks provide caching, auto-refresh, and loading states.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  Product,
  Agent,
  ActivityEvent,
  TrendDataPoint,
  TrendSummary,
  DashboardStats,
  Platform,
  ProductOpportunitiesRow,
  AgentStatusRow,
  ActivityLogRow,
  TrendingTopicsRow,
  mapProductRow,
  mapAgentRow,
  mapActivityRow,
  mapTrendRow,
} from '@/types/magpie';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const magpieKeys = {
  all: ['magpie'] as const,
  products: () => [...magpieKeys.all, 'products'] as const,
  product: (id: string) => [...magpieKeys.products(), id] as const,
  agents: () => [...magpieKeys.all, 'agents'] as const,
  agent: (id: string) => [...magpieKeys.agents(), id] as const,
  activity: () => [...magpieKeys.all, 'activity'] as const,
  trends: (platform?: Platform) => [...magpieKeys.all, 'trends', platform] as const,
  stats: () => [...magpieKeys.all, 'stats'] as const,
};

// =============================================================================
// PRODUCT OPPORTUNITIES
// =============================================================================

/**
 * Fetch all product opportunities sorted by score
 */
export function useProductOpportunities(options?: {
  minScore?: number;
  limit?: number;
  category?: string;
}) {
  return useQuery({
    queryKey: [...magpieKeys.products(), options],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase
        .from('product_opportunities')
        .select('*')
        .order('opportunity_score', { ascending: false });

      if (options?.minScore) {
        query = query.gte('opportunity_score', options.minScore);
      }

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching product opportunities:', error);
        throw error;
      }

      // Map database rows to app types
      return (data as ProductOpportunitiesRow[]).map(row => ({
        id: row.id,
        name: row.name,
        description: row.description || undefined,
        category: row.category,
        score: row.opportunity_score,
        margin: row.estimated_margin,
        trendingOn: row.trending_platforms || [],
        velocity: 'stable' as const,
        interest: row.opportunity_score,
        createdAt: row.created_at,
        airtableRecordId: row.airtable_record_id || undefined,
      }));
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  });
}

/**
 * Fetch high-score opportunities (score >= 80)
 */
export function useHighScoreOpportunities() {
  return useProductOpportunities({ minScore: 80 });
}

// =============================================================================
// AGENT STATUS
// =============================================================================

/**
 * Fetch all agent statuses
 */
export function useAgentStatus() {
  return useQuery({
    queryKey: magpieKeys.agents(),
    queryFn: async (): Promise<Agent[]> => {
      const { data, error } = await supabase
        .from('agent_status')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching agent status:', error);
        throw error;
      }

      // Map database rows to app types
      return (data as AgentStatusRow[]).map(row => ({
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
      }));
    },
    staleTime: 5000, // 5 seconds (agents update frequently)
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

/**
 * Get count of active agents
 */
export function useActiveAgentCount() {
  const { data: agents } = useAgentStatus();
  return agents?.filter(a => a.status === 'active').length || 0;
}

// =============================================================================
// ACTIVITY FEED
// =============================================================================

/**
 * Fetch recent activity events
 */
export function useActivityFeed(options?: {
  limit?: number;
  type?: string;
}) {
  return useQuery({
    queryKey: [...magpieKeys.activity(), options],
    queryFn: async (): Promise<ActivityEvent[]> => {
      let query = supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.type) {
        query = query.eq('type', options.type);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      } else {
        query = query.limit(50); // Default limit
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activity feed:', error);
        throw error;
      }

      // Map database rows to app types
      return (data as ActivityLogRow[]).map(row => ({
        id: row.id,
        type: row.type,
        title: row.title,
        description: row.description,
        agentId: row.agent_id || undefined,
        timestamp: row.created_at,
        source: row.source || undefined,
      }));
    },
    staleTime: 10000, // 10 seconds
    refetchInterval: 15000, // Refresh every 15 seconds
  });
}

// =============================================================================
// TRENDING TOPICS
// =============================================================================

/**
 * Fetch trending topics, optionally filtered by platform
 */
export function useTrendingTopics(platform?: Platform) {
  return useQuery({
    queryKey: magpieKeys.trends(platform),
    queryFn: async (): Promise<TrendDataPoint[]> => {
      let query = supabase
        .from('trending_topics')
        .select('*')
        .order('score', { ascending: false })
        .limit(100);

      if (platform) {
        query = query.eq('platform', platform);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching trending topics:', error);
        throw error;
      }

      // Map database rows to app types
      return (data as TrendingTopicsRow[]).map(row => ({
        topic: row.topic,
        platform: row.platform,
        score: row.score,
        velocity: row.velocity,
        collectedAt: row.collected_at,
        rawData: row.raw_data || undefined,
      }));
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refresh every 5 minutes
  });
}

/**
 * Get trend summary by platform
 */
export function useTrendSummary() {
  const { data: trends } = useTrendingTopics();

  if (!trends) return [];

  const platformMap = new Map<Platform, TrendDataPoint[]>();

  trends.forEach(trend => {
    const existing = platformMap.get(trend.platform) || [];
    existing.push(trend);
    platformMap.set(trend.platform, existing);
  });

  const summaries: TrendSummary[] = [];

  platformMap.forEach((platformTrends, platform) => {
    const avgScore = platformTrends.reduce((sum, t) => sum + t.score, 0) / platformTrends.length;
    const topTrend = platformTrends[0]?.topic;

    summaries.push({
      platform,
      trendCount: platformTrends.length,
      avgScore: Math.round(avgScore),
      topTrend,
    });
  });

  return summaries;
}

// =============================================================================
// DASHBOARD STATS
// =============================================================================

/**
 * Fetch aggregated dashboard statistics
 */
export function useDashboardStats() {
  const { data: products } = useProductOpportunities();
  const { data: agents } = useAgentStatus();
  const { data: trends } = useTrendingTopics();

  const stats: DashboardStats = {
    productsAnalyzed: {
      label: 'Products Analyzed Today',
      value: trends?.length || 0,
      trend: 23, // TODO: Calculate from historical data
      status: 'up',
    },
    highScoreOpportunities: {
      label: 'High Score Opportunities',
      value: products?.filter(p => p.score >= 80).length || 0,
      trend: 4,
      status: 'up',
    },
    activeTests: {
      label: 'Active Tests',
      value: agents?.filter(a => a.status === 'active' && a.currentTask?.includes('test')).length || 0,
      status: 'neutral',
    },
    avgOpportunityScore: {
      label: 'Avg Opportunity Score',
      value: products?.length
        ? Math.round(products.reduce((sum, p) => sum + p.score, 0) / products.length)
        : 0,
      trend: 5.2,
      status: 'up',
    },
  };

  return stats;
}

// =============================================================================
// MUTATIONS
// =============================================================================

/**
 * Log a new activity event
 */
export function useLogActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
      const { data, error } = await supabase.from('activity_log').insert({
        type: event.type,
        title: event.title,
        description: event.description,
        agent_id: event.agentId,
        source: event.source,
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: magpieKeys.activity() });
    },
  });
}

/**
 * Update agent status
 */
export function useUpdateAgentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      agentId: string;
      status: Agent['status'];
      currentTask?: string;
    }) => {
      const { data, error } = await supabase
        .from('agent_status')
        .update({
          status: params.status,
          current_task: params.currentTask,
          last_active: new Date().toISOString(),
        })
        .eq('id', params.agentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: magpieKeys.agents() });
    },
  });
}

// =============================================================================
// MOCK DATA (for development when Supabase tables don't exist)
// =============================================================================

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'ARCH-01',
    name: 'Systems Architect',
    model: 'Claude 3.5 Sonnet',
    responsibility: 'Analyzing product schema',
    status: 'active',
    currentTask: 'Analyzing product schema for new marketplace',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'DEV-01',
    name: 'Code Execution',
    model: 'Claude Code / Codex',
    responsibility: 'Code generation and execution',
    status: 'idle',
    lastActive: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'AUTO-01',
    name: 'Automation Engineer',
    model: 'Claude / GPT-4o',
    responsibility: 'Building webhook handlers',
    status: 'active',
    currentTask: 'Building webhook handler for Airtable sync',
    lastActive: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'PROM-01',
    name: 'Prompt Engineer',
    model: 'Claude 3.5 Sonnet',
    responsibility: 'Optimizing prompts',
    status: 'active',
    currentTask: 'Structuring creative prompts for ad variants',
    lastActive: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: 'VAR-01',
    name: 'Creative Variant',
    model: 'Gemini 1.5 Pro',
    responsibility: 'Generating ad variants',
    status: 'active',
    currentTask: 'Generating 15 ad angles for pet products',
    lastActive: new Date(Date.now() - 1 * 60000).toISOString(),
  },
  {
    id: 'QA-01',
    name: 'Validation Sentinel',
    model: 'GPT-4o / Claude',
    responsibility: 'Quality assurance',
    status: 'idle',
    lastActive: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: 'DOC-01',
    name: 'Scribe',
    model: 'Claude 3.5 Haiku',
    responsibility: 'Documentation',
    status: 'idle',
    lastActive: new Date(Date.now() - 45 * 60000).toISOString(),
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Custom Star Map',
    description: 'Personalized night sky poster',
    category: 'Personalized Gifts',
    score: 92,
    margin: 31.5,
    trendingOn: ['TikTok', 'Pinterest'],
    velocity: 'up',
    interest: 92,
  },
  {
    id: '2',
    name: 'Pet Portrait Mug',
    description: 'Custom cartoon pet artwork',
    category: 'Pet Products',
    score: 87,
    margin: 28.1,
    trendingOn: ['Instagram', 'TikTok'],
    velocity: 'up',
    interest: 87,
  },
  {
    id: '3',
    name: 'Anxiety Relief Ring',
    description: 'Fidget spinner ring',
    category: 'Wellness',
    score: 74,
    margin: 18.25,
    trendingOn: ['Reddit', 'Meta'],
    velocity: 'stable',
    interest: 74,
  },
  {
    id: '4',
    name: 'LED Strip Lights',
    description: 'RGB room ambient lighting',
    category: 'Home Decor',
    score: 68,
    margin: 22.8,
    trendingOn: ['TikTok'],
    velocity: 'down',
    interest: 68,
  },
];

export const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: '1',
    type: 'trend',
    title: 'New trending product detected: "Macro Lamp"',
    description: 'ARCH-01 scored viability at 89/100 based on trend velocity',
    agentId: 'ARCH-01',
    timestamp: new Date().toISOString(),
    metric: { label: 'Score', value: '89' },
  },
  {
    id: '2',
    type: 'test',
    title: 'Test completed: "Custom Star Map" - 2.6% CVR',
    description: 'Margin Estimator validated conversion rate above target',
    agentId: 'QA-01',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    metric: { label: 'CVR', value: '2.6%' },
  },
  {
    id: '3',
    type: 'opportunity',
    title: 'High margin opportunity: "Pet Portrait" - 47% margin',
    description: 'Margin analysis shows strong profitability for scaling',
    agentId: 'ARCH-01',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    metric: { label: 'Margin', value: '47%' },
  },
];

/**
 * Hook that uses mock data when Supabase tables don't exist
 */
export function useMockMagpieData() {
  return {
    agents: MOCK_AGENTS,
    products: MOCK_PRODUCTS,
    activity: MOCK_ACTIVITY,
    stats: {
      productsAnalyzed: { label: 'Products Analyzed Today', value: 247, trend: 23, status: 'up' as const },
      highScoreOpportunities: { label: 'High Score Opportunities', value: 12, trend: -8, status: 'down' as const },
      activeTests: { label: 'Active Tests', value: 3, status: 'neutral' as const },
      avgOpportunityScore: { label: 'Avg Opportunity Score', value: 72.4, trend: 14, status: 'up' as const },
    },
  };
}
