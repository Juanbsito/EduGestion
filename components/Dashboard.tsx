
import React from 'react';
import { EducationLevel, Student, Payment, ExamEnrollment } from '../types.ts';
import { MONTHLY_FEES } from '../constants.ts';

interface DashboardProps {
  students: Student[];
  payments: Payment[];
  enrollments: ExamEnrollment[];
}

const Dashboard: React.FC<DashboardProps> = ({ students, payments, enrollments }) => {
  const overdueCount = payments.filter(p => p.status === 'Overdue').length;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthPayments = payments.filter(p => p.month === currentMonth && p.year === currentYear);
  
  const totalCollected = monthPayments
    .filter(p => p.status === 'Paid')
    .reduce((acc, p) => acc + p.amount, 0);
    
  const collectionRate = monthPayments.length > 0 
    ? Math.round((monthPayments.filter(p => p.status === 'Paid').length / monthPayments.length) * 100)
    : 0;

  const soonestExam = enrollments.length > 0 
    ? [...enrollments].sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())[0]
    : null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  };

  const levelDistribution = Object.values(EducationLevel).map(level => ({
    level,
    count: students.filter(s => s.level === level).length
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <i className="fas fa-user-graduate"></i>
          </div>
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Matrícula Activa</div>
          <div className="text-4xl font-black text-slate-900 tracking-tight">{students.length}</div>
          <div className="mt-4 text-emerald-500 text-[10px] flex items-center gap-1 font-bold">
             <i className="fas fa-arrow-up"></i> +4% este mes
          </div>
        </div>
        
        <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-rose-100/50 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl mb-4 group-hover:bg-rose-600 group-hover:text-white transition-all">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Mora Pendiente</div>
          <div className="text-4xl font-black text-rose-600 tracking-tight">{overdueCount}</div>
          <div className="mt-4 text-rose-400 text-[10px] flex items-center gap-1 font-bold uppercase">
             Revisar vencimientos
          </div>
        </div>

        <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <i className="fas fa-wallet"></i>
            </div>
            <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-black text-[10px]">{collectionRate}%</div>
          </div>
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Recaudado</div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">${totalCollected.toLocaleString()}</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
             <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${collectionRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-blue-100/50 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <i className="fas fa-calendar-star"></i>
          </div>
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Próxima Fecha</div>
          <div className="text-3xl font-black text-blue-600 tracking-tight">{soonestExam ? formatDate(soonestExam.examDate) : 'N/A'}</div>
          <div className="mt-4 text-blue-400 text-[10px] font-bold uppercase">
             {enrollments.length} alumnos inscritos
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribución de Alumnos */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <i className="fas fa-chart-pie text-indigo-500"></i>
              Composición de Alumnado
            </h3>
          </div>
          <div className="space-y-6">
            {levelDistribution.map(dist => (
              <div key={dist.level} className="group">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-2">
                  <span className="text-slate-500 group-hover:text-slate-900 transition-colors">{dist.level}</span>
                  <span className="text-slate-400">{dist.count} Estudiantes</span>
                </div>
                <div className="w-full bg-slate-50 h-4 rounded-full overflow-hidden border border-slate-100 p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                      dist.level === EducationLevel.INITIAL ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                      dist.level === EducationLevel.PRIMARY ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                      dist.level === EducationLevel.SECONDARY ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gradient-to-r from-purple-500 to-indigo-600'
                    }`}
                    style={{ width: `${students.length > 0 ? (dist.count / students.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Políticas y Reglas */}
        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <h3 className="text-xl font-black mb-8 flex items-center gap-3 relative z-10">
            <i className="fas fa-shield-check text-indigo-400"></i>
            Validaciones Activas
          </h3>
          <div className="space-y-4 relative z-10">
            {[
              { icon: 'fa-calendar-clock', title: 'Margen de Examen', desc: '48 horas previas requeridas para inscripción.', color: 'text-indigo-400' },
              { icon: 'fa-money-check-edit', title: 'Día de Vencimiento', desc: 'Cierre de ciclo de facturación el día 10.', color: 'text-emerald-400' },
              { icon: 'fa-user-graduate', title: 'Doble Carrera', desc: 'Permitido en Terciario bajo convenio.', color: 'text-purple-400' },
              { icon: 'fa-ban', title: 'Bloqueo Administrativo', desc: 'Restricción de exámenes por mora activa.', color: 'text-rose-400' },
            ].map((rule, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 ${rule.color}`}>
                  <i className={`fas ${rule.icon} text-xl`}></i>
                </div>
                <div>
                  <div className="text-sm font-black">{rule.title}</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
