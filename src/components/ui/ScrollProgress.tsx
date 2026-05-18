'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * 顶部滚动进度条 —— 跟随页面滚动从左到右填充。
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 right-0 top-0 z-[60] h-[3px] origin-left
                 bg-gradient-to-r from-[var(--color-green-300)] via-[var(--color-green-200)] to-[var(--color-amber-300)]"
    />
  );
}
