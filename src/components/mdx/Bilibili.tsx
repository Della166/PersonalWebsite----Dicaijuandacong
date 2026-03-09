"use client";

import { useState, useRef, useEffect } from "react";

interface BilibiliProps {
  bvid: string;
}

export function Bilibili({ bvid }: BilibiliProps) {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setLoaded(true);
      },
      { rootMargin: "100px" }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="my-6 aspect-video w-full overflow-hidden rounded-xl border border-[var(--glass-border)]">
      {loaded ? (
        <iframe
          src={`https://player.bilibili.com/player.html?bvid=${bvid}&high_quality=1`}
          className="h-full w-full"
          allowFullScreen
          title="Bilibili"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[var(--bg-mid)] text-[var(--text-muted)]">
          Loading...
        </div>
      )}
    </div>
  );
}
