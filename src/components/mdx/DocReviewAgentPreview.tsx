'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  FileText,
  LoaderCircle,
  Play,
  SpellCheck,
  Sparkles,
  X,
} from 'lucide-react';

type StageKey = 'idle' | 'parse' | 'chunk' | 'review' | 'complete';
type IssueType = 'Grammar & Spelling' | 'Definitive Language';
type Status = 'open' | 'accepted' | 'dismissed';

interface Issue {
  type: IssueType;
  risk: '高' | '低';
  text: string;
  explanation: string;
  suggestedFix: string;
  page: number;
  bbox: string;
}

// Issues modeled on the real pipeline output for the bundled Chinese labor-contract sample.
const issues: Issue[] = [
  {
    type: 'Definitive Language',
    risk: '高',
    text: '公司保证一定为乙方重新安排合适岗位',
    explanation: '在正式承诺语境中使用「保证…一定」属于绝对化表述，可能形成超出预期的法律义务。',
    suggestedFix: '公司将尽力为乙方协调合适岗位',
    page: 1,
    bbox: '[112, 348, 506, 372]',
  },
  {
    type: 'Grammar & Spelling',
    risk: '低',
    text: '甲乙双方经友好协商达成一至意见',
    explanation: '错别字：「一至」应为「一致」。',
    suggestedFix: '甲乙双方经友好协商达成一致意见',
    page: 1,
    bbox: '[96, 210, 478, 234]',
  },
  {
    type: 'Definitive Language',
    risk: '高',
    text: '本协议一经签署绝对不可作任何变更',
    explanation: '「绝对不可」为过度确定表述，排除了双方协商变更的正常可能。',
    suggestedFix: '本协议签署后，如需变更应经双方书面协商一致',
    page: 2,
    bbox: '[110, 156, 520, 180]',
  },
  {
    type: 'Grammar & Spelling',
    risk: '低',
    text: '乙方应当于离职之日七日内办理完工作交接',
    explanation: '语序/搭配：「办理完工作交接」宜作「办理完毕工作交接手续」。',
    suggestedFix: '乙方应于离职之日起七日内办理完毕工作交接手续',
    page: 2,
    bbox: '[96, 300, 498, 324]',
  },
];

const stageOrder: StageKey[] = ['idle', 'parse', 'chunk', 'review', 'complete'];

const stageLabels: { key: Exclude<StageKey, 'idle' | 'complete'>; label: string; description: string }[] = [
  { key: 'parse', label: 'MinerU parse', description: 'Upload PDF to MinerU v4 → paragraphs + per-paragraph bounding boxes.' },
  { key: 'chunk', label: 'Chunk', description: 'Batch paragraphs (32 per chunk) to fit the model context.' },
  { key: 'review', label: 'Review (LangChain + DeepSeek)', description: 'Per chunk: prompt + PydanticOutputParser → structured issues, streamed over SSE.' },
];

