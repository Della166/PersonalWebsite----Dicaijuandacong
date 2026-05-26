'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  FileText,
  GitBranch,
  LoaderCircle,
  Play,
  Quote,
  Search,
  Sparkles,
} from 'lucide-react';

type StageKey = 'idle' | 'intent' | 'decompose' | 'research' | 'accumulate' | 'report' | 'complete';

interface Finding {
  sid: number;
  claim: string;
  quote: string;
  confidence: 'high' | 'medium' | 'low';
}

interface Subtopic {
  title: string;
  query: string;
  findings: Finding[];
}

interface Source {
  sid: number;
  title: string;
  domain: string;
}

const topic = '当前主流的大模型对齐（alignment）方法有哪些？';
const mainIntent = '梳理当前 LLM 对齐的主流技术路线及其权衡';
const keyDimensions = ['RLHF / 偏好优化', '无奖励模型的对齐（DPO 类）', '可验证奖励的 RL（RLVR）'];

const subtopics: Subtopic[] = [
  {
    title: 'RLHF 与偏好优化',
    query: 'RLHF reward model PPO LLM alignment 2025',
    findings: [
      { sid: 1, claim: 'RLHF 用人类偏好训练奖励模型，再用 PPO 优化策略', quote: '“train a reward model from human comparisons, then optimize the policy with PPO”', confidence: 'high' },
      { sid: 2, claim: 'PPO 路线需要独立 critic，工程复杂度高', quote: '“requires a separately trained value network”', confidence: 'medium' },
    ],
  },
  {
    title: '无奖励模型的对齐',
    query: 'DPO direct preference optimization vs RLHF',
    findings: [
      { sid: 3, claim: 'DPO 直接用偏好对优化，省去显式奖励模型', quote: '“optimizes the policy directly from preference pairs without a reward model”', confidence: 'high' },
    ],
  },
  {
    title: '可验证奖励的 RL',
    query: 'RLVR GRPO verifiable reward reasoning DeepSeek',
    findings: [
      { sid: 4, claim: 'GRPO 用组内相对优势替代 critic，适合可验证任务', quote: '“group-relative advantage replaces the value network”', confidence: 'high' },
      { sid: 2, claim: 'DeepSeek-R1 用 GRPO 在数学/代码等可验证任务上做 RL', quote: '“GRPO on verifiable rewards for reasoning”', confidence: 'medium' },
    ],
  },
];

// after URL→sid dedup (sid 2 reused across subtopics)
const mergedSources: Source[] = [
  { sid: 1, title: 'InstructGPT / RLHF overview', domain: 'arxiv.org' },
  { sid: 2, title: 'Policy optimization for LLMs', domain: 'huggingface.co' },
  { sid: 3, title: 'Direct Preference Optimization', domain: 'arxiv.org' },
  { sid: 4, title: 'DeepSeek-R1 technical report', domain: 'arxiv.org' },
];

const stageOrder: StageKey[] = ['idle', 'intent', 'decompose', 'research', 'accumulate', 'report', 'complete'];

const stageLabels: { key: Exclude<StageKey, 'idle' | 'complete'>; label: string; description: string }[] = [
  { key: 'intent', label: 'Intent gate (DeepSeek)', description: 'Classify input: NeedMoreInfo / Decompose / Execute. Here → Execute.' },
  { key: 'decompose', label: 'Decompose (DeepSeek)', description: 'main_intent + key_dimensions + 2–3 subtopics with retriever-ready queries.' },
  { key: 'research', label: 'Research agent (ReAct)', description: 'Per subtopic: tavily_search → tavily_extract → {claim, quote, confidence}.' },
  { key: 'accumulate', label: 'Accumulate (code)', description: 'URL→sid dedup, merge findings, append history.' },
  { key: 'report', label: 'Report (Qwen3-max)', description: 'Markdown report with [^sid] footnote citations.' },
];

