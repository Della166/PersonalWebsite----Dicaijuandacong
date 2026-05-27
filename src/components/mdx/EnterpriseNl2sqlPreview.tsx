'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Layers,
  LineChart,
  Sparkles,
} from 'lucide-react';

// Faithful to the actual course materials in:
//   Y:/agent/九天菜菜/.../【正在更新】热门工业级案例/案例7：大模型SQL编程性能微调/
// Notebook: 企业私有化Nl2SQL模型微调实战.ipynb
//
// The real project has two parts:
//   1) "data_create" — a 6-step pipeline that turns a private DB into Alpaca-format training data
//   2) "nl2sql_fine_tuning" — LLaMA-Factory CLI (Qwen3-4B + LoRA r=8 α=16) OR a custom train_lora.py on DeepSeek-Coder 6.7B
// Eval is BLEU-4 + ROUGE-1/2/L from llamafactory-cli predict_with_generate=True.

const PIPELINE_STEPS = [
  {
    name: 'DB connect',
    detail: 'PyMySQL / psycopg2 / pyodbc · validate reachability of MySQL / Postgres / SQL Server.',
  },
  {
    name: 'Metadata extractor',
    detail: 'All columns (name, type, nullable, comment) + primary keys + foreign keys.',
  },
  {
    name: 'Table cards',
    detail: 'Compress full metadata into LLM-digestible table summaries; preserve FK links.',
  },
  {
    name: 'Topic planning · LLM stage A',
    detail: 'LLM groups related tables into business topics and allocates a per-topic sample budget.',
  },
  {
    name: 'Sample generation · LLM stage B',
    detail: 'Per topic: build prompt with full DDL + dialect → LLM emits NL ↔ SQL pairs.',
  },
  {
    name: 'SQL validation + export',
    detail: 'SQLGlot syntax check → write Alpaca / ShareGPT JSONL → ready for LLaMA-Factory.',
  },
] as const;

interface AlpacaSample {
  instruction: string;
  input: string;
  output: string;
}

interface SchemaCase {
  key: string;
  label: string;
  origin: string;
  tables: Array<{ name: string; ddl: string[] }>;
  sample: AlpacaSample;
}

// CSpider concert_singer is the textbook example used to introduce schema-aware NL2SQL
// in the notebook (cell 91). Keep its DDL & sample short but recognizable.
const SCHEMAS: SchemaCase[] = [
  {
    key: 'concert_singer',
    label: 'concert_singer (Spider / CSpider)',
    origin: 'The canonical Spider / CSpider DB used in the notebook (cell 91) as the schema-aware NL2SQL textbook case.',
    tables: [
      {
        name: 'singer',
        ddl: [
          'CREATE TABLE singer (',
          '  Singer_ID INT PRIMARY KEY,',
          '  Name TEXT,',
          '  Country TEXT,',
          '  Song_Name TEXT,',
          '  Song_release_year TEXT,',
          '  Age INT,',
          '  Is_male BOOL',
          ');',
        ],
      },
      {
        name: 'concert',
        ddl: [
          'CREATE TABLE concert (',
          '  concert_ID INT PRIMARY KEY,',
          '  concert_Name TEXT,',
          '  Theme TEXT,',
          '  Stadium_ID INT,',
          '  Year TEXT',
          ');',
        ],
      },
    ],
    sample: {
      instruction: '将下面的自然语言问题转换为SQL查询语句。',
      input: 'How many singers do we have?',
      output: 'SELECT count(*) FROM singer',
    },
  },
  {
    key: 'sales_chinese',
    label: '中文销售场景',
    origin: 'The notebook\'s narrative example for "private NL2SQL" — what the data_create pipeline produces for a real company DB.',
    tables: [
      {
        name: 'sales',
        ddl: [
          'CREATE TABLE sales (',
          '  area_name VARCHAR(50),',
          '  total_sales DECIMAL(12,2),',
          '  sale_date DATE',
          ');',
        ],
      },
    ],
    sample: {
      instruction: '将下面的自然语言问题转换为SQL查询语句。',
      input: '查询上个月销售额最高的地区',
      output:
        "SELECT area_name, SUM(total_sales) AS total\nFROM sales\nWHERE sale_date >= DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01')\n  AND sale_date <  DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')\nGROUP BY area_name\nORDER BY total DESC\nLIMIT 1;",
    },
  },
];

// llamafactory-cli train output from the notebook (cells 173/176).
const EVAL = [
  { metric: 'BLEU-4', before: 10.25, after: 22.9, note: '+123%, 不可用 → 可用' },
  { metric: 'ROUGE-1', before: 19.14, after: 44.67, note: '+133%, 差 → 良好' },
  { metric: 'ROUGE-2', before: 5.35, after: 14.54, note: '+172%, 很差 → 中等' },
  { metric: 'ROUGE-L', before: 10.31, after: 28.05, note: '+172%, 差 → 良好' },
] as const;

// Real llamafactory-cli train command from cell 145.
const TRAIN_CMD = `llamafactory-cli train \\
    --stage sft \\
    --model_name_or_path /home/ubuntu/Qwen3-4B \\
    --finetuning_type lora \\
    --template qwen3_nothink \\
    --dataset_dir data \\
    --dataset sql_train_alpaca \\
    --cutoff_len 2048 \\
    --learning_rate 5e-05 \\
    --num_train_epochs 3.0 \\
    --per_device_train_batch_size 8 \\
    --gradient_accumulation_steps 8 \\
    --lr_scheduler_type cosine \\
    --bf16 True \\
    --lora_rank 8 \\
    --lora_alpha 16 \\
    --lora_target all`;

