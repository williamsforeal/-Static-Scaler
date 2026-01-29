import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Agent } from '@/types/magpie';
import { Brain, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const statusColors = {
    active: 'border-l-primary',
    idle: 'border-l-muted-foreground/30',
    error: 'border-l-destructive',
    offline: 'border-l-muted-foreground/20 border-dashed',
  };

  const statusBadges = {
    active: 'bg-primary/20 text-primary border-primary',
    idle: 'bg-muted text-muted-foreground border-muted-foreground/30',
    error: 'bg-destructive/20 text-destructive border-destructive',
    offline: 'bg-muted/50 text-muted-foreground/50 border-muted-foreground/20',
  };

  return (
    <Card
      className={cn(
        'border-l-4 p-4 cursor-pointer transition-all duration-150 hover:bg-accent/50',
        statusColors[agent.status]
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {agent.status === 'active' ? (
            <Cpu className="text-primary h-6 w-6" />
          ) : (
            <Brain className="text-muted-foreground h-6 w-6" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              {agent.id}
            </h3>
            <Badge
              variant="outline"
              className={cn('text-xs', statusBadges[agent.status])}
            >
              {agent.status}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground mb-2">{agent.name}</p>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground/70">Model:</span>
              <span className="text-xs text-primary font-medium">
                {agent.model}
              </span>
            </div>

            {agent.currentTask && (
              <p className="text-xs text-foreground/80 italic">
                → {agent.currentTask}
              </p>
            )}

            {agent.lastActive && (
              <p className="text-xs text-muted-foreground/50">
                Last: {formatTimeAgo(agent.lastActive)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}
