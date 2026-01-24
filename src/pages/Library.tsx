import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockJobs, avatarOptions, formatOptions } from '@/data/mockData';
import type { Job, JobStatus } from '@/types/scaler';

const statusOptions: JobStatus[] = ['DRAFT', 'COPY_READY', 'RENDERING', 'ASSET_READY', 'FAILED'];

export default function Library() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [avatarFilter, setAvatarFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [storyBrandFilter, setStoryBrandFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredJobs = mockJobs.filter((job) => {
    if (avatarFilter !== 'all' && job.avatar !== avatarFilter) return false;
    if (formatFilter !== 'all' && job.format !== formatFilter) return false;
    if (statusFilter !== 'all' && job.status !== statusFilter) return false;
    if (storyBrandFilter === 'yes' && !job.storyBrandMode) return false;
    if (storyBrandFilter === 'no' && job.storyBrandMode) return false;
    if (searchQuery && !job.symptom.toLowerCase().includes(searchQuery.toLowerCase())) return false;
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
          Browse and retrieve past ad jobs.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by symptom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button
            variant={showFilters ? 'secondary' : 'operator'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-card border border-border rounded-md">
            <Select value={avatarFilter} onValueChange={setAvatarFilter}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Avatar" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Avatars</SelectItem>
                {avatarOptions.map((option) => (
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={storyBrandFilter} onValueChange={setStoryBrandFilter}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="StoryBrand" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">StoryBrand Only</SelectItem>
                <SelectItem value="no">Non-StoryBrand</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="mb-4">
        <span className="text-xs text-muted-foreground font-mono">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Jobs Table */}
      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Avatar
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                Format
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
            {filteredJobs.map((job) => (
              <JobRow key={job.id} job={job} onClick={() => navigate(`/job/${job.id}`)} formatDate={formatDate} />
            ))}
          </tbody>
        </table>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No jobs found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}

function JobRow({
  job,
  onClick,
  formatDate,
}: {
  job: Job;
  onClick: () => void;
  formatDate: (date: string) => string;
}) {
  return (
    <tr
      onClick={onClick}
      className="hover:bg-muted/30 cursor-pointer transition-colors"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{job.avatar}</span>
          {job.storyBrandMode && (
            <Badge variant="outline" className="text-[10px]">
              SB
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
          {job.symptom}
        </p>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-sm text-muted-foreground font-mono">{job.format}</span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={job.status} />
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-sm text-muted-foreground font-mono">{formatDate(job.createdAt)}</span>
      </td>
    </tr>
  );
}
