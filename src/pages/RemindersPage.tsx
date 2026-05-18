import { useState } from 'react';
import { useStore, Reminder } from '../store/useStore';
import { Bell, Plus, X, Check, Trash2, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Negócios', 'Família', 'Saúde', 'Espiritual', 'Financeiro', 'Pessoal'];
const PRIORITY_COLORS: Record<string, string> = {
  low: '#8888a0', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444',
};

export default function RemindersPage() {
  const { reminders, addReminder, updateReminder, deleteReminder, currentUser } = useStore();
  const uid = currentUser?.id || '';
  const myReminders = reminders.filter(r => r.userId === uid);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');

  const [form, setForm] = useState({
    title: '', datetime: '', priority: 'medium' as Reminder['priority'],
    category: 'Pessoal', recurring: 'none' as Reminder['recurring'],
  });

  const filtered = myReminders.filter(r =>
    filter === 'all' ? true : filter === 'pending' ? !r.done : r.done
  ).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReminder({ userId: uid, title: form.title, datetime: new Date(form.datetime).toISOString(), priority: form.priority, category: form.category, recurring: form.recurring, done: false });
    setForm({ title: '', datetime: '', priority: 'medium', category: 'Pessoal', recurring: 'none' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dola-text flex items-center gap-2">
            <Bell size={24} className="text-dola-warning" />
            Alarmes & Lembretes
          </h1>
          <p className="text-sm text-dola-muted mt-1">{myReminders.filter(r => !r.done).length} pendentes</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass rounded-xl flex overflow-hidden">
            {(['all', 'pending', 'done'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-xs font-medium ${filter === f ? 'bg-dola-accent text-white' : 'text-dola-muted'}`}>
                {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : 'Feitos'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white text-sm font-medium hover:opacity-90">
            <Plus size={16} /> Novo
          </button>
        </div>
      </div>

      {/* Critical alerts */}
      {myReminders.some(r => r.priority === 'critical' && !r.done) && (
        <div className="glass rounded-xl p-3 border border-dola-danger/30 flex items-center gap-3 animate-pulse">
          <AlertCircle size={16} className="text-dola-danger" />
          <span className="text-sm text-dola-danger font-medium">
            Alertas críticos pendentes!
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(r => {
          const isPast = new Date(r.datetime) < new Date() && !r.done;
          return (
            <div key={r.id} className={`glass rounded-2xl p-4 card-hover border ${
              r.done ? 'border-dola-border/30 opacity-60' :
              isPast ? 'border-dola-danger/30' :
              r.priority === 'critical' ? 'border-dola-danger/30' : 'border-transparent'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PRIORITY_COLORS[r.priority] }} />
                  <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: PRIORITY_COLORS[r.priority] }}>
                    {r.priority}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateReminder(r.id, { done: !r.done })} className={`p-1.5 rounded-lg transition-colors ${r.done ? 'text-dola-success bg-dola-success/10' : 'text-dola-muted hover:text-dola-success hover:bg-dola-success/10'}`}>
                    <Check size={14} />
                  </button>
                  <button onClick={() => deleteReminder(r.id)} className="p-1.5 rounded-lg text-dola-muted hover:text-dola-danger hover:bg-dola-danger/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className={`text-sm font-medium ${r.done ? 'text-dola-muted line-through' : 'text-dola-text'}`}>{r.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-dola-muted">
                  {new Date(r.datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {new Date(r.datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-dola-border/50 text-dola-muted">{r.category}</span>
              </div>
              {r.recurring !== 'none' && (
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-dola-accent/10 text-dola-accent font-medium">
                  🔄 {r.recurring === 'daily' ? 'Diário' : r.recurring === 'weekly' ? 'Semanal' : 'Mensal'}
                </span>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-dola-muted">
            <Bell size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum lembrete encontrado</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-dola-text">Novo Lembrete</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-dola-border/50"><X size={18} className="text-dola-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Tomar remédio, Buscar filhos..." required />
              <input type="datetime-local" value={form.datetime} onChange={e => setForm({ ...form, datetime: e.target.value })} required />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Prioridade</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Reminder['priority'] })}>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Categoria</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-dola-muted mb-1">Recorrência</label>
                <select value={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.value as Reminder['recurring'] })}>
                  <option value="none">Nenhuma</option>
                  <option value="daily">Diária</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white font-semibold text-sm hover:opacity-90">
                Criar Lembrete
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
