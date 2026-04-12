
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, GraduationCap, DollarSign, AlertCircle } from 'lucide-react';
import { Student, Payment, AcademicLevel } from '../types';

interface DashboardProps {
  students: Student[];
  payments: Payment[];
}

const Dashboard: React.FC<DashboardProps> = ({ students, payments }) => {
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'ACTIVE').length;
  
  const pendingPayments = payments.filter(p => !p.isPaid).length;
  const totalCollected = payments
    .filter(p => p.isPaid)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const studentsByLevel = Object.values(AcademicLevel).map(level => ({
    name: level,
    count: students.filter(s => s.level === level).length
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Alumnos Totales" value={totalStudents.toString()} sub="Activos e Inactivos" icon={<Users className="text-blue-600" />} />
        <StatCard title="Tasa Retención" value={`${Math.round((activeStudents/totalStudents)*100)}%`} sub="Alumnos Activos" icon={<GraduationCap className="text-emerald-600" />} />
        <StatCard title="Recaudación" value={`$${totalCollected.toLocaleString()}`} sub="Mes actual" icon={<DollarSign className="text-amber-600" />} />
        <StatCard title="Pagos Pendientes" value={pendingPayments.toString()} sub="Exige seguimiento" icon={<AlertCircle className="text-rose-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Distribución por Nivel</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentsByLevel}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {studentsByLevel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Acciones Críticas</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Cierre de Cuotas</p>
                <p className="text-sm text-slate-500">Faltan 3 días para el vencimiento del 10</p>
              </div>
              <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">Verificar</button>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-amber-900">Mesa de Exámenes</p>
                <p className="text-sm text-amber-700">12 alumnos con deuda intentaron inscribirse</p>
              </div>
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">Revisar</button>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-blue-900">Inscripciones 2024</p>
                <p className="text-sm text-blue-700">Período abierto para nivel Terciario</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Gestionar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; sub: string; icon: React.ReactNode }> = ({ title, value, sub, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">+2.5%</span>
    </div>
    <h4 className="text-slate-500 text-sm font-medium">{title}</h4>
    <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    <p className="text-xs text-slate-400 mt-1">{sub}</p>
  </div>
);

export default Dashboard;
