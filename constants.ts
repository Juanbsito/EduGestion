
import { AcademicLevel, Student, Career, Subject, Exam, Payment, AcademicRecord } from './types';

export const INITIAL_CAREERS: Career[] = [
  { id: 'c1', code: 'TDS01', name: 'Tecnicatura Superior en Desarrollo de Software', duration: '3 años', description: 'Formación integral en desarrollo de aplicaciones y sistemas', status: 'active' },
  { id: 'c2', code: 'TAE01', name: 'Tecnicatura Superior en Administración de Empresas', duration: '3 años', description: 'Gestión empresarial y administración', status: 'active' },
  { id: 'c3', code: 'TDG01', name: 'Tecnicatura Superior en Diseño Gráfico', duration: '2 años', description: 'Diseño visual y comunicación gráfica', status: 'active' }
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 's1', code: 'MAT01', name: 'Matemática I', level: AcademicLevel.TERTIARY, grade: '1° Año', prerequisites: [], hoursPerWeek: 6 },
  { id: 's2', code: 'PROG01', name: 'Programación I', level: AcademicLevel.TERTIARY, grade: '1° Año', prerequisites: [], hoursPerWeek: 8 },
  { id: 's3', code: 'PROG02', name: 'Programación II', level: AcademicLevel.TERTIARY, grade: '2° Año', prerequisites: ['s2'], hoursPerWeek: 8 },
  { id: 's4', code: 'FIS01', name: 'Física I', level: AcademicLevel.SECONDARY, grade: '4° Año', prerequisites: [], hoursPerWeek: 4 },
];

export const LEVEL_FEES: Record<AcademicLevel, number> = {
  [AcademicLevel.INITIAL]: 45000,
  [AcademicLevel.PRIMARY]: 55000,
  [AcademicLevel.SECONDARY]: 65000,
  [AcademicLevel.TERTIARY]: 75000,
};

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'st1', school_id: 'school-1', dni: '45678901', firstName: 'Lucía', lastName: 'González',
    email: 'lucia.gonzalez@email.com', level: AcademicLevel.INITIAL, grade: 'Sala de 4 A', 
    careerIds: [], enrollmentDate: '2025-03-01', status: 'ACTIVE',
    tutorName: 'María González', tutorDni: '12345678', tutorRelationship: 'Madre', tutorAddress: 'Av. Siempre Viva 123'
  },
  {
    id: 'st2', school_id: 'school-1', dni: '43567890', firstName: 'Mateo', lastName: 'Rodríguez',
    email: 'mateo.rodriguez@email.com', level: AcademicLevel.PRIMARY, grade: '3° B', 
    careerIds: [], enrollmentDate: '2025-03-10', status: 'ACTIVE',
    tutorName: 'Roberto Rodríguez', tutorDni: '23456789', tutorRelationship: 'Padre', tutorAddress: 'Calle Falsa 123'
  },
  {
    id: 'st3', school_id: 'school-1', dni: '40123456', firstName: 'Valentina', lastName: 'Martínez',
    email: 'v.martinez@email.com', level: AcademicLevel.TERTIARY, grade: '2° Año', 
    careerIds: ['c1'], enrollmentDate: '2024-03-05', status: 'ACTIVE',
    tutorName: 'Elena Martínez', tutorDni: '34567890', tutorRelationship: 'Madre', tutorAddress: 'Paseo del Prado 456',
    additionalTutors: [{ name: 'Carlos Martínez', phone: '123456', dni: '98765432', relationship: 'Padre', address: 'Paseo del Prado 456' }],
    authorizedPersons: [{ name: 'Abuela Rosa', dni: '11223344', phone: '555-0199', relationship: 'Abuela' }]
  }
];

export const INITIAL_ACADEMIC_RECORDS: AcademicRecord[] = [
  { id: 'ar1', studentId: 'st3', subjectId: 's1', grade: 9, status: 'Aprobada', date: '2024-12-10', term: '2024' },
  { id: 'ar2', studentId: 'st3', subjectId: 's2', grade: 8, status: 'Aprobada', date: '2024-12-12', term: '2024' },
  { id: 'ar3', studentId: 'st3', subjectId: 's3', grade: 0, status: 'Cursando', date: '2025-05-15', term: '2025' },
  { id: 'ar4', studentId: 'st2', subjectId: 's4', grade: 4, status: 'Desaprobada', date: '2024-11-20', term: '2024' },
  { id: 'ar5', studentId: 'st2', subjectId: 's4', grade: 2, status: 'Desaprobada', date: '2024-07-20', term: '2024' },
];

export const INITIAL_PAYMENTS: Payment[] = [
  { id: 'p1', studentId: 'st3', concept: 'Cuota Febrero 2026', amount: 55000, dueDate: '2026-02-09', status: 'Pagada', isPaid: true },
  { id: 'p2', studentId: 'st2', concept: 'Cuota Febrero 2024', amount: 45000, dueDate: '2024-02-09', status: 'Pagada', isPaid: true },
  { id: 'p3', studentId: 'st3', concept: 'Cuota Marzo 2026', amount: 75000, dueDate: '2026-03-10', status: 'Pendiente', isPaid: false },
  { id: 'p4', studentId: 'st1', concept: 'Cuota Marzo 2026', amount: 45000, dueDate: '2026-03-10', status: 'Pendiente', isPaid: false },
  { id: 'p5', studentId: 'st3', concept: 'Matrícula 2026', amount: 80000, dueDate: '2026-01-15', status: 'Vencida', isPaid: false }
];
