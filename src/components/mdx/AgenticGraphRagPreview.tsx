'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  GitBranch,
  LoaderCircle,
  Network,
  Play,
  Quote,
  Search,
  Sparkles,
  Workflow,
} from 'lucide-react';

type ToolKey = 'vector' | 'graph' | 'hybrid';
type StageKey = 'idle' | 'route' | 'retrieve' | 'answer' | 'complete';

interface Entity {
  id: string;
  name: { en: string; zh: string };
  kind: '实体' | '数据指标';
}

interface Relation {
  from: string;
  to: string;
  rel: { en: string; zh: string };
}

interface VectorHit {
  text: { en: string; zh: string };
  span: string;
}

interface Question {
  q: { en: string; zh: string };
  tool: ToolKey;
  routeReason: { en: string; zh: string };
  vectorHits: VectorHit[];
  graphPath: number[]; // ordered relation indices to traverse
  answer: { en: string; zh: string };
}

const entities: Entity[] = [
  { id: 'lender', name: { zh: '出借人', en: 'Lender' }, kind: '实体' },
  { id: 'borrower', name: { zh: '借款人', en: 'Borrower' }, kind: '实体' },
  { id: 'contract', name: { zh: '借款合同', en: 'Loan contract' }, kind: '实体' },
  { id: 'amount', name: { zh: '借款金额 ¥200,000', en: 'Loan amount ¥200,000' }, kind: '数据指标' },
  { id: 'rate', name: { zh: '借款利率 年化 12%', en: 'Interest rate 12%/yr' }, kind: '数据指标' },
  { id: 'law', name: { zh: '民法典·第六百七十五条', en: 'Civil Code Art. 675' }, kind: '实体' },
];

const relations: Relation[] = [
  { from: 'lender', to: 'borrower', rel: { zh: '出借给', en: 'lends to' } },
  { from: 'borrower', to: 'amount', rel: { zh: '应偿还', en: 'must repay' } },
  { from: 'borrower', to: 'rate', rel: { zh: '按约定支付', en: 'pays' } },
  { from: 'contract', to: 'law', rel: { zh: '依据', en: 'based on' } },
];

const entityName = (id: string, zh: boolean) => {
  const e = entities.find((x) => x.id === id);
  return e ? (zh ? e.name.zh : e.name.en) : id;
};

const questions: Question[] = [
  {
    q: { zh: '这份合同的借款金额和利率是多少？', en: 'What are the loan amount and interest rate?' },
    tool: 'vector',
    routeReason: { zh: '纯事实查询 → 向量检索足够', en: 'A plain fact lookup → vector search is enough' },
    vectorHits: [
      { text: { zh: '借款金额为人民币 200,000 元', en: 'Loan amount: RMB 200,000' }, span: '[字符 142–176]' },
      { text: { zh: '年利率 12%，自借款之日起计算', en: '12% annual rate, from the loan date' }, span: '[字符 178–210]' },
    ],
    graphPath: [],
    answer: { zh: '借款金额为 200,000 元，年利率 12%。', en: 'The loan amount is ¥200,000 at a 12% annual rate.' },
  },
  {
    q: { zh: '出借人关联了哪些主体？', en: 'Which entities is the lender connected to?' },
    tool: 'graph',
    routeReason: { zh: '关系 / 多跳问题 → 图谱遍历', en: 'A relational / multi-hop question → graph traversal' },
    vectorHits: [],
    graphPath: [0, 1, 2],
    answer: {
      zh: '出借人 →(出借给)→ 借款人；借款人 →(应偿还)→ 借款金额、→(支付)→ 借款利率。',
      en: 'Lender →(lends to)→ Borrower; Borrower →(must repay)→ amount, →(pays)→ rate.',
    },
  },
  {
    q: { zh: '出借人和借款人是什么关系？借款人要还多少？', en: 'How are lender and borrower related, and how much is owed?' },
    tool: 'hybrid',
    routeReason: { zh: '既要关系又要数值 → 混合检索', en: 'Needs both relation and number → hybrid retrieval' },
    vectorHits: [{ text: { zh: '借款金额为人民币 200,000 元', en: 'Loan amount: RMB 200,000' }, span: '[字符 142–176]' }],
    graphPath: [0, 1],
    answer: {
      zh: '出借人将款项出借给借款人；借款人应偿还本金 200,000 元（另按年利率 12% 计息）。',
      en: 'The lender lends to the borrower; the borrower must repay ¥200,000 principal (plus 12%/yr interest).',
    },
  },
];

