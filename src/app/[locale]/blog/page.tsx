import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { loadBlogList } from "@/lib/content-loader";
import BlogList from "./BlogList";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const list = await loadBlogList(locale as "zh" | "en");

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <h1 className="mb-8 text-3xl font-semibold text-[var(--text)]">
          {t("title")}
        </h1>
        <BlogList list={list} locale={locale} />
      </div>
    </main>
  );
}
