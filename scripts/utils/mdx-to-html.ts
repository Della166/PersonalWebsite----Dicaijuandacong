export function mdxToPlainHtml(mdxContent: string): string {
  let html = mdxContent.replace(/^#+\s+(.*)$/gm, "<h2>$1</h2>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>");
  if (!html.startsWith("<")) html = "<p>" + html;
  if (!html.endsWith(">")) html = html + "</p>";
  return html;
}
