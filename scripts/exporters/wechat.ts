import * as fs from 'fs';
import * as path from 'path';
import { loadMdxFile, mdToWechatHtml, ensureDir } from '../utils/platform-formatter';

const ACCENT = '#8B9A6D';
const TEXT = '#3D4A2D';
const BG = '#FAFBF7';
const CARD_BG = '#E8EDDF';
const MUTED = '#6B7D4A';

export function exportToWechat(mdxPath: string, outputDir: string) {
  const { data, content } = loadMdxFile(mdxPath);

  const title = data.title || 'Untitled';
  const titleEn = data.titleEn || '';
  const author = data.author || 'Dicaijuandacong';
  const date = data.date ? new Date(data.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const tags = (data.tags || []).map((t: string) => `#${t}`).join('  ');

  const htmlBody = mdToWechatHtml(content, {
    accentColor: ACCENT,
    textColor: TEXT,
    bgColor: BG,
    cardBg: CARD_BG,
    mutedColor: MUTED,
  });

  const fullHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:${BG};">

<!-- 外层容器 -->
<section style="max-width:578px;margin:0 auto;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;">

  <!-- 顶部装饰线 -->
  <div style="height:3px;background:linear-gradient(to right,${ACCENT},${CARD_BG});margin-bottom:0;"></div>

  <!-- 头部区域 -->
  <section style="padding:36px 24px 24px;text-align:center;">
    <!-- 主标题 -->
    <h1 style="font-size:22px;font-weight:700;color:${TEXT};margin:0 0 6px;line-height:1.5;letter-spacing:1px;">${title}</h1>
    ${titleEn ? `<p style="font-size:13px;color:${MUTED};margin:0 0 16px;font-style:italic;letter-spacing:0.5px;">${titleEn}</p>` : ''}

    <!-- 作者信息行 -->
    <p style="font-size:13px;color:${MUTED};margin:16px 0 0;line-height:1.6;">
      <span style="color:${ACCENT};font-weight:600;">${author}</span>
      ${date ? `<span style="margin:0 8px;color:${CARD_BG};">|</span><span>${date}</span>` : ''}
    </p>
  </section>

  <!-- 分隔线 -->
  <div style="margin:0 24px;height:1px;background:linear-gradient(to right,transparent,${CARD_BG},${ACCENT},${CARD_BG},transparent);"></div>

  ${data.excerpt ? `
  <!-- 导语/摘要 -->
  <section style="margin:24px 24px 0;padding:16px 20px;background:${CARD_BG};border-radius:8px;border-left:3px solid ${ACCENT};">
    <p style="font-size:14px;color:${MUTED};margin:0;line-height:2;font-style:italic;">${data.excerpt}</p>
  </section>
  ` : ''}

  <!-- 正文 -->
  <section style="padding:24px 24px 16px;line-height:2;">
    ${htmlBody}
  </section>

  ${tags ? `
  <!-- 标签 -->
  <section style="padding:0 24px 20px;">
    <p style="font-size:13px;color:${MUTED};letter-spacing:1px;">${tags}</p>
  </section>
  ` : ''}

  <!-- 底部分隔 -->
  <div style="margin:0 24px;height:1px;background:linear-gradient(to right,transparent,${CARD_BG},${ACCENT},${CARD_BG},transparent);"></div>

  <!-- 尾部 -->
  <section style="padding:24px;text-align:center;">
    <p style="font-size:13px;color:${MUTED};margin:0 0 12px;line-height:1.8;letter-spacing:0.5px;">— END —</p>

    <!-- 公众号引导 -->
    <div style="margin:16px auto;padding:16px 20px;background:${CARD_BG};border-radius:8px;max-width:360px;">
      <p style="font-size:13px;color:${TEXT};margin:0 0 4px;font-weight:600;">🌿 Dicaijuandacong</p>
      <p style="font-size:12px;color:${MUTED};margin:0;line-height:1.8;">AI Engineer · 全栈开发 · 影像创作者</p>
      <p style="font-size:12px;color:${MUTED};margin:4px 0 0;line-height:1.8;">关注获取更多 AI 技术分享与创作灵感 ✨</p>
    </div>
  </section>

</section>
</body>
</html>`;

  ensureDir(outputDir);

  const htmlPath = path.join(outputDir, `${path.basename(mdxPath, '.mdx')}.html`);
  fs.writeFileSync(htmlPath, fullHtml, 'utf-8');

  const richTextPath = path.join(outputDir, `${path.basename(mdxPath, '.mdx')}_richtext.html`);
  const richTextOnly = extractRichText(fullHtml);
  fs.writeFileSync(richTextPath, richTextOnly, 'utf-8');

  console.log(`  ✅ WeChat HTML:     ${htmlPath}`);
  console.log(`  ✅ WeChat RichText: ${richTextPath}`);
  console.log(`  💡 用法: 打开 HTML 文件 → 全选复制 → 粘贴到公众号编辑器`);
}

function extractRichText(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return bodyMatch ? bodyMatch[1].trim() : html;
}
