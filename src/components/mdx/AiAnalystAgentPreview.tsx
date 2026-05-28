'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  BarChart3,
  Database,
  GitBranch,
  Lightbulb,
  LoaderCircle,
  Play,
  Sparkles,
  TreeDeciduous,
  Wrench,
} from 'lucide-react';

type StageKey = 'idle' | 'plan' | 'text2sql' | 'fit_linear' | 'fit_tree' | 'recommend' | 'complete';

interface ToolCall {
  key: Exclude<StageKey, 'idle' | 'complete'>;
  tool: string;
  label: string;
  detail: string;
}

interface LinearTerm {
  name: string;
  coef: number;
  contribution: number; // share of explained per-capita spend, illustrative
}

interface TreeRule {
  path: string;
  predict: string;
  samples: number;
}

const question = '哪些因素在驱动园区餐饮的客单消费？给一条可执行建议。';
const questionEn =
  'Which factors drive the theme-park F&B per-capita spend? Give one actionable recommendation.';

// The SQL the Text2SQL tool (LangChain create_sql_agent) emits — illustrative shape over a MySQL business DB.
const emittedSql = `SELECT d.date, d.is_holiday, d.has_event, d.ticket_price,
       d.promo_intensity, d.weather_code,
       f.fnb_revenue, f.visitors,
       f.fnb_revenue / NULLIF(f.visitors, 0) AS fnb_per_capita
FROM   fact_daily_fnb f
JOIN   dim_day d ON d.date = f.date
WHERE  f.date >= DATE_SUB(CURDATE(), INTERVAL 180 DAY)
ORDER  BY d.date;`;

// LinearRegression decomposition of per-capita F&B spend.
// Money_normal·N_normal + Money_card·N_card + Money_promo·N_promo ≈ revenue
const linearTerms: LinearTerm[] = [
  { name: 'Money_normal · N_normal', coef: 38.5, contribution: 0.52 },
  { name: 'Money_card · N_card', coef: 52.1, contribution: 0.31 },
  { name: 'Money_promo · N_promo', coef: 21.4, contribution: 0.17 },
];
const linearR2 = 0.86; // illustrative fit quality

// DecisionTreeRegressor(max_depth=4) + export_text → human-readable driver rules.
const treeRules: TreeRule[] = [
  { path: 'has_event ≤ 0.5  →  promo_intensity ≤ 0.30', predict: '客单 ≈ 31.2', samples: 74 },
  { path: 'has_event ≤ 0.5  →  promo_intensity > 0.30', predict: '客单 ≈ 44.8', samples: 41 },
  { path: 'has_event > 0.5  →  is_holiday ≤ 0.5', predict: '客单 ≈ 58.6', samples: 38 },
  { path: 'has_event > 0.5  →  is_holiday > 0.5', predict: '客单 ≈ 72.3', samples: 27 },
];
const topFeatures = [
  { name: 'has_event（是否有活动/演出）', importance: 0.41 },
  { name: 'is_holiday（节假日）', importance: 0.27 },
  { name: 'promo_intensity（促销力度）', importance: 0.19 },
  { name: 'ticket_price（票价）', importance: 0.08 },
  { name: 'weather_code（天气）', importance: 0.05 },
];

const toolCalls: ToolCall[] = [
  {
    key: 'plan',
    tool: 'agent.plan (Function-Calling)',
    label: 'Plan',
    detail: 'deepseek-chat / Qwen-Agent reads the question → decides: pull features, then fit an interpretable model.',
  },
  {
    key: 'text2sql',
    tool: 'text2sql_tool',
    label: 'Text2SQL',
    detail: 'LangChain create_sql_agent + SQLDatabaseToolkit → introspect schema → emit + run SQL on the MySQL business DB.',
  },
  {
    key: 'fit_linear',
    tool: 'auto_model_tool · LinearRegression',
    label: 'Fit linear',
    detail: 'Decompose per-capita F&B spend into normal / card / promo terms → read the coefficients.',
  },
  {
    key: 'fit_tree',
    tool: 'auto_model_tool · DecisionTreeRegressor(max_depth=4)',
    label: 'Fit tree',
    detail: 'export_text / plot_tree → which factors drive revenue: events / holidays / ticket-price / promo / weather.',
  },
  {
    key: 'recommend',
    tool: 'agent.summarize',
    label: 'Recommend',
    detail: 'Turn coefficients + tree rules into a human-readable recommendation.',
  },
];

