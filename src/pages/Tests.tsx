import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Plus, Shuffle, RefreshCcw } from 'lucide-react';

const shuffle = <T,>(items: T[]) => Array.isArray(items) ? [...items].sort(() => Math.random() - 0.5) : [];

export default function Tests() {
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [state, setState] = useState<any>({ review_test_ids: [] });
  const [mode, setMode] = useState<'random' | 'review'>('random');
  const [curr, setCurr] = useState(0); 
  const [selected, setSelected] = useState<number | null>(null); 
  const [score, setScore] = useState(0); 
  const [finished, setFinished] = useState(false); 
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', category: '', explanation: '', correct: 0, options: ['', '', '', ''] });

  const load = async () => { 
    try {
      const [testsRes, progressRes] = await Promise.all([
        fetch('/api/tests').then(r => r.json()).catch(() => []), 
        fetch('/api/study-state').then(r => r.json()).catch(() => ({ review_test_ids: [] }))
      ]);
      setAllQuestions(Array.isArray(testsRes) ? testsRes : []); 
      setState(progressRes || { review_test_ids: [] }); 
    } catch (e) {
      setAllQuestions([]);
    }
  };

  useEffect(() => { load(); }, []);

  const questions = useMemo(() => {
    if (!Array.isArray(allQuestions)) return [];
    const filtered = mode === 'review' 
      ? allQuestions.filter(q => Array.isArray(state?.review_test_ids) && state.review_test_ids.includes(q.id)) 
      : allQuestions;
    return shuffle(filtered);
  }, [allQuestions, state?.review_test_ids, mode]);

  useEffect(() => { setCurr(0); setSelected(null); setScore(0); setFinished(false); }, [mode, allQuestions.length]);

  const q = questions[curr];

  const handleSelect = async (answer: number) => { 
    if (selected !== null || !q) return; 
    setSelected(answer); 
    const correct = answer === q.correct; 
    if (correct) setScore(s => s + 1); 
    try {
      const result = await fetch('/api/study/test-answer', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ questionId: q.id, correct }) 
      }).then(r => r.json()); 
      if (result) setState(result); 
    } catch (e) {}
  };

  const next = () => { 
    if (curr + 1 < questions.length) { 
      setCurr(c => c + 1); 
      setSelected(null); 
    } else {
      setFinished(true); 
    }
  };

  const addTest = async (event: React.FormEvent) => { 
    event.preventDefault(); 
    const response = await fetch('/api/tests', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(form) 
    }); 
    if (!response.ok) return; 
    setShowForm(false); 
    setForm({ question: '', category: '', explanation: '', correct: 0, options: ['', '', '', ''] }); 
    await load(); 
  };

  if (!Array.isArray(allQuestions) || allQuestions.length === 0) {
    return <div className="text-mint animate-pulse p-8">Загрузка тестов...</div>;
  }

  // Безопасное приведение options к массиву (если пришла строка из БД)
  const optionsArray = q ? (Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options) : [])) : [];

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-[fade-in_.45s_ease-out]">
      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
          <button onClick={() => setMode('random')} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${mode === 'random' ? 'bg-mint text-navy font-bold' : 'text-slate-400'}`}><Shuffle size={14}/> Случайные</button>
          <button onClick={() => setMode('review')} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${mode === 'review' ? 'bg-mint text-navy font-bold' : 'text-slate-400'}`}><RefreshCcw size={14}/> Повторение · {Array.isArray(state?.review_test_ids) ? state.review_test_ids.length : 0}</button>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-3 py-1.5 rounded-lg text-xs border border-mint/40 text-mint flex items-center gap-1"><Plus size={15}/> Добавить тест</button>
      </div>

      {showForm && (
        <form onSubmit={addTest} className="nvidia-card p-4 grid gap-3">
          <b className="text-white text-sm">Новый вопрос</b>
          <input required className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" placeholder="Категория" value={form.category} onChange={e => setForm({...form, category:e.target.value})}/>
          <textarea required className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white min-h-20" placeholder="Вопрос" value={form.question} onChange={e => setForm({...form, question:e.target.value})}/>
          {form.options.map((option, index) => (
            <label key={index} className="flex gap-2 items-center text-sm text-slate-300">
              <input type="radio" checked={form.correct === index} onChange={() => setForm({...form, correct:index})}/>
              <input required className="bg-white/5 border border-white/10 rounded-xl p-2 text-sm text-white flex-1" placeholder={`Вариант ${index + 1}${index === form.correct ? ' — правильный' : ''}`} value={option} onChange={e => { const options=[...form.options]; options[index]=e.target.value; setForm({...form,options}); }}/>
            </label>
          ))}
          <textarea className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white min-h-16" placeholder="Пояснение (необязательно)" value={form.explanation} onChange={e => setForm({...form, explanation:e.target.value})}/>
          <button className="bg-mint text-navy font-bold py-2.5 rounded-xl">Сохранить тест</button>
        </form>
      )}

      {!q ? (
        <div className="nvidia-card p-10 text-center text-slate-400">В повторении пока нет ошибок. Решайте случайные вопросы — неверные автоматически появятся здесь.</div>
      ) : finished ? (
        <div className="nvidia-card p-8 text-center">
          <h2 className="text-2xl font-bold text-white">Раунд завершён</h2>
          <div className="text-6xl font-black text-mint my-5">{Math.round(score / questions.length * 100)}%</div>
          <p className="text-slate-300 mb-6">Правильных ответов: {score} из {questions.length}</p>
          <button onClick={() => {setCurr(0);setScore(0);setSelected(null);setFinished(false);}} className="mx-auto bg-mint text-navy font-bold px-6 py-3 rounded-xl flex items-center gap-2"><RotateCcw size={16}/> Новый раунд</button>
        </div>
      ) : (
        <>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{mode === 'review' ? `Ошибка ${curr + 1} из ${questions.length}` : `Вопрос ${curr + 1} из ${questions.length}`}</span>
            <span className="text-cyan bg-cyan/20 px-3 py-1 rounded-full">{q.category}</span>
          </div>
          <div className="glass-panel p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-semibold text-white mb-6 leading-relaxed">{q.question}</h3>
            <div className="space-y-3">
              {optionsArray.map((option: string, index: number) => { 
                let styles = 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'; 
                if (selected !== null) {
                  styles = index === q.correct ? 'bg-mint/20 border-mint text-mint' : index === selected ? 'bg-red-500/20 border-red-500 text-red-300' : styles; 
                }
                return (
                  <button key={index} disabled={selected !== null} onClick={() => handleSelect(index)} className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all ${styles}`}>
                    {option}
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div className="mt-6 p-4 rounded-xl bg-navy/80 border border-white/10">
                <div className="flex gap-2 mb-2 text-sm font-medium">
                  {selected === q.correct ? <CheckCircle2 className="text-mint" size={18}/> : <XCircle className="text-red-400" size={18}/>}
                  <span className={selected === q.correct ? 'text-mint' : 'text-red-400'}>
                    {selected === q.correct ? 'Верно!' : 'Ошибка — вопрос добавлен в повторение'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{q.explanation}</p>
                <button onClick={next} className="mt-4 flex items-center gap-2 bg-mint text-navy font-bold px-5 py-2.5 rounded-lg text-sm ml-auto">Дальше <ArrowRight size={16}/></button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}