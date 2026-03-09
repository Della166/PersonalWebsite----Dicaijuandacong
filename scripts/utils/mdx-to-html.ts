const ACCENT = '#8B9A6D';
const TEXT = '#3D4A2D';
const CARD_BG = '#E8EDDF';
const MUTED = '#6B7D4A';
const LINK = '#5B7A3D';

export function mdxToPlainHtml(mdxContent: string): string {
  let html = stripMdxComponents(mdxContent);

  html = html.replace(/(?:^>\s?(.*)$\n?)+/gm, (match) => {
    const inner = match.replace(/^>\s?/gm, '').trim();
    return `<blockquote style="margin:20px 0;padding:16px 20px;border-left:3px solid ${ACCENT};background:${CARD_BG};border-radius:0 8px 8px 0;color:${TEXT};font-size:15px;line-height:2;">${inner}</blockquote>`;
  });

  html = html.replace(/^#### (.*$)/gm,
    `<h4 style="font-size:15px;font-weight:600;color:${TEXT};margin:28px 0 12px;line-height:1.6;">$1</h4>`);
  html = html.replace(/^### (.*$)/gm,
    `<h3 style="font-size:16px;font-weight:700;color:${TEXT};margin:32px 0 14px;padding-left:12px;border-left:3px solid ${ACCENT};line-height:1.6;">$1</h3>`);
  html = html.replace(/^## (.*$)/gm,
    `<h2 style="font-size:18px;font-weight:700;color:${TEXT};margin:36px 0 16px;padding-bottom:8px;border-bottom:1px solid ${CARD_BG};line-height:1.6;">$1</h2>`);
  html = html.replace(/^# (.*$)/gm,
    `<h1 style="font-size:20px;font-weight:700;color:${TEXT};margin:40px 0 18px;text-align:center;line-height:1.6;">$1</h1>`);

  html = html.replace(/^[-*_]{3,}$/gm,
    `<hr style="border:none;height:1px;background:linear-gradient(to right,transparent,${CARD_BG},${ACCENT},${CARD_BG},transparent);margin:32px 0;" />`);

  html = html.replace(/```[\w]*\n([\s\S]*?)```/g,
    `<pre style="background:${CARD_BG};padding:16px 20px;border-radius:8px;overflow-x:auto;margin:20px 0;font-size:13px;line-height:1.8;font-family:Menlo,Monaco,Consolas,monospace;color:${TEXT};">$1</pre>`);

  html = html.replace(/\*\*\*(.*?)\*\*\*/g,
    `<strong><em style="color:${ACCENT};">$1</em></strong>`);
  html = html.replace(/\*\*(.*?)\*\*/g,
    `<strong style="font-weight:700;color:${TEXT};">$1</strong>`);
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g,
    `<em style="color:${MUTED};">$1</em>`);

  html = html.replace(/==(.*?)==/g,
    `<span style="background:${CARD_BG};padding:2px 6px;border-radius:4px;color:${TEXT};font-weight:600;">$1</span>`);

  html = html.replace(/`(.*?)`/g,
    `<code style="background:${CARD_BG};padding:2px 8px;border-radius:4px;font-size:13px;font-family:Menlo,Monaco,Consolas,monospace;color:${ACCENT};">$1</code>`);

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    `<figure style="margin:24px 0;text-align:center;"><img src="$2" alt="$1" style="max-width:100%;border-radius:8px;box-shadow:0 2px 12px rgba(61,74,45,0.08);" /><figcaption style="font-size:13px;color:${MUTED};margin-top:8px;">$1</figcaption></figure>`);

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
    `<a style="color:${LINK};text-decoration:none;border-bottom:1px solid ${CARD_BG};font-weight:500;">$1</a>`);

  html = html.replace(/^(\d+)\.\s+(.*$)/gm,
    `<p style="margin:6px 0;padding-left:24px;line-height:2;font-size:15px;color:${TEXT};"><span style="color:${ACCENT};font-weight:600;margin-right:4px;">$1.</span> $2</p>`);

  html = html.replace(/^[-*+]\s+(.*$)/gm,
    `<p style="margin:6px 0;padding-left:24px;line-height:2;font-size:15px;color:${TEXT};"><span style="color:${ACCENT};margin-right:6px;">●</span>$1</p>`);

  const lines = html.split('\n');
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('<')) {
      result.push(trimmed);
    } else {
      result.push(`<p style="margin:0 0 20px;line-height:2;font-size:15px;color:${TEXT};letter-spacing:0.5px;">${trimmed}</p>`);
    }
  }

  return result.join('\n');
}

function stripMdxComponents(content: string): string {
  return content
    .replace(/<YouTube[^/]*\/>/g, '[视频链接]')
    .replace(/<Bilibili[^/]*\/>/g, '[视频链接]')
    .replace(/<VideoPlayer[^/]*\/>/g, '[视频链接]')
    .replace(/<ImageGallery[\s\S]*?\/>/g, '[图片画廊]')
    .replace(/<GifPlayer[^/]*\/>/g, '[GIF动图]')
    .replace(/<Callout[^>]*>([\s\S]*?)<\/Callout>/g, '💡 $1')
    .replace(/<[^>]+>/g, '');
}
