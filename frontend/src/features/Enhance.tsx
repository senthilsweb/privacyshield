import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api, type EnhanceResponse, type PromptSummary } from '@/lib/api';
import { EmptyResult, FeatureLayout, OutputCard } from '@/components/Workspace';

// Fallback templates used only if the backend /prompts folder is empty
// or unavailable. The on-disk PROMPTS_DIR is the authoritative source.
const FALLBACK_PROMPTS: Array<{ id: string; title: string; template: string }> = [
  {
    id: 'incident',
    title: 'ServiceNow Incident',
    template: 'Rewrite this text into a ServiceNow Incident Ticket:\n\n{anonymized_text}',
  },
  {
    id: 'email',
    title: 'Professional Email',
    template: 'Transform this into a professional email:\n\n{anonymized_text}',
  },
  {
    id: 'summary',
    title: 'Executive Summary',
    template:
      'Write a 3-bullet executive summary of the following:\n\n{anonymized_text}',
  },
];

const MODELS = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'gpt-4o-mini',   name: 'GPT-4o mini' },
  { id: 'llama3.2',      name: 'LLaMA 3.2 (local)' },
];

const SAMPLE = `Adjuster: Linda Adams | License: ADJ-48361
Date: 02/05/2025
Claimant: Robert Martinez, born 09/28/1973, ITIN 880-69-4570.
Damage: Roof hail damage, $15,964.`;

export function EnhanceFeature() {
  const [text, setText] = useState(SAMPLE);
  const [prompts, setPrompts] = useState<PromptSummary[]>(
    () => FALLBACK_PROMPTS.map(({ id, title }) => ({ id, title }))
  );
  const [templateId, setTemplateId] = useState(FALLBACK_PROMPTS[0].id);
  const [template, setTemplate] = useState(FALLBACK_PROMPTS[0].template);
  const [model, setModel] = useState(MODELS[0].id);
  const [temperature, setTemperature] = useState(0.2);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<EnhanceResponse | null>(null);

  // Load prompt list from backend on mount; fall back silently on error.
  useEffect(() => {
    let cancelled = false;
    api.listPrompts()
      .then((list) => {
        if (cancelled || list.length === 0) return;
        setPrompts(list);
        const first = list[0];
        setTemplateId(first.id);
        api.getPrompt(first.id).then((p) => {
          if (!cancelled) setTemplate(p.template);
        }).catch(() => {});
      })
      .catch(() => {
        // Backend prompts endpoint unavailable — keep fallback list.
      });
    return () => { cancelled = true; };
  }, []);

  const onTemplateChange = async (id: string) => {
    setTemplateId(id);
    const fallback = FALLBACK_PROMPTS.find((p) => p.id === id);
    if (fallback) {
      setTemplate(fallback.template);
    }
    try {
      const detail = await api.getPrompt(id);
      setTemplate(detail.template);
    } catch {
      // already set fallback above
    }
  };

  const onSubmit = async () => {
    if (!text.trim()) return;
    if (!template.includes('{anonymized_text}')) {
      toast.error("Prompt must include '{anonymized_text}'");
      return;
    }
    setLoading(true);
    try {
      const r = await api.enhance({
        text,
        prompt_template: template,
        model,
        temperature,
      });
      setResp(r);
      toast.success('Enhanced with LLM');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setText(SAMPLE);
    const first = prompts[0] ?? FALLBACK_PROMPTS[0];
    setTemplateId(first.id);
    onTemplateChange(first.id);
    setModel(MODELS[0].id);
    setTemperature(0.2);
    setResp(null);
  };

  return (
    <FeatureLayout
      formPane={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="mdi:auto-fix" className="h-5 w-5 text-brand-700 dark:text-brand-300" />
              Enhance &amp; reverse-anonymize
            </CardTitle>
            <CardDescription>
              Anonymize → ask the LLM → reverse-anonymize. Sensitive values never leave your network.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="enh-text">Input text</Label>
              <Textarea
                id="enh-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                className="font-mono text-[13px]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Prompt template</Label>
                <Select value={templateId} onValueChange={onTemplateChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {prompts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>LLM model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="enh-prompt">Prompt</Label>
              <Textarea
                id="enh-prompt"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={4}
                className="font-mono text-[12px]"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Must include the literal token{' '}
                <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{'{anonymized_text}'}</code>.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="temp">Temperature ({temperature.toFixed(1)})</Label>
              <Input
                id="temp"
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="h-2 cursor-pointer p-0 accent-brand-700"
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
                {loading ? 'Enhancing…' : 'Enhance'}
              </Button>
            </div>
          </CardContent>
        </Card>
      }
      resultPane={
        !resp ? (
          <EmptyResult
            icon="mdi:auto-fix"
            title="Awaiting input"
            description="Configure the prompt and click 'Enhance'. You'll see the anonymized text, the LLM result, and the reverse-anonymized version."
          />
        ) : (
          <div className="space-y-4">
            {resp.anonymized_text && (
              <OutputCard
                title="Anonymized"
                subtitle="What the LLM actually sees"
                text={resp.anonymized_text}
                highlightPlaceholders={false}
              />
            )}
            {resp.faked_processed_text && !resp.anonymized_text && (
              <OutputCard
                title="Anonymized"
                subtitle="What the LLM actually sees"
                text={resp.faked_processed_text}
                highlightPlaceholders={false}
              />
            )}
            {typeof resp.enhanced_text === 'string' && (
              <OutputCard
                title="LLM enhanced"
                subtitle="Model output (still anonymized)"
                text={resp.enhanced_text}
                highlightPlaceholders={false}
              />
            )}
            {typeof resp.reverse_anonymized_text === 'string' && (
              <OutputCard
                title="Reverse-anonymized"
                subtitle="Original PII restored"
                text={resp.reverse_anonymized_text}
                highlightPlaceholders={false}
              />
            )}
            {resp.processed_text && (
              <OutputCard
                title="Processed text"
                subtitle="Raw response"
                text={resp.processed_text}
              />
            )}
          </div>
        )
      }
    />
  );
}
