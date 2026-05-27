import type { ComponentType } from 'react';
import MultiModelStudioPreview from '@/components/mdx/MultiModelStudioPreview';
import MultimodalDocumentRagPreview from '@/components/mdx/MultimodalDocumentRagPreview';
import QwenVlGspoPreview from '@/components/mdx/QwenVlGspoPreview';
import GrpoReasoningPreview from '@/components/mdx/GrpoReasoningPreview';
import DocReviewAgentPreview from '@/components/mdx/DocReviewAgentPreview';
import OpenClawSkillPreview from '@/components/mdx/OpenClawSkillPreview';
import DeepResearchPreview from '@/components/mdx/DeepResearchPreview';
import EnterpriseNl2sqlPreview from '@/components/mdx/EnterpriseNl2sqlPreview';
import FunctionCallingAgentPreview from '@/components/mdx/FunctionCallingAgentPreview';
import StructuredExtractionPreview from '@/components/mdx/StructuredExtractionPreview';

interface LocalizedText {
  en: string;
  zh: string;
}

interface LocalizedList {
  en: string[];
  zh: string[];
}

interface DemoHighlight {
  label: LocalizedText;
  value: LocalizedText;
}

export interface ProjectDemoDefinition {
  component: ComponentType;
  eyebrow: LocalizedText;
  summary: LocalizedText;
  localNote: LocalizedText;
  whatToTry: LocalizedList;
  whatItProves: LocalizedList;
  highlights: DemoHighlight[];
}

