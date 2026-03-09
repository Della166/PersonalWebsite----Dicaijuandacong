"use client";

import { Info, AlertTriangle, Lightbulb, AlertCircle } from "lucide-react";

type CalloutType = "info" | "warning" | "tip" | "danger";

const styles: Record<CalloutType, { border: string; icon: React.ElementType }> = {
  info: { border: "border-[var(--primary)]", icon: Info },
  warning: { border: "border-[var(--accent)]", icon: AlertTriangle },
  tip: { border: "border-[var(--primary-light)]", icon: Lightbulb },
  danger: { border: "border-red-500/60", icon: AlertCircle },
};

interface CalloutProps {
  type?: CalloutType;
  children: React.ReactNode;
}

export function Callout({ type = "info", children }: CalloutProps) {
  const { border, icon: Icon } = styles[type];
  return (
    <div className={`my-4 flex gap-3 rounded-xl border-l-4 ${border} bg-[var(--bg-mid)]/50 p-4`}>
      <Icon className="h-5 w-5 shrink-0 text-[var(--primary)]" />
      <div className="prose prose-sm prose-invert max-w-none text-[var(--text-muted)]">
        {children}
      </div>
    </div>
  );
}
