import { ScrollArea } from '@/components/ui/scroll-area';
import type { ActivityEvent } from '@/types/magpie';
import {
  Package,
  Zap,
  LineChart,
  Brain,
  GitBranch,
  TrendingUp,
  Star,
  AlertCircle,
} from 'lucide-react';

interface ActivityFeedProps {
  events: ActivityEvent[];
  maxHeight?: string;
}

export function ActivityFeed({
  events,
  maxHeight = '400px',
}: ActivityFeedProps) {
  const getIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'product':
        return <Package className="h-4 w-4 text-primary" />;
      case 'test':
        return <Zap className="h-4 w-4 text-amber-500" />;
      case 'campaign':
        return <LineChart className="h-4 w-4 text-primary" />;
      case 'agent':
        return <Brain className="h-4 w-4 text-primary" />;
      case 'flow':
        return <GitBranch className="h-4 w-4 text-primary" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'opportunity':
        return <Star className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Package className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <ScrollArea style={{ height: maxHeight }} className="pr-4">
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex gap-3 p-3 rounded-md border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-150"
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(event.type)}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-semibold text-foreground">
                  {event.title}
                </h4>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTime(event.timestamp)}
                </span>
              </div>

              <p className="text-xs text-muted-foreground mb-2">
                {event.description}
              </p>

              <div className="flex items-center gap-4 text-xs">
                {event.agentId && (
                  <span className="text-primary font-medium">
                    {event.agentId}
                  </span>
                )}
                {event.metric && (
                  <span className="text-foreground">
                    <span className="text-muted-foreground">
                      {event.metric.label}:
                    </span>{' '}
                    <span className="font-semibold text-primary">
                      {event.metric.value}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
