'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  BarChart3,
  Boxes,
  FileScan,
  Gauge,
  LoaderCircle,
  Play,
  Sparkles,
  TableProperties,
} from 'lucide-react';

type StageKey = 'idle' | 'ocr' | 'analysis' | 'viz' | 'complete';

interface Quarter {
  label: string;
  revenue: number;
  yoy: string;
}

const sampleDoc = {
  zh: '2024 年各季度营收财报（PDF 截图）',
  en: '2024 quarterly revenue report (PDF scan)',
};

const quarters: Quarter[] = [
  { label: 'Q1', revenue: 128.5, yoy: '+12.4%' },
  { label: 'Q2', revenue: 142.3, yoy: '+15.1%' },
  { label: 'Q3', revenue: 156.8, yoy: '+18.3%' },
  { label: 'Q4', revenue: 171.2, yoy: '+21.0%' },
];

const totalRevenue = quarters.reduce((sum, q) => sum + q.revenue, 0); // 598.8
const maxRevenue = Math.max(...quarters.map((q) => q.revenue));

const layers: { icon: typeof FileScan; key: Exclude<StageKey, 'idle' | 'complete'>; label: string; description: string }[] = [
  {
    icon: FileScan,
    key: 'ocr',
    label: 'ocr_service → core/ocr (DeepSeek-OCR-2 · vLLM)',
    description: 'Table-structure parse → cells with row/col coordinates, not flat text.',
  },
  {
    icon: TableProperties,
    key: 'analysis',
    label: 'analysis_service → core/analysis (pandas + LLM)',
    description: 'Stats over the structured table, then an LLM summary → {summary, kpis, anomalies}.',
  },
  {
    icon: BarChart3,
    key: 'viz',
    label: 'visualization_service → core/visualization',
    description: 'LLM first picks the chart type, then the matching renderer draws it.',
  },
];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function DeepSeekOcrAnalysisPreview() {
  const zh = useLocale() === 'zh';
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [timeline, setTimeline] = useState<string[]>([]);

  const stageReached = (target: StageKey) => {
    const order: StageKey[] = ['idle', 'ocr', 'analysis', 'viz', 'complete'];
    return order.indexOf(stage) >= order.indexOf(target);
  };

  const reset = () => {
    setStage('idle');
    setTimeline([]);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const run = async () => {
      setTimeline([
        zh
          ? 'POST /api/analyze → integration_service.run() 顶层编排器启动。'
          : 'POST /api/analyze → integration_service.run() orchestrator starts.',
      ]);
      setStage('ocr');
      await wait(620);
      if (cancelled) return;
      setTimeline((prev) => [
        ...prev,
        zh
          ? 'ocr_service：vLLM 部署的 DeepSeek-OCR-2 解析表结构，0.6s/页（裸 transformers ~3s）。'
          : 'ocr_service: DeepSeek-OCR-2 on vLLM parses table structure, 0.6s/page (vs ~3s on bare transformers).',
      ]);

      await wait(720);
      if (cancelled) return;
      setStage('analysis');
      setTimeline((prev) => [
        ...prev,
        zh
          ? 'analysis_service：pandas 统计 + LLM 摘要 → {summary, kpis, anomalies}。'
          : 'analysis_service: pandas stats + LLM summary → {summary, kpis, anomalies}.',
      ]);

      await wait(720);
      if (cancelled) return;
      setStage('viz');
      setTimeline((prev) => [
        ...prev,
        zh
          ? 'visualization_service：LLM 先选图表类型（4 个时间点单指标 → 柱状图），再调对应 renderer。'
          : 'visualization_service: the LLM picks the chart type first (4 time points, one metric → bar), then calls the matching renderer.',
      ]);

      await wait(640);
      if (cancelled) return;
      setStage('complete');
      setRunning(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [running, zh]);

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
              {zh ? '运行三层数据分析管线' : 'Run the three-layer analysis pipeline'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '在一张样例财报表格上复演 OCR → 分析 → 可视化：每层是一个独立 service + core，integration_service 串起来。'
                : 'Replays OCR → analysis → visualization on a sample financial table: each layer is its own service + core, wired by integration_service.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '分析中' : 'Analyzing') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '运行管线' : 'Run pipeline'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="flex items-center gap-2">
              <FileScan className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '输入文档' : 'Input document'}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">{zh ? sampleDoc.zh : sampleDoc.en}</p>
          </div>

          <div className="grid gap-3">
            {layers.map((item) => {
              const isActive = stage === item.key;
              const isComplete = stageReached(item.key) && !isActive;
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
                    <item.icon className="h-4 w-4 text-[var(--color-amber-300)]" />
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-[var(--color-text-muted)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '可替换性' : 'Swappable layers'}</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
              {zh
                ? '换 OCR 引擎只改 core/ocr/，service 接口不变；加新图表只丢一个 renderer 进 core/visualization/。'
                : 'Swapping the OCR engine touches only core/ocr/ — the service interface is unchanged; a new chart is just another renderer in core/visualization/.'}
            </p>
          </div>

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              {zh ? '执行日志' : 'Activity log'}
            </p>
            <div className="mt-4 space-y-3">
              {timeline.length > 0 ? (
                timeline.map((item, index) => (
                  <p key={`${index}-${item.slice(0, 8)}`} className="font-mono text-[11px] leading-5 text-[var(--color-text-secondary)]">
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                  {zh ? '运行管线，看一份 PDF 表格如何变成图表。' : 'Run the pipeline to watch a PDF table become a chart.'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Stage 1 — OCR table */}
          {stageReached('ocr') ? (
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TableProperties className="h-4 w-4 text-[var(--color-amber-300)]" />
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? 'OCR 结构化输出（带坐标）' : 'OCR structured output (with coordinates)'}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-green-300)]/25 bg-[var(--color-green-300)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-green-300)]">
                  <Gauge className="h-3 w-3" /> 0.6s/page
                </span>
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-[var(--color-border-default)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--color-bg-primary)]/55 text-[var(--color-text-muted)]">
                    <tr>
                      <th className="px-3 py-2 font-medium">{zh ? '季度' : 'Quarter'}</th>
                      <th className="px-3 py-2 font-medium">{zh ? '营收(亿元)' : 'Revenue (¥100M)'}</th>
                      <th className="px-3 py-2 font-medium">{zh ? '同比' : 'YoY'}</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--color-text-secondary)]">
                    {quarters.map((q) => (
                      <tr key={q.label} className="border-t border-[var(--color-border-default)]">
                        <td className="px-3 py-1.5 font-mono">{q.label}</td>
                        <td className="px-3 py-1.5 font-mono">{q.revenue}</td>
                        <td className="px-3 py-1.5 font-mono text-[var(--color-green-300)]">{q.yoy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 font-mono text-[10px] text-[var(--color-text-muted)]">{`{ cells: [{row, col, text}], rows: ${quarters.length + 1}, cols: 3 }`}</p>
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] px-4 py-10 text-center text-sm leading-6 text-[var(--color-text-muted)]">
              {zh ? 'OCR / 分析 / 图表结果会随管线运行依次出现在这里。' : 'OCR / analysis / chart results appear here as the pipeline runs.'}
            </div>
          )}

          {/* Stage 2 — analysis */}
          {stageReached('analysis') && (
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? '分析结果' : 'Analysis result'}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                {zh
                  ? '四个季度营收稳步上升，全年合计 598.8 亿元，同比增速逐季加快。'
                  : 'Revenue rises steadily across all four quarters, ¥59.88B for the year, with YoY growth accelerating each quarter.'}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { k: zh ? '全年总营收' : 'FY revenue', v: `${totalRevenue.toFixed(1)}` },
                  { k: zh ? '最高季度' : 'Peak quarter', v: 'Q4 · 171.2' },
                  { k: zh ? '平均同比' : 'Avg YoY', v: '+16.7%' },
                ].map((kpi) => (
                  <div key={kpi.k} className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-2.5">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{kpi.k}</p>
                    <p className="mt-1 font-mono text-sm text-[var(--color-text-primary)]">{kpi.v}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 rounded-lg border border-[var(--color-amber-300)]/25 bg-[var(--color-amber-300)]/8 px-2.5 py-1.5 text-[11px] leading-5 text-[var(--color-amber-300)]">
                {zh ? 'anomalies：Q3→Q4 环比增速略放缓（+9.2% vs +10.2%），其余健康。' : 'anomalies: Q3→Q4 QoQ growth eased slightly (+9.2% vs +10.2%); otherwise healthy.'}
              </p>
            </div>
          )}

          {/* Stage 3 — chart */}
          {stageReached('viz') && (
            <div className="rounded-[22px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/8 p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[var(--color-green-300)]" />
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? '可视化（LLM 选定：柱状图）' : 'Visualization (LLM picked: bar chart)'}</p>
              </div>
              <div className="mt-4 flex h-40 items-end justify-around gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 px-4 pb-3 pt-4">
                {quarters.map((q) => (
                  <div key={q.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                    <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">{q.revenue}</span>
                    <div
                      className="w-full max-w-[44px] rounded-t-md bg-gradient-to-t from-[var(--color-green-500)] to-[var(--color-green-300)] transition-all duration-700"
                      style={{ height: `${(q.revenue / maxRevenue) * 100}%` }}
                    />
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{q.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-5 text-[var(--color-text-muted)]">
                {zh ? '选型理由：单指标 + 4 个离散时间点 → 柱状图最直观（强调趋势时可换折线）。' : 'Why: one metric over 4 discrete time points → a bar chart reads cleanest (swap to a line to stress the trend).'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
