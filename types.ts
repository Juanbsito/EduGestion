
export enum AcademicLevel {
  INITIAL = 'Inicial',
  PRIMARY = 'Primaria',
  SECONDARY = 'Secundaria',
  TERTIARY = 'Terciario'
}

export type UserRole = 'superadmin' | 'school_admin' | 'cashier' | 'administrative' | 'teacher';

export interface Profile {
  id: string;
  school_id: string;
  role: UserRole;
  email: string;
  full_name: string;
}

export interface Career {
  id: string;
  code: string;
  name: string;
  duration: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  level: AcademicLevel;
  grade: string;
  prerequisites: string[];
  hoursPerWeek: number;
}

export interface AcademicRecord {
  id: string;
  studentId: string;
  subjectId: string;
  grade: number;
  status: 'Aprobada' | 'Desaprobada' | 'Cursando' | 'Final Pendiente';
  date: string;
  term: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  date: string;
  status: 'Presente' | 'Ausente' | 'Tarde';
}

export interface Communication {
  id: string;
  studentId: string;
  date: string;
  type: 'Nota' | 'Llamada' | 'Reunión' | 'Sanción';
  content: string;
  author: string;
}

export interface StudentFile {
  id: string;
  studentId: string;
  name: string;
  type: string;
  url: string;
  date: string;
}

export interface StudentTutor {
  name: string;
  phone: string;
  dni: string;
}

export interface Student {
  id: string;
  school_id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  tutorName?: string;
  tutorPhone?: string;
  tutorDni?: string;
  additionalTutors?: StudentTutor[];
  level: AcademicLevel;
  grade: string;
  division?: string;
  enrollmentDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  careerIds: string[];
}

export interface Payment {
  id: string;
  studentId: string;
  concept: string;
  amount: number;
  dueDate: string;
  status: 'Pagada' | 'Pendiente' | 'Vencida';
  isPaid: boolean;
  paymentMethod?: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  receiptNumber?: string;
  paidAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'alert' | 'info';
  date: string;
  read: boolean;
}

export interface Exam {
  id: string;
  subjectId: string;
  type: 'Final' | 'Parcial' | 'Libre';
  date: string;
  closingDate: string;
  location: string;
  status: 'Programado' | 'Cerrado' | 'En curso';
}

export interface SchoolStats {
  total_students: number;
  active_students: number;
  total_revenue_month: number;
  pending_payments_count: number;
}
