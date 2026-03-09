export function wechatHtml(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "<p>[视频请点击链接观看]</p>");
}

export function xiaohongshuText(title: string, body: string, tags: string[]): string {
  return `${title}\n\n${body}\n\n#${(tags || []).join(" #")}`;
}

export function douyinCaption(title: string, tags: string[]): string {
  return `${title}\n\n${(tags || []).map((t) => `#${t}`).join(" ")}`;
}
