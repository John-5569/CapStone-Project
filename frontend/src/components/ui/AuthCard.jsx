import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

export const AuthCard = ({ children, title, subtitle, backLink, className }) => {
  return (
    <div className="min-h-screen bg-[#f7f5f2] flex flex-col justify-between items-center py-8 px-4">
      {/* Minimal Header */}
      <header className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#0061ff] flex items-center justify-center text-white shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xl font-display font-extrabold tracking-tight text-[#1e1915]">
            DataFlow
          </span>
        </Link>
      </header>

      {/* Centered Auth Card */}
      <main className="w-full flex-1 flex items-center justify-center py-10">
        <div className={cn("w-full max-w-[440px] bg-white rounded-2xl border border-[#e6e1da] shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-8 sm:p-10 relative", className)}>
          {backLink && (
            <Link to={backLink} className="inline-flex items-center text-[#615951] hover:text-[#1e1915] mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}

          {title && (
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#1e1915] text-center tracking-tight mb-2">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="text-sm text-[#615951] text-center mb-8 font-normal leading-relaxed">
              {subtitle}
            </p>
          )}

          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-xs text-[#8c827a]">
        © 2026 DataFlow. All rights reserved.
      </footer>
    </div>
  );
};
