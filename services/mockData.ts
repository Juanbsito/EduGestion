
import { Student, Subject, EducationLevel, Career, Payment } from '../types.ts';
import { MONTHLY_FEES } from '../constants.ts';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's1',
    dni: '12.345.678',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@edu.com',
    level: EducationLevel.TERTIARY,
    careerIds: ['c1', 'c2'],
    enrollmentDate: '2023-03-01',
    status: 'Active',
    passedSubjectIds: ['sub1'] 
  },
  {
    id: 's2',
    dni: '23.456.789',
    firstName: 'María',
    lastName: 'García',
    email: 'maria.garcia@edu.com',
    level: EducationLevel.SECONDARY,
    careerIds: [],
    enrollmentDate: '2024-03-01',
    status: 'Active',
    passedSubjectIds: []
  },
  {
    id: 's3',
    dni: '34.567.890',
    firstName: 'Carlos',
    lastName: 'López',
    email: 'carlos.lopez@edu.com',
    level: EducationLevel.PRIMARY,
    careerIds: [],
    enrollmentDate: '2024-03-01',
    status: 'Active',
    passedSubjectIds: []
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub1', name: 'Programación I', level: EducationLevel.TERTIARY, careerId: 'c1', correlativeIds: [], year: 1 },
  { id: 'sub2', name: 'Programación II', level: EducationLevel.TERTIARY, careerId: 'c1', correlativeIds: ['sub1'], year: 1 },
  { id: 'sub3', name: 'Base de Datos I', level: EducationLevel.TERTIARY, careerId: 'c1', correlativeIds: [], year: 1 },
  { id: 'sub4', name: 'Matemática I', level: EducationLevel.SECONDARY, correlativeIds: [], year: 1 },
  { id: 'sub5', name: 'Física I', level: EducationLevel.SECONDARY, correlativeIds: ['sub4'], year: 2 },
  { id: 'sub6', name: 'Contabilidad I', level: EducationLevel.TERTIARY, careerId: 'c2', correlativeIds: [], year: 1 },
  { id: 'sub7', name: 'Derecho Comercial', level: EducationLevel.TERTIARY, careerId: 'c2', correlativeIds: [], year: 2 }
];

export const INITIAL_PAYMENTS: Payment[] = [
  { id: 'p1', studentId: 's1', amount: MONTHLY_FEES[EducationLevel.TERTIARY], month: 5, year: 2024, dueDate: '2024-05-10', status: 'Paid', paidDate: '2024-05-05' },
  { id: 'p2', studentId: 's1', amount: MONTHLY_FEES[EducationLevel.TERTIARY], month: 6, year: 2024, dueDate: '2024-06-10', status: 'Overdue' },
  { id: 'p3', studentId: 's2', amount: MONTHLY_FEES[EducationLevel.SECONDARY], month: 6, year: 2024, dueDate: '2024-06-10', status: 'Paid', paidDate: '2024-06-08' }
];
