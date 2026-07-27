import { Course, Semester, StudentProfile, DetailedGradeMapping, TargetCalculationResult } from '../types';

export function safeFixed(val: any, digits: number = 2): string {
  if (val === null || val === undefined) return (0).toFixed(digits);
  const num = Number(val);
  if (isNaN(num)) return (0).toFixed(digits);
  return num.toFixed(digits);
}

// Detailed lookup map from official UOH Grading Sheet (Revised 2022)
export const UOH_GRADE_MAP: Record<number, { ng: number; letter: string; quality: string }> = {
  0: { ng: 0.00, letter: 'F', quality: 'Fail' },
  // 1 to 49
  ...Array.from({ length: 49 }, (_, i) => i + 1).reduce((acc, marks) => {
    acc[marks] = { ng: 0.00, letter: 'F', quality: 'Fail' };
    return acc;
  }, {} as Record<number, { ng: number; letter: string; quality: string }>),
  
  50: { ng: 1.00, letter: 'D', quality: 'Minimum acceptable' },
  51: { ng: 1.08, letter: 'D', quality: 'Minimum acceptable' },
  52: { ng: 1.17, letter: 'D', quality: 'Minimum acceptable' },
  53: { ng: 1.25, letter: 'D', quality: 'Minimum acceptable' },
  
  54: { ng: 1.33, letter: 'D+', quality: 'Minimum acceptable' },
  55: { ng: 1.42, letter: 'D+', quality: 'Minimum acceptable' },
  56: { ng: 1.50, letter: 'D+', quality: 'Minimum acceptable' },
  57: { ng: 1.58, letter: 'D+', quality: 'Minimum acceptable' },
  
  58: { ng: 1.67, letter: 'C-', quality: 'Adequate' },
  59: { ng: 1.75, letter: 'C-', quality: 'Adequate' },
  60: { ng: 1.83, letter: 'C-', quality: 'Adequate' },
  
  61: { ng: 1.92, letter: 'C', quality: 'Adequate' },
  62: { ng: 2.00, letter: 'C', quality: 'Adequate' },
  63: { ng: 2.08, letter: 'C', quality: 'Adequate' },
  
  64: { ng: 2.17, letter: 'C+', quality: 'Adequate' },
  65: { ng: 2.25, letter: 'C+', quality: 'Adequate' },
  66: { ng: 2.33, letter: 'C+', quality: 'Adequate' },
  67: { ng: 2.42, letter: 'C+', quality: 'Adequate' },
  
  68: { ng: 2.50, letter: 'B-', quality: 'Good' },
  69: { ng: 2.58, letter: 'B-', quality: 'Good' },
  70: { ng: 2.67, letter: 'B-', quality: 'Good' },
  
  71: { ng: 2.75, letter: 'B', quality: 'Good' },
  72: { ng: 2.83, letter: 'B', quality: 'Good' },
  73: { ng: 2.92, letter: 'B', quality: 'Good' },
  74: { ng: 3.00, letter: 'B', quality: 'Good' },
  
  75: { ng: 3.08, letter: 'B+', quality: 'Good' },
  76: { ng: 3.17, letter: 'B+', quality: 'Good' },
  77: { ng: 3.25, letter: 'B+', quality: 'Good' },
  78: { ng: 3.33, letter: 'B+', quality: 'Good' },
  79: { ng: 3.42, letter: 'B+', quality: 'Good' },
  
  80: { ng: 3.50, letter: 'A-', quality: 'Excellent' },
  81: { ng: 3.60, letter: 'A-', quality: 'Excellent' },
  82: { ng: 3.70, letter: 'A-', quality: 'Excellent' },
  83: { ng: 3.80, letter: 'A-', quality: 'Excellent' },
  84: { ng: 3.90, letter: 'A-', quality: 'Excellent' },
  
  ...Array.from({ length: 16 }, (_, i) => i + 85).reduce((acc, marks) => {
    acc[marks] = { ng: 4.00, letter: 'A', quality: 'Excellent' };
    return acc;
  }, {} as Record<number, { ng: number; letter: string; quality: string }>),
};

