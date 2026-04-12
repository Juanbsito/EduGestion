
import React, { useState, useEffect, useMemo } from 'react';
import { UserPlus, ArrowLeft, Save, Plus, Loader2, UserCheck, ChevronDown, Trash2, TrendingUp } from 'lucide-react';
import { AcademicLevel, Student, StudentTutor } from '../types';
import { supabase } from '../supabaseClient';

interface NewStudentFormProps {
  initialData?: Student;
  onCancel: () => void;
  onSave: () => void;
}

const NewStudentForm: React.FC<NewStudentFormProps> = ({ initialData, onCancel, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    dni: '',
    birthDate: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    tutorName: '',
    tutorPhone: '',
    tutorDni: '',
    additionalTutors: [] as StudentTutor[],
    level: '' as any,
    grade: '',
    division: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const gradesByLevel: Record<string, string[]> = useMemo(() => ({
    [AcademicLevel.INITIAL]: ['Sala de 3', 'Sala de 4', 'Sala de 5'],
    [AcademicLevel.PRIMARY]: ['1° Grado', '2° Grado', '3° Grado', '4° Grado', '5° Grado', '6° Grado', '7° Grado'],
    [AcademicLevel.SECONDARY]: ['1° Año', '2° Año', '3° Año', '4° Año', '5° Año', '6° Año'],
    [AcademicLevel.TERTIARY]: ['1° Año', '2° Año', '3° Año', '4° Año']
  }), []);

  // Secuencia educativa completa para lógica de promoción automática
  const educationalFlow = useMemo(() => [
    { level: AcademicLevel.INITIAL, grade: 'Sala de 3' },
    { level: AcademicLevel.INITIAL, grade: 'Sala de 4' },
    { level: AcademicLevel.INITIAL, grade: 'Sala de 5' },
    { level: AcademicLevel.PRIMARY, grade: '1° Grado' },
    { level: AcademicLevel.PRIMARY, grade: '2° Grado' },
    { level: AcademicLevel.PRIMARY, grade: '3° Grado' },
    { level: AcademicLevel.PRIMARY, grade: '4° Grado' },
    { level: AcademicLevel.PRIMARY, grade: '5° Grado' },
    { level: AcademicLevel.PRIMARY, grade: '6° Grado' },
    { level: AcademicLevel.PRIMARY, grade: '7° Grado' },
    { level: AcademicLevel.SECONDARY, grade: '1° Año' },
    { level: AcademicLevel.SECONDARY, grade: '2° Año' },
    { level: AcademicLevel.SECONDARY, grade: '3° Año' },
    { level: AcademicLevel.SECONDARY, grade: '4° Año' },
    { level: AcademicLevel.SECONDARY, grade: '5° Año' },
    { level: AcademicLevel.SECONDARY, grade: '6° Año' },
    { level: AcademicLevel.TERTIARY, grade: '1° Año' },
    { level: AcademicLevel.TERTIARY, grade: '2° Año' },
    { level: AcademicLevel.TERTIARY, grade: '3° Año' },
    { level: AcademicLevel.TERTIARY, grade: '4° Año' },
  ], []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        dni: initialData.dni,
        birthDate: initialData.birthDate || '',
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        tutorName: initialData.tutorName || '',
        tutorPhone: initialData.tutorPhone || '',
        tutorDni: initialData.tutorDni || '',
        additionalTutors: initialData.additionalTutors || [],
        level: initialData.level,
        grade: initialData.grade,
        division: initialData.division || '',
        enrollmentDate: initialData.enrollmentDate.split('T')[0],
        status: initialData.status
      });
    }
  }, [initialData]);

  const handleLevelChange = (level: string) => {
    const defaultGrade = gradesByLevel[level] ? gradesByLevel[level][0] : '';
    setFormData({
      ...formData,
      level: level as AcademicLevel,
      grade: defaultGrade
    });
  };

  const handleSuggestPromotion = () => {
    if (!formData.level || !formData.grade) return;
    
    const currentIndex = educationalFlow.findIndex(
      item => item.level === formData.level && item.grade === formData.grade
    );

    if (currentIndex !== -1 && currentIndex < educationalFlow.length - 1) {
      const nextStep = educationalFlow[currentIndex + 1];
      setFormData({
        ...formData,
        level: nextStep.level,
        grade: nextStep.grade
      });
    }
  };

  const addTutor = () => {
    setFormData({
      ...formData,
      additionalTutors: [...formData.additionalTutors, { name: '', phone: '', dni: '' }]
    });
  };

  const removeTutor = (index: number) => {
    const updated = [...formData.additionalTutors];
    updated.splice(index, 1);
    setFormData({ ...formData, additionalTutors: updated });
  };

  const updateAdditionalTutor = (index: number, field: keyof StudentTutor, value: string) => {
    const updated = [...formData.additionalTutors];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, additionalTutors: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        ...formData,
        school_id: 'school-1',
        careerIds: initialData?.careerIds || [],
      };

      if (initialData) {
        await supabase.from('students').update(payload).eq('id', initialData.id);
      } else {
        await supabase.from('students').insert(payload);
      }
      
      setSuccess(true);
      setTimeout(onSave, 1200);
    } catch (err) {
      console.error(err);
      alert('Error al guardar los datos del alumno.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-50">
          <UserCheck size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">¡Alumno registrado!</h2>
        <p className="text-slate-500 mt-2 font-medium">La ficha académica ha sido procesada correctamente.</p>
      </div>
    );
  }

  const currentLevelGrades = formData.level ? gradesByLevel[formData.level] : [];

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-indigo-600">
              <UserPlus size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1e293b] tracking-tight">{initialData ? 'Editar Alumno' : 'Nuevo Alumno'}</h2>
              <p className="text-sm text-slate-400 font-medium">Completa los datos para matricular un nuevo alumno</p>
            </div>
          </div>
        </div>
        
        {initialData && (
          <button 
            type="button"
            onClick={handleSuggestPromotion}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm"
          >
            <TrendingUp size={16} /> Sugerir Promoción
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Datos Personales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">DNI *</label>
              <input 
                required 
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all font-medium" 
                placeholder="12345678"
                value={formData.dni} 
                onChange={e => setFormData({...formData, dni: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Fecha de Nacimiento</label>
              <input 
                type="date" 
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all text-slate-500 font-medium" 
                value={formData.birthDate} 
                onChange={e => setFormData({...formData, birthDate: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Nombre *</label>
              <input 
                required 
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all font-medium" 
                placeholder="Juan"
                value={formData.firstName} 
                onChange={e => setFormData({...formData, firstName: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Apellido *</label>
              <input 
                required 
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all font-medium" 
                placeholder="Pérez"
                value={formData.lastName} 
                onChange={e => setFormData({...formData, lastName: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Email</label>
              <input 
                type="email"
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all font-medium" 
                placeholder="juan@ejemplo.com"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Teléfono</label>
              <input 
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all font-medium" 
                placeholder="+54 11 1234-5678"
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-800">Dirección</label>
            <input 
              className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all font-medium" 
              placeholder="Calle 123, Ciudad"
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})} 
            />
          </div>
        </section>

        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-slate-900">Datos del Tutor</h3>
            <button 
              type="button"
              onClick={addTutor}
              className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
            >
              <Plus size={14} /> Agregar otro tutor
            </button>
          </div>
          
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Nombre del Tutor Principal</label>
                <input 
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all font-medium" 
                  placeholder="María García"
                  value={formData.tutorName} 
                  onChange={e => setFormData({...formData, tutorName: e.target.value})} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">DNI del Tutor Principal</label>
                <input 
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all font-medium" 
                  placeholder="12345678"
                  value={formData.tutorDni} 
                  onChange={e => setFormData({...formData, tutorDni: e.target.value})} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Teléfono del Tutor Principal</label>
                <input 
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all font-medium" 
                  placeholder="+54 11 9876-5432"
                  value={formData.tutorPhone} 
                  onChange={e => setFormData({...formData, tutorPhone: e.target.value})} 
                />
              </div>
            </div>

          {formData.additionalTutors.map((tutor, idx) => (
            <div key={idx} className="animate-in slide-in-from-top-2 duration-300 space-y-4 pt-4 border-t border-slate-50 relative group">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pr-12">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-800">Nombre del Tutor Adicional</label>
                  <input 
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all font-medium" 
                    placeholder="Nombre Completo"
                    value={tutor.name} 
                    onChange={e => updateAdditionalTutor(idx, 'name', e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-800">DNI del Tutor Adicional</label>
                  <input 
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all font-medium" 
                    placeholder="12345678"
                    value={tutor.dni} 
                    onChange={e => updateAdditionalTutor(idx, 'dni', e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-800">Teléfono del Tutor Adicional</label>
                  <input 
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all font-medium" 
                    placeholder="+54 11 ..."
                    value={tutor.phone} 
                    onChange={e => updateAdditionalTutor(idx, 'phone', e.target.value)} 
                  />
                </div>
              </div>
              <button 
                type="button"
                onClick={() => removeTutor(idx)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-rose-300 hover:text-rose-600 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </section>

        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Datos Académicos</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Nivel Educativo *</label>
              <div className="relative">
                <select 
                  required
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all appearance-none font-bold" 
                  value={formData.level} 
                  onChange={e => handleLevelChange(e.target.value)}
                >
                  <option value="">Seleccionar nivel</option>
                  {Object.values(AcademicLevel).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Grado/Año/Sala</label>
              <div className="relative">
                <select 
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all appearance-none font-bold disabled:bg-slate-50 disabled:text-slate-400" 
                  value={formData.grade} 
                  disabled={!formData.level}
                  onChange={e => setFormData({...formData, grade: e.target.value})}
                >
                  <option value="">{formData.level ? 'Seleccionar' : 'Seleccione nivel primero'}</option>
                  {currentLevelGrades.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">División/Sección</label>
              <input 
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all font-medium" 
                placeholder="A, B, C..."
                value={formData.division} 
                onChange={e => setFormData({...formData, division: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Fecha de Matriculación</label>
              <input 
                type="date" 
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all font-medium" 
                value={formData.enrollmentDate} 
                onChange={e => setFormData({...formData, enrollmentDate: e.target.value})} 
              />
            </div>
          </div>

          <div className="max-w-xs space-y-1.5">
            <label className="text-sm font-bold text-slate-800">Estado</label>
            <div className="relative">
              <select 
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 transition-all appearance-none font-bold" 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-6 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            Cancelar
          </button>
          <button 
            disabled={loading} 
            className="px-6 py-2.5 bg-[#5b51e8] text-white rounded-lg font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {initialData ? 'Actualizar Alumno' : 'Crear Alumno'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewStudentForm;
