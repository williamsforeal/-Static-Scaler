import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  avatarOptions,
  formatOptions,
  psychAngleOptions,
  antiAltOptions,
  benefitOptions,
  conditionOptions,
} from '@/data/mockData';
import type { NewJobFormData } from '@/types/scaler';

export default function NewJob() {
  const navigate = useNavigate();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [formData, setFormData] = useState<NewJobFormData>({
    avatar: 'Chronic Pain Sufferer',
    symptom: '',
    format: 'X-Ray Agitation',
    storyBrandMode: false,
    offerGuarantee: '60-Day Relief Guarantee',
  });

  const handleSubmit = () => {
    // In production, this would create an Airtable record
    // For now, navigate to a mock job result
    navigate('/job/job_001');
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">New Ad Job</h1>
          <p className="text-muted-foreground text-sm">
            Create a new ad brief and generate high-performance copy.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Avatar */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Avatar
            </Label>
            <Select
              value={formData.avatar}
              onValueChange={(value) => setFormData({ ...formData, avatar: value as typeof formData.avatar })}
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {avatarOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Symptom / Pain */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Symptom / Pain Point
            </Label>
            <Textarea
              placeholder="Describe the specific pain or symptom the avatar experiences..."
              value={formData.symptom}
              onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
              className="bg-card border-border min-h-[100px] resize-none"
            />
          </div>

          {/* Format / Ad Type */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Format / Ad Type
            </Label>
            <Select
              value={formData.format}
              onValueChange={(value) => setFormData({ ...formData, format: value as typeof formData.format })}
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {formatOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* StoryBrand Mode */}
          <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-md">
            <Checkbox
              id="storyBrandMode"
              checked={formData.storyBrandMode}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, storyBrandMode: checked as boolean })
              }
            />
            <div>
              <Label htmlFor="storyBrandMode" className="text-sm font-medium cursor-pointer">
                StoryBrand Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Generate additional narrative-driven variant
              </p>
            </div>
          </div>

          {/* Advanced Section */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full py-2">
                {advancedOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span className="font-medium">Advanced Options</span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Psychological Angle */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Psychological Angle
                  </Label>
                  <Select
                    value={formData.psychAngle || ''}
                    onValueChange={(value) =>
                      setFormData({ ...formData, psychAngle: value as typeof formData.psychAngle })
                    }
                  >
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {psychAngleOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Anti-Alternative Angle */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Anti-Alternative
                  </Label>
                  <Select
                    value={formData.antiAltAngle || ''}
                    onValueChange={(value) =>
                      setFormData({ ...formData, antiAltAngle: value as typeof formData.antiAltAngle })
                    }
                  >
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {antiAltOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Benefit Angle */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Benefit Angle
                  </Label>
                  <Select
                    value={formData.benefitAngle || ''}
                    onValueChange={(value) =>
                      setFormData({ ...formData, benefitAngle: value as typeof formData.benefitAngle })
                    }
                  >
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {benefitOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition Angle */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Condition Angle
                  </Label>
                  <Select
                    value={formData.conditionAngle || ''}
                    onValueChange={(value) =>
                      setFormData({ ...formData, conditionAngle: value as typeof formData.conditionAngle })
                    }
                  >
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {conditionOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Offer Guarantee */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Offer Guarantee Text
                </Label>
                <input
                  type="text"
                  value={formData.offerGuarantee}
                  onChange={(e) => setFormData({ ...formData, offerGuarantee: e.target.value })}
                  className="w-full h-10 px-3 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              variant="glow"
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={!formData.symptom.trim()}
            >
              <Zap className="w-4 h-4" />
              Generate Copy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
