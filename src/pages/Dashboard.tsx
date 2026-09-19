import { useEffect, useState } from 'react';
import { Target, Flame, CheckCircle2, Award, Zap, Activity, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/progress').then(r => r.json()).then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-nvidia-neon font-mono text-sm tracking-widest animate-pulse">
          <Activity className="animate-spin" size={20} /> INITIALIZING DENTAL_OS KERNEL...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Главный Hero-баннер в стиле NVIDIA RTX Keynote */}
      <div className="nvidia-card p-8 relative overflow-hidden border-nvidia-neon/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-nvidia-neon/20 via-nvidia-cyan/10 to-transparent blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest bg-nvidia-dark text-nvidia-neon border border-nvidia-neon/40 shadow-[0_0_12px_rgba(0,255,135,0.3)]">
              <span className="w-2 h-2 rounded-full bg-nvidia-neon animate-ping" />
              SYSTEM ACTIVE // 3RD YEAR
            </span>
            <span className="text-slate-500 font-mono text-xs">BUILD 2026.09</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            С возвращением, <span className="text-transparent bg-clip-text bg-gradient-to-r from-nvidia-neon to-nvidia-cyan glow-text">{data.name}</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Интерактивный учебный терминал стоматолога готов к работе. Запланирована калибровка эндодонтических протоколов и фармакотерапии.
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <Link
              to="/atlas"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-nvidia-neon to-emerald-400 text-abyss font-bold text-sm tracking-wide flex items-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(0,255,135,0.4)] transition-all"
            >
              Запустить 3D Атлас <ChevronRight size={16} />
            </Link>
            <Link
              to="/tests"
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-sm transition-all"
            >
              Пройти тестирование
            </Link>
          </div>
        </div>
      </div>

      {/* Метрики телеметрии */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ОТВЕТОВ В ТЕСТАХ', val: data.tests_answered || 0, icon: Target, glow: 'text-nvidia-cyan', progress: `${Math.min((data.tests_answered || 0) * 2, 100)}%` },
          { label: 'ТОЧНОСТЬ ОТВЕТОВ', val: `${data.accuracy || 0}%`, icon: CheckCircle2, glow: 'text-nvidia-neon', progress: `${data.accuracy || 0}%` },
          { label: 'КАРТОЧЕК ОСВОЕНО', val: data.learned_cards || 0, icon: Award, glow: 'text-emerald-400', progress: `${Math.min((data.learned_cards || 0) * 2, 100)}%` },
          { label: 'УДАРНЫЙ СТРИК', val: `${data.streak || 0} ДНЕЙ`, icon: Flame, glow: 'text-amber-400', progress: `${data.streak ? '100' : '0'}%` },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="nvidia-card p-5 group">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-mono tracking-widest text-slate-400">{s.label}</span>
                <Icon size={18} className={`${s.glow} group-hover:scale-110 transition-transform`} />
              </div>
              <div className="text-2xl md:text-3xl font-mono font-black text-white">{s.val}</div>
              <div className="w-full bg-white/10 h-1 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-nvidia-neon to-nvidia-cyan h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,255,135,0.8)]" 
                  style={{ width: s.progress }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Блоки оперативного плана */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="nvidia-card p-6">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Zap size={18} className="text-nvidia-neon" />
              <span>ПРИОРИТЕТНОЕ ПОВТОРЕНИЕ</span>
            </div>
            <span className="text-xs font-mono text-nvidia-neon">[AUTO-TARGET]</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl flex justify-between items-center hover:border-nvidia-neon/30 transition-all">
              <div><div className="text-white font-medium">Ошибки в тестах</div><div className="text-xs text-slate-400 mt-0.5">Автоматическая очередь повторения</div></div>
              <span className="text-xs font-mono px-2 py-1 rounded bg-nvidia-neon/10 text-nvidia-neon border border-nvidia-neon/20">{data.review_test_ids?.length || 0} ВОПРОСОВ</span>
            </div>

            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl flex justify-between items-center hover:border-nvidia-neon/30 transition-all">
              <div><div className="text-white font-medium">Карточки на повторение</div><div className="text-xs text-slate-400 mt-0.5">Отметки «Не знаю»</div></div>
              <span className="text-xs font-mono px-2 py-1 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">{data.review_card_ids?.length || 0} КАРТОЧЕК</span>
            </div>
          </div>
        </div>

        <div className="nvidia-card p-6">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <ShieldCheck size={18} className="text-nvidia-cyan" />
              <span>СТАТУС ПОДГОТОВКИ К ЭКЗАМЕНУ</span>
            </div>
            <span className="text-xs font-mono text-nvidia-cyan">ГОТОВНОСТЬ: 78%</span>
          </div>
          
          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>ТЕРАПЕВТИЧЕСКАЯ СТОМАТОЛОГИЯ</span>
                <span className="text-nvidia-neon">88%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-nvidia-neon h-full rounded-full" style={{ width: '88%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>ХИРУРГИЯ И АНЕСТЕЗИОЛОГИЯ</span>
                <span className="text-nvidia-cyan">74%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-nvidia-cyan h-full rounded-full" style={{ width: '74%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>ФАРМАКОТЕРАПИЯ</span>
                <span className="text-emerald-400">70%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: '70%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
