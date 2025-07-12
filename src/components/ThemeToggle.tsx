'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [checked, setChecked] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;

    setChecked(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const handleChange = () => {
    const nextIsDark = !checked;
    setChecked(nextIsDark);
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', nextIsDark);
  };

  return (
    <label className="relative inline-block w-14 h-8">
      <input
        type="checkbox"
        className="peer hidden"
        aria-label="Alternar tema"
        checked={checked}
        onChange={handleChange}
      />
      <span
        className={`
          absolute top-0 left-0 w-full h-full 
          rounded-full bg-[#0f0f0f] 
          transition-all duration-300 ease-in-out
          peer-checked:bg-gray-200
        `}
      >
        <span className="flex items-center justify-around h-full">
          <i><Moon className="w-5 h-5" /></i>
          <i><Sun className="w-5 h-5" /></i>
        </span>
      </span>
      <span
        className={`
          absolute top-1 left-1 w-6 h-6
          bg-[#1a1a1a] dark:bg-gray-100 rounded-full 
          shadow-[10px_0_40px_rgba(0,0,0,0.1)]
          transition-all duration-300 ease-in-out
          peer-checked:translate-x-6
          peer-checked:shadow-[-10px_0_40px_rgba(0,0,0,0.1)]
          peer-active:w-12
          peer-checked:peer-active:translate-x-2
        `}
      />
    </label>
  );
}
