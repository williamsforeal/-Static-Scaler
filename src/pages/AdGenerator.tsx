import { useState, useEffect } from 'react';
import { Loader2, Sparkles, ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CopySection } from '@/components/CopySection';
import { VariantCard } from '@/components/VariantCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { useAdCopyRecord, useTriggerGeneration, useTriggerImages } from '@/hooks/useN8n';
import {
  avatarTargetOptions,
  angleOptions,
  awarenessOptions,
  formatOptions,
} from '@/data/options';
import type { AdGeneratorForm, GenerateStatus } from '@/types/scaler';

const initialFormState: AdGeneratorForm = {
  avatarTarget: '',
  angle: '',
  awarenessLevel: '',
  format: '',
  fullConcept: '',
  cta: '',
};

export default function AdGenerator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<AdGeneratorForm>(initialFormState);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Fetch current record with auto-refresh when generating
  const {
    data: record,
    isLoading: recordLoading,
    refetch,
  } = useAdCopyRecord(currentRecordId, {
    refetchInterval: isPolling ? 5000 : false,
  });

  // Mutations
  const generateMutation = useTriggerGeneration();
  const imagesMutation = useTriggerImages();

  // Determine overall status
  const getOverallStatus = (): GenerateStatus | null => {
    if (generateMutation.isPending) return 'Running';
    if (imagesMutation.isPending) return 'Running';
    if (record?.generateImagePrompts === 'Running') return 'Running';
    if (record?.images && record.images.length > 0) return 'Done';
    if (record) return 'Ready';
    return null;
  };

  const overallStatus = getOverallStatus();

  // Control polling based on status
  useEffect(() => {
    if (record?.generateImagePrompts === 'Running') {
      setIsPolling(true);
    } else if (record?.generateImagePrompts === 'Done' || record?.generateImagePrompts === 'Error') {
      setIsPolling(false);
    }
  }, [record?.generateImagePrompts]);

  const handleGenerateCopy = async () => {
    if (!formData.fullConcept.trim()) {
      toast({
        title: 'Missing Content',
        description: 'Please enter a full concept or pain point.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await generateMutation.mutateAsync(formData);
      setCurrentRecordId(result.recordId);
      setIsPolling(true);
      toast({
        title: 'Generating Ad Copy',
        description: 'Your ad copy is being generated...',
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate ad copy. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateImages = async () => {
    if (!currentRecordId) return;

    try {
      await imagesMutation.mutateAsync(currentRecordId);
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
    refetch();
  };

  const canGenerateImages = record && !imagesMutation.isPending && record.generateImagePrompts !== 'Running';

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Static Ad Generator</h1>
          <p className="text-sm text-muted-foreground">Generate ad copy and images with AI</p>
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

      {/* Input Section */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Input Configuration
        </h2>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Avatar Target</Label>
            <Select
              value={formData.avatarTarget}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, avatarTarget: value as any }))
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select target" />
              </SelectTrigger>
              <SelectContent>
                {avatarTargetOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Angle</Label>
            <Select
              value={formData.angle}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, angle: value as any }))
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select angle" />
              </SelectTrigger>
              <SelectContent>
                {angleOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Awareness Level</Label>
            <Select
              value={formData.awarenessLevel}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, awarenessLevel: value as any }))
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {awarenessOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Format</Label>
            <Select
              value={formData.format}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, format: value as any }))
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Full Concept */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Full Concept / Pain Point</Label>
          <Textarea
            value={formData.fullConcept}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, fullConcept: e.target.value }))
            }
            placeholder="Describe the pain point, concept, or core message for the ad..."
            className="min-h-[100px] text-sm resize-none"
          />
        </div>

        {/* CTA */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">CTA (Call to Action)</Label>
          <Input
            value={formData.cta}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, cta: e.target.value }))
            }
            placeholder="e.g., Stop The Thief, Get Relief Now"
            className="h-9 text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleGenerateCopy}
            disabled={generateMutation.isPending || !formData.fullConcept.trim()}
            className="gap-2"
          >
            {generateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate Copy
          </Button>

          <Button
            onClick={handleGenerateImages}
            disabled={!canGenerateImages}
            variant="outline"
            className="gap-2"
          >
            {imagesMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            Generate Images
          </Button>

          {currentRecordId && (
            <Button onClick={handleRefresh} variant="ghost" size="icon" className="ml-auto">
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Output Section */}
      {(record || recordLoading) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Copy */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Generated Copy
            </h2>

            {recordLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <CopySection title="Headline" content={record?.headline ?? null} />
                <CopySection title="Body Copy" content={record?.bodyCopy ?? null} />
                <CopySection title="Visual Direction" content={record?.visual ?? null} />

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Image Prompts
                  </h4>
                  <CopySection
                    title="Prompt 1 (Variant A)"
                    content={record?.prompts?.variantA ?? null}
                  />
                  <CopySection
                    title="Prompt 2 (Variant B)"
                    content={record?.prompts?.variantB ?? null}
                  />
                  <CopySection
                    title="Prompt 3 (StoryBrand)"
                    content={record?.prompts?.storyBrand ?? null}
                  />
                </div>
              </>
            )}
          </div>

          {/* Right Column - A/B Split Variants */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              A/B Campaign Split
            </h2>

            {recordLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <VariantCard
                  label="Variant A"
                  sublabel="(Control)"
                  prompt={record?.prompts?.variantA ?? null}
                  imageUrl={record?.images?.[0]?.url ?? null}
                  status={record?.generateImagePrompts ?? null}
                />
                <VariantCard
                  label="Variant B"
                  sublabel="(Test)"
                  prompt={record?.prompts?.variantB ?? null}
                  imageUrl={record?.images?.[1]?.url ?? null}
                  status={record?.generateImagePrompts ?? null}
                />
                <VariantCard
                  label="StoryBrand"
                  sublabel=""
                  prompt={record?.prompts?.storyBrand ?? null}
                  imageUrl={record?.images?.[2]?.url ?? null}
                  status={record?.generateImagePrompts ?? null}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
