#!/usr/bin/env node
const slug = process.argv.find((a) => !a.startsWith("--"));
if (!slug) {
  console.error("Usage: npm run content:wechat -- <slug>");
  process.exit(1);
}
console.log("WeChat API publish: configure WECHAT_APP_ID and WECHAT_APP_SECRET, then call WeChat API to create draft.");
console.log("Slug:", slug);
console.log("Export to dist/wechat first, then use WeChat API to upload as draft.");
