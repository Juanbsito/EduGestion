
import React, { useState } from 'react';
import { Subject, Student, Payment, ExamEnrollment, EducationLevel } from '../types.ts';
import { EXAM_RESTRICTION_HOURS } from '../constants.ts';

interface ExamManagerProps {
  subjects: Subject[];
  students: Student[];
  payments: Payment[];
  enrollments: ExamEnrollment[];
  onEnroll: (enrollment: ExamEnrollment) => void;
}

const ExamManager: React.FC<ExamManagerProps> = ({ subjects, students, payments, enrollments, onEnroll }) => {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [examDate, setExamDate] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{ allowed: boolean, details?: string[] } | null>(null);

  const checkEligibility = () => {
    if (!selectedStudent || !selectedSubject || !examDate) {
       alert("Por favor complete todos los campos para validar la habilitación.");
       return;
    }

    const student = students.find(s => s.id === selectedStudent)!;
    const subject = subjects.find(sub => sub.id === selectedSubject)!;
    const errors: string[] = [];
    
    // 1. Level Matching
    if (student.level !== subject.level) {
      errors.push(`Conflicto de Nivel: El alumno pertenece a ${student.level} pero la materia es de ${subject.level}.`);
    }

    // 2. Career Matching for Tertiary
    if (student.level === EducationLevel.TERTIARY && subject.careerId) {
      if (!student.careerIds.includes(subject.careerId)) {
        errors.push('El alumno no está cursando la carrera correspondiente a esta materia.');
      }
    }

    // 3. Correlatives Check
    if (subject.correlativeIds.length > 0) {
      const missingIds = subject.correlativeIds.filter(cid => !student.passedSubjectIds.includes(cid));
      if (missingIds.length > 0) {
        const missingNames = missingIds.map(id => subjects.find(s => s.id === id)?.name || 'Ref').join(', ');
        errors.push(`Correlatividades pendientes: Debe aprobar [${missingNames}] primero.`);
      }
    }

    // 4. Debt Check (RESTRICTION REQ)
    const hasDebt = payments.some(p => p.studentId === student.id && p.status === 'Overdue');
    if (hasDebt) {
      errors.push(`Bloqueo Administrativo: El alumno posee deuda vencida. Regularizar en el módulo de Cobranzas.`);
    }

    // 5. Time Window (48hs REQ)
    const examDateTime = new Date(examDate).getTime();
    const nowTime = new Date().getTime();
    const hoursToExam = (examDateTime - nowTime) / (1000 * 60 * 60);

    if (hoursToExam < EXAM_RESTRICTION_HOURS) {
      errors.push(`Plazo Insuficiente: Las inscripciones cierran ${EXAM_RESTRICTION_HOURS}hs antes de la mesa.`);
    }

    setValidationResult({ allowed: errors.length === 0, details: errors });
  };

  const handleEnroll = () => {
    if (!validationResult?.allowed) return;
    onEnroll({
      id: Math.random().toString(36).substr(2, 9),
      studentId: selectedStudent,
      subjectId: selectedSubject,
      examDate,
      registrationDate: new Date().toISOString()
    });
    setValidationResult(null);
    setSelectedStudent(''); setSelectedSubject(''); setExamDate('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8">
           <i className="fas fa-calendar-check text-slate-50 text-8xl absolute top-4 right-4 -rotate-12"></i>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-8 relative z-10">Mesa de Exámenes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estudiante</label>
            <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-500 transition-all outline-none">
              <option value="">Seleccionar...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.lastName.toUpperCase()}, {s.firstName}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Materia</label>
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-500 transition-all outline-none">
              <option value="">Seleccionar...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.level})</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha y Hora</label>
            <input type="datetime-local" value={examDate} onChange={e => setExamDate(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-500 transition-all outline-none" />
          </div>
        </div>

        <button onClick={checkEligibility} className="bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center gap-3">
          <i className="fas fa-user-check"></i>
          Verificar Habilitación
        </button>

        {validationResult && (
          <div className={`mt-8 p-10 rounded-[2.5rem] border-2 animate-in zoom-in duration-300 ${validationResult.allowed ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${validationResult.allowed ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                <i className={`fas ${validationResult.allowed ? 'fa-check' : 'fa-times'}`}></i>
              </div>
              <h3 className="text-xl font-black text-slate-800">{validationResult.allowed ? 'Alumno Habilitado' : 'Registro Bloqueado'}</h3>
            </div>
            
            <div className="space-y-3">
              {validationResult.details?.map((err, i) => (
                <p key={i} className="text-sm font-bold text-rose-700 flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  {err}
                </p>
              ))}
              {validationResult.allowed && (
                <div className="mt-6 pt-6 border-t border-emerald-100">
                  <button onClick={handleEnroll} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center gap-2">
                    <i className="fas fa-save"></i> Confirmar Inscripción
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Registro de Inscripciones</h3>
          <span className="bg-white px-4 py-1.5 rounded-full border text-[10px] font-black text-slate-500">{enrollments.length} Registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiante</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asignatura</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Fecha de Examen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-10 text-center text-slate-400 font-bold italic">No hay inscripciones registradas</td>
                </tr>
              ) : (
                enrollments.map(en => (
                  <tr key={en.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="font-black text-slate-700">
                        {students.find(s => s.id === en.studentId)?.lastName.toUpperCase()}, {students.find(s => s.id === en.studentId)?.firstName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold">{students.find(s => s.id === en.studentId)?.dni}</div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                        {subjects.find(s => s.id === en.subjectId)?.name}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right font-mono text-sm font-black text-slate-500">
                      {new Date(en.examDate).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExamManager;
