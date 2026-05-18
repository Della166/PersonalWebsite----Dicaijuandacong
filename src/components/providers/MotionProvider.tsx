'use client';

import { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';

/**
 * 全站运动配置。
 *
 * `reducedMotion="user"` —— 当用户系统开启「减少动态效果」时，
 * framer-motion 自动停用所有位移/缩放/旋转动画，仅保留透明度过渡。
 * 这一处即覆盖全站 motion 组件的无障碍降级。
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
