import * as fs from 'fs';
import * as path from 'path';
import { exportToWechat } from './exporters/wechat';
import { exportToXiaohongshu } from './exporters/xiaohongshu';
import { exportToDouyin } from './exporters/douyin';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');
const DIST_DIR = path.join(process.cwd(), 'dist');

function findMdxFile(slug: string): string | null {
  const categories = ['blog', 'projects', 'papers', 'creative', 'thoughts'];

  for (const cat of categories) {
    const dir = path.join(CONTENT_DIR, cat);
    if (!fs.existsSync(dir)) continue;

    for (const ext of ['.mdx', '.md']) {
      const filePath = path.join(dir, `${slug}${ext}`);
      if (fs.existsSync(filePath)) return filePath;
    }
  }

  return null;
}

function main() {
  const args = process.argv.slice(2);
  const slug = args[0];
  const platformIdx = args.indexOf('--platform');
  const platform = platformIdx >= 0 ? args[platformIdx + 1] : 'all';

  if (!slug) {
    console.error('Usage: tsx scripts/content-export.ts <slug> [--platform wechat|xiaohongshu|douyin|all]');
    process.exit(1);
  }

  const mdxPath = findMdxFile(slug);
  if (!mdxPath) {
    console.error(`❌ Content not found: ${slug}`);
    process.exit(1);
  }

  console.log(`📤 Exporting: ${slug}\n`);

  const exporters: Record<string, (p: string, o: string) => void> = {
    wechat: (p, o) => exportToWechat(p, path.join(o, 'wechat')),
    xiaohongshu: (p, o) => exportToXiaohongshu(p, path.join(o, 'xiaohongshu')),
    douyin: (p, o) => exportToDouyin(p, path.join(o, 'douyin')),
  };

  if (platform === 'all') {
    for (const [name, fn] of Object.entries(exporters)) {
      fn(mdxPath, DIST_DIR);
    }
  } else if (exporters[platform]) {
    exporters[platform](mdxPath, DIST_DIR);
  } else {
    console.error(`❌ Unknown platform: ${platform}`);
    process.exit(1);
  }

  console.log(`\n✨ Export complete! Check dist/ directory.`);
}

main();
