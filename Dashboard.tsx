
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, GraduationCap, DollarSign, AlertCircle, RefreshCw, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from './supabaseClient';
import { SchoolStats } from './types';

interface DashboardProps {
  schoolId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ schoolId }) => {
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('school_stats')
        .select('*')
        .eq('school_id', schoolId)
        .single();

      if (!error) setStats(data);
      setLoading(false);
    };

    fetchStats();
  }, [schoolId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="animate-spin text-[#1e293b]" size={32} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Alumnos Totales" 
          value={stats?.total_students?.toLocaleString() || '0'} 
          sub="Matrícula histórica" 
          icon={<Users size={20} />} 
          color="slate"
        />
        <StatCard 
          title="Alumnos Activos" 
          value={stats?.active_students?.toLocaleString() || '0'} 
          sub="Cursado regular" 
          icon={<GraduationCap size={20} />} 
          color="slate"
        />
        <StatCard 
          title="Recaudación Mes" 
          value={`$${stats?.total_revenue_month?.toLocaleString() || '0'}`} 
          sub="Pagos confirmados" 
          icon={<DollarSign size={20} />} 
          color="slate"
        />
        <StatCard 
          title="Morosidad Pendiente" 
          value={stats?.pending_payments_count?.toString() || '0'} 
          sub="Cuotas vencidas" 
          icon={<AlertCircle size={20} />} 
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Distribución de Alumnos</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Por Nivel Educativo</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Inicial', count: 45 },
                { name: 'Primaria', count: 120 },
                { name: 'Secundaria', count: 88 },
                { name: 'Terciario', count: 54 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                   <Cell fill="#1e293b" />
                   <Cell fill="#1e293b" />
                   <Cell fill="#1e293b" />
                   <Cell fill="#1e293b" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Acciones Pendientes</h3>
            <TrendingUp className="text-slate-200" size={20} />
          </div>
          <div className="space-y-4 flex-1">
             <ActionItem title="Generar Cuotas Marzo" desc="El ciclo lectivo 2026 requiere facturación" badge="Próximo" />
             <ActionItem title="Revisar Deudores" desc="3 alumnos excedieron el límite de mora" badge="Urgente" color="rose" />
             <ActionItem title="Mesa de Finales" desc="Cierre de actas para el turno Febrero" badge="Info" color="amber" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, sub, icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
    <div className={`w-10 h-10 rounded-xl ${color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-[#1e293b]'} flex items-center justify-center mb-4 border border-slate-100`}>
      {icon}
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{sub}</p>
  </div>
);

const ActionItem = ({ title, desc, badge, color = "slate" }: any) => (
  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-slate-200 transition-all duration-200">
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-bold text-slate-900 text-sm">{title}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${color === 'rose' ? 'bg-rose-100 text-rose-600' : color === 'amber' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-700'} uppercase`}>
          {badge}
        </span>
      </div>
      <p className="text-xs text-slate-500 truncate mt-0.5">{desc}</p>
    </div>
    <button className="p-2 text-slate-400 hover:text-[#1e293b] transition-colors">
      <RefreshCw size={14} />
    </button>
  </div>
);

export default Dashboard;
