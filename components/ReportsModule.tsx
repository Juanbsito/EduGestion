
import React, { useState, useEffect } from 'react';
import { FileText, User, BookOpen, AlertTriangle, GraduationCap, ChevronDown, Search, Loader2, BarChart, Download, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Student, AcademicRecord, Subject } from '../types';
// Add missing import for INITIAL_ACADEMIC_RECORDS
import { INITIAL_ACADEMIC_RECORDS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ReportsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [academicHistory, setAcademicHistory] = useState<AcademicRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [riskStudents, setRiskStudents] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [subjectStats, setSubjectStats] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'risk') calculateRisk();
  }, [activeTab]);

  const fetchInitialData = async () => {
    const { data: stData } = await supabase.from('students').select('*');
    const { data: subData } = await supabase.from('subjects').select('*');
    setStudents(stData || []);
    setSubjects(subData || []);
  };

  const handleStudentSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      const filtered = students.filter(s => 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(term.toLowerCase()) || 
        s.dni.includes(term)
      );
      if (filtered.length === 1) selectStudent(filtered[0]);
    }
  };

  const selectStudent = async (student: Student) => {
    setLoading(true);
    setSelectedStudent(student);
    const { data } = await supabase.from('academic_records').select('*').eq('studentId', student.id);
    setAcademicHistory(data || []);
    setLoading(false);
  };

  const calculateRisk = async () => {
    setLoading(true);
    const { data: records } = await supabase.from('academic_records').select('*');
    const riskList = students.map(s => {
      const sRecords = records?.filter(r => r.studentId === s.id) || [];
      const failed = sRecords.filter(r => r.status === 'Desaprobada').length;
      const avg = sRecords.length > 0 ? sRecords.reduce((acc, r) => acc + r.grade, 0) / sRecords.length : 0;
      
      return { 
        ...s, 
        failedCount: failed, 
        average: avg, 
        riskLevel: failed > 2 || (avg < 6 && avg > 0) ? 'Alto' : 'Bajo' 
      };
    }).filter(s => s.riskLevel === 'Alto');
    
    setRiskStudents(riskList);
    setLoading(false);
  };

  const handleSubjectStat = async (subId: string) => {
    setSelectedSubjectId(subId);
    const { data } = await supabase.from('academic_records').select('*').eq('subjectId', subId);
    const stats = [
      { name: 'Aprobados', value: data?.filter(r => r.status === 'Aprobada').length || 0, color: '#10B981' },
      { name: 'Desaprobados', value: data?.filter(r => r.status === 'Desaprobada').length || 0, color: '#EF4444' },
      { name: 'En Cursada', value: data?.filter(r => r.status === 'Cursando').length || 0, color: '#6366F1' }
    ];
    setSubjectStats(stats);
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Materia';

  const tabs = [
    { id: 'history', label: 'Historial Alumno', icon: User },
    { id: 'subject', label: 'Por Materia', icon: BookOpen },
    { id: 'risk', label: 'Alumnos en Riesgo', icon: AlertTriangle },
    { id: 'degree', label: 'Analítico/Título', icon: GraduationCap }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="text-indigo-600 bg-indigo-50 p-2.5 rounded-xl">
          <FileText size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Informes Académicos</h2>
          <p className="text-sm text-slate-500 font-medium">Reportes de rendimiento, analíticos y seguimiento</p>
        </div>
      </div>

      <div className="bg-[#F1F5F9] p-1.5 rounded-2xl flex gap-1 w-full max-w-5xl">
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

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 max-w-5xl min-h-[500px]">
        {activeTab === 'history' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Buscar Alumno</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="DNI o Nombre..."
                    value={searchTerm}
                    onChange={(e) => handleStudentSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                  />
                  <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                </div>
              </div>
            </div>

            {selectedStudent ? (
              <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl flex items-center gap-6 border border-slate-100">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black">
                    {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-800">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedStudent.level} - {selectedStudent.grade}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Promedio General</p>
                    <p className="text-3xl font-black text-indigo-600">
                      {academicHistory.length > 0 ? (academicHistory.reduce((a, b) => a + b.grade, 0) / academicHistory.length).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-100">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Materia</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nota</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {academicHistory.map(record => (
                        <tr key={record.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-700">{getSubjectName(record.subjectId)}</td>
                          <td className="px-6 py-4 text-center font-black text-slate-800">{record.grade || '-'}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              record.status === 'Aprobada' ? 'bg-emerald-50 text-emerald-600' : 
                              record.status === 'Cursando' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-xs font-bold text-slate-400">{record.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                  <Search size={40} />
                </div>
                <p className="text-sm text-slate-400 font-medium italic">Busque un alumno para visualizar su trayectoria académica.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'subject' && (
          <div className="space-y-8">
            <div className="max-w-md space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar Materia</label>
              <select 
                onChange={(e) => handleSubjectStat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-indigo-500"
              >
                <option value="">Seleccione una materia...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
              </select>
            </div>

            {selectedSubjectId ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subjectStats}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {subjectStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-black text-slate-800">Resumen de Rendimiento</h4>
                  <div className="space-y-3">
                    {subjectStats.map(stat => (
                      <div key={stat.name} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.name}</span>
                        <span className="text-xl font-black text-slate-800">{stat.value} Alumnos</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 font-medium italic">Seleccione una materia para ver las estadísticas de aprobación.</div>
            )}
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800">Alumnos en Situación Crítica</h3>
              <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-lg text-[10px] font-black uppercase">Filtro: {'>'}2 Aplazos o Prom {'<'}6</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {riskStudents.length > 0 ? riskStudents.map(student => (
                <div key={student.id} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-black">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-800">{student.firstName} {student.lastName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{student.grade}</p>
                    </div>
                  </div>
                  <div className="flex gap-8 text-center">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Aplazos</p>
                      <p className="text-lg font-black text-rose-600">{student.failedCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Promedio</p>
                      <p className="text-lg font-black text-slate-800">{student.average.toFixed(1)}</p>
                    </div>
                  </div>
                  <button onClick={() => selectStudent(student)} className="p-3 text-slate-400 hover:text-indigo-600 transition-colors">
                    <BarChart size={20} />
                  </button>
                </div>
              )) : (
                <div className="py-20 text-center">
                  <CheckCircle className="mx-auto text-emerald-400 mb-4" size={48} />
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No hay alumnos en situación de riesgo detectados.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'degree' && (
          <div className="space-y-8">
            <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-indigo-900">Validación de Egresados</h3>
                <p className="text-sm text-indigo-600 font-medium">Generación automática de analíticos finales para alumnos con plan completo.</p>
              </div>
              <GraduationCap size={48} className="text-indigo-200" />
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Candidatos a Egreso</h4>
              <div className="grid grid-cols-1 gap-4">
                {students.filter(s => s.level === 'Terciario' || s.level === 'Secundaria').map(s => {
                  // INITIAL_ACADEMIC_RECORDS is now correctly imported from ../constants
                  const sRecords = INITIAL_ACADEMIC_RECORDS.filter(r => r.studentId === s.id && r.status === 'Aprobada');
                  const isComplete = sRecords.length >= 2; // Demo logic: 2 or more subjects passed

                  return (
                    <div key={s.id} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${isComplete ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{s.firstName} {s.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{s.grade}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Plan</p>
                          <p className={`text-xs font-bold ${isComplete ? 'text-emerald-600' : 'text-slate-400'}`}>{isComplete ? 'COMPLETO' : 'INCOMPLETO'}</p>
                        </div>
                        <button 
                          disabled={!isComplete}
                          className={`px-5 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                            isComplete ? 'bg-indigo-600 text-white shadow-lg hover:scale-105' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          }`}
                        >
                          <Download size={16} /> Descargar Analítico
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsModule;
