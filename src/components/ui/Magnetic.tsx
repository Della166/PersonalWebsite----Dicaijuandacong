'use client';

import { ReactNode, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { SPRING } from '@/lib/motion';

interface MagneticProps {
  children: ReactNode;
  /** 吸附强度，0~1，越大跟手越明显 */
  strength?: number;
  /** 检测区相对元素外扩的像素，光标进入此范围即开始吸附 */
  padding?: number;
  className?: string;
}

/**
 * 磁吸包装器 —— 光标靠近时元素迎上去吸附，移出时弹回。
 *
 * 关键：onMouseMove 绑在外层「检测区」（透明 padding 撑大命中范围），
 * 位移作用于内层真实元素，从而获得「还没碰到就被吸过去」的磁吸感。
 */
export default function Magnetic({
  children,
  strength = 0.3,
  padding = 24,
  className = '',
}: MagneticProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING.snappy);
  const springY = useSpring(y, SPRING.snappy);
  const reduced = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const inner = innerRef.current;
    if (!inner) return;
    const rect = inner.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  // 减少动态效果时，磁吸位移直接停用
  if (reduced) {
    return <div className={`inline-block ${className}`}>{children}</div>;
  }

  return (
    <div onMouseMove={handleMouseMove} onMouseLeave={reset} style={{ padding }} className="inline-block">
      <motion.div ref={innerRef} style={{ x: springX, y: springY }} className={`inline-block ${className}`}>
        {children}
      </motion.div>
    </div>
  );
}
