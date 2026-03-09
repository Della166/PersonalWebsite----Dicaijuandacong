import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { xiaohongshuText } from "../utils/platform-formatter";

const CONTENT_DIR = path.join(process.cwd(), "content");
const OUT_DIR = path.join(process.cwd(), "dist", "xiaohongshu");

export function exportXiaohongshu(slug: string): string {
  const filePath = path.join(CONTENT_DIR, "blog", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) throw new Error(`Not found: ${filePath}`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const title = (data.title as string) || slug;
  const tags = (data.tags as string[]) || [];
  const body = content.replace(/#+\s+/gm, "").trim().slice(0, 1000);
  const outPath = path.join(OUT_DIR, `${slug}.txt`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(outPath, xiaohongshuText(title, body, tags));
  return outPath;
}
