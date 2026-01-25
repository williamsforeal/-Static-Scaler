import { useState, useEffect } from 'react';
import { Loader2, ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { useAdCopyList, useAdCopyRecord, useTriggerImages } from '@/hooks/useN8n';
import type { GenerateStatus } from '@/types/scaler';

export default function AdGenerator() {
  const { toast } = useToast();
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Fetch list of all records for dropdown
  const { data: records, isLoading: listLoading, refetch: refetchList } = useAdCopyList();

  // Fetch selected record details with auto-refresh when generating
  const {
    data: selectedRecord,
    isLoading: recordLoading,
    refetch: refetchRecord,
  } = useAdCopyRecord(selectedRecordId, {
    refetchInterval: isPolling ? 5000 : false,
  });

  // Mutation for triggering image generation
  const imagesMutation = useTriggerImages();

  // Determine overall status
  const getOverallStatus = (): GenerateStatus | null => {
    if (imagesMutation.isPending) return 'Running';
    if (selectedRecord?.generateImagePrompts === 'Running') return 'Running';
    if (selectedRecord?.images && selectedRecord.images.length > 0) return 'Done';
    if (selectedRecord) return 'Ready';
    return null;
  };

  const overallStatus = getOverallStatus();

  // Control polling based on status
  useEffect(() => {
    if (selectedRecord?.generateImagePrompts === 'Running') {
      setIsPolling(true);
    } else if (
      selectedRecord?.generateImagePrompts === 'Done' ||
      selectedRecord?.generateImagePrompts === 'Error'
    ) {
      setIsPolling(false);
    }
  }, [selectedRecord?.generateImagePrompts]);

  const handleGenerateImages = async () => {
    if (!selectedRecordId) return;

    try {
      await imagesMutation.mutateAsync(selectedRecordId);
      setIsPolling(true);
      toast({
        title: 'Generating Images',
        description: 'Your ad images are being generated...',
      });
    } catch (error) {
      toast({
        title: 'Image Generation Failed',
        description: 'Failed to generate images. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = () => {
    refetchRecord();
    refetchList();
  };

  const canGenerateImages =
    selectedRecordId && !imagesMutation.isPending && selectedRecord?.generateImagePrompts !== 'Running';

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Static Ad Generator</h1>
          <p className="text-sm text-muted-foreground">Select a record and generate images</p>
        </div>
        <div className="flex items-center gap-3">
          {isPolling && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Refreshing...</span>
            </div>
          )}
          {overallStatus && <StatusBadge status={overallStatus} />}
        </div>
      </div>

      {/* Selection Section */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Select Ad Copy Record
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Ad Copy Record</Label>
            <Select
              value={selectedRecordId ?? ''}
              onValueChange={(value) => setSelectedRecordId(value)}
            >
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder={listLoading ? 'Loading records...' : 'Select a record...'} />
              </SelectTrigger>
              <SelectContent>
                {records?.map((record) => (
                  <SelectItem key={record.id} value={record.id}>
                    {record.id} - {record.fullConcept?.slice(0, 50) || record.headline?.slice(0, 50) || 'Untitled'}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleGenerateImages}
              disabled={!canGenerateImages}
              className="gap-2"
            >
              {imagesMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
              Generate Images
            </Button>

            <Button onClick={handleRefresh} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Generated Images Section */}
      {selectedRecordId && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Generated Images
          </h2>

          {recordLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : selectedRecord?.images && selectedRecord.images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {selectedRecord.images.map((img, idx) => (
                <div
                  key={img.id || idx}
                  className="rounded-lg border border-border overflow-hidden bg-muted/50"
                >
                  <img
                    src={img.url}
                    alt={`Variant ${idx + 1}`}
                    className="w-full h-auto object-cover"
                  />
                  <div className="p-3 text-center">
                    <span className="text-sm font-medium text-foreground">
                      {idx === 0 ? 'Variant A' : idx === 1 ? 'Variant B' : 'StoryBrand'}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {idx === 0 ? '(Control)' : idx === 1 ? '(Test)' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">
                {selectedRecord?.generateImagePrompts === 'Running'
                  ? 'Generating images...'
                  : 'No images generated yet. Click "Generate Images" to start.'}
              </p>
            </div>
          )}

          {/* Show raw record data for debugging */}
          {selectedRecord && (
            <details className="mt-4">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                Debug: View raw record data
              </summary>
              <pre className="mt-2 p-3 bg-muted/50 rounded text-xs overflow-auto max-h-48">
                {JSON.stringify(selectedRecord, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
