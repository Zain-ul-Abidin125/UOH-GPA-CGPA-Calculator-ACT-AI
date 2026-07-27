import React from 'react';
import { UohLogo } from './UohLogo';
import { ShieldAlert, Award, Heart, ExternalLink, Code2 } from 'lucide-react';

interface FooterProps {
  setActiveTab?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-gradient-to-b from-slate-900 via-[#0B132B] to-[#00152B] text-slate-300 pt-12 pb-8 border-t border-blue-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <UohLogo size={56} showText={false} />
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white font-serif">
                The University of Haripur
              </h3>
              <p className="text-sm font-medium text-blue-400 italic">
                "Restoring Hope; Building Community"
              </p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              A premium academic performance and GPA/CGPA calculator engineered specifically for UOH students adhering strictly to the official 2022 Absolute Grading Sheet.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <Award className="w-3.5 h-3.5" />
                ACT AI Final Project by Zain ul Abidin
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Navigation & Tools
            </h4>
            <ul className="space-y-2 text-xs">
              {setActiveTab && (
                <>
                  <li>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="hover:text-blue-400 transition-colors"
                    >
                      Academic Dashboard
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('semester')}
                      className="hover:text-blue-400 transition-colors"
                    >
                      Semester GPA Calculator
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('cgpa')}
                      className="hover:text-blue-400 transition-colors"
                    >
                      Overall CGPA Calculator
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('advisor')}
                      className="hover:text-blue-400 transition-colors flex items-center gap-1"
                    >
                      <span>AI Academic Advisor</span>
                      <span className="text-[10px] bg-blue-600 px-1.5 py-0.2 rounded text-white font-bold">GEMINI</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('criteria')}
                      className="hover:text-blue-400 transition-colors"
                    >
                      Official Grading Sheet (Revised 2022)
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* UOH Information & Portal Link */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Official University Info
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              University of Haripur, Hattar Road, Haripur, Khyber Pakhtunkhwa, Pakistan.
            </p>
            <a
              href="https://uoh.edu.pk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              <span>Visit Official UOH Portal (uoh.edu.pk)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-amber-200/90 max-w-3xl mx-auto">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Disclaimer:</strong> "This application is an independent student project and is not officially affiliated with the University of Haripur."
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 pt-2">
            <div>© 2026 UOH GPA/CGPA Calculator. All rights reserved.</div>
            <div className="flex items-center gap-1 text-slate-400 font-medium">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for UOH Students by Zain ul Abidin</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
