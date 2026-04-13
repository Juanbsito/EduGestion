
import React, { useState } from 'react';
import { Search, Filter, Trash2, Edit3, Eye, Users, Loader2, AlertCircle } from 'lucide-react';
import { Student, AcademicLevel } from '../types';
import { usePaginatedQuery } from '../usePaginatedQuery';
import { supabase } from '../supabaseClient';
import StudentDashboard from './StudentDashboard';

interface StudentsModuleProps {
  schoolId: string;
  onEditStudent: (student: Student) => void;
}

const StudentsModule: React.FC<StudentsModuleProps> = ({ schoolId, onEditStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<AcademicLevel | 'ALL'>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);

  const { data: students, loading, count, page, setPage, refetch } = usePaginatedQuery<Student>(
    'students',
    schoolId,
    25,
    { 
      ...(levelFilter !== 'ALL' ? { level: levelFilter } : {}),
      ...(gradeFilter !== 'ALL' ? { grade: gradeFilter } : {})
    }
  );

  const availableGrades = [
    'Sala 3', 'Sala 4', 'Sala 5',
    '1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria', '7° Primaria',
    '1° Secundaria', '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria', '6° Secundaria',
    '1° Año Terciario', '2° Año Terciario', '3° Año Terciario'
  ];

  const handleDeleteStudent = async (id: string) => {
    setDeletingId(null);
    try {
      await supabase.from('students').delete().eq('id', id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const getLevelBadgeStyles = (level: AcademicLevel) => {
    switch (level) {
      case AcademicLevel.INITIAL: return 'bg-pink-100 text-pink-600';
      case AcademicLevel.PRIMARY: return 'bg-blue-100 text-blue-600';
      case AcademicLevel.SECONDARY: return 'bg-orange-100 text-orange-600';
      case AcademicLevel.TERTIARY: return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  if (selectedStudentForView) {
    return <StudentDashboard student={selectedStudentForView} onBack={() => setSelectedStudentForView(null)} />;
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-modal">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">¿Eliminar alumno?</h3>
            <p className="text-slate-500 text-sm mt-2 font-medium">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeletingId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">Cancelar</button>
              <button onClick={() => handleDeleteStudent(deletingId)} className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="text-indigo-600 bg-indigo-50 p-2 rounded-xl">
            <Users size={24} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Alumnos</h2>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Gestión de Matriculados</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" 
            placeholder="Buscar alumno..." 
            className="pl-10 pr-4 py-2 w-full bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as AcademicLevel | 'ALL')}
          >
            <option value="ALL">Todos los Niveles</option>
            {Object.values(AcademicLevel).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select 
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="ALL">Todos los Cursos</option>
            {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={28} />
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Alumno</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">DNI</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Curso</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nivel</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length > 0 ? students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-[10px] font-black shadow-sm`}>
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-sm">{student.firstName} {student.lastName}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{student.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 font-bold text-sm tracking-tight">{student.dni}</td>
                  <td className="px-5 py-3.5 text-center text-slate-600 font-bold text-sm">{student.grade}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black uppercase ${getLevelBadgeStyles(student.level)}`}>
                      {student.level}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-1">
                    <button 
                      onClick={() => setSelectedStudentForView(student)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 transition-all rounded-lg hover:bg-indigo-50" 
                      title="Ver Ficha"
                    >
                      <Eye size={15} />
                    </button>
                    <button onClick={() => onEditStudent(student)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-all rounded-lg hover:bg-indigo-50" title="Editar">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => setDeletingId(student.id)} className="p-1.5 text-rose-300 hover:text-rose-600 transition-all rounded-lg hover:bg-rose-50" title="Eliminar">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-medium text-xs">No hay alumnos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">Mostrando {students.length} de {count} alumnos</p>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-slate-50">Anterior</button>
            <button disabled={(page + 1) * 25 >= count} onClick={() => setPage(page + 1)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-slate-50">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsModule;
