import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');

interface ContentEntry {
  category: string;
  slug: string;
  title: string;
  date: string;
  published: boolean;
  platforms: string[];
  lang: string;
}

function scanContent(): ContentEntry[] {
  const entries: ContentEntry[] = [];

  if (!fs.existsSync(CONTENT_DIR)) return entries;

  for (const dir of fs.readdirSync(CONTENT_DIR, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const catDir = path.join(CONTENT_DIR, dir.name);

    for (const file of fs.readdirSync(catDir)) {
      if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue;

      const content = fs.readFileSync(path.join(catDir, file), 'utf-8');
      const { data } = matter(content);

      entries.push({
        category: dir.name,
        slug: file.replace(/\.mdx?$/, ''),
        title: data.title || 'Untitled',
        date: data.date || 'N/A',
        published: data.published ?? false,
        platforms: data.platforms || [],
        lang: data.lang || 'zh',
      });
    }
  }

  return entries.sort((a, b) => (b.date > a.date ? 1 : -1));
}

function main() {
  const entries = scanContent();

  if (entries.length === 0) {
    console.log('📭 No content found.');
    return;
  }

  console.log('📚 Content List\n');
  console.log(`${'Category'.padEnd(12)} ${'Status'.padEnd(8)} ${'Date'.padEnd(12)} ${'Slug'.padEnd(30)} Title`);
  console.log('-'.repeat(90));

  for (const entry of entries) {
    const status = entry.published ? '✅' : '📝';
    console.log(
      `${entry.category.padEnd(12)} ${status.padEnd(8)} ${String(entry.date).padEnd(12)} ${entry.slug.padEnd(30)} ${entry.title}`
    );
  }

  console.log(`\nTotal: ${entries.length} items (${entries.filter((e) => e.published).length} published)`);
}

main();