export const LETTER_GRADES_DEFAULT_NG: Record<string, { ng: number; quality: string; repMarks: number }> = {
  'A': { ng: 4.00, quality: 'Excellent', repMarks: 88 },
  'A-': { ng: 3.70, quality: 'Excellent', repMarks: 82 },
  'B+': { ng: 3.25, quality: 'Good', repMarks: 77 },
  'B': { ng: 2.88, quality: 'Good', repMarks: 73 },
  'B-': { ng: 2.58, quality: 'Good', repMarks: 69 },
  'C+': { ng: 2.29, quality: 'Adequate', repMarks: 65 },
  'C': { ng: 2.00, quality: 'Adequate', repMarks: 62 },
  'C-': { ng: 1.75, quality: 'Adequate', repMarks: 59 },
  'D+': { ng: 1.46, quality: 'Minimum acceptable', repMarks: 55 },
  'D': { ng: 1.13, quality: 'Minimum acceptable', repMarks: 51 },
  'F': { ng: 0.00, quality: 'Fail', repMarks: 40 },
};

export function getGradeDetailsByMarks(marks: number): DetailedGradeMapping {
  const rounded = Math.min(100, Math.max(0, Math.round(marks)));
  const mapped = UOH_GRADE_MAP[rounded] || { ng: 0.00, letter: 'F', quality: 'Fail' };
  return {
    marks: rounded,
    ng: mapped.ng,
    letterGrade: mapped.letter,
    quality: mapped.quality,
  };
}

export function getGradeDetailsByLetter(letter: string) {
  const clean = letter.trim().toUpperCase();
  const info = LETTER_GRADES_DEFAULT_NG[clean] || LETTER_GRADES_DEFAULT_NG['F'];
  return {
    letterGrade: clean,
    ng: info.ng,
    quality: info.quality,
    repMarks: info.repMarks,
  };
}

