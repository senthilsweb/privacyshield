import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function ConvertFeature() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="mdi:file-document-arrow-right-outline" className="h-5 w-5 text-brand-700 dark:text-brand-300" />
          Convert (coming soon)
        </CardTitle>
        <CardDescription>
          Upload a PDF, DOCX, PPTX, or HTML file and convert it to clean Markdown using{' '}
          <a
            href="https://github.com/microsoft/markitdown"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-brand-700 dark:hover:text-brand-300"
          >
            Microsoft Markitdown
          </a>
          . The Markdown can then be piped directly into <strong>Detect</strong>, <strong>Anonymize</strong>, or <strong>Enhance</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <Icon icon="mdi:tools" className="mx-auto h-8 w-8 text-zinc-400" />
          <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            This feature is reserved for an upcoming release.
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Set <code>VITE_FEATURE_CONVERT=true</code> at build time and{' '}
            <code>ENABLE_CONVERT=true</code> on the backend to expose the placeholder route.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
