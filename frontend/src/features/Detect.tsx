import { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api, type PiiEntity } from '@/lib/api';
import {
  EntityList,
  EmptyResult,
  FeatureLayout,
  OutputCard,
} from '@/components/Workspace';

const SAMPLE = `Robert Martinez, born 09/28/1973, ITIN 880-69-4570.
Address: 2616 Maple Avenue, Austin, TX 78701.
Adjuster: Linda Adams | License: ADJ-48361
Phone: 847-96-5773 | Email: linda.adams@example.com`;

export function DetectFeature() {
  const [text, setText] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [processed, setProcessed] = useState<string | null>(null);
  const [entities, setEntities] = useState<PiiEntity[]>([]);

  const onSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const r = await api.detect(text);
      setProcessed(r.processed_text);
      setEntities(r.entities);
      toast.success(`Detected ${r.entities.length} entit${r.entities.length === 1 ? 'y' : 'ies'}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setText(SAMPLE);
    setProcessed(null);
    setEntities([]);
  };

  return (
    <FeatureLayout
      formPane={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="mdi:shield-search-outline" className="h-5 w-5 text-brand-700 dark:text-brand-300" />
              Detect PII entities
            </CardTitle>
            <CardDescription>
              Identify personal data in free text without modifying it. Uses Microsoft Presidio under the hood.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="detect-text">Input text</Label>
              <Textarea
                id="detect-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                className="font-mono text-[13px]"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={onReset} disabled={loading}>
                <Icon icon="mdi:refresh" className="h-4 w-4" />
                Reset
              </Button>
              <Button onClick={onSubmit} disabled={loading || !text.trim()}>
                {loading ? (
                  <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon icon="mdi:rocket-launch-outline" className="h-4 w-4" />
                )}
                {loading ? 'Detecting…' : 'Detect entities'}
              </Button>
            </div>
          </CardContent>
        </Card>
      }
      resultPane={
        processed === null ? (
          <EmptyResult
            icon="mdi:shield-search-outline"
            title="Awaiting input"
            description="Enter text on the left and click 'Detect entities' to see PII spans, types, and confidence scores."
          />
        ) : (
          <div className="space-y-4">
            <OutputCard title="Detected text" subtitle="PII replaced with type placeholders" text={processed} />
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Entities</CardTitle>
                <CardDescription>{entities.length} item{entities.length === 1 ? '' : 's'}</CardDescription>
              </CardHeader>
              <CardContent>
                <EntityList entities={entities} />
              </CardContent>
            </Card>
          </div>
        )
      }
    />
  );
}
