import * as fs from 'fs';
import * as path from 'path';
import { loadMdxFile, mdToPlainText, ensureDir } from '../utils/platform-formatter';

export function exportToXiaohongshu(mdxPath: string, outputDir: string) {
  const { data, content } = loadMdxFile(mdxPath);

  const title = data.title || 'Untitled';
  const tags = (data.tags || []).map((t: string) => `#${t}`).join(' ');

  const plainText = mdToPlainText(content);
  const truncated = plainText.length > 800 ? plainText.slice(0, 800) + '...' : plainText;

  const output = `📌 ${title}

${truncated}

${tags}

---
💡 Cover image suggestion: ${data.cover || 'Create a visual cover for this post'}
📅 ${data.date || ''}
`;

  ensureDir(outputDir);
  const outputPath = path.join(outputDir, `${path.basename(mdxPath, '.mdx')}.txt`);
  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`  ✅ Xiaohongshu: ${outputPath}`);
}
