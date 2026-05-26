'use client';

import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { AlertTriangle, Bot, LoaderCircle, RotateCcw, SpellCheck, Sparkles, Wand2 } from 'lucide-react';

// Phase-2 innovation: a real, in-browser Definitive-Language detector.
// This is the deterministic, rule-based half of the project's review logic
// (Definitive Language / 绝对化表述), ported to run live on pasted text.
// Grammar & Spelling detection stays on the LLM backend (DeepSeek) — not faked here.

interface Rule {
  term: string;
  soft: string;
}

const RULES: Rule[] = [
  { term: '百分之百', soft: '尽可能' }, // longer terms first so they win on overlap
  { term: '无条件', soft: '在约定条件下' },
  { term: '必须', soft: '应 / 宜' },
  { term: '保证', soft: '尽力 / 力争' },
  { term: '一定', soft: '通常 / 原则上' },
  { term: '完全', soft: '基本上 / 尽可能' },
  { term: '绝对', soft: '（建议删去）/ 尽量' },
  { term: '绝不', soft: '尽量不 / 原则上不' },
  { term: '决不', soft: '尽量不' },
  { term: '永远', soft: '长期' },
  { term: '永久', soft: '长期' },
  { term: '务必', soft: '请' },
  { term: '所有', soft: '相关 / 多数' },
  { term: '全部', soft: '大部分 / 相关' },
  { term: '任何', soft: '相关 / 多数' },
  { term: '一律', soft: '原则上' },
];

interface Match {
  start: number;
  end: number;
  term: string;
  soft: string;
}

// Real detection: scan for every rule term, drop overlaps (longer/earlier wins).
function detect(text: string): Match[] {
  const raw: Match[] = [];
  for (const rule of RULES) {
    let from = 0;
    while (true) {
      const idx = text.indexOf(rule.term, from);
      if (idx === -1) break;
      raw.push({ start: idx, end: idx + rule.term.length, term: rule.term, soft: rule.soft });
      from = idx + rule.term.length;
    }
  }
  raw.sort((a, b) => (a.start - b.start) || (b.end - b.start - (a.end - a.start)));
  const kept: Match[] = [];
  let lastEnd = -1;
  for (const m of raw) {
    if (m.start >= lastEnd) {
      kept.push(m);
      lastEnd = m.end;
    }
  }
  return kept;
}

const SAMPLE =
  '甲方保证一定为乙方提供最优质的服务，并承诺在任何情况下都完全满足乙方的所有要求。' +
  '本协议一经签署绝对不可变更，乙方必须无条件接受上述全部条款。';

interface Segment {
  text: string;
  match?: Match;
}

function segment(text: string, matches: Match[]): Segment[] {
  const segs: Segment[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start > cursor) segs.push({ text: text.slice(cursor, m.start) });
    segs.push({ text: text.slice(m.start, m.end), match: m });
    cursor = m.end;
  }
  if (cursor < text.length) segs.push({ text: text.slice(cursor) });
  return segs;
}

interface AiIssue {
  type: string;
  text: string;
  explanation: string;
  suggested_fix: string;
  risk: string;
}

type AiStatus = 'idle' | 'loading' | 'done' | 'error';

