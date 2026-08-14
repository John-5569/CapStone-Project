import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, HardDrive, Settings, LogOut, Menu, X, Activity, Layers, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cloud Storage', href: '/storage', icon: HardDrive },
  { name: 'Datasets', href: '/datasets', icon: Database },
  { name: 'Processing', href: '/processing', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const AppLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="min-h-screen bg-[#f7f5f2] dark:bg-[#090d16] text-[#1e1915] dark:text-slate-100 flex transition-colors duration-200">
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden transition-opacity duration-300", sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className={cn("fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0f172a] border-r border-[#e6e1da] dark:border-slate-800 shadow-2xl p-6 flex flex-col transition-transform duration-300", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0061ff] flex items-center justify-center text-white shadow-sm">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-2xl font-display font-extrabold tracking-tight text-[#1e1915] dark:text-white">DataFlow</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="space-y-2 flex-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all",
                  location.pathname.startsWith(item.href)
                    ? "bg-[#0061ff] text-white shadow-sm font-semibold"
                    : "text-[#615951] dark:text-slate-400 hover:bg-[#f7f5f2] dark:hover:bg-slate-800 hover:text-[#1e1915] dark:hover:text-white"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3.5 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col bg-white dark:bg-[#0f172a] border-r border-[#e6e1da] dark:border-slate-800 z-30 transition-colors duration-200">
        <div className="flex h-20 shrink-0 items-center px-8 border-b border-[#e6e1da] dark:border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 rounded-lg bg-[#0061ff] flex items-center justify-center text-white shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-2xl font-display font-extrabold tracking-tight text-[#1e1915] dark:text-white">
              DataFlow
            </span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
          <nav className="flex-1 space-y-1.5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  location.pathname.startsWith(item.href)
                    ? "bg-[#0061ff] text-white shadow-sm font-semibold"
                    : "text-[#615951] dark:text-slate-400 hover:bg-[#f7f5f2] dark:hover:bg-slate-800 hover:text-[#1e1915] dark:hover:text-white"
                )}
              >
                <item.icon className={cn("mr-3.5 h-5 w-5 transition-colors", location.pathname.startsWith(item.href) ? "text-white" : "text-[#8c827a] dark:text-slate-500 group-hover:text-[#1e1915] dark:group-hover:text-white")} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1 min-h-screen relative z-10 w-full">
        <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center gap-x-4 bg-white dark:bg-[#0f172a] border-b border-[#e6e1da] dark:border-slate-800 px-4 sm:px-8 transition-colors duration-200">
          <Button variant="ghost" size="icon" className="lg:hidden text-[#1e1915] dark:text-white" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end items-center">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#e6e1da] dark:border-slate-700 bg-[#f7f5f2] dark:bg-slate-800 text-xs font-semibold text-[#1e1915] dark:text-slate-200 hover:bg-[#eae6e1] dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm"
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

            {/* User Email & Visible Logout Button */}
            <div className="flex items-center gap-x-3 pl-4 border-l border-[#e6e1da] dark:border-slate-800">
              <span className="text-xs font-semibold text-[#1e1915] dark:text-slate-200 hidden sm:block px-3 py-1.5 rounded-lg bg-[#f7f5f2] dark:bg-slate-800 border border-[#e6e1da] dark:border-slate-700">
                {user?.email}
              </span>
              <button 
                onClick={logout}
                title="Log out"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 py-10 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
