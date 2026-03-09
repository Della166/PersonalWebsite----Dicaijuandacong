export interface SkillCategory {
  key: string;
  labelKey: string;
  items: string[];
  level: number;
}

export const skillCategories: SkillCategory[] = [
  { key: "ai", labelKey: "ai", items: ["PyTorch", "Transformers", "Diffusion", "RAG"], level: 90 },
  { key: "engineering", labelKey: "engineering", items: ["TypeScript", "React", "Next.js", "Python"], level: 85 },
  { key: "creative", labelKey: "creative", items: ["视频剪辑", "写作", "设计"], level: 75 },
];
