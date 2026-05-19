import { useState, useMemo } from 'react';
import { useStore, FinanceEntry } from '../store/useStore';
import { 
  Wallet, Plus, X, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, 
  Trash2, Edit3
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  AreaChart, Area, CartesianGrid, Legend
} from 'recharts';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#ef4444'];
const INCOME_CATS = ['Empresa', 'Consultoria', 'Investimentos', 'Freelance', 'Salário', 'Outros'];
const EXPENSE_CATS = ['Escritório', 'Equipe', 'Marketing', 'Família', 'Saúde', 'Educação', 'Transporte', 'Alimentação', 'Moradia', 'Lazer', 'Impostos', 'Empréstimos', 'Outros'];

type ViewPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function FinancePage() {
  const { finances, addFinance, deleteFinance, updateFinance, currentUser } = useStore();
  const uid = currentUser?.id || '';
  const myFinances = finances.filter(f => f.userId === uid);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [form, setForm] = useState<{
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount: string;
    date: string;
    status: FinanceEntry['status'];
    recurring: boolean;
    dueDate?: string;
  }>({
    type: 'expense', category: 'Escritório', description: '', amount: '', 
    date: new Date().toISOString().split('T')[0], status: 'pending', recurring: false,
  });

  // Calculate totals
  const totalIncome = myFinances.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0);
  const totalExpense = myFinances.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0);
  const balance = totalIncome - totalExpense;
  const pending = myFinances.filter(f => f.status === 'pending').reduce((s, f) => s + f.amount, 0);
  const overdue = myFinances.filter(f => f.status === 'overdue').reduce((s, f) => s + f.amount, 0);

  // Filter by period
  const getDateRange = () => {
    const now = selectedDate;
    switch (viewPeriod) {
      case 'daily':
        return { start: now, end: now };
      case 'weekly':
        return { start: startOfWeek(now, { weekStartsOn: 0 }), end: endOfWeek(now, { weekStartsOn: 0 }) };
      case 'monthly':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'yearly':
        return { start: startOfYear(now), end: endOfYear(now) };
    }
  };

  const { start, end } = getDateRange();
  const periodFinances = myFinances.filter(f => {
    const d = new Date(f.date);
    return d >= start && d <= end;
  });

  const periodIncome = periodFinances.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0);
  const periodExpense = periodFinances.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0);
  const periodBalance = periodIncome - periodExpense;

  // Chart data - Monthly comparison (last 12 months)
  const monthlyChartData = useMemo(() => {
    const months = eachMonthOfInterval({ 
      start: subMonths(new Date(), 11), 
      end: new Date() 
    });
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthFinances = myFinances.filter(f => {
        const d = new Date(f.date);
        return d >= monthStart && d <= monthEnd;
      });
      
      return {
        month: format(month, 'MMM', { locale: ptBR }),
        receita: monthFinances.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0),
        despesa: monthFinances.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0),
        saldo: monthFinances.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0) - 
               monthFinances.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0),
      };
    });
  }, [myFinances]);

  // Category breakdown
  const expenseByCat = useMemo(() => {
    return EXPENSE_CATS.map(cat => ({
      name: cat,
      value: periodFinances.filter(f => f.type === 'expense' && f.category === cat).reduce((s, f) => s + f.amount, 0),
    })).filter(d => d.value > 0);
  }, [periodFinances]);

  // Reserved for future use
  void periodFinances;

  const filtered = periodFinances.filter(f => filter === 'all' ? true : f.type === filter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateFinance(editingId, {
        type: form.type, category: form.category, description: form.description,
        amount: parseFloat(form.amount), date: form.date, status: form.status, recurring: form.recurring,
      });
      setEditingId(null);
    } else {
      addFinance({
        userId: uid, type: form.type, category: form.category, description: form.description,
        amount: parseFloat(form.amount), date: form.date, status: form.status, recurring: form.recurring,
      });
    }
    setForm({ type: 'expense', category: 'Escritório', description: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'pending', recurring: false });
    setShowForm(false);
  };

  const startEdit = (f: FinanceEntry) => {
    setForm({
      type: f.type,
      category: f.category,
      description: f.description,
      amount: f.amount.toString(),
      date: f.date,
      status: f.status,
      recurring: f.recurring,
    });
    setEditingId(f.id);
    setShowForm(true);
  };

  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const periodLabel = {
    daily: format(selectedDate, "'Dia' dd/MM/yyyy", { locale: ptBR }),
    weekly: `Semana ${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`,
    monthly: format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR }),
    yearly: format(selectedDate, 'yyyy'),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dola-text flex items-center gap-2">
            <Wallet size={24} className="text-dola-success" />
            Hub Financeiro
          </h1>
          <p className="text-sm text-dola-muted mt-1">Controle completo das suas finanças</p>
        </div>
        <button onClick={() => { setEditingId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Novo Lançamento
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="glass rounded-xl flex overflow-hidden">
          {(['daily', 'weekly', 'monthly', 'yearly'] as ViewPeriod[]).map(p => (
            <button key={p} onClick={() => setViewPeriod(p)} className={`px-4 py-2 text-xs font-medium ${viewPeriod === p ? 'bg-dola-accent text-white' : 'text-dola-muted'}`}>
              {p === 'daily' ? 'Diário' : p === 'weekly' ? 'Semanal' : p === 'monthly' ? 'Mensal' : 'Anual'}
            </button>
          ))}
        </div>
        <input 
          type="date" 
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={e => setSelectedDate(new Date(e.target.value))}
          className="!w-auto !py-2"
        />
        <span className="text-sm font-medium text-dola-text capitalize">{periodLabel[viewPeriod]}</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={16} className="text-dola-success" />
            <ArrowUpRight size={12} className="text-dola-success" />
          </div>
          <p className="text-lg font-bold text-dola-success">{fmt(periodIncome)}</p>
          <p className="text-[10px] text-dola-muted">Receitas (período)</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown size={16} className="text-dola-danger" />
            <ArrowDownRight size={12} className="text-dola-danger" />
          </div>
          <p className="text-lg font-bold text-dola-danger">{fmt(periodExpense)}</p>
          <p className="text-[10px] text-dola-muted">Despesas (período)</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className={`text-lg font-bold ${periodBalance >= 0 ? 'text-dola-success' : 'text-dola-danger'}`}>{fmt(periodBalance)}</p>
          <p className="text-[10px] text-dola-muted">Saldo (período)</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-lg font-bold text-dola-warning">{fmt(pending)}</p>
          <p className="text-[10px] text-dola-muted">Pendentes</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-lg font-bold text-dola-danger">{fmt(overdue)}</p>
          <p className="text-[10px] text-dola-muted">Vencidas</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Comparison */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dola-text mb-4">Evolução Mensal (12 meses)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyChartData}>
              <defs>
                <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDespesa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '12px', fontSize: '12px', color: '#e4e4ef' }} 
                formatter={(v: any) => fmt(Number(v))}
              />
              <Legend />
              <Area type="monotone" dataKey="receita" name="Receita" stroke="#10b981" fill="url(#gradReceita)" strokeWidth={2} />
              <Area type="monotone" dataKey="despesa" name="Despesa" stroke="#ef4444" fill="url(#gradDespesa)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dola-text mb-4">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={expenseByCat} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                {expenseByCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '12px', fontSize: '11px', color: '#e4e4ef' }} formatter={(v: any) => fmt(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {expenseByCat.slice(0, 5).map((d, i) => (
              <div key={d.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-[9px] text-dola-muted">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Balance Chart */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-dola-text mb-4">Saldo Mensal</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={monthlyChartData}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '12px', fontSize: '12px', color: '#e4e4ef' }} 
              formatter={(v: any) => fmt(Number(v))}
            />
            <Bar dataKey="saldo" radius={[4, 4, 0, 0]}>
              {monthlyChartData.map((entry, i) => (
                <Cell key={i} fill={entry.saldo >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-dola-border flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-sm font-semibold text-dola-text">Lançamentos</h3>
          <div className="flex gap-1">
            {(['all', 'income', 'expense'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-lg text-xs font-medium ${filter === f ? 'bg-dola-accent text-white' : 'text-dola-muted hover:text-dola-text'}`}>
                {f === 'all' ? 'Todos' : f === 'income' ? 'Receitas' : 'Despesas'}
              </button>
            ))}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-dola-muted">Nenhum lançamento no período</div>
          ) : filtered.map(f => (
            <div key={f.id} className="flex items-center justify-between p-4 border-b border-dola-border/30 hover:bg-dola-border/10 transition-colors group">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.type === 'income' ? 'bg-dola-success/10' : 'bg-dola-danger/10'}`}>
                  {f.type === 'income' ? <TrendingUp size={16} className="text-dola-success" /> : <TrendingDown size={16} className="text-dola-danger" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-dola-text">{f.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-dola-muted">{f.category}</span>
                    <span className="text-[10px] text-dola-muted">•</span>
                    <span className="text-[10px] text-dola-muted">{format(new Date(f.date), 'dd/MM/yyyy')}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      f.status === 'paid' ? 'bg-dola-success/10 text-dola-success' :
                      f.status === 'overdue' ? 'bg-dola-danger/10 text-dola-danger' :
                      'bg-dola-warning/10 text-dola-warning'
                    }`}>{f.status === 'paid' ? 'Pago' : f.status === 'overdue' ? 'Vencido' : 'Pendente'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className={`text-sm font-bold ${f.type === 'income' ? 'text-dola-success' : 'text-dola-danger'}`}>
                  {f.type === 'income' ? '+' : '-'} {fmt(f.amount)}
                </p>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <select
                    value={f.status}
                    onChange={e => updateFinance(f.id, { status: e.target.value as FinanceEntry['status'] })}
                    className="!text-[10px] !p-1 !rounded-lg !bg-dola-bg/50 !border-dola-border/30 w-auto"
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="overdue">Vencido</option>
                  </select>
                  <button onClick={() => startEdit(f)} className="p-1.5 rounded-lg hover:bg-dola-accent/10 text-dola-muted hover:text-dola-accent transition-colors">
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => deleteFinance(f.id)} className="p-1.5 rounded-lg hover:bg-dola-danger/10 text-dola-muted hover:text-dola-danger transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Table */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-dola-text mb-4">Resumo Total</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dola-border">
                <th className="text-left py-2 text-dola-muted font-medium">Categoria</th>
                <th className="text-right py-2 text-dola-muted font-medium">Receitas</th>
                <th className="text-right py-2 text-dola-muted font-medium">Despesas</th>
                <th className="text-right py-2 text-dola-muted font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dola-border/30">
                <td className="py-3 font-medium text-dola-text">Total Geral</td>
                <td className="py-3 text-right text-dola-success font-bold">{fmt(totalIncome)}</td>
                <td className="py-3 text-right text-dola-danger font-bold">{fmt(totalExpense)}</td>
                <td className={`py-3 text-right font-bold ${balance >= 0 ? 'text-dola-success' : 'text-dola-danger'}`}>{fmt(balance)}</td>
              </tr>
              <tr className="border-b border-dola-border/30">
                <td className="py-3 font-medium text-dola-text">{periodLabel[viewPeriod]}</td>
                <td className="py-3 text-right text-dola-success">{fmt(periodIncome)}</td>
                <td className="py-3 text-right text-dola-danger">{fmt(periodExpense)}</td>
                <td className={`py-3 text-right ${periodBalance >= 0 ? 'text-dola-success' : 'text-dola-danger'}`}>{fmt(periodBalance)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => { setShowForm(false); setEditingId(null); }}>
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-dola-text">{editingId ? 'Editar' : 'Novo'} Lançamento</h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1 rounded-lg hover:bg-dola-border/50"><X size={18} className="text-dola-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                {(['income', 'expense'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setForm({ ...form, type: t, category: t === 'income' ? 'Empresa' : 'Escritório' })}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${form.type === t ? (t === 'income' ? 'bg-dola-success/20 text-dola-success border border-dola-success/30' : 'bg-dola-danger/20 text-dola-danger border border-dola-danger/30') : 'bg-dola-bg/50 text-dola-muted border border-transparent'}`}>
                    {t === 'income' ? '+ Receita' : '- Despesa'}
                  </button>
                ))}
              </div>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição" required />
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Valor (R$)" required />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Categoria</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {(form.type === 'income' ? INCOME_CATS : EXPENSE_CATS).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Data</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as FinanceEntry['status'] })}>
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="overdue">Vencido</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <div onClick={() => setForm({ ...form, recurring: !form.recurring })} className={`toggle-switch ${form.recurring ? 'active' : ''}`} />
                  <span className="text-xs text-dola-muted">Recorrente</span>
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white font-semibold text-sm hover:opacity-90">
                {editingId ? 'Salvar Alterações' : 'Criar Lançamento'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
