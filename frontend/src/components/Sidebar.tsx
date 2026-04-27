import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

export type TabKey = 'detect' | 'anonymize' | 'enhance' | 'convert' | 'entities' | 'docs';

interface NavItem {
  key: TabKey;
  label: string;
  icon: string;
  hint?: string;
  comingSoon?: boolean;
}

const NAV: NavItem[] = [
  { key: 'detect',    label: 'Detect',    icon: 'mdi:shield-search-outline', hint: 'Find PII in text' },
  { key: 'anonymize', label: 'Anonymize', icon: 'mdi:incognito',             hint: 'Replace with fake data' },
  { key: 'enhance',   label: 'Enhance',   icon: 'mdi:auto-fix',              hint: 'LLM + reverse-anonymize' },
];

const CONVERT_ITEM: NavItem = {
  key: 'convert',
  label: 'Convert',
  icon: 'mdi:file-document-arrow-right-outline',
  hint: 'Markdown via Markitdown',
  comingSoon: true,
};

const DOCS_ITEM: NavItem = {
  key: 'docs',
  label: 'API Docs',
  icon: 'mdi:book-open-page-variant-outline',
  hint: 'Endpoints & curl recipes',
};

const ENTITIES_ITEM: NavItem = {
  key: 'entities',
  label: 'Entities',
  icon: 'mdi:tag-multiple-outline',
  hint: 'Supported PII types',
};

export interface SidebarProps {
  active: TabKey;
  onSelect: (key: TabKey) => void;
  collapsed: boolean;
}

export function Sidebar({ active, onSelect, collapsed }: SidebarProps) {
  const showConvert = import.meta.env.VITE_FEATURE_CONVERT === 'true';
  const items = showConvert ? [...NAV, CONVERT_ITEM] : NAV;

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col border-r border-brand-900/30 bg-brand-700 text-brand-50 transition-[width] duration-200 ease-out lg:flex',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className={cn('flex h-16 items-center', collapsed ? 'justify-center px-0' : 'gap-2.5 px-5')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-800/50">
          <Icon icon="mdi:shield-lock-outline" className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-white">Privacy Shield</span>
            <span className="text-[11px] text-brand-200">PII protection</span>
          </div>
        )}
      </div>

      <nav className="mt-2 flex-1 px-2">
        {!collapsed && (
          <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
            Workflow
          </p>
        )}
        <ul className="space-y-1">
          {items.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              active={active === item.key}
              collapsed={collapsed}
              onSelect={onSelect}
            />
          ))}
        </ul>

        {!collapsed && (
          <p className="px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
            Reference
          </p>
        )}
        <ul className="space-y-1">
          <NavButton
            item={ENTITIES_ITEM}
            active={active === 'entities'}
            collapsed={collapsed}
            onSelect={onSelect}
          />
          <NavButton
            item={DOCS_ITEM}
            active={active === 'docs'}
            collapsed={collapsed}
            onSelect={onSelect}
          />
        </ul>
      </nav>

      <div className="border-t border-brand-900/40 p-2">
        <a
          href="https://github.com/senthilsweb/privacyshield"
          target="_blank"
          rel="noreferrer"
          title="GitHub"
          className={cn(
            'flex items-center rounded-lg text-sm text-brand-100 hover:bg-brand-800/60 hover:text-white',
            collapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
          )}
        >
          <Icon icon="mdi:github" className="h-5 w-5 shrink-0" />
          {!collapsed && <span>GitHub</span>}
        </a>
      </div>
    </aside>
  );
}

interface NavButtonProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onSelect: (key: TabKey) => void;
}

function NavButton({ item, active, collapsed, onSelect }: NavButtonProps) {
  const isDisabled = item.comingSoon;
  return (
    <li>
      <button
        type="button"
        onClick={() => !isDisabled && onSelect(item.key)}
        disabled={isDisabled}
        title={collapsed ? item.label : undefined}
        className={cn(
          'group flex w-full items-center rounded-lg text-sm font-medium transition-colors focus-ring',
          collapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2',
          active
            ? 'bg-brand-800 text-white shadow-sm'
            : 'text-brand-100 hover:bg-brand-800/60 hover:text-white',
          isDisabled && 'cursor-not-allowed opacity-60 hover:bg-transparent hover:text-brand-100'
        )}
      >
        <Icon icon={item.icon} className="h-5 w-5 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {item.comingSoon && (
              <span className="rounded-full bg-brand-900/60 px-1.5 py-0.5 text-[10px] text-brand-200">
                soon
              </span>
            )}
          </>
        )}
      </button>
    </li>
  );
}
