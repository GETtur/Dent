import { useEffect, useMemo, useState } from 'react';
import { RotateCw, Check, HelpCircle, Plus, Shuffle, RefreshCcw, Layers } from 'lucide-react';

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

export default function Flashcards() {
  const [allCards, setAllCards] = useState<any[]>([]);
  const [state, setState] = useState<any>({ review_card_ids: [] });
  const [mode, setMode] = useState<'random' | 'review' | 'all'>('random');
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', category: '' });

  const load = async () => {
    const [cards, progress] = await Promise.all([fetch('/api/flashcards').then(r => r.json()), fetch('/api/study-state').then(r => r.json())]);
    setAllCards(cards); setState(progress);
  };
  useEffect(() => { load(); }, []);

  const cards = useMemo(() => {
    if (mode === 'review') return allCards.filter(card => state.review_card_ids?.includes(card.id));
    return mode === 'random' ? shuffle(allCards) : allCards;
  }, [allCards, state.review_card_ids, mode]);
  const card = cards[idx % Math.max(cards.length, 1)];
  useEffect(() => { setIdx(0); setFlipped(false); }, [mode, allCards.length]);

  const mark = async (known: boolean) => {
    if (!card) return;
    const result = await fetch('/api/study/card', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cardId: card.id, known }) }).then(r => r.json());
    setState(result); setFlipped(false);
    setTimeout(() => setIdx(current => (current + 1) % Math.max(cards.length, 1)), 180);
  };

  const addCard = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/flashcards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (!response.ok) return;
    setForm({ question: '', answer: '', category: '' }); setShowForm(false); await load(); setMode('all');
  };

  if (!allCards.length) return <div className="text-mint animate-pulse p-8">Загрузка карточек...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-[fade-in_0.45s_ease-out]">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {([['random', 'Случайные', Shuffle], ['review', `Повторение · ${state.review_card_ids?.length || 0}`, RefreshCcw], ['all', 'Все', Layers]] as const).map(([key, label, Icon]) => <button key={key} onClick={() => setMode(key)} className={`px-3 py-2 text-xs rounded-lg flex items-center gap-1.5 transition-all ${mode === key ? 'bg-mint text-navy font-bold shadow-[0_0_14px_rgba(45,212,191,.35)]' : 'text-slate-400 hover:text-white'}`}><Icon size={14} />{label}</button>)}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-3 py-2 text-xs rounded-xl border border-mint/40 text-mint hover:bg-mint/10 flex gap-1.5 items-center"><Plus size={15} /> Добавить</button>
      </div>
      {showForm && <form onSubmit={addCard} className="nvidia-card p-4 grid gap-3 animate-[fade-in_0.25s_ease-out]">
        <div className="text-sm font-bold text-white">Новая карточка</div>
        <input required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Категория" className="input-field" />
        <textarea required value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} placeholder="Вопрос" className="input-field min-h-20" />
        <textarea required value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} placeholder="Ответ" className="input-field min-h-20" />
        <button className="bg-mint text-navy font-bold py-2.5 rounded-xl text-sm">Сохранить карточку</button>
      </form>}
      {!card ? <div className="nvidia-card p-10 text-center text-slate-400">В очереди повторения пока нет карточек. Отметьте «Не знаю» в случайном режиме — и она появится здесь.</div> : <>
        <div className="flex justify-between items-center text-xs text-slate-400"><span>{mode === 'review' ? 'Карточка на повторении' : `Карточка ${idx + 1} из ${cards.length}`}</span><span className="text-mint bg-mint/10 border border-mint/20 px-2.5 py-1 rounded-full">{card.category}</span></div>
        <button onClick={() => setFlipped(!flipped)} className="w-full min-h-80 glass-panel cursor-pointer p-8 flex flex-col justify-center items-center text-center relative border border-white/10 hover:border-mint/40 transition-all hover:shadow-[0_0_30px_rgba(45,212,191,.1)]">
          <span className="absolute top-4 right-4 text-slate-500 text-xs flex items-center gap-1"><RotateCw size={12} className={flipped ? 'animate-spin' : ''} /> Нажмите для переворота</span>
          {!flipped ? <div><div className="text-xs uppercase tracking-wider text-slate-400 mb-3">Вопрос</div><h3 className="text-xl font-semibold text-white leading-relaxed">{card.question}</h3></div> : <div className="animate-[fade-in_0.2s_ease-out]"><div className="text-xs uppercase tracking-wider text-mint mb-3">Ответ</div><p className="text-sm text-slate-200 leading-relaxed">{card.answer}</p></div>}
        </button>
        <div className="flex gap-3"><button onClick={() => mark(false)} className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-amber-400/10 text-slate-300 py-3 rounded-xl text-sm font-medium transition-colors"><HelpCircle size={16} /> Не знаю → повторить</button><button onClick={() => mark(true)} className="flex-1 flex items-center justify-center gap-2 bg-mint text-navy font-bold py-3 rounded-xl text-sm hover:bg-teal-300 transition-colors"><Check size={16} /> Знаю</button></div>
      </>}
    </div>
  );
}