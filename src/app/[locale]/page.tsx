import { setRequestLocale } from "next-intl/server";
import { loadBlogList } from "@/lib/content-loader";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Research from "@/components/sections/Research";
import BlogPreview from "@/components/sections/BlogPreview";
import Creative from "@/components/sections/Creative";
import Contact from "@/components/sections/Contact";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const blogList = await loadBlogList(locale as "zh" | "en");

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Research />
      <BlogPreview list={blogList} />
      <Creative />
      <Contact />
    </>
  );
}
