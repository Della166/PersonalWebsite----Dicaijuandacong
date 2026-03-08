import { getContentByCategory, getReadingTime } from '@/lib/mdx';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import Research from '@/components/sections/Research';
import BlogPreview from '@/components/sections/BlogPreview';
import Creative from '@/components/sections/Creative';
import Contact from '@/components/sections/Contact';

export default function HomePage() {
  const posts = getContentByCategory('blog');
  const blogPosts = posts.map((post) => ({
    slug: post.slug,
    title: post.frontmatter.title,
    title_en: post.frontmatter.title_en,
    excerpt: post.frontmatter.excerpt,
    excerpt_en: post.frontmatter.excerpt_en,
    date: post.frontmatter.date,
    tags: post.frontmatter.tags,
    readingTime: Math.ceil(getReadingTime(post.content).minutes),
  }));

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Research />
      <BlogPreview posts={blogPosts} />
      <Creative />
      <Contact />
    </>
  );
}
