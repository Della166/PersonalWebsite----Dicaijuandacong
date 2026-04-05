'use client';

import { Lock, Sparkles } from 'lucide-react';

interface DemoStatusProps {
  title: string;
  description: string;
}

export default function DemoStatus({ title, description }: DemoStatusProps) {
  return (
    <div className="not-prose my-8 rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-5">
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/25 bg-[var(--color-amber-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-amber-300)]">
        <Lock className="h-3.5 w-3.5" />
        Demo strategy
      </div>
      <h3 className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{description}</p>
      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/20 bg-[var(--color-green-300)]/10 px-3 py-1 text-xs font-medium text-[var(--color-green-300)]">
        <Sparkles className="h-3.5 w-3.5" />
        Public preview can be enabled later without redesigning the case-study layout
      </div>
    </div>
  );
}
