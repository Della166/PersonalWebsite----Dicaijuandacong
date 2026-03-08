'use client';

interface BilibiliProps {
  bvid: string;
  title?: string;
  page?: number;
}

export default function Bilibili({ bvid, title = 'Bilibili Video', page = 1 }: BilibiliProps) {
  return (
    <div className="my-6 rounded-xl overflow-hidden border border-[var(--color-border-default)]">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={`https://player.bilibili.com/player.html?bvid=${bvid}&page=${page}&high_quality=1&danmaku=0`}
          title={title}
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full"
          sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts"
        />
      </div>
    </div>
  );
}
