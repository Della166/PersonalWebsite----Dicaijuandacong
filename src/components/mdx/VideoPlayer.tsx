'use client';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

export default function VideoPlayer({ src, poster, title }: VideoPlayerProps) {
  return (
    <div className="my-6 rounded-xl overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-bg-card)]">
      <video
        src={src}
        poster={poster}
        controls
        preload="metadata"
        className="w-full"
        title={title}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
