
import React, { useState, useEffect, useMemo } from 'react';
import { ClipboardList, Plus, Trash2, X, Loader2, Save, Edit3, AlertCircle, ChevronDown, Calendar, MapPin, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Exam, Student, Subject } from '../types';
import { INITIAL_STUDENTS } from '../constants';
import { supabase } from '../supabaseClient';

interface ExamsModuleProps {
  view: 'schedule' | 'enrollment';
}

const ExamsModule: React.FC<ExamsModuleProps> = ({ view }) => {
  const [dataList, setDataList] = useState<any[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({});

  const table = view === 'schedule' ? 'exams' : 'exam_enrollments';

  useEffect(() => {
    fetchData();
    fetchSecondaryData();
  }, [view]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from(table).select('*');
    setDataList(data || []);
    setLoading(false);
  };

  const fetchSecondaryData = async () => {
    const { data: exData } = await supabase.from('exams').select('*');
    const { data: subData } = await supabase.from('subjects').select('*');
    const { data: stData } = await supabase.from('students').select('*');
    setExams(exData || []);
    setSubjects(subData || []);
    setStudents(stData || INITIAL_STUDENTS);
  };

  const resetForms = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
  };

  const openNew = () => {
    if (view === 'schedule') {
      setFormData({ 
        subjectId: '', 
        type: 'Final', 
        status: 'Programado',
        date: '', 
        closingDate: '', 
        location: 'Aula 101' 
      });
    } else {
      setFormData({ studentId: '', examId: '', status: 'Inscripto' });
    }
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(null);
    try {
      await supabase.from(table).delete().eq('id', id);
      setDataList(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      if (editingId) {
        await supabase.from(table).update(formData).eq('id', editingId);
      } else {
        const payload = { 
          ...formData, 
          school_id: 'school-1',
          enrollmentDate: new Date().toISOString().split('T')[0] 
        };
        await supabase.from(table).insert(payload);
      }
      await fetchData();
      resetForms();
    } catch (err) {
      console.error(err);
    } finally {
      setBtnLoading(false);
    }
  };

  const getStudentName = (id: string) => {
    const s = students.find(st => st.id === id);
    return s ? `${s.lastName}, ${s.firstName}` : 'Alumno';
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || id || 'Materia';

  const getExamDisplay = (id: string) => {
    const ex = exams.find(e => e.id === id);
    if (!ex) return 'Examen';
    return `${getSubjectName(ex.subjectId)} - ${ex.type}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 animate-modal space-y-4 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">¿Confirmar eliminación?</h3>
              <p className="text-slate-500 text-sm mt-1">Esta acción es irreversible.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeletingId(null)} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50">Cancelar</button>
              <button onClick={() => handleDelete(deletingId)} className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 shadow-lg">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-indigo-600 bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
            {view === 'schedule' ? <Calendar size={24} /> : <ClipboardList size={24} />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {view === 'schedule' ? 'Mesa de Exámenes' : 'Inscripciones a Exámenes'}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {view === 'schedule' ? 'Programación de exámenes y mesas' : 'Gestión de inscripciones a mesas de examen'}
            </p>
          </div>
        </div>
        <button 
          onClick={openNew}
          className="bg-[#5b51e8] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} /> {view === 'schedule' ? 'Nuevo Examen' : 'Nueva Inscripción'}
        </button>
      </div>

      {view === 'enrollment' && (
        <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-6 text-[#92400e] space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle size={18} />
            Restricciones de inscripción
          </div>
          <ul className="text-xs space-y-1 ml-7 list-disc font-medium">
            <li>Los alumnos con <span className="font-bold">cuotas vencidas</span> (vencimiento día 10 de cada mes) no pueden inscribirse</li>
            <li>La inscripción cierra <span className="font-bold">48 horas antes</span> del examen</li>
            <li>Deben tener aprobadas las <span className="font-bold">materias correlativas</span></li>
          </ul>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-10 animate-modal relative">
            <button onClick={resetForms} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-8">
              {view === 'schedule' ? 'Nuevo Examen' : 'Nueva Inscripción a Examen'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              {view === 'schedule' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Materia *</label>
                    <div className="relative">
                      <select 
                        required 
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 appearance-none font-medium text-slate-500"
                        value={formData.subjectId || ''}
                        onChange={e => setFormData({...formData, subjectId: e.target.value})}
                      >
                        <option value="">Seleccionar materia</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-800">Tipo *</label>
                      <div className="relative">
                        <select 
                          className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 appearance-none font-medium"
                          value={formData.type || 'Final'}
                          onChange={e => setFormData({...formData, type: e.target.value})}
                        >
                          <option>Final</option>
                          <option>Parcial</option>
                          <option>Libre</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-800">Estado</label>
                      <div className="relative">
                        <select 
                          className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 appearance-none font-medium"
                          value={formData.status || 'Programado'}
                          onChange={e => setFormData({...formData, status: e.target.value})}
                        >
                          <option>Programado</option>
                          <option>Abierto</option>
                          <option>Cerrado</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Fecha y Hora del Examen *</label>
                    <input 
                      required 
                      type="datetime-local"
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 font-medium" 
                      value={formData.date || ''} 
                      onChange={e => setFormData({...formData, date: e.target.value})} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Cierre de Inscripción (48hs antes por defecto)</label>
                    <input 
                      type="datetime-local"
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 font-medium" 
                      value={formData.closingDate || ''} 
                      onChange={e => setFormData({...formData, closingDate: e.target.value})} 
                    />
                    <p className="text-[11px] text-slate-400 font-medium">Los alumnos no podrán inscribirse después de esta fecha</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Lugar</label>
                    <input 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 font-medium" 
                      placeholder="Aula 101"
                      value={formData.location || ''} 
                      onChange={e => setFormData({...formData, location: e.target.value})} 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Alumno *</label>
                    <div className="relative">
                      <select 
                        required 
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 appearance-none font-medium text-slate-400"
                        value={formData.studentId || ''}
                        onChange={e => setFormData({...formData, studentId: e.target.value})}
                      >
                        <option value="">Seleccionar alumno</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.lastName}, {s.firstName}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Examen *</label>
                    <div className="relative">
                      <select 
                        required 
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 appearance-none font-medium text-slate-400"
                        value={formData.examId || ''}
                        onChange={e => setFormData({...formData, examId: e.target.value})}
                      >
                        <option value="">Seleccionar examen</option>
                        {exams.map(ex => <option key={ex.id} value={ex.id}>{getSubjectName(ex.subjectId)} ({ex.type})</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={resetForms} className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Cancelar</button>
                <button 
                  disabled={btnLoading} 
                  className="px-8 py-3 bg-[#5b51e8] text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {btnLoading ? <Loader2 className="animate-spin" size={16} /> : null} {view === 'schedule' ? 'Crear' : 'Inscribir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-slate-900" size={28} />
          </div>
        )}
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            {view === 'schedule' ? (
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Materia</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Tipo</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Fecha/Hora</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Cierre Inscripción</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Lugar</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Estado</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight text-right">Acciones</th>
              </tr>
            ) : (
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Alumno</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Examen</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Fecha Inscripción</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Estado</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight text-right">Nota</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium">
            {dataList.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                {view === 'schedule' ? (
                  <>
                    <td className="px-6 py-4 font-bold text-slate-900">{getSubjectName(item.subjectId)}</td>
                    <td className="px-6 py-4 text-slate-500">{item.type}</td>
                    <td className="px-6 py-4 text-slate-500 font-bold">{new Date(item.date).toLocaleString('es-AR')}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{item.closingDate ? new Date(item.closingDate).toLocaleString('es-AR') : '-'}</td>
                    <td className="px-6 py-4 text-slate-500">{item.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        item.status === 'Programado' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEdit(item)} className="p-2 text-slate-300 hover:text-slate-900 transition-all rounded-lg"><Edit3 size={15} /></button>
                      <button onClick={() => setDeletingId(item.id)} className="p-2 text-rose-200 hover:text-rose-600 transition-all rounded-lg"><Trash2 size={15} /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 font-bold text-slate-900">{getStudentName(item.studentId)}</td>
                    <td className="px-6 py-4 text-slate-500 font-bold">{getExamDisplay(item.examId)}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{item.enrollmentDate}</td>
                    <td className="px-6 py-4">
                       <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{item.status || 'Inscripto'}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-800">{item.grade !== undefined ? item.grade : '-'}</td>
                  </>
                )}
              </tr>
            ))}
            {dataList.length === 0 && !loading && (
              <tr>
                <td colSpan={view === 'schedule' ? 7 : 5} className="py-20 text-center text-slate-400 font-medium italic">
                  {view === 'schedule' ? 'No hay exámenes programados' : 'No hay inscripciones registradas'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamsModule;
