import { loadBlogList } from "@/lib/content-loader";
import BlogList from "./BlogList";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

const titles: Record<string, string> = { zh: "博客", en: "Blog" };

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const list = await loadBlogList(locale as "zh" | "en");

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <h1 className="mb-8 text-3xl font-semibold text-[var(--text)]">
          {titles[locale] ?? "Blog"}
        </h1>
        <BlogList list={list} locale={locale} />
      </div>
    </main>
  );
}
