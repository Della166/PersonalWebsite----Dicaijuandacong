import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { wechatHtml } from "../utils/platform-formatter";
import { mdxToPlainHtml } from "../utils/mdx-to-html";

const CONTENT_DIR = path.join(process.cwd(), "content");
const OUT_DIR = path.join(process.cwd(), "dist", "wechat");

export function exportWechat(slug: string): string {
  const filePath = path.join(CONTENT_DIR, "blog", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) throw new Error(`Not found: ${filePath}`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const html = wechatHtml(mdxToPlainHtml(content));
  const outPath = path.join(OUT_DIR, `${slug}.html`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(outPath, `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${(data.title as string) || slug}</title></head><body>${html}</body></html>`);
  return outPath;
}
