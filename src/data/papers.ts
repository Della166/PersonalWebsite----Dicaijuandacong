export interface Paper {
  title: string;
  title_en: string;
  authors: string;
  venue: string;
  year: number;
  abstract: string;
  abstract_en: string;
  tags: string[];
  paper_url?: string;
  code_url?: string;
}

export const papers: Paper[] = [
  {
    title: '基于扩散模型的高效视频生成方法',
    title_en: 'Efficient Video Generation with Diffusion Models',
    authors: 'Your Name, et al.',
    venue: 'CVPR',
    year: 2026,
    abstract: '提出了一种新的高效视频扩散模型架构，在保持生成质量的同时显著降低计算成本。',
    abstract_en: 'A novel efficient video diffusion architecture that significantly reduces computational cost while maintaining generation quality.',
    tags: ['Video Generation', 'Diffusion Model', 'Efficiency'],
    paper_url: 'https://arxiv.org',
    code_url: 'https://github.com',
  },
  {
    title: '多模态时序理解的统一框架',
    title_en: 'A Unified Framework for Multimodal Temporal Understanding',
    authors: 'Your Name, et al.',
    venue: 'NeurIPS',
    year: 2025,
    abstract: '设计了统一的多模态时序理解框架，融合视觉、语言和音频信号进行时序推理。',
    abstract_en: 'A unified multimodal temporal understanding framework integrating visual, language, and audio signals for temporal reasoning.',
    tags: ['Multimodal', 'Temporal', 'Understanding'],
    paper_url: 'https://arxiv.org',
  },
];
