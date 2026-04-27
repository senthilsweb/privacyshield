import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Toaster } from 'sonner';
import { Sidebar, type TabKey } from '@/components/Sidebar';
import { DetectFeature } from '@/features/Detect';
import { AnonymizeFeature } from '@/features/Anonymize';
import { EnhanceFeature } from '@/features/Enhance';
import { ConvertFeature } from '@/features/Convert';
import { DocsFeature } from '@/features/Docs';
import { EntitiesFeature } from '@/features/Entities';
import { cn } from '@/lib/utils';

const SHOW_CONVERT = import.meta.env.VITE_FEATURE_CONVERT === 'true';

interface PageMeta {
  title: string;
  subtitle: string;
  icon: string;
}

const PAGES: Record<TabKey, PageMeta> = {
  detect:    { title: 'Detect',    subtitle: 'Find PII spans in free text',                  icon: 'mdi:shield-search-outline' },
  anonymize: { title: 'Anonymize', subtitle: 'Replace PII with synthetic Faker data',        icon: 'mdi:incognito' },
  enhance:   { title: 'Enhance',   subtitle: 'LLM rewrite with reverse-anonymization',       icon: 'mdi:auto-fix' },
  convert:   { title: 'Convert',   subtitle: 'Document → Markdown via Markitdown (preview)', icon: 'mdi:file-document-arrow-right-outline' },
  entities:  { title: 'Entities',  subtitle: 'PII types supported by the analyzer',          icon: 'mdi:tag-multiple-outline' },
  docs:      { title: 'API Docs',  subtitle: 'Endpoints, configuration & prompt templates',  icon: 'mdi:book-open-page-variant-outline' },
};

function getInitialTab(): TabKey {
  const hash = window.location.hash.replace('#', '') as TabKey;
  if (['detect', 'anonymize', 'enhance', 'convert', 'entities', 'docs'].includes(hash)) return hash;
  return 'detect';
}

export default function App() {
  const [tab, setTab] = useState<TabKey>(getInitialTab);
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem('ps:sidebar-collapsed') === '1'
  );

  useEffect(() => {
    window.location.hash = tab;
  }, [tab]);

  useEffect(() => {
    localStorage.setItem('ps:sidebar-collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  const page = PAGES[tab];

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar active={tab} onSelect={setTab} collapsed={collapsed} />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 transition-colors',
              'hover:bg-zinc-100 hover:text-zinc-900 focus-ring',
              'dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
            )}
          >
            <Icon icon="mdi:menu" className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <Icon
              icon={page.icon}
              className="h-5 w-5 shrink-0 text-brand-700 dark:text-brand-300"
            />
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {page.title}
              </h1>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {page.subtitle}
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="hidden md:inline">Local — no data leaves your machine</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Online
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {tab === 'detect'    && <DetectFeature />}
          {tab === 'anonymize' && <AnonymizeFeature />}
          {tab === 'enhance'   && <EnhanceFeature />}
          {tab === 'entities'  && <EntitiesFeature />}
          {tab === 'docs'      && <DocsFeature />}
          {tab === 'convert' && SHOW_CONVERT && <ConvertFeature />}
        </div>
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
