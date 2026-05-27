'use client';

import { useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  CheckCircle2,
  GitCompareArrows,
  Hash,
  ShieldAlert,
  Sparkles,
  Workflow,
  XCircle,
} from 'lucide-react';

// A trace-replay preview that makes the agent-quality story visible:
// for each task, the base (SFT-only) trace and the DPO-tuned trace are shown
// side by side. The eval rubric on the right is the same one used to build
// chosen / rejected pairs during preference data collection.

type TaskKey = 'travel' | 'finance' | 'support';
type Variant = 'base' | 'tuned';

interface ToolCall {
  step: number;
  tool: string;
  argsPreview: string;
  ok: boolean;
  note?: string;
}

interface Trace {
  outcome: 'success' | 'partial' | 'fail';
  steps: ToolCall[];
  finalAnswer: string;
}

interface JudgeAxis {
  label: string;
  base: number;
  tuned: number;
  detail: string;
}

interface TaskCase {
  key: TaskKey;
  title: string;
  prompt: string;
  toolset: string[];
  base: Trace;
  tuned: Trace;
  judge: JudgeAxis[];
}

const TASKS: TaskCase[] = [
  {
    key: 'travel',
    title: 'Multi-leg travel booking with budget cap',
    prompt:
      'Book a round-trip NYC ↔ Tokyo for two adults next month with a $4,000 budget total, prefer non-stop, and email me the confirmation.',
    toolset: ['flights.search', 'flights.book', 'hotel.search', 'email.send'],
    base: {
      outcome: 'partial',
      steps: [
        { step: 1, tool: 'flights.search', argsPreview: '{origin:"NYC", dest:"NRT"}', ok: true, note: 'forgot dates' },
        { step: 2, tool: 'flights.book', argsPreview: '{flight_id:"f_1"}', ok: false, note: 'no pax count' },
        { step: 3, tool: 'flights.book', argsPreview: '{flight_id:"f_1", pax:2}', ok: true, note: 'overshoots budget' },
        { step: 4, tool: 'email.send', argsPreview: '{to:"user", body:"done"}', ok: true },
      ],
      finalAnswer: 'Booked flights and sent confirmation. (Cost $4,820, over budget.)',
    },
    tuned: {
      outcome: 'success',
      steps: [
        {
          step: 1,
          tool: 'flights.search',
          argsPreview: '{origin:"NYC", dest:"NRT", date_range:"+30d±3", pax:2, nonstop:true, max_total_usd:4000}',
          ok: true,
        },
        { step: 2, tool: 'flights.book', argsPreview: '{flight_id:"f_3", pax:2, hold:true}', ok: true, note: 'soft-hold' },
        { step: 3, tool: 'email.send', argsPreview: '{to:"user", template:"booking_confirm", flight_id:"f_3"}', ok: true },
      ],
      finalAnswer: 'Held two non-stop seats for $3,840 (≤ budget) and emailed the confirmation.',
    },
    judge: [
      {
        label: 'Tool-choice correctness',
        base: 0.62,
        tuned: 0.94,
        detail: 'Tuned model skips the redundant hotel.search the prompt did not ask for.',
      },
      {
        label: 'Argument completeness',
        base: 0.48,
        tuned: 0.91,
        detail: 'Tuned model includes pax + budget cap + nonstop in the first search call.',
      },
      {
        label: 'Step efficiency',
        base: 4,
        tuned: 3,
        detail: 'One fewer call (no failed retry), same outcome.',
      },
      {
        label: 'Budget compliance',
        base: 0.0,
        tuned: 1.0,
        detail: 'Base run blew past the $4,000 cap. Tuned run honored it.',
      },
    ],
  },
  {
    key: 'finance',
    title: 'Refund decision with policy lookup',
    prompt:
      'Customer #C-7710 asks for a refund on order #O-9082. Decide whether they qualify under our current refund policy and respond to the ticket.',
    toolset: ['orders.get', 'policy.lookup', 'tickets.reply'],
    base: {
      outcome: 'fail',
      steps: [
        { step: 1, tool: 'tickets.reply', argsPreview: '{id:"T-...", body:"sure, refunded"}', ok: true, note: 'no lookup' },
      ],
      finalAnswer: 'Refunded without checking policy or order eligibility.',
    },
    tuned: {
      outcome: 'success',
      steps: [
        { step: 1, tool: 'orders.get', argsPreview: '{order_id:"O-9082"}', ok: true },
        {
          step: 2,
          tool: 'policy.lookup',
          argsPreview: '{topic:"refund", category:"digital"}',
          ok: true,
          note: '14-day window',
        },
        {
          step: 3,
          tool: 'tickets.reply',
          argsPreview: '{id:"T-...", body:"<policy-cited decision>"}',
          ok: true,
        },
      ],
      finalAnswer:
        'Order is 9 days old + digital · within 14-day refund window. Approved and replied with policy citation.',
    },
    judge: [
      {
        label: 'Tool-choice correctness',
        base: 0.2,
        tuned: 1.0,
        detail: 'Base skipped orders.get + policy.lookup. Tuned visited both before replying.',
      },
      {
        label: 'Argument completeness',
        base: 0.5,
        tuned: 0.95,
        detail: 'Tuned reply cites the actual policy clause.',
      },
      {
        label: 'Step efficiency',
        base: 1,
        tuned: 3,
        detail: 'Base was faster — but wrong. Step efficiency is judged conditional on outcome.',
      },
      {
        label: 'Policy-grounding',
        base: 0.0,
        tuned: 1.0,
        detail: 'Tuned answer is grounded in the policy.lookup result; base just guessed.',
      },
    ],
  },
  {
    key: 'support',
    title: 'API error triage from a customer report',
    prompt:
      'A customer reports a 500 on POST /v1/charges. Reproduce in our staging env, check the latest deploy, and tell me whether to roll back.',
    toolset: ['api.repro', 'deploys.recent', 'logs.search', 'slack.post'],
    base: {
      outcome: 'partial',
      steps: [
        { step: 1, tool: 'logs.search', argsPreview: '{query:"500"}', ok: true, note: 'too broad' },
        { step: 2, tool: 'slack.post', argsPreview: '{channel:"#oncall", text:"500 errors"}', ok: true },
      ],
      finalAnswer: 'Pinged oncall about generic 500 errors.',
    },
    tuned: {
      outcome: 'success',
      steps: [
        { step: 1, tool: 'api.repro', argsPreview: '{method:"POST", path:"/v1/charges"}', ok: true, note: '500 reproduced' },
        { step: 2, tool: 'deploys.recent', argsPreview: '{service:"charges", window:"6h"}', ok: true, note: 'd-42' },
        {
          step: 3,
          tool: 'logs.search',
          argsPreview: '{service:"charges", level:"error", since:"d-42 deploy"}',
          ok: true,
        },
        {
          step: 4,
          tool: 'slack.post',
          argsPreview: '{channel:"#oncall", text:"<repro + deploy-correlated logs>"}',
          ok: true,
        },
      ],
      finalAnswer:
        'Reproduced the 500, correlated with deploy d-42, and recommended rollback with evidence attached.',
    },
    judge: [
      {
        label: 'Tool-choice correctness',
        base: 0.4,
        tuned: 1.0,
        detail: 'Base never reproduced or correlated with deploys. Tuned did both.',
      },
      {
        label: 'Argument completeness',
        base: 0.45,
        tuned: 0.9,
        detail: 'Tuned scoped logs.search by service + level + deploy window.',
      },
      {
        label: 'Step efficiency',
        base: 2,
        tuned: 4,
        detail: 'More steps, but the additional ones add evidence the decision actually needs.',
      },
      {
        label: 'Evidence grounding',
        base: 0.1,
        tuned: 1.0,
        detail: 'Tuned recommendation cites concrete repro + deploy correlation.',
      },
    ],
  },
];

