import { useState } from 'react';
import { useStore, Event } from '../store/useStore';
import { CalendarDays, Plus, X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EVENT_TYPES = [
  { value: 'business', label: 'Negócios', color: '#6366f1' },
  { value: 'family', label: 'Família', color: '#ec4899' },
  { value: 'financial', label: 'Financeiro', color: '#10b981' },
  { value: 'health', label: 'Saúde', color: '#f59e0b' },
  { value: 'spiritual', label: 'Espiritual', color: '#8b5cf6' },
  { value: 'personal', label: 'Pessoal', color: '#06b6d4' },
];

export default function AgendaPage() {
  const { events, addEvent, deleteEvent, currentUser } = useStore();
  const uid = currentUser?.id || '';
  const myEvents = events.filter(e => e.userId === uid);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const [form, setForm] = useState({
    title: '', description: '', startTime: '09:00', endTime: '10:00',
    type: 'business' as Event['type'], recurring: 'none' as Event['recurring'], reminder: true,
  });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayEvents = myEvents.filter(e => e.date === selectedDateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const typeInfo = EVENT_TYPES.find(t => t.value === form.type);
    addEvent({
      userId: uid,
      title: form.title,
      description: form.description,
      date: selectedDateStr,
      startTime: form.startTime,
      endTime: form.endTime,
      type: form.type,
      recurring: form.recurring,
      reminder: form.reminder,
      color: typeInfo?.color || '#6366f1',
    });
    setForm({ title: '', description: '', startTime: '09:00', endTime: '10:00', type: 'business', recurring: 'none', reminder: true });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dola-text flex items-center gap-2">
            <CalendarDays size={24} className="text-dola-accent" />
            Agenda Inteligente
          </h1>
          <p className="text-sm text-dola-muted mt-1">Gerencie seus compromissos</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass rounded-xl flex overflow-hidden">
            {(['month', 'week', 'day'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-2 text-xs font-medium transition-colors ${view === v ? 'bg-dola-accent text-white' : 'text-dola-muted hover:text-dola-text'}`}>
                {v === 'month' ? 'Mês' : v === 'week' ? 'Semana' : 'Dia'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={16} /> Novo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-dola-border/50 text-dola-muted"><ChevronLeft size={18} /></button>
            <h3 className="text-base font-semibold text-dola-text capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-dola-border/50 text-dola-muted"><ChevronRight size={18} /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-dola-muted/60 py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayEvts = myEvents.filter(e => e.date === dateStr);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(day)}
                  className={`relative p-2 rounded-xl text-sm transition-all min-h-[60px] flex flex-col items-center ${
                    isSelected ? 'bg-dola-accent/20 border border-dola-accent/40' :
                    isToday(day) ? 'bg-dola-accent/5 border border-dola-accent/20' :
                    'hover:bg-dola-border/30 border border-transparent'
                  } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                >
                  <span className={`text-xs font-medium ${isToday(day) ? 'text-dola-accent font-bold' : 'text-dola-text'}`}>
                    {format(day, 'd')}
                  </span>
                  {dayEvts.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {dayEvts.slice(0, 3).map(e => (
                        <div key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ background: e.color }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Detail */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
            <Clock size={16} className="text-dola-accent2" />
            {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </h3>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
            {dayEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-dola-muted">Sem eventos</p>
                <button onClick={() => setShowForm(true)} className="text-xs text-dola-accent mt-2 hover:underline">
                  + Adicionar evento
                </button>
              </div>
            ) : dayEvents.map(event => (
              <div key={event.id} className="p-3 rounded-xl bg-dola-bg/50 border-l-2 relative group" style={{ borderLeftColor: event.color }}>
                <button onClick={() => deleteEvent(event.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-dola-danger/10">
                  <X size={12} className="text-dola-danger" />
                </button>
                <p className="text-sm font-medium text-dola-text">{event.title}</p>
                <p className="text-xs text-dola-muted mt-1">{event.startTime} - {event.endTime}</p>
                {event.description && <p className="text-xs text-dola-muted/60 mt-1">{event.description}</p>}
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${event.color}20`, color: event.color }}>
                  {EVENT_TYPES.find(t => t.value === event.type)?.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-dola-text">Novo Evento</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-dola-border/50"><X size={18} className="text-dola-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título do evento" required />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição (opcional)" rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Início</label>
                  <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Fim</label>
                  <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-dola-muted mb-1">Tipo</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Event['type'] })}>
                  {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-dola-muted mb-1">Recorrência</label>
                <select value={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.value as Event['recurring'] })}>
                  <option value="none">Nenhuma</option>
                  <option value="daily">Diária</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>
              <p className="text-xs text-dola-muted">
                Data: <span className="font-semibold text-dola-text">{format(selectedDate, 'dd/MM/yyyy')}</span>
              </p>
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
                Criar Evento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
