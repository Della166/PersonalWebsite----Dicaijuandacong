import * as fs from 'fs';
import matter from 'gray-matter';

export function loadMdxFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return matter(content);
}

export function stripMdxComponents(content: string): string {
  return content
    .replace(/<YouTube[^/]*\/>/g, '[视频链接]')
    .replace(/<Bilibili[^/]*\/>/g, '[视频链接]')
    .replace(/<VideoPlayer[^/]*\/>/g, '[视频链接]')
    .replace(/<ImageGallery[\s\S]*?\/>/g, '[图片画廊]')
    .replace(/<GifPlayer[^/]*\/>/g, '[GIF动图]')
    .replace(/<Callout[^>]*>([\s\S]*?)<\/Callout>/g, '💡 $1')
    .replace(/<[^>]+>/g, '');
}

export function mdToPlainText(content: string): string {
  return stripMdxComponents(content)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

interface WechatHtmlOptions {
  accentColor: string;
  textColor: string;
  bgColor: string;
  cardBg: string;
  mutedColor: string;
  linkColor: string;
}

const defaultWechatStyle: WechatHtmlOptions = {
  accentColor: '#8B9A6D',
  textColor: '#3D4A2D',
  bgColor: '#FAFBF7',
  cardBg: '#E8EDDF',
  mutedColor: '#6B7D4A',
  linkColor: '#5B7A3D',
};

export function mdToWechatHtml(content: string, opts: Partial<WechatHtmlOptions> = {}): string {
  const s = { ...defaultWechatStyle, ...opts };
  let html = stripMdxComponents(content);

  // blockquote (before headings, must process multiline > blocks)
  html = html.replace(/(?:^>\s?(.*)$\n?)+/gm, (match) => {
    const inner = match.replace(/^>\s?/gm, '').trim();
    return `<blockquote style="margin:20px 0;padding:16px 20px;border-left:3px solid ${s.accentColor};background:${s.cardBg};border-radius:0 8px 8px 0;color:${s.textColor};font-size:15px;line-height:2;">${inner}</blockquote>`;
  });

  // headings
  html = html.replace(/^#### (.*$)/gm,
    `<h4 style="font-size:15px;font-weight:600;color:${s.textColor};margin:28px 0 12px;line-height:1.6;">$1</h4>`);
  html = html.replace(/^### (.*$)/gm,
    `<h3 style="font-size:16px;font-weight:700;color:${s.textColor};margin:32px 0 14px;padding-left:12px;border-left:3px solid ${s.accentColor};line-height:1.6;">$1</h3>`);
  html = html.replace(/^## (.*$)/gm,
    `<h2 style="font-size:18px;font-weight:700;color:${s.textColor};margin:36px 0 16px;padding-bottom:8px;border-bottom:1px solid ${s.cardBg};line-height:1.6;">$1</h2>`);
  html = html.replace(/^# (.*$)/gm,
    `<h1 style="font-size:20px;font-weight:700;color:${s.textColor};margin:40px 0 18px;text-align:center;line-height:1.6;">$1</h1>`);

  // horizontal rules
  html = html.replace(/^[-*_]{3,}$/gm,
    `<hr style="border:none;height:1px;background:linear-gradient(to right,transparent,${s.cardBg},${s.accentColor},${s.cardBg},transparent);margin:32px 0;" />`);

  // bold + italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g,
    `<strong style="font-weight:700;"><em style="color:${s.accentColor};">$1</em></strong>`);
  html = html.replace(/\*\*(.*?)\*\*/g,
    `<strong style="font-weight:700;color:${s.textColor};">$1</strong>`);
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g,
    `<em style="color:${s.mutedColor};">$1</em>`);

  // highlight ==text==
  html = html.replace(/==(.*?)==/g,
    `<span style="background:${s.cardBg};padding:2px 6px;border-radius:4px;color:${s.textColor};font-weight:600;">$1</span>`);

  // inline code
  html = html.replace(/`(.*?)`/g,
    `<code style="background:${s.cardBg};padding:2px 8px;border-radius:4px;font-size:13px;font-family:Menlo,Monaco,Consolas,monospace;color:${s.accentColor};">$1</code>`);

  // code blocks
  html = html.replace(/```[\w]*\n([\s\S]*?)```/g,
    `<pre style="background:${s.cardBg};padding:16px 20px;border-radius:8px;overflow-x:auto;margin:20px 0;font-size:13px;line-height:1.8;font-family:Menlo,Monaco,Consolas,monospace;color:${s.textColor};">$1</pre>`);

  // images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    `<figure style="margin:24px 0;text-align:center;"><img src="$2" alt="$1" style="max-width:100%;border-radius:8px;box-shadow:0 2px 12px rgba(61,74,45,0.08);" /><figcaption style="font-size:13px;color:${s.mutedColor};margin-top:8px;line-height:1.6;">$1</figcaption></figure>`);

  // links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
    `<a style="color:${s.linkColor};text-decoration:none;border-bottom:1px solid ${s.cardBg};font-weight:500;">$1</a>`);

  // ordered lists
  html = html.replace(/^(\d+)\.\s+(.*$)/gm,
    `<p style="margin:6px 0;padding-left:24px;line-height:2;font-size:15px;color:${s.textColor};"><span style="color:${s.accentColor};font-weight:600;margin-right:4px;">$1.</span> $2</p>`);

  // unordered lists
  html = html.replace(/^[-*+]\s+(.*$)/gm,
    `<p style="margin:6px 0;padding-left:24px;line-height:2;font-size:15px;color:${s.textColor};"><span style="color:${s.accentColor};margin-right:6px;">●</span>$1</p>`);

  // paragraphs
  const lines = html.split('\n');
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    } else if (trimmed.startsWith('<')) {
      result.push(trimmed);
    } else {
      result.push(`<p style="margin:0 0 20px;line-height:2;font-size:15px;color:${s.textColor};letter-spacing:0.5px;">${trimmed}</p>`);
    }
  }

  return result.join('\n');
}

export function mdToSimpleHtml(content: string): string {
  return mdToWechatHtml(content);
}

export function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}
