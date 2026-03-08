import * as fs from 'fs';
import * as path from 'path';
import { loadMdxFile, ensureDir } from '../utils/platform-formatter';

export function exportToDouyin(mdxPath: string, outputDir: string) {
  const { data } = loadMdxFile(mdxPath);

  const title = data.title || 'Untitled';
  const tags = (data.tags || []).map((t: string) => `#${t}`).join(' ');
  const excerpt = data.excerpt || '';

  const output = `🎬 ${title}

${excerpt}

${tags} #AI #科技 #创作者

---
📝 Video description ready for Douyin
📅 ${data.date || ''}
`;

  ensureDir(outputDir);
  const outputPath = path.join(outputDir, `${path.basename(mdxPath, '.mdx')}.txt`);
  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`  ✅ Douyin: ${outputPath}`);
}
