"use client";

import { useState } from "react";

interface GifPlayerProps {
  src: string;
  alt?: string;
}

export function GifPlayer({ src, alt = "" }: GifPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const staticSrc = src.replace(/\.gif$/i, ".jpg");

  return (
    <div className="my-4">
      <button
        type="button"
        onClick={() => setPlaying(!playing)}
        className="block w-full overflow-hidden rounded-lg border border-[var(--glass-border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      >
        <img
          src={playing ? src : staticSrc}
          alt={alt}
          className="w-full object-cover"
        />
      </button>
      <p className="mt-1 text-center text-xs text-[var(--text-muted)]">
        {playing ? "Click to pause" : "Click to play"}
      </p>
    </div>
  );
}