export function calculateCoursePoints(course: Partial<Course>): Course {
  const creditHours = Math.max(1, Math.min(6, course.creditHours || 3));
  const gradeMode = course.gradeMode || (typeof course.marks === 'number' && !isNaN(course.marks) ? 'marks' : 'letter');

  let ng = 0.00;
  let letterGrade = course.letterGrade || 'A';
  let marks = course.marks;

  if (gradeMode === 'letter') {
    const details = getGradeDetailsByLetter(letterGrade);
    ng = details.ng;
    letterGrade = details.letterGrade;
    if (marks === undefined) {
      marks = details.repMarks;
    }
  } else {
    if (typeof course.marks === 'number' && !isNaN(course.marks)) {
      const markVal = Math.min(100, Math.max(0, Math.round(course.marks)));
      const details = getGradeDetailsByMarks(markVal);
      ng = details.ng;
      letterGrade = details.letterGrade;
      marks = markVal;
    } else {
      ng = 0.00;
      letterGrade = 'F';
      marks = undefined;
    }
  }

  const isPassed = ng > 0.00;
  const qualityPoints = Number((creditHours * ng).toFixed(4));

  return {
    id: course.id || `course-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    code: course.code !== undefined ? course.code : 'DPT-101',
    title: course.title !== undefined ? course.title : '',
    creditHours,
    gradeMode,
    marks,
    letterGrade,
    numericalGrade: ng,
    qualityPoints,
    isPassed,
  };
}

export function calculateSemesterGPA(courses: Course[]): {
  gpa: number;
  totalCredits: number;
  earnedCredits: number;
  qualityPoints: number;
  averagePercentage: number;
} {
  if (!courses || courses.length === 0) {
    return { gpa: 0, totalCredits: 0, earnedCredits: 0, qualityPoints: 0, averagePercentage: 0 };
  }

  let totalCredits = 0;
  let earnedCredits = 0;
  let totalQualityPoints = 0;
  let sumMarks = 0;
  let countMarks = 0;

  courses.forEach((c) => {
    const processed = calculateCoursePoints(c);
    totalCredits += processed.creditHours;
    if (processed.isPassed) {
      earnedCredits += processed.creditHours;
    }
    totalQualityPoints += processed.qualityPoints;
    if (typeof processed.marks === 'number') {
      sumMarks += processed.marks * processed.creditHours;
      countMarks += processed.creditHours;
    }
  });

  const gpa = totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0.00;
  const averagePercentage = countMarks > 0 ? Number((sumMarks / countMarks).toFixed(1)) : 0;

  return {
    gpa,
    totalCredits,
    earnedCredits,
    qualityPoints: Number(totalQualityPoints.toFixed(2)),
    averagePercentage,
  };
}

export function calculateOverallCGPA(semesters: Semester[]): {
  cgpa: number;
  totalCredits: number;
  earnedCredits: number;
  totalQualityPoints: number;
  overallPercentage: number;
} {
  if (!semesters || semesters.length === 0) {
    return { cgpa: 0, totalCredits: 0, earnedCredits: 0, totalQualityPoints: 0, overallPercentage: 0 };
  }

  let totalCredits = 0;
  let earnedCredits = 0;
  let totalQualityPoints = 0;
  let sumMarks = 0;
  let weightedCreditsMarks = 0;

  semesters.forEach((sem) => {
    sem.courses.forEach((c) => {
      const processed = calculateCoursePoints(c);
      totalCredits += processed.creditHours;
      if (processed.isPassed) {
        earnedCredits += processed.creditHours;
      }
      totalQualityPoints += processed.qualityPoints;
      if (typeof processed.marks === 'number') {
        sumMarks += processed.marks * processed.creditHours;
        weightedCreditsMarks += processed.creditHours;
      }
    });
  });

  const cgpa = totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0.00;
  const overallPercentage = weightedCreditsMarks > 0 ? Number((sumMarks / weightedCreditsMarks).toFixed(1)) : 0;

  return {
    cgpa,
    totalCredits,
    earnedCredits,
    totalQualityPoints: Number(totalQualityPoints.toFixed(2)),
    overallPercentage,
  };
}

export function getAcademicStanding(cgpa: number): {
  title: string;
  badgeColor: string;
  description: string;
} {
  if (cgpa >= 3.50) {
    return {
      title: 'First Division with Distinction / High Honors',
      badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      description: 'Gold Medal / Merit Candidate standing. Excellent academic performance across all semesters.',
    };
  } else if (cgpa >= 3.00) {
    return {
      title: 'First Division (Honors)',
      badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
      description: 'Above average academic standard. Eligible for postgraduate scholarships.',
    };
  } else if (cgpa >= 2.50) {
    return {
      title: 'Second Division (Upper)',
      badgeColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
      description: 'Good standing meeting standard degree requirements.',
    };
  } else if (cgpa >= 2.00) {
    return {
      title: 'Second Division (Satisfactory)',
      badgeColor: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30',
      description: 'Minimum required CGPA (2.00) for undergraduate degree award at UOH.',
    };
  } else {
    return {
      title: 'Academic Warning / Probation',
      badgeColor: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30',
      description: 'Below minimum 2.00 threshold. Advisor intervention strongly recommended.',
    };
  }
}

// Profile Mutation Helpers for AI Advisor Direct Academic Record Updates
export function updateCourseInStudentProfile(
  profile: StudentProfile,
  courseQuery: string,
  newMarks?: number,
  newLetter?: string,
  semesterQuery?: string
): { updatedProfile: StudentProfile; changesSummary: string; success: boolean } {
  const query = courseQuery.toLowerCase().trim();
  let found = false;
  let affectedSemTitle = '';
  let updatedCourseTitle = '';

  const newSemesters = profile.semesters.map((sem) => {
    // Check if this semester matches optional semesterQuery
    const semMatches = semesterQuery
      ? sem.title.toLowerCase().includes(semesterQuery.toLowerCase().trim()) ||
        sem.number === parseInt(semesterQuery)
      : true;

    if (!semMatches && found) return sem;

    let courseIndex = -1;
    sem.courses.forEach((c, idx) => {
      const codeMatch = c.code.toLowerCase().includes(query) || query.includes(c.code.toLowerCase());
      const titleMatch = c.title.toLowerCase().includes(query) || query.includes(c.title.toLowerCase());
      if (codeMatch || titleMatch) {
        courseIndex = idx;
      }
    });

    if (courseIndex !== -1 && (!found || semMatches)) {
      found = true;
      affectedSemTitle = sem.title;
      const updatedCourses = [...sem.courses];
      const targetCourse = updatedCourses[courseIndex];
      updatedCourseTitle = targetCourse.title;

      let newCourseData = { ...targetCourse };
      if (typeof newMarks === 'number') {
        newCourseData.gradeMode = 'marks' as const;
        newCourseData.marks = Math.min(100, Math.max(0, newMarks));
      } else if (newLetter) {
        newCourseData.gradeMode = 'letter' as const;
        newCourseData.letterGrade = newLetter.toUpperCase().trim();
      }

      updatedCourses[courseIndex] = calculateCoursePoints(newCourseData);

      const semStats = calculateSemesterGPA(updatedCourses);
      return {
        ...sem,
        courses: updatedCourses,
        gpa: semStats.gpa,
        totalCredits: semStats.totalCredits,
        earnedCredits: semStats.earnedCredits,
        qualityPoints: semStats.qualityPoints,
        averagePercentage: semStats.averagePercentage,
      };
    }
    return sem;
  });

  if (!found) {
    // Course was not found in existing transcript data.
    // Create course automatically in specified or last/first semester.
    let targetSemIdx = newSemesters.length - 1;
    if (semesterQuery) {
      const idx = newSemesters.findIndex(
        (s) =>
          s.title.toLowerCase().includes(semesterQuery.toLowerCase().trim()) ||
          s.number === parseInt(semesterQuery)
      );
      if (idx !== -1) targetSemIdx = idx;
    }
    if (targetSemIdx < 0) targetSemIdx = 0;

    const targetSem = newSemesters[targetSemIdx];

    const newCourseObj = calculateCoursePoints({
      id: `c-ai-${Date.now()}`,
      code: courseQuery.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8) || 'SUBJ-101',
      title: courseQuery.charAt(0).toUpperCase() + courseQuery.slice(1),
      creditHours: 3,
      gradeMode: typeof newMarks === 'number' ? 'marks' : 'letter',
      marks: typeof newMarks === 'number' ? newMarks : 75,
      letterGrade: newLetter || 'B+',
    });

    const updatedCourses = [...targetSem.courses, newCourseObj];
    const semStats = calculateSemesterGPA(updatedCourses);

    newSemesters[targetSemIdx] = {
      ...targetSem,
      courses: updatedCourses,
      gpa: semStats.gpa,
      totalCredits: semStats.totalCredits,
      earnedCredits: semStats.earnedCredits,
      qualityPoints: semStats.qualityPoints,
      averagePercentage: semStats.averagePercentage,
    };

    affectedSemTitle = targetSem.title;
    updatedCourseTitle = newCourseObj.title;
  }

  const overall = calculateOverallCGPA(newSemesters);
  const updatedProfile: StudentProfile = {
    ...profile,
    semesters: newSemesters,
  };

  const changesSummary = `Updated course **${updatedCourseTitle}** in **${affectedSemTitle}**. Recalculated Semester GPA and Overall Cumulative CGPA to **${safeFixed(overall?.cgpa, 2)}**.`;

  return { updatedProfile, changesSummary, success: true };
}

export function updateSemesterGpaInStudentProfile(
  profile: StudentProfile,
  semesterQuery: string | number,
  newGPA: number
): { updatedProfile: StudentProfile; changesSummary: string; success: boolean } {
  const targetGpa = Math.min(4.00, Math.max(0, newGPA));
  const queryStr = String(semesterQuery).toLowerCase().trim();
  let found = false;
  let oldGpaVal = 0;
  let semTitleStr = '';

  const newSemesters = profile.semesters.map((sem) => {
    const isNumMatch = sem.number === parseInt(queryStr);
    const isTitleMatch =
      sem.title.toLowerCase().includes(queryStr) ||
      queryStr.includes(`semester ${sem.number}`) ||
      queryStr.includes(`sem ${sem.number}`) ||
      queryStr === `s${sem.number}` ||
      queryStr === `${sem.number}`;

    if (isNumMatch || isTitleMatch) {
      found = true;
      oldGpaVal = sem.gpa;
      semTitleStr = sem.title;

      // Adjust courses in this semester to reflect the new GPA proportionally
      const updatedCourses = sem.courses.map((c) => {
        const adjustedCourse = calculateCoursePoints({
          ...c,
          gradeMode: 'ng' as const,
          numericalGrade: targetGpa,
        });
        return adjustedCourse;
      });

      const semStats = calculateSemesterGPA(updatedCourses);

      return {
        ...sem,
        gpa: targetGpa,
        qualityPoints: Number((targetGpa * sem.totalCredits).toFixed(2)),
        courses: updatedCourses.length > 0 ? updatedCourses : sem.courses,
        averagePercentage: semStats.averagePercentage,
      };
    }
    return sem;
  });

  if (!found) {
    // Semester does not exist yet; create it!
    const newSemNum = parseInt(queryStr) || newSemesters.length + 1;
    const semTitle = `Semester ${newSemNum}`;
    semTitleStr = semTitle;
    oldGpaVal = 0;

    const dummyCourse = calculateCoursePoints({
      id: `c-auto-${Date.now()}`,
      code: `SEM-${newSemNum}`,
      title: `General Course ${newSemNum}`,
      creditHours: 15,
      gradeMode: 'ng',
      numericalGrade: targetGpa,
    });

    const semStats = calculateSemesterGPA([dummyCourse]);

    newSemesters.push({
      id: `sem-${Date.now()}`,
      number: newSemNum,
      title: semTitle,
      gpa: targetGpa,
      totalCredits: 15,
      earnedCredits: targetGpa > 0 ? 15 : 0,
      qualityPoints: Number((targetGpa * 15).toFixed(2)),
      averagePercentage: semStats.averagePercentage,
      courses: [dummyCourse],
    });
  }

  const overall = calculateOverallCGPA(newSemesters);
  const updatedProfile: StudentProfile = {
    ...profile,
    semesters: newSemesters,
  };

  const changesSummary = `Updated **${semTitleStr}** GPA from **${safeFixed(oldGpaVal, 2)}** to **${safeFixed(targetGpa, 2)}**. Overall Cumulative CGPA recalculated to **${safeFixed(overall?.cgpa, 2)}**.`;

  return { updatedProfile, changesSummary, success: true };
}

export function addCourseToStudentProfile(
  profile: StudentProfile,
  semesterQuery: string | number,
  courseTitle: string,
  marks: number = 75,
  creditHours: number = 3,
  code?: string
): { updatedProfile: StudentProfile; changesSummary: string; success: boolean } {
  const queryStr = String(semesterQuery).toLowerCase().trim();

  let targetSemIdx = profile.semesters.findIndex((sem) => {
    return (
      sem.number === parseInt(queryStr) ||
      sem.title.toLowerCase().includes(queryStr) ||
      queryStr.includes(`semester ${sem.number}`) ||
      queryStr.includes(`sem ${sem.number}`)
    );
  });

  const newSemesters = [...profile.semesters];

  if (targetSemIdx === -1) {
    targetSemIdx = newSemesters.length - 1 >= 0 ? newSemesters.length - 1 : 0;
  }

  const targetSem = newSemesters[targetSemIdx] || {
    id: 'sem-1',
    number: 1,
    title: 'Semester 1',
    gpa: 0,
    totalCredits: 0,
    earnedCredits: 0,
    qualityPoints: 0,
    averagePercentage: 0,
    courses: [],
  };

  const newCourse = calculateCoursePoints({
    id: `course-${Date.now()}`,
    code: code || `SUBJ-${Math.floor(Math.random() * 800 + 100)}`,
    title: courseTitle,
    creditHours: Math.max(1, creditHours),
    gradeMode: 'marks',
    marks: Math.min(100, Math.max(0, marks)),
  });

  const updatedCourses = [...targetSem.courses, newCourse];
  const semStats = calculateSemesterGPA(updatedCourses);

  newSemesters[targetSemIdx] = {
    ...targetSem,
    courses: updatedCourses,
    gpa: semStats.gpa,
    totalCredits: semStats.totalCredits,
    earnedCredits: semStats.earnedCredits,
    qualityPoints: semStats.qualityPoints,
    averagePercentage: semStats.averagePercentage,
  };

  const overall = calculateOverallCGPA(newSemesters);
  const updatedProfile: StudentProfile = {
    ...profile,
    semesters: newSemesters,
  };

  const changesSummary = `Added **${newCourse.title}** (${newCourse.marks}% marks, ${newCourse.letterGrade}) to **${targetSem.title}**. Recalculated Semester GPA to **${safeFixed(semStats?.gpa, 2)}** and overall CGPA to **${safeFixed(overall?.cgpa, 2)}**.`;

  return { updatedProfile, changesSummary, success: true };
}

export function deleteCourseFromStudentProfile(
  profile: StudentProfile,
  courseQuery: string
): { updatedProfile: StudentProfile; changesSummary: string; success: boolean } {
  const query = courseQuery.toLowerCase().trim();
  let deleted = false;
  let deletedTitle = '';

  const newSemesters = profile.semesters.map((sem) => {
    const originalLength = sem.courses.length;
    const updatedCourses = sem.courses.filter((c) => {
      const match = c.code.toLowerCase().includes(query) || c.title.toLowerCase().includes(query);
      if (match && !deleted) {
        deleted = true;
        deletedTitle = c.title;
        return false;
      }
      return true;
    });

    if (updatedCourses.length !== originalLength) {
      const semStats = calculateSemesterGPA(updatedCourses);
      return {
        ...sem,
        courses: updatedCourses,
        gpa: semStats.gpa,
        totalCredits: semStats.totalCredits,
        earnedCredits: semStats.earnedCredits,
        qualityPoints: semStats.qualityPoints,
        averagePercentage: semStats.averagePercentage,
      };
    }
    return sem;
  });

  const overall = calculateOverallCGPA(newSemesters);
  const updatedProfile: StudentProfile = {
    ...profile,
    semesters: newSemesters,
  };

  const changesSummary = deleted
    ? `Deleted **${deletedTitle}** from student record. Recalculated overall CGPA to **${safeFixed(overall?.cgpa, 2)}**.`
    : `Course matching "${courseQuery}" was not found in the transcript.`;

  return { updatedProfile, changesSummary, success: deleted };
}

export function updateTargetCgpaInStudentProfile(
  profile: StudentProfile,
  newTargetCGPA: number
): { updatedProfile: StudentProfile; changesSummary: string; success: boolean } {
  const target = Math.min(4.00, Math.max(0, newTargetCGPA));
  const updatedProfile: StudentProfile = {
    ...profile,
    targetCGPA: target,
  };

  return {
    updatedProfile,
    changesSummary: `Updated target CGPA goal to **${safeFixed(target, 2)}**.`,
    success: true,
  };
}

export function calculateTargetFutureGPA(
  currentCGPA: number,
  completedCredits: number,
  targetCGPA: number,
  remainingCredits: number
): TargetCalculationResult {
  const currentQualityPoints = currentCGPA * completedCredits;
  const totalTargetCredits = completedCredits + remainingCredits;
  const requiredTotalQualityPoints = targetCGPA * totalTargetCredits;
  const requiredFuturePoints = requiredTotalQualityPoints - currentQualityPoints;

  if (remainingCredits <= 0) {
    return {
      targetCGPA,
      currentCGPA,
      completedCredits,
      remainingCredits,
      requiredFutureGPA: 0,
      isAchievable: false,
      statusMessage: 'Remaining credit hours must be greater than 0.',
    };
  }

  const rawGpa = requiredFuturePoints / remainingCredits;
  const requiredFutureGPA = Number(safeFixed(rawGpa, 2));

  if (requiredFutureGPA <= 0) {
    return {
      targetCGPA,
      currentCGPA,
      completedCredits,
      remainingCredits,
      requiredFutureGPA: 0.0,
      isAchievable: true,
      statusMessage: 'You have already achieved your target CGPA!',
    };
  } else if (requiredFutureGPA > 4.00) {
    return {
      targetCGPA,
      currentCGPA,
      completedCredits,
      remainingCredits,
      requiredFutureGPA,
      isAchievable: false,
      statusMessage: `Unachievable (Requires ${requiredFutureGPA} GPA, maximum possible is 4.00). Consider increasing remaining credits or adjusting target.`,
    };
  } else {
    return {
      targetCGPA,
      currentCGPA,
      completedCredits,
      remainingCredits,
      requiredFutureGPA,
      isAchievable: true,
      statusMessage: `Achievable! You need an average GPA of ${requiredFutureGPA} across your remaining ${remainingCredits} credit hours (~${Math.ceil(remainingCredits / 18)} semesters).`,
    };
  }
}

// Sample UOH Doctor of Physical Therapy (DPT 2022-2027) Initial Profile
export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  name: 'Zain ul Abidin',
  rollNumber: 'F22-1575',
  department: 'Department of Allied Health Sciences',
  degreeProgram: 'DPT 2022-2027',
  targetCGPA: 3.60,
  totalDegreeCredits: 162,
  semesters: [
    {
      id: 'sem-1',
      number: 1,
      title: 'Semester 1 (Fall 2022)',
      gpa: 3.52,
      totalCredits: 17,
      earnedCredits: 17,
      qualityPoints: 59.84,
      averagePercentage: 81.2,
      courses: [
        calculateCoursePoints({ id: 'c1-1', code: 'DPT-101', title: 'Anatomy I', creditHours: 3, gradeMode: 'marks', marks: 86 }),
        calculateCoursePoints({ id: 'c1-2', code: 'DPT-101L', title: 'Anatomy I Lab', creditHours: 1, gradeMode: 'marks', marks: 88 }),
        calculateCoursePoints({ id: 'c1-3', code: 'DPT-102', title: 'Physiology I', creditHours: 3, gradeMode: 'marks', marks: 82 }),
        calculateCoursePoints({ id: 'c1-4', code: 'DPT-102L', title: 'Physiology I Lab', creditHours: 1, gradeMode: 'marks', marks: 85 }),
        calculateCoursePoints({ id: 'c1-5', code: 'DPT-103', title: 'Kinesiology I', creditHours: 3, gradeMode: 'marks', marks: 84 }),
        calculateCoursePoints({ id: 'c1-6', code: 'ENG-101', title: 'Functional English', creditHours: 3, gradeMode: 'marks', marks: 82 }),
        calculateCoursePoints({ id: 'c1-7', code: 'ISL-101', title: 'Islamic Studies / Ethics', creditHours: 3, gradeMode: 'marks', marks: 85 }),
      ],
    },
    {
      id: 'sem-2',
      number: 2,
      title: 'Semester 2 (Spring 2023)',
      gpa: 3.68,
      totalCredits: 17,
      earnedCredits: 17,
      qualityPoints: 62.56,
      averagePercentage: 83.5,
      courses: [
        calculateCoursePoints({ id: 'c2-1', code: 'DPT-104', title: 'Anatomy II', creditHours: 3, gradeMode: 'marks', marks: 87 }),
        calculateCoursePoints({ id: 'c2-2', code: 'DPT-104L', title: 'Anatomy II Lab', creditHours: 1, gradeMode: 'marks', marks: 90 }),
        calculateCoursePoints({ id: 'c2-3', code: 'DPT-105', title: 'Physiology II', creditHours: 3, gradeMode: 'marks', marks: 84 }),
        calculateCoursePoints({ id: 'c2-4', code: 'DPT-105L', title: 'Physiology II Lab', creditHours: 1, gradeMode: 'marks', marks: 88 }),
        calculateCoursePoints({ id: 'c2-5', code: 'DPT-106', title: 'Kinesiology II', creditHours: 3, gradeMode: 'marks', marks: 82 }),
        calculateCoursePoints({ id: 'c2-6', code: 'ENG-102', title: 'Communication Skills', creditHours: 3, gradeMode: 'marks', marks: 86 }),
        calculateCoursePoints({ id: 'c2-7', code: 'PAK-101', title: 'Pakistan Studies', creditHours: 3, gradeMode: 'marks', marks: 83 }),
      ],
    },
    {
      id: 'sem-3',
      number: 3,
      title: 'Semester 3 (Fall 2023)',
      gpa: 3.75,
      totalCredits: 17,
      earnedCredits: 17,
      qualityPoints: 63.75,
      averagePercentage: 84.8,
      courses: [
        calculateCoursePoints({ id: 'c3-1', code: 'DPT-201', title: 'Biomechanics & Ergonomics I', creditHours: 3, gradeMode: 'marks', marks: 88 }),
        calculateCoursePoints({ id: 'c3-2', code: 'DPT-202', title: 'Biochemistry I', creditHours: 3, gradeMode: 'marks', marks: 83 }),
        calculateCoursePoints({ id: 'c3-3', code: 'DPT-203', title: 'Exercise Physiology', creditHours: 3, gradeMode: 'marks', marks: 85 }),
        calculateCoursePoints({ id: 'c3-4', code: 'DPT-204', title: 'Pathology & Microbiology I', creditHours: 3, gradeMode: 'marks', marks: 87 }),
        calculateCoursePoints({ id: 'c3-5', code: 'DPT-205', title: 'Electrotherapy I', creditHours: 3, gradeMode: 'marks', marks: 84 }),
        calculateCoursePoints({ id: 'c3-6', code: 'SOC-101', title: 'Sociology & Health', creditHours: 2, gradeMode: 'marks', marks: 80 }),
      ],
    },
    {
      id: 'sem-4',
      number: 4,
      title: 'Semester 4 (Spring 2024)',
      gpa: 3.61,
      totalCredits: 17,
      earnedCredits: 17,
      qualityPoints: 61.37,
      averagePercentage: 82.1,
      courses: [
        calculateCoursePoints({ id: 'c4-1', code: 'DPT-206', title: 'Physical Therapy Assessment', creditHours: 3, gradeMode: 'marks', marks: 85 }),
        calculateCoursePoints({ id: 'c4-2', code: 'DPT-207', title: 'Biomechanics II', creditHours: 3, gradeMode: 'marks', marks: 82 }),
        calculateCoursePoints({ id: 'c4-3', code: 'DPT-208', title: 'Pharmacology in PT', creditHours: 3, gradeMode: 'marks', marks: 79 }),
        calculateCoursePoints({ id: 'c4-4', code: 'DPT-209', title: 'Pathology & Microbiology II', creditHours: 3, gradeMode: 'marks', marks: 86 }),
        calculateCoursePoints({ id: 'c4-5', code: 'DPT-210', title: 'Electrotherapy II', creditHours: 3, gradeMode: 'marks', marks: 88 }),
        calculateCoursePoints({ id: 'c4-6', code: 'PSY-101', title: 'Behavioral Sciences', creditHours: 2, gradeMode: 'marks', marks: 84 }),
      ],
    },
  ],
};

export function sanitizeProfile(profile: any): StudentProfile {
  if (!profile || typeof profile !== 'object') return DEFAULT_STUDENT_PROFILE;

  const isLegacyCS = JSON.stringify(profile).includes('CS-101') ||
    JSON.stringify(profile).includes('Programming') ||
    JSON.stringify(profile).includes('Calculus') ||
    JSON.stringify(profile).includes('Applied Physics');

  if (isLegacyCS) {
    return DEFAULT_STUDENT_PROFILE;
  }

  const seenSemIds = new Set<string>();

  const semesters = Array.isArray(profile.semesters) ? profile.semesters.map((sem: any, idx: number) => {
    let semId = sem?.id;
    if (!semId || seenSemIds.has(semId)) {
      semId = `sem-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
    }
    seenSemIds.add(semId);

    const seenCourseIds = new Set<string>();
    const courses = Array.isArray(sem?.courses) ? sem.courses.map((c: any, cIdx: number) => {
      let courseId = c?.id;
      if (!courseId || seenCourseIds.has(courseId)) {
        courseId = `c-${Date.now()}-${idx}-${cIdx}-${Math.random().toString(36).substring(2, 7)}`;
      }
      seenCourseIds.add(courseId);

      const processed = calculateCoursePoints({
        ...c,
        creditHours: typeof c?.creditHours === 'number' ? c.creditHours : 3,
        marks: typeof c?.marks === 'number' ? c.marks : undefined,
        numericalGrade: typeof c?.numericalGrade === 'number' ? c.numericalGrade : undefined,
      });
      return {
        ...c,
        id: courseId,
        code: c?.code || processed.code,
        title: c?.title || processed.title,
        creditHours: processed.creditHours,
        gradeMode: c?.gradeMode || processed.gradeMode,
        marks: processed.marks,
        letterGrade: processed.letterGrade,
        numericalGrade: processed.numericalGrade,
        qualityPoints: processed.qualityPoints,
        isPassed: processed.isPassed,
      };
    }) : [];

    let semTitle = sem?.title || `Semester ${idx + 1}`;
    if (semTitle === 'Semester 1 (Fall 2023)') semTitle = 'Semester 1 (Fall 2022)';
    if (semTitle === 'Semester 2 (Spring 2024)') semTitle = 'Semester 2 (Spring 2023)';
    if (semTitle === 'Semester 3 (Fall 2024)') semTitle = 'Semester 3 (Fall 2023)';
    if (semTitle === 'Semester 4 (Spring 2025)') semTitle = 'Semester 4 (Spring 2024)';

    const stats = calculateSemesterGPA(courses);
    return {
      ...sem,
      id: semId,
      number: typeof sem?.number === 'number' ? sem.number : idx + 1,
      title: semTitle,
      courses,
      gpa: stats.gpa,
      totalCredits: stats.totalCredits,
      earnedCredits: stats.earnedCredits,
      qualityPoints: stats.qualityPoints,
      averagePercentage: stats.averagePercentage,
    };
  }) : DEFAULT_STUDENT_PROFILE.semesters;

  const rollNumber = profile.rollNumber || DEFAULT_STUDENT_PROFILE.rollNumber;
  const degreeProgram = profile.degreeProgram || DEFAULT_STUDENT_PROFILE.degreeProgram;
  const department = profile.department || DEFAULT_STUDENT_PROFILE.department;

  return {
    name: profile.name || DEFAULT_STUDENT_PROFILE.name,
    rollNumber,
    department,
    degreeProgram,
    targetCGPA: typeof profile.targetCGPA === 'number' && !isNaN(profile.targetCGPA) ? profile.targetCGPA : 3.60,
    totalDegreeCredits:
      typeof profile.totalDegreeCredits === 'number' && !isNaN(profile.totalDegreeCredits) && profile.totalDegreeCredits > 0
        ? profile.totalDegreeCredits
        : 162,
    semesters,
  };
}
