import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType = 'Ready' | 'Running' | 'Done' | 'Error';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  Ready: {
    label: 'Ready',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  Running: {
    label: 'Running',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse-status',
  },
  Done: {
    label: 'Done',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  Error: {
    label: 'Error',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border',
        config.className,
        className
      )}
    >
      {status === 'Running' && (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      )}
      {config.label}
    </span>
  );
}
