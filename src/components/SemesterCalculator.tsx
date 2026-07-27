import React, { useState } from 'react';
import { Course, Semester, StudentProfile } from '../types';
import {
  calculateCoursePoints,
  calculateSemesterGPA,
  UOH_GRADE_MAP,
  LETTER_GRADES_DEFAULT_NG,
  safeFixed,
} from '../utils/uohGrading';
import {
  Plus,
  Trash2,
  Save,
  RotateCcw,
  BookOpen,
  Calculator,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface SemesterCalculatorProps {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  setActiveTab: (tab: string) => void;
}

export const SemesterCalculator: React.FC<SemesterCalculatorProps> = ({
  profile,
  setProfile,
  setActiveTab,
}) => {
  // Currently active semester being edited
  const [selectedSemId, setSelectedSemId] = useState<string>(
    profile.semesters[0]?.id || 'new-sem'
  );

  const currentSemester = profile.semesters.find((s) => s.id === selectedSemId) || {
    id: `sem-${Date.now()}`,
    number: profile.semesters.length + 1,
    title: `Semester ${profile.semesters.length + 1}`,
    courses: [
      calculateCoursePoints({ code: 'DPT-101', title: 'Anatomy I', creditHours: 3, gradeMode: 'marks', marks: 85 }),
      calculateCoursePoints({ code: 'DPT-101L', title: 'Anatomy I Lab', creditHours: 1, gradeMode: 'marks', marks: 88 }),
      calculateCoursePoints({ code: 'DPT-102', title: 'Physiology I', creditHours: 3, gradeMode: 'marks', marks: 82 }),
    ],
    gpa: 0,
    totalCredits: 0,
    earnedCredits: 0,
    qualityPoints: 0,
    averagePercentage: 0,
  };

  const [courses, setCourses] = useState<Course[]>(currentSemester.courses);
  const [semesterTitle, setSemesterTitle] = useState<string>(currentSemester.title);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // When switching semester tabs
  const handleSelectSemester = (semId: string) => {
    setSelectedSemId(semId);
    const target = profile.semesters.find((s) => s.id === semId);
    if (target) {
      setCourses(target.courses);
      setSemesterTitle(target.title);
    } else {
      setCourses([
        calculateCoursePoints({ code: 'DPT-101', title: 'Anatomy I', creditHours: 3, gradeMode: 'marks', marks: 80 }),
        calculateCoursePoints({ code: 'DPT-102', title: 'Physiology I', creditHours: 3, gradeMode: 'marks', marks: 85 }),
      ]);
      setSemesterTitle(`Semester ${profile.semesters.length + 1}`);
    }
  };

  // Add course row
  const handleAddCourse = () => {
    const newCourse = calculateCoursePoints({
      id: `course-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: `DPT-${courses.length + 1}01`,
      title: '',
      creditHours: 3,
      gradeMode: 'marks',
      marks: 80,
    });
    setCourses((prev) => [...prev, newCourse]);
  };

  // Remove course row
  const handleRemoveCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  // Update course fields
  const handleCourseUpdate = (id: string, updates: Partial<Course>) => {
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          return calculateCoursePoints(updated);
        }
        return c;
      })
    );
  };

  // Calculate current semester live stats
  const liveStats = calculateSemesterGPA(courses);

  // Save / Calculate semester to global profile
  const handleSaveSemester = () => {
    const recalculatedCourses = courses.map((c) => calculateCoursePoints(c));
    setCourses(recalculatedCourses);

    const stats = calculateSemesterGPA(recalculatedCourses);

    const updatedSemester: Semester = {
      id: selectedSemId,
      number: currentSemester.number || profile.semesters.length + 1,
      title: semesterTitle || `Semester ${currentSemester.number}`,
      courses: recalculatedCourses,
      ...stats,
    };

    setProfile((prev) => {
      const exists = prev.semesters.some((s) => s.id === selectedSemId);
      let newSemList: Semester[];
      if (exists) {
        newSemList = prev.semesters.map((s) => (s.id === selectedSemId ? updatedSemester : s));
      } else {
        newSemList = [...prev.semesters, updatedSemester];
      }
      return { ...prev, semesters: newSemList };
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Reset/Clear courses instantly without browser confirm dialog (iframe safety)
  const handleClearCourses = () => {
    setCourses([]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0B132B] p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 mb-2">
            <Calculator className="w-3.5 h-3.5" />
            Official UOH Absolute Grading Engine
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-serif">
            Semester GPA Calculator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter course credit hours and obtained marks (0–100) to calculate your exact Semester GPA.
          </p>
        </div>

        {/* Semester Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {profile.semesters.map((s, idx) => (
            <button
              key={s.id ? `sem-tab-${s.id}-${idx}` : `sem-tab-${idx}`}
              onClick={() => handleSelectSemester(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSemId === s.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50'
              }`}
            >
              {s.title} ({safeFixed(s?.gpa, 2)})
            </button>
          ))}
          <button
            onClick={() => handleSelectSemester(`sem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Semester</span>
          </button>
        </div>
      </div>

      {/* Live GPA Output Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Semester GPA */}
        <div className="bg-gradient-to-br from-blue-900 to-[#0B2545] text-white p-6 rounded-3xl shadow-lg border border-blue-800/50">
          <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
            Semester GPA
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-extrabold font-mono text-white">
              {safeFixed(liveStats?.gpa, 2)}
            </span>
            <span className="text-xs text-blue-300">/ 4.00</span>
          </div>
          <p className="text-xs text-blue-200 mt-2">
            Quality Points: <span className="font-mono font-bold">{liveStats.qualityPoints}</span>
          </p>
        </div>

        {/* Total Credits */}
        <div className="bg-white dark:bg-[#0B132B] p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Semester Credit Hours
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-extrabold font-mono text-slate-900 dark:text-white">
              {liveStats.totalCredits}
            </span>
            <span className="text-xs text-slate-500">Cr. Hrs</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Passed: <span className="font-mono font-bold text-emerald-600">{liveStats.earnedCredits}</span> / {liveStats.totalCredits}
          </p>
        </div>

        {/* Average Percentage */}
        <div className="bg-white dark:bg-[#0B132B] p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Average Score %
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-extrabold font-mono text-slate-900 dark:text-white">
              {liveStats.averagePercentage}%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Weighted across credit hours
          </p>
        </div>

        {/* Actions Box */}
        <div className="bg-white dark:bg-[#0B132B] p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm flex flex-col justify-center gap-2">
          <button
            onClick={handleSaveSemester}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved to Profile!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save / Update Semester</span>
              </>
            )}
          </button>

          <button
            onClick={handleClearCourses}
            className="w-full py-2 px-4 rounded-xl font-semibold text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear All Courses</span>
          </button>
        </div>
      </div>

      {/* Course Entry Table */}
      <div className="bg-white dark:bg-[#0B132B] rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={semesterTitle}
              onChange={(e) => setSemesterTitle(e.target.value)}
              className="text-lg font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Semester Title"
            />
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
              ({courses.length} Courses)
            </span>
          </div>

          <button
            onClick={handleAddCourse}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course Row</span>
          </button>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="py-3.5 px-4 rounded-tl-xl">Course (optional)</th>
                <th className="py-3.5 px-4 w-32">Credits</th>
                <th className="py-3.5 px-4 w-52">Grade (UOH)</th>
                <th className="py-3.5 px-4 w-28 text-center">UOH NG</th>
                <th className="py-3.5 px-4 w-28 text-right">Points</th>
                <th className="py-3.5 px-4 w-16 text-center rounded-tr-xl"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {courses.map((course, index) => (
                <tr
                  key={course.id ? `course-${course.id}-${index}` : `course-${index}`}
                  className="hover:bg-blue-50/40 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Course Title / Name */}
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={course.title}
                      onChange={(e) => handleCourseUpdate(course.id, { title: e.target.value })}
                      placeholder={`Course ${index + 1} (e.g. Math)`}
                      className="w-full px-3 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </td>

                  {/* Credits */}
                  <td className="py-3 px-4">
                    <select
                      value={course.creditHours}
                      onChange={(e) => handleCourseUpdate(course.id, { creditHours: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm font-bold font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((ch) => (
                        <option key={ch} value={ch}>
                          {ch}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Grade Selection */}
                  <td className="py-3 px-4">
                    {course.gradeMode === 'marks' ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0-100"
                          value={course.marks === undefined || course.marks === null || isNaN(course.marks) ? '' : course.marks}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '') {
                              handleCourseUpdate(course.id, { marks: undefined });
                            } else {
                              const parsed = parseFloat(raw);
                              if (isNaN(parsed)) {
                                handleCourseUpdate(course.id, { marks: undefined });
                              } else {
                                handleCourseUpdate(course.id, {
                                  marks: Math.min(100, Math.max(0, parsed)),
                                });
                              }
                            }
                          }}
                          className="w-20 px-2.5 py-2 text-sm font-mono font-bold bg-blue-50/60 dark:bg-slate-800 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 rounded-xl focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs font-bold text-slate-400">%</span>
                        <button
                          type="button"
                          onClick={() => handleCourseUpdate(course.id, { gradeMode: 'letter' })}
                          className="text-[10px] font-bold text-blue-600 hover:underline ml-1"
                        >
                          Letter
                        </button>
                      </div>
                    ) : (
                      <select
                        value={course.letterGrade || 'A'}
                        onChange={(e) => {
                          if (e.target.value === 'MARKS') {
                            handleCourseUpdate(course.id, { gradeMode: 'marks' });
                          } else {
                            handleCourseUpdate(course.id, {
                              gradeMode: 'letter',
                              letterGrade: e.target.value,
                            });
                          }
                        }}
                        className="w-full px-3 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="A">A (4.00 NG - 85%+)</option>
                        <option value="A-">A- (3.70 NG - 80-84%)</option>
                        <option value="B+">B+ (3.25 NG - 75-79%)</option>
                        <option value="B">B (2.88 NG - 71-74%)</option>
                        <option value="B-">B- (2.58 NG - 68-70%)</option>
                        <option value="C+">C+ (2.29 NG - 64-67%)</option>
                        <option value="C">C (2.00 NG - 61-63%)</option>
                        <option value="C-">C- (1.75 NG - 58-60%)</option>
                        <option value="D+">D+ (1.46 NG - 54-57%)</option>
                        <option value="D">D (1.13 NG - 50-53%)</option>
                        <option value="F">F (0.00 NG - Fail)</option>
                        <option value="MARKS">-- Enter Marks % --</option>
                      </select>
                    )}
                  </td>

                  {/* Calculated UOH NG */}
                  <td className="py-3 px-4 text-center font-mono font-extrabold text-slate-900 dark:text-white">
                    {safeFixed(course?.numericalGrade, 2)}
                  </td>

                  {/* Quality Points */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                    {safeFixed(course?.qualityPoints, 2)}
                  </td>

                  {/* Delete Action */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleRemoveCourse(course.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Action Bar matching calculator.net design */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleAddCourse}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ add more courses</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveSemester}
              className={`px-6 py-2.5 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all ${
                saveSuccess
                  ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{saveSuccess ? 'GPA Calculated & Saved!' : 'Calculate GPA'}</span>
            </button>
            <button
              onClick={handleClearCourses}
              className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl transition-colors border border-rose-200 dark:border-rose-900/50"
            >
              Clear
            </button>
          </div>
        </div>

        {courses.length === 0 && (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium">No courses in this semester yet.</p>
            <button
              onClick={handleAddCourse}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Add First Course
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
