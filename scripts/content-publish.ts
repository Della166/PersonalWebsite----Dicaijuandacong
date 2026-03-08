import { execSync } from 'child_process';

const args = process.argv.slice(2);
const slug = args[0];

function run(cmd: string, label: string) {
  console.log(`\n⏳ ${label}...`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${label} done`);
  } catch {
    console.error(`❌ ${label} failed`);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Content Publish Pipeline\n');

  // Step 1: Upload media
  run('npx tsx scripts/media-upload.ts --clean', 'Upload media to R2');

  // Step 2: Git commit and push
  run('git add -A', 'Git add');
  const message = slug ? `content: publish ${slug}` : 'content: publish new content';
  run(`git commit -m "${message}" --allow-empty`, 'Git commit');
  run('git push', 'Git push (triggers Vercel deploy)');

  // Step 3: Export to platforms
  if (slug) {
    run(`npx tsx scripts/content-export.ts ${slug} --platform all`, 'Export to all platforms');
  }

  console.log('\n🎉 All done! Your content is live.');
}

main();
