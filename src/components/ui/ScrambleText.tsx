'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

const CHARS = '!<>-_\\/[]{}=+*^?#01';

interface ScrambleTextProps {
  /** 最终文本（建议 Latin 字符，CJK 解码效果不佳） */
  text: string;
  className?: string;
  /** 解码总时长（毫秒） */
  duration?: number;
}

/**
 * 字符解码 —— 元素进入视口时，文本从随机字符快速「解码」为最终内容。
 * 建议配合等宽字体使用，避免解码过程宽度抖动。
 */
export default function ScrambleText({ text, className = '', duration = 900 }: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!inView || reduced) return;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const settled = Math.floor(progress * text.length);

      let out = '';
      for (let i = 0; i < text.length; i += 1) {
        if (i < settled || text[i] === ' ') {
          out += text[i];
        } else {
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setDisplay(out);

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, text, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
