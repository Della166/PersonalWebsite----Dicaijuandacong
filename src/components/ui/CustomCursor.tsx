'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

/**
 * 自定义光标柔光 —— 跟随光标、略微滞后的柔光圆斑。
 *
 * 纯氛围层，不替换原生光标（pointer-events: none）。
 * 仅在精确指针设备(桌面)启用，触屏与「减少动态效果」下不渲染。
 */
export default function CustomCursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  const x = useMotionValue(-300);
  const y = useMotionValue(-300);
  const springX = useSpring(x, { stiffness: 220, damping: 28, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 220, damping: 28, mass: 0.5 });

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    // 挂载后才知道是否精确指针设备：SSR 无法检测，必须在 effect 中开启，
    // 否则会与服务端渲染结果不一致（hydration mismatch）。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);
    const handleMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, [reduced, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: springX, y: springY }}
      className="pointer-events-none fixed left-0 top-0 z-[15]"
    >
      <div className="cursor-glow -translate-x-1/2 -translate-y-1/2" />
    </motion.div>
  );
}
