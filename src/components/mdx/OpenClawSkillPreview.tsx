'use client';

import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { CheckCircle2, RotateCcw, Sparkles, TriangleAlert, XCircle } from 'lucide-react';

// Phase-2 innovation: a real, in-browser SKILL.md validator.
// Parses the frontmatter and checks it against the OpenClaw Agent-Skills spec
// (name casing, description presence + token budget, metadata.openclaw shape,
// recommended trigger phrasing). Pure client-side — no API, no runtime.

type Status = 'pass' | 'warn' | 'fail';

interface Check {
  label: string;
  status: Status;
  detail: string;
}

const SAMPLE = `---
name: daily-briefing
description: "Generate a structured daily work briefing from Git activity and manual input. Use when (1) user says 'daily briefing'; (2) user asks to summarize today's work; (3) user shares work items for formatting."
metadata: { "openclaw": { "emoji": "📋", "requires": { "bins": ["git"] } } }
---

## Trigger
- user says "日报" / "daily briefing"

## Process
1. run scripts/collect-git-activity.sh
2. classify ✅ done / ⚠️ blocked / 📅 tomorrow
3. format with the template

## Rules
- exact template, no extra sections
- do NOT add commentary at the end`;

// rough token estimate: CJK chars ~1 token each, other chars ~1 per 4.
function estimateTokens(s: string): number {
  let cjk = 0;
  let other = 0;
  for (const ch of s) {
    if (/[一-鿿　-〿＀-￯]/.test(ch)) cjk += 1;
    else other += 1;
  }
  return Math.round(cjk + other / 4);
}

interface Parsed {
  hasFrontmatter: boolean;
  name?: string;
  description?: string;
  metadataRaw?: string;
  metadataObj?: unknown;
  metadataError?: boolean;
  body: string;
}

