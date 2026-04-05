'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Image as ImageIcon, LoaderCircle, Play, Sparkles } from 'lucide-react';

type ProviderKey = 'deepseek' | 'qwen' | 'ollama';
type PromptKey = 'compare' | 'vision' | 'batch';

const providers: { key: ProviderKey; label: string; note: string }[] = [
  { key: 'deepseek', label: 'DeepSeek', note: 'Hosted reasoning and multimodal workflows' },
  { key: 'qwen', label: 'Qwen', note: 'General-purpose hosted model orchestration' },
  { key: 'ollama', label: 'Ollama', note: 'Local runtime for self-hosted experiments' },
];

const prompts: {
  key: PromptKey;
  title: string;
  preview: string;
  vision?: boolean;
}[] = [
  {
    key: 'compare',
    title: 'Provider Comparison',
    preview: 'Compare DeepSeek and Qwen for document-grounded support workflows and summarize when I should switch models.',
  },
  {
    key: 'vision',
    title: 'Vision Workflow',
    preview: 'I uploaded a dashboard screenshot. Explain the KPI trends and suggest three follow-up questions for a sales operator.',
    vision: true,
  },
  {
    key: 'batch',
    title: 'Batch Inference',
    preview: 'Create a reusable batch prompt for classifying 20 support tickets into billing, product bug, or account access.',
  },
];

const responses: Record<ProviderKey, Record<PromptKey, string[]>> = {
  deepseek: {
    compare: [
      'Streaming response opened.',
      ' DeepSeek is better when you need longer reasoning traces and more explicit explanation flow.',
      ' Qwen is often a better default for lighter latency-sensitive support interactions.',
      ' A shared adapter layer matters because the operator should not relearn the UI each time the backend changes.',
    ],
    vision: [
      'Image attachment detected.',
      ' The revenue KPI is trending up while conversion appears flat, suggesting pipeline growth without corresponding close-rate lift.',
      ' Suggested follow-ups: identify channel mix changes, inspect regional variance, and compare lead quality before/after the campaign.',
    ],
    batch: [
      'Queued preview batch prompt.',
      ' The workflow should normalize categories, define confidence thresholds, and capture ambiguous tickets for human review.',
      ' This is where batch inference becomes more useful than one-off chat because the operator can reuse the same task framing.',
    ],
  },
  qwen: {
    compare: [
      'Streaming response opened.',
      ' Qwen can be positioned as a strong default for broad assistant workflows where you want stable general responses.',
      ' DeepSeek becomes more attractive when you want more explicit step-by-step reasoning or specialized task behavior.',
      ' A unified studio lets teams compare outputs without rebuilding frontend state, auth, or session handling.',
    ],
    vision: [
      'Image attachment detected.',
      ' The uploaded dashboard shows a strong top-of-funnel spike with weaker movement in later-stage conversion metrics.',
      ' Good next questions: which segment changed most, whether this is seasonality, and whether lead scoring needs recalibration.',
    ],
    batch: [
      'Queued preview batch prompt.',
      ' For batch ticket triage, define category rules and return both label and rationale fields for review.',
      ' The product value is not only the model answer; it is the reusable workflow around repeated inference tasks.',
    ],
  },
  ollama: {
    compare: [
      'Streaming response opened.',
      ' A local runtime is useful when privacy, cost control, or offline experimentation matters more than maximum hosted capability.',
      ' The platform value here is that hosted and self-hosted models share the same operator surface.',
      ' This makes switching safer for demos, internal pilots, and controlled deployment environments.',
    ],
    vision: [
      'Image attachment simulated.',
      ' Local multimodal support is more constrained, but the workflow remains the same: attach input, keep the session, stream the result.',
      ' That consistency is what makes the studio feel productized rather than experimental.',
    ],
    batch: [
      'Queued preview batch prompt.',
      ' Local batch mode is helpful for repeatable internal tasks where data should stay within a controlled environment.',
      ' The queue and background-task layer matter because repeated runs should not block the main chat interaction.',
    ],
  },
};

export default function MultiModelStudioPreview() {
  const [provider, setProvider] = useState<ProviderKey>('deepseek');
  const [prompt, setPrompt] = useState<PromptKey>('compare');
  const [input, setInput] = useState(prompts[0].preview);
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState('');

  const currentPrompt = useMemo(
    () => prompts.find((item) => item.key === prompt) ?? prompts[0],
    [prompt]
  );

  useEffect(() => {
    setInput(currentPrompt.preview);
  }, [currentPrompt]);

  useEffect(() => {
    if (!running) return;

    const segments = responses[provider][prompt];
    let cancelled = false;
    setResponse('');

    const play = async () => {
      for (const segment of segments) {
        await new Promise((resolve) => window.setTimeout(resolve, 520));
        if (cancelled) return;
        setResponse((prev) => prev + segment);
      }

      if (!cancelled) {
        setRunning(false);
      }
    };

    void play();

    return () => {
      cancelled = true;
    };
  }, [prompt, provider, running]);

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(127,188,140,0.12),rgba(212,165,116,0.08))] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/20 bg-[var(--color-green-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-green-300)]">
              <Sparkles className="h-3.5 w-3.5" />
              Interactive Preview
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
              Try the product flow
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              This is a guided preview embedded in the portfolio site. It simulates provider switching,
              multimodal input, and streaming response behavior so visitors can feel how the studio works
              before trying a full deployment.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRunning(true)}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? 'Running preview' : 'Run preview'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Model provider
            </p>
            <div className="flex flex-wrap gap-2">
              {providers.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setProvider(item.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    provider === item.key
                      ? 'border-[var(--color-green-300)]/40 bg-[var(--color-green-300)]/14 text-[var(--color-green-300)]'
                      : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              {providers.find((item) => item.key === provider)?.note}
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Preset workflow
            </p>
            <div className="grid gap-2 md:grid-cols-3">
              {prompts.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPrompt(item.key)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    prompt === item.key
                      ? 'border-[var(--color-amber-300)]/35 bg-[var(--color-amber-300)]/12'
                      : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/50 hover:border-[var(--color-border-hover)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {item.title}
                    </span>
                    {item.vision && <ImageIcon className="h-4 w-4 text-[var(--color-amber-300)]" />}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                    {item.preview}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Prompt input
              </p>
              <span className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {currentPrompt.vision ? 'Multimodal mode' : 'Text mode'}
              </span>
            </div>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-h-[150px] w-full resize-none rounded-2xl border border-[var(--color-border-default)] bg-transparent px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)] outline-none transition-colors focus:border-[var(--color-green-300)]/35"
            />
          </div>
        </div>

        <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Preview output
              </p>
              <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
                Streaming session
              </h4>
            </div>
            <div className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
              {provider}
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-[var(--color-border-default)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4">
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-green-300)]" />
              adapter connected
            </div>
            <div className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-4 text-sm leading-7 text-[var(--color-text-secondary)] min-h-[240px]">
              {response || 'Choose a provider, pick a workflow, and run the preview to watch a simulated streaming response.'}
              {running && <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-[var(--color-green-300)]/70 align-middle" />}
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border-default)] px-4 py-3">
              <span className="text-sm text-[var(--color-text-secondary)]">Session history retained</span>
              <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)]" />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border-default)] px-4 py-3">
              <span className="text-sm text-[var(--color-text-secondary)]">Streaming response pipeline</span>
              <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)]" />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border-default)] px-4 py-3">
              <span className="text-sm text-[var(--color-text-secondary)]">Reusable batch-oriented workflow</span>
              <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
