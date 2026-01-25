import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdCopyList } from '@/hooks/useN8n';
import { avatarTargetOptions, angleOptions, formatOptions } from '@/data/options';
import type { AdCopyRecord, GenerateStatus } from '@/types/scaler';

export default function Library() {
  const navigate = useNavigate();
  const { data: records = [], isLoading, error } = useAdCopyList();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [avatarFilter, setAvatarFilter] = useState<string>('all');
  const [angleFilter, setAngleFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredRecords = records.filter((record) => {
    if (avatarFilter !== 'all' && record.avatarTarget !== avatarFilter) return false;
    if (angleFilter !== 'all' && record.angle !== angleFilter) return false;
    if (formatFilter !== 'all' && record.format !== formatFilter) return false;
    if (searchQuery && !record.fullConcept?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Library</h1>
        <p className="text-muted-foreground text-sm">
          Browse and retrieve past ad copy records.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-card border border-border rounded-md">
            <Select value={avatarFilter} onValueChange={setAvatarFilter}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Avatar Target" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Targets</SelectItem>
                {avatarTargetOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={angleFilter} onValueChange={setAngleFilter}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Angle" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Angles</SelectItem>
                {angleOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Formats</SelectItem>
                {formatOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="mb-4">
        <span className="text-xs text-muted-foreground font-mono">
          {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12 text-destructive">
          Failed to load records. Please try again.
        </div>
      )}

      {/* Records Table */}
      {!isLoading && !error && (
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Concept
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Angle
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRecords.map((record) => (
                <RecordRow key={record.id} record={record} formatDate={formatDate} />
              ))}
            </tbody>
          </table>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No records found matching your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecordRow({
  record,
  formatDate,
}: {
  record: AdCopyRecord;
  formatDate: (date: string) => string;
}) {
  const getStatus = (): GenerateStatus => {
    if (record.images && record.images.length > 0) return 'Done';
    if (record.generateImagePrompts === 'Running') return 'Running';
    if (record.generateImagePrompts === 'Error') return 'Error';
    return 'Ready';
  };

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {record.avatarTarget || 'No target'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
          {record.fullConcept?.slice(0, 80) || 'No concept'}...
        </p>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-sm text-muted-foreground font-mono">
          {record.angle || '-'}
        </span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={getStatus()} />
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-sm text-muted-foreground font-mono">
          {record.createdAt ? formatDate(record.createdAt) : '-'}
        </span>
      </td>
    </tr>
  );
}