export const projectDemos = {
  'multi-model-ai-studio': {
    component: MultiModelStudioPreview,
    eyebrow: {
      en: 'Local preview mode',
      zh: '本地试玩模式',
    },
    summary: {
      en: 'A portfolio-safe sandbox that simulates provider switching, multimodal prompts, and streaming responses inside the site.',
      zh: '一个嵌在作品集站点里的安全试玩沙盒，用来模拟模型切换、多模态输入和流式响应体验。',
    },
    localNote: {
      en: 'This local version is intentionally capped: no private API keys, no live spend, and a stable scripted flow that lets recruiters feel the product shape immediately.',
      zh: '这个本地版本刻意做了边界控制：不暴露私有密钥、不产生真实调用成本，并用稳定脚本流程让招聘方快速感受到产品形态。',
    },
    whatToTry: {
      en: [
        'Switch between hosted and self-hosted providers without changing the operator surface.',
        'Open the vision preset to see how multimodal input fits the same workflow.',
        'Run the preview and watch the response stream in progressively.',
      ],
      zh: [
        '在不更换操作界面的前提下切换云端模型和本地模型。',
        '试试 vision 预设，看看多模态输入如何复用同一套产品流程。',
        '运行预览，观察回答如何以流式方式逐步返回。',
      ],
    },
    whatItProves: {
      en: [
        'You can package LLM capability into a full-stack product instead of a notebook demo.',
        'You understand adapter design, session state, and streaming UX at the application layer.',
        'You can present AI infrastructure decisions in a recruiter-friendly way.',
      ],
      zh: [
        '你能把 LLM 能力做成全栈产品，而不只是 Notebook 演示。',
        '你理解适配器抽象、会话状态和流式交互这些应用层设计。',
        '你能把 AI 基础设施选择转化成招聘方看得懂的产品表达。',
      ],
    },
    highlights: [
      {
        label: { en: 'Surface', zh: '展示重点' },
        value: { en: 'Unified workspace for hosted and local models', zh: '统一承载云端与本地模型的工作台' },
      },
      {
        label: { en: 'Interaction', zh: '交互亮点' },
        value: { en: 'Provider switching plus streaming output', zh: '模型切换与流式输出并存' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Applied AI product thinking with full-stack execution', zh: '全栈落地能力加 AI 产品思维' },
      },
    ],
  },
  'multimodal-document-rag-platform': {
    component: MultimodalDocumentRagPreview,
    eyebrow: {
      en: 'Grounded retrieval sandbox',
      zh: '检索问答试玩沙盒',
    },
    summary: {
      en: 'A guided preview that walks visitors through document selection, retrieval inspection, and grounded answering for multimodal RAG workflows.',
      zh: '一个带引导的试玩页，让访问者亲自体验文档选择、检索片段查看和有依据问答这条多模态 RAG 流程。',
    },
    localNote: {
      en: 'This local sandbox focuses on the strongest product signal: visible retrieval evidence. It is a better portfolio demo than exposing an unrestricted upload endpoint.',
      zh: '这个本地沙盒重点展示最能打动招聘方的信号：检索证据可见化。相比直接开放无限制上传接口，它更适合作品集演示。',
    },
    whatToTry: {
      en: [
        'Pick a sample document with a different structure and switch the question prompt.',
        'Run the preview and inspect which chunks the system retrieves first.',
        'Compare the retrieved evidence with the final cited answer.',
      ],
      zh: [
        '切换不同结构的样例文档，并更换问题提示词。',
        '运行预览，观察系统先检索到了哪些片段。',
        '对照检索证据和最终带引用的回答是否一致。',
      ],
    },
    whatItProves: {
      en: [
        'You understand document pipelines beyond simple chat over text embeddings.',
        'You can expose retrieval quality in a user-facing interface instead of hiding it.',
        'You know how to present multimodal RAG as a product workflow, not just a backend stack.',
      ],
      zh: [
        '你理解的不只是“向量聊天”，而是更完整的文档智能流程。',
        '你能把检索质量以用户可见的方式展现出来，而不是藏在后端里。',
        '你会把多模态 RAG 讲成产品工作流，而不只是后端技术栈。',
      ],
    },
    highlights: [
      {
        label: { en: 'Surface', zh: '展示重点' },
        value: { en: 'Document upload, retrieval inspector, grounded QA', zh: '文档进入、检索查看和有依据问答' },
      },
      {
        label: { en: 'Interaction', zh: '交互亮点' },
        value: { en: 'Chunk visibility before final answer', zh: '先看检索片段，再看最终回答' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Document AI product design with deployable architecture', zh: '文档智能产品设计和可部署架构意识' },
      },
    ],
  },
  'qwen-vl-gspo-visual-rl': {
    component: QwenVlGspoPreview,
    eyebrow: {
      en: 'GSPO training step replay',
      zh: 'GSPO 训练步骤复演',
    },
    summary: {
      en: 'A live reward calculator, not a replay. Edit a VLM completion and the gold answer; the two real reward functions — formatting (λ=0.3, with the addCriterion penalty) and correctness (λ=1.0, exact 2.0 / numeric 1.5) — recompute in your browser.',
      zh: '一个真实的奖励计算器，不是预演。编辑 VLM completion 和 gold 答案，两个真实奖励函数——formatting（λ=0.3，含 addCriterion 惩罚）和 correctness（λ=1.0，精确 2.0 / 数值 1.5）——在你浏览器里实时重算。',
    },
    localNote: {
      en: 'The two reward functions are pure string logic, ported verbatim, so they run client-side. The real before/after eval (accuracy 5%→6%, format 77%→84%) comes from the project\'s own records.',
      zh: '两个奖励函数是纯字符串逻辑、逐字移植，所以在客户端跑。真实的前后评估（准确率 5%→6%、格式 77%→84%）来自项目自己的 records。',
    },
    whatToTry: {
      en: [
        'Load a preset, then edit the completion — both rewards update live.',
        'Try the "numeric match" preset: 991.0 earns correctness 1.5 even though strict eval marks it wrong.',
        'Paste addCriterion spam and watch the formatting reward take the −2 penalty.',
      ],
      zh: [
        '加载一个预设，然后编辑 completion——两个奖励实时更新。',
        '试「数值匹配」预设：991.0 拿到 correctness 1.5，尽管严格评估判它错。',
        '粘贴 addCriterion 乱码，看 formatting 奖励吃到 −2 惩罚。',
      ],
    },
    whatItProves: {
      en: [
        'You can run the modern LLM-RL stack (TRL GRPO/GSPO), not textbook PPO.',
        'You know how GSPO differs from GRPO — sequence-level importance sampling, one config flag.',
        'You report honest before/after metrics (acc 5%→6%, format 77%→84%) from auditable records, not a single hero number.',
      ],
      zh: [
        '你能跑通现代 LLM-RL 技术栈（TRL 的 GRPO/GSPO），不是教科书 PPO。',
        '你清楚 GSPO 和 GRPO 的区别——序列级重要性采样，一个配置开关。',
        '你给的是可审计记录里的真实前后指标（准确率 5%→6%、格式 77%→84%），不是单一漂亮数字。',
      ],
    },
    highlights: [
      {
        label: { en: 'Stack', zh: '技术栈' },
        value: { en: 'Unsloth 4-bit + LoRA · TRL GRPOTrainer · Qwen3-VL 8B', zh: 'Unsloth 4bit + LoRA · TRL GRPOTrainer · Qwen3-VL 8B' },
      },
      {
        label: { en: 'Rewards', zh: '奖励设计' },
        value: { en: 'format (λ=0.3, addCriterion penalty) + correctness (λ=1.0)', zh: 'format（λ=0.3，含 addCriterion 惩罚）+ correctness（λ=1.0）' },
      },
      {
        label: { en: 'Real result', zh: '真实结果' },
        value: { en: 'Format compliance 77% → 84% on held-out eval', zh: '留出评估格式合规率 77% → 84%' },
      },
    ],
  },
  'grpo-reasoning-trainer': {
    component: GrpoReasoningPreview,
    eyebrow: {
      en: 'GRPO training step replay',
      zh: 'GRPO 训练步骤复演',
    },
    summary: {
      en: 'A live reward calculator, not a replay. Edit a model completion and the gold answer; all five reward functions (correctness / int / strict_format / soft_format / xmlcount) — ported verbatim from the notebook — recompute in your browser.',
      zh: '一个真实的奖励计算器，不是预演。编辑模型 completion 和 gold 答案，5 个奖励函数（correctness / int / strict_format / soft_format / xmlcount，从 notebook 逐字移植）在你浏览器里实时重算。',
    },
    localNote: {
      en: 'The five reward functions are pure string logic, so they run client-side exactly as GRPOTrainer scores them. Real GRPO training still needs a GPU + the 0.5B base model — the scoring you see here is the real thing.',
      zh: '5 个奖励函数是纯字符串逻辑，所以在客户端跑的就是 GRPOTrainer 打分的真实逻辑。真实 GRPO 训练仍需 GPU + 0.5B 基座，但你看到的打分是真的。',
    },
    whatToTry: {
      en: [
        'Load a preset, then edit the completion — every reward updates live as you type.',
        'Delete the </answer> tag and watch the format rewards collapse; fix the number and watch correctness jump to +2.0.',
        'Note correctness (+2.0) dominates while the four format rewards shape the <reasoning>/<answer> structure.',
      ],
      zh: [
        '加载一个预设，然后编辑 completion——每个奖励随你输入实时更新。',
        '删掉 </answer> 标签看格式奖励崩掉；改对数字看 correctness 跳到 +2.0。',
        '注意 correctness（+2.0）主导，4 个格式奖励负责塑形 <reasoning>/<answer> 结构。',
      ],
    },
    whatItProves: {
      en: [
        'You can run the GRPO recipe behind DeepSeek-R1 end to end, on a model small enough to actually inspect.',
        'You can design a stack of verifiable reward functions and explain how each shapes behavior.',
        'You tell an honest story — demonstrating a mechanism on a 0.5B model, clear about what is and isn\'t claimed.',
      ],
      zh: [
        '你能把 DeepSeek-R1 的 GRPO 配方端到端跑通，而且选了个小到能真正看清楚的模型。',
        '你能设计一组可验证的奖励函数，并讲清每个怎么塑形行为。',
        '你讲的是诚实的故事——在 0.5B 上演示机制，明确说清楚claim 了什么、没claim 什么。',
      ],
    },
    highlights: [
      {
        label: { en: 'Stack', zh: '技术栈' },
        value: { en: 'TRL GRPOTrainer · Qwen2.5-0.5B · GSM8K · single GPU', zh: 'TRL GRPOTrainer · Qwen2.5-0.5B · GSM8K · 单卡' },
      },
      {
        label: { en: 'Rewards', zh: '奖励设计' },
        value: { en: '5 funcs: correctness + int + strict/soft format + xmlcount', zh: '5 个：correctness + int + strict/soft format + xmlcount' },
      },
      {
        label: { en: 'Real result', zh: '真实结果' },
        value: { en: 'Reward alone induces reasoning chains on a 0.5B model', zh: '仅靠奖励就让 0.5B 模型学会输出推理链' },
      },
    ],
  },
  'ai-document-review-agent': {
    component: DocReviewAgentPreview,
    eyebrow: {
      en: 'Document review sandbox',
      zh: '文档审核试玩沙盒',
    },
    summary: {
      en: 'A real, working tool — not a replay. Paste Chinese text: the Definitive Language (绝对化表述) detector runs client-side instantly, and the "Deep review with DeepSeek" button calls a live server-side route for grammar/spelling + deeper review.',
      zh: '一个真能用的工具，不是预演。粘中文：绝对化表述检测器在浏览器即时跑，「DeepSeek 深度审核」按钮真调服务端 route 做语法/拼写+深度审核。',
    },
    localNote: {
      en: 'The 绝对化表述 layer runs entirely client-side (no key, instant). The deep-review button hits a server-side route running DeepSeek live — the API key stays on the server, input is length-capped, and requests are rate-limited per IP.',
      zh: '绝对化表述层完全在客户端跑（无 key、即时）。深度审核按钮打到服务端 route 真跑 DeepSeek——API key 只在服务端，输入有长度上限，按 IP 限流。',
    },
    whatToTry: {
      en: [
        'Type/paste Chinese text and watch the 绝对化表述 detector flag terms live, with a softer rewrite.',
        'Click "Run DeepSeek review" to call the real LLM for grammar/spelling + definitive-language issues.',
        'Edit the text and re-run — both layers respond to whatever you actually type.',
      ],
      zh: [
        '输入/粘贴中文，看绝对化表述检测器实时标出词并给软化建议。',
        '点「Run DeepSeek review」真调大模型，查语法拼写 + 绝对化问题。',
        '改文本再跑——两层都对你真实输入的内容做反应。',
      ],
    },
    whatItProves: {
      en: [
        'You use LangChain v1.1 correctly — provider-based model init, PydanticOutputParser, framework-level HITL.',
        'You can ship full-stack: FastAPI + React/FluentUI + SQLite + SSE, front to back.',
        'You ground every issue to a real PDF location with a robust 3-level bounding-box fallback.',
      ],
      zh: [
        '你正确使用 LangChain v1.1——provider 初始化、PydanticOutputParser、框架级 HITL。',
        '你能交付全栈：FastAPI + React/FluentUI + SQLite + SSE，前后端打通。',
        '你把每条问题都定位到真实 PDF 位置，带 3 级 bounding-box 回退。',
      ],
    },
    highlights: [
      {
        label: { en: 'Stack', zh: '技术栈' },
        value: { en: 'FastAPI + React/FluentUI · LangChain v1.1 + DeepSeek · MinerU · SQLite', zh: 'FastAPI + React/FluentUI · LangChain v1.1 + DeepSeek · MinerU · SQLite' },
      },
      {
        label: { en: 'Issue types', zh: '问题类型' },
        value: { en: 'Grammar & Spelling (低) + Definitive Language (高) + custom rules', zh: '语法拼写（低）+ 绝对化表述（高）+ 自定义规则' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Real full-stack LangChain v1.1 system with HITL + bbox grounding', zh: '真·全栈 LangChain v1.1 系统，带 HITL 和 bbox 定位' },
      },
    ],
  },
  'openclaw-skill-framework': {
    component: OpenClawSkillPreview,
    eyebrow: {
      en: 'SKILL.md validator',
      zh: 'SKILL.md 校验器',
    },
    summary: {
      en: 'A live SKILL.md validator, not a replay. Paste or edit a SKILL.md; it parses the frontmatter in your browser and checks it against the Agent-Skills spec — name casing, the description token budget (≤250), metadata shape, trigger phrasing — and estimates the description\'s token cost.',
      zh: '一个真实的 SKILL.md 校验器，不是预演。粘贴或编辑 SKILL.md，它在你浏览器里解析 frontmatter 并按 Agent-Skills 规范校验——name 命名、description token 预算（≤250）、metadata 结构、触发措辞——并估算 description 的 token 成本。',
    },
    localNote: {
      en: 'The validator runs entirely client-side (parsing + checks + token estimate). The spec it enforces is drawn from the OpenClaw Agent-Skills course material.',
      zh: '校验器完全在客户端运行（解析 + 校验 + token 估算）。它执行的规范来自 OpenClaw Agent-Skills 课件。',
    },
    whatToTry: {
      en: [
        'Edit the sample SKILL.md and watch the checks update live as you type.',
        'Delete the `name` field or break its casing — see it flip to a warning/error.',
        'Paste a very long description and watch the ~token estimate cross the 250 budget.',
      ],
      zh: [
        '编辑示例 SKILL.md，看校验项随输入实时更新。',
        '删掉 `name` 字段或破坏其命名——看它变成 warning/error。',
        '粘贴一段很长的 description，看 token 估算越过 250 预算。',
      ],
    },
    whatItProves: {
      en: [
        'You understand the OpenClaw / Agent-Skills model: SKILL.md vs plugin vs channel, frontmatter routing, layered loading, token budget.',
        'You can author a real skill end to end: tight triggers + a supporting Bash script + references.',
        'You reach for structured orchestration (Lobster) with approval gates when free-form steps aren\'t reliable.',
      ],
      zh: [
        '你懂 OpenClaw / Agent-Skills 模型：SKILL.md vs plugin vs channel、frontmatter 路由、分层加载、token 预算。',
        '你能端到端写一个真 skill：精准触发 + 配套 Bash 脚本 + references。',
        '你在自由步骤不够可靠时，会用结构化编排（Lobster）+ 审批门。',
      ],
    },
    highlights: [
      {
        label: { en: 'Model', zh: '机制' },
        value: { en: 'SKILL.md (Markdown) teaches the agent — vs code plugins', zh: 'SKILL.md（Markdown）教 Agent——区别于代码插件' },
      },
      {
        label: { en: 'Worked example', zh: '完整实例' },
        value: { en: 'Daily Briefing skill: SKILL.md + collect-git-activity.sh', zh: 'Daily Briefing skill：SKILL.md + collect-git-activity.sh' },
      },
      {
        label: { en: 'Orchestration', zh: '编排' },
        value: { en: 'Lobster pipeline with a human-approval gate', zh: '带人工审批门的 Lobster 管线' },
      },
    ],
  },
  'deep-research-agent': {
    component: DeepResearchPreview,
    eyebrow: {
      en: 'Research pipeline replay',
      zh: '研究 pipeline 复演',
    },
    summary: {
      en: 'A replay of the Dify Deep Research workflow on a sample topic: the three-way intent gate, decomposition into subtopics, a ReAct agent that searches and extracts evidence per subtopic, source dedup with stable IDs, and a footnote-cited Markdown report.',
      zh: '复演 Dify Deep Research workflow：三路意图门、拆成子问题、ReAct Agent 逐子问题搜索抽取证据、稳定 sid 去重，最后输出带脚注引用的 Markdown 报告。',
    },
    localNote: {
      en: 'The preview replays the real graph\'s behavior; no live Dify/Tavily/LLM calls. The running workflow lives on the Dify platform and needs DeepSeek, Tongyi/Qwen, and Tavily API keys.',
      zh: '预览复演真实 graph 的行为；不调真实 Dify/Tavily/LLM。真实 workflow 跑在 Dify 平台上，需要 DeepSeek、通义/Qwen、Tavily 的 API key。',
    },
    whatToTry: {
      en: [
        'Run the workflow and follow the Dify graph: intent gate → decompose → research → accumulate → report.',
        'Watch the ReAct agent extract {claim, quote, confidence} per subtopic via Tavily search + extract.',
        'See URL→sid dedup (one source reused across subtopics) and the footnote-cited report.',
      ],
      zh: [
        '运行 workflow，跟着 Dify graph 走：意图门 → 拆解 → 检索 → 累计 → 报告。',
        '看 ReAct agent 用 Tavily 搜索+抽取，给每个子问题产出 {claim, quote, confidence}。',
        '观察 URL→sid 去重（一个来源跨子问题复用）和带脚注引用的报告。',
      ],
    },
    whatItProves: {
      en: [
        'You can design a non-trivial Dify workflow: branching intent control, iteration, code nodes, multi-model routing.',
        'You take evidence discipline seriously: claim+quote+confidence, stable source IDs, footnote citations.',
        'You know when low-code is the right tool — and can be honest that the value is the orchestration.',
      ],
      zh: [
        '你能设计复杂 Dify workflow：分支意图控制、迭代、代码节点、多模型路由。',
        '你重视证据纪律：claim+quote+confidence、稳定 sid、脚注引用。',
        '你知道何时低代码是对的工具，也能诚实说明价值在编排而非代码。',
      ],
    },
    highlights: [
      {
        label: { en: 'Platform', zh: '平台' },
        value: { en: 'Dify advanced-chat workflow · DeepSeek + Qwen3-max · Tavily', zh: 'Dify advanced-chat workflow · DeepSeek + Qwen3-max · Tavily' },
      },
      {
        label: { en: 'Graph', zh: '工作流' },
        value: { en: 'Intent gate → decompose → ReAct research → dedup → cited report', zh: '意图门 → 拆解 → ReAct 检索 → 去重 → 带引用报告' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Evidence-first agent workflow design in low-code', zh: '低代码里的证据优先 agent 工作流设计' },
      },
    ],
  },
  'enterprise-nl2sql-fine-tuning-system': {
    component: EnterpriseNl2sqlPreview,
    eyebrow: {
      en: 'Schema-aware NL2SQL preview',
      zh: '面向私有 schema 的 NL2SQL 预览',
    },
    summary: {
      en: 'Three enterprise schemas, preset NL prompts, the SQL the tuned model produced, and the four validation signals (syntax / schema-bound / executes / semantic) from the project\'s execution-aware eval pipeline.',
      zh: '三套企业级 schema、预置 NL 问题，配上调教后模型输出的 SQL，以及项目自带的四轴评估（语法 / schema 绑定 / 可执行 / 语义匹配）。',
    },
    localNote: {
      en: 'The model isn\'t re-invoked client-side. The point is to make the project\'s evaluation discipline visible — every query is judged on four axes, not a single accuracy number.',
      zh: '客户端不重跑模型。这个预览要展示的是项目的评估纪律——每条 SQL 都有四个评估轴，而不是只看一个准确率数字。',
    },
    whatToTry: {
      en: [
        'Switch schemas (Sales / HR / Inventory) and watch how the question style changes with the domain.',
        'Read the SQL alongside the schema preview — confirm every column resolves to a real table.',
        'Compare the four validation badges to see why "executes cleanly" is not the same as "semantically correct".',
      ],
      zh: [
        '切换 schema（销售 / HR / 库存），看不同领域里问题风格如何变化。',
        '把 SQL 对照 schema 看——确认每个列都能落到真实的表上。',
        '对比四个验证徽章，体会「能跑通」≠「语义对」。',
      ],
    },
    whatItProves: {
      en: [
        'You treat NL2SQL as a pipeline problem (data generation + tuning + execution-aware eval), not just a prompt-an-LLM project.',
        'You design evaluation around real-world failure modes — schema drift, hallucinated joins, semantic mismatch — not BLEU.',
        'You can package model adaptation as a deployable enterprise workflow.',
      ],
      zh: [
        '你把 NL2SQL 当成 pipeline 问题来做（数据构造 + 微调 + 可执行评估），不是单纯让 LLM 来答题。',
        '你的评估围绕真实失败模式设计——schema 漂移、幻觉 join、语义不匹配——不是 BLEU。',
        '你能把模型适配做成可部署的企业工作流。',
      ],
    },
    highlights: [
      {
        label: { en: 'Stack', zh: '技术栈' },
        value: { en: 'LoRA / QLoRA · FastAPI + WebSocket · vLLM serving', zh: 'LoRA / QLoRA · FastAPI + WebSocket · vLLM' },
      },
      {
        label: { en: 'Eval axes', zh: '评估维度' },
        value: { en: 'syntax · schema-bound · executes · semantic match', zh: '语法 · schema 绑定 · 可执行 · 语义匹配' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Execution-aware evaluation, not BLEU', zh: '看执行结果而不是看文本相似度' },
      },
    ],
  },
  'rl-tuned-function-calling-agent-pipeline': {
    component: FunctionCallingAgentPreview,
    eyebrow: {
      en: 'Trace replay · base vs DPO-tuned',
      zh: '工具轨迹复演·基线 vs DPO 调优',
    },
    summary: {
      en: 'Three agent tasks (travel booking, refund triage, API incident response). For each task the base SFT trace and the DPO-tuned trace are shown side by side, plus the four-axis rubric (tool choice / arg completeness / step efficiency / outcome grounding) used to label chosen vs rejected pairs.',
      zh: '三个 Agent 任务（订机票、退款判定、API 事故响应）。每个任务并排展示基线 SFT 模型轨迹和 DPO 调优后的轨迹，并列出用来标 chosen / rejected 的四轴评估（工具选择 / 参数完整 / 步骤效率 / 结果可依据）。',
    },
    localNote: {
      en: 'Traces are auditable replays from the project\'s preference dataset — not live agent runs. The full pipeline (task generation, trace collection, pair construction, DPO training, eval) lives in the FastAPI/WebSocket backend behind closed scenarios.',
      zh: '展示的是项目偏好数据集里的可审计真实轨迹回放——不是现场跑 Agent。完整 pipeline（任务生成、轨迹收集、配对构造、DPO 训练、评估）跑在 FastAPI/WebSocket 后端。',
    },
    whatToTry: {
      en: [
        'Pick a task and compare the base vs tuned traces step by step.',
        'Notice how the tuned model frontloads context into the first tool call — fewer steps, fewer retries.',
        'Check the rubric: "step efficiency" is judged conditional on outcome, so faster-but-wrong scores poorly.',
      ],
      zh: [
        '选一个任务，把基线轨迹和调优后的轨迹一步步对照。',
        '注意调优后的模型如何把上下文塞进第一次工具调用——步数更少、重试更少。',
        '看四轴评估：「步骤效率」是结合结果判分的，所以「快但错」分数会很低。',
      ],
    },
    whatItProves: {
      en: [
        'You think about agent quality at the tool-call decision layer, not just text fluency.',
        'You build the data scaffolding that preference optimization actually needs: traces, pair labeling, rubric.',
        'You can defend an evaluation rubric in front of a hiring manager — each axis is grounded in a failure mode.',
      ],
      zh: [
        '你在工具调用决策层思考 Agent 质量，而不是只关心文本流畅度。',
        '你搭得起偏好优化真正需要的数据骨架：轨迹、配对标注、评估准则。',
        '你能在面试官面前为评估指标辩护——每条轴对应一个真实失败模式。',
      ],
    },
    highlights: [
      {
        label: { en: 'Method', zh: '方法' },
        value: { en: 'DPO on agent tool-call traces · multi-turn trace collection', zh: '基于工具轨迹的 DPO · 多轮轨迹采集' },
      },
      {
        label: { en: 'Rubric', zh: '评估准则' },
        value: { en: 'tool choice · arg completeness · step efficiency · outcome grounding', zh: '工具选择 · 参数完整 · 步骤效率 · 结果可依据' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Agent quality measured at the decision layer', zh: '在决策层度量 Agent 质量' },
      },
    ],
  },
  'structured-extraction-retrieval-qa-platform': {
    component: StructuredExtractionPreview,
    eyebrow: {
      en: 'Vertical sandbox · extract + QA',
      zh: '垂直沙盒·抽取 + 问答',
    },
    summary: {
      en: 'Three vertical documents (radiology, finance, news). For each one you can see what LangExtract pulled out as structured fields and how the LangChain + DeepSeek QA layer answers a grounded question over the same document, with the vector backend (Qdrant or Chroma) selectable.',
      zh: '三份垂直文档（影像报告、财报、新闻）。每一份都能看到 LangExtract 抽出的结构化字段，以及 LangChain + DeepSeek 问答层针对同一文档的有依据回答，向量后端（Qdrant / Chroma）可切换。',
    },
    localNote: {
      en: 'No open upload endpoint. The documents and extracted fields come from the project\'s real LangExtract output on these verticals; the backend toggle reflects how the platform is actually pluggable between Qdrant and Chroma in production.',
      zh: '不开放无限制上传。文档和抽取字段来自项目在这些垂直场景下真实跑出来的 LangExtract 结果；后端切换反映了真实系统在 Qdrant / Chroma 之间可插拔的设计。',
    },
    whatToTry: {
      en: [
        'Switch verticals — extraction fields change shape because each domain has its own schema.',
        'Toggle Qdrant ↔ Chroma to see how the platform exposes its vector backend as a swappable choice.',
        'Compare the extracted fields table with the grounded QA answer — both pull from the same document, but the user-facing shape is different.',
      ],
      zh: [
        '切换垂直领域——每个领域 schema 不同,抽取字段的形态也跟着变。',
        '在 Qdrant ↔ Chroma 之间切换,体会平台如何把向量后端做成可替换组件。',
        '对照结构化字段表和有依据问答——同一份文档,但面向用户的呈现形态不一样。',
      ],
    },
    whatItProves: {
      en: [
        'You design document AI as a workflow (parse → extract → index → grounded QA), not as standalone tools.',
        'You take extraction and retrieval as a single shape — same document, two consumption patterns.',
        'You ship the platform with a pluggable vector backend instead of hardcoding one provider.',
      ],
      zh: [
        '你把文档智能做成工作流（解析 → 抽取 → 入库 → 有依据问答），而不是一堆零散工具。',
        '你把抽取和检索当成同一形态的两个出口——同一份文档、两种消费方式。',
        '你把平台做成支持可插拔向量后端,而不是硬绑一个 provider。',
      ],
    },
    highlights: [
      {
        label: { en: 'Stack', zh: '技术栈' },
        value: { en: 'LangExtract · LangChain · DeepSeek · Qdrant / Chroma · React + FastAPI', zh: 'LangExtract · LangChain · DeepSeek · Qdrant / Chroma · React + FastAPI' },
      },
      {
        label: { en: 'Shape', zh: '产品形态' },
        value: { en: 'extract layer + retrieval layer + grounded QA, one workflow', zh: '抽取层 + 检索层 + 有依据问答，统一工作流' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Vertical document AI as a reusable product, not a one-off', zh: '把垂直文档智能做成可复用产品，而不是一次性脚本' },
      },
    ],
  },
} satisfies Record<string, ProjectDemoDefinition>;

export type ProjectDemoSlug = keyof typeof projectDemos;

export const projectDemoSlugs = Object.keys(projectDemos) as ProjectDemoSlug[];

export function isProjectDemoSlug(slug: string): slug is ProjectDemoSlug {
  return slug in projectDemos;
}
