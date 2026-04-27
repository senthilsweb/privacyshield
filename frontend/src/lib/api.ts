// Thin fetch wrapper around the Privacy Shield FastAPI backend.
// In production the SPA is served from the same origin, so VITE_API_URL is "".
// In dev, vite.config.ts proxies the known paths to http://localhost:8001.

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export interface PiiEntity {
  type: string;
  score: number;
  start: number;
  end: number;
  text: string;
}

export interface DetectResponse {
  processed_text: string;
  entities: PiiEntity[];
  message?: string;
}

export interface AnonymizeResponse {
  processed_text?: string;
  anonymized_text?: string;
  faked_text?: string;
  faked_processed_text?: string;
  entities?: PiiEntity[];
  message?: string;
}

export interface EnhanceResponse extends AnonymizeResponse {
  enhanced_text?: string;
  reverse_anonymized_text?: string;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

export interface PromptSummary {
  id: string;
  title: string;
  description?: string | null;
}

export interface PromptDetail extends PromptSummary {
  template: string;
}

export interface EntityType {
  type: string;
  label: string;
  description: string;
}

export interface EntitiesResponse {
  language: string;
  count: number;
  entities: EntityType[];
}

export const api = {
  detect: (text: string) =>
    post<DetectResponse>('/detect-pii-entities', { text }),

  anonymize: (text: string) =>
    post<AnonymizeResponse>('/anonymize-with-fake-data', {
      text,
      faker_seed: 42,
    }),

  enhance: (params: {
    text: string;
    prompt_template: string;
    model: string;
    temperature: number;
    openai_api_key?: string;
  }) => post<EnhanceResponse>('/anonymize-and-transform', params),

  listPrompts: () => get<PromptSummary[]>('/prompts'),
  getPrompt:   (id: string) => get<PromptDetail>(`/prompts/${encodeURIComponent(id)}`),

  listEntities: (language = 'en') =>
    get<EntitiesResponse>(`/entities?language=${encodeURIComponent(language)}`),
};
