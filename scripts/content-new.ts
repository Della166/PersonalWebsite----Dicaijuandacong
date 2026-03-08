import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const TEMPLATES_DIR = path.join(process.cwd(), 'templates');
const CONTENT_DIR = path.join(process.cwd(), 'src/content');

const CATEGORY_DIRS: Record<string, string> = {
  blog: 'blog',
  project: 'projects',
  paper: 'papers',
  creative: 'creative',
  thought: 'thoughts',
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
}

function createContent(category: string, title: string, slug?: string) {
  const dir = CATEGORY_DIRS[category];
  if (!dir) {
    console.error(`❌ Unknown category: ${category}. Use: ${Object.keys(CATEGORY_DIRS).join(', ')}`);
    process.exit(1);
  }

  const templatePath = path.join(TEMPLATES_DIR, `${category}.mdx`);
  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Template not found: ${templatePath}`);
    process.exit(1);
  }

  const finalSlug = slug || slugify(title);
  const outputDir = path.join(CONTENT_DIR, dir);
  const outputPath = path.join(outputDir, `${finalSlug}.mdx`);

  if (fs.existsSync(outputPath)) {
    console.error(`❌ File already exists: ${outputPath}`);
    process.exit(1);
  }

  let template = fs.readFileSync(templatePath, 'utf-8');
  const today = new Date().toISOString().split('T')[0];

  template = template.replace('title: ""', `title: "${title}"`);
  template = template.replace('"YYYY-MM-DD"', `"${today}"`);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, template, 'utf-8');

  console.log(`✅ Created: src/content/${dir}/${finalSlug}.mdx`);
  console.log(`📝 Open and edit the file to add your content.`);
}

async function interactive() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q: string): Promise<string> => new Promise((r) => rl.question(q, r));

  console.log('📝 Create New Content\n');
  console.log('Categories: blog, project, paper, creative, thought\n');

  const category = (await ask('Category: ')).trim();
  const title = (await ask('Title: ')).trim();
  const slug = (await ask('Slug (leave empty for auto): ')).trim();

  rl.close();
  createContent(category, title, slug || undefined);
}

const args = process.argv.slice(2);

if (args.includes('--yes') || args.includes('-y')) {
  const catIdx = args.indexOf('--category');
  const titleIdx = args.indexOf('--title');
  const slugIdx = args.indexOf('--slug');

  const category = catIdx >= 0 ? args[catIdx + 1] : '';
  const title = titleIdx >= 0 ? args[titleIdx + 1] : '';
  const slug = slugIdx >= 0 ? args[slugIdx + 1] : undefined;

  if (!category || !title) {
    console.error('Usage: --yes --category <cat> --title <title> [--slug <slug>]');
    process.exit(1);
  }

  createContent(category, title, slug);
} else {
  interactive();
}
