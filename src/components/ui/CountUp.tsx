'use client';

import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';
import { EASE } from '@/lib/motion';

interface CountUpProps {
  /** 目标数值 */
  to: number;
  /** 数字后缀 */
  suffix?: string;
  className?: string;
}

/**
 * 数字滚动 —— 元素进入视口时从 0 累加到目标值。
 * 直接写 textContent，避免逐帧 re-render。
 */
export default function CountUp({ to, suffix = '', className = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;

    // 减少动态效果：直接显示终值
    if (reduced) {
      el.textContent = `${to}${suffix}`;
      return;
    }

    const controls = animate(0, to, {
      duration: 1.4,
      ease: EASE.outExpo,
      onUpdate: (v) => {
        el.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, suffix, reduced]);

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}
