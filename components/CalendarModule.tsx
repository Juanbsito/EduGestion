
import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, ChevronDown, X, Loader2, Info } from 'lucide-react';

const CalendarModule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([
    { id: '1', title: 'Inicio Cuatrimestre', type: 'Inicio Cuatrimestre', start: '2026-02-02', level: 'Todos' },
    { id: '2', title: 'Vencimiento Cuota 2', type: 'Venc. Cuotas', start: '2026-02-10', level: 'Todos' },
    { id: '3', title: 'Examen Final Matemática', type: 'Examen Final', start: '2026-02-18', level: 'Terciario' }
  ]);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'Evento Especial',
    start: '',
    end: '',
    level: 'Todos',
    description: ''
  });

  const legend = [
    { label: 'Inicio Cuatrimestre', color: 'bg-[#10B981]' },
    { label: 'Fin Cuatrimestre', color: 'bg-[#EF4444]' },
    { label: 'Período Inscripción', color: 'bg-[#3B82F6]' },
    { label: 'Examen Parcial', color: 'bg-[#F59E0B]' },
    { label: 'Examen Final', color: 'bg-[#8B5CF6]' },
    { label: 'Vacaciones', color: 'bg-[#06B6D4]' },
    { label: 'Feriado', color: 'bg-[#EC4899]' },
    { label: 'Evento Especial', color: 'bg-[#6366F1]' },
    { label: 'Venc. Cuotas', color: 'bg-[#DC2626]' },
  ];

  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const monthInfo = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(currentDate);
    
    return { year, month, firstDay, daysInMonth, monthName };
  }, [currentDate]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setEvents([...events, { ...formData, id: Date.now().toString() }]);
      setLoading(false);
      setIsModalOpen(false);
      setFormData({ title: '', type: 'Evento Especial', start: '', end: '', level: 'Todos', description: '' });
    }, 800);
  };

  const upcomingEvents = useMemo(() => {
    return events
      .filter(ev => new Date(ev.start) >= new Date())
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 3);
  }, [events]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-indigo-600 bg-white border border-slate-200 p-2.5 rounded-xl shadow-sm">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Calendario Académico</h2>
            <p className="text-sm text-slate-500 font-medium">Eventos, exámenes y fechas importantes</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <select className="appearance-none bg-white border border-slate-200 rounded-xl pl-5 pr-10 py-3 text-sm font-bold text-slate-600 outline-none hover:border-slate-300 transition-all cursor-pointer">
              <option>Todos los niveles</option>
              <option>Inicial</option>
              <option>Primario</option>
              <option>Secundario</option>
              <option>Terciario</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1e293b] text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg hover:bg-slate-800 transition-all"
          >
            <Plus size={18} /> Nuevo Evento
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-wrap gap-x-6 gap-y-3 px-2">
          {legend.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="border border-slate-100 rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-10 py-6 border-b border-slate-50">
            <button onClick={() => changeMonth(-1)} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all"><ChevronLeft size={24} /></button>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight capitalize">{monthInfo.monthName} {monthInfo.year}</h3>
            <button onClick={() => changeMonth(1)} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all"><ChevronRight size={24} /></button>
          </div>

          <div className="grid grid-cols-7 text-center border-b border-slate-50 bg-slate-50/50">
            {days.map(d => (
              <div key={d} className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: monthInfo.firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[120px] border-r border-b border-slate-50 bg-slate-50/20" />
            ))}
            {Array.from({ length: monthInfo.daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${monthInfo.year}-${String(monthInfo.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.start === dateStr);
              const isToday = new Date().toDateString() === new Date(monthInfo.year, monthInfo.month, day).toDateString();

              return (
                <div key={day} className={`min-h-[120px] p-4 border-r border-b border-slate-50 relative group hover:bg-slate-50/50 transition-colors ${isToday ? 'bg-indigo-50/30' : ''}`}>
                  <span className={`text-sm font-black ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>{day}</span>
                  <div className="mt-2 space-y-1">
                    {dayEvents.map(ev => {
                      const l = legend.find(leg => leg.label === ev.type);
                      return (
                        <div key={ev.id} className={`h-1.5 w-full rounded-full ${l?.color || 'bg-slate-300'}`} title={ev.title} />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Próximos Eventos</h3>
        <div className="space-y-4">
          {upcomingEvents.length > 0 ? upcomingEvents.map(ev => (
            <div key={ev.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-sm transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${legend.find(l => l.label === ev.type)?.color || 'bg-slate-400'} flex items-center justify-center text-white shadow-sm`}>
                  <CalendarIcon size={18} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{ev.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(ev.start).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })} • {ev.level}</p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase text-slate-400 border border-slate-200 px-3 py-1 rounded-lg group-hover:bg-slate-50 transition-colors">Ver detalles</span>
            </div>
          )) : (
            <p className="text-center py-10 text-slate-400 italic text-sm">No hay eventos próximos registrados</p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-10 animate-modal relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Nuevo Evento</h3>
            
            <form onSubmit={handleSaveEvent} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Título *</label>
                <input 
                  required 
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 font-medium placeholder-slate-300" 
                  placeholder="Nombre del evento"
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Tipo de Evento</label>
                <div className="relative">
                  <select 
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 appearance-none font-medium text-slate-600"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    {legend.map(l => <option key={l.label}>{l.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800">Fecha Inicio *</label>
                  <input 
                    required 
                    type="date"
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 font-medium text-slate-500" 
                    value={formData.start} 
                    onChange={e => setFormData({...formData, start: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800">Fecha Fin</label>
                  <input 
                    type="date"
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 font-medium text-slate-500" 
                    value={formData.end} 
                    onChange={e => setFormData({...formData, end: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Nivel</label>
                <div className="relative">
                  <select 
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 appearance-none font-medium text-slate-600"
                    value={formData.level}
                    onChange={e => setFormData({...formData, level: e.target.value})}
                  >
                    <option>Todos</option>
                    <option>Inicial</option>
                    <option>Primario</option>
                    <option>Secundario</option>
                    <option>Terciario</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Descripción</label>
                <textarea 
                  rows={3}
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none text-sm focus:border-slate-900 font-medium placeholder-slate-300 resize-none" 
                  placeholder="Detalles adicionales..."
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Cancelar</button>
                <button 
                  disabled={loading} 
                  className="px-8 py-3 bg-[#94a3b8] text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : null} Crear Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarModule;
