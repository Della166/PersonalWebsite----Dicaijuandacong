#!/usr/bin/env node
import fs from "fs";
import path from "path";
import readline from "readline";

const TEMPLATES_DIR = path.join(process.cwd(), "templates");
const CONTENT_DIR = path.join(process.cwd(), "content");

const categories = ["blog", "project", "paper", "creative", "thought"] as const;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function question(rl: readline.Interface, q: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(q, (ans) => resolve((ans || "").trim()));
  });
}

async function main() {
  const yes = process.argv.includes("--yes");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  let category: (typeof categories)[number] = "blog";
  let slug = "";

  if (!yes) {
    console.log("Categories: blog, project, paper, creative, thought");
    const catInput = await question(rl, "Category [blog]: ");
    if (catInput && categories.includes(catInput as (typeof categories)[number])) {
      category = catInput as (typeof categories)[number];
    }
    slug = await question(rl, "Slug (filename without .mdx): ");
  }

  if (!slug) slug = `${category}-${Date.now()}`;
  const templatePath = path.join(TEMPLATES_DIR, `${category}.mdx`);
  const outDir = path.join(CONTENT_DIR, category);
  const outPath = path.join(outDir, `${slug}.mdx`);

  if (!fs.existsSync(templatePath)) {
    console.error("Template not found:", templatePath);
    process.exit(1);
  }
  if (fs.existsSync(outPath)) {
    console.error("File already exists:", outPath);
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });
  let content = fs.readFileSync(templatePath, "utf-8");
  content = content.replace(/YYYY-MM-DD/g, today());
  fs.writeFileSync(outPath, content);
  console.log("Created:", outPath);
  rl.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
