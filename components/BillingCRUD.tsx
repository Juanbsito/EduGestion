
import React, { useState } from 'react';
import { Payment, Student, EducationLevel } from '../types.ts';
import { MONTHLY_FEES, PAYMENT_DUE_DAY } from '../constants.ts';

interface BillingCRUDProps {
  payments: Payment[];
  students: Student[];
  onAddPayment: (payment: Payment) => void;
  onUpdateStatus: (id: string, status: 'Paid') => void;
}

const BillingCRUD: React.FC<BillingCRUDProps> = ({ payments, students, onAddPayment, onUpdateStatus }) => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const generateFees = () => {
    const active = students.filter(s => s.status === 'Active');
    let count = 0;
    active.forEach(s => {
      const exists = payments.some(p => p.studentId === s.id && p.month === month && p.year === year);
      if (!exists) {
        onAddPayment({
          id: Math.random().toString(36).substr(2, 9),
          studentId: s.id,
          amount: MONTHLY_FEES[s.level],
          month, year,
          dueDate: `${year}-${String(month).padStart(2, '0')}-${PAYMENT_DUE_DAY}`,
          status: 'Pending'
        });
        count++;
      }
    });
    alert(`Proceso completado: Se han generado ${count} cuotas para el periodo seleccionado.`);
  };

  const currentPayments = payments.filter(p => p.month === month && p.year === year);
  const totalDue = currentPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalPaid = currentPayments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <i className="fas fa-piggy-bank text-7xl"></i>
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Total Recaudado</div>
            <div className="text-4xl font-black tracking-tighter">${totalPaid.toLocaleString()}</div>
          </div>
          <div className="mt-4 text-[10px] text-slate-400 font-bold uppercase relative z-10">De un total de ${totalDue.toLocaleString()}</div>
        </div>
        
        <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Control de Periodo</div>
          <div className="flex gap-2">
            <select className="flex-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-black text-xs outline-none focus:border-indigo-500 transition-all" value={month} onChange={e => setMonth(Number(e.target.value))}>
              {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                <option key={i+1} value={i+1}>{m}</option>
              ))}
            </select>
            <select className="flex-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-black text-xs outline-none focus:border-indigo-500 transition-all" value={year} onChange={e => setYear(Number(e.target.value))}>
              {[2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="lg:col-span-2 bg-indigo-600 rounded-[2.5rem] p-8 text-white flex items-center justify-between shadow-xl relative overflow-hidden group">
           <div className="relative z-10">
              <h4 className="text-xl font-black mb-1">Generación Masiva</h4>
              <p className="text-[11px] text-indigo-100 font-medium">Aplica aranceles automáticos según nivel de cada alumno.</p>
           </div>
           <button onClick={generateFees} className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black shadow-lg hover:shadow-2xl transition-all active:scale-95 relative z-10">
              Ejecutar Lote
           </button>
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
           <h3 className="text-xl font-black text-slate-800 tracking-tight">Listado de Cobranzas</h3>
           <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                 <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Pagado
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                 <span className="w-2 h-2 rounded-full bg-rose-500"></span> Mora
              </div>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiante</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Vencimiento</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Importe</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold italic">No se han generado cuotas para este periodo</td>
                </tr>
              ) : (
                currentPayments.map(p => {
                  const student = students.find(s => s.id === p.studentId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-8 py-5">
                        <div className="font-black text-slate-800">{student?.lastName.toUpperCase()}, {student?.firstName}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{student?.level}</div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                          {p.dueDate.split('-').reverse().join('/')}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-black text-slate-900">${p.amount.toLocaleString()}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          p.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          p.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {p.status === 'Paid' ? 'Cobrado' : p.status === 'Overdue' ? 'Mora' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {p.status !== 'Paid' ? (
                          <button onClick={() => onUpdateStatus(p.id, 'Paid')} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg active:scale-95">
                            Registrar Cobro
                          </button>
                        ) : (
                          <span className="text-emerald-500 font-black text-[10px] uppercase">Completado</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingCRUD;
