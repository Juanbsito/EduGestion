
import React, { useState } from 'react';
import { Subject, EducationLevel, Career } from '../types.ts';

interface AcademicCRUDProps {
  subjects: Subject[];
  careers: Career[];
  onAdd: (subject: Subject) => void;
  onUpdate: (subject: Subject) => void;
  onDelete: (id: string) => void;
}

const AcademicCRUD: React.FC<AcademicCRUDProps> = ({ subjects, careers, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<Partial<Subject>>({
    name: '',
    level: EducationLevel.INITIAL,
    correlativeIds: [],
    year: 1
  });

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({ name: '', level: EducationLevel.INITIAL, correlativeIds: [], year: 1 });
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setFormData(sub);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      onUpdate({ ...editingSubject, ...formData } as Subject);
    } else {
      onAdd({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        correlativeIds: formData.correlativeIds || []
      } as Subject);
    }
    setIsModalOpen(false);
  };

  const toggleCorrelative = (id: string) => {
    const current = formData.correlativeIds || [];
    if (current.includes(id)) {
      setFormData({ ...formData, correlativeIds: current.filter(c => c !== id) });
    } else {
      setFormData({ ...formData, correlativeIds: [...current, id] });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-xl font-black text-slate-800 tracking-tight">Plan de Estudios</h2>
           <p className="text-xs text-slate-400 font-medium">Gestione materias y sus requisitos de correlatividad.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 active:scale-95"
        >
          <i className="fas fa-plus-circle"></i> Nueva Materia
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Materia</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Año</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nivel / Carrera</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Correlatividades</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subjects.map(sub => (
              <tr key={sub.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-800">{sub.name}</div>
                </td>
                <td className="px-6 py-4 text-center">
                   <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">
                    {sub.year}°
                   </span>
                </td>
                <td className="px-6 py-4">
                   <div className="text-[10px] font-bold uppercase text-slate-400">{sub.level}</div>
                   {sub.careerId && (
                    <div className="text-[9px] text-indigo-500 font-bold uppercase tracking-tight">
                      {careers.find(c => c.id === sub.careerId)?.name}
                    </div>
                   )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {sub.correlativeIds.length > 0 
                      ? sub.correlativeIds.map(cid => (
                        <span key={cid} className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 font-medium">
                          {subjects.find(s => s.id === cid)?.name || 'Ref'}
                        </span>
                      ))
                      : <span className="text-[10px] text-slate-300 italic">Sin requisitos</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                   <button onClick={() => openEditModal(sub)} className="text-slate-300 hover:text-indigo-600 transition-colors">
                     <i className="fas fa-edit"></i>
                   </button>
                   <button onClick={() => onDelete(sub.id)} className="text-slate-300 hover:text-rose-600 transition-colors">
                     <i className="fas fa-trash"></i>
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
              <i className="fas fa-book-open text-emerald-600"></i>
              {editingSubject ? 'Editar Materia' : 'Configurar Materia'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</label>
                   <input required className="w-full border-2 border-slate-100 p-3 rounded-2xl focus:border-emerald-500 outline-none transition-all" placeholder="Ej: Álgebra y Geometría" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Año del Ciclo</label>
                    <input type="number" min="1" max="6" className="w-full border-2 border-slate-100 p-3 rounded-2xl focus:border-emerald-500 outline-none transition-all" value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel</label>
                    <select className="w-full border-2 border-slate-100 p-3 rounded-2xl focus:border-emerald-500 outline-none transition-all bg-white" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as EducationLevel, careerId: '', correlativeIds: []})}>
                      {Object.values(EducationLevel).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  {formData.level === EducationLevel.TERTIARY && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Carrera</label>
                      <select className="w-full border-2 border-slate-100 p-3 rounded-2xl focus:border-emerald-500 outline-none transition-all bg-white" value={formData.careerId} onChange={e => setFormData({...formData, careerId: e.target.value, correlativeIds: []})}>
                        <option value="">Seleccione carrera...</option>
                        {careers.filter(c => c.level === EducationLevel.TERTIARY).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}
               </div>
               
               <div className="space-y-2">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Correlatividades Requeridas</label>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                    {subjects
                      .filter(s => s.id !== editingSubject?.id && s.level === formData.level && (formData.level !== EducationLevel.TERTIARY || s.careerId === formData.careerId))
                      .map(s => (
                        <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            checked={formData.correlativeIds?.includes(s.id)}
                            onChange={() => toggleCorrelative(s.id)}
                          />
                          <span className="text-xs font-medium text-slate-600">{s.name} ({s.year}°)</span>
                        </label>
                      ))}
                    {subjects.filter(s => s.id !== editingSubject?.id && s.level === formData.level).length === 0 && (
                      <div className="col-span-2 text-center py-4 text-slate-400 text-[10px] font-bold uppercase italic">No hay otras materias en este nivel</div>
                    )}
                 </div>
               </div>

               <div className="flex gap-4 justify-end pt-6 border-t border-slate-100">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors">Cancelar</button>
                 <button type="submit" className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">
                   {editingSubject ? 'Actualizar' : 'Registrar'} Materia
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicCRUD;
