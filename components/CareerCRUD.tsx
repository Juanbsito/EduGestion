
import React, { useState } from 'react';
import { Career, EducationLevel } from '../types.ts';

interface CareerCRUDProps {
  careers: Career[];
  onAdd: (career: Career) => void;
  onUpdate: (career: Career) => void;
  onDelete: (id: string) => void;
}

const CareerCRUD: React.FC<CareerCRUDProps> = ({ careers, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [formData, setFormData] = useState<Partial<Career>>({
    name: '',
    durationYears: 3,
    level: EducationLevel.TERTIARY
  });

  const openAddModal = () => {
    setEditingCareer(null);
    setFormData({ name: '', durationYears: 3, level: EducationLevel.TERTIARY });
    setIsModalOpen(true);
  };

  const openEditModal = (c: Career) => {
    setEditingCareer(c);
    setFormData(c);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCareer) {
      onUpdate({ ...editingCareer, ...formData } as Career);
    } else {
      onAdd({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      } as Career);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Oferta Académica</h2>
          <p className="text-sm text-slate-500 font-medium">Administre las carreras y especializaciones disponibles.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 shadow-xl shadow-indigo-100 active:scale-95"
        >
          <i className="fas fa-plus"></i> Nueva Carrera
        </button>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {careers.map(career => (
          <div key={career.id} className="bg-white border-2 border-slate-100 rounded-3xl p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all relative group">
            <div className="flex justify-between items-start mb-4">
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                career.level === EducationLevel.TERTIARY ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {career.level}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditModal(career)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors flex items-center justify-center"
                >
                  <i className="fas fa-pen text-xs"></i>
                </button>
                <button 
                  onClick={() => onDelete(career.id)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors flex items-center justify-center"
                >
                  <i className="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-black text-slate-800 mb-4 leading-tight">{career.name}</h3>
            
            <div className="flex items-center gap-4 py-4 border-t border-slate-50 mt-auto">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duración</span>
                <span className="text-sm font-bold text-slate-700">{career.durationYears} Años</span>
              </div>
              <div className="w-px h-8 bg-slate-100"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Programa</span>
                <span className="text-sm font-bold text-indigo-600 font-mono uppercase">{career.id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-black mb-8 text-slate-900">
              {editingCareer ? 'Editar Carrera' : 'Crear Nueva Carrera'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Carrera</label>
                <input 
                  required 
                  className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold text-slate-700" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duración (Años)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold text-slate-700" 
                    value={formData.durationYears}
                    onChange={e => setFormData({...formData, durationYears: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nivel</label>
                  <select 
                    className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-indigo-500 outline-none transition-all bg-white font-bold text-slate-700" 
                    value={formData.level}
                    onChange={e => setFormData({...formData, level: e.target.value as EducationLevel})}
                  >
                    <option value={EducationLevel.TERTIARY}>Terciario</option>
                    <option value={EducationLevel.SECONDARY}>Secundario</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4 justify-end pt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors">Cancelar</button>
                <button type="submit" className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition-all">
                  {editingCareer ? 'Guardar Cambios' : 'Confirmar Creación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerCRUD;
