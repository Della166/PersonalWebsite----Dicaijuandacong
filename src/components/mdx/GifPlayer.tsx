'use client';

import { useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface GifPlayerProps {
  src: string;
  alt?: string;
  staticSrc?: string;
}

export default function GifPlayer({ src, alt = '', staticSrc }: GifPlayerProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="my-6 relative rounded-xl overflow-hidden border border-[var(--color-border-default)] group cursor-pointer"
         onClick={() => setPlaying(!playing)}>
      <img
        src={playing ? src : (staticSrc || src)}
        alt={alt}
        className="w-full"
        loading="lazy"
      />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-primary)]/30">
          <div className="w-14 h-14 rounded-full bg-[var(--color-bg-card)]/80 backdrop-blur-sm flex items-center justify-center border border-[var(--color-border-default)]">
            <Play className="w-6 h-6 text-[var(--color-green-300)] ml-0.5" />
          </div>
        </div>
      )}
      {playing && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-[var(--color-bg-card)]/80 backdrop-blur-sm flex items-center justify-center">
            <Pause className="w-4 h-4 text-[var(--color-text-secondary)]" />
          </div>
        </div>
      )}
    </div>
  );
}
