
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import StudentCRUD from './components/StudentCRUD.tsx';
import AcademicCRUD from './components/AcademicCRUD.tsx';
import BillingCRUD from './components/BillingCRUD.tsx';
import CareerCRUD from './components/CareerCRUD.tsx';
import ExamManager from './components/ExamManager.tsx';
import { INITIAL_STUDENTS, INITIAL_SUBJECTS, INITIAL_PAYMENTS } from './services/mockData.ts';
import { MOCK_CAREERS } from './constants.ts';
import { Student, Subject, Payment, Career, EducationLevel, ExamEnrollment } from './types.ts';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [careers, setCareers] = useState<Career[]>(MOCK_CAREERS);
  const [enrollments, setEnrollments] = useState<ExamEnrollment[]>([]);

  const addStudent = useCallback((s: Student) => setStudents(prev => [...prev, s]), []);
  const updateStudent = useCallback((s: Student) => setStudents(prev => prev.map(st => st.id === s.id ? s : st)), []);
  const deleteStudent = useCallback((id: string) => setStudents(prev => prev.filter(s => s.id !== id)), []);

  const addSubject = useCallback((s: Subject) => setSubjects(prev => [...prev, s]), []);
  const updateSubject = useCallback((s: Subject) => setSubjects(prev => prev.map(sub => sub.id === s.id ? s : sub)), []);
  const deleteSubject = useCallback((id: string) => setSubjects(prev => prev.filter(s => s.id !== id)), []);

  const addCareer = useCallback((c: Career) => setCareers(prev => [...prev, c]), []);
  const updateCareer = useCallback((c: Career) => setCareers(prev => prev.map(car => car.id === c.id ? c : car)), []);
  const deleteCareer = useCallback((id: string) => setCareers(prev => prev.filter(c => c.id !== id)), []);

  const addPayment = useCallback((p: Payment) => setPayments(prev => [...prev, p]), []);
  const updatePaymentStatus = useCallback((id: string, status: 'Paid') => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status, paidDate: new Date().toISOString() } : p));
  }, []);

  const addEnrollment = useCallback((e: ExamEnrollment) => setEnrollments(prev => [...prev, e]), []);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setPayments(prevPayments => {
      let hasChange = false;
      const updated = prevPayments.map(p => {
        if (p.status === 'Pending' && p.dueDate < todayStr) {
          hasChange = true;
          return { ...p, status: 'Overdue' as const };
        }
        return p;
      });
      return hasChange ? updated : prevPayments;
    });
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard students={students} payments={payments} enrollments={enrollments} />} />
          <Route 
            path="/students" 
            element={
              <StudentCRUD 
                students={students} 
                subjects={subjects}
                careers={careers}
                payments={payments}
                onAdd={addStudent} 
                onUpdate={updateStudent} 
                onDelete={deleteStudent} 
              />
            } 
          />
          <Route 
            path="/careers" 
            element={
              <CareerCRUD 
                careers={careers} 
                onAdd={addCareer} 
                onUpdate={updateCareer}
                onDelete={deleteCareer} 
              />
            } 
          />
          <Route 
            path="/academic" 
            element={
              <AcademicCRUD 
                subjects={subjects} 
                careers={careers}
                onAdd={addSubject} 
                onUpdate={updateSubject} 
                onDelete={deleteSubject} 
              />
            } 
          />
          <Route 
            path="/billing" 
            element={
              <BillingCRUD 
                payments={payments} 
                students={students} 
                onAddPayment={addPayment} 
                onUpdateStatus={updatePaymentStatus} 
              />
            } 
          />
          <Route 
            path="/exams" 
            element={
              <ExamManager 
                subjects={subjects} 
                students={students} 
                payments={payments} 
                enrollments={enrollments}
                onEnroll={addEnrollment}
              />
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
