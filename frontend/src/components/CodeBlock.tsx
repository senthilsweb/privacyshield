import { Highlight, themes } from 'prism-react-renderer';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  /** Show the language pill in the header. Defaults to true. */
  showLanguage?: boolean;
  /** Optional className applied to the outer wrapper. */
  className?: string;
}

/**
 * Dark code block with Prism syntax highlighting and a copy button.
 * Mirrors the templrgo docs aesthetic: grey header strip with the language
 * label, then the highlighted body.
 */
export function CodeBlock({
  code,
  language = 'bash',
  showLanguage = true,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* noop — clipboard may be unavailable in insecure contexts */
    }
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-zinc-800 bg-[#1e1e2e] text-[12px]',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-zinc-800 bg-[#181826] px-3 py-1.5">
        {showLanguage ? (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            {language}
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          title="Copy"
        >
          <Icon icon={copied ? 'mdi:check' : 'mdi:content-copy'} className="h-3.5 w-3.5" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <Highlight code={code.trimEnd()} language={language} theme={themes.vsDark}>
        {({ className: cls, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(cls, 'overflow-x-auto px-4 py-3 leading-relaxed')}
            style={{ ...style, background: 'transparent' }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, j) => (
                  <span key={j} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
