import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Metric } from '@/types/magpie';

interface MetricCardProps {
  metric: Metric;
  className?: string;
}

export function MetricCard({ metric, className }: MetricCardProps) {
  const getTrendIcon = () => {
    if (!metric.status) return null;

    switch (metric.status) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (metric.status) {
      case 'up':
        return 'text-green-500 bg-green-500/10';
      case 'down':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const formatTrend = () => {
    if (metric.trend === undefined) return null;
    const prefix = metric.trend >= 0 ? '+' : '';
    return `${prefix}${metric.trend}%`;
  };

  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardContent className="pt-6">
        <div className="text-sm text-muted-foreground mb-2">{metric.label}</div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-semibold text-foreground">{metric.value}</span>
          {metric.trend !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-medium',
                getTrendColor()
              )}
            >
              {getTrendIcon()}
              {formatTrend()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
