import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  Calculator, Plus, X, TrendingDown, AlertTriangle,
  Trash2, Edit3, ArrowDown, ArrowUp, Lightbulb, Target, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number; // % ao mês
  monthlyPayment: number;
  dueDay: number;
  type: 'loan' | 'credit_card' | 'financing' | 'overdraft' | 'other';
  priority?: number;
}

const DEBT_TYPES = [
  { value: 'credit_card', label: 'Cartão de Crédito', icon: '💳', avgRate: 14 },
  { value: 'overdraft', label: 'Cheque Especial', icon: '🏦', avgRate: 8 },
  { value: 'loan', label: 'Empréstimo Pessoal', icon: '💰', avgRate: 4 },
  { value: 'financing', label: 'Financiamento', icon: '🏠', avgRate: 1.5 },
  { value: 'other', label: 'Outros', icon: '📋', avgRate: 3 },
];

export default function DebtManagerPage() {
  const { currentUser } = useStore();
  void currentUser; // Reserved for user-specific data
  
  const [debts, setDebts] = useState<Debt[]>([
    { id: '1', name: 'Cartão Nubank', totalAmount: 5000, remainingAmount: 3500, interestRate: 14, monthlyPayment: 500, dueDay: 10, type: 'credit_card' },
    { id: '2', name: 'Empréstimo Banco', totalAmount: 20000, remainingAmount: 15000, interestRate: 3.5, monthlyPayment: 800, dueDay: 15, type: 'loan' },
    { id: '3', name: 'Financiamento Carro', totalAmount: 50000, remainingAmount: 35000, interestRate: 1.2, monthlyPayment: 1200, dueDay: 5, type: 'financing' },
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [extraPayment, setExtraPayment] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    totalAmount: '',
    remainingAmount: '',
    interestRate: '',
    monthlyPayment: '',
    dueDay: '10',
    type: 'loan' as Debt['type'],
  });

  // Calculate totals
  const totalDebt = debts.reduce((s, d) => s + d.remainingAmount, 0);
  const totalMonthlyPayment = debts.reduce((s, d) => s + d.monthlyPayment, 0);
  const avgInterestRate = debts.length > 0 
    ? debts.reduce((s, d) => s + d.interestRate * d.remainingAmount, 0) / totalDebt 
    : 0;
  const monthlyInterest = debts.reduce((s, d) => s + (d.remainingAmount * d.interestRate / 100), 0);

  // Priority calculation (Avalanche method - highest interest first)
  const debtsByPriority = useMemo(() => {
    return [...debts].sort((a, b) => b.interestRate - a.interestRate);
  }, [debts]);

  // Snowball method (smallest balance first)
  const debtsBySnowball = useMemo(() => {
    return [...debts].sort((a, b) => a.remainingAmount - b.remainingAmount);
  }, [debts]);

  // Time to pay off
  const calculatePayoffMonths = (debt: Debt) => {
    if (debt.monthlyPayment <= debt.remainingAmount * debt.interestRate / 100) {
      return Infinity; // Never pays off
    }
    const r = debt.interestRate / 100;
    const P = debt.remainingAmount;
    const M = debt.monthlyPayment;
    const months = Math.log(M / (M - P * r)) / Math.log(1 + r);
    return Math.ceil(months);
  };

  const calculateTotalInterestPaid = (debt: Debt) => {
    const months = calculatePayoffMonths(debt);
    if (months === Infinity) return Infinity;
    return (months * debt.monthlyPayment) - debt.remainingAmount;
  };

  // Generate AI advice
  const generateAdvice = () => {
    const advice: string[] = [];
    
    if (debts.some(d => d.interestRate > 10)) {
      const highInterest = debts.filter(d => d.interestRate > 10);
      advice.push(`🚨 PRIORIDADE MÁXIMA: Quite primeiro ${highInterest.map(d => d.name).join(', ')} - juros acima de 10% ao mês são muito altos!`);
    }
    
    const avalancheFirst = debtsByPriority[0];
    if (avalancheFirst) {
      advice.push(`📊 Método Avalanche: Foque em ${avalancheFirst.name} (${avalancheFirst.interestRate}% a.m.) - maior economia de juros no longo prazo.`);
    }
    
    const snowballFirst = debtsBySnowball[0];
    if (snowballFirst && snowballFirst.id !== avalancheFirst?.id) {
      advice.push(`🎯 Método Snowball: Alternativamente, quite ${snowballFirst.name} primeiro (R$ ${snowballFirst.remainingAmount.toLocaleString()}) para motivação rápida.`);
    }
    
    if (monthlyInterest > 500) {
      advice.push(`💸 Você está pagando R$ ${monthlyInterest.toFixed(2)} de juros por mês! Considere renegociar ou fazer portabilidade.`);
    }
    
    if (extraPayment && parseFloat(extraPayment) > 0) {
      const extra = parseFloat(extraPayment);
      const bestDebt = debtsByPriority[0];
      if (bestDebt) {
        const savingsPerMonth = extra * bestDebt.interestRate / 100;
        advice.push(`💡 Com R$ ${extra.toLocaleString()} extra em ${bestDebt.name}, você economiza R$ ${savingsPerMonth.toFixed(2)}/mês em juros!`);
      }
    }
    
    advice.push(`✅ Dica: Sempre pague pelo menos o mínimo de todas as dívidas e direcione o extra para a de maior juros.`);
    
    return advice;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDebt: Debt = {
      id: editingId || Date.now().toString(),
      name: form.name,
      totalAmount: parseFloat(form.totalAmount),
      remainingAmount: parseFloat(form.remainingAmount),
      interestRate: parseFloat(form.interestRate),
      monthlyPayment: parseFloat(form.monthlyPayment),
      dueDay: parseInt(form.dueDay),
      type: form.type,
    };
    
    if (editingId) {
      setDebts(debts.map(d => d.id === editingId ? newDebt : d));
      setEditingId(null);
    } else {
      setDebts([...debts, newDebt]);
    }
    
    setForm({ name: '', totalAmount: '', remainingAmount: '', interestRate: '', monthlyPayment: '', dueDay: '10', type: 'loan' });
    setShowForm(false);
  };

  const startEdit = (debt: Debt) => {
    setForm({
      name: debt.name,
      totalAmount: debt.totalAmount.toString(),
      remainingAmount: debt.remainingAmount.toString(),
      interestRate: debt.interestRate.toString(),
      monthlyPayment: debt.monthlyPayment.toString(),
      dueDay: debt.dueDay.toString(),
      type: debt.type,
    });
    setEditingId(debt.id);
    setShowForm(true);
  };

  const deleteDebt = (id: string) => {
    if (confirm('Remover esta dívida?')) {
      setDebts(debts.filter(d => d.id !== id));
    }
  };

  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const chartData = debtsByPriority.map(d => ({
    name: d.name.length > 10 ? d.name.substring(0, 10) + '...' : d.name,
    valor: d.remainingAmount,
    juros: d.interestRate,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dola-text flex items-center gap-2">
            <Calculator size={24} className="text-dola-warning" />
            Gestor de Dívidas
          </h1>
          <p className="text-sm text-dola-muted mt-1">Estratégia para quitar suas dívidas mais rápido</p>
        </div>
        <button onClick={() => { setEditingId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Nova Dívida
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass rounded-2xl p-4">
          <TrendingDown size={18} className="text-dola-danger mb-2" />
          <p className="text-xl font-bold text-dola-danger">{fmt(totalDebt)}</p>
          <p className="text-[10px] text-dola-muted">Dívida Total</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <Target size={18} className="text-dola-warning mb-2" />
          <p className="text-xl font-bold text-dola-warning">{fmt(totalMonthlyPayment)}</p>
          <p className="text-[10px] text-dola-muted">Parcela Mensal</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <AlertTriangle size={18} className="text-dola-danger mb-2" />
          <p className="text-xl font-bold text-dola-danger">{fmt(monthlyInterest)}</p>
          <p className="text-[10px] text-dola-muted">Juros/Mês</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <Zap size={18} className="text-dola-accent mb-2" />
          <p className="text-xl font-bold text-dola-accent">{avgInterestRate.toFixed(1)}%</p>
          <p className="text-[10px] text-dola-muted">Taxa Média a.m.</p>
        </div>
      </div>

      {/* Chart */}
      {debts.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dola-text mb-4">Comparativo de Dívidas</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={80} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '12px', fontSize: '12px', color: '#e4e4ef' }} 
                formatter={(v: any) => fmt(Number(v))}
              />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.juros > 10 ? '#ef4444' : entry.juros > 5 ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2">
            <span className="flex items-center gap-1.5 text-[10px] text-dola-muted">
              <div className="w-3 h-3 rounded bg-[#ef4444]" /> Juros &gt; 10%
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-dola-muted">
              <div className="w-3 h-3 rounded bg-[#f59e0b]" /> Juros 5-10%
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-dola-muted">
              <div className="w-3 h-3 rounded bg-[#10b981]" /> Juros &lt; 5%
            </span>
          </div>
        </div>
      )}

      {/* AI Advisor */}
      <div className="glass rounded-2xl p-5 border border-dola-accent/20">
        <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
          <Lightbulb size={16} className="text-dola-warning" />
          Conselheiro Financeiro DOLA AI
        </h3>
        
        <div className="mb-4">
          <label className="block text-xs text-dola-muted mb-1">Valor extra disponível para quitar dívidas:</label>
          <input 
            type="number" 
            value={extraPayment} 
            onChange={e => setExtraPayment(e.target.value)}
            placeholder="Ex: 500"
            className="!w-48"
          />
        </div>
        
        <div className="space-y-2">
          {generateAdvice().map((advice, i) => (
            <div key={i} className="p-3 rounded-xl bg-dola-bg/50 text-sm text-dola-text">
              {advice}
            </div>
          ))}
        </div>
      </div>

      {/* Priority Order */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dola-text mb-3 flex items-center gap-2">
            <ArrowDown size={16} className="text-dola-danger" />
            Ordem: Método Avalanche (Maior Juros)
          </h3>
          <p className="text-xs text-dola-muted mb-3">Economiza mais dinheiro no total</p>
          <div className="space-y-2">
            {debtsByPriority.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3 p-2 rounded-lg bg-dola-bg/50">
                <span className="w-6 h-6 rounded-full bg-dola-danger/10 text-dola-danger flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="flex-1 text-sm text-dola-text">{d.name}</span>
                <span className="text-xs font-bold text-dola-danger">{d.interestRate}%</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dola-text mb-3 flex items-center gap-2">
            <ArrowUp size={16} className="text-dola-success" />
            Ordem: Método Snowball (Menor Saldo)
          </h3>
          <p className="text-xs text-dola-muted mb-3">Motivação com vitórias rápidas</p>
          <div className="space-y-2">
            {debtsBySnowball.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3 p-2 rounded-lg bg-dola-bg/50">
                <span className="w-6 h-6 rounded-full bg-dola-success/10 text-dola-success flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="flex-1 text-sm text-dola-text">{d.name}</span>
                <span className="text-xs font-bold text-dola-success">{fmt(d.remainingAmount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Debts List */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-dola-border">
          <h3 className="text-sm font-semibold text-dola-text">Suas Dívidas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dola-border bg-dola-bg/30">
                <th className="text-left p-3 font-medium text-dola-muted">Dívida</th>
                <th className="text-right p-3 font-medium text-dola-muted">Saldo</th>
                <th className="text-right p-3 font-medium text-dola-muted">Juros</th>
                <th className="text-right p-3 font-medium text-dola-muted">Parcela</th>
                <th className="text-right p-3 font-medium text-dola-muted">Meses p/ Quitar</th>
                <th className="text-right p-3 font-medium text-dola-muted">Total Juros</th>
                <th className="text-right p-3 font-medium text-dola-muted">Ações</th>
              </tr>
            </thead>
            <tbody>
              {debts.map(d => {
                const months = calculatePayoffMonths(d);
                const totalInterest = calculateTotalInterestPaid(d);
                const typeInfo = DEBT_TYPES.find(t => t.value === d.type);
                return (
                  <tr key={d.id} className="border-b border-dola-border/30 hover:bg-dola-border/10">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{typeInfo?.icon}</span>
                        <div>
                          <p className="font-medium text-dola-text">{d.name}</p>
                          <p className="text-[10px] text-dola-muted">Vence dia {d.dueDay}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right font-bold text-dola-danger">{fmt(d.remainingAmount)}</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        d.interestRate > 10 ? 'bg-dola-danger/10 text-dola-danger' :
                        d.interestRate > 5 ? 'bg-dola-warning/10 text-dola-warning' :
                        'bg-dola-success/10 text-dola-success'
                      }`}>
                        {d.interestRate}% a.m.
                      </span>
                    </td>
                    <td className="p-3 text-right text-dola-text">{fmt(d.monthlyPayment)}</td>
                    <td className="p-3 text-right text-dola-text">
                      {months === Infinity ? '∞' : `${months} meses`}
                    </td>
                    <td className="p-3 text-right text-dola-danger">
                      {totalInterest === Infinity ? '∞' : fmt(totalInterest)}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(d)} className="p-1.5 rounded-lg hover:bg-dola-accent/10 text-dola-muted hover:text-dola-accent">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => deleteDebt(d.id)} className="p-1.5 rounded-lg hover:bg-dola-danger/10 text-dola-muted hover:text-dola-danger">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => { setShowForm(false); setEditingId(null); }}>
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-dola-text">{editingId ? 'Editar' : 'Nova'} Dívida</h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1 rounded-lg hover:bg-dola-border/50"><X size={18} className="text-dola-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome da dívida" required />
              <div>
                <label className="block text-xs text-dola-muted mb-1">Tipo</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Debt['type'] })}>
                  {DEBT_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Valor Total</label>
                  <input type="number" step="0.01" value={form.totalAmount} onChange={e => setForm({ ...form, totalAmount: e.target.value })} placeholder="R$ 0,00" required />
                </div>
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Saldo Devedor</label>
                  <input type="number" step="0.01" value={form.remainingAmount} onChange={e => setForm({ ...form, remainingAmount: e.target.value })} placeholder="R$ 0,00" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Juros (% ao mês)</label>
                  <input type="number" step="0.01" value={form.interestRate} onChange={e => setForm({ ...form, interestRate: e.target.value })} placeholder="Ex: 3.5" required />
                </div>
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Parcela Mensal</label>
                  <input type="number" step="0.01" value={form.monthlyPayment} onChange={e => setForm({ ...form, monthlyPayment: e.target.value })} placeholder="R$ 0,00" required />
                </div>
              </div>
              <div>
                <label className="block text-xs text-dola-muted mb-1">Dia de Vencimento</label>
                <input type="number" min="1" max="31" value={form.dueDay} onChange={e => setForm({ ...form, dueDay: e.target.value })} />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white font-semibold text-sm hover:opacity-90">
                {editingId ? 'Salvar Alterações' : 'Adicionar Dívida'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
