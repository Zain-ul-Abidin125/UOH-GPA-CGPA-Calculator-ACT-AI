import React, { useState } from 'react';
import { UohLogo } from './UohLogo';
import {
  LayoutDashboard,
  Calculator,
  GraduationCap,
  Sparkles,
  BookOpen,
  FileText,
  Info,
  Sun,
  Moon,
  Menu,
  X,
  Award,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'semester', label: 'Semester GPA', icon: Calculator },
    { id: 'cgpa', label: 'Overall CGPA', icon: GraduationCap },
    { id: 'advisor', label: 'AI Advisor', icon: Sparkles, badge: 'AI Powered' },
    { id: 'criteria', label: 'Grading Sheet', icon: BookOpen },
    { id: 'transcript', label: 'Export Transcript', icon: FileText },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0B132B]/90 backdrop-blur-md border-b border-blue-100 dark:border-blue-900/50 shadow-sm transition-colors duration-200">
      {/* Top Banner for University Branding & Project Attribution */}
      <div className="bg-gradient-to-r from-[#001F3F] via-[#0B2545] to-[#134074] text-white px-4 py-1.5 text-xs font-medium flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-blue-100">
            Official UOH Absolute Grading System (Revised 2022)
          </span>
        </div>
        <div className="flex items-center gap-3 text-blue-200">
          <span className="hidden sm:inline-block">University of Haripur, KP Pakistan</span>
          <span className="hidden sm:inline">|</span>
          <span className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-amber-300 font-bold border border-amber-400/30 transition-colors flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-300" />
            ACT AI Final Project by Zain ul Abidin
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand & Logo */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="cursor-pointer group flex items-center gap-3 py-2"
          >
            <UohLogo size={52} showText={true} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-blue-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-full shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controls Right */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle Dark Mode"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-900" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#0B132B] border-b border-blue-100 dark:border-blue-900/50 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-xs font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
