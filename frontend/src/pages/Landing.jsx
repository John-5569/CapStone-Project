import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, Check } from 'lucide-react';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-[#f7f5f2] dark:bg-[#090d16] text-[#1e1915] dark:text-slate-100 flex flex-col justify-between font-sans transition-colors duration-200">
      {/* Header */}
      <header className="w-full bg-white dark:bg-[#0f172a] border-b border-[#e6e1da] dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo Left */}
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 rounded-lg bg-[#0061ff] flex items-center justify-center text-white shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-2xl font-display font-extrabold tracking-tight text-[#1e1915] dark:text-white">
              DataFlow
            </span>
          </Link>

          {/* Right Header Navigation */}
          <div className="flex items-center space-x-6">
            <ThemeToggle />
            <Link to="/register" className="text-sm font-semibold text-[#1e1915] dark:text-slate-200 hover:text-[#0061ff] transition-colors no-underline">
              Sign up
            </Link>
            <Link to="/login" className="text-sm font-semibold text-[#1e1915] dark:text-slate-200 hover:text-[#0061ff] transition-colors no-underline">
              Log in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-20 max-w-5xl mx-auto text-center">
        {/* Main Headline */}
        <h1 className="text-5xl sm:text-7xl font-display font-extrabold tracking-tight text-[#1e1915] dark:text-white mb-8 leading-[1.1] max-w-4xl">
          Turn raw data into clean, training-ready data.
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[#615951] dark:text-slate-400 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          Connect your cloud storage, select a dataset, and let DataFlow automatically process and prepare your data.
        </p>

        {/* Primary Action Button */}
        <div className="flex flex-col items-center gap-4 mb-16">
          <Link to="/signup" className="no-underline">
            <button className="bg-[#0061ff] hover:bg-[#0052d6] text-white font-semibold rounded-xl px-9 py-4 text-lg flex items-center justify-center gap-3 shadow-md border border-[#0052d6] transition-all hover:shadow-lg cursor-pointer">
              Try DataFlow for free
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>

          <Link to="/login" className="text-sm font-medium text-[#615951] dark:text-slate-400 hover:text-[#1e1915] dark:hover:text-white transition-colors underline">
            Log in to existing account
          </Link>
        </div>

        {/* Professional Minimal Showcase Preview Card */}
        <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-[#0f172a] border border-[#e6e1da] dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 text-left transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-[#f1ede8] dark:border-slate-800 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <span className="text-xs font-mono text-[#8c827a] dark:text-slate-500 ml-2">dataflow // cloud_pipeline</span>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0061ff] dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              Automated Cleaning Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-[#f7f5f2] dark:bg-slate-900 border border-[#e6e1da] dark:border-slate-800">
              <div className="text-[#8c827a] dark:text-slate-400 mb-1 uppercase tracking-wider font-sans font-bold">Input Dataset</div>
              <div className="font-semibold text-[#1e1915] dark:text-white text-sm font-sans">raw_customer_data.csv</div>
              <div className="mt-3 space-y-1 text-[#615951] dark:text-slate-400">
                <div>• Missing values: 1,420 rows</div>
                <div>• Duplicate rows: 312 rows</div>
                <div>• Outliers detected: 84 values</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
              <div className="text-[#0061ff] dark:text-blue-400 mb-1 uppercase tracking-wider font-sans font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Cleaned Output
              </div>
              <div className="font-semibold text-[#1e1915] dark:text-white text-sm font-sans">raw_customer_data_cleaned.csv</div>
              <div className="mt-3 space-y-1 text-[#0061ff] dark:text-blue-400">
                <div>✓ Missing values imputed (IQR)</div>
                <div>✓ Duplicates removed</div>
                <div>✓ Column names normalized</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-[#0f172a] border-t border-[#e6e1da] dark:border-slate-800 py-6 text-center text-xs text-[#615951] dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span className="font-display font-bold text-[#1e1915] dark:text-white">DataFlow</span>
          <p>© 2026 DataFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
