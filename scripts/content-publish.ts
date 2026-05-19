import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

const args = process.argv.slice(2);
const slug = args[0];

const CONTENT_DIR = path.join(process.cwd(), 'src/content');
const CATEGORIES = ['blog', 'projects', 'papers', 'creative', 'thoughts'];

function run(cmd: string, label: string, fatal = true): boolean {
  console.log(`\n⏳ ${label}...`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${label} done`);
    return true;
  } catch {
    if (fatal) {
      console.error(`❌ ${label} failed`);
      process.exit(1);
    }
    console.warn(`⚠️  ${label} failed (skipped, not fatal)`);
    return false;
  }
}

/** Read the mdx frontmatter for a slug, or null if not found. */
function readFrontmatter(s: string): Record<string, unknown> | null {
  for (const cat of CATEGORIES) {
    for (const ext of ['.mdx', '.md']) {
      const filePath = path.join(CONTENT_DIR, cat, `${s}${ext}`);
      if (fs.existsSync(filePath)) {
        return matter(fs.readFileSync(filePath, 'utf-8')).data;
      }
    }
  }
  return null;
}

async function main() {
  console.log('🚀 Content Publish Pipeline\n');

  // Step 1: Upload media to R2.
  run('npx tsx scripts/media-upload.ts --clean', 'Upload media to R2');

  // Step 2: Git commit and push (triggers the website deploy).
  run('git add -A', 'Git add');
  const message = slug ? `content: publish ${slug}` : 'content: publish new content';
  run(`git commit -m "${message}" --allow-empty`, 'Git commit');
  run('git push', 'Git push (triggers website deploy)');

  // Step 3: Export to platforms (generates dist/ files).
  if (slug) {
    run(`npx tsx scripts/content-export.ts ${slug} --platform all`, 'Export to all platforms');

    // Step 4: Push to the WeChat draft box when the article opts in.
    const fm = readFrontmatter(slug);
    const platforms = (fm?.platforms as string[]) ?? [];
    if (platforms.includes('wechat')) {
      run(`npx tsx scripts/wechat-publish.ts ${slug}`, 'Push to WeChat draft box', false);
    } else {
      console.log('\nℹ️  platforms 未包含 wechat，跳过公众号推送。');
    }
  }

  console.log('\n🎉 All done! Your content is live.');
}

main();
