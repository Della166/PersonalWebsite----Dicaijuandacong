import type { MetadataRoute } from 'next';
import { getContentByCategory } from '@/lib/mdx';
import { routing } from '@/i18n/routing';

const SITE = 'https://fulingchen.me';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = routing.locales;
  const now = new Date();

  // Top-level routes per locale
  const topLevel = locales.flatMap((locale) =>
    ['', '#about', '#skills', '#projects', '#research', '#blog', '#creative', '#contact'].map(
      (anchor) => ({
        url: `${SITE}/${locale}${anchor}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: anchor === '' ? 1.0 : 0.7,
      }),
    ),
  );

  // Project case-study pages + demo pages
  const projects = getContentByCategory('projects');
  const projectRoutes = locales.flatMap((locale) =>
    projects.flatMap((p) => {
      const date = p.frontmatter.date ? new Date(p.frontmatter.date) : now;
      const out = [
        {
          url: `${SITE}/${locale}/projects/${p.slug}`,
          lastModified: date,
          changeFrequency: 'monthly' as const,
          priority: 0.9,
        },
      ];
      const demo = p.frontmatter.demo as string | undefined;
      if (demo && demo.startsWith('/demo/')) {
        out.push({
          url: `${SITE}/${locale}${demo}`,
          lastModified: date,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        });
      }
      return out;
    }),
  );

  // Blog posts
  const blogPosts = getContentByCategory('blog');
  const blogRoutes = locales.flatMap((locale) =>
    blogPosts.map((b) => ({
      url: `${SITE}/${locale}/blog/${b.slug}`,
      lastModified: b.frontmatter.date ? new Date(b.frontmatter.date) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  );

  return [...topLevel, ...projectRoutes, ...blogRoutes];
}
