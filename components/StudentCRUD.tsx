
import React, { useState } from 'react';
import { Student, EducationLevel, Career, Subject, Payment } from '../types.ts';
import { generateStudentAcademicAdvice } from '../services/geminiService.ts';
import { MAX_TERTIARY_CAREERS } from '../constants.ts';

interface StudentCRUDProps {
  students: Student[];
  subjects: Subject[];
  careers: Career[];
  payments: Payment[];
  onAdd: (student: Student) => void;
  onUpdate: (student: Student) => void;
  onDelete: (id: string) => void;
}

const StudentCRUD: React.FC<StudentCRUDProps> = ({ students, subjects, careers, payments, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [advice, setAdvice] = useState<string>('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Student>>({
    dni: '', firstName: '', lastName: '', email: '', level: EducationLevel.INITIAL, careerIds: [], status: 'Active', passedSubjectIds: []
  });

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ dni: '', firstName: '', lastName: '', email: '', level: EducationLevel.INITIAL, careerIds: [], status: 'Active', passedSubjectIds: [] });
    setIsModalOpen(true); setAdvice('');
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData(student);
    setIsModalOpen(true); setAdvice('');
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value as EducationLevel;
    setFormData({ ...formData, level, careerIds: [] });
  };

  const handleCareerToggle = (careerId: string) => {
    const current = formData.careerIds || [];
    if (current.includes(careerId)) {
      setFormData({ ...formData, careerIds: current.filter(id => id !== careerId) });
    } else {
      if (formData.level === EducationLevel.TERTIARY && current.length >= MAX_TERTIARY_CAREERS) {
        alert(`Límite excedido: Un alumno terciario puede cursar máximo ${MAX_TERTIARY_CAREERS} carreras.`);
        return;
      }
      setFormData({ ...formData, careerIds: [...current, careerId] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      onUpdate({ ...editingStudent, ...formData } as Student);
    } else {
      onAdd({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        enrollmentDate: new Date().toISOString().split('T')[0],
      } as Student);
    }
    setIsModalOpen(false);
  };

  const askAIAdvice = async () => {
    setIsLoadingAdvice(true);
    const studentSubjects = subjects.filter(s => s.level === formData.level);
    const result = await generateStudentAcademicAdvice(formData as Student, studentSubjects);
    setAdvice(result || '');
    setIsLoadingAdvice(false);
  };

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || s.dni.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <input 
          type="text" placeholder="Buscar alumno..." 
          className="w-full sm:w-96 p-3 rounded-2xl border border-slate-200 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={openAddModal} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg">
          <i className="fas fa-plus mr-2"></i> Alta Alumno
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiante</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Carreras/Ciclo</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map(student => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="font-black text-slate-800">{student.firstName} {student.lastName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">DNI: {student.dni}</div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    student.level === EducationLevel.TERTIARY ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {student.level}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-wrap gap-1">
                    {student.careerIds.map(id => (
                      <span key={id} className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 font-bold">
                        {careers.find(c => c.id === id)?.name}
                      </span>
                    ))}
                    {student.careerIds.length === 0 && <span className="text-[9px] text-slate-300 italic">Ciclo General</span>}
                  </div>
                </td>
                <td className="px-8 py-5 text-right space-x-2">
                  <button onClick={() => openEditModal(student)} className="text-slate-400 hover:text-indigo-600 transition-colors"><i className="fas fa-edit"></i></button>
                  <button onClick={() => onDelete(student.id)} className="text-slate-400 hover:text-rose-600 transition-colors"><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl">
            <h3 className="text-3xl font-black text-slate-900 mb-8">{editingStudent ? 'Editar Legajo' : 'Nueva Matrícula'}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input placeholder="DNI" className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} />
                <input placeholder="Email" className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input placeholder="Nombres" className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                <input placeholder="Apellidos" className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel Educativo</label>
                <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black" value={formData.level} onChange={handleLevelChange}>
                  {Object.values(EducationLevel).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {formData.level === EducationLevel.TERTIARY && (
                <div className="bg-indigo-50 p-6 rounded-3xl space-y-4">
                  <div className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-2">Carreras Disponibles (Max 2)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {careers.filter(c => c.level === EducationLevel.TERTIARY).map(c => (
                      <label key={c.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.careerIds?.includes(c.id) ? 'bg-white border-indigo-500 shadow-sm' : 'bg-white/50 border-slate-100'}`}>
                        <input type="checkbox" className="hidden" checked={formData.careerIds?.includes(c.id)} onChange={() => handleCareerToggle(c.id)} />
                        <span className="text-xs font-black text-slate-700">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-slate-100 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 text-slate-400 font-bold">Cancelar</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg">Confirmar</button>
              </div>

              <div className="mt-4">
                <button type="button" onClick={askAIAdvice} disabled={isLoadingAdvice} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2">
                  {isLoadingAdvice ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-robot"></i>} Asesor Académico IA
                </button>
                {advice && <div className="mt-4 p-6 bg-amber-50 border border-amber-100 rounded-2xl text-xs font-bold leading-relaxed">{advice}</div>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCRUD;
