import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { styleFor } from '@/lib/entity-styles';
import type { PiiEntity } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface OutputCardProps {
  title: string;
  subtitle?: string;
  text: string;
  entities?: PiiEntity[];
  /** When true, render <PLACEHOLDERS> as colored pills based on entity type. */
  highlightPlaceholders?: boolean;
  className?: string;
}

const PLACEHOLDER_RE = /<([A-Z_]+)>/g;

export function OutputCard({
  title,
  subtitle,
  text,
  highlightPlaceholders = true,
  className,
}: OutputCardProps) {
  const rendered = useMemo(() => {
    if (!highlightPlaceholders) return [text];
    const parts = text.split(PLACEHOLDER_RE);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        const style = styleFor(part);
        return (
          <span
            key={i}
            className={cn(
              'mx-0.5 inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
              style.bg,
              style.text,
              style.ring
            )}
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }, [text, highlightPlaceholders]);

  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900',
        className
      )}
    >
      <header className="flex items-center justify-between border-b border-zinc-200/70 px-4 py-3 dark:border-zinc-800/70">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy">
          <Icon icon={copied ? 'mdi:check' : 'mdi:content-copy'} className="h-4 w-4" />
        </Button>
      </header>
      <div className="prose prose-sm max-w-none whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-relaxed text-zinc-800 dark:prose-invert dark:text-zinc-200">
        {rendered}
      </div>
    </div>
  );
}

export interface EntityListProps {
  entities: PiiEntity[];
}

export function EntityList({ entities }: EntityListProps) {
  if (!entities || entities.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-200 p-4 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        No entities detected.
      </p>
    );
  }

  // group counts per type
  const counts = entities.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});
  const types = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {types.map(([type, count]) => {
          const s = styleFor(type);
          return (
            <span
              key={type}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                s.bg,
                s.text,
                s.ring
              )}
            >
              {type}
              <span className="rounded-full bg-white/70 px-1.5 text-[10px] font-bold text-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-200">
                {count}
              </span>
            </span>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Type</th>
              <th className="px-3 py-2 text-left font-semibold">Text</th>
              <th className="px-3 py-2 text-right font-semibold">Score</th>
              <th className="px-3 py-2 text-right font-semibold">Span</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-900 dark:bg-zinc-950">
            {entities.map((e, i) => {
              const s = styleFor(e.type);
              return (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                        s.bg,
                        s.text,
                        s.ring
                      )}
                    >
                      {e.type}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{e.text}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{e.score.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-zinc-500">
                    {e.start}–{e.end}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export interface FeatureLayoutProps {
  formPane: React.ReactNode;
  resultPane: React.ReactNode;
}

export function FeatureLayout({ formPane, resultPane }: FeatureLayoutProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">{formPane}</div>
      <div className="space-y-4">{resultPane}</div>
    </div>
  );
}

export function EmptyResult({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
        <Icon icon={icon} className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
}
