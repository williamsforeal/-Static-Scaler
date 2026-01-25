import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CopySectionProps {
  title: string;
  content: string | null;
  className?: string;
}

export function CopySection({ title, content, className }: CopySectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!content) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h4>
        </div>
        <p className="text-sm text-muted-foreground/50 italic">Not generated yet</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-accent/10 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
}
