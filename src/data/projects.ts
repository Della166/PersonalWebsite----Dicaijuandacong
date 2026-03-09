export type ProjectCategory = "agent" | "webapp" | "miniapp" | "other";

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  tech: string[];
  github: string;
}

export const projects: ProjectItem[] = [
  // Add your projects here, e.g.:
  // { id: "1", name: "Agent App", description: "...", category: "agent", tech: ["Python", "LLM"], github: "https://github.com/..." },
];
