import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';

export default function Notes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const load = () => fetch('/api/notes').then(r => r.json()).then(setNotes);
  useEffect(() => { load(); }, []);

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, tags })
    });
    setTitle(''); setContent(''); setTags('');
    load();
  };

  const removeNote = async (id: number) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-1/3">
        <form onSubmit={addNote} className="glass-panel p-5 space-y-4 sticky top-6">
          <h3 className="font-bold text-white text-base">Добавить заметку</h3>
          <input
            placeholder="Тема заметки"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-mint"
          />
          <textarea
            placeholder="Текст (классификации, дозировки, наблюдения)..."
            rows={4}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-mint resize-none"
          />
          <input
            placeholder="Тег (напр. хирургия, терапия)"
            value={tags}
            onChange={e => setTags(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-mint"
          />
          <button
            type="submit"
            className="w-full bg-mint text-navy font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-teal-300 transition-colors"
          >
            <Plus size={18} /> Сохранить в базу
          </button>
        </form>
      </div>

      <div className="w-full lg:w-2/3 grid grid-cols-1 gap-4">
        {notes.map(n => (
          <div key={n.id} className="glass-panel p-5 relative group border border-white/10">
            <button
              onClick={() => removeNote(n.id)}
              className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors p-1"
            >
              <Trash2 size={16} />
            </button>
            <h4 className="font-bold text-white text-base mb-2">{n.title}</h4>
            <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed mb-4">{n.content}</p>
            {n.tags && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-mint/10 text-mint border border-mint/20 px-2 py-0.5 rounded-md">
                <Tag size={10} /> {n.tags}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
