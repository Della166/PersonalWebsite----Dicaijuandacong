#!/usr/bin/env node
import { execSync } from "child_process";
import path from "path";
import { exportWechat } from "./exporters/wechat";
import { exportXiaohongshu } from "./exporters/xiaohongshu";
import { exportDouyin } from "./exporters/douyin";

const slug = process.argv.find((a) => !a.startsWith("--"));
const skipPush = process.argv.includes("--no-push");

if (!slug) {
  console.error("Usage: npm run content:publish -- <slug> [--no-push]");
  process.exit(1);
}

async function main() {
  console.log("1. Media upload (if _media has files)...");
  try {
    execSync("npm run media:upload", { stdio: "inherit", cwd: path.join(process.cwd()) });
  } catch {
    console.log("(media:upload skipped or no files)");
  }
  console.log("2. Export all platforms...");
  try {
    exportWechat(slug);
    exportXiaohongshu(slug);
    exportDouyin(slug);
    console.log("Exported to dist/wechat, dist/xiaohongshu, dist/douyin");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  if (!skipPush) {
    console.log("3. Git add, commit, push (optional - run manually if needed)");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
