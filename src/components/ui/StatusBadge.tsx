import { JobStatus } from '@/types/scaler';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: JobStatus;
}

const statusConfig: Record<JobStatus, { label: string; variant: 'draft' | 'copyReady' | 'rendering' | 'assetReady' | 'failed' }> = {
  DRAFT: { label: 'Draft', variant: 'draft' },
  COPY_READY: { label: 'Copy Ready', variant: 'copyReady' },
  RENDERING: { label: 'Rendering', variant: 'rendering' },
  ASSET_READY: { label: 'Asset Ready', variant: 'assetReady' },
  FAILED: { label: 'Failed', variant: 'failed' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className="uppercase tracking-wider text-[10px] font-semibold">
      {status === 'RENDERING' && (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      )}
      {config.label}
    </Badge>
  );
}
