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
import DifyLongContentPreview from '@/components/mdx/DifyLongContentPreview';
import DeepSeekOcrAnalysisPreview from '@/components/mdx/DeepSeekOcrAnalysisPreview';
import ChartVqaFinetunePreview from '@/components/mdx/ChartVqaFinetunePreview';
import CozeVideoPipelinePreview from '@/components/mdx/CozeVideoPipelinePreview';
import AgenticGraphRagPreview from '@/components/mdx/AgenticGraphRagPreview';
import HarnessEngineeringPreview from '@/components/mdx/HarnessEngineeringPreview';
import AgentMemoryPreview from '@/components/mdx/AgentMemoryPreview';
import ContextEngineeringPreview from '@/components/mdx/ContextEngineeringPreview';
import VeRLPpoPreview from '@/components/mdx/VeRLPpoPreview';
import ClipCrossModalPreview from '@/components/mdx/ClipCrossModalPreview';
import OpenClawMultiAgentPreview from '@/components/mdx/OpenClawMultiAgentPreview';
import LlamaFromScratchPreview from '@/components/mdx/LlamaFromScratchPreview';

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
      en: 'data_create pipeline + LoRA eval',
      zh: '真实数据生成流水线 + LoRA 评估',
    },
    summary: {
      en: 'The project\'s real two-half shape: a 6-step pipeline that turns a private DB into Alpaca-format training data, then a LLaMA-Factory LoRA recipe on Qwen3-4B. The before/after eval numbers (BLEU-4 10.25 → 22.90, ROUGE-L 10.31 → 28.05) are lifted verbatim from the notebook.',
      zh: '项目真实的两层结构：6 阶段流水线把私有 DB 转成 Alpaca 训练数据，然后 LLaMA-Factory 在 Qwen3-4B 上跑 LoRA。前后评估数据（BLEU-4 10.25 → 22.90、ROUGE-L 10.31 → 28.05）原样取自 notebook。',
    },
    localNote: {
      en: 'Nothing fabricated. The Alpaca samples, LLaMA-Factory command, eval table, and the DeepSeek-Coder branch numbers (91% syntax-valid, 61% execution-match, 0.59% trainable params) are all directly from 案例7 notebook 企业私有化Nl2SQL模型微调实战.ipynb.',
      zh: '没有捏造内容。Alpaca 样例、LLaMA-Factory 命令、评估表、DeepSeek-Coder 分支数字（语法 91%、执行 61%、可训参 0.59%）都直接来自案例7 notebook《企业私有化Nl2SQL模型微调实战.ipynb》。',
    },
    whatToTry: {
      en: [
        'Switch between the Spider concert_singer schema and the project\'s 中文销售 example — same Alpaca shape, different SQL dialect.',
        'Read the llamafactory-cli command — lora_rank 8, alpha 16, cosine, bf16, 3 epochs. Effective batch = 8 × 8 = 64.',
        'Compare BLEU-4 / ROUGE-L before vs after LoRA — these are real predict_with_generate metrics, not hand-picked.',
      ],
      zh: [
        '在 Spider 的 concert_singer 和项目自带的中文销售 schema 之间切换 — Alpaca 形态相同，SQL 方言不同。',
        '读 llamafactory-cli 命令 — LoRA rank 8 / alpha 16 / cosine / bf16 / 3 epochs。有效 batch = 8 × 8 = 64。',
        '对照 LoRA 前后的 BLEU-4 / ROUGE-L — 这是真实的 predict_with_generate 数字，不是挑出来的。',
      ],
    },
    whatItProves: {
      en: [
        'You can ship the full lifecycle: private-DB metadata → Alpaca data → LLaMA-Factory LoRA → predict_with_generate eval.',
        'You separate text-match metrics (BLEU/ROUGE) from execution-match (run the SQL, compare result sets) — the project counts execution as the ground truth.',
        'You know which lever does what: LoRA gets you syntax, more training samples get you execution accuracy, vLLM gets you serving throughput.',
      ],
      zh: [
        '你能交付完整生命周期：私有 DB 元数据 → Alpaca 数据 → LLaMA-Factory LoRA → predict_with_generate 评估。',
        '你把文本相似度（BLEU/ROUGE）和执行匹配（真跑 SQL 比对结果集）分开 — 项目把后者当成最终真值。',
        '你清楚每个杠杆的作用：LoRA 提语法、扩数据提执行准确率、vLLM 提推理吞吐。',
      ],
    },
    highlights: [
      {
        label: { en: 'Stack', zh: '技术栈' },
        value: { en: 'Qwen3-4B + LLaMA-Factory LoRA (r=8, α=16) · DeepSeek-Coder 6.7B branch · vLLM 351 samples/s', zh: 'Qwen3-4B + LLaMA-Factory LoRA (r=8, α=16) · DeepSeek-Coder 6.7B 分支 · vLLM 351 samples/s' },
      },
      {
        label: { en: 'Real eval', zh: '真实评估' },
        value: { en: 'BLEU-4 10.25→22.90 · ROUGE-1 19.14→44.67 · ROUGE-L 10.31→28.05', zh: 'BLEU-4 10.25→22.90 · ROUGE-1 19.14→44.67 · ROUGE-L 10.31→28.05' },
      },
      {
        label: { en: 'Execution-match', zh: '执行匹配' },
        value: { en: 'DeepSeek-Coder branch: 91% syntax-valid, 61% execution-matches-gold', zh: 'DeepSeek-Coder 分支：语法 91%、执行匹配 61%' },
      },
    ],
  },
  'rl-tuned-function-calling-agent-pipeline': {
    component: FunctionCallingAgentPreview,
    eyebrow: {
      en: 'AutoToolDPO · real chosen/rejected pairs',
      zh: 'AutoToolDPO · 真实 chosen/rejected 对',
    },
    summary: {
      en: 'AutoToolDPO is the actual project name. The samples below are taken verbatim from its generated dataset — versioned tool names (get_stock_price@v1, web_search@v1, ...), <function_call> / <final> tags, and the chosen/rejected shape LLaMA-Factory consumes for DPO.',
      zh: 'AutoToolDPO 是项目的真实名字。下面 3 个样本原样取自它生成的数据集 — 带版本号的工具名（get_stock_price@v1、web_search@v1...）、<function_call> / <final> 标签、LLaMA-Factory DPO 训练直接消费的 chosen/rejected 形态。',
    },
    localNote: {
      en: 'No live LLM call. The samples and 6-stage pipeline visualization come straight from cells 47, 68, and §6 of 案例9 notebook 企业级Agent Function-Calling RL微调.ipynb. The Concurrent Engine concurrency (asyncio.Semaphore=10) and DeepSeek API as the underlying LLM are project facts.',
      zh: '不调真实 LLM。样本和 6 阶段流水线可视化直接来自案例9 notebook《企业级Agent Function-Calling RL微调.ipynb》第 47、68 个 cell 和第 6 章。并发引擎（asyncio.Semaphore=10）+ DeepSeek API 都是项目的真实事实。',
    },
    whatToTry: {
      en: [
        'Click through the 3 samples — read the exact chosen vs rejected text and the "why this is rejected" rationale.',
        'Spot the @v1 version suffix on every tool name — it is on purpose, so older traces stay parseable when schemas evolve.',
        'Trace the 6-stage backend pipeline (TaskGenerator → DataSynthesizer → smart rejected → LLM self-validate → Validator → Exporter) along the bottom strip.',
      ],
      zh: [
        '依次点 3 个样本 — 看每条样本里 chosen vs rejected 的真实文本以及「为什么 rejected」的归因。',
        '注意每个工具名后的 @v1 后缀 — 这是故意的，让 schema 演化后旧轨迹仍然可解析。',
        '沿着底部条带跟 6 阶段后端流水线（TaskGenerator → DataSynthesizer → 智能 rejected → LLM 自评 → Validator → Exporter）。',
      ],
    },
    whatItProves: {
      en: [
        'You can ship the data infrastructure modern DPO actually needs — not just hand-wave about "preference learning".',
        'You design rejected samples on purpose (wrong tool / empty args / skipped tool / over-confident <final>) — a real DPO failure-mode taxonomy, not abstract scoring.',
        'You handle production concerns: concurrency (Semaphore), retries (exponential backoff), JSONL strictness for LLaMA-Factory ingestion.',
      ],
      zh: [
        '你能交付现代 DPO 真正需要的数据基础设施 — 不是空谈「偏好学习」。',
        '你刻意设计 rejected 样本（错工具 / 空参 / 跳过工具 / 太自信的 <final>）— 一份真实的 DPO 失败模式分类，不是抽象打分。',
        '你顾及到生产实践细节：并发控制（Semaphore）、重试（指数退避）、给 LLaMA-Factory 喂数据时 JSONL 的严格要求。',
      ],
    },
    highlights: [
      {
        label: { en: 'Project name', zh: '项目名' },
        value: { en: 'AutoToolDPO · FastAPI + React + DeepSeek API', zh: 'AutoToolDPO · FastAPI + React + DeepSeek API' },
      },
      {
        label: { en: 'Sample shape', zh: '样本形态' },
        value: { en: '{system, tools, messages, chosen, rejected} JSONL · versioned tool names @v1', zh: '{system, tools, messages, chosen, rejected} JSONL · 带版本号的工具名 @v1' },
      },
      {
        label: { en: 'Training target', zh: '训练目标' },
        value: { en: 'LLaMA-Factory DPO trainer on Qwen-7B family', zh: 'LLaMA-Factory DPO trainer · Qwen-7B 系列' },
      },
    ],
  },
  'structured-extraction-retrieval-qa-platform': {
    component: StructuredExtractionPreview,
    eyebrow: {
      en: 'LangExtract · source-grounded extraction',
      zh: 'LangExtract · 抽取带原文定位',
    },
    summary: {
      en: 'The signature feature of LangExtract — Google\'s open-source library wrapped in this project — is that every extraction carries its char_interval back to the source. Two real notebook texts (a 2025-12-22 news brief and the Romeo & Juliet few-shot) are highlighted live, with hover-to-see-offset.',
      zh: 'LangExtract（这个项目封装的 Google 开源库）的招牌特性是：每个抽取都带 char_interval 指回原文位置。两段 notebook 真实文本（2025-12-22 三机构新闻 + 罗密欧与朱丽叶 few-shot）即时高亮，hover 可看偏移量。',
    },
    localNote: {
      en: 'The text, extraction categories, attributes, and lx.extract config (extraction_passes=3, max_workers=20, max_char_buffer=1000 for the long-doc preset) are taken verbatim from 案例13 notebook Agentic-GraphRAG应用开发实战.ipynb (cells 66, 88, 107, 111). char_interval positions are resolved against the source string at module load — so the highlights you see are real offsets, not stylized markers.',
      zh: '文本、抽取类别、属性、lx.extract 配置（长文档预设 extraction_passes=3、max_workers=20、max_char_buffer=1000）原样取自案例13 notebook《Agentic-GraphRAG应用开发实战.ipynb》第 66、88、107、111 个 cell。char_interval 偏移量在模块加载时根据原文真实计算 — 看到的高亮位置是真实偏移，不是装饰。',
    },
    whatToTry: {
      en: [
        'Hover any highlighted span — the tooltip shows the actual char_interval [start-end] that lx.extract returns.',
        'Switch between the news brief (6 entity classes, 16 extractions) and the Romeo & Juliet excerpt (3 classes with attributes per extraction).',
        'Read the lx.data.ExampleData few-shot code panel — it is the verbatim few-shot you would pass to lx.extract().',
      ],
      zh: [
        '把鼠标悬停在高亮片段上 — tooltip 显示 lx.extract 真实返回的 char_interval [start-end]。',
        '在三机构新闻（6 类实体、16 个抽取）和罗密欧与朱丽叶节选（3 类带属性的抽取）之间切换。',
        '阅读 lx.data.ExampleData few-shot 代码面板 — 这就是你会传给 lx.extract() 的原始 few-shot。',
      ],
    },
    whatItProves: {
      en: [
        'You understand why source grounding (char_interval) matters — auditability for medical / legal / compliance scenarios.',
        'You know LangExtract\'s scaling levers: extraction_passes for recall, max_workers for throughput, max_char_buffer to balance context and accuracy.',
        'You design Agentic-GraphRAG as OCR → LangExtract → KG + vector → LangChain Agent — the four real stages from the notebook, not a one-trick demo.',
      ],
      zh: [
        '你理解为什么 source grounding（char_interval）重要 — 医疗/法律/合规场景下的可审计性。',
        '你知道 LangExtract 的扩展杠杆：extraction_passes 提召回、max_workers 提吞吐、max_char_buffer 在上下文和准确性之间取舍。',
        '你把 Agentic-GraphRAG 设计成 OCR → LangExtract → 图谱+向量 → LangChain Agent 这 4 个真实阶段 — 不是单点炫技。',
      ],
    },
    highlights: [
      {
        label: { en: 'Core library', zh: '核心库' },
        value: { en: 'LangExtract (Google open-source) · DeepSeek API via OpenAILanguageModel', zh: 'LangExtract（Google 开源）· DeepSeek API via OpenAILanguageModel' },
      },
      {
        label: { en: 'Long-doc preset', zh: '长文档预设' },
        value: { en: '罗密欧与朱丽叶 54k chars → 1,889 extractions · 3 passes · 20 workers', zh: '罗密欧与朱丽叶 54k 字符 → 1,889 个抽取 · 3 轮 pass · 20 worker' },
      },
      {
        label: { en: 'Pipeline', zh: '完整 pipeline' },
        value: { en: 'OCR (MinerU / PaddleOCR-VL / DeepSeek-OCR) → LangExtract → KG + vector → LangChain 1.1 Agent', zh: 'OCR（MinerU / PaddleOCR-VL / DeepSeek-OCR）→ LangExtract → 图谱+向量 → LangChain 1.1 Agent' },
      },
    ],
  },
  'dify-long-content-agent': {
    component: DifyLongContentPreview,
    eyebrow: {
      en: 'Workflow replay sandbox',
      zh: '工作流复演沙盒',
    },
    summary: {
      en: 'A guided replay of the real Dify advanced-chat graph: a start node reads the word budget, then a loop runs expand → count chars → check budget until the budget is met, followed by a style-checker tool.',
      zh: '复演真实 Dify advanced-chat graph：开始节点读入字数预算，循环里反复「扩写 → 数字数 → 判断达标」，达标后跑风格校验工具。',
    },
    localNote: {
      en: 'This replays the graph from the real workflow YAML (循环扩充文本.yml + Tool-StyleChecker.yml) on a sample story topic. It calls no live Dify/DeepSeek — the loop logic, char counting, and exit condition are the real node behavior.',
      zh: '这是用真实工作流 YAML（循环扩充文本.yml + Tool-StyleChecker.yml）的节点逻辑在一个样例故事主题上的复演，不调真实 Dify/DeepSeek。循环、字数统计、退出条件都是真实节点行为。',
    },
    whatToTry: {
      en: [
        'Run the workflow and watch each loop iteration append a beat and accumulate the char count.',
        'Notice the if-else exit: the loop ends only once len(history) ≥ the word budget.',
        'Read the StyleChecker JSON verdict — style match plus concrete revision notes.',
      ],
      zh: [
        '运行工作流，看每轮迭代扩写一段并累加字数。',
        '注意 if-else 退出条件：只有 len(history) ≥ 字数预算时循环才结束。',
        '看 StyleChecker 的 JSON 结论——风格是否一致 + 具体修改建议。',
      ],
    },
    whatItProves: {
      en: [
        'You can design a stateful Dify loop with typed conversation variables, code nodes, and an if-else exit — not a single mega-prompt.',
        'You separate in-progress state (conversation.history) from model calls, so failures are recoverable per iteration.',
        'You know when low-code orchestration beats writing a long agent loop in code.',
      ],
      zh: [
        '你能设计有状态的 Dify 循环：类型化 conversation 变量 + code 节点 + if-else 退出，而不是一个超大 prompt。',
        '你把进行中的状态（conversation.history）和模型调用分离，单轮失败可独立恢复。',
        '你清楚什么时候低代码编排比手写长 agent 循环更合适。',
      ],
    },
    highlights: [
      {
        label: { en: 'Real workflow', zh: '真实工作流' },
        value: { en: '3 YAML files: 长文本扩展 + 循环扩充文本 + Tool-StyleChecker', zh: '3 个 YAML：长文本扩展 + 循环扩充文本 + Tool-StyleChecker' },
      },
      {
        label: { en: 'Loop control', zh: '循环控制' },
        value: { en: 'Dify loop node · conversation vars zishu/tetx_new/history · if-else ≥ budget', zh: 'Dify loop 节点 · conversation 变量 zishu/tetx_new/history · if-else ≥ 预算' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Stateful low-code orchestration with per-step model choice', zh: '有状态的低代码编排，且每步可独立选模型' },
      },
    ],
  },
  'deepseek-ocr-data-analysis-agent': {
    component: DeepSeekOcrAnalysisPreview,
    eyebrow: {
      en: 'Layered pipeline sandbox',
      zh: '分层管线沙盒',
    },
    summary: {
      en: 'A guided replay of the three-layer system on a sample financial table: ocr_service parses table structure, analysis_service computes KPIs + an LLM summary, visualization_service lets the LLM pick the chart type and renders it.',
      zh: '在一张样例财报表格上复演三层系统：ocr_service 解析表结构，analysis_service 算 KPI + LLM 摘要，visualization_service 让 LLM 选图表类型再渲染。',
    },
    localNote: {
      en: 'This replays the architecture from the real project (core/ocr · core/analysis · core/visualization wired by integration_service). It calls no live vLLM/LLM — the sample table, KPIs, and chart-type choice illustrate the real per-layer behavior.',
      zh: '这是用真实项目的架构（core/ocr · core/analysis · core/visualization，由 integration_service 串起）做的复演，不调真实 vLLM/LLM。样例表格、KPI、图表选型展示的是每层真实行为。',
    },
    whatToTry: {
      en: [
        'Run the pipeline and watch a PDF table become structured cells, then KPIs, then a chart.',
        'Note the OCR latency badge — vLLM brings DeepSeek-OCR-2 to 0.6s/page vs ~3s on bare transformers.',
        'See that the LLM picks the chart type before rendering, instead of a hard-coded if-else.',
      ],
      zh: [
        '运行管线，看一张 PDF 表格依次变成结构化单元格、KPI、图表。',
        '注意 OCR 延迟徽标——vLLM 把 DeepSeek-OCR-2 压到 0.6s/页，裸 transformers 约 3s。',
        '注意图表类型是 LLM 先选定再渲染，而不是硬编码 if-else。',
      ],
    },
    whatItProves: {
      en: [
        'You build layered AI systems — OCR / analysis / visualization as separate service + core, not a monolith.',
        'You match the OCR engine to the task: table-structure-aware (DeepSeek-OCR-2) beats flat-text OCR for financial / research tables.',
        'You care about inference latency, deploying on vLLM rather than bare transformers.',
      ],
      zh: [
        '你能构建分层 AI 系统——OCR / 分析 / 可视化各为独立 service + core，不是 monolith。',
        '你按任务选 OCR：表结构感知（DeepSeek-OCR-2）在财报/科研表格上碾压纯文本 OCR。',
        '你关注推理延迟，用 vLLM 上线而不是裸 transformers。',
      ],
    },
    highlights: [
      {
        label: { en: 'Architecture', zh: '架构' },
        value: { en: 'ocr_service · analysis_service · visualization_service · integration_service', zh: 'ocr_service · analysis_service · visualization_service · integration_service' },
      },
      {
        label: { en: 'OCR latency', zh: 'OCR 延迟' },
        value: { en: 'DeepSeek-OCR-2 on vLLM: ~0.6s/page (vs ~3s on bare transformers)', zh: 'DeepSeek-OCR-2 跑 vLLM：约 0.6s/页（裸 transformers ~3s）' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Swappable layers + latency-aware deployment for a real-time loop', zh: '可替换分层 + 面向实时循环的延迟意识' },
      },
    ],
  },
  'multimodal-finetune-chart-vqa': {
    component: ChartVqaFinetunePreview,
    eyebrow: {
      en: 'Before/after comparison',
      zh: '微调前后对比',
    },
    summary: {
      en: 'Same Chinese chart, same question — a general VLM vs the LoRA fine-tuned model. The base model misreads Chinese labels; the fine-tuned model returns the exact label + number from the training target.',
      zh: '同一张中文图表、同一个问题，对比通用 VLM 和 LoRA 微调模型。通用模型读不准中文标签，微调模型给出训练目标里精确的标签 + 数值。',
    },
    localNote: {
      en: 'The fine-tuned answers are the real assistant targets from llamafactory_train.jsonl; the training command is the real LlamaFactory setup. No model runs in the browser — this isolates the strongest signal: what fine-tuning fixes.',
      zh: '微调答案是 llamafactory_train.jsonl 里真实的 assistant 目标；训练命令是真实的 LlamaFactory 设置。浏览器里不跑模型——这样能聚焦最强信号：微调到底修好了什么。',
    },
    whatToTry: {
      en: [
        'Switch between the three sample questions and re-run both models.',
        'Compare the base model (vague, misreads Chinese labels) with the fine-tuned model (exact label + number).',
        'Read the LlamaFactory setup — qwen2_vl template, 448 image resolution, LoRA rank 16 / alpha 32.',
      ],
      zh: [
        '在三个样例问题之间切换，重新跑两个模型。',
        '对比通用模型（含糊、读不准中文标签）和微调模型（标签 + 数值精确）。',
        '看 LlamaFactory 设置——qwen2_vl 模板、448 图像分辨率、LoRA rank 16 / alpha 32。',
      ],
    },
    whatItProves: {
      en: [
        'You can run an end-to-end vertical multimodal fine-tune, not just call an API.',
        'You understand data construction is as important as training — the data-gen tool is its own React + FastAPI project.',
        'You stay inside the LlamaFactory ecosystem, so this composes with the NL2SQL / function-calling / Qwen-VL RL projects.',
      ],
      zh: [
        '你能端到端跑垂直领域多模态微调，而不只是调 API。',
        '你理解数据构造和训练同等重要——数据生成工具本身是个独立的 React + FastAPI 项目。',
        '你留在 LlamaFactory 生态里，能和 NL2SQL / 函数调用 / Qwen-VL RL 几个项目组合复用。',
      ],
    },
    highlights: [
      {
        label: { en: 'Base model', zh: '基座模型' },
        value: { en: 'Qwen2.5-VL-7B-Instruct · LoRA (rank 16, alpha 32) · template qwen2_vl', zh: 'Qwen2.5-VL-7B-Instruct · LoRA（rank 16, alpha 32）· 模板 qwen2_vl' },
      },
      {
        label: { en: 'Data', zh: '数据' },
        value: { en: 'llamafactory_train.jsonl — synthetic Chinese charts → 5–10 Q&A per image', zh: 'llamafactory_train.jsonl —— 合成中文图表 → 每图 5–10 组 Q&A' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'A targeted fine-tune that puts domain labels into the vocabulary', zh: '把领域标签塞进词表的针对性微调' },
      },
    ],
  },
  'coze-multimodal-video-agent': {
    component: CozeVideoPipelinePreview,
    eyebrow: {
      en: 'Workflow-chain replay',
      zh: '工作流链复演',
    },
    summary: {
      en: 'A guided replay of the 5 Coze workflows on a sample brief: produce routes the job, get_produce writes the title + 6 storyboard shots, create_image / create_video generate per shot, and get_video merges the final cut.',
      zh: '在一个样例选题上复演 5 个 Coze 工作流：produce 分发任务，get_produce 写标题 + 6 个分镜，create_image / create_video 逐镜生成，get_video 合并成片。',
    },
    localNote: {
      en: 'This replays the real workflow chain (the 5 zips with their draft IDs) on the sample brief from the case. It generates no real media — the point is the modular workflow design, not live image/video models.',
      zh: '这是用真实工作流链（5 个带 draft ID 的 zip）在案例样例选题上的复演，不生成真实媒体——重点是模块化 workflow 设计，不是真跑图生/视频模型。',
    },
    whatToTry: {
      en: [
        'Run the pipeline and watch the 5 workflows hand off: produce → get_produce → create_image → create_video → get_video.',
        'Notice each shot lights up an image badge, then a clip badge, as the later workflows run.',
        'See why the chain is split into 5 zips: independent failure, model swap, caching, and debugging.',
      ],
      zh: [
        '运行流水线，看 5 个 workflow 依次接力：produce → get_produce → create_image → create_video → get_video。',
        '注意每个分镜先点亮「图」徽标，再点亮「片段」徽标。',
        '体会为什么拆成 5 个 zip：独立失败 / 独立换模型 / 独立 cache / 独立调试。',
      ],
    },
    whatItProves: {
      en: [
        'You know when a low-code platform beats writing long code — content pipelines lean on built-in image/video plugins.',
        'You design modular workflows split by capability and composed by reference (draft IDs), not one mega-flow.',
        'You can choose between Coze / Dify / LangChain by scenario: content vs conversational vs custom logic.',
      ],
      zh: [
        '你知道什么时候低代码平台胜过写长代码——内容流水线依赖平台内置的图生/视频插件。',
        '你按能力拆分、按引用（draft ID）组合 workflow，而不是一个超大流程。',
        '你能按场景在 Coze / Dify / LangChain 之间选型：内容 / 对话 / 自定义逻辑。',
      ],
    },
    highlights: [
      {
        label: { en: '5 workflows', zh: '5 个工作流' },
        value: { en: 'produce · get_produce · create_image · create_video · get_video', zh: 'produce · get_produce · create_image · create_video · get_video' },
      },
      {
        label: { en: 'Why Coze', zh: '为什么 Coze' },
        value: { en: 'ByteDance image/video models ship as built-in plugins — no API keys, no rate-limit plumbing', zh: '字节系图生/视频模型内置成插件——不用接 API key、不用管限流' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Modular orchestration + right-tool-for-the-job platform judgment', zh: '模块化编排 + 按场景选平台的判断力' },
      },
    ],
  },
  'agentic-graphrag-agent': {
    component: AgenticGraphRagPreview,
    eyebrow: {
      en: 'Agent-routing sandbox',
      zh: 'Agent 路由沙盒',
    },
    summary: {
      en: 'Switch questions and watch the LangChain agent pick vector / graph / hybrid retrieval: the graph path lights up the knowledge-graph entities hop by hop, and each answer carries char_interval source citations.',
      zh: '换不同问题，看 LangChain Agent 选 向量 / 图谱 / 混合 检索：图谱路沿知识图谱实体逐跳点亮，每个答案都带 char_interval 原文引用。',
    },
    localNote: {
      en: 'The knowledge graph (a Python dict of entities + relations), the three tools, and the char_interval citations are the real pipeline behavior on a sample private-loan contract. No live DeepSeek / Chroma — the routing and multi-hop traversal are what matter.',
      zh: '知识图谱（实体 + 关系的 Python dict）、三个工具、char_interval 引用都是在一份民间借贷合同样例上的真实 pipeline 行为。不调真实 DeepSeek / Chroma——重点是工具路由和多跳遍历。',
    },
    whatToTry: {
      en: [
        'Run the fact question and watch it route to vector_search_tool only.',
        'Run the relational question and watch graph_search_tool traverse the KG hop by hop.',
        'Run the compound question and watch hybrid_search_tool fuse vector hits + graph hops.',
      ],
      zh: [
        '跑事实型问题，看它只路由到 vector_search_tool。',
        '跑关系型问题，看 graph_search_tool 沿知识图谱逐跳遍历。',
        '跑复合型问题，看 hybrid_search_tool 融合向量命中 + 图谱多跳。',
      ],
    },
    whatItProves: {
      en: [
        'You know when a graph is needed (relations / multi-hop) and when Neo4j is over-engineering — here the graph is a Python dict.',
        'You design agentic retrieval routing: the agent picks vector / graph / hybrid per question, not a hard-coded path.',
        'You keep source grounding (char_interval) end-to-end, so every claim is auditable.',
      ],
      zh: [
        '你知道什么时候需要图（关系 / 多跳），什么时候 Neo4j 是过度工程——这里的图就是一个 Python dict。',
        '你设计 agentic 检索路由：Agent 按问题选 向量 / 图谱 / 混合，而不是写死一条路。',
        '你把 source grounding（char_interval）贯穿到底，每条断言都可审计。',
      ],
    },
    highlights: [
      {
        label: { en: 'Extraction', zh: '抽取' },
        value: { en: 'LangExtract 1.1.1 + DeepSeek deepseek-chat · classes 实体 / 数据指标 / 关系描述', zh: 'LangExtract 1.1.1 + DeepSeek deepseek-chat · 类别 实体 / 数据指标 / 关系描述' },
      },
      {
        label: { en: 'Stores', zh: '存储' },
        value: { en: 'Chroma (text-embedding-v4, 1024-dim) + a Python-dict knowledge graph', zh: 'Chroma（text-embedding-v4, 1024 维）+ Python dict 知识图谱' },
      },
      {
        label: { en: 'Agent', zh: 'Agent' },
        value: { en: 'LangChain create_agent · 3 tools: vector / graph (1–2 hop) / hybrid', zh: 'LangChain create_agent · 3 工具：向量 / 图谱（1–2 跳）/ 混合' },
      },
    ],
  },
  'harness-engineering': {
    component: HarnessEngineeringPreview,
    eyebrow: {
      en: 'The model × design formula',
      zh: '模型 × 设计公式',
    },
    summary: {
      en: 'Install the four Harness pillars one by one and watch the benchmark climb from a bare model (52.8%) to a full Harness (66.5%) — with the model held constant.',
      zh: '依次装上 Harness 四大支柱，看 benchmark 从裸模型 52.8% 爬到满 Harness 66.5%——模型保持不变。',
    },
    localNote: {
      en: 'The 52.8% / 66.5% endpoints are the real LangChain measurements on Terminal Bench 2.0 (same GPT-5.2-Codex, harness-only change) cited in the course; the climb between is illustrative. Pillar names come from the Harness Engineering deck.',
      zh: '52.8% / 66.5% 是课程引用的 LangChain 实测端点（同一个 GPT-5.2-Codex，只改 Harness）；中间过程为示意。支柱名称来自《Harness Engineering 技术实战》课件。',
    },
    whatToTry: {
      en: [
        'Install the Harness and watch the four pillars light up in sequence.',
        'Note the endpoints: 52.8% bare → 66.5% with the full Harness, model unchanged.',
        'Compare against a model upgrade (+6.8pp) — the Harness is ~2× that gain.',
      ],
      zh: [
        '装配 Harness，看四大支柱依次点亮。',
        '注意端点：裸模型 52.8% → 满 Harness 66.5%，模型不变。',
        '对比换模型只 +6.8pp —— Harness 的收益约是其 2 倍。',
      ],
    },
    whatItProves: {
      en: [
        'You internalize the "output quality = model capability × design level" multiplier.',
        'You can name and apply the four pillars: codebase-as-truth, mechanized constraints (Hooks), feedback loops, entropy management.',
        'You argue from measured benchmark data, not vibes — and can pick deep vs light Harness platforms by scenario.',
      ],
      zh: [
        '你内化了「产出质量 = 模型能力 × 设计水平」这个乘法。',
        '你能说清并落地四大支柱：代码库即真相源、机械化约束(Hooks)、反馈循环、熵管理。',
        '你用实测 benchmark 说话，而不是「感觉」——并能按场景选深/轻 Harness 平台。',
      ],
    },
    highlights: [
      {
        label: { en: 'Headline result', zh: '核心数据' },
        value: { en: 'Terminal Bench 2.0: 52.8% → 66.5% (+13.7pp) from the Harness alone', zh: 'Terminal Bench 2.0：52.8% → 66.5%（+13.7pp），全来自 Harness' },
      },
      {
        label: { en: 'Four pillars', zh: '四大支柱' },
        value: { en: 'Codebase-as-truth · mechanized constraints (Hooks) · feedback loops · entropy mgmt', zh: '代码库即真相源 · 机械化约束(Hooks) · 反馈循环 · 熵管理' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Agent-runtime engineering judgment, measured not vibed', zh: 'Agent 运行时工程的判断力，用实测说话' },
      },
    ],
  },
  'agent-memory-system': {
    component: AgentMemoryPreview,
    eyebrow: {
      en: 'Memory scheduling replay',
      zh: '记忆调度复演',
    },
    summary: {
      en: 'A replay of the MemoryManager hub: short-term messages compress at MAX_HISTORY=20, a candidate fact passes a three-trigger write gate, MEMORY.md flips Direct→RAG past 2000 tokens, and the mem0 LLM judge resolves a conflict.',
      zh: '复演 MemoryManager 调度中枢：短期消息在 MAX_HISTORY=20 处压缩，候选事实过三要素写入闸，MEMORY.md 超 2000 token 切 Direct→RAG，mem0 LLM 裁判解决冲突。',
    },
    localNote: {
      en: 'All parameters (MAX_HISTORY=20, 2000-token threshold, the three write-triggers, the four mem0 ops) come from the Part 8 courseware (mini-OpenClaw + mem0). No live LLM/Milvus runs in the browser.',
      zh: '所有参数（MAX_HISTORY=20、2000 token 阈值、三要素、mem0 四操作）均来自 Part 8 课件（mini-OpenClaw + mem0）。浏览器里不调真实 LLM/Milvus。',
    },
    whatToTry: {
      en: [
        'Run the flow and watch short-term hit MAX_HISTORY=20, then fold the front 50% into a summary.',
        'See the candidate fact pass the factuality / stability / cross-session gate before it writes long-term.',
        'Watch MEMORY.md cross 2000 tokens and flip Direct→RAG, then the mem0 judge pick UPDATE.',
      ],
      zh: [
        '运行记忆流，看短期在 MAX_HISTORY=20 处把前 50% 折叠成摘要。',
        '看候选事实先过「事实性 / 稳定性 / 跨会话」三要素闸，再写长期。',
        '看 MEMORY.md 超 2000 token 切 Direct→RAG，mem0 裁判选 UPDATE。',
      ],
    },
    whatItProves: {
      en: [
        'You treat memory as a system: short-term (truncate/compress) + long-term (Direct/RAG) + a scheduling hub.',
        'You gate writes with explicit criteria, instead of dumping everything into a vector store.',
        'You can go from a hand-rolled version to production mem0 and reason about its namespace / judge / backend trade-offs.',
      ],
      zh: [
        '你把记忆当系统：短期(截断/压缩) + 长期(Direct/RAG) + 调度中枢。',
        '你用明确标准把写入闸住，而不是把一切塞进向量库。',
        '你能从手搓版平滑切到生产 mem0，并懂它的命名空间 / 裁判 / 后端取舍。',
      ],
    },
    highlights: [
      {
        label: { en: 'Short-term', zh: '短期' },
        value: { en: 'SessionManager · MAX_HISTORY=20 · rolling summary of the front 50%', zh: 'SessionManager · MAX_HISTORY=20 · 前 50% 滚动摘要' },
      },
      {
        label: { en: 'Long-term', zh: '长期' },
        value: { en: 'MEMORY.md, Direct→RAG at 2000 tokens (LlamaIndex VectorStoreIndex)', zh: 'MEMORY.md，2000 token 切 RAG（LlamaIndex VectorStoreIndex）' },
      },
      {
        label: { en: 'Production', zh: '生产层' },
        value: { en: 'mem0 LLM judge (ADD/UPDATE/DELETE/NONE) · Milvus · LangChain @tool', zh: 'mem0 LLM 裁判（ADD/UPDATE/DELETE/NONE）· Milvus · LangChain @tool' },
      },
    ],
  },
  'context-engineering-middleware': {
    component: ContextEngineeringPreview,
    eyebrow: {
      en: 'Context-budget replay',
      zh: '上下文预算复演',
    },
    summary: {
      en: 'Six modules fill the context window; stack the five strategies in the course\'s "Cache-first, Isolate-later" priority and watch both window tokens and relative cost drop.',
      zh: '六大模块占满上下文窗口；按课程的「先 Cache 后 Isolate」优先级叠加五大策略，看窗口 token 和相对成本一起降。',
    },
    localNote: {
      en: 'The decision priority, the five strategies (Write/Select/Compress/Isolate/Cache), the Compress sub-techniques, and the 90%-off prompt cache come from the Part 9 courseware. The token/cost numbers are illustrative.',
      zh: '决策优先级、五大策略（Write/Select/Compress/Isolate/Cache）、Compress 子技术、Cache 省 90% 等都来自 Part 9 课件。token / 成本数值为示意。',
    },
    whatToTry: {
      en: [
        'Stack the strategies and watch the window shrink module by module.',
        'Note Cache goes first (90% off, day one) and the system-prompt prefix turns "cached".',
        'See Isolate spin external-knowledge work into a sub-agent context only when needed.',
      ],
      zh: [
        '叠加策略，看窗口逐模块缩小。',
        '注意 Cache 最先用（省 90%，首日），系统提示前缀变成 cached。',
        '看 Isolate 只在按需时把外部知识检索丢进子 Agent 上下文。',
      ],
    },
    whatItProves: {
      en: [
        'You understand Context Rot — bigger window ≠ better — and manage it deliberately.',
        'You can name each module and pick the right strategy, realized as stackable LangChain middleware.',
        'You order savings: zero-cost (Cache / tool-result clearing) first, complex (Isolate / Write) on demand.',
      ],
      zh: [
        '你理解 Context Rot——更大窗口 ≠ 更好——并主动管理。',
        '你能说清每个模块、选对策略，并落成可叠加的 LangChain middleware。',
        '你按成本排序：零成本（Cache / 工具结果清除）先上，复杂（Isolate / Write）按需。',
      ],
    },
    highlights: [
      {
        label: { en: 'Framework', zh: '框架' },
        value: { en: 'Six modules × five strategies (Write/Select/Compress/Isolate/Cache)', zh: '六大模块 × 五大策略（Write/Select/Compress/Isolate/Cache）' },
      },
      {
        label: { en: 'As middleware', zh: '中间件' },
        value: { en: 'trim_messages · SummarizationMiddleware · SubAgentMiddleware (deepagents)', zh: 'trim_messages · SummarizationMiddleware · SubAgentMiddleware（deepagents）' },
      },
      {
        label: { en: 'Cost lever', zh: '成本杠杆' },
        value: { en: 'Prompt cache: read at 10% (90% off), prefix byte-stable', zh: 'Prompt cache：cache-read 仅 10%（省 90%），前缀逐字节稳定' },
      },
    ],
  },
  'verl-ppo-training': {
    component: VeRLPpoPreview,
    eyebrow: {
      en: 'PPO loop replay',
      zh: 'PPO 闭环复演',
    },
    summary: {
      en: 'Replays one PPO iteration on a GSM8K problem: the Actor rolls out a CoT (#### 72), the rule reward scores 1.0, the Critic values it, advantage = reward − value, then Actor/Critic update — four model roles lighting up around the loop.',
      zh: '复演一次 PPO 迭代：Actor 在一道 GSM8K 题上生成 CoT(#### 72)，规则奖励给 1.0，Critic 估 value，A=reward−value，Actor/Critic 更新——四个模型角色绕闭环依次点亮。',
    },
    localNote: {
      en: 'The four model roles, the seven-step loop, the reward regex (#### …), and the step:42 metrics (0.296 / 1702 tok/s) are from the veRL course ("LLM RL 强化学习训练入门"). No real training runs in the browser.',
      zh: '四个模型角色、七步闭环、reward 正则(#### …)、step:42 指标(0.296 / 1702 tok/s) 都来自 veRL 课件《LLM RL 强化学习训练入门》。浏览器里不真跑训练。',
    },
    whatToTry: {
      en: [
        'Run one PPO step and watch Actor → Reward → Critic → Advantage → updates in sequence.',
        'Note the rule reward: a regex on the #### answer gives a clean 1.0 / 0.0.',
        'See the four roles (Actor/Reference/Reward/Critic) light up at the right stage.',
      ],
      zh: [
        '跑一步 PPO，看 Actor → Reward → Critic → Advantage → 更新 依次执行。',
        '注意规则奖励：对 #### 答案做正则，干净地给 1.0 / 0.0。',
        '看四个角色（Actor/Reference/Reward/Critic）在对应阶段点亮。',
      ],
    },
    whatItProves: {
      en: [
        'You can run classic RLHF PPO end-to-end on an industrial framework (veRL + Ray), on a single GPU.',
        'You understand reward design: verifiable tasks (math) use a rule reward, not a trained RM.',
        'You can place PPO within RLHF (SFT → RM → PPO) and read the InstructGPT source.',
      ],
      zh: [
        '你能在工业级框架（veRL + Ray）上单卡端到端跑经典 RLHF PPO。',
        '你理解奖励设计：可验证任务（数学）用规则奖励，而不是训 RM。',
        '你能把 PPO 放进 RLHF（SFT → RM → PPO），读懂 InstructGPT 源头。',
      ],
    },
    highlights: [
      {
        label: { en: 'Framework', zh: '框架' },
        value: { en: 'veRL (HybridFlow) · Ray · FSDP + vLLM · Qwen2.5-0.5B on GSM8K', zh: 'veRL（HybridFlow）· Ray · FSDP + vLLM · Qwen2.5-0.5B on GSM8K' },
      },
      {
        label: { en: 'Four roles', zh: '四角色' },
        value: { en: 'Actor (policy) · Critic (value) · Reference (KL) · Reward (rule)', zh: 'Actor(策略) · Critic(价值) · Reference(KL) · Reward(规则)' },
      },
      {
        label: { en: 'RLHF origin', zh: 'RLHF 源头' },
        value: { en: 'InstructGPT: SFT → RM → PPO; 1.3B beat 175B GPT-3 on preference', zh: 'InstructGPT：SFT → RM → PPO；1.3B 在偏好上打败 175B GPT-3' },
      },
    ],
  },
  'clip-cross-modal-rag': {
    component: ClipCrossModalPreview,
    eyebrow: {
      en: 'Shared-space retrieval',
      zh: '同一空间检索',
    },
    summary: {
      en: 'Switch between text→image, image→image, and hybrid: a query is encoded to 512-dim and lands in one shared space, pulling the nearest images by cosine — with the real low cross-modal scores and a self-hit filter.',
      zh: '在 文搜图 / 图搜图 / 混合 间切换：query 编码成 512 维落进同一空间，按 cosine 拉出最近的图——含真实偏低的跨模态分数和自身命中过滤。',
    },
    localNote: {
      en: 'The 512-dim shared space, the ~0.24 text→image scores, the image→image self-hit (1.0) filter, RRF (k=60), and the 1536-dim VLM-caption index are all from the LlamaIndex multimodal notebook. The 2D plot is a projection for intuition.',
      zh: '512 维共享空间、文搜图约 0.24 的分数、图搜图自身命中(1.0)过滤、RRF(k=60)、VLM 描述 1536 维都来自 LlamaIndex 多模态 notebook。2D 图是为直觉做的投影。',
    },
    whatToTry: {
      en: [
        'Run text→image and watch a text query pull the nearest image diagrams.',
        'Switch to image→image and see the self-hit (1.0) get filtered out.',
        'Try hybrid and note BM25 + vector fused by RRF (k=60).',
      ],
      zh: [
        '跑文搜图，看文本 query 拉出最近的图。',
        '切图搜图，看自身命中(1.0)被过滤掉。',
        '试混合，注意 BM25 + 向量经 RRF(k=60) 融合。',
      ],
    },
    whatItProves: {
      en: [
        'You can land cross-modal retrieval (text↔image), not just chat-over-text.',
        'You know CLIP\'s limits (in-image text / Chinese) and patch them with VLM captions.',
        'You engineer hybrid retrieval (vector + BM25 via RRF) on the LlamaIndex multimodal stack.',
      ],
      zh: [
        '你能落地跨模态检索（文↔图），不只是「Chat with text」。',
        '你知道 CLIP 的边界（图内文字 / 中文），用 VLM 描述补。',
        '你在 LlamaIndex 多模态栈上做混合检索（向量 + BM25 经 RRF）。',
      ],
    },
    highlights: [
      {
        label: { en: 'Shared space', zh: '共享空间' },
        value: { en: 'CLIP (OpenAI) · get_text/image_embedding both 512-dim', zh: 'CLIP（OpenAI）· get_text/image_embedding 都是 512 维' },
      },
      {
        label: { en: 'Beyond CLIP', zh: '超越 CLIP' },
        value: { en: 'VLM caption (GPT-4o / Qwen-VL-Max) → text-embedding-3-small 1536-dim', zh: 'VLM 描述（GPT-4o / Qwen-VL-Max）→ text-embedding-3-small 1536 维' },
      },
      {
        label: { en: 'Hybrid', zh: '混合' },
        value: { en: 'BM25 + vector → QueryFusionRetriever, RRF k=60 · Milvus', zh: 'BM25 + 向量 → QueryFusionRetriever，RRF k=60 · Milvus' },
      },
    ],
  },
  'openclaw-multi-agent': {
    component: OpenClawMultiAgentPreview,
    eyebrow: {
      en: 'Hub-Spoke replay',
      zh: 'Hub-Spoke 复演',
    },
    summary: {
      en: 'A Hub-Spoke code review: the lead spawns three review subagents, an upward sessions_send is shown bouncing off the subagent boundary (blocked), and results flow back only via sessions_history.',
      zh: 'Hub-Spoke 代码评审：lead 派生三个评审子 Agent，一条上行 sessions_send 撞到子 Agent 边界被禁，结果只能经 sessions_history 流回。',
    },
    localNote: {
      en: 'The three MCP primitives (spawn/send/history), the six modes\' token multipliers, and the subagent-layer sessions_send ban (Issue #23359, the root of P2P\'s zero cases) come from the "OpenClaw 多Agent系统入门" course. No live OpenClaw runs here.',
      zh: '三个 MCP 原语（spawn/send/history）、6 模式 token 倍数、子层 sessions_send 禁用（Issue #23359，P2P 零案例根因）都来自《OpenClaw 多Agent系统入门》课件。这里不真跑 OpenClaw。',
    },
    whatToTry: {
      en: [
        'Run the orchestration and watch the lead spawn three subagents in parallel.',
        'Watch the upward sessions_send arrow turn red and bounce — banned at the subagent layer.',
        'See results flow back only via sessions_history before the lead synthesizes.',
      ],
      zh: [
        '运行编排，看 lead 并行派生三个子 Agent。',
        '看上行的 sessions_send 箭头变红弹回——子 Agent 层被禁。',
        '看结果只经 sessions_history 流回，lead 再综合。',
      ],
    },
    whatItProves: {
      en: [
        'You design multi-agent systems by topology and token cost (3–15×), not by piling on agents.',
        'You understand the Hub one-directional architecture and why P2P has zero production cases.',
        'You know the real engineering pitfalls (misplaced allowAgents, rate-limited polling, lost completion).',
      ],
      zh: [
        '你按拓扑和 token 成本（3–15×）设计多智能体，而不是堆 Agent。',
        '你理解 Hub 单向架构，知道 P2P 为什么生产零案例。',
        '你清楚真实工程坑（allowAgents 写错位、轮询被限流、completion 丢失）。',
      ],
    },
    highlights: [
      {
        label: { en: 'Primitives', zh: '原语' },
        value: { en: 'sessions_spawn (INSERT) · sessions_send (UPDATE, lead-only) · sessions_history (SELECT)', zh: 'sessions_spawn(INSERT) · sessions_send(UPDATE, 仅 lead) · sessions_history(SELECT)' },
      },
      {
        label: { en: 'Modes', zh: '模式' },
        value: { en: 'Hub-Spoke / Pipeline / Hierarchical / Routing / P2P / Fleet (1.5–20× tokens)', zh: 'Hub-Spoke / Pipeline / Hierarchical / Routing / P2P / Fleet（1.5–20× token）' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Evidence-driven orchestration design — knows what doesn\'t work too', zh: '用证据驱动的编排设计——也知道什么不 work' },
      },
    ],
  },
  'llama-from-scratch': {
    component: LlamaFromScratchPreview,
    eyebrow: {
      en: 'Build + train replay',
      zh: '搭建+训练复演',
    },
    summary: {
      en: 'Assemble a LLaMA decoder block layer by layer (RMSNorm + RoPE + GQA + SwiGLU + KV cache), then train: the loss curve falls and the sample generation goes from gibberish to coherent.',
      zh: '逐层拼出 LLaMA decoder block（RMSNorm + RoPE + GQA + SwiGLU + KV 缓存），再训练：loss 曲线下降，采样生成从乱码变通顺。',
    },
    localNote: {
      en: 'The architecture components (RMSNorm/RoPE/GQA/SwiGLU/KV-cache) are the real LLaMA structure from the course\'s LLaMA architecture series (a video course). The config and loss/step numbers are illustrative; no training runs in the browser.',
      zh: '架构组件（RMSNorm/RoPE/GQA/SwiGLU/KV缓存）是真实 LLaMA 结构，来自大模型原理正课 LLaMA 系列（视频课）。config 与 loss/step 数值为示意；浏览器里不真跑训练。',
    },
    whatToTry: {
      en: [
        'Build the model and watch the decoder block assemble layer by layer.',
        'Start training and watch the loss curve fall step by step.',
        'Watch the same-prompt generation go from gibberish to a coherent sentence.',
      ],
      zh: [
        '搭建模型，看 decoder block 逐层拼出来。',
        '开始训练，看 loss 曲线一步步下降。',
        '看同一 prompt 的生成从乱码变成通顺句子。',
      ],
    },
    whatItProves: {
      en: [
        'You own the foundation — implement LLaMA from scratch, not just import a model.',
        'You understand each modern component: RMSNorm / RoPE / GQA / SwiGLU / KV cache.',
        'You connect layers: KV cache underpins prompt caching; architecture grounds fine-tuning/RL choices.',
      ],
      zh: [
        '你吃透地基——从零实现 LLaMA，而不只是 import 一个模型。',
        '你理解每个现代组件：RMSNorm / RoPE / GQA / SwiGLU / KV 缓存。',
        '你打通上下层：KV 缓存支撑 prompt cache，架构理解支撑微调/RL 选择。',
      ],
    },
    highlights: [
      {
        label: { en: 'Architecture', zh: '架构' },
        value: { en: 'Decoder-only · RMSNorm · RoPE · GQA · SwiGLU · KV cache (Pre-Norm)', zh: 'Decoder-only · RMSNorm · RoPE · GQA · SwiGLU · KV 缓存（Pre-Norm）' },
      },
      {
        label: { en: 'From scratch', zh: '从零' },
        value: { en: 'PyTorch, no pretrained weights — tensors to training loop hand-written', zh: 'PyTorch，不加载权重——从张量到训练循环全手写' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Foundational depth that underpins fine-tuning, RL, and agents', zh: '支撑微调/RL/Agent 的地基级深度' },
      },
    ],
  },
} satisfies Record<string, ProjectDemoDefinition>;

export type ProjectDemoSlug = keyof typeof projectDemos;

export const projectDemoSlugs = Object.keys(projectDemos) as ProjectDemoSlug[];

export function isProjectDemoSlug(slug: string): slug is ProjectDemoSlug {
  return slug in projectDemos;
}
