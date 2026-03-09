#!/usr/bin/env node
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { uploadToR2, existsInR2, getPublicUrl, hasR2Config } from "./utils/r2-client";

const MEDIA_DIR = path.join(process.cwd(), "_media");
const CONTENT_DIR = path.join(process.cwd(), "content");

function hashFile(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

function listMediaFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...listMediaFiles(full));
    else if (!e.name.startsWith(".")) files.push(path.relative(dir, full));
  }
  return files;
}

function listMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...listMdxFiles(full));
    else if (e.name.endsWith(".mdx") || e.name.endsWith(".md")) files.push(full);
  }
  return files;
}

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

async function main() {
  loadEnv();
  const clean = process.argv.includes("--clean");

  if (!hasR2Config()) {
    console.error("Missing R2 env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL");
    process.exit(1);
  }

  const mediaFiles = listMediaFiles(MEDIA_DIR);
  if (mediaFiles.length === 0) {
    console.log("No files in _media/");
    return;
  }

  const replacements: { local: string; url: string }[] = [];
  let uploaded = 0;

  for (const rel of mediaFiles) {
    const full = path.join(MEDIA_DIR, rel);
    const stat = fs.statSync(full);
    if (!stat.isFile()) continue;
    const hash = hashFile(full);
    const ext = path.extname(rel);
    const key = `media/${hash}/${path.basename(rel)}`;
    const already = await existsInR2(key);
    if (!already) {
      const body = fs.readFileSync(full);
      const contentType = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".png" ? "image/png" : ext === ".gif" ? "image/gif" : undefined;
      await uploadToR2(key, body, contentType);
      uploaded++;
    }
    const url = getPublicUrl(key);
    replacements.push({ local: `/_media/${rel.replace(/\\/g, "/")}`, url });
  }

  const mdxFiles = listMdxFiles(CONTENT_DIR);
  let updatedMdx = 0;
  for (const file of mdxFiles) {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;
    for (const { local, url } of replacements) {
      if (content.includes(local)) {
        content = content.split(local).join(url);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(file, content);
      updatedMdx++;
    }
  }

  console.log(`✅ ${uploaded} files uploaded, ${updatedMdx} MDX files updated.`);

  if (clean && mediaFiles.length > 0) {
    for (const rel of mediaFiles) {
      fs.unlinkSync(path.join(MEDIA_DIR, rel));
    }
    console.log("Cleaned _media/.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
