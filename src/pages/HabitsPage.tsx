import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Target, Plus, X, Flame, Trophy, Trash2 } from 'lucide-react';
import { format, subDays } from 'date-fns';

const CATEGORIES = ['Saúde', 'Espiritual', 'Estudos', 'Família', 'Financeiro', 'Pessoal'];
const ICONS = ['🏋️', '📖', '💧', '🧘', '📚', '😴', '🙏', '🏃', '🍎', '💰', '📝', '❤️', '🎯', '🧠', '🌅'];

export default function HabitsPage() {
  const { habits, addHabit, toggleHabitDay, deleteHabit, currentUser } = useStore();
  const uid = currentUser?.id || '';
  const myHabits = habits.filter(h => h.userId === uid);
  const [showForm, setShowForm] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({ name: '', icon: '🏋️', category: 'Saúde', target: 7 });

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return { date: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE').substring(0, 3), day: format(d, 'd') };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addHabit({ userId: uid, name: form.name, icon: form.icon, category: form.category, target: form.target });
    setForm({ name: '', icon: '🏋️', category: 'Saúde', target: 7 });
    setShowForm(false);
  };

  const totalCompleted = myHabits.filter(h => h.completedDates.includes(today)).length;
  const overallStreak = myHabits.reduce((s, h) => s + h.streak, 0);
  const bestStreak = Math.max(...myHabits.map(h => h.bestStreak), 0);

  // Gamification level
  const totalDays = myHabits.reduce((s, h) => s + h.completedDates.length, 0);
  const level = Math.floor(totalDays / 10) + 1;
  const xp = totalDays % 10;

  const getMedal = (streak: number) => {
    if (streak >= 90) return '🏆';
    if (streak >= 60) return '🥇';
    if (streak >= 30) return '🥈';
    if (streak >= 7) return '🥉';
    return '';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dola-text flex items-center gap-2">
            <Target size={24} className="text-dola-warning" />
            Rastreador de Hábitos
          </h1>
          <p className="text-sm text-dola-muted mt-1">{totalCompleted}/{myHabits.length} concluídos hoje</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Novo Hábito
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-3xl mb-2">🔥</div>
          <p className="text-2xl font-bold text-dola-warning">{overallStreak}</p>
          <p className="text-xs text-dola-muted">Total Streaks</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-2xl font-bold text-dola-accent">{bestStreak}</p>
          <p className="text-xs text-dola-muted">Melhor Streak</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-3xl mb-2">⭐</div>
          <p className="text-2xl font-bold text-dola-accent2">Nível {level}</p>
          <div className="mt-2 h-2 bg-dola-border rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-dola-accent to-dola-accent2 rounded-full transition-all" style={{ width: `${xp * 10}%` }} />
          </div>
          <p className="text-[10px] text-dola-muted mt-1">{xp}/10 XP</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-2xl font-bold text-dola-success">{totalDays}</p>
          <p className="text-xs text-dola-muted">Dias Totais</p>
        </div>
      </div>

      {/* Habits Grid */}
      <div className="space-y-3">
        {myHabits.map(habit => {
          const doneToday = habit.completedDates.includes(today);
          const medal = getMedal(habit.streak);
          return (
            <div key={habit.id} className={`glass rounded-2xl p-4 card-hover ${doneToday ? 'border border-dola-success/30' : ''}`}>
              <div className="flex items-center gap-4">
                {/* Icon + name */}
                <button
                  onClick={() => toggleHabitDay(habit.id, today)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                    doneToday ? 'bg-dola-success/20 scale-110' : 'bg-dola-bg/50 hover:bg-dola-accent/10'
                  }`}
                >
                  {habit.icon}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-dola-text">{habit.name}</p>
                    {medal && <span className="text-sm">{medal}</span>}
                    {doneToday && <span className="text-[10px] px-2 py-0.5 rounded-full bg-dola-success/20 text-dola-success font-medium">✓ Feito</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-dola-warning font-semibold">
                      <Flame size={12} /> {habit.streak} dias
                    </span>
                    <span className="flex items-center gap-1 text-xs text-dola-muted">
                      <Trophy size={12} /> Best: {habit.bestStreak}
                    </span>
                    <span className="text-[10px] text-dola-muted px-2 py-0.5 rounded-full bg-dola-border/50">{habit.category}</span>
                  </div>
                </div>

                {/* Week view */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {last7Days.map(day => {
                    const done = habit.completedDates.includes(day.date);
                    return (
                      <button
                        key={day.date}
                        onClick={() => toggleHabitDay(habit.id, day.date)}
                        className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center transition-all ${
                          done ? 'bg-dola-success/20 text-dola-success' : 'bg-dola-bg/50 text-dola-muted/40 hover:bg-dola-border/50'
                        }`}
                      >
                        <span className="text-[8px] font-medium">{day.label}</span>
                        <span className="text-[10px] font-bold">{day.day}</span>
                      </button>
                    );
                  })}
                </div>

                <button onClick={() => deleteHabit(habit.id)} className="p-1.5 rounded-lg text-dola-muted/30 hover:text-dola-danger hover:bg-dola-danger/10 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {myHabits.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <Target size={40} className="mx-auto mb-4 text-dola-muted/30" />
          <p className="text-dola-muted">Nenhum hábito criado</p>
          <button onClick={() => setShowForm(true)} className="text-sm text-dola-accent mt-2 hover:underline">+ Criar primeiro hábito</button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-dola-text">Novo Hábito</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-dola-border/50"><X size={18} className="text-dola-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do hábito" required />
              <div>
                <label className="block text-xs text-dola-muted mb-2">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setForm({ ...form, icon })} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${form.icon === icon ? 'bg-dola-accent/20 ring-2 ring-dola-accent' : 'bg-dola-bg/50 hover:bg-dola-border/50'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Categoria</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Meta/semana</label>
                  <input type="number" min={1} max={7} value={form.target} onChange={e => setForm({ ...form, target: Number(e.target.value) })} />
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white font-semibold text-sm hover:opacity-90">
                Criar Hábito
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
