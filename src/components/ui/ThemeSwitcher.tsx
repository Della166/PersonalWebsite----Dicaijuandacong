'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

function getEffectiveTheme(): 'dark' | 'light' {
  const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
  return saved || 'light';
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const effective = getEffectiveTheme();
    setTheme(effective);
    document.documentElement.className = effective;
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.className = next;
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
