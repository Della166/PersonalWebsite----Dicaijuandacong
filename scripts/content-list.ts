#!/usr/bin/env node
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

function listMdx(dir: string, base = ""): { rel: string; full: string }[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: { rel: string; full: string }[] = [];
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...listMdx(full, rel));
    else if (e.name.endsWith(".mdx") || e.name.endsWith(".md")) {
      files.push({ rel: rel.replace(/\.(mdx|md)$/, ""), full });
    }
  }
  return files;
}

function main() {
  for (const category of ["blog", "projects", "papers", "creative", "thoughts"]) {
    const dir = path.join(CONTENT_DIR, category);
    const files = listMdx(dir);
    if (files.length === 0) continue;
    console.log(`\n${category}:`);
    for (const { rel, full } of files) {
      const raw = fs.readFileSync(full, "utf-8");
      const { data } = matter(raw);
      const title = (data.title as string) || rel;
      const published = data.published !== false ? "✓" : "draft";
      console.log(`  ${published} ${rel} - ${title}`);
    }
  }
  console.log("");
}

main();
