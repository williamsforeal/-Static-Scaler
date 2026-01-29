/**
 * MAGPIE Command Center
 *
 * Multi-agent intelligence dashboard for product discovery and ad automation.
 * Displays agent status, product opportunities, and real-time activity.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AgentCard,
  ActivityFeed,
  MetricCard,
  ProductTable,
} from '@/components/magpie';
import {
  useMockMagpieData,
  useProductOpportunities,
  useAgentStatus,
  useActivityFeed,
} from '@/hooks/useMagpieData';
import {
  Network,
  RefreshCw,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';

export default function CommandCenter() {
  const [useRealData] = useState(false); // Toggle to use Supabase when tables exist

  // Use mock data for development
  const mockData = useMockMagpieData();

  // Real data hooks (will fail gracefully if tables don't exist)
  const {
    data: realProducts,
    isLoading: productsLoading,
  } = useProductOpportunities({ limit: 10 });

  const {
    data: realAgents,
    isLoading: agentsLoading,
  } = useAgentStatus();

  const {
    data: realActivity,
    isLoading: activityLoading,
  } = useActivityFeed({ limit: 20 });

  // Select data source
  const products = useRealData ? realProducts : mockData.products;
  const agents = useRealData ? realAgents : mockData.agents;
  const activity = useRealData ? realActivity : mockData.activity;
  const stats = mockData.stats;

  const activeAgentCount = agents?.filter(a => a.status === 'active').length || 0;

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground">MAGPIE Command Center</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              {activeAgentCount} agents active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            williamsforeal.com · Multi-Agent Intelligence Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard metric={stats.productsAnalyzed} />
        <MetricCard metric={stats.highScoreOpportunities} />
        <MetricCard metric={stats.activeTests} />
        <MetricCard metric={stats.avgOpportunityScore} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Opportunities */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary">Top Product Opportunities</CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time trend analysis from ARCH-01
              </p>
            </CardHeader>
            <CardContent>
              {productsLoading && useRealData ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <ProductTable
                  products={products || []}
                  onViewDetails={(id) => console.log('View details:', id)}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity Feed */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Real-time Activity</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest agent actions and insights
              </p>
            </CardHeader>
            <CardContent>
              {activityLoading && useRealData ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ActivityFeed events={activity || []} maxHeight="350px" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agent Network Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              <CardTitle>MAGPIE Agent Network</CardTitle>
            </div>
            <Badge variant="outline">
              7-agent orchestration system · {activeAgentCount} active · No errors
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {agentsLoading && useRealData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(agents || []).map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Additional Views */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList>
          <TabsTrigger value="trends">Live Trends</TabsTrigger>
          <TabsTrigger value="flows">Automation Flows</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>Trend visualization coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>Automation flow management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>Test history and analytics coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
