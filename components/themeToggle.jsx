// components/ThemeToggle.js
'use client';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/themeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2.5 rounded-xl transition-all duration-300 hover:scale-105 group ${
        isDark
          ? 'hover:bg-white/10 bg-slate-800/50 border border-slate-700/50'
          : 'hover:bg-emerald-50 bg-white border border-emerald-200'
      }`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-5 h-5">
        {isDark ? (
          <Sun
            size={20}
            className="text-yellow-400 group-hover:text-yellow-300 transition-colors"
          />
        ) : (
          <Moon
            size={20}
            className="text-slate-600 group-hover:text-emerald-600 transition-colors"
          />
        )}
      </div>
    </button>
  );
}

