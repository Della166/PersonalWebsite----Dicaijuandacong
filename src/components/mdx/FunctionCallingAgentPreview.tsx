'use client';

import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  GitCompareArrows,
  Hash,
  Layers,
  Sparkles,
  XCircle,
} from 'lucide-react';

// Faithful to the actual course materials in:
//   Y:/agent/九天菜菜/.../【正在更新】热门工业级案例/案例9：RL Agent性能微调/
// Notebook: 企业级Agent Function-Calling RL微调.ipynb
//
// The project is called AutoToolDPO: it uses an LLM to auto-generate a DPO dataset
// for function-calling agents. Each sample has a chosen (correct tool-call) and a rejected
// (deliberately flawed) response. Tools carry an @v1 version suffix; calls are wrapped in
// <function_call>...</function_call>; final user-facing text goes in <final>...</final>.

interface DpoSample {
  user_query: string;
  toolset: Array<{ name: string; description: string }>;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  chosen: string;
  rejected: string;
  flaw: string;
}

// Real samples lifted verbatim from notebook cell 68 (data_dpo example output)
// + cell 47 (multi-turn agent log). Tool definitions trimmed for screen width but the names,
// @v1 versioning, and argument schema are exact.
const SAMPLES: DpoSample[] = [
  {
    user_query: '请使用获取股票实时价格工具',
    toolset: [
      { name: 'get_stock_price@v1', description: '获取股票实时价格 · args: symbol (e.g. AAPL, TSLA)' },
      { name: 'web_search@v1', description: '在互联网上搜索信息 · args: query, max_results?' },
      { name: 'send_email@v1', description: '发送电子邮件 · args: to, subject, body' },
    ],
    messages: [{ role: 'user', content: '请使用获取股票实时价格工具' }],
    chosen:
      '我需要知道您想查询哪只股票的实时价格。请提供股票代码，比如 AAPL（苹果公司）或 TSLA（特斯拉公司）。\n\n<function_call>\n{\n  "name": "get_stock_price@v1",\n  "arguments": { "symbol": "请提供股票代码" }\n}\n</function_call>',
    rejected:
      '<function_call>\n{\n  "name": "get_stock_price@v1",\n  "arguments": { "symbol": "" }\n}\n</function_call>',
    flaw: '空 symbol — 工具会失败，且没有向用户索取必填参数。',
  },
  {
    user_query: '200人民币等于多少港币，接着区块链有什么特点',
    toolset: [
      { name: 'calculate@v1', description: '执行数学计算 · args: expression' },
      { name: 'convert_currency@v1', description: '货币汇率转换 · args: amount, from_currency, to_currency' },
      { name: 'web_search@v1', description: '互联网搜索 · args: query, max_results?' },
    ],
    messages: [
      { role: 'user', content: '200人民币等于多少港币，接着区块链有什么特点' },
      {
        role: 'assistant',
        content:
          '<function_call>\n{ "name": "convert_currency@v1", "arguments": { "amount": 200, "from_currency": "CNY", "to_currency": "HKD" } }\n</function_call>\n\n等待汇率转换结果返回后，我将继续调用搜索工具查询区块链特点。',
      },
      {
        role: 'user',
        content:
          '<function_call>\n{ "name": "convert_currency@v1", "arguments": { "amount": 200, "from_currency": "CNY", "to_currency": "HKD" } }\n</function_call>',
      },
      {
        role: 'assistant',
        content:
          '我需要等待汇率转换工具返回结果，然后继续为您查询区块链的特点。请稍等片刻。\n\n<function_call>\n{ "name": "web_search@v1", "arguments": { "query": "区块链技术的主要特点特征" } }\n</function_call>',
      },
    ],
    chosen:
      '我需要等待搜索工具返回区块链特点的信息。请稍等。\n\n目前我已经调用了两个工具：\n1. 汇率转换工具 — 200人民币等于多少港币\n2. 搜索工具 — 区块链技术的主要特点\n\n等待这两个工具返回结果后，我将为您提供完整的答案。',
    rejected:
      '<function_call>\n{ "name": "calculate@v1", "arguments": { "expression": "200*1.2" } }\n</function_call>\n\n<final>\n根据我的计算，200人民币约等于240港币。关于区块链的特点，它是一种分布式账本技术，具有去中心化、不可篡改、透明可追溯等特点。\n</final>',
    flaw: '用 calculate@v1 硬编死汇率（错的工具）+ 没等真实工具返回就给 <final>（凭印象答区块链）。',
  },
  {
    user_query: '北京今天的天气怎么样？',
    toolset: [
      { name: 'get_weather@v1', description: '查询指定城市的天气信息 · args: city' },
      { name: 'get_current_time@v1', description: '获取当前的日期和时间 · 无参数' },
      { name: 'web_search@v1', description: '互联网搜索 · args: query, max_results?' },
    ],
    messages: [{ role: 'user', content: '北京今天的天气怎么样？' }],
    chosen:
      '<function_call>\n{\n  "name": "get_weather@v1",\n  "arguments": { "city": "北京" }\n}\n</function_call>',
    rejected: '我不知道，你可以查天气预报。',
    flaw: '完全不调工具，直接放弃 — DPO 训练里负样本的经典形态之一。',
  },
];

