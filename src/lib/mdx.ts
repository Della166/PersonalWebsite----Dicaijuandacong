import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { ContentFrontmatter } from "@/types/content";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type ContentWithMeta = {
  slug: string;
  frontmatter: ContentFrontmatter & { date: string };
  content: string;
  readingTime: number;
};

function listMdxFiles(dir: string, base = ""): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) {
      files.push(...listMdxFiles(path.join(dir, e.name), rel));
    } else if (e.name.endsWith(".mdx") || e.name.endsWith(".md")) {
      files.push(rel);
    }
  }
  return files;
}

export function getContentDir(category: string): string {
  return path.join(CONTENT_DIR, category);
}

export function getAllSlugs(category: string): string[] {
  const dir = getContentDir(category);
  return listMdxFiles(dir).map((f) => f.replace(/\.(mdx|md)$/, ""));
}

export function getMdxBySlug(category: string, slug: string): ContentWithMeta | null {
  const dir = getContentDir(category);
  for (const ext of [".mdx", ".md"]) {
    const filePath = path.join(dir, `${slug}${ext}`);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      const stats = readingTime(content);
      return {
        slug,
        frontmatter: { ...data, date: data.date ? String(data.date) : "" } as ContentWithMeta["frontmatter"],
        content,
        readingTime: Math.ceil(stats.minutes),
      };
    }
  }
  return null;
}

export function getBlogSlugs(): string[] {
  return getAllSlugs("blog");
}

export function getAllMdx(category: string): ContentWithMeta[] {
  const slugs = getAllSlugs(category);
  const items = slugs
    .map((slug) => getMdxBySlug(category, slug))
    .filter((x): x is ContentWithMeta => x != null);
  items.sort((a, b) => {
    const d1 = new Date(a.frontmatter.date).getTime();
    const d2 = new Date(b.frontmatter.date).getTime();
    return d2 - d1;
  });
  return items;
}
