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
} satisfies Record<string, ProjectDemoDefinition>;

export type ProjectDemoSlug = keyof typeof projectDemos;

export const projectDemoSlugs = Object.keys(projectDemos) as ProjectDemoSlug[];

export function isProjectDemoSlug(slug: string): slug is ProjectDemoSlug {
  return slug in projectDemos;
}
