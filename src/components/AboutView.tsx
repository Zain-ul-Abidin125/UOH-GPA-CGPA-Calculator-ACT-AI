import React from 'react';
import { UohLogo } from './UohLogo';
import { Award, ShieldAlert, Code2, Sparkles, BookOpen, GraduationCap, Heart, CheckCircle2 } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#001F3F] via-[#0B2545] to-[#134074] text-white p-8 shadow-xl border border-blue-900/50">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <UohLogo size={80} showText={false} />
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
              <Award className="w-3.5 h-3.5 fill-slate-950" />
              <span>ACT AI Final Project by Zain ul Abidin</span>
            </div>
            <h1 className="text-3xl font-extrabold font-serif text-white">
              The University of Haripur
            </h1>
            <p className="text-sm font-medium text-blue-200 italic">
              "Restoring Hope; Building Community"
            </p>
            <p className="text-xs text-blue-100 max-w-2xl pt-2 leading-relaxed">
              UOH GPA/CGPA Calculator & AI Academic Advisor is a commercial-grade, full-stack student portal specially designed for Doctor of Physical Therapy (DPT - 5 Years) and Allied Health Sciences students at the University of Haripur. Built by a DPT student to empower healthcare students with precise absolute grade calculations, target CGPA planning, and AI-powered academic advisory.
            </p>
          </div>
        </div>
      </div>

      {/* Official Disclaimer Box */}
      <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-4 shadow-sm">
        <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs leading-relaxed">
          <h3 className="font-bold text-sm text-amber-900 dark:text-amber-100 uppercase tracking-wider">
            Official Non-Affiliation Disclaimer
          </h3>
          <p>
            "This application is an independent student project and is not officially affiliated with the University of Haripur."
          </p>
          <p className="text-slate-500 dark:text-slate-400 pt-1">
            All calculations strictly follow Section 23.6 of the official <em>University of Haripur Semester Rules and Regulations (Revised 2022) for Undergraduate Academic Programs</em>.
          </p>
        </div>
      </div>

      {/* Project Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0B132B] p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm space-y-3">
          <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 w-fit">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
            Official Absolute Grading
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Implements the exact UOH lookup matrix for percentage marks (0-100%) to Numerical Grade (NG) and Letter Grades (A, A-, B+, B, B-, C+, C, C-, D+, D, F) with proper fraction rounding.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0B132B] p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm space-y-3">
          <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 w-fit">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
            AI Academic Advisor
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Leverages Gemini 3.6 Flash server-side to calculate target GPAs, estimate required final exam marks, analyze weak subjects, and suggest realistic study strategies.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0B132B] p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm space-y-3">
          <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 w-fit">
            <Code2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
            Export & Persistence
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Saves complete semester history locally and exports professional UOH Academic Transcripts as PDF documents ready for printing or sharing.
          </p>
        </div>
      </div>

      {/* Tech Stack Details */}
      <div className="bg-white dark:bg-[#0B132B] p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
          Technical Architecture & Stack
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="block text-slate-400 text-[10px] uppercase font-bold">Frontend</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">React 19 + Vite</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="block text-slate-400 text-[10px] uppercase font-bold">Styling</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">Tailwind CSS v4</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="block text-slate-400 text-[10px] uppercase font-bold">Backend</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">Express.js + Node</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="block text-slate-400 text-[10px] uppercase font-bold">AI Engine</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">@google/genai</span>
          </div>
        </div>
      </div>

      {/* Author Profile */}
      <div className="bg-gradient-to-r from-blue-900/10 via-[#0B2545]/20 to-blue-900/10 p-6 rounded-3xl border border-blue-200 dark:border-blue-800/40 text-center space-y-2">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
          ACT AI Final Project
        </p>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif">
          Developed by Zain ul Abidin
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Built for University of Haripur students to streamline academic tracking and target GPA goal planning.
        </p>
      </div>
    </div>
  );
};