const confidenceStyles: Record<Finding['confidence'], string> = {
  high: 'bg-[var(--color-green-300)]/12 text-[var(--color-green-300)] border-[var(--color-green-300)]/25',
  medium: 'bg-[var(--color-amber-300)]/12 text-[var(--color-amber-300)] border-[var(--color-amber-300)]/25',
  low: 'bg-black/20 text-[var(--color-text-muted)] border-[var(--color-border-default)]',
};

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function DeepResearchPreview() {
  const zh = useLocale() === 'zh';
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [visibleSubtopics, setVisibleSubtopics] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [timeline, setTimeline] = useState<string[]>([]);

  const reset = () => {
    setStage('idle');
    setVisibleSubtopics(0);
    setShowReport(false);
    setTimeline([]);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const run = async () => {
      setStage('intent');
      setVisibleSubtopics(0);
      setShowReport(false);
      setTimeline(['Classifying intent (DeepSeek)… → Execute (topic is concrete).']);

      await wait(560);
      if (cancelled) return;
      setStage('decompose');
      setTimeline((prev) => [...prev, `Decomposed into ${subtopics.length} subtopics across ${keyDimensions.length} key dimensions.`]);

      await wait(560);
      if (cancelled) return;
      setStage('research');
      setTimeline((prev) => [...prev, 'ReAct agent: tavily_search → tavily_extract → evidence, per subtopic…']);

      for (let i = 0; i < subtopics.length; i += 1) {
        await wait(620);
        if (cancelled) return;
        setVisibleSubtopics(i + 1);
      }

      await wait(360);
      if (cancelled) return;
      setStage('accumulate');
      setTimeline((prev) => [...prev, `URL→sid dedup: ${mergedSources.length} unique sources (sid 2 reused across subtopics).`]);

      await wait(460);
      if (cancelled) return;
      setStage('report');
      setShowReport(true);
      setTimeline((prev) => [...prev, 'Qwen3-max writing the Markdown report with [^sid] footnotes…']);

      await wait(520);
      if (cancelled) return;
      setStage('complete');
      setRunning(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [running]);

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(212,165,116,0.12),rgba(127,188,140,0.08))] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/20 bg-[var(--color-amber-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-amber-300)]">
              <Sparkles className="h-3.5 w-3.5" />
              {zh ? '交互预览' : 'Interactive Preview'}
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
              {zh ? '运行 Deep Research 工作流' : 'Run the Deep Research workflow'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '在示例主题上复演 Dify graph：意图门 → 拆解 → ReAct Agent 逐子问题搜索抽取证据 → 来源去重 → 带脚注引用的报告。'
                : 'Replays the Dify graph on a sample topic: intent gate → decomposition → an iterative ReAct agent that searches and extracts evidence per subtopic → source dedup → a footnote-cited report.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '调研中' : 'Researching') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '运行工作流' : 'Run workflow'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '调研主题' : 'Research topic'}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">{topic}</p>
            {stageOrder.indexOf(stage) >= stageOrder.indexOf('decompose') && (
              <div className="mt-3 border-t border-[var(--color-border-default)] pt-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{zh ? '关键维度' : 'key dimensions'}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {keyDimensions.map((d) => (
                    <span key={d} className="rounded-full border border-[var(--color-border-default)] px-2.5 py-0.5 text-[11px] text-[var(--color-text-secondary)]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3">
            {stageLabels.map((item) => {
              const currentIndex = stageOrder.indexOf(stage);
              const itemIndex = stageOrder.indexOf(item.key);
              const isActive = stage === item.key;
              const isComplete = currentIndex > itemIndex;
              return (
                <div
                  key={item.key}
                  className={`rounded-[22px] border p-3 transition-colors ${
                    isActive
                      ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/10'
                      : isComplete
                        ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/10'
                        : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40'
                  }`}
                >
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                  <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              {zh ? '执行日志' : 'Activity log'}
            </p>
            <div className="mt-4 space-y-3">
              {timeline.length > 0 ? (
                timeline.map((item, index) => (
                  <p key={`${item}-${index}`} className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                  {zh ? '运行工作流，看 Dify graph 逐阶段执行。' : 'Run the workflow to watch the Dify graph execute stage by stage.'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              {zh ? '子问题与证据' : 'Subtopics & evidence'}
            </p>
            <div className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
              {visibleSubtopics}/{subtopics.length}
            </div>
          </div>

          {visibleSubtopics === 0 && (
            <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] px-4 py-10 text-center text-sm leading-6 text-[var(--color-text-muted)]">
              {zh ? '子问题及其抽取的证据会随 ReAct agent 运行出现在这里。' : 'Subtopics and their extracted evidence appear here as the ReAct agent runs.'}
            </div>
          )}

          {subtopics.slice(0, visibleSubtopics).map((st, index) => (
            <div key={st.title} className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-[var(--color-amber-300)]" />
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {index + 1}. {st.title}
                </p>
              </div>
              <p className="mt-1.5 font-mono text-[11px] text-[var(--color-text-muted)]">
                tavily_search: {st.query}
              </p>
              <div className="mt-3 space-y-2">
                {st.findings.map((f, fi) => (
                  <div key={`${f.sid}-${fi}`} className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm leading-6 text-[var(--color-text-primary)]">{f.claim}</p>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${confidenceStyles[f.confidence]}`}>
                        {f.confidence}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-start gap-1.5">
                      <Quote className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-text-muted)]" />
                      <p className="text-[11px] italic leading-5 text-[var(--color-text-muted)]">
                        {f.quote} <span className="not-italic">[^{f.sid}]</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {showReport && (
            <div className="rounded-[22px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/8 p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--color-green-300)]" />
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? 'Markdown 报告（Qwen3-max）' : 'Markdown report (Qwen3-max)'}</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                {mainIntent}。主流路线分三类：RLHF（奖励模型 + PPO）[^1][^2]、无奖励模型的 DPO[^3]、以及可验证奖励的
                GRPO/RLVR[^4][^2]。
              </p>
              <div className="mt-3 border-t border-[var(--color-border-default)] pt-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{zh ? '来源' : 'sources'}</p>
                <div className="mt-2 space-y-1">
                  {mergedSources.map((s) => (
                    <p key={s.sid} className="text-[11px] leading-5 text-[var(--color-text-muted)]">
                      [^{s.sid}] <span className="text-[var(--color-text-secondary)]">{s.title}</span> — {s.domain}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
