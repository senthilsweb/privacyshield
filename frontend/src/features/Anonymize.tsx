import { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api, type AnonymizeResponse } from '@/lib/api';
import { EmptyResult, FeatureLayout, OutputCard } from '@/components/Workspace';

const SAMPLE = `Slim Shady recently lost his wallet.
Inside is some cash and his credit card with the number 4916 0387 9536 0861.
If you would find it, please call at 313-666-7440 or write an email here: real.slim.shady@gmail.com.`;

export function AnonymizeFeature() {
  const [text, setText] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<AnonymizeResponse | null>(null);

  const onSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const r = await api.anonymize(text);
      setResp(r);
      toast.success('Anonymized with synthetic data');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setText(SAMPLE);
    setResp(null);
  };

  return (
    <FeatureLayout
      formPane={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="mdi:incognito" className="h-5 w-5 text-brand-700 dark:text-brand-300" />
              Anonymize with fake data
            </CardTitle>
            <CardDescription>
              Replace detected PII with realistic synthetic values. Output is safe to share, log, or
              feed to LLMs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="anon-text">Input text</Label>
              <Textarea
                id="anon-text"
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
                {loading ? 'Anonymizing…' : 'Anonymize'}
              </Button>
            </div>
          </CardContent>
        </Card>
      }
      resultPane={
        !resp ? (
          <EmptyResult
            icon="mdi:incognito"
            title="Awaiting input"
            description="Submit text on the left to see the anonymized output and the placeholder mapping."
          />
        ) : (
          <div className="space-y-4">
            {resp.processed_text && (
              <OutputCard
                title="Placeholder text"
                subtitle="PII replaced with type tags"
                text={resp.processed_text}
              />
            )}
            {resp.anonymized_text && (
              <OutputCard
                title="Anonymized text"
                subtitle="Ready to share or send to an LLM"
                text={resp.anonymized_text}
                highlightPlaceholders={false}
              />
            )}
            {resp.faked_text && (
              <OutputCard
                title="Faked text"
                subtitle="Realistic synthetic substitutions"
                text={resp.faked_text}
                highlightPlaceholders={false}
              />
            )}
          </div>
        )
      }
    />
  );
}