// Real module map taken from backend/core/ in AutoToolDPO.zip. Six modules, named exactly.
const PIPELINE = [
  {
    name: 'task_generator.py',
    detail: 'TaskGenerator.generate_tasks() — 抽 task 模板、随机绑定 toolset、产出 Task(user_query, tools, system_prompt)。',
  },
  {
    name: 'data_synthesizer.py · chosen',
    detail: 'DataSynthesizer._generate_chosen(task) — 单轮 vs 多轮分支：多轮调 generate_multi_turn_dialogue(), 写回 task._multi_turn_context。',
  },
  {
    name: 'data_synthesizer.py · smart_rejected',
    detail: 'synthesize_sample_with_smart_rejected() — 5 步：并发跑 chosen+rejected → LLM 自评 quality_score + similarity_score → 策略 1 (质量<5 且能修正→ 拿 corrected_chosen 当新 chosen) → 策略 2 (相似度>80% → 用 temperature=1.2 重生成更差的 rejected) → 收尾。',
  },
  {
    name: 'validator.py',
    detail: 'Validator.validate_sample() — 必填字段齐 · chosen ≠ rejected · function_call JSON 解析通过 · 可选 LLM 自评打分。',
  },
  {
    name: 'concurrent_engine.py',
    detail: 'ConcurrentEngine.process_tasks() — asyncio.Semaphore + ProgressStats(progress_percent / generation_rate / validation_success_rate) 推 WebSocket; 指数退避重试。',
  },
  {
    name: 'exporter.py',
    detail: 'Exporter.export_to_jsonl() — data_dpo.jsonl + dataset_info.json + generation_stats.json + invalid_samples.jsonl。',
  },
] as const;

// The 5-step smart_rejected strategy from data_synthesizer.py:89-200, shown as its own block.
const SMART_REJECTED_STRATEGY = [
  { step: 1, label: '并发生成', detail: 'asyncio.gather(_generate_chosen, _generate_rejected) — chosen 和 rejected 并发跑，省一轮 LLM 等待。' },
  { step: 2, label: '构造临时样本', detail: '把 task + chosen + rejected 装成临时 sample 字典，丢给 LLM 自评。' },
  { step: 3, label: 'LLM 自评', detail: 'llm_client.validate_and_correct(sample) → quality_score (0-10) + similarity_score (0-100) + 可选 corrected_chosen。' },
  { step: 4, label: '策略 1 · 修正', detail: '如果 quality_score < 5.0 且 corrected_chosen 存在 → 用 corrected_chosen 当新 chosen，原 rejected 保留为真实错误案例。' },
  { step: 5, label: '策略 2 · 重生成', detail: '如果 similarity_score > 80% → 用 temperature=1.2 重新生成更差的 rejected (避免「假对比」对 DPO 没用)。' },
] as const;

