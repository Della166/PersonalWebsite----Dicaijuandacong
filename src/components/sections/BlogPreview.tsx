'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';

interface BlogPost {
  slug: string;
  title: string;
  title_en?: string;
  excerpt?: string;
  excerpt_en?: string;
  date: string;
  tags: string[];
  readingTime: number;
}

interface BlogPreviewProps {
  posts: BlogPost[];
}

export default function BlogPreview({ posts }: BlogPreviewProps) {
  const t = useTranslations('blog');
  const locale = useLocale();

  return (
    <section id="blog" className="section-container">
      <SectionTitle title={t('title')} subtitle={t('subtitle')} />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {posts.slice(0, 6).map((post, i) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <a href={`/${locale}/blog/${post.slug}`}>
              <GlassCard className="h-full flex flex-col">
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-3">
                  <span>{new Date(post.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readingTime} {t('min_read')}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 line-clamp-2">
                  {locale === 'zh' ? post.title : (post.title_en || post.title)}
                </h3>

                <p className="text-sm text-[var(--color-text-muted)] mb-4 flex-grow line-clamp-3">
                  {locale === 'zh' ? post.excerpt : (post.excerpt_en || post.excerpt)}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-[var(--color-green-300)]/10 text-[var(--color-green-300)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </a>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <a
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium border border-[var(--color-border-hover)] text-[var(--color-green-300)] hover:bg-[var(--color-bg-card)] transition-all duration-300"
        >
          {t('view_all')}
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
