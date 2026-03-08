import { ReactNode } from 'react';
import { Info, AlertTriangle, Lightbulb, AlertCircle } from 'lucide-react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'tip' | 'danger';
  children: ReactNode;
}

const calloutConfig = {
  info: {
    icon: Info,
    border: 'var(--color-green-300)',
    bg: 'rgba(127, 188, 140, 0.08)',
  },
  warning: {
    icon: AlertTriangle,
    border: 'var(--color-amber-300)',
    bg: 'rgba(212, 165, 116, 0.08)',
  },
  tip: {
    icon: Lightbulb,
    border: 'var(--color-green-200)',
    bg: 'rgba(168, 213, 176, 0.08)',
  },
  danger: {
    icon: AlertCircle,
    border: '#e57373',
    bg: 'rgba(229, 115, 115, 0.08)',
  },
};

export default function Callout({ type = 'info', children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className="my-6 flex gap-3 p-4 rounded-xl"
      style={{
        borderLeft: `3px solid ${config.border}`,
        background: config.bg,
      }}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: config.border }} />
      <div className="text-sm text-[var(--color-text-secondary)]">{children}</div>
    </div>
  );
}
