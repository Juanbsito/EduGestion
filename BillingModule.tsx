
import React, { useState, useEffect, useMemo } from 'react';
import { Book, Plus, Search, Trash2, Edit3, Clock, GraduationCap, X, Loader2, Save, AlertTriangle, ChevronDown, ListFilter, FileText, Info, AlertCircle } from 'lucide-react';
import { Subject, Career, AcademicLevel, Student } from '../types';
import { INITIAL_STUDENTS } from '../constants';
import { supabase } from '../supabaseClient';

interface AcademicModuleProps {
  view: 'subjects' | 'careers' | 'enrollments';
}

const AcademicModule: React.FC<AcademicModuleProps> = ({ view }) => {
  const [dataList, setDataList] = useState<any[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('Todos');

  const [formData, setFormData] = useState<any>({});

  const gradesByLevel: Record<string, string[]> = useMemo(() => ({
    [AcademicLevel.INITIAL]: ['Sala de 3', 'Sala de 4', 'Sala de 5'],
    [AcademicLevel.PRIMARY]: ['1° Grado', '2° Grado', '3° Grado', '4° Grado', '5° Grado', '6° Grado', '7° Grado'],
    [AcademicLevel.SECONDARY]: ['1° Año', '2° Año', '3° Año', '4° Año', '5° Año', '6° Año'],
    [AcademicLevel.TERTIARY]: ['1° Año', '2° Año', '3° Año', '4° Año']
  }), []);

  const tableMap = {
    subjects: 'subjects',
    careers: 'careers',
    enrollments: 'enrollments'
  };

  useEffect(() => {
    fetchData();
    if (view === 'enrollments' || view === 'subjects') {
      fetchCareers();
      fetchStudents();
    }
  }, [view]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from(tableMap[view]).select('*');
    setDataList(data || []);
    setLoading(false);
  };

  const fetchCareers = async () => {
    const { data } = await supabase.from('careers').select('*');
    setCareers(data || []);
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*');
    setAllStudents(data || INITIAL_STUDENTS);
  };

  const resetForms = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
  };

  const openNew = () => {
    if (view === 'subjects') setFormData({ code: '', name: '', level: '', grade: '', hoursPerWeek: 4, prerequisites: [] });
    if (view === 'careers') setFormData({ code: '', name: '', duration: '', description: '', status: 'active' });
    if (view === 'enrollments') setFormData({ studentId: '', careerId: '', year: '1° Año', status: 'Activa' });
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
      await supabase.from(tableMap[view]).delete().eq('id', id);
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
        await supabase.from(tableMap[view]).update(formData).eq('id', editingId);
      } else {
        const newItem = { 
          ...formData, 
          school_id: 'school-1',
          date: new Date().toISOString().split('T')[0]
        };
        await supabase.from(tableMap[view]).insert(newItem);
      }
      await fetchData();
      resetForms();
    } catch (err) {
      console.error(err);
    } finally {
      setBtnLoading(false);
    }
  };

  // Lógica de candidatos aptos para carrera (Terciarios o Último Año Secundaria)
  const eligibleStudentsForCareer = useMemo(() => {
    return allStudents.filter(s => 
      s.level === AcademicLevel.TERTIARY || 
      (s.level === AcademicLevel.SECONDARY && s.grade.includes('6° Año'))
    );
  }, [allStudents]);

  const selectedStudentIsSecondary = useMemo(() => {
    if (!formData.studentId) return false;
    const student = allStudents.find(s => s.id === formData.studentId);
    return student?.level === AcademicLevel.SECONDARY;
  }, [formData.studentId, allStudents]);

  const filteredData = useMemo(() => {
    return dataList.filter(item => {
      const studentName = view === 'enrollments' ? getStudentName(item.studentId) : (item.name || '');
      const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (item.code?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesLevel = filterLevel === 'Todos' || item.level === filterLevel;
      return matchesSearch && matchesLevel;
    });
  }, [dataList, searchTerm, filterLevel, view]);

  const getStudentName = (id: string) => {
    const s = allStudents.find(st => st.id === id);
    return s ? `${s.firstName} ${s.lastName}` : 'Alumno';
  };

  const getCareerName = (id: string) => {
    const c = careers.find(car => car.id === id);
    return c ? c.name : 'Carrera';
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
              <h3 className="text-lg font-bold text-slate-900">¿Confirmar borrado?</h3>
              <p className="text-slate-500 text-sm mt-1">Esta acción eliminará el registro permanentemente.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeletingId(null)} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50">Cancelar</button>
              <button onClick={() => handleDelete(deletingId)} className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 shadow-lg shadow-rose-100">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-indigo-600 bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
            {view === 'careers' ? <GraduationCap size={24} /> : view === 'subjects' ? <Book size={24} /> : <FileText size={24} />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {view === 'subjects' ? 'Gestión de Materias' : view === 'careers' ? 'Gestión de Carreras' : 'Inscripciones a Carreras'}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {view === 'subjects' ? 'Diseño curricular por nivel y curso' : view === 'careers' ? 'Oferta educativa institucional' : 'Gestión de inscripciones de alumnos terciarios a carreras'}
            </p>
          </div>
        </div>
        <button 
          onClick={openNew}
          className="bg-[#5b51e8] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} /> {view === 'enrollments' ? 'Nueva Inscripción' : 'Nuevo Registro'}
        </button>
      </div>

      {view === 'enrollments' && (
        <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-xl p-4 flex items-center gap-3 text-[#1e40af]">
          <Info size={20} className="shrink-0" />
          <p className="text-sm font-medium">
            Solo alumnos en nivel <span className="font-bold">Terciario</span> o cursando <span className="font-bold">6° Año</span> de Secundaria pueden inscribirse en carreras.
          </p>
        </div>
      )}

      {view === 'subjects' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o código..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-sm font-medium text-slate-600 placeholder-slate-400 transition-all"
            />
          </div>
          <div className="relative min-w-[140px]">
            <select 
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-5 py-3 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-slate-400 transition-all"
            >
              <option value="Todos">Todos</option>
              {Object.values(AcademicLevel).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-10 animate-modal relative">
            <button onClick={resetForms} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-8">
              {view === 'enrollments' ? 'Nueva Inscripción a Carrera' : view === 'subjects' ? 'Nueva Materia' : view === 'careers' ? 'Nueva Carrera' : 'Nuevo Registro'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              {view === 'subjects' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-800">Código *</label>
                      <input 
                        required 
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 font-medium placeholder-slate-300" 
                        placeholder="MAT01"
                        value={formData.code || ''} 
                        onChange={e => setFormData({...formData, code: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-800">Nombre *</label>
                      <input 
                        required 
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 font-medium placeholder-slate-300" 
                        placeholder="Matemática"
                        value={formData.name || ''} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-800">Nivel *</label>
                      <div className="relative">
                        <select 
                          required 
                          className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 appearance-none font-medium"
                          value={formData.level || ''}
                          onChange={e => setFormData({...formData, level: e.target.value, grade: ''})}
                        >
                          <option value="">Seleccionar</option>
                          {Object.values(AcademicLevel).map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-800">Grado/Año</label>
                      <div className="relative">
                        <select 
                          disabled={!formData.level}
                          className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 appearance-none font-medium disabled:bg-slate-50 disabled:text-slate-300"
                          value={formData.grade || ''}
                          onChange={e => setFormData({...formData, grade: e.target.value})}
                        >
                          <option value="">{formData.level ? 'Seleccionar' : '1° Año'}</option>
                          {formData.level && gradesByLevel[formData.level]?.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Materias Correlativas</label>
                    <div className="relative">
                      <select 
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 appearance-none font-medium text-slate-400"
                        value=""
                        onChange={e => {
                          if (e.target.value && !formData.prerequisites?.includes(e.target.value)) {
                            setFormData({...formData, prerequisites: [...(formData.prerequisites || []), e.target.value]});
                          }
                        }}
                      >
                        <option value="">Agregar correlativa</option>
                        {dataList.filter(s => s.id !== editingId).map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    {formData.prerequisites?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.prerequisites.map((pId: string) => (
                          <span key={pId} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5">
                            {dataList.find(s => s.id === pId)?.name || 'Materia'}
                            <button type="button" onClick={() => setFormData({...formData, prerequisites: formData.prerequisites.filter((id: string) => id !== pId)})}><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Horas Semanales</label>
                    <input 
                      type="number" 
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 font-medium placeholder-slate-300" 
                      placeholder="4"
                      value={formData.hoursPerWeek || ''} 
                      onChange={e => setFormData({...formData, hoursPerWeek: parseInt(e.target.value)})} 
                    />
                  </div>
                </>
              )}

              {view === 'careers' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-800">Código *</label>
                      <input required className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-900 text-sm font-medium" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-800">Duración *</label>
                      <input required className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-900 text-sm font-medium" value={formData.duration || ''} onChange={e => setFormData({...formData, duration: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Nombre de Carrera *</label>
                    <input required className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-900 text-sm font-medium" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Descripción</label>
                    <textarea 
                      rows={3}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-900 text-sm font-medium resize-none" 
                      placeholder="Breve descripción de la carrera..."
                      value={formData.description || ''} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                    />
                  </div>
                </>
              )}

              {view === 'enrollments' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Alumno *</label>
                    <div className="relative">
                      <select required className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none appearance-none text-sm focus:border-slate-900 pr-10 font-medium text-slate-500" value={formData.studentId || ''} onChange={e => setFormData({...formData, studentId: e.target.value})}>
                        <option value="">Seleccionar alumno</option>
                        {eligibleStudentsForCareer.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.lastName}, {s.firstName} ({s.level} - {s.grade})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                    </div>
                  </div>

                  {selectedStudentIsSecondary && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 text-amber-700 animate-in zoom-in-95">
                      <AlertCircle size={18} className="shrink-0" />
                      <p className="text-[11px] font-bold">
                        AVISO: Inscripción condicional. El alumno se encuentra cursando su último año de secundaria.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Carrera *</label>
                    <div className="relative">
                      <select required className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none appearance-none text-sm focus:border-slate-900 pr-10 font-medium text-slate-500" value={formData.careerId || ''} onChange={e => setFormData({...formData, careerId: e.target.value})}>
                        <option value="">Seleccionar carrera</option>
                        {careers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Año a Cursar</label>
                    <div className="relative">
                      <select className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none appearance-none text-sm focus:border-slate-900 pr-10 font-medium" value={formData.year || '1° Año'} onChange={e => setFormData({...formData, year: e.target.value})}>
                        <option>1° Año</option>
                        <option>2° Año</option>
                        <option>3° Año</option>
                        <option>4° Año</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={resetForms} className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Cancelar</button>
                <button 
                  disabled={btnLoading} 
                  className="px-8 py-3 bg-[#5b51e8] text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {btnLoading ? <Loader2 className="animate-spin" size={16} /> : null} {view === 'enrollments' ? 'Inscribir' : editingId ? 'Guardar' : 'Crear'}
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
            {view === 'subjects' ? (
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Código</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Nombre</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Nivel</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight text-center">Grado/Año</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight text-center">Correlativas</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight text-center">Hs/Sem</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight text-right">Acciones</th>
              </tr>
            ) : view === 'careers' ? (
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Código</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Nombre y Descripción</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight text-center">Duración</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight text-right">Acciones</th>
              </tr>
            ) : (
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Alumno</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Carrera</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight text-center">Año Cursando</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight text-center">Fecha Inscripción</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight text-right">Estado</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium">
            {filteredData.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                {view === 'subjects' ? (
                  <>
                    <td className="px-6 py-4 text-slate-400 font-bold uppercase text-[11px] tracking-wider">{item.code}</td>
                    <td className="px-6 py-4 text-slate-800 font-bold">{item.name}</td>
                    <td className="px-6 py-4 text-slate-500">{item.level}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-500">{item.grade}</td>
                    <td className="px-6 py-4 text-center">
                      {item.prerequisites?.length > 0 ? (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black">{item.prerequisites.length}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">{item.hoursPerWeek} hs</td>
                  </>
                ) : view === 'careers' ? (
                  <>
                    <td className="px-6 py-4 text-slate-400 font-bold uppercase text-[11px] tracking-wider">{item.code}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.name}</div>
                      <div className="text-xs text-slate-400 truncate max-w-xs">{item.description || 'Sin descripción'}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-500">
                      <span className="flex items-center justify-center gap-1.5 text-xs"><Clock size={12} /> {item.duration}</span>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{getStudentName(item.studentId)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600 font-bold">{getCareerName(item.careerId)}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 font-bold">{item.year}</td>
                    <td className="px-6 py-4 text-center text-slate-400 text-xs font-bold">{item.date}</td>
                    <td className="px-6 py-4 text-right">
                       <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{item.status || 'Activa'}</span>
                    </td>
                  </>
                )}
                {view !== 'enrollments' && (
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-slate-900 transition-all rounded-lg hover:bg-slate-50"><Edit3 size={15} /></button>
                    <button onClick={() => setDeletingId(item.id)} className="p-2 text-rose-300 hover:text-rose-600 transition-all rounded-lg hover:bg-rose-50"><Trash2 size={15} /></button>
                  </td>
                )}
              </tr>
            ))}
            {filteredData.length === 0 && !loading && (
              <tr>
                <td colSpan={view === 'enrollments' ? 5 : 7} className="py-20 text-center text-slate-400 font-medium italic">No hay inscripciones registradas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AcademicModule;
