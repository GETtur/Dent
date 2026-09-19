import { useState, useEffect, useRef } from 'react';
import { Lock, User, ShieldCheck, AlertCircle, ArrowRight, Sparkles, Activity, Cpu, Stethoscope, Layers, Flame } from 'lucide-react';

function CyberHologramCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 460);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 480);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Point3D { x: number; y: number; z: number; isRoot: boolean; brightness: number; size: number }
    const points: Point3D[] = [];
    const totalPoints = 3600;

    for (let i = 0; i < totalPoints; i++) {
      const isRoot = Math.random() > 0.46;
      let x = 0, y = 0, z = 0;

      if (!isRoot) {
        const u = Math.random();
        const v = Math.random() * Math.PI * 2;
        const crownW = 54 + 14 * Math.cos(2 * v);
        const crownD = 48 + 12 * Math.sin(2 * v);
        
        x = Math.cos(v) * crownW * Math.pow(u, 0.45);
        z = Math.sin(v) * crownD * Math.pow(u, 0.45);
        
        const bumps = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 9;
        const heightFactor = Math.random();
        y = -75 + heightFactor * 65 + bumps * (1 - heightFactor);
      } else {
        const rootIndex = Math.floor(Math.random() * 3);
        const side = [-25, 0, 25][rootIndex];
        const progress = Math.random();
        
        const curve = Math.sin(progress * Math.PI) * (rootIndex === 0 ? -9 : rootIndex === 2 ? 9 : 3);
        const radius = (1 - progress * 0.82) * 17 * (0.8 + Math.random() * 0.4);
        const angle = Math.random() * Math.PI * 2;

        x = side + curve + Math.cos(angle) * radius;
        z = Math.sin(angle) * radius * 0.85;
        y = -10 + progress * 115;
      }

      points.push({
        x, y, z,
        isRoot,
        brightness: Math.random() * 0.6 + 0.4,
        size: Math.random() * 1.5 + 0.8
      });
    }

    const sparks = Array.from({ length: 40 }, () => ({
      x: (Math.random() - 0.5) * 320,
      y: (Math.random() - 0.5) * 320,
      speed: Math.random() * 0.7 + 0.3,
      pulse: Math.random() * Math.PI * 2
    }));

    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      t += 0.018;

      const cx = width / 2;
      const cy = height / 2 - 35;
      const floatY = Math.sin(t * 1.6) * 9;

      ctx.save();
      ctx.translate(cx, cy + 115);

      const palmGlow = ctx.createRadialGradient(0, 20, 10, 0, 20, 150);
      palmGlow.addColorStop(0, 'rgba(0, 130, 255, 0.42)');
      palmGlow.addColorStop(0.5, 'rgba(0, 229, 255, 0.15)');
      palmGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = palmGlow;
      ctx.beginPath();
      ctx.arc(0, 20, 150, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00B4D8';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#00F5D4';
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.moveTo(-115, -15);
      ctx.bezierCurveTo(-100, 50, -35, 75, 0, 75);
      ctx.bezierCurveTo(35, 75, 100, 50, 115, -15);
      ctx.stroke();

      const fingers = [
        { startX: -90, cpx: -75, cpy: -45, endX: -50, endY: -75 },
        { startX: -32, cpx: -20, cpy: -55, endX: -12, endY: -88 },
        { startX: 32, cpx: 20, cpy: -55, endX: 12, endY: -88 },
        { startX: 90, cpx: 75, cpy: -45, endX: 50, endY: -75 }
      ];

      fingers.forEach((f, i) => {
        ctx.beginPath();
        ctx.moveTo(f.startX, 28);
        ctx.quadraticCurveTo(f.cpx, f.cpy, f.endX, f.endY + Math.sin(t * 2.2 + i) * 3);
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.ellipse(0, 48, 80, 20, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 255, 135, 0.55)';
      ctx.stroke();
      ctx.restore();

      const rotY = t * 0.65;
      const cosR = Math.cos(rotY);
      const sinR = Math.sin(rotY);

      const projected = points.map((p) => {
        const rotX = p.x * cosR - p.z * sinR;
        const rotZ = p.x * sinR + p.z * cosR;
        const fov = 340 / (340 + rotZ);

        return {
          screenX: cx + rotX * fov,
          screenY: cy + floatY + p.y * fov,
          depth: rotZ,
          size: p.size * fov,
          isRoot: p.isRoot,
          brightness: p.brightness
        };
      });

      projected.sort((a, b) => b.depth - a.depth);

      const toothGlow = ctx.createRadialGradient(cx, cy - 30 + floatY, 12, cx, cy - 30 + floatY, 165);
      toothGlow.addColorStop(0, 'rgba(0, 255, 180, 0.13)');
      toothGlow.addColorStop(0.55, 'rgba(0, 229, 255, 0.045)');
      toothGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = toothGlow;
      ctx.beginPath(); ctx.arc(cx, cy - 30 + floatY, 165, 0, Math.PI * 2); ctx.fill();

      ctx.save();
      ctx.strokeStyle = 'rgba(126, 255, 224, 0.13)';
      ctx.lineWidth = 0.7;
      for (let i = 0; i < projected.length - 90; i += 90) {
        const a = projected[i], b = projected[i + 53];
        if (!a.isRoot && !b.isRoot) { ctx.beginPath(); ctx.moveTo(a.screenX, a.screenY); ctx.lineTo(b.screenX, b.screenY); ctx.stroke(); }
      }
      ctx.restore();

      ctx.shadowBlur = 10;
      projected.forEach((p) => {
        const depthAlpha = Math.min(1, Math.max(0.18, (p.depth + 75) / 150));
        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, Math.max(0.7, p.size), 0, Math.PI * 2);

        if (p.isRoot) {
          ctx.fillStyle = `rgba(0, 229, 255, ${depthAlpha * p.brightness})`;
          ctx.shadowColor = '#00E5FF';
        } else {
          ctx.fillStyle = `rgba(0, 255, 135, ${depthAlpha * p.brightness})`;
          ctx.shadowColor = '#00FF87';
        }
        ctx.fill();
      });

      sparks.forEach((s) => {
        s.y -= s.speed;
        s.pulse += 0.05;
        if (s.y < -160) s.y = 160;

        ctx.beginPath();
        ctx.arc(cx + s.x, cy + s.y + floatY, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 255, 240, ${(Math.sin(s.pulse) + 1) * 0.45})`;
        ctx.shadowColor = '#00F5D4';
        ctx.shadowBlur = 12;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<any>({ tests_answered: 0, accuracy: 0, learned_cards: 0, review_card_ids: [], review_test_ids: [], streak: 0 });

  useEffect(() => {
    fetch('/api/progress').then(response => response.ok ? response.json() : null).then(data => data && setProgress(data)).catch(() => undefined);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (username.trim() === 'Angelina' && password === '12345678') {
        localStorage.setItem('dental_auth', 'true');
        localStorage.setItem('dental_user', 'Angelina');
        onLogin();
      } else {
        setError('Неверный идентификатор или пароль доступа');
        setIsLoading(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 lg:p-10 relative overflow-hidden font-mono select-none">
      <div className="absolute top-1/4 left-8 w-[650px] h-[650px] bg-cyan-500/15 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 right-8 w-[650px] h-[650px] bg-emerald-500/15 rounded-full blur-[180px] pointer-events-none" />

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <div className="w-full h-80 sm:h-96 md:h-[450px] relative flex items-center justify-center">
            <div className="absolute top-2 left-4 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-cyan-400/40 text-[11px] text-cyan-300 shadow-[0_0_20px_rgba(0,229,255,0.25)]">
              <Activity size={14} className="animate-pulse text-cyan-400" />
              <span>DENTAL MATRIX // QUANTUM TOOTH</span>
            </div>
            <CyberHologramCanvas />
          </div>

          <div className="w-full p-3.5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-cyan-500/25 text-xs text-slate-400 shadow-[0_0_25px_rgba(0,229,255,0.1)] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Cpu size={15} className="text-cyan-400 animate-spin" />
              <span>Квантовый моляр на силовой ладони</span>
            </div>
            <span className="text-emerald-400 font-bold tracking-wider">ONLINE 60 FPS</span>
          </div>
        </div>

        <div className="lg:col-span-4 flex justify-center">
          <div
            className="w-full max-w-md p-8 md:p-10 rounded-3xl relative border border-white/20 transition-all duration-500"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              boxShadow: 'inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.3), 0 30px 70px 0 rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 229, 255, 0.15)'
            }}
          >
            <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900/60 border border-cyan-400/50 mb-3 shadow-[0_0_25px_rgba(0,229,255,0.35)] relative">
                <span className="text-2xl animate-bounce">🦷</span>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                DENTAL OS
              </h1>
              <p className="text-xs text-slate-400 tracking-widest mt-1.5">STUDENT WORKSTATION // 3 КУРС</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 flex items-center gap-2.5 text-red-300 text-xs animate-in fade-in">
                  <AlertCircle size={16} className="shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-300 mb-2 font-bold tracking-wider">ИДЕНТИФИКАТОР (ЛОГИН)</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400/80" size={17} />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Angelina"
                    className="w-full bg-slate-950/65 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all duration-300 placeholder:text-slate-500 focus:shadow-[0_0_20px_rgba(0,229,255,0.25)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-2 font-bold tracking-wider">ПАРОЛЬ ДОСТУПА</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400/80" size={17} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/65 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all duration-300 placeholder:text-slate-500 focus:shadow-[0_0_20px_rgba(0,229,255,0.25)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-black text-sm tracking-wider flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_35px_rgba(0,229,255,0.45)] transition-all duration-300 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {isLoading ? (
                  <span>СИНХРОНИЗАЦИЯ...</span>
                ) : (
                  <>
                    <span>ВОЙТИ В КАБИНЕТ</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <ShieldCheck size={14} /> СТОМАТОЛОГИЯ
              </span>
              <span className="flex items-center gap-1 text-emerald-300">
                <Sparkles size={13} /> ДЛЯ АНГЕЛИНЫ
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:col-span-4 flex-col gap-4">
          <div className="p-5 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
              <span className="text-xs text-cyan-300 font-bold flex items-center gap-2">
                <Stethoscope size={15} /> СТУДЕНТКА: АНГЕЛИНА
              </span>
              <span className="text-[10px] bg-cyan-400/10 text-cyan-300 border border-cyan-400/25 px-2 py-0.5 rounded-full">3 КУРС</span>
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Факультет:</span>
                <span className="text-slate-200">Стоматологический</span>
              </div>
              <div className="flex justify-between"><span>Точность ответов:</span><span className="text-emerald-400 font-bold">{progress.accuracy || 0}%</span></div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] space-y-3.5">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <span className="flex items-center gap-1.5">
                <Layers size={14} className="text-emerald-400" /> ПРОГРАММА СЕМЕСТРА
              </span>
              <span className="text-emerald-400">LIVE</span>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Всего ответов в тренажёре</span>
                <span className="text-cyan-300">{progress.tests_answered || 0}</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((progress.tests_answered || 0) * 2, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Карточек освоено</span>
                <span className="text-teal-300">{progress.learned_cards || 0}</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((progress.learned_cards || 0) * 2, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Очередь повторения</span>
                <span className="text-emerald-300">{(progress.review_card_ids?.length || 0) + (progress.review_test_ids?.length || 0)}</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(((progress.review_card_ids?.length || 0) + (progress.review_test_ids?.length || 0)) * 10, 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/15 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Flame size={20} className="animate-bounce" />
            </div>
            <div className="text-xs">
              <div className="text-white font-bold">Ударный темп: {progress.streak || 0} дней подряд</div>
              <div className="text-slate-400 text-[11px]">Синхронизировано с учебным прогрессом</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}