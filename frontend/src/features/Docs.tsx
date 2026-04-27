import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CodeBlock } from '@/components/CodeBlock';

interface Endpoint {
  method: 'GET' | 'POST';
  path: string;
  summary: string;
  curl: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/health',
    summary: 'Liveness probe. Returns {"status":"ok"}.',
    curl: `curl http://localhost:8088/health`,
  },
  {
    method: 'POST',
    path: '/detect-pii-entities',
    summary: 'Detect PII spans in text without modifying it.',
    curl: `curl -X POST http://localhost:8088/detect-pii-entities \\
  -H 'Content-Type: application/json' \\
  -d '{"text":"Linda Adams, ITIN 880-69-4570"}'`,
  },
  {
    method: 'POST',
    path: '/anonymize-with-fake-data',
    summary: 'Replace PII with synthetic Faker values.',
    curl: `curl -X POST http://localhost:8088/anonymize-with-fake-data \\
  -H 'Content-Type: application/json' \\
  -d '{"text":"Adjuster Linda Adams","faker_seed":42}'`,
  },
  {
    method: 'POST',
    path: '/anonymize-and-transform',
    summary: 'Anonymize → call LLM → reverse-anonymize.',
    curl: `curl -X POST http://localhost:8088/anonymize-and-transform \\
  -H 'Content-Type: application/json' \\
  -d '{"text":"Linda Adams ITIN 880-69-4570","prompt_template":"Rewrite as ticket:\\n\\n{anonymized_text}","model":"gpt-3.5-turbo","temperature":0.2}'`,
  },
  {
    method: 'GET',
    path: '/prompts',
    summary: 'List prompt templates available on disk.',
    curl: `curl http://localhost:8088/prompts`,
  },
  {
    method: 'GET',
    path: '/prompts/{name}',
    summary: 'Fetch a single prompt template by file name.',
    curl: `curl http://localhost:8088/prompts/incident`,
  },
  {
    method: 'GET',
    path: '/entities',
    summary: 'List PII entity types the analyzer supports (live).',
    curl: `curl 'http://localhost:8088/entities?language=en'`,
  },
  {
    method: 'POST',
    path: '/convert',
    summary: 'Markitdown placeholder. Returns 501 unless ENABLE_CONVERT=true.',
    curl: `curl -X POST http://localhost:8088/convert`,
  },
];

const ENV_VARS: Array<{ name: string; default: string; purpose: string }> = [
  { name: 'OPENAI_API_KEY',  default: '(unset)',  purpose: 'Required only for the Enhance tab.' },
  { name: 'CORS_ORIGINS',    default: '*',         purpose: 'Comma-separated allowed origins.' },
  { name: 'ENABLE_CONVERT',  default: 'false',     purpose: 'Mounts the /convert placeholder route.' },
  { name: 'PROMPTS_DIR',     default: '/app/prompts', purpose: 'Folder scanned for prompt templates.' },
  { name: 'LOG_LEVEL',       default: 'INFO',      purpose: 'Python logging level.' },
  { name: 'PORT',            default: '8000',      purpose: 'Container listen port.' },
];

const methodStyle: Record<Endpoint['method'], string> = {
  GET:  'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800',
  POST: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800',
};

export function DocsFeature() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:api" className="h-5 w-5 text-brand-700 dark:text-brand-300" />
            HTTP API
          </CardTitle>
          <CardDescription>
            All endpoints are same-origin in production. Replace
            {' '}<code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">localhost:8088</code>{' '}
            with your deployed host.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ENDPOINTS.map((e) => (
            <div
              key={e.method + e.path}
              className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-[11px] font-mono font-semibold ring-1 ring-inset ${methodStyle[e.method]}`}
                >
                  {e.method}
                </span>
                <code className="font-mono text-sm text-zinc-900 dark:text-zinc-100">{e.path}</code>
              </div>
              <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">{e.summary}</p>
              <div className="mt-2">
                <CodeBlock code={e.curl} language="bash" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:cog-outline" className="h-5 w-5 text-brand-700 dark:text-brand-300" />
            Configuration
          </CardTitle>
          <CardDescription>
            Set via environment variables (see <code>docker-compose.yaml</code> or your shell).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                  <th className="px-3 py-2 font-semibold">Name</th>
                  <th className="px-3 py-2 font-semibold">Default</th>
                  <th className="px-3 py-2 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {ENV_VARS.map((v) => (
                  <tr key={v.name} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                    <td className="px-3 py-2 font-mono text-xs text-zinc-900 dark:text-zinc-100">{v.name}</td>
                    <td className="px-3 py-2 font-mono text-xs text-zinc-500">{v.default}</td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{v.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:folder-text-outline" className="h-5 w-5 text-brand-700 dark:text-brand-300" />
            Prompt templates
          </CardTitle>
          <CardDescription>
            Drop <code>.txt</code> or <code>.md</code> files into the folder pointed at by{' '}
            <code>PROMPTS_DIR</code> (default <code>/app/prompts</code> in Docker). They appear in the
            Enhance tab automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
          <p className="mb-2">In <code>docker-compose.yaml</code> mount your local folder read-only:</p>
          <CodeBlock
            language="yaml"
            code={`volumes:
  - ./prompts:/app/prompts:ro`}
          />
          <p className="mt-3">
            Each file's stem becomes its identifier. Use the literal token{' '}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{'{anonymized_text}'}</code>{' '}
            inside the file where the anonymized payload should be injected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
