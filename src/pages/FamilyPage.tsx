import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Heart, Plus, X, Trash2, CalendarDays, GraduationCap, Cake, Plane, Clock, Stethoscope } from 'lucide-react';

const TYPE_INFO: Record<string, { label: string; icon: any; color: string }> = {
  school: { label: 'Escola', icon: GraduationCap, color: '#3b82f6' },
  birthday: { label: 'Aniversário', icon: Cake, color: '#ec4899' },
  trip: { label: 'Viagem', icon: Plane, color: '#8b5cf6' },
  family_time: { label: 'Tempo Família', icon: Heart, color: '#ef4444' },
  medical: { label: 'Médico', icon: Stethoscope, color: '#10b981' },
  other: { label: 'Outro', icon: CalendarDays, color: '#f59e0b' },
};

export default function FamilyPage() {
  const { familyEvents, addFamilyEvent, deleteFamilyEvent, currentUser } = useStore();
  const uid = currentUser?.id || '';
  const myEvents = familyEvents.filter(f => f.userId === uid);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: '', date: new Date().toISOString().split('T')[0],
    type: 'family_time' as keyof typeof TYPE_INFO, members: '', notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFamilyEvent({
      userId: uid, title: form.title, date: form.date,
      type: form.type as any, members: form.members.split(',').map(m => m.trim()).filter(Boolean), notes: form.notes,
    });
    setForm({ title: '', date: new Date().toISOString().split('T')[0], type: 'family_time', members: '', notes: '' });
    setShowForm(false);
  };

  const upcoming = [...myEvents].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dola-text flex items-center gap-2">
            <Heart size={24} className="text-dola-pink" />
            Área Familiar
          </h1>
          <p className="text-sm text-dola-muted mt-1">Organize a vida da sua família</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-dola-pink to-dola-accent2 text-white text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Novo Evento
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(TYPE_INFO).map(([key, info]) => {
          const count = myEvents.filter(e => e.type === key).length;
          const Icon = info.icon;
          return (
            <div key={key} className="glass rounded-2xl p-4 text-center card-hover">
              <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-2" style={{ background: `${info.color}15` }}>
                <Icon size={18} style={{ color: info.color }} />
              </div>
              <p className="text-lg font-bold text-dola-text">{count}</p>
              <p className="text-[10px] text-dola-muted">{info.label}</p>
            </div>
          );
        })}
      </div>

      {/* Events */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {upcoming.map(event => {
          const info = TYPE_INFO[event.type] || TYPE_INFO.other;
          const Icon = info.icon;
          const isPast = new Date(event.date) < new Date();
          return (
            <div key={event.id} className={`glass rounded-2xl p-4 card-hover border-l-2 ${isPast ? 'opacity-60' : ''}`} style={{ borderLeftColor: info.color }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl" style={{ background: `${info.color}15` }}>
                    <Icon size={16} style={{ color: info.color }} />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: info.color }}>{info.label}</span>
                </div>
                <button onClick={() => deleteFamilyEvent(event.id)} className="p-1 rounded-lg text-dola-muted/30 hover:text-dola-danger transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="text-sm font-semibold text-dola-text mt-3">{event.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Clock size={12} className="text-dola-muted" />
                <span className="text-xs text-dola-muted">
                  {new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              {event.members.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {event.members.map(m => (
                    <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-dola-border/50 text-dola-muted">{m}</span>
                  ))}
                </div>
              )}
              {event.notes && <p className="text-xs text-dola-muted/60 mt-2">{event.notes}</p>}
            </div>
          );
        })}
      </div>

      {myEvents.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <Heart size={40} className="mx-auto mb-4 text-dola-muted/30" />
          <p className="text-dola-muted">Nenhum evento familiar</p>
          <button onClick={() => setShowForm(true)} className="text-sm text-dola-accent mt-2 hover:underline">+ Criar primeiro evento</button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-dola-text">Novo Evento Familiar</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-dola-border/50"><X size={18} className="text-dola-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título" required />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Tipo</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}>
                    {Object.entries(TYPE_INFO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Data</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <input value={form.members} onChange={e => setForm({ ...form, members: e.target.value })} placeholder="Membros (separados por vírgula)" />
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notas" rows={2} />
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-dola-pink to-dola-accent2 text-white font-semibold text-sm hover:opacity-90">
                Criar Evento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
