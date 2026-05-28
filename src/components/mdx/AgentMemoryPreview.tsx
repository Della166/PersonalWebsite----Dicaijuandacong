'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  Archive,
  Brain,
  Database,
  LoaderCircle,
  Play,
  Scale,
  Sparkles,
} from 'lucide-react';

type StageKey = 'idle' | 'shortterm' | 'compress' | 'gate' | 'ragflip' | 'judge' | 'complete';

const MAX_HISTORY = 20;
const TOKEN_THRESHOLD = 2000;

const writeTriggers: { key: string; label: { en: string; zh: string } }[] = [
  { key: 'fact', label: { zh: '事实性', en: 'factuality' } },
  { key: 'stable', label: { zh: '稳定性', en: 'stability' } },
  { key: 'reuse', label: { zh: '跨会话复用性', en: 'cross-session reuse' } },
];

const candidateFact = { zh: '用户偏好 TypeScript，长期不用 Python', en: 'User prefers TypeScript, avoids Python long-term' };

const stageOrder: StageKey[] = ['idle', 'shortterm', 'compress', 'gate', 'ragflip', 'judge', 'complete'];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function AgentMemoryPreview() {
  const zh = useLocale() === 'zh';
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [msgCount, setMsgCount] = useState(0);
  const [tokens, setTokens] = useState(900);

  const reached = (t: StageKey) => stageOrder.indexOf(stage) >= stageOrder.indexOf(t);
  const compressed = reached('compress');
  const ragMode = reached('ragflip');

  const reset = () => {
    setStage('idle');
    setMsgCount(0);
    setTokens(900);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const run = async () => {
      setStage('shortterm');
      setMsgCount(0);
      setTokens(900);
      for (let i = 1; i <= MAX_HISTORY; i += 1) {
        await wait(70);
        if (cancelled) return;
        setMsgCount(i);
      }
      await wait(400);
      if (cancelled) return;
      setStage('compress');
      await wait(700);
      if (cancelled) return;
      setStage('gate');
      await wait(820);
      if (cancelled) return;
      setStage('ragflip');
      setTokens(2300);
      await wait(720);
      if (cancelled) return;
      setStage('judge');
      await wait(820);
      if (cancelled) return;
      setStage('complete');
      setRunning(false);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [running]);

  const shortTermShown = compressed ? MAX_HISTORY / 2 : msgCount;

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
              {zh ? '短期 + 长期记忆调度' : 'Short-term + long-term memory scheduling'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? 'MemoryManager 调度中枢复演：短期对话压缩(MAX_HISTORY=20) → 写入三要素判断 → MEMORY.md 超 2000 token 切 RAG → mem0 LLM 裁判。'
                : 'A replay of the MemoryManager hub: short-term compression (MAX_HISTORY=20) → three-trigger write gate → MEMORY.md flips to RAG past 2000 tokens → mem0 LLM judge.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '运行中' : 'Running') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '运行记忆流' : 'Run memory flow'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {/* Short-term */}
        <div className="space-y-4">
          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4 text-[var(--color-amber-300)]" />
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? '短期记忆 SessionManager' : 'Short-term SessionManager'}</p>
              </div>
              <span className="font-mono text-[11px] text-[var(--color-text-muted)]">{shortTermShown}/{MAX_HISTORY}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {Array.from({ length: MAX_HISTORY }).map((_, i) => {
                const filled = i < shortTermShown;
                const folded = compressed && i >= MAX_HISTORY / 2 - 0; // visual: kept slots only
                return (
                  <span
                    key={i}
                    className={`h-2.5 w-2.5 rounded-sm transition-colors ${
                      filled ? 'bg-[var(--color-green-300)]' : compressed && !folded ? 'bg-[var(--color-amber-300)]/40' : 'bg-black/30'
                    }`}
                  />
                );
              })}
            </div>
            {compressed && (
              <p className="mt-3 rounded-lg border border-[var(--color-amber-300)]/25 bg-[var(--color-amber-300)]/8 px-2.5 py-1.5 text-[11px] leading-5 text-[var(--color-amber-300)]">
                {zh ? '滚动摘要：前 50% 历史折叠成 compressed_context（注入为独立 system 消息）。' : 'Rolling summary: front 50% folded into compressed_context (injected as a separate system message).'}
              </p>
            )}
            <p className="mt-2 font-mono text-[10px] text-[var(--color-text-muted)]">deepseek-chat · 128K · MAX_HISTORY=20</p>
          </div>

          {/* Write gate */}
          <div className={`rounded-[22px] border p-4 transition-colors ${reached('gate') ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/8' : 'border-dashed border-[var(--color-border-default)]'}`}>
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? '写入长期？三要素判断' : 'Write to long-term? Three-trigger gate'}</p>
            </div>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{zh ? '候选事实：' : 'Candidate: '}{zh ? candidateFact.zh : candidateFact.en}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {writeTriggers.map((t) => (
                <span
                  key={t.key}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] transition-colors ${
                    reached('gate') ? 'border-[var(--color-green-300)]/40 bg-[var(--color-green-300)]/12 text-[var(--color-green-300)]' : 'border-[var(--color-border-default)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {reached('gate') ? '✓ ' : ''}{zh ? t.label.zh : t.label.en}
                </span>
              ))}
            </div>
            {reached('gate') && <p className="mt-2 font-mono text-[10px] text-[var(--color-text-muted)]">is_worth_memorizing(temp=0.1) → True → write MEMORY.md</p>}
          </div>
        </div>

        {/* Long-term + mem0 */}
        <div className="space-y-4">
          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-[var(--color-amber-300)]" />
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? '长期记忆 MEMORY.md' : 'Long-term MEMORY.md'}</p>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ragMode ? 'border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/10 text-[var(--color-green-300)]' : 'border-[var(--color-border-default)] text-[var(--color-text-muted)]'}`}>
                {ragMode ? 'RAG' : 'Direct'}
              </span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/30">
              <div
                className={`h-full rounded-full transition-all duration-700 ${ragMode ? 'bg-[var(--color-green-300)]' : 'bg-[var(--color-amber-300)]'}`}
                style={{ width: `${Math.min(100, (tokens / (TOKEN_THRESHOLD * 1.5)) * 100)}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[10px] text-[var(--color-text-muted)]">
              <span>{tokens} tokens</span>
              <span>threshold {TOKEN_THRESHOLD}</span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-[var(--color-text-muted)]">
              {ragMode
                ? (zh ? '超阈值 → LlamaIndex VectorStoreIndex + SentenceSplitter top-K 检索注入。' : 'Past threshold → LlamaIndex VectorStoreIndex + SentenceSplitter, top-K injection.')
                : (zh ? '小于阈值 → 整份 MEMORY.md 直接注入 system prompt（MD5 缓存跳过 IO）。' : 'Under threshold → whole MEMORY.md injected into the system prompt (MD5-cached).')}
            </p>
          </div>

          <div className={`rounded-[22px] border p-4 transition-colors ${reached('judge') ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/10' : 'border-dashed border-[var(--color-border-default)]'}`}>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-[var(--color-green-300)]" />
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? 'mem0 LLM 裁判' : 'mem0 LLM judge'}</p>
            </div>
            {reached('judge') ? (
              <>
                <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                  {zh ? '已有「用户喜欢 Python」，新事实冲突 → 裁判选 UPDATE。' : 'Existing "user likes Python" conflicts with the new fact → judge picks UPDATE.'}
                </p>
                <div className="mt-2 flex gap-1.5">
                  {['ADD', 'UPDATE', 'DELETE', 'NONE'].map((op) => (
                    <span
                      key={op}
                      className={`rounded-md border px-2 py-0.5 font-mono text-[10px] ${op === 'UPDATE' ? 'border-[var(--color-green-300)]/45 bg-[var(--color-green-300)]/15 text-[var(--color-green-300)]' : 'border-[var(--color-border-default)] text-[var(--color-text-muted)]'}`}
                    >
                      {op}
                    </span>
                  ))}
                </div>
                <p className="mt-2 font-mono text-[10px] text-[var(--color-text-muted)]">提取 → 更新两阶段 · 500–2000ms · 命名空间 user/agent/run_id · milvus :19530</p>
              </>
            ) : (
              <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">{zh ? '生产层换成 mem0：LLM 裁判在 ADD/UPDATE/DELETE/NONE 里选一个。' : 'In production, swap to mem0: an LLM judge picks one of ADD/UPDATE/DELETE/NONE.'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
