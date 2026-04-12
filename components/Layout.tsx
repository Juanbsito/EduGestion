
import React, { useState } from 'react';
import { 
  Users, Home, BookOpen, ClipboardList, CreditCard, ChevronDown, 
  UserPlus, BarChart2, Calendar, GraduationCap, LogOut, Bell, X, Check, Settings
} from 'lucide-react';
import { Notification, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  userName?: string;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, userRole, userName, onLogout }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Generar Cuotas', message: 'Falta generar el ciclo de Marzo.', type: 'task', date: 'Hace 5 min', read: false },
    { id: '2', title: 'Mesa de Exámenes', message: 'Revisar inscritos en Matemática I.', type: 'info', date: 'Hoy, 09:00', read: false }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const menu = [
    { id: 'dashboard', label: 'Inicio', icon: Home, roles: ['superadmin', 'school_admin', 'cashier', 'administrative'] },
    { id: 'students', label: 'Alumnos', icon: Users, roles: ['superadmin', 'school_admin', 'administrative'], children: [
      { id: 'students-list', label: 'Lista de Alumnos' },
      { id: 'new-student', label: 'Nuevo Alumno', icon: UserPlus }
    ]},
    { id: 'academic', label: 'Académico', icon: BookOpen, roles: ['superadmin', 'school_admin', 'administrative'], children: [
      { id: 'subjects', label: 'Materias' },
      { id: 'careers', label: 'Carreras' },
      { id: 'enrollments', label: 'Inscripciones' }
    ]},
    { id: 'attendance', label: 'Asistencia', icon: ClipboardList, roles: ['superadmin', 'school_admin', 'teacher', 'administrative'] },
    { id: 'billing', label: 'Cobranzas', icon: CreditCard, roles: ['superadmin', 'cashier'], children: [
      { id: 'fees', label: 'Gestión de Cuotas' },
      { id: 'billing-config', label: 'Aranceles' }
    ]},
    { id: 'users', label: 'Usuarios', icon: Settings, roles: ['superadmin'] },
    { id: 'reports', label: 'Informes', icon: BarChart2, roles: ['superadmin', 'school_admin'] },
    { id: 'calendar', label: 'Calendario', icon: Calendar, roles: ['superadmin', 'school_admin', 'cashier', 'administrative'] }
  ].filter(item => item.roles.includes(userRole));

  const handleTabClick = (id: string, hasChildren: boolean) => {
    if (hasChildren) {
      setExpanded(expanded === id ? null : id);
    } else {
      setActiveTab(id);
    }
  };

  const getHeaderTitle = (id: string) => {
    switch (id) {
      case 'dashboard': return 'Panel de Inicio';
      case 'students-list': return 'Lista de Alumnos';
      case 'new-student': return 'Registro de Alumno';
      case 'subjects': return 'Materias';
      case 'careers': return 'Carreras';
      case 'enrollments': return 'Inscripciones';
      case 'attendance': return 'Control de Asistencia';
      case 'fees': return 'Gestión de Cuotas';
      case 'billing-config': return 'Configuración de Aranceles';
      case 'reports': return 'Informes Institucionales';
      case 'calendar': return 'Calendario Académico';
      case 'users': return 'Gestión de Usuarios';
      default: return id.replace('-', ' ').toUpperCase();
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-11 h-11 bg-[#1e293b] rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">EduManager</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestión Escolar</p>
          </div>
        </div>

        <nav className="flex-1 px-5 py-2 space-y-1 overflow-y-auto no-scrollbar">
          {menu.map(item => {
            const Icon = item.icon;
            const isTabActive = activeTab === item.id || (item.children && item.children.some(c => c.id === activeTab));
            const isExpanded = expanded === item.id || isTabActive;

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleTabClick(item.id, !!item.children)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isTabActive && !item.children ? 'bg-[#1e293b] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isTabActive && !item.children ? 'text-white' : 'text-slate-400'} />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </div>
                  {item.children && (
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {item.children && isExpanded && (
                  <div className="ml-5 pl-4 border-l border-slate-100 space-y-1 mt-1">
                    {item.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => setActiveTab(child.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          activeTab === child.id ? 'bg-slate-100 text-[#1e293b]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center text-white font-bold text-xs">
              {userName?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">
                {userRole === 'superadmin' ? 'Director' : 
                 userRole === 'cashier' ? 'Cobranza' : 
                 userRole === 'administrative' ? 'Administrativo' : 
                 userRole === 'school_admin' ? 'Administrador' : 'Personal'}
              </p>
            </div>
            <button onClick={onLogout} className="text-slate-400 hover:text-rose-600 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 min-h-screen relative">
        <header className="h-20 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 px-10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {getHeaderTitle(activeTab)}
          </h2>
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 bg-white"
             >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
             </button>
          </div>
        </header>

        {showNotifications && (
          <div className="absolute right-10 top-20 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-modal">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest">Notificaciones</h3>
              <button onClick={markAllAsRead} className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded-lg">
                Leído
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto p-2 bg-white">
              {notifications.map(n => (
                <div key={n.id} className={`p-4 rounded-xl mb-1 ${n.read ? 'opacity-40' : 'bg-slate-50 border border-slate-100'}`}>
                  <p className="text-sm font-bold text-slate-900">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-medium block mt-2">{n.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-10 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
