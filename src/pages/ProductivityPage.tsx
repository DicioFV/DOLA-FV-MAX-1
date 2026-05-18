import { useStore } from '../store/useStore';
import { TrendingUp, Clock, Target, Zap, Brain, Coffee, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

export default function ProductivityPage() {
  const { tasks, habits, events, currentUser } = useStore();
  const uid = currentUser?.id || '';

  const myTasks = tasks.filter(t => t.userId === uid);
  const myHabits = habits.filter(h => h.userId === uid);
  const myEvents = events.filter(e => e.userId === uid);

  const done = myTasks.filter(t => t.status === 'done').length;
  const total = myTasks.length;
  const productivity = total > 0 ? Math.round((done / total) * 100) : 0;
  const totalTime = myTasks.reduce((s, t) => s + t.timeSpent, 0);
  const avgHabits = myHabits.length > 0 ? Math.round(myHabits.reduce((s, h) => s + h.streak, 0) / myHabits.length) : 0;

  const weekData = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => ({
    day,
    foco: 50 + Math.floor(Math.random() * 45),
    energia: 40 + Math.floor(Math.random() * 50),
  }));

  const radarData = [
    { area: 'Foco', value: productivity },
    { area: 'Hábitos', value: Math.min(avgHabits * 10, 100) },
    { area: 'Tarefas', value: Math.min(done * 15, 100) },
    { area: 'Agenda', value: Math.min(myEvents.length * 20, 100) },
    { area: 'Energia', value: 70 + Math.floor(Math.random() * 20) },
    { area: 'Equilíbrio', value: 60 + Math.floor(Math.random() * 30) },
  ];

  // AI Insights
  const urgentTasks = myTasks.filter(t => t.priority === 'urgent' && t.status !== 'done');
  const overloaded = myTasks.filter(t => t.status !== 'done').length > 10;
  const lowHabits = myHabits.filter(h => h.streak < 3);

  const insights = [
    ...(urgentTasks.length > 0 ? [{ type: 'warning', icon: AlertTriangle, text: `${urgentTasks.length} tarefa(s) urgente(s) precisam de atenção imediata`, color: '#ef4444' }] : []),
    ...(overloaded ? [{ type: 'warning', icon: Brain, text: 'Você está com excesso de tarefas. Considere delegar ou reagendar.', color: '#f59e0b' }] : []),
    ...(lowHabits.length > 0 ? [{ type: 'info', icon: Target, text: `${lowHabits.length} hábito(s) com streak baixo. Mantenha a consistência!`, color: '#3b82f6' }] : []),
    { type: 'success', icon: CheckCircle2, text: `Produtividade atual: ${productivity}%. ${productivity >= 70 ? 'Excelente ritmo!' : 'Continue progredindo!'}`, color: '#10b981' },
    { type: 'info', icon: Coffee, text: 'Sugestão: Faça pausas de 5min a cada 25min de foco (Pomodoro)', color: '#8b5cf6' },
    { type: 'info', icon: Clock, text: `Tempo total investido: ${Math.floor(totalTime / 60)}h ${totalTime % 60}min em tarefas`, color: '#06b6d4' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dola-text flex items-center gap-2">
          <TrendingUp size={24} className="text-dola-accent" />
          IA de Produtividade
        </h1>
        <p className="text-sm text-dola-muted mt-1">Análise inteligente do seu desempenho</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5 text-center">
          <Zap size={24} className="mx-auto text-dola-accent mb-2" />
          <p className="text-3xl font-bold text-dola-text">{productivity}%</p>
          <p className="text-xs text-dola-muted">Produtividade</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <Clock size={24} className="mx-auto text-dola-cyan mb-2" />
          <p className="text-3xl font-bold text-dola-text">{Math.floor(totalTime / 60)}h</p>
          <p className="text-xs text-dola-muted">Horas Focadas</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <Target size={24} className="mx-auto text-dola-warning mb-2" />
          <p className="text-3xl font-bold text-dola-text">{done}/{total}</p>
          <p className="text-xs text-dola-muted">Tarefas Completas</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <Brain size={24} className="mx-auto text-dola-accent2 mb-2" />
          <p className="text-3xl font-bold text-dola-text">{avgHabits}</p>
          <p className="text-xs text-dola-muted">Média Streaks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly chart */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dola-text mb-4">Performance Semanal</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="gradFoco" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradEnergia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '12px', fontSize: '12px', color: '#e4e4ef' }} />
              <Area type="monotone" dataKey="foco" stroke="#6366f1" fill="url(#gradFoco)" strokeWidth={2} />
              <Area type="monotone" dataKey="energia" stroke="#10b981" fill="url(#gradEnergia)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dola-text mb-4">Análise 360°</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2a2a3e" />
              <PolarAngleAxis dataKey="area" tick={{ fill: '#8888a0', fontSize: 10 }} />
              <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
          <Brain size={16} className="text-dola-accent2" />
          Insights da IA DOLA
        </h3>
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-dola-bg/50">
                <div className="p-2 rounded-lg shrink-0" style={{ background: `${insight.color}15` }}>
                  <Icon size={16} style={{ color: insight.color }} />
                </div>
                <p className="text-sm text-dola-text leading-relaxed">{insight.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Routine Suggestion */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
          <Clock size={16} className="text-dola-success" />
          Rotina Ideal Sugerida pela IA
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { time: '05:30', activity: 'Despertar + Meditação', icon: '🌅', color: '#f59e0b' },
            { time: '06:00', activity: 'Exercício Físico', icon: '🏋️', color: '#10b981' },
            { time: '07:00', activity: 'Leitura Bíblica', icon: '📖', color: '#8b5cf6' },
            { time: '08:00', activity: 'Bloco de Foco #1', icon: '🎯', color: '#6366f1' },
            { time: '10:00', activity: 'Reuniões', icon: '💼', color: '#3b82f6' },
            { time: '12:00', activity: 'Almoço + Família', icon: '🍽️', color: '#ec4899' },
            { time: '14:00', activity: 'Bloco de Foco #2', icon: '⚡', color: '#f59e0b' },
            { time: '17:00', activity: 'Tempo com Filhos', icon: '❤️', color: '#ef4444' },
          ].map(item => (
            <div key={item.time} className="p-3 rounded-xl bg-dola-bg/50 flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <div>
                <p className="text-xs font-bold" style={{ color: item.color }}>{item.time}</p>
                <p className="text-xs text-dola-text">{item.activity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