const toolLabels: Record<ToolKey, { en: string; zh: string }> = {
  vector: { en: 'vector_search_tool', zh: 'vector_search_tool' },
  graph: { en: 'graph_search_tool', zh: 'graph_search_tool' },
  hybrid: { en: 'hybrid_search_tool', zh: 'hybrid_search_tool' },
};

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function AgenticGraphRagPreview() {
  const zh = useLocale() === 'zh';
  const [qIndex, setQIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [visibleHits, setVisibleHits] = useState(0);
  const [traversed, setTraversed] = useState<number[]>([]);

  const q = questions[qIndex];
  const usesVector = q.tool === 'vector' || q.tool === 'hybrid';
  const usesGraph = q.tool === 'graph' || q.tool === 'hybrid';

  const visitedEntities = useMemo(() => {
    const set = new Set<string>();
    traversed.forEach((ri) => {
      set.add(relations[ri].from);
      set.add(relations[ri].to);
    });
    return set;
  }, [traversed]);

  const reset = () => {
    setStage('idle');
    setVisibleHits(0);
    setTraversed([]);
    setRunning(false);
  };

  const selectQ = (index: number) => {
    setQIndex(index);
    reset();
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const run = async () => {
      setVisibleHits(0);
      setTraversed([]);
      setStage('route');
      await wait(620);
      if (cancelled) return;
      setStage('retrieve');

      if (usesVector) {
        for (let i = 0; i < q.vectorHits.length; i += 1) {
          await wait(420);
          if (cancelled) return;
          setVisibleHits(i + 1);
        }
      }
      if (usesGraph) {
        for (let i = 0; i < q.graphPath.length; i += 1) {
          await wait(520);
          if (cancelled) return;
          setTraversed((prev) => [...prev, q.graphPath[i]]);
        }
      }

      await wait(420);
      if (cancelled) return;
      setStage('answer');
      await wait(200);
      if (cancelled) return;
      setStage('complete');
      setRunning(false);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [running, qIndex, usesVector, usesGraph, q.vectorHits.length, q.graphPath]);

  const reached = (target: StageKey) => {
    const order: StageKey[] = ['idle', 'route', 'retrieve', 'answer', 'complete'];
    return order.indexOf(stage) >= order.indexOf(target);
  };

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
              {zh ? '看 Agent 选 向量 / 图谱 / 混合' : 'Watch the agent route vector / graph / hybrid'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '换不同问题，Agent 自己选检索工具。图谱路会沿关系多跳点亮实体；答案带 char_interval 原文引用。'
                : 'Switch questions and the agent picks the retrieval tool. The graph path lights up entities hop by hop; answers carry char_interval citations.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '检索中' : 'Retrieving') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '运行 Agent' : 'Run agent'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '选一个问题' : 'Pick a question'}</p>
            </div>
            <div className="mt-3 space-y-2">
              {questions.map((item, index) => (
                <button
                  key={item.q.en}
                  type="button"
                  onClick={() => selectQ(index)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-xs leading-5 transition-colors ${
                    index === qIndex
                      ? 'border-[var(--color-green-300)]/40 bg-[var(--color-green-300)]/10 text-[var(--color-text-primary)]'
                      : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]'
                  }`}
                >
                  {zh ? item.q.zh : item.q.en}
                </button>
              ))}
            </div>
          </div>

          {/* Knowledge graph panel */}
          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '知识图谱（Python dict）' : 'Knowledge graph (Python dict)'}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {entities.map((e) => {
                const active = visitedEntities.has(e.id);
                return (
                  <span
                    key={e.id}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] transition-colors ${
                      active
                        ? 'border-[var(--color-green-300)]/45 bg-[var(--color-green-300)]/15 text-[var(--color-green-300)]'
                        : e.kind === '数据指标'
                          ? 'border-[var(--color-amber-300)]/25 text-[var(--color-amber-300)]/90'
                          : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {zh ? e.name.zh : e.name.en}
                  </span>
                );
              })}
            </div>
            <div className="mt-3 space-y-1.5 border-t border-[var(--color-border-default)] pt-3">
              {relations.map((r, ri) => {
                const active = traversed.includes(ri);
                return (
                  <div
                    key={`${r.from}-${r.to}`}
                    className={`flex items-center gap-1.5 rounded-lg px-2 py-1 font-mono text-[11px] transition-colors ${
                      active ? 'bg-[var(--color-green-300)]/12 text-[var(--color-green-300)]' : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    <span>{entityName(r.from, zh)}</span>
                    <GitBranch className="h-3 w-3 shrink-0 rotate-90" />
                    <span className="italic">{zh ? r.rel.zh : r.rel.en}</span>
                    <span>→ {entityName(r.to, zh)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Routing decision */}
          {reached('route') ? (
            <div className="rounded-[22px] border border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/8 p-4">
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-[var(--color-amber-300)]" />
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? 'Agent 工具路由' : 'Agent tool routing'}</p>
              </div>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                {zh ? '选定工具：' : 'Chosen tool: '}
                <span className="font-mono text-[var(--color-green-300)]">{zh ? toolLabels[q.tool].zh : toolLabels[q.tool].en}</span>
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{zh ? q.routeReason.zh : q.routeReason.en}</p>
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] px-4 py-10 text-center text-sm leading-6 text-[var(--color-text-muted)]">
              {zh ? '运行 Agent，看它如何按问题选检索工具。' : 'Run the agent to see how it routes the retrieval tool by question.'}
            </div>
          )}

          {/* Vector hits */}
          {reached('retrieve') && usesVector && (
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '向量检索命中' : 'Vector hits'}</p>
              <div className="mt-3 space-y-2">
                {q.vectorHits.slice(0, visibleHits).map((hit, i) => (
                  <div key={i} className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-2.5">
                    <div className="flex items-start gap-1.5">
                      <Quote className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-text-muted)]" />
                      <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
                        {zh ? hit.text.zh : hit.text.en} <span className="font-mono text-[10px] text-[var(--color-amber-300)]">{hit.span}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Graph traversal */}
          {reached('retrieve') && usesGraph && (
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '图谱多跳遍历' : 'Graph multi-hop traversal'}</p>
              <div className="mt-3 space-y-1.5">
                {traversed.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)]">{zh ? '从起点实体沿关系逐跳展开…' : 'Expanding hop by hop from the start entity…'}</p>
                ) : (
                  traversed.map((ri, hop) => (
                    <p key={ri} className="font-mono text-[11px] leading-5 text-[var(--color-green-300)]">
                      hop {hop + 1}: {entityName(relations[ri].from, zh)} —[{zh ? relations[ri].rel.zh : relations[ri].rel.en}]→ {entityName(relations[ri].to, zh)}
                    </p>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Final answer */}
          {reached('answer') && (
            <div className="rounded-[22px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/10 p-4">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? 'Agent 回答（含证据）' : 'Agent answer (with evidence)'}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">{zh ? q.answer.zh : q.answer.en}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--color-border-default)] pt-3">
                <span className="rounded-full border border-[var(--color-border-default)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)]">
                  tool · {zh ? toolLabels[q.tool].zh : toolLabels[q.tool].en}
                </span>
                {q.vectorHits.map((h) => (
                  <span key={h.span} className="rounded-full border border-[var(--color-amber-300)]/25 px-2 py-0.5 font-mono text-[10px] text-[var(--color-amber-300)]">
                    {h.span}
                  </span>
                ))}
                {usesGraph && (
                  <span className="rounded-full border border-[var(--color-green-300)]/25 px-2 py-0.5 font-mono text-[10px] text-[var(--color-green-300)]">
                    {q.graphPath.length} {zh ? '跳' : 'hops'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
