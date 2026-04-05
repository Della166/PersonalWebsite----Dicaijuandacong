export interface SkillHighlight {
  label: string;
  label_en: string;
  summary: string;
  summary_en: string;
  leadWith: string[];
}

export interface SkillCluster {
  key: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  items: string[];
  featured?: boolean;
}

export const skillHighlight: SkillHighlight = {
  label: '当前求职技能画像',
  label_en: 'Current Skill Positioning',
  summary:
    '面向 Applied AI / GenAI 的全栈 AI 工程师，重点覆盖 LLM 微调、Agent 系统、RAG 架构与生产化后端能力，并以因果推断与效果评估作为差异化优势。',
  summary_en:
    'Full-stack AI Engineer focused on LLM fine-tuning, agent systems, RAG architecture, and production-oriented backend delivery, differentiated by causal inference and measurement skills.',
  leadWith: [
    'LangGraph',
    'MCP Protocol',
    'GraphRAG',
    'QLoRA',
    'GRPO / DPO',
    'FastAPI',
    'Causal Inference',
  ],
};

export const skillClusters: SkillCluster[] = [
  {
    key: 'llm-genai',
    title: 'LLM 与 GenAI 工程',
    title_en: 'LLM & GenAI Engineering',
    description: '聚焦模型接入、微调、对齐与推理优化，是我最适合放在求职材料前排的能力组合。',
    description_en:
      'Core strengths around model integration, fine-tuning, alignment, and inference optimization.',
    items: [
      'OpenAI / Claude / DeepSeek / Gemini / Qwen APIs',
      'vLLM',
      'SGLang',
      'LoRA / QLoRA fine-tuning',
      'GRPO / DPO alignment',
      'Unsloth',
      'LLaMA-Factory',
      'KV Cache optimization',
      'Flash Attention',
      'MoE architectures',
      'DeepSeek V3 / R1 techniques',
      'HuggingFace Transformers',
    ],
  },
  {
    key: 'agent-systems',
    title: 'Agent 系统',
    title_en: 'Agent Systems',
    description: '偏向产品化落地的 Agent 编排、工具调用、工作流自动化与安全约束能力。',
    description_en:
      'Product-oriented agent orchestration, tool use, workflow automation, and guardrail design.',
    items: [
      'LangGraph',
      'OpenAI Agents SDK',
      'MCP Protocol (SSE / Stdio / HTTP)',
      'Function Calling',
      'ReAct',
      'Multi-agent orchestration',
      'Dify',
      'Coze',
      'N8N',
      'GuardRails',
    ],
  },
  {
    key: 'rag-systems',
    title: 'RAG 与知识系统',
    title_en: 'RAG & Knowledge Systems',
    description: '覆盖检索增强、知识组织、查询改写与上下文工程，是我项目中出现频率最高的一条主线。',
    description_en:
      'Retrieval, knowledge organization, query transformation, and context engineering across document AI systems.',
    items: [
      'GraphRAG',
      'Milvus',
      'ChromaDB',
      'Faiss',
      'BGE / M3 embeddings',
      'Query Transformation',
      'Reranking',
      'Mem0',
      'DSPy Context Engineering',
      'RAGFlow',
    ],
  },
  {
    key: 'ml-multimodal',
    title: '机器学习与多模态',
    title_en: 'Machine Learning & Multimodal',
    description: '把传统 ML、深度学习和多模态视觉能力放在一组，更贴近你现在的 Applied AI 画像。',
    description_en:
      'A combined view of classical ML, deep learning, and multimodal modeling that matches an applied-AI profile.',
    items: [
      'PyTorch',
      'CNN Architectures',
      'LSTM / GRU / Informer',
      'XGBoost / LightGBM / CatBoost',
      'Optuna',
      'Feature Engineering',
      'Model Fusion',
      'Transfer Learning',
      'CLIP',
      'Vision Transformer (ViT)',
      'LLaVA',
      'Swin Transformer',
      'OpenCV',
      'Image Augmentation',
    ],
  },
  {
    key: 'infra-mlops',
    title: '训练优化与 MLOps',
    title_en: 'Optimization, Infra & MLOps',
    description: '强调训练并行、推理优化、服务化接口和部署支撑，方便招聘方理解你的工程深度。',
    description_en:
      'Distributed training, inference optimization, service APIs, and deployment-minded engineering support.',
    items: [
      'DeepSpeed (ZeRO 1 / 2 / 3)',
      'DDP / FSDP',
      'Tensor / Pipeline Parallelism',
      'Mixed Precision (fp16 / bf16 / fp8)',
      'Megatron-LM',
      'TensorRT',
      'Quantization (GPTQ / AWQ / GGUF)',
      'NCCL',
      'FastAPI',
      'Docker / Kubernetes',
      'LangSmith',
      'Wandb',
      'Pydantic',
      'SQLAlchemy / Alembic',
      'MongoDB',
      'GraphQL / RESTful API',
    ],
  },
  {
    key: 'causal-analytics',
    title: '因果推断与数据分析',
    title_en: 'Causal Inference & Analytics',
    description: '这是最能拉开差距的一组能力，适合在 AI Engineer 之外补足“会衡量业务影响”的信号。',
    description_en:
      'The strongest differentiator for showing that you can measure impact, not just build models or workflows.',
    items: [
      'A/B Testing',
      'PSM',
      'DID',
      'DML',
      'DAGs / do-calculus',
      'IV / 2SLS',
      'Sensitivity Analysis',
      'RCT Design',
      'SQL (Window Functions / CTEs / Joins)',
      'Pandas',
      'NumPy',
      'Tableau',
      'RFM / AARRR / Funnel / Cohort Analysis',
      'Business Metrics',
    ],
    featured: true,
  },
];
