import { notFound } from "next/navigation";
import { loadBlogPost } from "@/lib/content-loader";
import { getBlogSlugs } from "@/lib/mdx";
import { MDXRenderer } from "./MDXRenderer";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  const slugs = getBlogSlugs();
  return ["zh", "en"].flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

export default async function BlogSlugPage({ params }: Props) {
  const { locale, slug } = await params;
  const post = await loadBlogPost(slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen pt-24 pb-16">
      <article className="mx-auto max-w-3xl px-4 md:px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-[var(--text)]">
            {locale === "en" && post.frontmatter.title_en
              ? post.frontmatter.title_en
              : post.frontmatter.title}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {post.frontmatter.date}
            {post.readingTime != null && ` · ${post.readingTime} min read`}
          </p>
        </header>
        <MDXRenderer source={post.content} />
      </article>
    </main>
  );
}
