'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Ban, LoaderCircle, Network, Play, Sparkles } from 'lucide-react';

type StageKey = 'idle' | 'spawn' | 'work' | 'blocked' | 'collect' | 'synth' | 'complete';

const stageOrder: StageKey[] = ['idle', 'spawn', 'work', 'blocked', 'collect', 'synth', 'complete'];

const spokes = [
  { id: 'sec', label: { zh: '安全审查', en: 'security' }, x: 78, y: 18 },
  { id: 'perf', label: { zh: '性能审查', en: 'performance' }, x: 86, y: 50 },
  { id: 'read', label: { zh: '可读性审查', en: 'readability' }, x: 78, y: 82 },
];

const primitives: { name: string; sql: string; note: { en: string; zh: string } }[] = [
  { name: 'sessions_spawn', sql: 'INSERT', note: { zh: '创建子 Agent 会话', en: 'create a sub-agent session' } },
  { name: 'sessions_send', sql: 'UPDATE', note: { zh: '节点间消息（仅 lead 可用，子层被禁）', en: 'inter-node msg (lead-only; banned at subagent layer)' } },
  { name: 'sessions_history', sql: 'SELECT', note: { zh: '收集子 Agent 结果', en: 'collect sub-agent results' } },
];

const stageLabels: { key: Exclude<StageKey, 'idle' | 'complete'>; label: { en: string; zh: string } }[] = [
  { key: 'spawn', label: { zh: '1. lead sessions_spawn 三个评审子 Agent（并行）', en: '1. lead sessions_spawn three review subagents (parallel)' } },
  { key: 'work', label: { zh: '2. 子 Agent 各自独立上下文里工作', en: '2. subagents work in isolated contexts' } },
  { key: 'blocked', label: { zh: '3. 子 Agent 想 sessions_send 回 lead → 被禁（工具未注册）', en: '3. a subagent tries sessions_send to lead → blocked (tool not registered)' } },
  { key: 'collect', label: { zh: '4. lead 用 sessions_history 收集结果（或读 shared/signals）', en: '4. lead collects via sessions_history (or reads shared/signals)' } },
  { key: 'synth', label: { zh: '5. lead 综合三份评审', en: '5. lead synthesizes the three reviews' } },
];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function OpenClawMultiAgentPreview() {
  const zh = useLocale() === 'zh';
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');

  const reached = (t: StageKey) => stageOrder.indexOf(stage) >= stageOrder.indexOf(t);

  const reset = () => {
    setStage('idle');
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const run = async () => {
      const seq: StageKey[] = ['spawn', 'work', 'blocked', 'collect', 'synth'];
      for (const s of seq) {
        setStage(s);
        await wait(s === 'blocked' ? 900 : 700);
        if (cancelled) return;
      }
      setStage('complete');
      setRunning(false);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [running]);

  const lead = { x: 18, y: 50 };

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
              {zh ? 'Hub-Spoke 多智能体代码评审' : 'Hub-Spoke multi-agent code review'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '复演 OpenClaw 多智能体：lead 派生 3 个评审子 Agent，结果只能经 sessions_history 单向流回——子 Agent 的 sessions_send 在工具层就被禁了。'
                : 'Replays OpenClaw multi-agent: a lead spawns 3 review subagents; results flow back only via sessions_history — a subagent\'s sessions_send is banned at the tool-registry level.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '编排中' : 'Orchestrating') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '运行编排' : 'Run orchestration'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* topology */}
        <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/15 p-4">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-[var(--color-amber-300)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? 'Hub-Spoke 拓扑（token 3–15×）' : 'Hub-Spoke topology (3–15× tokens)'}</p>
          </div>
          <svg viewBox="0 0 100 100" className="mt-3 w-full" style={{ aspectRatio: '1' }}>
            {/* spawn arrows lead -> spokes */}
            {reached('spawn') &&
              spokes.map((s) => (
                <line key={`sp-${s.id}`} x1={lead.x} y1={lead.y} x2={s.x} y2={s.y} stroke="var(--color-green-300)" strokeWidth="0.7" opacity="0.7" />
              ))}
            {/* blocked send arrow (one spoke -> lead) */}
            {stage === 'blocked' && (
              <>
                <line x1={spokes[0].x} y1={spokes[0].y} x2={lead.x + 8} y2={lead.y - 4} stroke="#e06b6b" strokeWidth="0.9" strokeDasharray="2 1.5" />
                <text x={(spokes[0].x + lead.x) / 2} y={(spokes[0].y + lead.y) / 2 - 3} fontSize="3.4" fill="#e06b6b" fontWeight="700">✕ blocked</text>
              </>
            )}
            {/* collect arrows spokes -> lead */}
            {reached('collect') &&
              spokes.map((s) => (
                <line key={`co-${s.id}`} x1={s.x} y1={s.y} x2={lead.x} y2={lead.y} stroke="var(--color-amber-300)" strokeWidth="0.7" strokeDasharray="2 1" opacity="0.85" />
              ))}

            {/* lead node */}
            <g>
              <circle cx={lead.x} cy={lead.y} r="9" fill={reached('synth') ? 'var(--color-green-300)' : 'var(--color-amber-300)'} opacity="0.9" />
              <text x={lead.x} y={lead.y + 1.2} fontSize="4" fill="#0e1a14" textAnchor="middle" fontWeight="700">lead</text>
            </g>
            {/* spoke nodes */}
            {spokes.map((s) => {
              const active = reached('spawn');
              const working = stage === 'work' || stage === 'blocked';
              return (
                <g key={s.id} opacity={active ? 1 : 0.25}>
                  <circle cx={s.x} cy={s.y} r="7" fill={working ? 'var(--color-green-300)' : 'var(--color-bg-card)'} stroke="var(--color-green-300)" strokeWidth="0.6" />
                  <text x={s.x} y={s.y + 1} fontSize="3.2" fill={working ? '#0e1a14' : 'var(--color-text-secondary)'} textAnchor="middle" fontWeight="600">{zh ? s.label.zh : s.label.en}</text>
                </g>
              );
            })}
          </svg>
          <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-muted)]">
            {zh ? 'Hub 单向派发：lead 派活、收结果；子 Agent 之间不能直接通信（P2P 生产零案例）。' : 'Hub single-directional dispatch: lead delegates and collects; subagents can\'t talk directly (P2P has zero production cases).'}
          </p>
        </div>

        {/* stages + primitives */}
        <div className="space-y-2.5">
          {stageLabels.map((s) => {
            const active = stage === s.key;
            const done = reached(s.key) && !active;
            const isBlocked = s.key === 'blocked';
            return (
              <div
                key={s.key}
                className={`flex items-start gap-2 rounded-[18px] border px-3.5 py-2.5 transition-colors ${
                  active
                    ? isBlocked
                      ? 'border-[#e06b6b]/50 bg-[#e06b6b]/10'
                      : 'border-[var(--color-green-300)]/50 bg-[var(--color-green-300)]/12'
                    : done
                      ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/8'
                      : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40'
                }`}
              >
                {isBlocked && active && <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#e06b6b]" />}
                <p className="text-sm leading-5 text-[var(--color-text-primary)]">{zh ? s.label.zh : s.label.en}</p>
              </div>
            );
          })}

          <div className="rounded-[18px] border border-[var(--color-border-default)] bg-black/10 p-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{zh ? '三个 MCP 原语（数据库类比）' : 'Three MCP primitives (DB analogy)'}</p>
            <div className="mt-2 space-y-1">
              {primitives.map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-[11px]">
                  <span className="font-mono text-[var(--color-green-300)]">{p.name}</span>
                  <span className="rounded border border-[var(--color-border-default)] px-1 font-mono text-[9px] text-[var(--color-text-muted)]">{p.sql}</span>
                  <span className="text-[var(--color-text-muted)]">{zh ? p.note.zh : p.note.en}</span>
                </div>
              ))}
            </div>
          </div>

          {stage === 'complete' && (
            <p className="rounded-[18px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/10 px-3.5 py-3 text-[11px] leading-5 text-[var(--color-text-secondary)]">
              {zh
                ? 'sessions_send 在子 Agent 层根本不注册（比 DENY 更彻底，零 token 浪费）——这正是 P2P 模式生产零案例的根因。'
                : 'sessions_send is never even registered into a subagent\'s tool set (stronger than a DENY, zero token waste) — the root cause of P2P\'s zero production cases.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
