'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

function getEffectiveTheme(): 'dark' | 'light' {
  const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
  return saved || 'light';
}

// 只切换 light/dark，保留 next/font 注入的字体变量 class
function applyThemeClass(theme: 'dark' | 'light') {
  const cls = document.documentElement.classList;
  cls.remove('light', 'dark');
  cls.add(theme);
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const effective = getEffectiveTheme();
    setTheme(effective);
    applyThemeClass(effective);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyThemeClass(next);
    localStorage.setItem('theme', next);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-9 h-9 rounded-full
                 text-[var(--color-text-secondary)] hover:text-[var(--color-green-300)]
                 border border-[var(--color-border-default)] hover:border-[var(--color-border-hover)]
                 bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-card-hover)]
                 backdrop-blur-md transition-all duration-300"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
