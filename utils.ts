
import { Student, Payment, AcademicLevel, Exam } from './types';
import { LEVEL_FEES } from './constants';

/**
 * Calculates the monthly fee for a student based on their level and careers.
 */
export const calculateMonthlyFee = (student: Student): number => {
  const baseFee = LEVEL_FEES[student.level];
  if (student.level === AcademicLevel.TERTIARY) {
    // Tertiary students pay per career
    return baseFee * Math.max(1, student.careerIds.length);
  }
  return baseFee;
};

/**
 * Checks if a student is delinquent (has unpaid fees past the 10th of the month).
 */
export const hasPendingFees = (studentId: string, payments: Payment[]): boolean => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  return payments.some(p => {
    if (p.studentId !== studentId) return false;
    if (p.isPaid) return false;

    const dueDate = new Date(p.dueDate);
    // If today is past the due date (10th of month) and it's unpaid
    return today > dueDate;
  });
};

/**
 * Validates if an exam registration is allowed (48 hours prior and no debt).
 */
export const validateExamRegistration = (
  studentId: string,
  exam: Exam,
  payments: Payment[]
): { allowed: boolean; reason?: string } => {
  // Check debt
  if (hasPendingFees(studentId, payments)) {
    return { allowed: false, reason: 'El alumno presenta cuotas impagas vencidas.' };
  }

  // Check 48 hours anticipation
  const now = new Date();
  const examDate = new Date(exam.date);
  const diffInHours = (examDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 48) {
    return { allowed: false, reason: 'La inscripción debe realizarse con al menos 48hs de anticipación.' };
  }

  return { allowed: true };
};
