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

export function mdToSimpleHtml(content: string): string {
  let html = stripMdxComponents(content);

  html = html.replace(/^### (.*$)/gm, '<h3 style="font-size:18px;font-weight:bold;margin:16px 0 8px;">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 style="font-size:20px;font-weight:bold;margin:20px 0 10px;">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 style="font-size:24px;font-weight:bold;margin:24px 0 12px;">$1</h1>');

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.*?)`/g, '<code style="background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:14px;">$1</code>');

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:12px 0;" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#576b95;">$1</a>');

  html = html.replace(/^[-*+]\s+(.*$)/gm, '<li style="margin:4px 0;">$1</li>');

  const lines = html.split('\n');
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      result.push('<br/>');
    } else if (!trimmed.startsWith('<')) {
      result.push(`<p style="margin:8px 0;line-height:1.8;font-size:16px;">${trimmed}</p>`);
    } else {
      result.push(trimmed);
    }
  }

  return result.join('\n');
}

export function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}
