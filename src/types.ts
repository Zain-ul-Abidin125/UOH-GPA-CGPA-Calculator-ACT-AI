export type GradeMode = 'marks' | 'letter' | 'ng';

export interface Course {
  id: string;
  code: string;
  title: string;
  creditHours: number;
  gradeMode: GradeMode;
  marks?: number;
  letterGrade?: string;
  numericalGrade: number;
  qualityPoints: number;
  isPassed: boolean;
}

export interface Semester {
  id: string;
  number: number;
  title: string;
  courses: Course[];
  gpa: number;
  totalCredits: number;
  earnedCredits: number;
  qualityPoints: number;
  averagePercentage: number;
}

export interface StudentProfile {
  name: string;
  rollNumber: string;
  department: string;
  degreeProgram: string;
  targetCGPA: number;
  totalDegreeCredits: number;
  semesters: Semester[];
}

export interface DetailedGradeMapping {
  marks: number;
  ng: number;
  letterGrade: string;
  quality: string;
}

export interface AdvisorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface TargetCalculationResult {
  targetCGPA: number;
  currentCGPA: number;
  completedCredits: number;
  remainingCredits: number;
  requiredFutureGPA: number;
  isAchievable: boolean;
  statusMessage: string;
}
