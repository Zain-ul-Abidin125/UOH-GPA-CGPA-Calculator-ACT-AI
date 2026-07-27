import React, { useState } from 'react';
import { StudentProfile, Semester } from '../types';
import {
  calculateOverallCGPA,
  getAcademicStanding,
  calculateTargetFutureGPA,
  safeFixed,
} from '../utils/uohGrading';
import {
  GraduationCap,
  Target,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowRight,
  Copy,
} from 'lucide-react';

interface CgpaCalculatorProps {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  setActiveTab: (tab: string) => void;
}

export const CgpaCalculator: React.FC<CgpaCalculatorProps> = ({
  profile,
  setProfile,
  setActiveTab,
}) => {
  const [expandedSemId, setExpandedSemId] = useState<string | null>(
    profile.semesters[0]?.id || null
  );

  // Target Planner local inputs
  const overall = calculateOverallCGPA(profile.semesters);
  const standing = getAcademicStanding(overall.cgpa);

  const [targetVal, setTargetVal] = useState<number | string>(profile.targetCGPA || 3.60);
  const [remainingVal, setRemainingVal] = useState<number | string>(
    Math.max(0, profile.totalDegreeCredits - overall.earnedCredits)
  );

  const targetCalc = calculateTargetFutureGPA(
    overall.cgpa,
    overall.earnedCredits,
    Number(targetVal) || 3.60,
    Number(remainingVal) || 0
  );

  // Toggle semester expand
  const toggleExpand = (id: string) => {
    setExpandedSemId(expandedSemId === id ? null : id);
  };

  // Delete semester
  const handleDeleteSemester = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      semesters: prev.semesters.filter((s) => s.id !== id),
    }));
  };

  // Duplicate semester
  const handleDuplicateSemester = (sem: Semester) => {
    const newSem: Semester = {
      ...sem,
      id: `sem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      number: profile.semesters.length + 1,
      title: `${sem.title} (Copy)`,
    };
    setProfile((prev) => ({
      ...prev,
      semesters: [...prev.semesters, newSem],
    }));
  };

  // Update target CGPA in profile
  const handleSaveTarget = () => {
    setProfile((prev) => ({
      ...prev,
      targetCGPA: Number(targetVal) || 3.60,
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0B132B] p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Cumulative Performance Analysis
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-serif">
            Overall CGPA Calculator & Planner
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculates multi-semester CGPA using official UOH quality points and credit weightages.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('semester')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Semester</span>
        </button>
      </div>

      {/* Main Cumulative CGPA Stats Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall CGPA Big Card */}
        <div className="lg:col-span-2 bg-gradient-to-r from-[#001F3F] via-[#0B2545] to-[#134074] text-white p-8 rounded-3xl shadow-xl border border-blue-900/50 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
                Current Overall CGPA
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${standing.badgeColor}`}
              >
                {standing.title}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-extrabold font-mono text-white">
                {safeFixed(overall?.cgpa, 2)}
              </span>
              <span className="text-sm text-blue-300 font-semibold">/ 4.00</span>
            </div>

            <p className="text-xs text-blue-200 leading-relaxed max-w-xl">
              {standing.description}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-blue-800/60 text-xs relative z-10">
            <div>
              <span className="text-blue-300 block">Total Quality Points:</span>
              <span className="text-lg font-bold font-mono text-white">
                {safeFixed(overall?.totalQualityPoints, 2)}
              </span>
            </div>
            <div>
              <span className="text-blue-300 block">Earned Credits:</span>
              <span className="text-lg font-bold font-mono text-white">
                {overall.earnedCredits} / {profile.totalDegreeCredits}
              </span>
            </div>
            <div>
              <span className="text-blue-300 block">Total Semesters:</span>
              <span className="text-lg font-bold font-mono text-white">
                {profile.semesters.length}
              </span>
            </div>
            <div>
              <span className="text-blue-300 block">Overall Percentage:</span>
              <span className="text-lg font-bold font-mono text-white">
                {overall.overallPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Target CGPA Goal Planner */}
        <div className="bg-white dark:bg-[#0B132B] p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                Target CGPA Calculator
              </h3>
              <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded-full">
                Planner
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculate the exact GPA required in remaining semesters to achieve your goal.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Target CGPA Goal:
              </label>
              <input
                type="number"
                min="1.00"
                max="4.00"
                step="0.05"
                value={targetVal}
                onChange={(e) => setTargetVal(e.target.value === '' ? '' : Number(e.target.value))}
                onBlur={handleSaveTarget}
                className="w-full px-3 py-2 text-sm font-bold font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Remaining Credit Hours:
              </label>
              <input
                type="number"
                min="1"
                max="132"
                value={remainingVal}
                onChange={(e) => setRemainingVal(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          {/* Result Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-400">Required Future GPA:</span>
              <span
                className={`font-mono text-base ${
                  targetCalc.isAchievable ? 'text-emerald-600 font-extrabold' : 'text-rose-600 font-extrabold'
                }`}
              >
                {safeFixed(targetCalc?.requiredFutureGPA, 2)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {targetCalc.statusMessage}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('advisor')}
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Get AI Action Plan from Advisor</span>
          </button>
        </div>
      </div>

      {/* Semester List Breakdown */}
      <div className="bg-white dark:bg-[#0B132B] rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
            All Semesters Breakdown ({profile.semesters.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Click any semester to view course details
          </span>
        </div>

        <div className="space-y-3">
          {profile.semesters.map((sem, sIdx) => {
            const isExpanded = expandedSemId === sem.id;

            return (
              <div
                key={sem.id ? `cgpa-sem-${sem.id}-${sIdx}` : `cgpa-sem-${sIdx}`}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpand(sem.id)}
                  className="p-4 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono font-bold text-xs">
                      SEM {sem.number}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {sem.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {sem.courses.length} Courses • {sem.totalCredits} Credit Hours • Avg {sem.averagePercentage}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-mono text-xs font-bold shadow-xs">
                      {safeFixed(sem?.gpa, 2)} GPA
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateSemester(sem);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Duplicate Semester"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSemester(sem.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Semester"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Accordion Body (Courses List) */}
                {isExpanded && (
                  <div className="p-4 bg-white dark:bg-[#0B132B] border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                            <th className="py-2 px-2">Code</th>
                            <th className="py-2 px-2">Course Name</th>
                            <th className="py-2 px-2">Credits</th>
                            <th className="py-2 px-2">Marks</th>
                            <th className="py-2 px-2">Grade</th>
                            <th className="py-2 px-2">NG</th>
                            <th className="py-2 px-2 text-right">Points</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {sem.courses.map((c, cIdx) => (
                            <tr key={c.id ? `cgpa-course-${c.id}-${cIdx}` : `cgpa-course-${cIdx}`}>
                              <td className="py-2 px-2 font-mono font-bold text-slate-700 dark:text-slate-300">
                                {c.code}
                              </td>
                              <td className="py-2 px-2 text-slate-900 dark:text-white font-medium">
                                {c.title}
                              </td>
                              <td className="py-2 px-2 font-mono text-slate-600">
                                {c.creditHours}
                              </td>
                              <td className="py-2 px-2 font-mono font-bold text-blue-600 dark:text-blue-400">
                                {c.marks ?? '-'}%
                              </td>
                              <td className="py-2 px-2">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {c.letterGrade}
                                </span>
                              </td>
                              <td className="py-2 px-2 font-mono">
                                {safeFixed(c?.numericalGrade, 2)}
                              </td>
                              <td className="py-2 px-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                                {safeFixed(c?.qualityPoints, 2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
