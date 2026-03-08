export interface Skill {
  name: string;
  name_en: string;
  level: number;  // 0-100
}

export interface SkillCategory {
  key: string;
  skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
  {
    key: 'ai',
    skills: [
      { name: 'PyTorch / JAX', name_en: 'PyTorch / JAX', level: 90 },
      { name: '视频生成模型', name_en: 'Video Generation', level: 85 },
      { name: '图像生成 (Diffusion)', name_en: 'Image Generation (Diffusion)', level: 85 },
      { name: '多模态学习', name_en: 'Multimodal Learning', level: 80 },
      { name: 'Transformer / Attention', name_en: 'Transformer / Attention', level: 90 },
      { name: 'LLM / Agent', name_en: 'LLM / Agent', level: 85 },
    ],
  },
  {
    key: 'dev',
    skills: [
      { name: 'TypeScript / JavaScript', name_en: 'TypeScript / JavaScript', level: 90 },
      { name: 'React / Next.js', name_en: 'React / Next.js', level: 88 },
      { name: 'Python', name_en: 'Python', level: 92 },
      { name: 'Node.js', name_en: 'Node.js', level: 85 },
      { name: '微信小程序', name_en: 'WeChat Mini Program', level: 80 },
      { name: 'Docker / CI/CD', name_en: 'Docker / CI/CD', level: 78 },
    ],
  },
  {
    key: 'creative',
    skills: [
      { name: '视频剪辑 (Premiere / DaVinci)', name_en: 'Video Editing (Premiere / DaVinci)', level: 85 },
      { name: 'AI 短片制作', name_en: 'AI Short Film Production', level: 88 },
      { name: '编导策划', name_en: 'Directing & Planning', level: 82 },
      { name: '驾驶拍摄', name_en: 'Cinematic Driving Footage', level: 80 },
      { name: '产品设计', name_en: 'Product Design', level: 78 },
    ],
  },
];
