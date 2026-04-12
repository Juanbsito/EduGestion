
import React, { Suspense, useState } from 'react';
import { AuthProvider, useAuth } from './authContext';
import Layout from './components/Layout';
import Dashboard from './Dashboard';
import StudentsModule from './components/StudentsModule';
import AcademicModule from './components/AcademicModule';
import ExamsModule from './components/ExamsModule';
import BillingModule from './components/BillingModule';
import NewStudentForm from './components/NewStudentForm';
import AttendanceModule from './components/AttendanceModule';
import ReportsModule from './components/ReportsModule';
import CalendarModule from './components/CalendarModule';
import UserManagement from './components/UserManagement';
import PaymentPortal from './components/PaymentPortal';
import { INITIAL_PAYMENTS } from './constants';
import { ShieldAlert, Loader2, ShieldCheck, CreditCard } from 'lucide-react';
import { supabase } from './supabaseClient';
import { Student } from './types';

const LoginForm = ({ onOpenPaymentPortal }: { onOpenPaymentPortal: () => void }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e?: any, demoEmail?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    await supabase.auth.signInWithOtp({ email: demoEmail || email });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-600 p-10 text-center text-white">
           <h1 className="text-2xl font-black tracking-tight">EduManager Pro</h1>
           <p className="text-indigo-100 font-bold text-xs mt-1 uppercase tracking-widest opacity-80">Gestión Institucional</p>
        </div>
        <div className="p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="correo@ejemplo.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
            </button>
          </form>
          <div className="relative flex items-center"><span className="flex-1 border-t border-slate-100"></span><span className="mx-4 text-[10px] font-black text-slate-300 uppercase">Prueba el sistema</span><span className="flex-1 border-t border-slate-100"></span></div>
          <button onClick={() => handleLogin(null, 'superadmin@edumanager.pro')} className="w-full bg-slate-800 text-white p-4 rounded-xl font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
            <ShieldCheck size={18} /> Acceso Demo Superadmin
          </button>
          <div className="pt-4 border-t border-slate-50">
            <button 
              onClick={onOpenPaymentPortal}
              className="w-full bg-white text-indigo-600 border border-indigo-100 p-4 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard size={18} /> Pago de Cuotas (Padres)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { user, profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showPaymentPortal, setShowPaymentPortal] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;
  
  if (showPaymentPortal) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-6 max-w-4xl mx-auto">
          <button 
            onClick={() => setShowPaymentPortal(false)}
            className="mb-8 text-slate-400 font-bold flex items-center gap-2 hover:text-slate-600 transition-colors"
          >
            ← Volver al inicio
          </button>
          <PaymentPortal />
        </div>
      </div>
    );
  }

  if (!user) return <LoginForm onOpenPaymentPortal={() => setShowPaymentPortal(true)} />;
  if (!profile) return <div className="p-20 text-center"><ShieldAlert className="mx-auto text-rose-500" size={64} /><h2 className="text-xl font-bold mt-4">Perfil no encontrado</h2><button onClick={signOut} className="text-indigo-600 font-bold mt-4 underline">Cerrar Sesión</button></div>;

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setActiveTab('new-student');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard schoolId={profile.school_id} />;
      case 'students-list': return <StudentsModule schoolId={profile.school_id} onEditStudent={handleEditStudent} />;
      case 'new-student': return (
        <NewStudentForm 
          initialData={editingStudent || undefined}
          onCancel={() => { setEditingStudent(null); setActiveTab('students-list'); }} 
          onSave={() => { setEditingStudent(null); setActiveTab('students-list'); }} 
        />
      );
      case 'subjects': return <AcademicModule key="subjects" view="subjects" />;
      case 'careers': return <AcademicModule key="careers" view="careers" />;
      case 'enrollments': return <AcademicModule key="enrollments" view="enrollments" />;
      case 'exams-schedule': return <ExamsModule key="exams" view="schedule" />;
      case 'exams-enroll': return <ExamsModule key="exams-e" view="enrollment" />;
      case 'fees': return <BillingModule view="fees" />;
      case 'billing-config': return <BillingModule view="config" />;
      case 'attendance': return <AttendanceModule />;
      case 'reports': return <ReportsModule />;
      case 'calendar': return <CalendarModule />;
      case 'users': return <UserManagement />;
      default: return <Dashboard schoolId={profile.school_id} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      userRole={profile.role} 
      userName={profile.full_name} 
      onLogout={signOut}
    >
      <Suspense fallback={<div className="p-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>}>
        {renderContent()}
      </Suspense>
    </Layout>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
