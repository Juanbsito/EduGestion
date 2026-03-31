
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
import { supabase } from './services/supabase.ts';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [enrollments, setEnrollments] = useState<ExamEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [
        { data: studentsData },
        { data: subjectsData },
        { data: paymentsData },
        { data: careersData },
        { data: enrollmentsData }
      ] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('subjects').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('careers').select('*'),
        supabase.from('enrollments').select('*')
      ]);

      if (studentsData) setStudents(studentsData);
      if (subjectsData) setSubjects(subjectsData);
      if (paymentsData) setPayments(paymentsData);
      if (careersData) setCareers(careersData);
      if (enrollmentsData) setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
      // Fallback to mock data if fetch fails (optional)
      setStudents(INITIAL_STUDENTS);
      setSubjects(INITIAL_SUBJECTS);
      setPayments(INITIAL_PAYMENTS);
      setCareers(MOCK_CAREERS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addStudent = useCallback(async (s: Student) => {
    const { error } = await supabase.from('students').insert(s);
    if (!error) setStudents(prev => [...prev, s]);
  }, []);

  const updateStudent = useCallback(async (s: Student) => {
    const { error } = await supabase.from('students').update(s).eq('id', s.id);
    if (!error) setStudents(prev => prev.map(st => st.id === s.id ? s : st));
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (!error) setStudents(prev => prev.filter(s => s.id !== id));
  }, []);

  const addSubject = useCallback(async (s: Subject) => {
    const { error } = await supabase.from('subjects').insert(s);
    if (!error) setSubjects(prev => [...prev, s]);
  }, []);

  const updateSubject = useCallback(async (s: Subject) => {
    const { error } = await supabase.from('subjects').update(s).eq('id', s.id);
    if (!error) setSubjects(prev => prev.map(sub => sub.id === s.id ? s : sub));
  }, []);

  const deleteSubject = useCallback(async (id: string) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (!error) setSubjects(prev => prev.filter(s => s.id !== id));
  }, []);

  const addCareer = useCallback(async (c: Career) => {
    const { error } = await supabase.from('careers').insert(c);
    if (!error) setCareers(prev => [...prev, c]);
  }, []);

  const updateCareer = useCallback(async (c: Career) => {
    const { error } = await supabase.from('careers').update(c).eq('id', c.id);
    if (!error) setCareers(prev => prev.map(car => car.id === c.id ? c : car));
  }, []);

  const deleteCareer = useCallback(async (id: string) => {
    const { error } = await supabase.from('careers').delete().eq('id', id);
    if (!error) setCareers(prev => prev.filter(c => c.id !== id));
  }, []);

  const addPayment = useCallback(async (p: Payment) => {
    const { error } = await supabase.from('payments').insert(p);
    if (!error) setPayments(prev => [...prev, p]);
  }, []);

  const updatePaymentStatus = useCallback(async (id: string, status: 'Paid') => {
    const paidDate = new Date().toISOString();
    const { error } = await supabase.from('payments').update({ status, paidDate }).eq('id', id);
    if (!error) {
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status, paidDate } : p));
    }
  }, []);

  const addEnrollment = useCallback(async (e: ExamEnrollment) => {
    const { error } = await supabase.from('enrollments').insert(e);
    if (!error) setEnrollments(prev => [...prev, e]);
  }, []);

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
      if (hasChange) {
        // Sync overdue status to Supabase
        updated.forEach(async (p) => {
          if (p.status === 'Overdue') {
            await supabase.from('payments').update({ status: 'Overdue' }).eq('id', p.id);
          }
        });
      }
      return hasChange ? updated : prevPayments;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-bold">Conectando con Supabase...</p>
        </div>
      </div>
    );
  }

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
