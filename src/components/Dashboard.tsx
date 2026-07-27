import React, { useEffect } from 'react';
import { StudentProfile } from '../types';
import {
  calculateOverallCGPA,
  getAcademicStanding,
  calculateTargetFutureGPA,
  safeFixed,
} from '../utils/uohGrading';
import {
  GraduationCap,
  Award,
  BookOpen,
  TrendingUp,
  Sparkles,
  Calculator,
  Plus,
  FileText,
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import confetti from 'canvas-confetti';

interface DashboardProps {
  profile: StudentProfile;
  setActiveTab: (tab: string) => void;
  onOpenTargetModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  setActiveTab,
  onOpenTargetModal,
}) => {
  const overall = calculateOverallCGPA(profile.semesters);
  const standing = getAcademicStanding(overall.cgpa);

  // Trigger celebration confetti for high CGPA
  useEffect(() => {
    if (overall.cgpa >= 3.50 && typeof window !== 'undefined') {
      try {
        const fireConfetti = confetti.create(undefined, {
          resize: true,
          useWorker: false,
        });
        fireConfetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.2 },
          colors: ['#001F3F', '#3B82F6', '#F59E0B', '#10B981'],
        });
      } catch (err) {
        console.warn('Confetti animation skipped:', err);
      }
    }
  }, [overall.cgpa]);

  // Data for Recharts Line Chart (Semester GPA Trend)
  const lineChartData = profile.semesters.map((sem) => ({
    name: `Sem ${sem.number}`,
    GPA: sem.gpa,
    Target: profile.targetCGPA,
    Credits: sem.totalCredits,
  }));

  // Data for Grade Distribution Pie Chart
  const gradeCounts: Record<string, number> = {};
  let totalCourseCount = 0;

  profile.semesters.forEach((sem) => {
    sem.courses.forEach((c) => {
      totalCourseCount++;
      const letter = c.letterGrade || 'F';
      gradeCounts[letter] = (gradeCounts[letter] || 0) + 1;
    });
  });

  const PIE_COLORS: Record<string, string> = {
    'A': '#10B981',
    'A-': '#059669',
    'B+': '#3B82F6',
    'B': '#2563EB',
    'B-': '#1D4ED8',
    'C+': '#F59E0B',
    'C': '#D97706',
    'C-': '#B45309',
    'D+': '#F97316',
    'D': '#EA580C',
    'F': '#EF4444',
  };

  const pieChartData = Object.keys(gradeCounts).map((grade) => ({
    name: grade,
    value: gradeCounts[grade],
    color: PIE_COLORS[grade] || '#64748B',
  }));

  // Target calculation
  const remainingCredits = Math.max(0, profile.totalDegreeCredits - overall.earnedCredits);
  const targetCalc = calculateTargetFutureGPA(
    overall.cgpa,
    overall.earnedCredits,
    profile.targetCGPA,
    remainingCredits
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome & Student Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#001F3F] via-[#0B2545] to-[#134074] text-white p-6 sm:p-8 shadow-xl border border-blue-900/50">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>University of Haripur Student Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-white">
              Welcome, {profile.name}
            </h1>
            <p className="text-sm text-blue-200 flex flex-wrap items-center gap-2">
              <span>{profile.degreeProgram}</span>
              <span>•</span>
              <span className="font-mono text-amber-300">{profile.rollNumber}</span>
              <span>•</span>
              <span>{profile.department}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('advisor')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm shadow-lg hover:from-amber-300 hover:to-amber-400 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Ask AI Advisor</span>
            </button>
            <button
              onClick={() => setActiveTab('semester')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Semester</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CGPA Card */}
        <div className="bg-white dark:bg-[#0B132B] p-6 rounded-2xl border border-blue-100 dark:border-blue-900/40 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Cumulative CGPA
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
              {safeFixed(overall?.cgpa, 2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/ 4.00</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Quality Points:</span>
            <span className="font-semibold font-mono text-blue-600 dark:text-blue-400">
              {safeFixed(overall?.totalQualityPoints, 2)}
            </span>
          </div>
        </div>

        {/* Total Credits Card */}
        <div className="bg-white dark:bg-[#0B132B] p-6 rounded-2xl border border-blue-100 dark:border-blue-900/40 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Credit Hours Progress
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
              {overall.earnedCredits}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {profile.totalDegreeCredits} hrs
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (overall.earnedCredits / profile.totalDegreeCredits) * 100)}%`,
                }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 text-right">
              {safeFixed(profile?.totalDegreeCredits ? ((overall?.earnedCredits || 0) / profile.totalDegreeCredits) * 100 : 0, 1)}% Completed
            </p>
          </div>
        </div>

        {/* Academic Standing Card */}
        <div className="bg-white dark:bg-[#0B132B] p-6 rounded-2xl border border-blue-100 dark:border-blue-900/40 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              UOH Academic Standing
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span
              className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${standing.badgeColor}`}
            >
              {standing.title}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pt-1">
              {standing.description}
            </p>
          </div>
        </div>

        {/* Target CGPA Card */}
        <div
          onClick={onOpenTargetModal}
          className="bg-white dark:bg-[#0B132B] p-6 rounded-2xl border border-blue-100 dark:border-blue-900/40 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-blue-400"
        >
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Target CGPA Goal
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
              {safeFixed(profile?.targetCGPA, 2)}
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
              <span>Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            {targetCalc.isAchievable ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Req: {targetCalc.requiredFutureGPA} GPA</span>
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Adjust Target</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Semester GPA Progress Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0B132B] p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Semester GPA Progression Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Performance curve vs Target CGPA ({profile.targetCGPA})
              </p>
            </div>
            <button
              onClick={() => setActiveTab('semester')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Semesters</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {lineChartData.length > 0 ? (
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, 4.0]} stroke="#888888" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B132B',
                      borderColor: '#134074',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="GPA"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Target"
                    stroke="#F59E0B"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
              <BookOpen className="w-12 h-12 mb-2 text-slate-300" />
              <p className="text-sm font-medium">No semester data added yet.</p>
              <button
                onClick={() => setActiveTab('semester')}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
              >
                Add Your First Semester
              </button>
            </div>
          )}
        </div>

        {/* Grade Distribution Pie Chart */}
        <div className="bg-white dark:bg-[#0B132B] p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif mb-1">
              Grade Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Breakdown across {totalCourseCount} courses
            </p>
          </div>

          {pieChartData.length > 0 ? (
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`pie-cell-${entry.name || index}-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B132B',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-slate-400 text-xs">
              No grades recorded.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            {pieChartData.map((p, idx) => (
              <div key={`pie-legend-${p.name || idx}-${idx}`} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {p.name}: {p.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-blue-900/10 p-6 rounded-3xl border border-blue-200 dark:border-blue-800/40">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          Academic Tools & Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('semester')}
            className="p-4 rounded-2xl bg-white dark:bg-[#0B132B] border border-blue-100 dark:border-blue-900/50 hover:border-blue-500 shadow-xs hover:shadow-md transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Semester GPA
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add, edit & calculate semester subjects
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('advisor')}
            className="p-4 rounded-2xl bg-white dark:bg-[#0B132B] border border-blue-100 dark:border-blue-900/50 hover:border-amber-500 shadow-xs hover:shadow-md transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                AI Academic Advisor
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalized study advice & mark estimates
              </p>
            </div>
          </button>

          <button
            onClick={onOpenTargetModal}
            className="p-4 rounded-2xl bg-white dark:bg-[#0B132B] border border-blue-100 dark:border-blue-900/50 hover:border-purple-500 shadow-xs hover:shadow-md transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Target CGPA Planner
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculate future GPA required
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('transcript')}
            className="p-4 rounded-2xl bg-white dark:bg-[#0B132B] border border-blue-100 dark:border-blue-900/50 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Export Transcript PDF
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate official UOH grade report
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Semester History Summary Table */}
      <div className="bg-white dark:bg-[#0B132B] rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
              Saved Semester History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              UOH Semester-wise academic record
            </p>
          </div>
          <button
            onClick={() => setActiveTab('cgpa')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Full CGPA Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-3 px-6">Semester</th>
                <th className="py-3 px-6">Courses</th>
                <th className="py-3 px-6">Credit Hours</th>
                <th className="py-3 px-6">Quality Points</th>
                <th className="py-3 px-6">Avg Marks %</th>
                <th className="py-3 px-6 text-right">Semester GPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {profile.semesters.map((sem, idx) => (
                <tr key={sem.id ? `dash-sem-${sem.id}-${idx}` : `dash-sem-${idx}`} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                    {sem.title}
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                    {sem.courses.length} Subjects
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono">
                    {sem.totalCredits} Cr. Hrs
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono">
                    {safeFixed(sem?.qualityPoints, 2)}
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono">
                    {sem.averagePercentage}%
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-xl text-xs font-bold font-mono ${
                        (sem?.gpa || 0) >= 3.5
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : (sem?.gpa || 0) >= 3.0
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {safeFixed(sem?.gpa, 2)} GPA
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
