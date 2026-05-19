/**
 * Push an article into the WeChat Official Account draft box (草稿箱).
 *
 *   npx tsx scripts/wechat-publish.ts <slug>
 *
 * Steps:
 *   1. Render the mdx into WeChat-styled HTML.
 *   2. Upload the cover image as a permanent material (thumb).
 *   3. Upload every inline image so it survives group-send.
 *   4. Create a draft — review & 群发 it manually in the backend.
 *
 * Requires WECHAT_APP_ID / WECHAT_APP_SECRET in .env.local and the
 * machine's public IP in the account's IP whitelist.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { buildWechatHtml } from './exporters/wechat';
import { uploadPermanentImage, uploadContentImage, addDraft } from './utils/wechat-api';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');
const CATEGORIES = ['blog', 'projects', 'papers', 'creative', 'thoughts'];

function findMdxFile(slug: string): string | null {
  for (const cat of CATEGORIES) {
    for (const ext of ['.mdx', '.md']) {
      const filePath = path.join(CONTENT_DIR, cat, `${slug}${ext}`);
      if (fs.existsSync(filePath)) return filePath;
    }
  }
  return null;
}

interface ImageData {
  buffer: Buffer;
  filename: string;
}

/** Resolve an image src (remote URL or local path) into bytes. */
async function loadImage(src: string, baseDir: string): Promise<ImageData | null> {
  if (/^https?:\/\//i.test(src)) {
    const res = await fetch(src);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const name = path.basename(new URL(src).pathname) || 'image.jpg';
    return { buffer, filename: name };
  }

  // Local path — try a few sensible roots.
  const candidates = [
    path.resolve(src),
    path.join(baseDir, src),
    path.join(process.cwd(), src),
    path.join(process.cwd(), '_media', src),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return { buffer: fs.readFileSync(candidate), filename: path.basename(candidate) };
    }
  }
  return null;
}

async function main(): Promise<void> {
  const slug = process.argv[2];
  if (!slug) {
    console.error('用法: npx tsx scripts/wechat-publish.ts <slug>');
    process.exit(1);
  }

  const mdxPath = findMdxFile(slug);
  if (!mdxPath) {
    console.error(`❌ 找不到内容: ${slug} (查找目录: ${CATEGORIES.join(', ')})`);
    process.exit(1);
  }

  console.log(`📰 准备推送到公众号草稿箱: ${slug}\n`);

  const { title, richText, data } = buildWechatHtml(mdxPath);
  const baseDir = path.dirname(mdxPath);

  // 1. Cover image (mandatory for draft/add).
  const cover = data.cover as string | undefined;
  if (!cover) {
    console.error('❌ frontmatter 缺少 cover 字段。公众号草稿必须有封面图。');
    console.error('   请在 mdx frontmatter 里加: cover: "封面图的 URL 或本地路径"');
    process.exit(1);
  }
  console.log('⏳ 上传封面图...');
  const coverImg = await loadImage(cover, baseDir);
  if (!coverImg) {
    console.error(`❌ 无法读取封面图: ${cover}`);
    process.exit(1);
  }
  const thumbMediaId = await uploadPermanentImage(coverImg.buffer, coverImg.filename);
  console.log(`✅ 封面图已上传 (thumb_media_id: ${thumbMediaId})`);

  // 2. Inline images — upload each so it is not stripped on group-send.
  let content = richText;
  const srcSet = new Set<string>();
  for (const match of content.matchAll(/<img[^>]+src="([^"]+)"/g)) {
    const src = match[1];
    if (!src.includes('mmbiz.qpic.cn')) srcSet.add(src); // skip already-WeChat images
  }
  if (srcSet.size > 0) {
    console.log(`\n⏳ 上传 ${srcSet.size} 张正文图片...`);
    for (const src of srcSet) {
      const img = await loadImage(src, baseDir);
      if (!img) {
        console.warn(`  ⚠️  跳过(无法读取): ${src}`);
        continue;
      }
      const wxUrl = await uploadContentImage(img.buffer, img.filename);
      content = content.split(src).join(wxUrl);
      console.log(`  ✅ ${img.filename}`);
    }
  }

  // 3. Create the draft.
  console.log('\n⏳ 创建草稿...');
  const draftMediaId = await addDraft({
    title,
    author: (data.author as string) || 'Dicaijuandacong',
    digest: (data.excerpt as string) || '',
    content,
    contentSourceUrl: (data.sourceUrl as string) || process.env.SITE_URL || '',
    thumbMediaId,
  });

  console.log(`\n🎉 草稿已创建! (media_id: ${draftMediaId})`);
  console.log('👉 打开 公众号后台 → 草稿箱，审核无误后手动群发。');
}

main().catch((err) => {
  console.error(`\n❌ 推送失败: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