export default function EnterpriseNl2sqlPreview() {
  const [activeSchema, setActiveSchema] = useState<string>(SCHEMAS[0].key);
  const schema = useMemo(
    () => SCHEMAS.find((s) => s.key === activeSchema) ?? SCHEMAS[0],
    [activeSchema],
  );

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(212,165,116,0.12),rgba(127,188,140,0.08))] px-6 py-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/20 bg-[var(--color-amber-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-amber-300)]">
          <Sparkles className="h-3.5 w-3.5" />
          Faithful walkthrough · data_create + LoRA
        </div>
        <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          From a private DB to a fine-tuned Qwen3-4B NL2SQL model
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
          The project ships two halves: a six-step pipeline that turns DB metadata into Alpaca-format
          training data (data_create), and a LLaMA-Factory LoRA recipe on Qwen3-4B
          (nl2sql_fine_tuning). The numbers below are the predict_with_generate eval before vs
          after that LoRA pass.
        </p>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[var(--color-green-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                data_create · 6-step generation pipeline
              </p>
            </div>
            <div className="mt-4 space-y-2">
              {PIPELINE_STEPS.map((s, i) => (
                <div
                  key={s.name}
                  className="flex items-start gap-3 rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/10 text-xs font-semibold text-[var(--color-green-300)]">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{s.name}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Real Alpaca-format training sample
              </p>
              <div className="flex gap-2">
                {SCHEMAS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setActiveSchema(s.key)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      activeSchema === s.key
                        ? 'border-[var(--color-green-300)]/40 bg-[var(--color-green-300)]/14 text-[var(--color-green-300)]'
                        : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)]">{schema.origin}</p>

            <div className="mt-4 space-y-3">
              {schema.tables.map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-[var(--color-border-default)] bg-black/15 p-3 font-mono text-[12px] leading-5 text-[var(--color-text-secondary)]"
                >
                  {t.ddl.map((line) => (
                    <p key={line} className="whitespace-pre">
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            <pre className="mt-4 overflow-x-auto rounded-2xl border border-[var(--color-border-default)] bg-black/40 p-4 font-mono text-[12px] leading-6 text-[var(--color-text-secondary)]">
{`{
  "instruction": ${JSON.stringify(schema.sample.instruction)},
  "input":       ${JSON.stringify(schema.sample.input)},
  "output":      ${JSON.stringify(schema.sample.output)}
}`}
            </pre>
            <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">
              This is exactly the Alpaca shape LLaMA-Factory expects via{' '}
              <code className="rounded bg-black/40 px-1 py-0.5">--dataset sql_train_alpaca</code>.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Stage 1 · LLaMA-Factory CLI · real train command
              </p>
            </div>
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-[var(--color-border-default)] bg-black/40 p-4 font-mono text-[11px] leading-5 text-[var(--color-text-secondary)]">
              {TRAIN_CMD}
            </pre>
            <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-muted)]">
              Effective batch = 8 × 8 = 64 · cosine scheduler · bf16 mixed precision · LoRA on all
              linear layers. Loss drops from ~3.0 → ~0.3 over ~400 steps (notebook §10).
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center gap-2">
              <LineChart className="h-4 w-4 text-[var(--color-green-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                predict_with_generate eval · before → after LoRA
              </p>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-border-default)]">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-black/15 text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Metric</th>
                    <th className="px-3 py-2 font-semibold">Before</th>
                    <th className="px-3 py-2 font-semibold">After</th>
                    <th className="px-3 py-2 font-semibold">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {EVAL.map((row, i) => (
                    <tr
                      key={row.metric}
                      className={`${
                        i % 2 === 0 ? 'bg-transparent' : 'bg-black/5'
                      } border-t border-[var(--color-border-default)]/60`}
                    >
                      <td className="px-3 py-2 font-semibold text-[var(--color-text-primary)]">
                        {row.metric}
                      </td>
                      <td className="px-3 py-2 font-mono text-[var(--color-text-muted)]">
                        {row.before.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 font-mono text-[var(--color-green-300)]">
                        {row.after.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-xs text-[var(--color-text-secondary)]">
                        {row.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-muted)]">
              Same dataset, same generation config (max_new_tokens=512, top_p=0.7, temperature=0.95).
              Inference speed essentially unchanged (0.94 → 0.904 samples/sec on ~1034 dev
              samples).
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--color-green-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Stage 2 · custom train_lora.py on DeepSeek-Coder 6.7B
              </p>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border-default)] px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                  Trainable params
                </span>
                <span className="font-mono text-xs text-[var(--color-green-300)]">~40M / 6.7B (0.59%)</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border-default)] px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                  Syntax-valid SQL rate
                </span>
                <span className="font-mono text-xs text-[var(--color-green-300)]">91%</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border-default)] px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                  Execution-matches-gold rate
                </span>
                <span className="font-mono text-xs text-[var(--color-green-300)]">61%</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border-default)] px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                  vLLM batch throughput
                </span>
                <span className="font-mono text-xs text-[var(--color-green-300)]">351 samples/s</span>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-muted)]">
              Eval splits text-match (BLEU/ROUGE) from execution-match (run both SQL on a real DB
              and compare result sets) — the project counts the latter as the truth signal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
