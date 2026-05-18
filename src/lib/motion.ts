/**
 * Motion language —— 全站统一的运动语言。
 *
 * 原则：
 *  - 入场用 ease-out（快出慢收），循环用 ease-in-out。
 *  - 位移/缩放优先 spring（物理感），透明度/颜色用 tween。
 *  - 同一时刻只动一个主元素；时长绝不超过 600ms。
 *
 * 缓动与时长 token 同时存在于 globals.css 的 @theme（CSS 侧）。
 */
import type { Transition, Variants } from 'framer-motion';

/** 三次贝塞尔缓动控制点 */
type Bezier = [number, number, number, number];

/** 缓动曲线 —— 与 globals.css 的 --ease-* token 对应 */
export const EASE = {
  /** 入场、展开 —— 干脆利落 */
  outExpo: [0.16, 1, 0.3, 1] as Bezier,
  /** 通用 —— 略柔 */
  outQuint: [0.22, 1, 0.36, 1] as Bezier,
  /** 来回循环 */
  inOutSoft: [0.65, 0, 0.35, 1] as Bezier,
} as const;

/** 时长（秒）—— 与 globals.css 的 --dur-* token 对应 */
export const DUR = {
  micro: 0.14,
  short: 0.24,
  medium: 0.42,
  long: 0.6,
} as const;

/** Spring 预设 —— 位移/缩放统一物理参数，克制、不过冲 */
export const SPRING = {
  /** 通用 —— 落定干脆 */
  default: { type: 'spring', stiffness: 260, damping: 30 } as Transition,
  /** 跟手 —— 磁吸、光标 */
  snappy: { type: 'spring', stiffness: 350, damping: 28, mass: 0.4 } as Transition,
  /** 柔和 —— 大元素、layout 动画 */
  gentle: { type: 'spring', stiffness: 160, damping: 26 } as Transition,
} as const;

/** 入场 tween —— 透明度/模糊类用 */
export const ENTER: Transition = {
  duration: DUR.long,
  ease: EASE.outExpo,
};

/* ===== 共享 variants ===== */

/** 父容器 —— 编排子元素依次入场 */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

/** 子元素 —— 从下、从虚到实浮现 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: ENTER,
  },
};

/** 子元素 —— 纯淡入（reduced-motion 友好的轻量变体） */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.medium, ease: EASE.outQuint } },
};

/** 标题词遮罩 reveal —— 配合 overflow-hidden 外层使用 */
export const wordReveal: Variants = {
  hidden: { y: '110%' },
  show: {
    y: 0,
    transition: { duration: DUR.long, ease: EASE.outExpo },
  },
};
