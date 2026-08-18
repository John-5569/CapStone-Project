import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#e6e1da] dark:border-slate-700 bg-[#f7f5f2] dark:bg-slate-800 text-xs font-semibold text-[#1e1915] dark:text-slate-200 hover:bg-[#eae6e1] dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm ${className}`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-[#0061ff]" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
};