// All 10 tools from backend/configs/tools_registry.json (lifted verbatim).
const TOOLS_REGISTRY = [
  { name: 'get_current_time', version: 'v1', category: 'time', desc: '获取当前时间', params: '(无参数)' },
  { name: 'get_weather', version: 'v1', category: 'weather', desc: '查询指定城市的天气信息', params: 'city' },
  { name: 'calculate', version: 'v1', category: 'math', desc: '执行数学计算', params: 'expression' },
  { name: 'web_search', version: 'v1', category: 'search', desc: '在互联网上搜索信息', params: 'query, max_results?' },
  { name: 'translate_text', version: 'v1', category: 'translation', desc: '翻译文本到目标语言', params: 'text, target_language' },
  { name: 'send_email', version: 'v1', category: 'communication', desc: '发送电子邮件', params: 'to, subject, body' },
  { name: 'get_stock_price', version: 'v1', category: 'finance', desc: '获取股票实时价格', params: 'symbol' },
  { name: 'create_reminder', version: 'v1', category: 'productivity', desc: '创建提醒事项', params: 'title, time' },
  { name: 'get_news', version: 'v1', category: 'news', desc: '获取最新新闻', params: 'category, country?' },
  { name: 'convert_currency', version: 'v1', category: 'finance', desc: '货币汇率转换', params: 'amount, from_currency, to_currency' },
] as const;

function MessageRow({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <div className="rounded-2xl border border-[var(--color-border-default)] bg-black/15 p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        {isUser ? 'user' : 'assistant'}
      </p>
      <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] leading-5 text-[var(--color-text-secondary)]">
        {content}
      </pre>
    </div>
  );
}

