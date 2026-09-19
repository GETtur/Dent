import { useState, useEffect } from 'react';
import { Search, AlertTriangle } from 'lucide-react';

export default function Drugs() {
  const [drugs, setDrugs] = useState<any[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/drugs').then(r => r.json()).then(setDrugs);
  }, []);

  const filtered = drugs.filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.group.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex gap-3 items-start text-amber-200 text-xs">
        <AlertTriangle className="text-amber-400 shrink-0" size={18} />
        <div>
          <strong>Учебный справочник:</strong> Информация предназначена исключительно для студентов медицинских специальностей. Назначение препаратов и выбор дозировок проводится на основе официальных клинических рекомендаций Минздрава.
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Поиск по названию или группе (напр. Артикаин, НПВС, Антибиотики)..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full glass-panel pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-mint transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(d => (
          <div key={d.id} className="glass-panel p-5 flex flex-col justify-between hover:border-cyan/40 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white text-base">{d.name}</h3>
                <span className="text-[11px] font-medium bg-cyan/10 text-cyan border border-cyan/20 px-2 py-0.5 rounded-full">{d.group}</span>
              </div>
              <div className="space-y-2 text-xs text-slate-300 mt-3">
                <p><strong className="text-slate-100">Действие:</strong> {d.action}</p>
                <p><strong className="text-slate-100">Показания:</strong> {d.indications}</p>
                <p><strong className="text-red-300">Противопоказания:</strong> {d.contra}</p>
                <p><strong className="text-slate-100">Форма выпуска:</strong> {d.forms}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
