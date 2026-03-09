"use client";

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export function VideoPlayer({ src, poster }: VideoPlayerProps) {
  return (
    <div className="my-6 aspect-video w-full overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--bg-mid)]">
      <video
        src={src}
        poster={poster}
        controls
        className="h-full w-full"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
