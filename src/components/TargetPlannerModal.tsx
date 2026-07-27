import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { calculateOverallCGPA, calculateTargetFutureGPA, safeFixed } from '../utils/uohGrading';
import { Target, X, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface TargetPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  setActiveTab: (tab: string) => void;
}

export const TargetPlannerModal: React.FC<TargetPlannerModalProps> = ({
  isOpen,
  onClose,
  profile,
  setProfile,
  setActiveTab,
}) => {
  if (!isOpen) return null;

  const overall = calculateOverallCGPA(profile.semesters);
  const [totalCreditsInput, setTotalCreditsInput] = useState<number | string>(profile.totalDegreeCredits || 162);
  const [targetCGPAInput, setTargetCGPAInput] = useState<number | string>(profile.targetCGPA || 3.60);
  const [remainingCreditsInput, setRemainingCreditsInput] = useState<number | string>(
    Math.max(0, (profile.totalDegreeCredits || 162) - overall.earnedCredits)
  );

  const handleTotalCreditsChange = (val: number | string) => {
    setTotalCreditsInput(val);
    if (val !== '' && !isNaN(Number(val))) {
      setRemainingCreditsInput(Math.max(0, Number(val) - overall.earnedCredits));
    }
  };

  const calc = calculateTargetFutureGPA(
    overall.cgpa,
    overall.earnedCredits,
    Number(targetCGPAInput) || 3.60,
    Number(remainingCreditsInput) || 0
  );

  const handleSaveAndApply = () => {
    setProfile((prev) => ({
      ...prev,
      targetCGPA: Number(targetCGPAInput) || 3.60,
      totalDegreeCredits: Number(totalCreditsInput) > 0 ? Number(totalCreditsInput) : 162,
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0B132B] w-full max-w-md rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
                Target CGPA Planner
              </h3>
              <p className="text-[11px] text-slate-500">Calculate required future GPA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Current CGPA</span>
              <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                {safeFixed(overall?.cgpa, 2)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Earned Credits</span>
              <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                {overall.earnedCredits} hrs
              </span>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Target CGPA Goal (e.g. 3.60):
            </label>
            <input
              type="number"
              min="1.00"
              max="4.00"
              step="0.05"
              value={targetCGPAInput}
              onChange={(e) => setTargetCGPAInput(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-bold font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Remaining Credit Hours to Graduate:
            </label>
            <input
              type="number"
              min="1"
              max="132"
              value={remainingCreditsInput}
              onChange={(e) => setRemainingCreditsInput(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-bold font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          {/* Results Box */}
          <div
            className={`p-4 rounded-2xl border ${
              calc.isAchievable
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span className="flex items-center gap-1.5">
                {calc.isAchievable ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span>Required Average GPA:</span>
              </span>
              <span className="font-mono text-base font-extrabold">
                {safeFixed(calc?.requiredFutureGPA, 2)}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed">{calc.statusMessage}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              setActiveTab('advisor');
            }}
            className="px-3.5 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 rounded-xl flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI Advisor</span>
          </button>

          <button
            onClick={handleSaveAndApply}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Save Target
          </button>
        </div>
      </div>
    </div>
  );
};
