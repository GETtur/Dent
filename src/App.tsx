import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Box, GraduationCap, Layers, Stethoscope, FileEdit, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Atlas3D from './pages/Atlas3D';
import Tests from './pages/Tests';
import Flashcards from './pages/Flashcards';
import Drugs from './pages/Drugs';
import Notes from './pages/Notes';
import Login from './pages/Login';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('dental_auth') === 'true';
  });

  const loc = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('dental_auth');
    localStorage.removeItem('dental_user');
    setIsAuthenticated(false);
  };

  // Если пользователь не авторизован — показываем экран входа
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const links = [
    { path: '/', icon: LayoutDashboard, label: 'Обзор' },
    { path: '/atlas', icon: Box, label: '3D Атлас' },
    { path: '/tests', icon: GraduationCap, label: 'Тренажер' },
    { path: '/cards', icon: Layers, label: 'Карточки' },
    { path: '/drugs', icon: Stethoscope, label: 'Препараты' },
    { path: '/notes', icon: FileEdit, label: 'Заметки' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-navy text-slate-100">
      {/* Навигационная панель */}
      <nav className="fixed md:sticky top-auto md:top-0 bottom-0 left-0 w-full md:w-64 md:h-screen glass-panel z-50 p-3 md:p-6 flex md:flex-col justify-around md:justify-start rounded-none md:rounded-r-2xl border-t md:border-t-0 md:border-r border-white/10">
        <div className="hidden md:block mb-8">
          <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-mint to-cyan">
            DENTAL OS
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-widest mt-1">STUDENT EDITION</p>
        </div>

        <div className="flex md:flex-col gap-2 w-full justify-around md:justify-start">
          {links.map((l) => {
            const active = loc.pathname === l.path;
            const Icon = l.icon;
            return (
              <Link
                key={l.path}
                to={l.path}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-mint/20 text-mint border border-mint/40 shadow-[0_0_15px_rgba(45,212,191,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} />
                <span className="hidden md:inline font-medium text-sm">{l.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Профиль и кнопка выхода внизу боковой панели */}
        <div className="hidden md:flex flex-col gap-3 mt-auto pt-4 border-t border-white/10">
          <div className="p-3 glass-panel text-xs text-slate-400">
            <div className="text-white font-bold flex items-center justify-between">
              <span>Ангелина</span>
              <span className="text-[10px] font-mono text-mint bg-mint/10 border border-mint/20 px-1.5 py-0.5 rounded">3 КУРС</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Стоматологический ф-т</div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-colors font-mono"
          >
            <LogOut size={16} />
            <span>Завершить сеанс</span>
          </button>
        </div>
      </nav>

      {/* Основной контент */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/atlas" element={<Atlas3D />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/cards" element={<Flashcards />} />
          <Route path="/drugs" element={<Drugs />} />
          <Route path="/notes" element={<Notes />} />
        </Routes>
      </main>
    </div>
  );
}