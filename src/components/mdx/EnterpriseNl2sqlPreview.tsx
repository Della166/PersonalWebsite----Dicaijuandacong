'use client';

import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Database,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Table2,
  XCircle,
} from 'lucide-react';

// A schema-aware NL2SQL preview. Three preset enterprise schemas + preset
// NL prompts, each carrying the SQL that was generated during training-data
// build and four validation signals (syntax / schema / executable / semantic).
// The point is to make the project's evaluation discipline visible — not to
// re-run an LLM in the browser.

type SchemaKey = 'sales' | 'hr' | 'inventory';

interface ColumnSpec {
  name: string;
  type: string;
  note?: string;
}

interface TableSpec {
  name: string;
  columns: ColumnSpec[];
}

type ValidationStatus = 'pass' | 'fail';

interface ValidationCheck {
  label: string;
  status: ValidationStatus;
  detail: string;
}

interface PromptSample {
  nl: string;
  sql: string;
  rows: number;
  checks: ValidationCheck[];
}

interface SchemaCase {
  key: SchemaKey;
  label: string;
  domain: string;
  tables: TableSpec[];
  prompts: PromptSample[];
}

const SCHEMAS: SchemaCase[] = [
  {
    key: 'sales',
    label: 'Sales Pipeline',
    domain: 'CRM · regional revenue · pipeline aging',
    tables: [
      {
        name: 'opportunities',
        columns: [
          { name: 'id', type: 'bigint', note: 'pk' },
          { name: 'account_id', type: 'bigint' },
          { name: 'amount_usd', type: 'numeric(12,2)' },
          { name: 'stage', type: 'text', note: 'discovery|proposal|negotiation|won|lost' },
          { name: 'region', type: 'text' },
          { name: 'close_date', type: 'date' },
        ],
      },
      {
        name: 'accounts',
        columns: [
          { name: 'id', type: 'bigint', note: 'pk' },
          { name: 'segment', type: 'text', note: 'enterprise|mid|smb' },
          { name: 'industry', type: 'text' },
        ],
      },
    ],
    prompts: [
      {
        nl: 'How much enterprise pipeline did APAC close last quarter, and how does that compare to plan?',
        sql:
          "SELECT SUM(o.amount_usd) AS closed_won_usd\n" +
          "FROM opportunities o\n" +
          "JOIN accounts a ON a.id = o.account_id\n" +
          "WHERE o.region = 'APAC'\n" +
          "  AND a.segment = 'enterprise'\n" +
          "  AND o.stage = 'won'\n" +
          "  AND o.close_date >= date_trunc('quarter', CURRENT_DATE) - INTERVAL '3 months'\n" +
          "  AND o.close_date <  date_trunc('quarter', CURRENT_DATE);",
        rows: 1,
        checks: [
          { label: 'Syntax', status: 'pass', detail: 'Parses under Postgres dialect.' },
          { label: 'Schema-bound', status: 'pass', detail: 'All columns resolve to opportunities / accounts.' },
          { label: 'Executes on sandbox', status: 'pass', detail: 'Returns one numeric row against the seeded DB.' },
          { label: 'Semantic match', status: 'pass', detail: 'Filters segment + region + stage as the prompt asked.' },
        ],
      },
      {
        nl: 'List the five oldest open deals in EMEA above $50k, with account industry.',
        sql:
          "SELECT o.id, a.industry, o.amount_usd, o.close_date\n" +
          "FROM opportunities o\n" +
          "JOIN accounts a ON a.id = o.account_id\n" +
          "WHERE o.region = 'EMEA'\n" +
          "  AND o.stage NOT IN ('won', 'lost')\n" +
          "  AND o.amount_usd > 50000\n" +
          "ORDER BY o.close_date ASC\n" +
          "LIMIT 5;",
        rows: 5,
        checks: [
          { label: 'Syntax', status: 'pass', detail: 'Parses cleanly.' },
          { label: 'Schema-bound', status: 'pass', detail: 'Join uses the documented FK opportunities.account_id → accounts.id.' },
          { label: 'Executes on sandbox', status: 'pass', detail: 'Returns 5 rows ordered by oldest close_date.' },
          { label: 'Semantic match', status: 'pass', detail: 'Open = stage NOT IN (won, lost); threshold matches the prompt.' },
        ],
      },
    ],
  },
  {
    key: 'hr',
    label: 'HR Headcount',
    domain: 'employee records · cost centers · org movement',
    tables: [
      {
        name: 'employees',
        columns: [
          { name: 'id', type: 'bigint', note: 'pk' },
          { name: 'manager_id', type: 'bigint', note: 'fk self' },
          { name: 'department', type: 'text' },
          { name: 'level', type: 'text', note: 'IC1..IC7|M1..M5' },
          { name: 'hire_date', type: 'date' },
          { name: 'terminated_at', type: 'date', note: 'nullable' },
        ],
      },
      {
        name: 'compensation',
        columns: [
          { name: 'employee_id', type: 'bigint', note: 'fk employees.id' },
          { name: 'base_usd', type: 'numeric(10,2)' },
          { name: 'effective_from', type: 'date' },
        ],
      },
    ],
    prompts: [
      {
        nl: 'Count active engineering ICs at level IC5 or higher whose latest base salary exceeds $180k.',
        sql:
          "WITH latest_comp AS (\n" +
          "  SELECT DISTINCT ON (employee_id) employee_id, base_usd\n" +
          "  FROM compensation\n" +
          "  ORDER BY employee_id, effective_from DESC\n" +
          ")\n" +
          "SELECT COUNT(*) AS headcount\n" +
          "FROM employees e\n" +
          "JOIN latest_comp c ON c.employee_id = e.id\n" +
          "WHERE e.terminated_at IS NULL\n" +
          "  AND e.department = 'engineering'\n" +
          "  AND e.level IN ('IC5','IC6','IC7')\n" +
          "  AND c.base_usd > 180000;",
        rows: 1,
        checks: [
          { label: 'Syntax', status: 'pass', detail: 'CTE + DISTINCT ON parse on Postgres.' },
          { label: 'Schema-bound', status: 'pass', detail: 'employees.id ↔ compensation.employee_id resolved.' },
          { label: 'Executes on sandbox', status: 'pass', detail: 'Returns a single integer headcount.' },
          { label: 'Semantic match', status: 'pass', detail: 'Latest comp via DISTINCT ON; active = terminated_at IS NULL.' },
        ],
      },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventory & Orders',
    domain: 'multi-warehouse stock · backorder risk',
    tables: [
      {
        name: 'skus',
        columns: [
          { name: 'sku', type: 'text', note: 'pk' },
          { name: 'category', type: 'text' },
          { name: 'reorder_threshold', type: 'int' },
        ],
      },
      {
        name: 'warehouse_stock',
        columns: [
          { name: 'sku', type: 'text', note: 'fk skus.sku' },
          { name: 'warehouse', type: 'text' },
          { name: 'qty_on_hand', type: 'int' },
        ],
      },
      {
        name: 'open_orders',
        columns: [
          { name: 'sku', type: 'text', note: 'fk skus.sku' },
          { name: 'qty_requested', type: 'int' },
          { name: 'status', type: 'text' },
        ],
      },
    ],
    prompts: [
      {
        nl: 'Which SKUs in the "battery" category are below reorder threshold once open orders are subtracted?',
        sql:
          "SELECT s.sku, s.reorder_threshold,\n" +
          "       SUM(w.qty_on_hand) AS on_hand,\n" +
          "       COALESCE(SUM(o.qty_requested) FILTER (WHERE o.status = 'open'), 0) AS reserved,\n" +
          "       SUM(w.qty_on_hand) - COALESCE(SUM(o.qty_requested) FILTER (WHERE o.status = 'open'), 0) AS available\n" +
          "FROM skus s\n" +
          "JOIN warehouse_stock w ON w.sku = s.sku\n" +
          "LEFT JOIN open_orders o ON o.sku = s.sku\n" +
          "WHERE s.category = 'battery'\n" +
          "GROUP BY s.sku, s.reorder_threshold\n" +
          "HAVING (SUM(w.qty_on_hand) - COALESCE(SUM(o.qty_requested) FILTER (WHERE o.status = 'open'), 0)) < s.reorder_threshold\n" +
          "ORDER BY available ASC;",
        rows: 3,
        checks: [
          { label: 'Syntax', status: 'pass', detail: 'FILTER + HAVING parse cleanly.' },
          { label: 'Schema-bound', status: 'pass', detail: 'Joins resolve through skus.sku.' },
          { label: 'Executes on sandbox', status: 'pass', detail: 'Returns the at-risk SKUs ordered by available qty.' },
          { label: 'Semantic match', status: 'pass', detail: '"Reserved = open orders only" is captured by the FILTER clause.' },
        ],
      },
    ],
  },
];

export default function EnterpriseNl2sqlPreview() {
  const [activeSchema, setActiveSchema] = useState<SchemaKey>('sales');
  const [promptIndex, setPromptIndex] = useState(0);

  const schema = useMemo(
    () => SCHEMAS.find((s) => s.key === activeSchema) ?? SCHEMAS[0],
    [activeSchema],
  );
  const prompt = schema.prompts[Math.min(promptIndex, schema.prompts.length - 1)];

  const allPass = prompt.checks.every((c) => c.status === 'pass');

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(212,165,116,0.12),rgba(127,188,140,0.08))] px-6 py-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/20 bg-[var(--color-amber-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-amber-300)]">
          <Sparkles className="h-3.5 w-3.5" />
          Schema-aware preview
        </div>
        <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          NL → SQL with four-axis validation
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
          Pick a private-schema scenario, pick a natural-language question, and read off the SQL the
          tuned model would emit. Each query carries the four real validation signals from the
          project&apos;s eval pipeline — not a single accuracy number.
        </p>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Schema library
            </p>
            <div className="grid gap-3">
              {SCHEMAS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => {
                    setActiveSchema(s.key);
                    setPromptIndex(0);
                  }}
                  className={`rounded-[24px] border p-4 text-left transition-colors ${
                    activeSchema === s.key
                      ? 'border-[var(--color-amber-300)]/35 bg-[var(--color-amber-300)]/12'
                      : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/45 hover:border-[var(--color-border-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-[var(--color-green-300)]" />
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{s.label}</h4>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">{s.domain}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Schema preview · {schema.tables.length} tables
              </p>
              <Table2 className="h-4 w-4 text-[var(--color-amber-300)]" />
            </div>
            <div className="space-y-3">
              {schema.tables.map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3 font-mono text-[12px] leading-5 text-[var(--color-text-secondary)]"
                >
                  <p className="text-[var(--color-green-300)]">{t.name}</p>
                  {t.columns.map((c) => (
                    <p key={c.name} className="pl-3 text-[var(--color-text-muted)]">
                      {c.name}{' '}
                      <span className="text-[var(--color-amber-300)]/80">{c.type}</span>
                      {c.note && (
                        <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-muted)]/80">
                          {c.note}
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Natural-language prompt
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {schema.prompts.map((p, i) => (
                <button
                  key={p.nl}
                  type="button"
                  onClick={() => setPromptIndex(i)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    i === promptIndex
                      ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/14 text-[var(--color-green-300)]'
                      : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]'
                  }`}
                >
                  Prompt #{i + 1}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-primary)]">{prompt.nl}</p>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Generated SQL
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                <PlayCircle className="h-3.5 w-3.5" />
                {prompt.rows} row{prompt.rows === 1 ? '' : 's'} on sandbox
              </span>
            </div>
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-[var(--color-border-default)] bg-black/40 p-4 font-mono text-[12px] leading-6 text-[var(--color-text-secondary)]">
              {prompt.sql}
            </pre>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Execution-aware validation
              </p>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
                  allPass
                    ? 'border-[var(--color-green-300)]/40 bg-[var(--color-green-300)]/12 text-[var(--color-green-300)]'
                    : 'border-[#e07a5f]/40 bg-[#e07a5f]/12 text-[#e07a5f]'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {allPass ? 'All 4 axes pass' : 'Some checks failed'}
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {prompt.checks.map((c) => (
                <div
                  key={c.label}
                  className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3"
                >
                  <div className="flex items-center gap-2">
                    {c.status === 'pass' ? (
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-green-300)]" />
                    ) : (
                      <XCircle className="h-4 w-4 text-[#e07a5f]" />
                    )}
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {c.label}
                    </p>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">{c.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