export default function DocReviewAgentPreview() {
  const zh = useLocale() === 'zh';
  const [text, setText] = useState(SAMPLE);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle');
  const [aiIssues, setAiIssues] = useState<AiIssue[]>([]);
  const [aiError, setAiError] = useState<string>('');

  const matches = useMemo(() => detect(text), [text]);
  const segments = useMemo(() => segment(text, matches), [text, matches]);

  const runAiReview = async () => {
    setAiStatus('loading');
    setAiError('');
    setAiIssues([]);
    try {
      const resp = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setAiError(data?.message || `Request failed (${resp.status}).`);
        setAiStatus('error');
        return;
      }
      setAiIssues(Array.isArray(data.issues) ? data.issues : []);
      setAiStatus('done');
    } catch {
      setAiError('Network error — could not reach the review backend.');
      setAiStatus('error');
    }
  };

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(212,165,116,0.12),rgba(127,188,140,0.08))] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/20 bg-[var(--color-amber-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-amber-300)]">
              <Sparkles className="h-3.5 w-3.5" />
              {zh ? '实时 · 在你浏览器里运行' : 'Live · runs in your browser'}
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
              {zh ? '绝对化表述检测器 — 实时试用' : 'Definitive-language detector — try it live'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh ? (
                <>
                  输入或粘贴中文文本。这会在你的浏览器里真跑项目的 <strong>绝对化表述（Definitive Language）</strong>
                  规则逻辑——无服务器、无写死数据——标出过度确定的措辞并给软化建议。语法与拼写检测在 LLM 后端进行，这里不做假。
                </>
              ) : (
                <>
                  Type or paste Chinese text. This runs the project&apos;s real <strong>Definitive Language
                  (绝对化表述)</strong> rule logic in your browser — no server, no canned data — and flags
                  over-committal wording with a softer rewrite. Grammar &amp; spelling detection stays on the LLM
                  backend and isn&apos;t faked here.
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setText(SAMPLE);
              setActiveIndex(null);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18"
          >
            <RotateCcw className="h-4 w-4" /> {zh ? '重置示例' : 'Reset sample'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              {zh ? '你的文本' : 'Your text'}
            </p>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setActiveIndex(null);
              }}
              rows={5}
              spellCheck={false}
              className="w-full resize-y rounded-[20px] border border-[var(--color-border-default)] bg-black/20 p-4 font-mono text-sm leading-7 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-green-300)]/40"
            />
          </div>

          <div className="rounded-[20px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              {zh ? '高亮结果' : 'Highlighted'}
            </p>
            <p className="text-sm leading-8 text-[var(--color-text-secondary)]">
              {segments.map((seg, i) =>
                seg.match ? (
                  <mark
                    key={i}
                    onMouseEnter={() => setActiveIndex(matches.indexOf(seg.match!))}
                    className="cursor-help rounded-md bg-[var(--color-amber-300)]/25 px-0.5 font-semibold text-[var(--color-amber-300)] underline decoration-dotted underline-offset-4"
                  >
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              {zh ? '检出 · 绝对化表述' : 'Detected · 绝对化表述'}
            </p>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                matches.length > 0
                  ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/12 text-[var(--color-amber-300)]'
                  : 'border-[var(--color-green-300)]/25 bg-[var(--color-green-300)]/10 text-[var(--color-green-300)]'
              }`}
            >
              {zh ? `${matches.length} 处 · 风险高` : `${matches.length} issue${matches.length === 1 ? '' : 's'} · risk 高`}
            </span>
          </div>

          {matches.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-[var(--color-border-default)] px-4 py-10 text-center text-sm leading-6 text-[var(--color-text-muted)]">
              {zh
                ? '未发现绝对化表述。试试「必须 / 保证 / 一定 / 完全 / 绝对」这类词。'
                : 'No definitive-language issues found. Try words like 必须 / 保证 / 一定 / 完全 / 绝对.'}
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((m, i) => (
                <div
                  key={`${m.start}-${m.term}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`rounded-[20px] border p-4 transition-colors ${
                    activeIndex === i
                      ? 'border-[var(--color-amber-300)]/45 bg-[var(--color-amber-300)]/10'
                      : 'border-[var(--color-border-default)] bg-black/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[var(--color-amber-300)]" />
                    <span className="font-mono text-sm font-semibold text-[var(--color-text-primary)]">
                      {m.term}
                    </span>
                    <span className="ml-auto text-[11px] text-[var(--color-text-muted)]">
                      {zh ? `第 ${m.start} 字` : `char ${m.start}`}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                    {zh
                      ? `在正式承诺/保证语境中使用「${m.term}」属于绝对化表述，可能形成超出预期的义务。`
                      : `Using "${m.term}" in a formal promise context is over-committal language and may create obligations beyond what was intended.`}
                  </p>
                  <div className="mt-2.5 flex items-start gap-2 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-3">
                    <Wand2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-green-300)]" />
                    <p className="text-sm leading-6 text-[var(--color-green-300)]">
                      {zh ? `建议软化为：${m.soft}` : `Soften to: ${m.soft}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-[11px] leading-5 text-[var(--color-text-muted)]">
            {zh
              ? '上方绝对化表述层完全在客户端即时运行。语法、拼写和更深入的审核，点下方真实 DeepSeek 通道——与生产系统同一个 LLM。'
              : 'The 绝对化表述 layer above runs entirely client-side, instantly. For grammar, spelling and deeper review, run the real DeepSeek pass below — the same LLM the production system uses.'}
          </p>
        </div>
      </div>

      {/* DeepSeek-backed deep review — real API call */}
      <div className="border-t border-[var(--color-border-default)] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-[var(--color-green-300)]" />
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {zh ? 'DeepSeek 深度审核（真实 API）' : 'Deep review with DeepSeek (live API)'}
            </p>
          </div>
          <button
            type="button"
            onClick={runAiReview}
            disabled={aiStatus === 'loading' || !text.trim()}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {aiStatus === 'loading' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            {aiStatus === 'loading' ? (zh ? '审核中…' : 'Reviewing…') : zh ? '运行 DeepSeek 审核' : 'Run DeepSeek review'}
          </button>
        </div>

        {aiStatus === 'error' && (
          <div className="mt-4 rounded-2xl border border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/10 p-4 text-sm leading-6 text-[var(--color-amber-300)]">
            {aiError}
          </div>
        )}

        {aiStatus === 'done' && aiIssues.length === 0 && (
          <div className="mt-4 rounded-2xl border border-[var(--color-green-300)]/25 bg-[var(--color-green-300)]/8 p-4 text-sm leading-6 text-[var(--color-green-300)]">
            {zh ? 'DeepSeek 未在此文本中发现语法/拼写或绝对化表述问题。' : 'DeepSeek found no grammar/spelling or definitive-language issues in this text.'}
          </div>
        )}

        {aiStatus === 'done' && aiIssues.length > 0 && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {aiIssues.map((issue, i) => {
              const definitive = issue.type === 'Definitive Language';
              return (
                <div
                  key={`${issue.text}-${i}`}
                  className="rounded-[20px] border border-[var(--color-border-default)] bg-black/10 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {definitive ? (
                      <AlertTriangle className="h-4 w-4 text-[var(--color-amber-300)]" />
                    ) : (
                      <SpellCheck className="h-4 w-4 text-[var(--color-green-300)]" />
                    )}
                    <span className="text-[11px] text-[var(--color-text-secondary)]">{issue.type}</span>
                    <span
                      className={`ml-auto rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        issue.risk === '高'
                          ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/12 text-[var(--color-amber-300)]'
                          : 'border-[var(--color-green-300)]/25 bg-[var(--color-green-300)]/10 text-[var(--color-green-300)]'
                      }`}
                    >
                      风险 {issue.risk}
                    </span>
                  </div>
                  <p className="mt-2.5 text-sm leading-6 text-[var(--color-text-primary)]">“{issue.text}”</p>
                  {issue.explanation && (
                    <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">{issue.explanation}</p>
                  )}
                  {issue.suggested_fix && (
                    <div className="mt-2.5 flex items-start gap-2 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-3">
                      <Wand2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-green-300)]" />
                      <p className="text-sm leading-6 text-[var(--color-green-300)]">{issue.suggested_fix}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-4 text-[11px] leading-5 text-[var(--color-text-muted)]">
          {zh
            ? '调用一个服务端 route，用 JSON 结构化提示真跑 DeepSeek——API key 只在服务端，输入有长度上限，请求按 IP 限流。这是真实 LLM 通道，不是预演。'
            : 'Calls a server-side route that runs DeepSeek with a JSON-structured review prompt — the API key stays on the server, input is length-capped, and requests are rate-limited. This is the real LLM pass, not a replay.'}
        </p>
      </div>
    </div>
  );
}
