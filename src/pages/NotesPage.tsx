import { useState } from 'react';
import { useStore } from '../store/useStore';
import { FileText, Plus, X, Trash2, Pin, Search } from 'lucide-react';

const CATEGORIES = ['Geral', 'Ideias', 'Reuniões', 'Projetos', 'Pessoal', 'Estudos'];

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, currentUser } = useStore();
  const uid = currentUser?.id || '';
  const myNotes = notes.filter(n => n.userId === uid);
  const [showForm, setShowForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', content: '', category: 'Geral' });

  const filtered = myNotes
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const activeNote = myNotes.find(n => n.id === selectedNote);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNote({ userId: uid, title: form.title, content: form.content, category: form.category, pinned: false });
    setForm({ title: '', content: '', category: 'Geral' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dola-text flex items-center gap-2">
            <FileText size={24} className="text-dola-cyan" />
            Notas
          </h1>
          <p className="text-sm text-dola-muted mt-1">{myNotes.length} notas</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Nova Nota
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dola-muted" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar notas..." className="!pl-11" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Notes list */}
        <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {filtered.map(note => (
            <button
              key={note.id}
              onClick={() => setSelectedNote(note.id)}
              className={`w-full text-left p-4 rounded-xl transition-all ${
                selectedNote === note.id ? 'glass border border-dola-accent/30' : 'hover:bg-dola-border/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-dola-text truncate">{note.title}</p>
                {note.pinned && <Pin size={12} className="text-dola-accent shrink-0" />}
              </div>
              <p className="text-xs text-dola-muted mt-1 line-clamp-2">{note.content}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-dola-border/50 text-dola-muted">{note.category}</span>
                <span className="text-[10px] text-dola-muted/50">
                  {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-dola-muted">
              <FileText size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma nota</p>
            </div>
          )}
        </div>

        {/* Note editor */}
        <div className="lg:col-span-2 glass rounded-2xl p-5 min-h-[400px]">
          {activeNote ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateNote(activeNote.id, { pinned: !activeNote.pinned })} className={`p-1.5 rounded-lg transition-colors ${activeNote.pinned ? 'text-dola-accent bg-dola-accent/10' : 'text-dola-muted hover:text-dola-accent'}`}>
                    <Pin size={14} />
                  </button>
                  <select
                    value={activeNote.category}
                    onChange={e => updateNote(activeNote.id, { category: e.target.value })}
                    className="!text-xs !p-1.5 !rounded-lg !bg-dola-bg/50 !border-dola-border/50 w-auto"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={() => { deleteNote(activeNote.id); setSelectedNote(null); }} className="p-1.5 rounded-lg text-dola-muted hover:text-dola-danger hover:bg-dola-danger/10">
                  <Trash2 size={14} />
                </button>
              </div>
              <input
                value={activeNote.title}
                onChange={e => updateNote(activeNote.id, { title: e.target.value })}
                className="!text-lg !font-bold !border-none !bg-transparent !p-0 !mb-3"
                placeholder="Título"
              />
              <textarea
                value={activeNote.content}
                onChange={e => updateNote(activeNote.id, { content: e.target.value })}
                className="flex-1 !border-none !bg-transparent !p-0 !rounded-none resize-none text-sm leading-relaxed"
                placeholder="Comece a escrever..."
              />
              <p className="text-[10px] text-dola-muted/40 mt-3">
                Atualizado: {new Date(activeNote.updatedAt).toLocaleString('pt-BR')}
              </p>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-dola-muted">
              <div className="text-center">
                <FileText size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Selecione uma nota</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-dola-text">Nova Nota</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-dola-border/50"><X size={18} className="text-dola-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título" required />
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Conteúdo" rows={4} />
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white font-semibold text-sm hover:opacity-90">
                Criar Nota
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
