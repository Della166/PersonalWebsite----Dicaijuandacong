"use client";

import { useState, useRef, useEffect } from "react";

interface YouTubeProps {
  id: string;
}

export function YouTube({ id }: YouTubeProps) {
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
          src={`https://www.youtube.com/embed/${id}`}
          className="h-full w-full"
          allowFullScreen
          title="YouTube"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[var(--bg-mid)] text-[var(--text-muted)]">
          Loading...
        </div>
      )}
    </div>
  );
}
