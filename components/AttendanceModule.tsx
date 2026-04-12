
import React, { useState, useEffect } from 'react';
import { CheckSquare, Calendar as CalendarIcon, Users, AlertTriangle, ChevronDown, Save, Loader2, Check, X, Clock } from 'lucide-react';
import { Student, Subject, AttendanceRecord } from '../types';
import { supabase } from '../supabaseClient';
import { INITIAL_STUDENTS, INITIAL_SUBJECTS } from '../constants';

const AttendanceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'Presente' | 'Ausente' | 'Tarde'>>({});
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (selectedSubjectId) {
      // En modo mock, filtramos INITIAL_STUDENTS que coincidan con el grado de la materia
      const subject = INITIAL_SUBJECTS.find(s => s.id === selectedSubjectId);
      if (subject) {
        const filtered = INITIAL_STUDENTS.filter(s => s.grade.includes(subject.grade));
        setStudents(filtered);
        // Inicializar asistencia
        const initial: Record<string, 'Presente' | 'Ausente' | 'Tarde'> = {};
        filtered.forEach(s => initial[s.id] = 'Presente');
        setAttendance(initial);
      }
    } else {
      setStudents([]);
    }
  }, [selectedSubjectId]);

  const handleStatusChange = (studentId: string, status: 'Presente' | 'Ausente' | 'Tarde') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    setSaveLoading(true);
    // Simulación de guardado
    await new Promise(r => setTimeout(r, 1000));
    alert('Asistencia guardada con éxito.');
    setSaveLoading(false);
  };

  const tabs = [
    { id: 'register', label: 'Registrar', icon: CalendarIcon },
    { id: 'reports', label: 'Reportes', icon: Users },
    { id: 'risk', label: 'Alerta Ausentismo', icon: AlertTriangle }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="text-[#0D9488] bg-[#F0FDFA] p-2.5 rounded-xl">
          <CheckSquare size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Control de Asistencia</h2>
          <p className="text-sm text-slate-500 font-medium">Registro y seguimiento por materia</p>
        </div>
      </div>

      <div className="bg-[#F1F5F9] p-1.5 rounded-2xl flex gap-1 w-full max-w-4xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'register' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-10 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Materia</label>
                <div className="relative">
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-teal-500 transition-all"
                  >
                    <option value="">Seleccionar materia...</option>
                    {INITIAL_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-700 font-bold outline-none"
                />
              </div>
            </div>

            {students.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-4 mb-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Lista de Alumnos ({students.length})</h4>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-teal-600 uppercase"><Check size={12}/> P</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 uppercase"><X size={12}/> A</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase"><Clock size={12}/> T</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {students.map(s => (
                    <div key={s.id} className="py-4 flex items-center justify-between group px-4 hover:bg-slate-50 rounded-2xl transition-all">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{s.lastName}, {s.firstName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{s.dni}</p>
                      </div>
                      <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                        {(['Presente', 'Ausente', 'Tarde'] as const).map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(s.id, status)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                              attendance[s.id] === status 
                                ? status === 'Presente' ? 'bg-teal-600 text-white' : status === 'Ausente' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {status[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-8 flex justify-end">
                  <button 
                    onClick={saveAttendance}
                    disabled={saveLoading}
                    className="px-10 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-teal-100 flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    {saveLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Guardar Asistencia
                  </button>
                </div>
              </div>
            ) : selectedSubjectId ? (
              <div className="py-20 text-center text-slate-400 italic">No hay alumnos inscritos en este curso.</div>
            ) : (
              <div className="py-20 text-center text-slate-400 italic">Seleccione una materia para cargar la lista.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 mb-6">Promedio Mensual</h3>
             <div className="space-y-4">
               {INITIAL_SUBJECTS.map(s => (
                 <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <p className="font-bold text-slate-700">{s.name}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500" style={{ width: '88%' }}></div>
                      </div>
                      <span className="text-xs font-black text-slate-800">88%</span>
                    </div>
                 </div>
               ))}
             </div>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
             <div className="w-24 h-24 rounded-full border-8 border-teal-500 border-t-slate-100 flex items-center justify-center mb-4">
                <span className="text-xl font-black text-slate-800">92%</span>
             </div>
             <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Asistencia Institucional</h4>
             <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase">Media de todos los niveles</p>
          </div>
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <AlertTriangle className="text-rose-500" size={24} />
            <h3 className="text-lg font-bold text-slate-800">Alumnos con riesgo de libre</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-6 border border-rose-100 bg-rose-50/50 rounded-3xl flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center font-black">ST</div>
                 <div>
                   <p className="font-black text-slate-800">Santiago Torres</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase">4° Secundaria - División B</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Inasistencias</p>
                 <p className="text-2xl font-black text-rose-700">14.5</p>
                 <span className="text-[10px] bg-rose-700 text-white px-2 py-0.5 rounded-lg font-bold">Riesgo Alto</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceModule;