export default function FunctionCallingAgentPreview() {
  const [index, setIndex] = useState(0);
  const sample = useMemo(() => SAMPLES[index], [index]);

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(127,188,140,0.12),rgba(212,165,116,0.08))] px-6 py-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/25 bg-[var(--color-green-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-green-300)]">
          <Sparkles className="h-3.5 w-3.5" />
          AutoToolDPO · faithful walkthrough
        </div>
        <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          DPO data for function-calling agents · chosen vs rejected
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
          The samples below are taken verbatim from the AutoToolDPO project&apos;s generated dataset
          (notebook cells 47, 68). Each sample carries the tool registry, full conversation, and a
          chosen / rejected pair — the exact JSONL shape consumed by LLaMA-Factory&apos;s DPO
          trainer.
        </p>
      </div>

      <div className="px-6 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Sample dataset rows · click to switch
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {SAMPLES.map((s, i) => (
            <button
              key={s.user_query}
              type="button"
              onClick={() => setIndex(i)}
              className={`rounded-[24px] border p-4 text-left transition-colors ${
                i === index
                  ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/12'
                  : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/45 hover:border-[var(--color-border-hover)]'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                sample #{i + 1}
              </p>
              <p className="mt-2 text-sm leading-5 text-[var(--color-text-primary)]">
                {s.user_query}
              </p>
              <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">
                {s.messages.length} message{s.messages.length === 1 ? '' : 's'} ·{' '}
                {s.toolset.length} tools
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Tool registry · this sample
            </p>
            <div className="mt-3 space-y-2">
              {sample.toolset.map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-[var(--color-border-default)] bg-black/15 p-3"
                >
                  <p className="font-mono text-[12px] text-[var(--color-amber-300)]">{t.name}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                    {t.description}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-muted)]">
              The <code className="rounded bg-black/40 px-1">@v1</code> suffix is intentional —
              the project uses versioned tool names so older agent traces stay parseable when
              schemas evolve.
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-[var(--color-green-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                messages[] · conversation prefix
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {sample.messages.map((m, i) => (
                <MessageRow key={`${m.role}-${i}`} role={m.role} content={m.content} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                chosen (positive sample)
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-green-300)]/40 bg-[var(--color-green-300)]/12 px-3 py-1 text-xs text-[var(--color-green-300)]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                DPO chosen
              </span>
            </div>
            <pre className="mt-3 max-h-72 overflow-auto rounded-2xl border border-[var(--color-border-default)] bg-black/40 p-3 font-mono text-[11px] leading-5 text-[var(--color-text-secondary)] whitespace-pre-wrap">
              {sample.chosen}
            </pre>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                rejected (negative sample)
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e07a5f]/40 bg-[#e07a5f]/12 px-3 py-1 text-xs text-[#e07a5f]">
                <XCircle className="h-3.5 w-3.5" />
                DPO rejected
              </span>
            </div>
            <pre className="mt-3 max-h-72 overflow-auto rounded-2xl border border-[var(--color-border-default)] bg-black/40 p-3 font-mono text-[11px] leading-5 text-[var(--color-text-secondary)] whitespace-pre-wrap">
              {sample.rejected}
            </pre>
            <div className="mt-3 rounded-2xl border border-[#e07a5f]/30 bg-[#e07a5f]/8 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#e07a5f]/80">
                Why this is rejected
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                {sample.flaw}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/35 px-6 py-5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[var(--color-amber-300)]" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            backend/configs/tools_registry.json · 10 tools shipped
          </p>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-5">
          {TOOLS_REGISTRY.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3"
            >
              <p className="font-mono text-[12px] text-[var(--color-amber-300)]">
                {t.name}@{t.version}
              </p>
              <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">{t.desc}</p>
              <p className="mt-1 font-mono text-[10px] text-[var(--color-text-muted)]">
                category=&quot;{t.category}&quot; · args: {t.params}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-muted)]">
          The 3 samples above sample subsets of these 10 tools (the project also supports{' '}
          <code className="rounded bg-black/30 px-1">tool_count_min/max</code> range mode to pick 2-5 tools per
          sample at random). Adding tools = edit this JSON, no code change.
        </p>

        <div className="mt-5 flex items-center gap-2">
          <Layers className="h-4 w-4 text-[var(--color-amber-300)]" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Backend 6-module pipeline · FastAPI + asyncio.Semaphore(concurrency=10)
          </p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {PIPELINE.map((s, i) => (
            <div
              key={s.name}
              className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3"
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                stage {i + 1}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">{s.name}</p>
              <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-muted)]">{s.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-[20px] border border-[var(--color-border-default)] bg-black/10 p-4">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="h-4 w-4 text-[var(--color-amber-300)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              smart_rejected 策略 · 5 steps · data_synthesizer.py:89-200
            </p>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-5">
            {SMART_REJECTED_STRATEGY.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/40 p-3"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  step {s.step}
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                  {s.label}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-muted)]">
                  {s.detail}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-muted)]">
            5 步走完后样本字段：
            <code className="ml-1 rounded bg-black/30 px-1">{`{task_id, task_type, system, tools, messages, chosen, rejected, quality_score, similarity_score}`}</code>
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <GitCompareArrows className="mr-1 inline h-3.5 w-3.5" />
              LLM provider
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-primary)]">DeepSeek API · deepseek-chat</p>
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
              OpenAI-compatible client, swappable to GPT-4 / 本地模型 不改业务代码
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Concurrency control
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-primary)]">
              asyncio.Semaphore(10) + exponential backoff
            </p>
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
              退避：2/4/8s（普通）→ 3/9/27s（超时）, MAX_RETRIES=15
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Training target
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-primary)]">
              LLaMA-Factory · DPO · Qwen 系列
            </p>
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
              Dataset 注册：dataset_info.json columns ↔ JSONL keys 严格对齐
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
