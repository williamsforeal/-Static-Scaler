import { Download, ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GenerateStatus } from '@/types/scaler';

interface VariantCardProps {
  label: string;
  sublabel: string;
  prompt: string | null;
  imageUrl: string | null;
  status: GenerateStatus | null;
  onDownload?: () => void;
}

const statusStyles: Record<GenerateStatus, string> = {
  Ready: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Running: 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse-status',
  Done: 'bg-green-500/20 text-green-400 border-green-500/30',
  Error: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function VariantCard({
  label,
  sublabel,
  prompt,
  imageUrl,
  status,
  onDownload,
}: VariantCardProps) {
  const handleDownload = async () => {
    if (!imageUrl || !onDownload) return;
    onDownload();
  };

  const downloadImage = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${label.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground ml-1.5">{sublabel}</span>
          </div>
          {status && (
            <span
              className={cn(
                'px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border',
                statusStyles[status]
              )}
            >
              {status}
            </span>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="aspect-square bg-muted/20 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {status === 'Running' ? (
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            ) : (
              <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
            )}
          </div>
        )}
      </div>

      {/* Prompt snippet */}
      {prompt && (
        <div className="px-3 py-2 border-t border-border">
          <p className="text-xs text-muted-foreground line-clamp-2">{prompt}</p>
        </div>
      )}

      {/* Download button */}
      {imageUrl && (
        <button
          onClick={downloadImage}
          className="flex items-center justify-center gap-1.5 px-3 py-2 border-t border-border text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
      )}
    </div>
  );
}