const stageOrder: StageKey[] = ['idle', 'plan', 'text2sql', 'fit_linear', 'fit_tree', 'recommend', 'complete'];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function AiAnalystAgentPreview() {
  const zh = useLocale() === 'zh';
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [timeline, setTimeline] = useState<string[]>([]);

  const reset = () => {
    setStage('idle');
    setTimeline([]);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const run = async () => {
      setStage('plan');
      setTimeline(['agent.plan: question is concrete → orchestrate text2sql → auto-model → recommend.']);

      await wait(560);
      if (cancelled) return;
      setStage('text2sql');
      setTimeline((prev) => [...prev, 'text2sql_tool: create_sql_agent introspects schema, emits SQL, runs it on MySQL → 180 rows.']);

      await wait(680);
      if (cancelled) return;
      setStage('fit_linear');
      setTimeline((prev) => [...prev, `auto_model_tool: LinearRegression on per-capita spend → R² ≈ ${linearR2}.`]);

      await wait(620);
      if (cancelled) return;
      setStage('fit_tree');
      setTimeline((prev) => [...prev, 'auto_model_tool: DecisionTreeRegressor(max_depth=4) + export_text → driver rules.']);

      await wait(640);
      if (cancelled) return;
      setStage('recommend');
      setTimeline((prev) => [...prev, 'agent.summarize: coefficients + tree rules → recommendation.']);

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

  const reached = (key: StageKey) => stageOrder.indexOf(stage) >= stageOrder.indexOf(key);
  const maxImportance = Math.max(...topFeatures.map((f) => f.importance));

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
              {zh ? '运行 AI Analyst 工具编排' : 'Run the AI Analyst tool orchestration'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '一个 LLM 当分析师：自己写 SQL 拉特征（Text2SQL）→ 自己拟合可解释模型（线性回归拆解客单 + 决策树找驱动因子）→ 给出可执行建议。看它逐步调用工具。'
                : 'An LLM acting as an analyst: writes SQL to pull features (Text2SQL) → fits its own interpretable models (linear regression to decompose spend + a decision tree to find drivers) → returns a recommendation. Watch the tool calls.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '分析中' : 'Analyzing') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '运行分析' : 'Run analysis'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '业务问题' : 'Business question'}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">{zh ? question : questionEn}</p>
          </div>

          <div className="grid gap-3">
            {toolCalls.map((item) => {
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
                  <div className="flex items-center gap-2">
                    <Wrench className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                    <p className="font-mono text-[11px] text-[var(--color-text-secondary)]">{item.tool}</p>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">{item.detail}</p>
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
                  <p key={`${item}-${index}`} className="font-mono text-[11px] leading-5 text-[var(--color-text-secondary)]">
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                  {zh ? '运行分析，看 LLM 逐个调用工具：写 SQL → 拟合模型 → 给建议。' : 'Run the analysis to watch the LLM call its tools one by one: write SQL → fit models → recommend.'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            {zh ? '工具产出' : 'Tool outputs'}
          </p>

          {!reached('text2sql') && (
            <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] px-4 py-10 text-center text-sm leading-6 text-[var(--color-text-muted)]">
              {zh ? '工具产出（SQL、拟合系数、决策树规则、建议）会随 Agent 运行出现在这里。' : 'Tool outputs (SQL, fitted coefficients, decision-tree rules, recommendation) appear here as the agent runs.'}
            </div>
          )}

          {reached('text2sql') && (
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-[var(--color-amber-300)]" />
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? 'Text2SQL：拉取特征' : 'Text2SQL: pull features'}</p>
              </div>
              <pre className="mt-3 overflow-x-auto rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-3 font-mono text-[10.5px] leading-5 text-[var(--color-text-secondary)]">
{emittedSql}
              </pre>
              <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">{zh ? '→ MySQL 执行 → 180 行（近 6 个月每日特征）' : '→ MySQL runs it → 180 rows (daily features, ~6 months)'}</p>
            </div>
          )}

          {reached('fit_linear') && (
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[var(--color-amber-300)]" />
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? 'LinearRegression：拆解客单' : 'LinearRegression: decompose spend'}</p>
                </div>
                <span className="rounded-full border border-[var(--color-green-300)]/25 bg-[var(--color-green-300)]/12 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-green-300)]">
                  R² ≈ {linearR2}
                </span>
              </div>
              <p className="mt-2 font-mono text-[10.5px] leading-5 text-[var(--color-text-muted)]">
                Money_normal·N_normal + Money_card·N_card + Money_promo·N_promo ≈ revenue
              </p>
              <div className="mt-3 space-y-2">
                {linearTerms.map((t) => (
                  <div key={t.name} className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-[11px] text-[var(--color-text-secondary)]">{t.name}</p>
                      <span className="font-mono text-[11px] text-[var(--color-text-primary)]">coef {t.coef}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/25">
                      <div
                        className="h-full rounded-full bg-[var(--color-green-300)]/70"
                        style={{ width: `${Math.round(t.contribution * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reached('fit_tree') && (
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
              <div className="flex items-center gap-2">
                <TreeDeciduous className="h-4 w-4 text-[var(--color-amber-300)]" />
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? 'DecisionTree：驱动因子规则' : 'DecisionTree: driver rules'}</p>
              </div>
              <p className="mt-1.5 font-mono text-[10.5px] text-[var(--color-text-muted)]">DecisionTreeRegressor(max_depth=4).export_text()</p>

              <div className="mt-3 space-y-1.5">
                {topFeatures.map((f) => (
                  <div key={f.name} className="flex items-center gap-2">
                    <p className="w-44 shrink-0 truncate text-[11px] text-[var(--color-text-secondary)]" title={f.name}>{f.name}</p>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/25">
                      <div
                        className="h-full rounded-full bg-[var(--color-amber-300)]/70"
                        style={{ width: `${Math.round((f.importance / maxImportance) * 100)}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right font-mono text-[10px] text-[var(--color-text-muted)]">{f.importance.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-2 border-t border-[var(--color-border-default)] pt-3">
                {treeRules.map((r) => (
                  <div key={r.path} className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-3">
                    <div className="flex items-start gap-2">
                      <GitBranch className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-text-muted)]" />
                      <div className="min-w-0">
                        <p className="font-mono text-[10.5px] leading-5 text-[var(--color-text-secondary)]">{r.path}</p>
                        <p className="mt-1 text-[11px] text-[var(--color-text-primary)]">
                          {r.predict} <span className="text-[var(--color-text-muted)]">· n={r.samples}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reached('recommend') && (
            <div className="rounded-[22px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/8 p-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-[var(--color-green-300)]" />
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? '建议（deepseek-chat 汇总）' : 'Recommendation (deepseek-chat summary)'}</p>
              </div>
              <p className="mt-2 text-xs leading-6 text-[var(--color-text-secondary)]">
                {zh
                  ? '客单的最大驱动因子是「是否有活动/演出」（重要度 0.41）和节假日（0.27），二者叠加时客单最高（≈72.3）；促销在「无活动」日的边际收益更明显（31.2 → 44.8）。建议：把促销资源向无活动的工作日倾斜，并尽量让活动覆盖节假日，而不是平摊全月促销。'
                  : 'The biggest driver of per-capita spend is whether there is an event/show (importance 0.41) and holidays (0.27); their combination peaks spend (≈72.3). Promos pay off most on non-event days (31.2 → 44.8). Recommendation: concentrate promo budget on non-event weekdays and schedule events to cover holidays, rather than spreading promos evenly across the month.'}
              </p>
              <p className="mt-3 border-t border-[var(--color-border-default)] pt-2 text-[10.5px] leading-5 text-[var(--color-text-muted)]">
                {zh
                  ? '示意数据：SQL 结果、系数与决策树规则为说明性数值。真实库结构、工具与模型（create_sql_agent + LinearRegression / DecisionTreeRegressor）来自课程代码。'
                  : 'Illustrative data: the SQL result, coefficients, and tree rules are sample values. The real DB shape, tools, and models (create_sql_agent + LinearRegression / DecisionTreeRegressor) come from the course code.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
