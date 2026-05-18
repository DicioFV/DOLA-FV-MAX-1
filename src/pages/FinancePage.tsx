import { useState } from 'react';
import { useStore, FinanceEntry } from '../store/useStore';
import { Wallet, Plus, X, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#ef4444'];
const INCOME_CATS = ['Empresa', 'Consultoria', 'Investimentos', 'Freelance', 'Outros'];
const EXPENSE_CATS = ['Escritório', 'Equipe', 'Marketing', 'Família', 'Saúde', 'Educação', 'Transporte', 'Alimentação', 'Outros'];

export default function FinancePage() {
  const { finances, addFinance, deleteFinance, updateFinance, currentUser } = useStore();
  const uid = currentUser?.id || '';
  const myFinances = finances.filter(f => f.userId === uid);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const [form, setForm] = useState<{
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount: string;
    date: string;
    status: FinanceEntry['status'];
    recurring: boolean;
  }>({
    type: 'expense', category: 'Escritório', description: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'pending', recurring: false,
  });

  const totalIncome = myFinances.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0);
  const totalExpense = myFinances.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0);
  const balance = totalIncome - totalExpense;
  const pending = myFinances.filter(f => f.status === 'pending').reduce((s, f) => s + f.amount, 0);

  const filtered = myFinances.filter(f => filter === 'all' ? true : f.type === filter);

  const expenseByCat = EXPENSE_CATS.map(cat => ({
    name: cat,
    value: myFinances.filter(f => f.type === 'expense' && f.category === cat).reduce((s, f) => s + f.amount, 0),
  })).filter(d => d.value > 0);

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth();
    const y = d.getFullYear();
    return {
      month: d.toLocaleDateString('pt-BR', { month: 'short' }),
      receita: myFinances.filter(f => f.type === 'income').reduce((s, f) => {
        const fd = new Date(f.date);
        return fd.getMonth() === m && fd.getFullYear() === y ? s + f.amount : s;
      }, 0) || (60000 + i * 5000),
      despesa: myFinances.filter(f => f.type === 'expense').reduce((s, f) => {
        const fd = new Date(f.date);
        return fd.getMonth() === m && fd.getFullYear() === y ? s + f.amount : s;
      }, 0) || (35000 + i * 2000),
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFinance({
      userId: uid, type: form.type, category: form.category, description: form.description,
      amount: parseFloat(form.amount), date: form.date, status: form.status, recurring: form.recurring,
    });
    setForm({ type: 'expense', category: 'Escritório', description: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'pending', recurring: false });
    setShowForm(false);
  };

  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Novo Lançamento
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={18} className="text-dola-success" />
            <ArrowUpRight size={14} className="text-dola-success" />
          </div>
          <p className="text-xl font-bold text-dola-success">{fmt(totalIncome)}</p>
          <p className="text-xs text-dola-muted mt-1">Receitas</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown size={18} className="text-dola-danger" />
            <ArrowDownRight size={14} className="text-dola-danger" />
          </div>
          <p className="text-xl font-bold text-dola-danger">{fmt(totalExpense)}</p>
          <p className="text-xs text-dola-muted mt-1">Despesas</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className={`text-xl font-bold ${balance >= 0 ? 'text-dola-success' : 'text-dola-danger'}`}>{fmt(balance)}</p>
          <p className="text-xs text-dola-muted mt-1">Saldo</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xl font-bold text-dola-warning">{fmt(pending)}</p>
          <p className="text-xs text-dola-muted mt-1">Pendentes</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dola-text mb-4">Fluxo de Caixa</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '12px', fontSize: '12px', color: '#e4e4ef' }} />
              <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dola-text mb-4">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={expenseByCat} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {expenseByCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '12px', fontSize: '12px', color: '#e4e4ef' }} formatter={(v: any) => fmt(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center">
            {expenseByCat.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-[10px] text-dola-muted">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-dola-border flex items-center justify-between">
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
          {filtered.map(f => (
            <div key={f.id} className="flex items-center justify-between p-4 border-b border-dola-border/30 hover:bg-dola-border/10 transition-colors group">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.type === 'income' ? 'bg-dola-success/10' : 'bg-dola-danger/10'}`}>
                  {f.type === 'income' ? <TrendingUp size={16} className="text-dola-success" /> : <TrendingDown size={16} className="text-dola-danger" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-dola-text">{f.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-dola-muted">{f.category}</span>
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
                <select
                  value={f.status}
                  onChange={e => updateFinance(f.id, { status: e.target.value as FinanceEntry['status'] })}
                  className="!text-[10px] !p-1 !rounded-lg !bg-transparent !border-dola-border/30 w-auto opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="overdue">Vencido</option>
                </select>
                <button onClick={() => deleteFinance(f.id)} className="p-1 rounded-lg text-dola-muted/30 hover:text-dola-danger opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-dola-text">Novo Lançamento</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-dola-border/50"><X size={18} className="text-dola-muted" /></button>
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
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <div onClick={() => setForm({ ...form, recurring: !form.recurring })} className={`toggle-switch ${form.recurring ? 'active' : ''}`} />
                  <span className="text-xs text-dola-muted">Recorrente</span>
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white font-semibold text-sm hover:opacity-90">
                Criar Lançamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
