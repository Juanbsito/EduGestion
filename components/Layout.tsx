
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'fa-chart-pie' },
    { path: '/students', label: 'Alumnos', icon: 'fa-user-graduate' },
    { path: '/careers', label: 'Carreras', icon: 'fa-graduation-cap' },
    { path: '/academic', label: 'Académico', icon: 'fa-book' },
    { path: '/billing', label: 'Cobranzas', icon: 'fa-file-invoice-dollar' },
    { path: '/exams', label: 'Exámenes', icon: 'fa-calendar-check' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-800 flex items-center gap-3">
          <i className="fas fa-university text-indigo-400"></i>
          <span>EduGestión</span>
        </div>
        <nav className="flex-1 mt-6 px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${
                location.pathname === item.path 
                  ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
          <span>v1.2.0 - Pro</span>
          <span className="italic">Admin Mode</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className={`fas ${navItems.find(n => n.path === location.pathname)?.icon || 'fa-school'} text-indigo-500`}></i>
            {navItems.find(n => n.path === location.pathname)?.label || 'Sistema'}
          </h1>
          <div className="flex items-center gap-6">
             <div className="relative">
                <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                  <i className="fas fa-bell"></i>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                </button>
             </div>
             <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-slate-800">Admin Edu</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Superusuario</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md">
                  AD
                </div>
             </div>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
