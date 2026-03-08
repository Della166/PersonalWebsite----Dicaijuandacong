'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Play, Film, Car } from 'lucide-react';
import SectionTitle from '@/components/ui/SectionTitle';

interface CreativeWork {
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  type: 'ai-film' | 'driving' | 'other';
  thumbnail?: string;
  videoUrl?: string;
  platform?: 'bilibili' | 'youtube';
  platformId?: string;
}

const works: CreativeWork[] = [
  {
    title: 'AI 生成的赛博城市',
    title_en: 'AI-Generated Cyber City',
    description: '使用 Sora 和 Runway 生成的赛博朋克风格城市短片',
    description_en: 'A cyberpunk city short film generated with Sora and Runway',
    type: 'ai-film',
    platform: 'bilibili',
    platformId: 'BV1example1',
  },
  {
    title: '山路日落驾驶',
    title_en: 'Mountain Road Sunset Drive',
    description: '4K 驾驶拍摄，记录山间公路的日落美景',
    description_en: '4K cinematic driving footage capturing sunset on mountain roads',
    type: 'driving',
    platform: 'youtube',
    platformId: 'example1',
  },
  {
    title: 'AI × 古风动画',
    title_en: 'AI × Traditional Animation',
    description: '用 AI 工具制作的中国古风动画短片',
    description_en: 'A traditional Chinese animation short made with AI tools',
    type: 'ai-film',
    platform: 'bilibili',
    platformId: 'BV1example2',
  },
  {
    title: '城市夜景巡航',
    title_en: 'City Night Cruise',
    description: '城市夜间驾驶拍摄，霓虹灯光与车流',
    description_en: 'Night driving through the city with neon lights and traffic',
    type: 'driving',
    platform: 'youtube',
    platformId: 'example2',
  },
];

const typeIcons = {
  'ai-film': Film,
  'driving': Car,
  'other': Play,
};

export default function Creative() {
  const t = useTranslations('creative');
  const locale = useLocale();

  return (
    <section id="creative" className="section-container">
      <SectionTitle title={t('title')} subtitle={t('subtitle')} />

      <div className="grid md:grid-cols-2 gap-6">
        {works.map((work, i) => {
          const Icon = typeIcons[work.type];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="glass-card overflow-hidden group cursor-pointer">
                {/* Thumbnail placeholder */}
                <div className="relative aspect-video bg-gradient-to-br from-[var(--color-green-800)] to-[var(--color-bg-primary)] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[var(--color-bg-primary)]/40 group-hover:bg-[var(--color-bg-primary)]/20 transition-all duration-300" />
                  <div className="relative z-10 w-16 h-16 rounded-full bg-[var(--color-green-300)]/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-[var(--color-green-300)]/30 transition-all duration-300">
                    <Play className="w-8 h-8 text-[var(--color-green-300)] ml-1" />
                  </div>
                  {/* Type badge */}
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-[var(--color-bg-card)]/80 backdrop-blur-sm text-[var(--color-text-secondary)] border border-[var(--color-border-default)]">
                    <Icon className="w-3 h-3" />
                    {work.type === 'ai-film' ? 'AI Film' : work.type === 'driving' ? 'Driving' : 'Other'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
                    {locale === 'zh' ? work.title : work.title_en}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {locale === 'zh' ? work.description : work.description_en}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