function parse(md: string): Parsed {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { hasFrontmatter: false, body: md };
  const fm = m[1];
  const body = m[2] ?? '';

  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  const name = nameMatch ? nameMatch[1].trim().replace(/^["']|["']$/g, '') : undefined;

  // description: quoted (possibly spanning) or to next top-level key
  let description: string | undefined;
  const descQuoted = fm.match(/^description:\s*"([\s\S]*?)"\s*$/m) || fm.match(/^description:\s*'([\s\S]*?)'\s*$/m);
  if (descQuoted) {
    description = descQuoted[1].trim();
  } else {
    const descLine = fm.match(/^description:\s*(.+)$/m);
    if (descLine) description = descLine[1].trim().replace(/^["']|["']$/g, '');
  }

  const metaMatch = fm.match(/^metadata:\s*(\{[\s\S]*\})\s*$/m);
  let metadataObj: unknown;
  let metadataError = false;
  if (metaMatch) {
    try {
      metadataObj = JSON.parse(metaMatch[1]);
    } catch {
      metadataError = true;
    }
  }

  return {
    hasFrontmatter: true,
    name,
    description,
    metadataRaw: metaMatch?.[1],
    metadataObj,
    metadataError,
    body,
  };
}

function validate(md: string): { checks: Check[]; descTokens: number } {
  const p = parse(md);
  const checks: Check[] = [];

  if (!p.hasFrontmatter) {
    checks.push({ label: 'Frontmatter', status: 'fail', detail: 'No YAML frontmatter block (--- … ---) found.' });
    return { checks, descTokens: 0 };
  }
  checks.push({ label: 'Frontmatter', status: 'pass', detail: 'YAML frontmatter block found.' });

  // name
  if (!p.name) {
    checks.push({ label: 'name', status: 'fail', detail: 'Missing required `name` field.' });
  } else if (!/^[a-z0-9]+([-_][a-z0-9]+)*$/.test(p.name)) {
    checks.push({ label: 'name', status: 'warn', detail: `"${p.name}" should be kebab-case or snake_case (lowercase).` });
  } else {
    checks.push({ label: 'name', status: 'pass', detail: `"${p.name}" — valid kebab/snake case.` });
  }

  // description presence
  const descTokens = p.description ? estimateTokens(p.description) : 0;
  if (!p.description) {
    checks.push({ label: 'description', status: 'fail', detail: 'Missing required `description` — this is the routing signal.' });
  } else if (descTokens > 250) {
    checks.push({ label: 'description length', status: 'warn', detail: `~${descTokens} tokens — over the ~250-token budget; tighten it.` });
  } else {
    checks.push({ label: 'description length', status: 'pass', detail: `~${descTokens} tokens (≤250 budget).` });
  }

  // description "Use when" triggers
  if (p.description) {
    const hasTriggers = /use when|当|use this when|trigger/i.test(p.description);
    checks.push({
      label: 'description triggers',
      status: hasTriggers ? 'pass' : 'warn',
      detail: hasTriggers
        ? 'Spells out when to invoke (good for routing).'
        : 'Consider adding "Use when (1)… (2)…" so the agent routes reliably.',
    });
  }

  // metadata
  if (p.metadataError) {
    checks.push({ label: 'metadata', status: 'fail', detail: '`metadata` is present but is not valid JSON.' });
  } else if (!p.metadataObj) {
    checks.push({ label: 'metadata', status: 'warn', detail: 'No `metadata.openclaw` — optional, but recommended (emoji, requires).' });
  } else {
    const oc = (p.metadataObj as Record<string, unknown>)?.openclaw as Record<string, unknown> | undefined;
    if (!oc) {
      checks.push({ label: 'metadata', status: 'warn', detail: 'metadata has no `openclaw` key.' });
    } else {
      checks.push({ label: 'metadata.openclaw', status: 'pass', detail: 'present.' });
      const requires = oc.requires as Record<string, unknown> | undefined;
      if (requires && requires.bins !== undefined && !Array.isArray(requires.bins)) {
        checks.push({ label: 'requires.bins', status: 'warn', detail: '`requires.bins` should be an array, e.g. ["git"].' });
      } else if (requires?.bins) {
        checks.push({ label: 'requires.bins', status: 'pass', detail: `declares deps: ${(requires.bins as string[]).join(', ')}.` });
      }
    }
  }

  // body sections
  const hasBody = p.body.trim().length > 0;
  checks.push({
    label: 'body',
    status: hasBody ? 'pass' : 'warn',
    detail: hasBody ? 'Markdown body present (instructions for the agent).' : 'Empty body — add Trigger/Process/Rules sections.',
  });

  return { checks, descTokens };
}

const statusIcon = {
  pass: CheckCircle2,
  warn: TriangleAlert,
  fail: XCircle,
};
const statusColor = {
  pass: 'text-[var(--color-green-300)] border-[var(--color-green-300)]/25 bg-[var(--color-green-300)]/8',
  warn: 'text-[var(--color-amber-300)] border-[var(--color-amber-300)]/25 bg-[var(--color-amber-300)]/8',
  fail: 'text-[var(--color-amber-300)] border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/12',
};

export default function OpenClawSkillPreview() {
  const zh = useLocale() === 'zh';
  const [md, setMd] = useState(SAMPLE);
  const { checks, descTokens } = useMemo(() => validate(md), [md]);

  const fails = checks.filter((c) => c.status === 'fail').length;
  const warns = checks.filter((c) => c.status === 'warn').length;
  const verdict = fails > 0 ? 'fail' : warns > 0 ? 'warn' : 'pass';

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
              {zh ? 'SKILL.md 校验器 — 实时试用' : 'SKILL.md validator — try it live'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '粘贴或编辑一个 SKILL.md。这会解析 frontmatter 并按 OpenClaw Agent-Skills 规范校验——name 命名、description token 预算（≤250）、metadata 结构、触发措辞——并估算 description 的 token 成本。全部在客户端。'
                : "Paste or edit a SKILL.md. This parses the frontmatter and checks it against the OpenClaw Agent-Skills spec — name casing, the description token budget (≤250), metadata shape, trigger phrasing — and estimates the description's token cost. All client-side."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMd(SAMPLE)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18"
          >
            <RotateCcw className="h-4 w-4" /> {zh ? '重置示例' : 'Reset sample'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            SKILL.md
          </p>
          <textarea
            value={md}
            onChange={(e) => setMd(e.target.value)}
            rows={18}
            spellCheck={false}
            className="w-full resize-y rounded-[20px] border border-[var(--color-border-default)] bg-black/20 p-4 font-mono text-xs leading-6 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-green-300)]/40"
          />
        </div>

        <div className="space-y-4">
          <div
            className={`rounded-[24px] border p-5 ${
              verdict === 'pass'
                ? 'border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/8'
                : 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                {zh ? '结论' : 'Verdict'}
              </p>
              <span className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-[11px] text-[var(--color-text-muted)]">
                desc ≈ {descTokens} tok
              </span>
            </div>
            <p
              className={`mt-2 text-2xl font-semibold ${
                verdict === 'pass' ? 'text-[var(--color-green-300)]' : 'text-[var(--color-amber-300)]'
              }`}
            >
              {verdict === 'pass'
                ? zh ? '通过 ✓' : 'Valid ✓'
                : verdict === 'warn'
                  ? zh ? `${warns} 处提示` : `${warns} warning${warns === 1 ? '' : 's'}`
                  : zh ? `${fails} 处错误` : `${fails} error${fails === 1 ? '' : 's'}`}
            </p>
          </div>

          <div className="space-y-2.5">
            {checks.map((c, i) => {
              const Icon = statusIcon[c.status];
              return (
                <div key={`${c.label}-${i}`} className={`rounded-[18px] border p-3.5 ${statusColor[c.status]}`}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">{c.label}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-muted)]">{c.detail}</p>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] leading-5 text-[var(--color-text-muted)]">
            {zh ? (
              <>
                <code>description</code> 是最关键的字段——Agent 靠它判断要不要调用这个 skill，而且它常驻系统提示，所以 token
                成本是真实的预算考量。编辑上面的示例，看校验项实时更新。
              </>
            ) : (
              <>
                The <code>description</code> is the highest-leverage field — it&apos;s what the agent matches against to
                decide whether to invoke the skill, and it lives in the system prompt, so its token cost is a real budget
                concern. Edit the sample above and watch the checks update.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
