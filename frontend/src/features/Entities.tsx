import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { api, type EntityType } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

/**
 * Entities page — lists every PII entity type the backend Presidio analyzer
 * supports. Consumed dynamically from `GET /entities` so adding a custom
 * recognizer on the backend automatically surfaces it here without a UI
 * release.
 */
export function EntitiesFeature() {
  const [entities, setEntities] = useState<EntityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .listEntities('en')
      .then((res) => {
        if (cancelled) return;
        setEntities(res.entities);
        setError(null);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        toast.error('Could not load entities', { description: e.message });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entities;
    return entities.filter(
      (e) =>
        e.type.toLowerCase().includes(q) ||
        e.label.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );
  }, [entities, query]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:tag-multiple-outline" className="h-5 w-5 text-brand-700 dark:text-brand-300" />
            Supported PII entities
          </CardTitle>
          <CardDescription>
            Pulled live from <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">GET /entities</code>.
            In a future release you'll be able to opt into a subset to make detection faster.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Icon
                icon="mdi:magnify"
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter entities…"
                className="pl-8"
              />
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {loading ? 'Loading…' : `${filtered.length} of ${entities.length}`}
            </span>
          </div>

          {error && !loading && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              <strong className="font-semibold">Failed to load.</strong> {error}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-3 py-2 font-semibold">Type</th>
                  <th className="px-3 py-2 font-semibold">Label</th>
                  <th className="px-3 py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-zinc-500">
                      <Icon icon="mdi:loading" className="mr-2 inline h-4 w-4 animate-spin" />
                      Loading entities…
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-zinc-500">
                      No entities match "{query}".
                    </td>
                  </tr>
                )}
                {!loading &&
                  filtered.map((e) => (
                    <tr
                      key={e.type}
                      className="border-t border-zinc-100 dark:border-zinc-900"
                    >
                      <td className="px-3 py-2 font-mono text-xs text-zinc-900 dark:text-zinc-100">
                        {e.type}
                      </td>
                      <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{e.label}</td>
                      <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">
                        {e.description || (
                          <span className="italic text-zinc-400">No description.</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
