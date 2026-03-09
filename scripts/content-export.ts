#!/usr/bin/env node
import path from "path";
import { exportWechat } from "./exporters/wechat";
import { exportXiaohongshu } from "./exporters/xiaohongshu";
import { exportDouyin } from "./exporters/douyin";

const slug = process.argv.find((a) => !a.startsWith("--"));
const platform = process.argv.includes("--platform")
  ? process.argv[process.argv.indexOf("--platform") + 1]
  : "all";

if (!slug) {
  console.error("Usage: npm run content:export -- <slug> [--platform wechat|xiaohongshu|douyin|all]");
  process.exit(1);
}

const run = async () => {
  const platforms = platform === "all" ? ["wechat", "xiaohongshu", "douyin"] : [platform];
  for (const p of platforms) {
    try {
      if (p === "wechat") console.log("WeChat:", exportWechat(slug));
      else if (p === "xiaohongshu") console.log("小红书:", exportXiaohongshu(slug));
      else if (p === "douyin") console.log("抖音:", exportDouyin(slug));
    } catch (e) {
      console.error(p, e);
    }
  }
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
