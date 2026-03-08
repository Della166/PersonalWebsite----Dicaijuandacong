import * as fs from 'fs';
import * as path from 'path';
import { loadMdxFile, mdToSimpleHtml, ensureDir } from '../utils/platform-formatter';

export function exportToWechat(mdxPath: string, outputDir: string) {
  const { data, content } = loadMdxFile(mdxPath);

  const title = data.title || 'Untitled';
  const author = 'Your Name';

  const htmlBody = mdToSimpleHtml(content);

  const fullHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="max-width:600px;margin:0 auto;padding:20px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#333;line-height:1.8;">
  <h1 style="font-size:22px;font-weight:bold;text-align:center;margin-bottom:8px;">${title}</h1>
  <p style="text-align:center;color:#999;font-size:14px;margin-bottom:24px;">${author} · ${data.date || ''}</p>
  <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
  ${htmlBody}
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0 16px;" />
  <p style="text-align:center;color:#999;font-size:13px;">— END —</p>
</body>
</html>`;

  ensureDir(outputDir);
  const outputPath = path.join(outputDir, `${path.basename(mdxPath, '.mdx')}.html`);
  fs.writeFileSync(outputPath, fullHtml, 'utf-8');
  console.log(`  ✅ WeChat: ${outputPath}`);
}
