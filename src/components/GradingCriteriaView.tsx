import React, { useState } from 'react';
import { UOH_GRADE_MAP, safeFixed } from '../utils/uohGrading';
import { BookOpen, Search, Info, CheckCircle, ShieldCheck } from 'lucide-react';

export const GradingCriteriaView: React.FC = () => {
  const [searchMark, setSearchMark] = useState<string>('');

  const table1Data = [
    { range: '85 - 100', ng: '4.00', letter: 'A', quality: 'Excellent' },
    { range: '80 - 84', ng: '3.50 - 3.90', letter: 'A-', quality: 'Excellent' },
    { range: '75 - 79', ng: '3.08 - 3.42', letter: 'B+', quality: 'Good' },
    { range: '71 - 74', ng: '2.75 - 3.00', letter: 'B', quality: 'Good' },
    { range: '68 - 70', ng: '2.50 - 2.67', letter: 'B-', quality: 'Good' },
    { range: '64 - 67', ng: '2.17 - 2.42', letter: 'C+', quality: 'Adequate' },
    { range: '61 - 63', ng: '1.92 - 2.08', letter: 'C', quality: 'Adequate' },
    { range: '58 - 60', ng: '1.67 - 1.83', letter: 'C-', quality: 'Adequate' },
    { range: '54 - 57', ng: '1.33 - 1.58', letter: 'D+', quality: 'Minimum acceptable' },
    { range: '50 - 53', ng: '1.00 - 1.25', letter: 'D', quality: 'Minimum acceptable' },
    { range: '0 - 49', ng: '0.00', letter: 'F', quality: 'Fail' },
  ];

  // Table 2 detailed marks array 50 to 85
  const detailedMarksList = Array.from({ length: 36 }, (_, i) => 50 + i);

  const searchedMarkVal = Number(searchMark);
  const searchResult =
    searchMark !== '' && !isNaN(searchedMarkVal)
      ? UOH_GRADE_MAP[Math.min(100, Math.max(0, Math.round(searchedMarkVal)))]
      : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0B132B] p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          Official Revised Regulations 2022
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-serif">
          THE UNIVERSITY OF HARIPUR SEMESTER RULES AND REGULATIONS
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          (Revised - 2022) • Section 23.6 Policy of Absolute Grading System for Undergraduate Academic Programs
        </p>
      </div>

      {/* Quick Lookup Widget */}
      <div className="bg-gradient-to-r from-blue-900 via-[#0B2545] to-blue-900 text-white p-6 rounded-3xl shadow-lg space-y-4">
        <h3 className="text-base font-bold font-serif flex items-center gap-2">
          <Search className="w-4 h-4 text-amber-400" />
          Instant Percentage Mark to Grade & NG Lookup
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="number"
            min="0"
            max="100"
            value={searchMark}
            onChange={(e) => setSearchMark(e.target.value)}
            placeholder="Enter Percentage Marks (e.g., 76)"
            className="w-full sm:w-80 px-4 py-2.5 text-sm font-bold font-mono bg-white/10 text-white placeholder-blue-200 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

          {searchResult && (
            <div className="flex items-center gap-4 bg-white/15 px-4 py-2 rounded-xl text-xs font-semibold border border-white/20">
              <div>
                <span className="text-blue-200 block text-[10px]">Percentage:</span>
                <span className="font-mono text-sm text-white">{Math.round(searchedMarkVal)}%</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div>
                <span className="text-blue-200 block text-[10px]">Numerical Grade:</span>
                <span className="font-mono text-sm text-amber-300 font-bold">{safeFixed(searchResult?.ng, 2)}</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div>
                <span className="text-blue-200 block text-[10px]">Letter Grade:</span>
                <span className="font-bold text-sm text-emerald-300">{searchResult.letter}</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div>
                <span className="text-blue-200 block text-[10px]">Performance:</span>
                <span className="text-xs text-white">{searchResult.quality}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table 1: Summary Grading Sheet */}
      <div className="bg-white dark:bg-[#0B132B] rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
          Table 1: The University of Haripur Grading Sheet
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4">Percentage Marks</th>
                <th className="py-3 px-4">Numerical Grade Range (NG)</th>
                <th className="py-3 px-4">Letter Grade</th>
                <th className="py-3 px-4">Quality of Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {table1Data.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {row.range}%
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {row.ng}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 font-extrabold text-blue-800 dark:text-blue-300 text-xs">
                      {row.letter}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {row.quality}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500 italic pt-2">
          *Note: Fraction is to be rounded as a whole according to UOH official guidelines.
        </p>
      </div>

      {/* Table 2: Detailed Mark-by-Mark Mapping */}
      <div className="bg-white dark:bg-[#0B132B] rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
          Table 2: Detailed Numerical Grades (NG) and Corresponding Percentages
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {detailedMarksList.map((mark) => {
            const details = UOH_GRADE_MAP[mark];
            return (
              <div
                key={mark}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div className="font-mono font-bold text-slate-900 dark:text-white">
                  Score: <span className="text-blue-600">{mark}%</span>
                </div>
                <div className="font-mono font-extrabold text-amber-600 dark:text-amber-400">
                  NG: {safeFixed(details?.ng, 2)}
                </div>
                <div className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[11px]">
                  Grade {details.letter}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
