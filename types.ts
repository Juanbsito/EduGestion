
export enum EducationLevel {
  INITIAL = 'Inicial',
  PRIMARY = 'Primaria',
  SECONDARY = 'Secundaria',
  TERTIARY = 'Terciaria'
}

export interface Career {
  id: string;
  name: string;
  durationYears: number;
  level: EducationLevel;
}

export interface Subject {
  id: string;
  name: string;
  level: EducationLevel;
  careerId?: string; // Only for Tertiary
  correlativeIds: string[]; // IDs of subjects that must be passed before
  year: number;
}

export interface Student {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  level: EducationLevel;
  careerIds: string[]; // Can be multiple for Tertiary
  enrollmentDate: string;
  status: 'Active' | 'Inactive';
  passedSubjectIds: string[]; // IDs of subjects the student has already passed
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  month: number;
  year: number;
  dueDate: string; // Format YYYY-MM-10
  paidDate?: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface ExamEnrollment {
  id: string;
  studentId: string;
  subjectId: string;
  examDate: string;
  registrationDate: string;
}
