
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, LayoutDashboard, Calendar, ClipboardCheck, 
  CreditCard, FileText, MessageSquare, Plus, Download, Trash2, 
  User, Mail, Phone, MapPin, GraduationCap, Printer, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Student, Payment, AcademicRecord, AttendanceRecord, Communication, StudentFile } from '../types';
import { supabase } from '../supabaseClient';

interface StudentDashboardProps {
  student: Student;
  onBack: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, onBack }) => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<StudentFile[]>([
    { id: '1', studentId: student.id, name: 'DNI_FRENTE.jpg', type: 'image/jpeg', url: '#', date: '2025-01-10' },
    { id: '2', studentId: student.id, name: 'Certificado_Medico.pdf', type: 'application/pdf', url: '#', date: '2025-02-15' }
  ]);
  const [comms, setComms] = useState<Communication[]>([
    { id: '1', studentId: student.id, date: '2025-02-18', type: 'Llamada', content: 'Se comunicó el tutor por demora en el pago.', author: 'Admin' },
    { id: '2', studentId: student.id, date: '2025-02-20', type: 'Nota', content: 'Presentó certificado de retiro anticipado.', author: 'Preceptoría' }
  ]);

  useEffect(() => {
    fetchStudentPayments();
  }, [student.id]);

  const fetchStudentPayments = async () => {
    setLoading(true);
    const { data } = await supabase.from('payments').select('*').eq('studentId', student.id);
    setStudentPayments(data || []);
    setLoading(false);
  };

  const stats = [
    { label: 'Asistencia', value: '94%', color: '#10B981' },
    { label: 'Promedio', value: '8.4', color: '#6366F1' },
    { label: 'Deuda Pendiente', value: `$${studentPayments.filter(p => !p.isPaid).reduce((acc, p) => acc + p.amount, 0).toLocaleString()}`, color: '#F59E0B' }
  ];

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
    { id: 'academico', label: 'Académico', icon: GraduationCap },
    { id: 'asistencia', label: 'Asistencia', icon: Calendar },
    { id: 'pagos', label: 'Pagos', icon: CreditCard },
    { id: 'archivos', label: 'Documentos', icon: FileText },
    { id: 'comms', label: 'Comunicaciones', icon: MessageSquare }
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-800 rounded-xl transition-all shadow-sm">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#1e293b] rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-slate-200">
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{student.lastName}, {student.firstName}</h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg uppercase">{student.level}</span>
              <span className="text-[10px] font-black text-[#1e293b] uppercase tracking-widest">{student.grade} - {student.division || 'División Única'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[120px] py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-[#1e293b] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'resumen' && (
            <div className="space-y-6">
               <div className="grid grid-cols-3 gap-4">
                  {stats.map(s => (
                    <div key={s.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                      <p className="text-2xl font-black text-slate-800">{s.value}</p>
                    </div>
                  ))}
               </div>
               <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Calendar size={16} className="text-[#1e293b]" /> Calendario Próximo
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Matemática I</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Martes, 08:30hs - Aula 4</p>
                      </div>
                      <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase">Clase</span>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'pagos' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Historial de Pagos</h3>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase">Al día</div>
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Concepto</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Vencimiento</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Monto</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {studentPayments.length > 0 ? studentPayments.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()).map(p => {
                        const isVencida = !p.isPaid && new Date(p.dueDate) < new Date();
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-bold text-slate-800">{p.concept}</td>
                            <td className="px-6 py-4 text-center text-slate-500">{p.dueDate}</td>
                            <td className="px-6 py-4 text-center font-bold text-slate-900">$ {p.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">
                              <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase border ${
                                p.isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                isVencida ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                                {p.isPaid ? 'Pagada' : isVencida ? 'Vencida' : 'Pendiente'}
                              </span>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan={4} className="py-12 text-center text-slate-400 italic">Sin movimientos registrados.</td></tr>
                      )}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeTab === 'archivos' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
               <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Documentación</h3>
                  <button className="text-[10px] font-black bg-slate-50 text-slate-600 px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-200">
                    <Plus size={14} /> Subir Archivo
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {files.map(f => (
                    <div key={f.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-[#1e293b]">
                             <FileText size={18} />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-800 truncate max-w-[120px]">{f.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold">{f.date}</p>
                          </div>
                       </div>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-2 text-slate-400 hover:text-[#1e293b]"><Download size={14} /></button>
                          <button className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'comms' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
               <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Libro de Comunicaciones</h3>
                  <button className="text-[10px] font-black bg-[#1e293b] text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                    <Plus size={14} /> Nueva Nota
                  </button>
               </div>
               <div className="space-y-4 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {comms.map(c => (
                    <div key={c.id} className="relative pl-12">
                       <div className="absolute left-3.5 top-2.5 w-3 h-3 rounded-full bg-white border-4 border-[#1e293b]"></div>
                       <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                          <div className="flex justify-between items-center mb-2">
                             <span className="px-2 py-0.5 bg-slate-200 text-[#1e293b] text-[10px] font-black uppercase rounded-lg">{c.type}</span>
                             <span className="text-[10px] text-slate-400 font-bold">{c.date}</span>
                          </div>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed">{c.content}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Datos de Contacto</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100"><Mail size={18}/></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase">Email</p><p className="text-sm font-bold text-slate-700">{student.email}</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100"><Phone size={18}/></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase">Teléfono</p><p className="text-sm font-bold text-slate-700">{student.phone || 'No registrado'}</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100"><MapPin size={18}/></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase">Domicilio</p><p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{student.address || 'No registrado'}</p></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Responsable</h3>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="font-bold text-slate-900 text-sm">{student.tutorName?.split(' | ')[0]}</p>
              <p className="text-xs text-slate-500 mt-1">{student.tutorPhone?.split(' | ')[0]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
