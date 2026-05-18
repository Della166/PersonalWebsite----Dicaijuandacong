'use client';

import { ReactNode, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { SPRING } from '@/lib/motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

/** 倾斜最大角度（度）—— 克制，绝不超过 8° */
const MAX_TILT = 6;

export default function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, SPRING.snappy);
  const springRotateY = useSpring(rotateY, SPRING.snappy);

  const tiltEnabled = hover && !reduced;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // 光标跟随光斑
    ref.current.style.setProperty('--spot-x', `${px}px`);
    ref.current.style.setProperty('--spot-y', `${py}px`);

    // 3D 倾斜：光标位置归一化到 -0.5~0.5，再映射到 ±MAX_TILT
    if (tiltEnabled) {
      rotateY.set((px / rect.width - 0.5) * MAX_TILT * 2);
      rotateX.set(-(py / rect.height - 0.5) * MAX_TILT * 2);
    }
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -4 } : undefined}
      style={
        tiltEnabled
          ? { rotateX: springRotateX, rotateY: springRotateY, transformPerspective: 1000 }
          : undefined
      }
      className={`glass-card p-6 ${hover ? 'glass-card-spotlight cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
