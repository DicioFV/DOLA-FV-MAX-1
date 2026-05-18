import { useStore } from '../store/useStore';
import {
  CheckSquare, Clock, Target, TrendingUp, Wallet, CalendarDays,
  ArrowUpRight, ArrowDownRight, Flame, Zap, Heart
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];

export default function DashboardPage() {
  const { tasks, events, habits, finances, reminders, currentUser } = useStore();
  const uid = currentUser?.id || '';

  const myTasks = tasks.filter(t => t.userId === uid);
  const myEvents = events.filter(e => e.userId === uid);
  const myHabits = habits.filter(h => h.userId === uid);
  const myFinances = finances.filter(f => f.userId === uid);
  const myReminders = reminders.filter(r => r.userId === uid && !r.done);

  const today = new Date().toISOString().split('T')[0];
  const todayEvents = myEvents.filter(e => e.date === today);

  const tasksDone = myTasks.filter(t => t.status === 'done').length;
  const tasksDoing = myTasks.filter(t => t.status === 'doing').length;
  const tasksTotal = myTasks.length;
  const productivity = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  const totalIncome = myFinances.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0);
  const totalExpense = myFinances.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0);
  const balance = totalIncome - totalExpense;

  const totalStreak = myHabits.reduce((s, h) => s + h.streak, 0);

  // Chart data
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const productivityData = weekDays.map((day, _i) => ({
    day,
    produtividade: 60 + Math.floor(Math.random() * 35),
    tarefas: 3 + Math.floor(Math.random() * 8),
  }));

  const sectorData = ['Negócios', 'Família', 'Saúde', 'Espiritual', 'Estudos', 'Marketing'].map(sector => ({
    sector,
    value: myTasks.filter(t => t.sector === sector).length || Math.floor(Math.random() * 5 + 1),
  }));
  void productivityData;

  const radarData = [
    { area: 'Negócios', value: 85 },
    { area: 'Família', value: 70 },
    { area: 'Saúde', value: 75 },
    { area: 'Espiritual', value: 90 },
    { area: 'Estudos', value: 65 },
    { area: 'Financeiro', value: 80 },
  ];

  const financeChartData = [
    { mes: 'Jan', receita: 78000, despesa: 45000 },
    { mes: 'Fev', receita: 82000, despesa: 48000 },
    { mes: 'Mar', receita: 85000, despesa: 50000 },
    { mes: 'Abr', receita: 90000, despesa: 47000 },
    { mes: 'Mai', receita: 88000, despesa: 52000 },
    { mes: 'Jun', receita: totalIncome, despesa: totalExpense },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const KPICard = ({ icon: Icon, label, value, sub, color, trend }: any) => (
    <div className="glass rounded-2xl p-5 card-hover animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl`} style={{ background: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-dola-success' : 'text-dola-danger'}`}>
            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-dola-text">{value}</p>
      <p className="text-xs text-dola-muted mt-1">{label}</p>
      {sub && <p className="text-[10px] text-dola-muted/60 mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dola-text">
            {greeting()}, <span className="gradient-text">{currentUser?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-dola-muted mt-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
            <Flame size={16} className="text-dola-warning streak-fire" />
            <span className="text-sm font-semibold text-dola-warning">{totalStreak} streaks</span>
          </div>
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
            <Zap size={16} className="text-dola-accent" />
            <span className="text-sm font-semibold text-dola-accent">{productivity}%</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={CheckSquare} label="Tarefas Concluídas" value={`${tasksDone}/${tasksTotal}`} sub={`${tasksDoing} em andamento`} color="#6366f1" trend={12} />
        <KPICard icon={CalendarDays} label="Eventos Hoje" value={todayEvents.length} sub={`${myReminders.length} lembretes pendentes`} color="#8b5cf6" />
        <KPICard icon={Wallet} label="Saldo do Mês" value={`R$ ${(balance / 1000).toFixed(0)}k`} sub={`Receita: R$ ${(totalIncome / 1000).toFixed(0)}k`} color="#10b981" trend={8} />
        <KPICard icon={Target} label="Hábitos Ativos" value={myHabits.length} sub={`Melhor streak: ${Math.max(...myHabits.map(h => h.bestStreak), 0)} dias`} color="#f59e0b" trend={5} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Productivity Chart */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dola-text flex items-center gap-2">
              <TrendingUp size={16} className="text-dola-accent" />
              Produtividade Semanal
            </h3>
            <span className="text-xs text-dola-muted">Últimos 7 dias</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={productivityData}>
              <defs>
                <linearGradient id="gradProd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '12px', fontSize: '12px', color: '#e4e4ef' }}
              />
              <Area type="monotone" dataKey="produtividade" stroke="#6366f1" fillOpacity={1} fill="url(#gradProd)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Finance Chart */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dola-text flex items-center gap-2">
              <Wallet size={16} className="text-dola-success" />
              Fluxo Financeiro
            </h3>
            <span className="text-xs text-dola-muted">Últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={financeChartData}>
              <XAxis dataKey="mes" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '12px', fontSize: '12px', color: '#e4e4ef' }}
                formatter={(value: any) => `R$ ${(Number(value) / 1000).toFixed(0)}k`}
              />
              <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today Events */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
            <CalendarDays size={16} className="text-dola-accent2" />
            Agenda de Hoje
          </h3>
          <div className="space-y-2.5 max-h-64 overflow-y-auto">
            {todayEvents.length === 0 ? (
              <p className="text-sm text-dola-muted text-center py-4">Sem eventos hoje</p>
            ) : todayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(event => (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-dola-bg/50">
                <div className="w-1 h-10 rounded-full" style={{ background: event.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dola-text truncate">{event.title}</p>
                  <p className="text-xs text-dola-muted">{event.startTime} - {event.endTime}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-dola-muted font-medium">{event.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
            <Target size={16} className="text-dola-pink" />
            Distribuição por Setor
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sectorData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {sectorData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '12px', fontSize: '12px', color: '#e4e4ef' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {sectorData.map((s, i) => (
              <div key={s.sector} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-[10px] text-dola-muted">{s.sector}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Life Balance Radar */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
            <Heart size={16} className="text-dola-danger" />
            Equilíbrio de Vida
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2a2a3e" />
              <PolarAngleAxis dataKey="area" tick={{ fill: '#8888a0', fontSize: 10 }} />
              <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Habits Quick View */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-dola-text flex items-center gap-2">
            <Flame size={16} className="text-dola-warning" />
            Hábitos de Hoje
          </h3>
          <span className="text-xs text-dola-muted">{myHabits.filter(h => h.completedDates.includes(today)).length}/{myHabits.length} concluídos</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {myHabits.map(habit => {
            const doneToday = habit.completedDates.includes(today);
            return (
              <div key={habit.id} className={`p-3 rounded-xl text-center transition-all ${doneToday ? 'bg-dola-success/10 border border-dola-success/30' : 'bg-dola-bg/50 border border-dola-border'}`}>
                <span className="text-2xl">{habit.icon}</span>
                <p className="text-xs font-medium text-dola-text mt-1.5 truncate">{habit.name}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Flame size={12} className="text-dola-warning" />
                  <span className="text-xs font-bold text-dola-warning">{habit.streak}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending reminders */}
      {myReminders.length > 0 && (
        <div className="glass rounded-2xl p-5 border border-dola-warning/20">
          <h3 className="text-sm font-semibold text-dola-text mb-3 flex items-center gap-2">
            <Clock size={16} className="text-dola-warning" />
            Lembretes Pendentes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {myReminders.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-dola-bg/50">
                <div className={`w-2 h-2 rounded-full ${
                  r.priority === 'critical' ? 'bg-dola-danger animate-pulse' :
                  r.priority === 'high' ? 'bg-dola-warning' : 'bg-dola-info'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dola-text truncate">{r.title}</p>
                  <p className="text-xs text-dola-muted">{r.category} • {r.priority}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