function outcomeBadge(o: Trace['outcome']) {
  if (o === 'success') {
    return {
      label: 'Success',
      cls: 'border-[var(--color-green-300)]/40 bg-[var(--color-green-300)]/12 text-[var(--color-green-300)]',
      icon: CheckCircle2,
    };
  }
  if (o === 'partial') {
    return {
      label: 'Partial',
      cls: 'border-[var(--color-amber-300)]/40 bg-[var(--color-amber-300)]/12 text-[var(--color-amber-300)]',
      icon: ShieldAlert,
    };
  }
  return {
    label: 'Fail',
    cls: 'border-[#e07a5f]/40 bg-[#e07a5f]/12 text-[#e07a5f]',
    icon: XCircle,
  };
}

function formatScore(v: number) {
  if (Number.isInteger(v) && v >= 1) return String(v);
  return v.toFixed(2);
}

function TraceColumn({
  variant,
  trace,
  toolset,
}: {
  variant: Variant;
  trace: Trace;
  toolset: string[];
}) {
  const badge = outcomeBadge(trace.outcome);
  const Icon = badge.icon;
  return (
    <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            {variant === 'base' ? 'Base · SFT only' : 'Tuned · DPO on agent traces'}
          </p>
          <h4 className="mt-1 text-base font-semibold text-[var(--color-text-primary)]">
            {trace.steps.length} tool call{trace.steps.length === 1 ? '' : 's'}
          </h4>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${badge.cls}`}>
          <Icon className="h-3.5 w-3.5" />
          {badge.label}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {trace.steps.map((s) => (
          <div key={s.step} className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3">
            <div className="flex items-center gap-2">
              <Hash className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
              <span className="text-xs text-[var(--color-text-muted)]">step {s.step}</span>
              <span className="rounded-full border border-[var(--color-amber-300)]/25 bg-[var(--color-amber-300)]/10 px-2 py-0.5 font-mono text-[11px] text-[var(--color-amber-300)]">
                {s.tool}
              </span>
              {s.ok ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-green-300)]" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-[#e07a5f]" />
              )}
            </div>
            <p className="mt-2 break-all font-mono text-[11px] leading-5 text-[var(--color-text-secondary)]">
              {s.argsPreview}
            </p>
            {s.note && (
              <p className="mt-1 text-[11px] italic text-[var(--color-text-muted)]">{s.note}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--color-border-default)] bg-black/15 p-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          Final answer
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{trace.finalAnswer}</p>
      </div>

      <p className="mt-3 text-[11px] text-[var(--color-text-muted)]">
        Toolset available: {toolset.join(' · ')}
      </p>
    </div>
  );
}

export default function FunctionCallingAgentPreview() {
  const [activeTask, setActiveTask] = useState<TaskKey>('travel');
  const task = useMemo(() => TASKS.find((t) => t.key === activeTask) ?? TASKS[0], [activeTask]);

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(127,188,140,0.12),rgba(212,165,116,0.08))] px-6 py-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/25 bg-[var(--color-green-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-green-300)]">
          <Sparkles className="h-3.5 w-3.5" />
          Trace replay · base vs tuned
        </div>
        <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Agent quality at the tool-call decision layer
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
          Pick a task. The base SFT model and the DPO-tuned model both attempt it; the rubric on
          the right is the same one used to mark traces chosen vs rejected during preference data
          construction.
        </p>
      </div>

      <div className="px-6 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Sample tasks
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {TASKS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTask(t.key)}
              className={`rounded-[24px] border p-4 text-left transition-colors ${
                activeTask === t.key
                  ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/12'
                  : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/45 hover:border-[var(--color-border-hover)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-[var(--color-amber-300)]" />
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{t.title}</h4>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">{t.prompt}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1fr_0.85fr]">
        <TraceColumn variant="base" trace={task.base} toolset={task.toolset} />
        <TraceColumn variant="tuned" trace={task.tuned} toolset={task.toolset} />

        <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="h-4 w-4 text-[var(--color-green-300)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Judge rubric · base vs tuned
            </p>
          </div>
          <div className="mt-4 space-y-3">
            {task.judge.map((j) => (
              <div key={j.label} className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{j.label}</p>
                  <span className="inline-flex items-center gap-1 font-mono text-[12px] text-[var(--color-text-muted)]">
                    {formatScore(j.base)}
                    <ArrowDownToLine className="h-3 w-3 rotate-[-90deg] text-[var(--color-text-muted)]" />
                    <span className="text-[var(--color-green-300)]">{formatScore(j.tuned)}</span>
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">{j.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-5 text-[var(--color-text-muted)]">
            These are the four axes that feed the chosen / rejected labeling step. Improvements
            here are what DPO actually optimizes — not text fluency.
          </p>
        </div>
      </div>
    </div>
  );
}
