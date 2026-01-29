/**
 * Batch Processing Page
 *
 * Allows selecting multiple Airtable records and processing them through
 * the creative pipeline (fal.ai + Bannerbear) in parallel.
 */

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Layers,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { fetchAdCopyRecords } from '@/lib/n8n';
import { triggerBatchPipeline, getPipelineStatus } from '@/lib/n8n';
import type { AdCopyRecord } from '@/types/scaler';
import type { AdFormat } from '@/types/bannerbear';

interface BatchJob {
  batchId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  completed: number;
  total: number;
  results?: Array<{
    recordId: string;
    status: 'success' | 'failed';
    baseImageUrl?: string;
    finalImageUrl?: string;
    error?: string;
  }>;
}

export default function BatchProcessing() {
  const queryClient = useQueryClient();
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [activeBatch, setActiveBatch] = useState<BatchJob | null>(null);
  const [skipOverlay, setSkipOverlay] = useState(false);
  const [highQuality, setHighQuality] = useState(false);

  // Fetch all records
  const { data: records, isLoading: recordsLoading } = useQuery({
    queryKey: ['adCopyRecords'],
    queryFn: fetchAdCopyRecords,
    staleTime: 30000,
  });

  // Batch processing mutation
  const batchMutation = useMutation({
    mutationFn: triggerBatchPipeline,
    onSuccess: (response) => {
      setActiveBatch({
        batchId: response.batchId,
        status: 'queued',
        progress: 0,
        completed: 0,
        total: response.jobCount,
      });
      // Start polling for status
      pollBatchStatus(response.batchId);
    },
  });

  // Poll for batch status
  const pollBatchStatus = async (batchId: string) => {
    const poll = async () => {
      try {
        const status = await getPipelineStatus(batchId, 'batch');
        setActiveBatch({
          batchId,
          status: status.status,
          progress: status.progress,
          completed: status.completed || 0,
          total: status.total || 0,
          results: status.results,
        });

        if (status.status !== 'completed' && status.status !== 'failed') {
          setTimeout(poll, 3000); // Poll every 3 seconds
        } else {
          // Refresh records when done
          queryClient.invalidateQueries({ queryKey: ['adCopyRecords'] });
        }
      } catch (error) {
        console.error('Failed to poll batch status:', error);
      }
    };

    poll();
  };

  // Toggle record selection
  const toggleRecord = (recordId: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  // Select all records
  const selectAll = () => {
    if (records) {
      setSelectedRecords(new Set(records.map(r => r.id)));
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedRecords(new Set());
  };

  // Start batch processing
  const startBatch = () => {
    if (selectedRecords.size === 0) return;

    batchMutation.mutate({
      recordIds: Array.from(selectedRecords),
      skipOverlay,
      highQuality,
    });
  };

  // Get status badge for a record
  const getStatusBadge = (record: AdCopyRecord) => {
    if (!record.images || record.images.length === 0) {
      return <Badge variant="outline">No Images</Badge>;
    }
    return (
      <Badge variant="secondary" className="bg-green-500/10 text-green-500">
        {record.images.length} Images
      </Badge>
    );
  };

  // Filter records that need processing (no images or prompts ready)
  const recordsNeedingProcessing = records?.filter(
    r => r.generateImagePrompts === 'Done' && (!r.images || r.images.length === 0)
  ) || [];

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Batch Processing
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate images for multiple records in parallel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['adCopyRecords'] })}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Select Records</CardTitle>
                  <CardDescription>
                    {selectedRecords.size} of {records?.length || 0} selected
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Concept</TableHead>
                      <TableHead>Angle</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recordsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : records?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      records?.map(record => (
                        <TableRow
                          key={record.id}
                          className={selectedRecords.has(record.id) ? 'bg-primary/5' : ''}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedRecords.has(record.id)}
                              onCheckedChange={() => toggleRecord(record.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {record.fullConcept || record.headline || 'Untitled'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.angle || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.avatarTarget || '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(record)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Controls & Status */}
        <div className="space-y-6">
          {/* Processing Options */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Skip Text Overlay</Label>
                  <p className="text-xs text-muted-foreground">
                    Generate base images only
                  </p>
                </div>
                <Switch checked={skipOverlay} onCheckedChange={setSkipOverlay} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>High Quality</Label>
                  <p className="text-xs text-muted-foreground">
                    Use FLUX Dev (slower)
                  </p>
                </div>
                <Switch checked={highQuality} onCheckedChange={setHighQuality} />
              </div>

              <Button
                className="w-full"
                onClick={startBatch}
                disabled={selectedRecords.size === 0 || batchMutation.isPending}
              >
                {batchMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Process {selectedRecords.size} Records
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Active Batch Status */}
          {activeBatch && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {activeBatch.status === 'processing' && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {activeBatch.status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {activeBatch.status === 'failed' && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  {activeBatch.status === 'queued' && (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                  Batch Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={activeBatch.progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {activeBatch.completed} / {activeBatch.total} completed
                </p>

                {activeBatch.results && activeBatch.results.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Results</h4>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {activeBatch.results.map((result, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 rounded bg-muted/50"
                          >
                            {result.status === 'success' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-xs font-mono truncate flex-1">
                              {result.recordId}
                            </span>
                            {result.finalImageUrl && (
                              <a
                                href={result.finalImageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                <ImageIcon className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Records</span>
                  <span className="font-medium">{records?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ready for Processing</span>
                  <span className="font-medium">{recordsNeedingProcessing.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">With Images</span>
                  <span className="font-medium">
                    {records?.filter(r => r.images && r.images.length > 0).length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
