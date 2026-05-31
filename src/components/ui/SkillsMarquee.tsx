'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useMotionValue,
  useAnimationFrame,
  useReducedMotion,
  wrap,
} from 'framer-motion';

interface ParallaxRowProps {
  items: string[];
  /** 基础速度（百分比 / 秒），负值向左，正值向右 */
  baseVelocity: number;
}

function ParallaxRow({ items, baseVelocity }: ParallaxRowProps) {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

  const directionFactor = useRef<number>(1);
  const isPaused = useRef(false);

  /** 内容复制 2 份，x 在 -50% ~ 0% 之间环绕 = 无缝循环 */
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduced || isPaused.current) return;

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    /** 滚动方向翻转跑马灯方向 —— 反向滚动时跑马灯也反向 */
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => {
        isPaused.current = true;
      }}
      onMouseLeave={() => {
        isPaused.current = false;
      }}
    >
      <motion.div
        style={{ x }}
        className="flex shrink-0 flex-nowrap whitespace-nowrap gap-3 will-change-transform"
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex shrink-0 items-center rounded-full border border-[var(--color-green-400)]/18 bg-[var(--color-green-500)]/8 px-3.5 py-1.5 text-xs font-medium text-[var(--color-green-400)] transition-colors hover:border-[var(--color-green-300)]/40 hover:text-[var(--color-green-300)]"
          >
            {item}
          </span>
        ))}
      </motion.div>
      {/* 左右淡出遮罩 —— 避免硬边 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--color-bg-primary)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--color-bg-primary)] to-transparent" />
    </div>
  );
}

interface SkillsMarqueeProps {
  items: string[];
  className?: string;
}

export default function SkillsMarquee({ items, className = '' }: SkillsMarqueeProps) {
  /** 拆成两行，反向流动 */
  const half = Math.ceil(items.length / 2);
  const row1 = items.slice(0, half);
  const row2 = items.slice(half);

  return (
    <div className={`space-y-3 ${className}`}>
      <ParallaxRow items={row1} baseVelocity={-2} />
      <ParallaxRow items={row2} baseVelocity={2} />
    </div>
  );
}