const riskStyles: Record<Issue['risk'], string> = {
  高: 'bg-[var(--color-amber-300)]/15 text-[var(--color-amber-300)] border-[var(--color-amber-300)]/30',
  低: 'bg-[var(--color-green-300)]/12 text-[var(--color-green-300)] border-[var(--color-green-300)]/25',
};

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function DocReviewAgentPreview() {
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [visibleCount, setVisibleCount] = useState(0);
  const [statuses, setStatuses] = useState<Record<number, Status>>({});
  const [timeline, setTimeline] = useState<string[]>([]);

  const reset = () => {
    setStage('idle');
    setVisibleCount(0);
    setStatuses({});
    setTimeline([]);
    setRunning(false);
  };

  const setStatus = (index: number, status: Status) => {
    setStatuses((prev) => ({ ...prev, [index]: status }));
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const run = async () => {
      setStage('parse');
      setVisibleCount(0);
      setStatuses({});
      setTimeline(['Uploaded 解除、终止劳动合同协议书.pdf', 'MinerU v4 parsing → 38 paragraphs + bounding boxes.']);

      await wait(620);
      if (cancelled) return;
      setStage('chunk');
      setTimeline((prev) => [...prev, 'Batched paragraphs into chunks of 32.']);

      await wait(460);
      if (cancelled) return;
      setStage('review');
      setTimeline((prev) => [...prev, 'Streaming issues over SSE as each chunk is reviewed…']);

      for (let i = 0; i < issues.length; i += 1) {
        await wait(620);
        if (cancelled) return;
        setVisibleCount(i + 1);
      }

      await wait(280);
      if (cancelled) return;
      setStage('complete');
      setTimeline((prev) => [...prev, `Done — ${issues.length} issues found. Accept or dismiss each (HITL-gated).`]);
      setRunning(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [running]);

  const counts = {
    high: issues.filter((i) => i.risk === '高').length,
    low: issues.filter((i) => i.risk === '低').length,
  };

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(212,165,116,0.12),rgba(127,188,140,0.08))] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/20 bg-[var(--color-amber-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-amber-300)]">
              <Sparkles className="h-3.5 w-3.5" />
              Interactive Preview
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
              Review a contract, issue by issue
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Replays a real review run on the bundled labor-contract sample: MinerU parses the PDF, then issues
              stream in over SSE — each tagged Grammar &amp; Spelling or Definitive Language with its risk, fix,
              and bounding box. Accept or dismiss each through the human-in-the-loop gate.
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? 'Reviewing' : stage === 'complete' ? 'Reset' : 'Run review'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[var(--color-amber-300)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">解除、终止劳动合同协议书.pdf</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">Bundled sample · 2 pages</p>
              </div>
            </div>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[20px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--color-amber-300)]" />
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">高 / Definitive</p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">{counts.high}</p>
            </div>
            <div className="rounded-[20px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
              <div className="flex items-center gap-2">
                <SpellCheck className="h-4 w-4 text-[var(--color-green-300)]" />
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">低 / Grammar</p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">{counts.low}</p>
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Activity log
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
                  Run the review to stream issues from MinerU + LangChain + DeepSeek.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Issues (SSE stream)
            </p>
            <div className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
              {visibleCount}/{issues.length}
            </div>
          </div>

          {visibleCount === 0 && (
            <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] px-4 py-10 text-center text-sm leading-6 text-[var(--color-text-muted)]">
              Issues will stream in here as each chunk is reviewed.
            </div>
          )}

          {issues.slice(0, visibleCount).map((issue, index) => {
            const status = statuses[index] ?? 'open';
            return (
              <div
                key={`${issue.text}-${index}`}
                className={`rounded-[22px] border p-4 transition-colors ${
                  status === 'accepted'
                    ? 'border-[var(--color-green-300)]/40 bg-[var(--color-green-300)]/8'
                    : status === 'dismissed'
                      ? 'border-[var(--color-border-default)] bg-black/20 opacity-60'
                      : 'border-[var(--color-border-default)] bg-black/10'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[var(--color-border-default)] px-2.5 py-0.5 text-[11px] text-[var(--color-text-secondary)]">
                    {issue.type}
                  </span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${riskStyles[issue.risk]}`}>
                    风险 {issue.risk}
                  </span>
                  <span className="ml-auto text-[11px] text-[var(--color-text-muted)]">
                    p.{issue.page} · bbox {issue.bbox}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-[var(--color-text-primary)]">“{issue.text}”</p>
                <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">{issue.explanation}</p>
                <div className="mt-3 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">suggested fix</p>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--color-green-300)]">{issue.suggestedFix}</p>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {status === 'open' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setStatus(index, 'accepted')}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/12 px-3 py-1.5 text-xs font-medium text-[var(--color-green-300)] transition-colors hover:bg-[var(--color-green-300)]/18"
                      >
                        <Check className="h-3.5 w-3.5" /> Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(index, 'dismissed')}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-default)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-border-hover)]"
                      >
                        <X className="h-3.5 w-3.5" /> Dismiss
                      </button>
                      <span className="ml-auto text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                        HITL-gated
                      </span>
                    </>
                  ) : (
                    <span
                      className={`text-xs font-semibold ${
                        status === 'accepted' ? 'text-[var(--color-green-300)]' : 'text-[var(--color-text-muted)]'
                      }`}
                    >
                      {status === 'accepted' ? '✓ Accepted (persisted to SQLite)' : '✕ Dismissed'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
