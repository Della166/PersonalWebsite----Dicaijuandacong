'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  BarChart3,
  CheckCircle2,
  LoaderCircle,
  MessageCircleQuestion,
  Play,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';

interface Industry {
  label: { en: string; zh: string };
  revenue: number;
  yoy: string;
}

interface QA {
  q: { en: string; zh: string };
  base: { en: string; zh: string };
  finetuned: { en: string; zh: string };
}

const industries: Industry[] = [
  { label: { zh: '科技', en: 'Tech' }, revenue: 156, yoy: '+18.3%' },
  { label: { zh: '金融', en: 'Finance' }, revenue: 134, yoy: '+9.1%' },
  { label: { zh: '制造', en: 'Mfg.' }, revenue: 112, yoy: '+6.4%' },
  { label: { zh: '消费', en: 'Consumer' }, revenue: 88, yoy: '+4.2%' },
];

const maxRevenue = Math.max(...industries.map((i) => i.revenue));

const qaPairs: QA[] = [
  {
    q: { zh: '图中营收最高的行业是哪个？同比增长率多少？', en: 'Which industry has the highest revenue, and its YoY growth?' },
    base: {
      zh: '柱子最高的应该是第一个，但中文标签不太清楚，大概在 150 左右，增长率无法确定。',
      en: 'The tallest bar looks like the first one, but the Chinese labels are unclear — roughly 150, growth uncertain.',
    },
    finetuned: {
      zh: '营收最高的是科技行业，约 156 亿元，同比增长率为 +18.3%。',
      en: 'Tech has the highest revenue, ~¥15.6B, with +18.3% YoY growth.',
    },
  },
  {
    q: { zh: '营收第二高的是什么行业？', en: 'Which industry ranks second by revenue?' },
    base: {
      zh: '可能是金融或制造，从图上不太好判断具体哪个。',
      en: 'Possibly Finance or Manufacturing — hard to tell which from the chart.',
    },
    finetuned: {
      zh: '营收第二的是金融行业，约 134 亿元。',
      en: 'Finance ranks second, ~¥13.4B.',
    },
  },
  {
    q: { zh: '制造业和消费业的营收差多少？', en: 'What is the revenue gap between Manufacturing and Consumer?' },
    base: {
      zh: '第三和第四个柱子，差距看起来不大，具体数值读不准。',
      en: 'The 3rd and 4th bars look close; I can’t read the exact values.',
    },
    finetuned: {
      zh: '制造业约 112 亿元，消费业约 88 亿元，相差约 24 亿元。',
      en: 'Manufacturing ~¥11.2B, Consumer ~¥8.8B — a gap of ~¥2.4B.',
    },
  },
];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function ChartVqaFinetunePreview() {
  const zh = useLocale() === 'zh';
  const [qaIndex, setQaIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [showBase, setShowBase] = useState(false);
  const [showFinetuned, setShowFinetuned] = useState(false);

  const qa = qaPairs[qaIndex];

  const reset = () => {
    setShowBase(false);
    setShowFinetuned(false);
    setRunning(false);
  };

  const selectQa = (index: number) => {
    setQaIndex(index);
    reset();
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const run = async () => {
      setShowBase(false);
      setShowFinetuned(false);
      await wait(560);
      if (cancelled) return;
      setShowBase(true);
      await wait(820);
      if (cancelled) return;
      setShowFinetuned(true);
      await wait(200);
      if (cancelled) return;
      setRunning(false);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [running]);

  const done = showBase && showFinetuned;

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
              {zh ? '微调前 vs 微调后：中文图表问答' : 'Before vs after fine-tuning: Chinese chart VQA'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '同一张中文图表、同一个问题，对比通用 VLM 和用 LlamaFactory 微调过的垂直模型——后者来自 llamafactory_train.jsonl 的真实训练目标。'
                : 'Same Chinese chart, same question — a general VLM vs a vertical model fine-tuned with LlamaFactory, whose target answers come from the real llamafactory_train.jsonl.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (done ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '推理中' : 'Inferring') : done ? (zh ? '重置' : 'Reset') : zh ? '两个模型都跑' : 'Run both models'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '输入图表（中文标签）' : 'Input chart (Chinese labels)'}</p>
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">{zh ? '2024 各行业营收（亿元）' : '2024 revenue by industry (¥100M)'}</p>
            <div className="mt-3 flex h-40 items-end justify-around gap-3 rounded-xl border border-[var(--color-border-default)] bg-black/15 px-3 pb-3 pt-4">
              {industries.map((ind) => (
                <div key={ind.label.en} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">{ind.revenue}</span>
                  <div
                    className="w-full max-w-[44px] rounded-t-md bg-gradient-to-t from-[var(--color-green-500)] to-[var(--color-green-300)]"
                    style={{ height: `${(ind.revenue / maxRevenue) * 100}%` }}
                  />
                  <span className="text-[10px] text-[var(--color-text-muted)]">{zh ? ind.label.zh : ind.label.en}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <div className="flex items-center gap-2">
              <MessageCircleQuestion className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '选一个问题' : 'Pick a question'}</p>
            </div>
            <div className="mt-3 space-y-2">
              {qaPairs.map((item, index) => (
                <button
                  key={item.q.en}
                  type="button"
                  onClick={() => selectQa(index)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-xs leading-5 transition-colors ${
                    index === qaIndex
                      ? 'border-[var(--color-green-300)]/40 bg-[var(--color-green-300)]/10 text-[var(--color-text-primary)]'
                      : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]'
                  }`}
                >
                  {zh ? item.q.zh : item.q.en}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? 'LlamaFactory 训练设置' : 'LlamaFactory training setup'}</p>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-[var(--color-border-default)] bg-black/25 p-3 font-mono text-[10px] leading-5 text-[var(--color-text-secondary)]">
{`--model_name_or_path Qwen2.5-VL-7B-Instruct
--finetuning_type lora  --template qwen2_vl
--dataset chart_vqa_train  --image_resolution 448
--cutoff_len 4096  --lora_rank 16  --lora_alpha 32`}
            </pre>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{zh ? '当前问题' : 'Current question'}</p>
            <p className="mt-1.5 text-sm leading-6 text-[var(--color-text-primary)]">{zh ? qa.q.zh : qa.q.en}</p>
          </div>

          {/* Base model */}
          <div className={`rounded-[22px] border p-4 transition-colors ${showBase ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/8' : 'border-dashed border-[var(--color-border-default)]'}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? '通用 VLM（未微调）' : 'General VLM (base)'}</p>
              {showBase && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-amber-300)]">
                  <TriangleAlert className="h-3 w-3" /> {zh ? '中文标签读不准' : 'misreads Chinese labels'}
                </span>
              )}
            </div>
            {showBase ? (
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{zh ? qa.base.zh : qa.base.en}</p>
            ) : (
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{zh ? '点「两个模型都跑」查看回答。' : 'Click "Run both models" to see the answer.'}</p>
            )}
          </div>

          {/* Fine-tuned model */}
          <div className={`rounded-[22px] border p-4 transition-colors ${showFinetuned ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/10' : 'border-dashed border-[var(--color-border-default)]'}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? '微调后垂直模型（LoRA）' : 'Fine-tuned vertical model (LoRA)'}</p>
              {showFinetuned && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/12 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-green-300)]">
                  <CheckCircle2 className="h-3 w-3" /> {zh ? '标签 + 数值正确' : 'labels + numbers correct'}
                </span>
              )}
            </div>
            {showFinetuned ? (
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">{zh ? qa.finetuned.zh : qa.finetuned.en}</p>
            ) : (
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{zh ? '微调目标来自 llamafactory_train.jsonl 的 assistant 内容。' : 'Targets come from the assistant content in llamafactory_train.jsonl.'}</p>
            )}
          </div>

          {done && (
            <p className="rounded-[18px] border border-[var(--color-border-default)] bg-black/10 px-4 py-3 text-xs leading-5 text-[var(--color-text-muted)]">
              {zh
                ? '差别不在「更聪明」，而在中文图表标签（营业收入 / 同比 / 万-亿）进了模型词表、领域风格被学进去——这正是短期小微调能快速修好的。'
                : 'The gap is not "smarter" — it is that Chinese chart labels (营业收入 / 同比 / 万-亿) enter the vocabulary and the domain style is learned, exactly what a short targeted fine-tune fixes fast.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
