import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Star, RefreshCw, Lock, Wand2, Layers, ExternalLink, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockJobs, mockCopyOutputs, mockAssets } from '@/data/mockData';
import type { Hook, Asset } from '@/types/scaler';
import { toast } from '@/hooks/use-toast';

export default function JobResults() {
  const { jobId } = useParams();
  const job = mockJobs.find((j) => j.id === jobId) || mockJobs[0];
  const copyOutput = job.copyOutputId ? mockCopyOutputs[job.copyOutputId] : null;
  const assets = mockAssets.filter((a) => a.jobId === job.id);

  const [hooks, setHooks] = useState<Hook[]>(copyOutput?.hooks || []);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard', duration: 1500 });
  };

  const toggleWinner = (hookId: string) => {
    setHooks(hooks.map((h) => ({ ...h, isWinner: h.id === hookId })));
  };

  const handleGenerateCreatives = () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => setIsGenerating(false), 3000);
  };

  // Split assets by variant type for StoryBrand display
  const directResponseAssets = assets.filter((a) => a.variantType === 'Direct Response');
  const storyBrandAssets = assets.filter((a) => a.variantType === 'StoryBrand');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-lg font-semibold text-foreground">{job.avatar}</h1>
                <StatusBadge status={job.status} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono">{job.format}</span>
                {job.storyBrandMode && (
                  <Badge variant="secondary" className="text-[10px]">
                    StoryBrand
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8">
        {/* SECTION A — HOOK STACK */}
        {copyOutput && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-header mb-0">Hook Stack</h2>
              <div className="flex gap-2">
                <Button variant="operator" size="xs">
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </Button>
                <Button variant="operator" size="xs">
                  <Lock className="w-3 h-3" />
                  Lock Copy
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {hooks.map((hook) => (
                <HookCard
                  key={hook.id}
                  hook={hook}
                  onCopy={() => handleCopy(hook.text)}
                  onToggleWinner={() => toggleWinner(hook.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* SECTION B — PRIMARY TEXT VARIANTS */}
        {copyOutput && (
          <section>
            <h2 className="section-header">Primary Text Variants</h2>
            <div className="space-y-3">
              {copyOutput.primaryTextVariants.map((text, idx) => (
                <div
                  key={idx}
                  className="card-compact group relative"
                >
                  <p className="text-sm text-foreground/90 leading-relaxed pr-10">
                    {text}
                  </p>
                  <button
                    onClick={() => handleCopy(text)}
                    className="absolute top-3 right-3 p-1.5 rounded bg-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
                  >
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION C — VISUAL DIRECTION */}
        {copyOutput && (
          <section>
            <h2 className="section-header">Visual Direction</h2>
            <div className="card-compact space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">Style</span>
                  <p className="text-foreground mt-1">{copyOutput.visualDirection.style}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">Context</span>
                  <p className="text-foreground mt-1">{copyOutput.visualDirection.context}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">Color / Tone</span>
                  <p className="text-foreground mt-1">{copyOutput.visualDirection.colorTone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">Camera Framing</span>
                  <p className="text-foreground mt-1">{copyOutput.visualDirection.cameraFraming}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex flex-wrap gap-2 mb-3">
                  {copyOutput.beliefs.map((belief, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {belief}
                    </Badge>
                  ))}
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-md px-4 py-3">
                  <span className="text-xs text-primary/70 uppercase tracking-wider">Mechanism Phrase</span>
                  <p className="text-lg font-semibold text-primary mt-1">
                    {copyOutput.mechanismPhrase}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION D — CREATIVE ACTIONS */}
        <section>
          <h2 className="section-header">Creative Actions</h2>
          <div className="flex gap-3">
            <Button
              variant="glow"
              onClick={handleGenerateCreatives}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              Generate Creatives
            </Button>
            <Button variant="operator">
              <Layers className="w-4 h-4" />
              Generate Variants
            </Button>
          </div>
        </section>

        {/* SECTION E — STATIC AD IMAGE GALLERY */}
        {assets.length > 0 && (
          <section>
            <h2 className="section-header">Static Ad Images</h2>
            {job.storyBrandMode ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Direct Response
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {directResponseAssets.map((asset) => (
                      <AssetCard key={asset.id} asset={asset} />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    StoryBrand
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {storyBrandAssets.map((asset) => (
                      <AssetCard key={asset.id} asset={asset} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {assets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Rendering State */}
        {job.status === 'RENDERING' && (
          <section className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Generating creatives...</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Polling every 3 seconds
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

// Hook Card Component
function HookCard({
  hook,
  onCopy,
  onToggleWinner,
}: {
  hook: Hook;
  onCopy: () => void;
  onToggleWinner: () => void;
}) {
  return (
    <div
      className={`card-compact group relative ${
        hook.isWinner ? 'ring-1 ring-primary bg-primary/5' : ''
      }`}
    >
      <p className="text-sm text-foreground/90 leading-snug pr-16 font-medium">
        {hook.text}
      </p>
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          onClick={onCopy}
          className="p-1.5 rounded bg-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
        >
          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button
          onClick={onToggleWinner}
          className={`p-1.5 rounded transition-all ${
            hook.isWinner
              ? 'bg-primary/20 text-primary'
              : 'bg-secondary/50 opacity-0 group-hover:opacity-100 hover:bg-secondary text-muted-foreground'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${hook.isWinner ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
}

// Asset Card Component
function AssetCard({ asset }: { asset: Asset }) {
  return (
    <div className="card-compact group overflow-hidden p-0">
      <div className="aspect-square relative bg-muted">
        <img
          src={asset.imageUrl}
          alt={`${asset.variantType} ${asset.format}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-[10px] bg-black/50 border-0">
              {asset.ratio}
            </Badge>
          </div>
          <div className="flex gap-1">
            <button className="p-1.5 rounded bg-black/50 hover:bg-black/70 transition-colors">
              <ExternalLink className="w-3 h-3 text-white" />
            </button>
            <button className="p-1.5 rounded bg-black/50 hover:bg-black/70 transition-colors">
              <Download className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
