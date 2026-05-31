'use client';

import { Fragment } from 'react';
import { motion, type Variants } from 'framer-motion';
import { EASE, DUR } from '@/lib/motion';

interface SplitTextProps {
  text: string;
  /** 外层 span 的 className */
  className?: string;
  /** 每个字符/词的 motion span 上的 className —— 渐变/颜色类放这里 */
  charClassName?: string;
  /** 拆分粒度：'char' 适合 CJK 与短英文，'word' 适合英文长句 */
  splitBy?: 'char' | 'word';
  /** 字符/词之间的间隔（秒） */
  stagger?: number;
  /** 整体延迟（秒） */
  delayChildren?: number;
  /** 触发方式：'parent' 等父变体驱动；'mount' 挂载即播；'inView' 进入视口播 */
  trigger?: 'parent' | 'mount' | 'inView';
  /** inView 触发的 viewport margin */
  viewportMargin?: string;
}

const reveal: Variants = {
  hidden: { y: '110%' },
  show: { y: 0, transition: { duration: DUR.long, ease: EASE.outExpo } },
};

export default function SplitText({
  text,
  className = '',
  charClassName = '',
  splitBy = 'char',
  stagger = 0.03,
  delayChildren = 0,
  trigger = 'parent',
  viewportMargin = '-100px',
}: SplitTextProps) {
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren } },
  };

  const triggerProps =
    trigger === 'mount'
      ? { initial: 'hidden' as const, animate: 'show' as const }
      : trigger === 'inView'
        ? {
            initial: 'hidden' as const,
            whileInView: 'show' as const,
            viewport: { once: true, margin: viewportMargin },
          }
        : {};

  const words = text.split(' ');

  return (
    <motion.span
      variants={container}
      {...triggerProps}
      aria-label={text}
      className={`inline-block ${className}`}
    >
      {words.map((word, wi) => {
        const units = splitBy === 'char' ? Array.from(word) : [word];
        return (
          <Fragment key={wi}>
            <span className="inline-block" aria-hidden>
              {units.map((unit, ui) => (
                <span key={ui} className="inline-block overflow-hidden align-top">
                  <motion.span variants={reveal} className={`inline-block ${charClassName}`}>
                    {unit}
                  </motion.span>
                </span>
              ))}
            </span>
            {wi < words.length - 1 && (
              <span aria-hidden className="inline-block">
                &nbsp;
              </span>
            )}
          </Fragment>
        );
      })}
    </motion.span>
  );
}
