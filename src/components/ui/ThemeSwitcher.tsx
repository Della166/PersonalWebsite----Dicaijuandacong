'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'dark' | 'light';

/** View Transitions API —— 浏览器可能未实现，故声明为可选 */
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
};

function getEffectiveTheme(): Theme {
  const saved = localStorage.getItem('theme') as Theme | null;
  return saved || 'light';
}

// 只切换 light/dark，保留 next/font 注入的字体变量 class
function applyThemeClass(theme: Theme) {
  const cls = document.documentElement.classList;
  cls.remove('light', 'dark');
  cls.add(theme);
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // 挂载后从 localStorage 同步主题：SSR 无法读取，此处必须在 effect 中设值，
    // 否则首屏会与服务端渲染的图标不一致（hydration mismatch）。
    const effective = getEffectiveTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(effective);
    applyThemeClass(effective);
  }, []);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      setTheme(next);
      applyThemeClass(next);
      localStorage.setItem('theme', next);
    };

    const doc = document as ViewTransitionDocument;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 不支持 View Transitions / 用户要求减少动效 —— 直接切换
    if (!doc.startViewTransition || prefersReduced) {
      apply();
      return;
    }

    // 从点击位置向外扩散的圆形揭示
    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(apply);
    void transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 480,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-9 h-9 rounded-full
                 text-[var(--color-text-secondary)] hover:text-[var(--color-green-300)]
                 border border-[var(--color-border-default)] hover:border-[var(--color-border-hover)]
                 bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-card-hover)]
                 backdrop-blur-md transition-all duration-300 active:scale-90"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
