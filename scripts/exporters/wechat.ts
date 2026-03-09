import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { mdxToPlainHtml } from "../utils/mdx-to-html";

const ACCENT = '#8B9A6D';
const TEXT = '#3D4A2D';
const BG = '#FAFBF7';
const CARD_BG = '#E8EDDF';
const MUTED = '#6B7D4A';

const CONTENT_DIR = path.join(process.cwd(), "content");
const OUT_DIR = path.join(process.cwd(), "dist", "wechat");

export function exportWechat(slug: string): string {
  const filePath = path.join(CONTENT_DIR, "blog", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) throw new Error(`Not found: ${filePath}`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const title = (data.title as string) || slug;
  const titleEn = (data.title_en as string) || '';
  const author = (data.author as string) || 'Dicaijuandacong';
  const date = data.date
    ? new Date(data.date as string).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const tags = ((data.tags as string[]) || []).map((t) => `#${t}`).join('  ');
  const excerpt = (data.excerpt as string) || '';

  const htmlBody = mdxToPlainHtml(content);

  const fullHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:${BG};">
<section style="max-width:578px;margin:0 auto;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;">

  <div style="height:3px;background:linear-gradient(to right,${ACCENT},${CARD_BG});margin-bottom:0;"></div>

  <section style="padding:36px 24px 24px;text-align:center;">
    <h1 style="font-size:22px;font-weight:700;color:${TEXT};margin:0 0 6px;line-height:1.5;letter-spacing:1px;">${title}</h1>
    ${titleEn ? `<p style="font-size:13px;color:${MUTED};margin:0 0 16px;font-style:italic;letter-spacing:0.5px;">${titleEn}</p>` : ''}
    <p style="font-size:13px;color:${MUTED};margin:16px 0 0;line-height:1.6;">
      <span style="color:${ACCENT};font-weight:600;">${author}</span>
      ${date ? `<span style="margin:0 8px;color:${CARD_BG};">|</span><span>${date}</span>` : ''}
    </p>
  </section>

  <div style="margin:0 24px;height:1px;background:linear-gradient(to right,transparent,${CARD_BG},${ACCENT},${CARD_BG},transparent);"></div>

  ${excerpt ? `
  <section style="margin:24px 24px 0;padding:16px 20px;background:${CARD_BG};border-radius:8px;border-left:3px solid ${ACCENT};">
    <p style="font-size:14px;color:${MUTED};margin:0;line-height:2;font-style:italic;">${excerpt}</p>
  </section>` : ''}

  <section style="padding:24px 24px 16px;line-height:2;">
    ${htmlBody}
  </section>

  ${tags ? `
  <section style="padding:0 24px 20px;">
    <p style="font-size:13px;color:${MUTED};letter-spacing:1px;">${tags}</p>
  </section>` : ''}

  <div style="margin:0 24px;height:1px;background:linear-gradient(to right,transparent,${CARD_BG},${ACCENT},${CARD_BG},transparent);"></div>

  <section style="padding:24px;text-align:center;">
    <p style="font-size:13px;color:${MUTED};margin:0 0 12px;line-height:1.8;letter-spacing:0.5px;">— END —</p>
    <div style="margin:16px auto;padding:16px 20px;background:${CARD_BG};border-radius:8px;max-width:360px;">
      <p style="font-size:13px;color:${TEXT};margin:0 0 4px;font-weight:600;">🌿 Dicaijuandacong</p>
      <p style="font-size:12px;color:${MUTED};margin:0;line-height:1.8;">AI Engineer · 全栈开发 · 影像创作者</p>
      <p style="font-size:12px;color:${MUTED};margin:4px 0 0;line-height:1.8;">关注获取更多 AI 技术分享与创作灵感 ✨</p>
    </div>
  </section>

</section>
</body>
</html>`;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${slug}.html`);
  fs.writeFileSync(outPath, fullHtml, 'utf-8');

  const richTextPath = path.join(OUT_DIR, `${slug}_richtext.html`);
  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  fs.writeFileSync(richTextPath, bodyMatch ? bodyMatch[1].trim() : fullHtml, 'utf-8');

  console.log(`  ✅ WeChat HTML:     ${outPath}`);
  console.log(`  ✅ WeChat RichText: ${richTextPath}`);
  console.log(`  💡 用法: 浏览器打开 HTML → 全选复制 → 粘贴到公众号编辑器`);
  return outPath;
}
