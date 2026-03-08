import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';
import { uploadMultiple } from './utils/r2-client';

config({ path: '.env.local' });

const MEDIA_DIR = path.join(process.cwd(), '_media');
const CONTENT_DIR = path.join(process.cwd(), 'src/content');

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm', '.pdf'];

function getMediaFiles(): string[] {
  if (!fs.existsSync(MEDIA_DIR)) {
    console.log('📁 _media/ directory not found. Nothing to upload.');
    return [];
  }

  return fs.readdirSync(MEDIA_DIR)
    .filter((f) => SUPPORTED_EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .map((f) => path.join(MEDIA_DIR, f));
}

function replacePathsInMdx(urlMap: Map<string, string>): number {
  let updatedFiles = 0;

  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
        let content = fs.readFileSync(fullPath, 'utf-8');
        let changed = false;

        for (const [localPath, cdnUrl] of urlMap) {
          const filename = path.basename(localPath);
          const patterns = [
            `/_media/${filename}`,
            `_media/${filename}`,
            `./_media/${filename}`,
          ];
          for (const pattern of patterns) {
            if (content.includes(pattern)) {
              content = content.split(pattern).join(cdnUrl);
              changed = true;
            }
          }
        }

        if (changed) {
          fs.writeFileSync(fullPath, content, 'utf-8');
          updatedFiles++;
          console.log(`  📝 Updated: ${path.relative(process.cwd(), fullPath)}`);
        }
      }
    }
  }

  walkDir(CONTENT_DIR);
  return updatedFiles;
}

function cleanMedia() {
  if (!fs.existsSync(MEDIA_DIR)) return;
  const files = fs.readdirSync(MEDIA_DIR).filter((f) => f !== '.gitkeep');
  for (const f of files) {
    fs.unlinkSync(path.join(MEDIA_DIR, f));
  }
  console.log(`🧹 Cleaned ${files.length} files from _media/`);
}

async function main() {
  const args = process.argv.slice(2);
  const shouldClean = args.includes('--clean');

  console.log('🚀 Media Upload Pipeline\n');

  const files = getMediaFiles();
  if (files.length === 0) {
    console.log('No files to upload.');
    return;
  }

  console.log(`📦 Found ${files.length} files to upload:\n`);

  const urlMap = await uploadMultiple(files);

  console.log(`\n📝 Replacing local paths in MDX files...\n`);
  const updatedCount = replacePathsInMdx(urlMap);

  console.log(`\n✨ Done! ${urlMap.size} files uploaded, ${updatedCount} MDX files updated.`);

  if (shouldClean) {
    cleanMedia();
  }
}

main().catch(console.error);
