import { useState, useMemo } from 'react';
import { 
  TrendingUp, Calculator, Clock, Info, Star, Zap
} from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';

interface Investment {
  name: string;
  type: 'fixed' | 'variable';
  category: string;
  currentRate: number; // % ao ano
  risk: 'baixo' | 'medio' | 'alto';
  liquidity: string;
  minInvestment: number;
  description: string;
  taxFree?: boolean;
  recommended?: boolean;
}

const SELIC_RATE = 10.75; // Taxa Selic atual (atualizar conforme necessário)
const CDI_RATE = 10.65; // CDI atual
const IPCA_RATE = 4.5; // IPCA projetado

const INVESTMENTS: Investment[] = [
  // Renda Fixa - Recomendados
  { name: 'Tesouro Selic', type: 'fixed', category: 'Tesouro Direto', currentRate: SELIC_RATE, risk: 'baixo', liquidity: 'D+1', minInvestment: 30, description: 'Segue a taxa Selic. Ideal para reserva de emergência.', recommended: true },
  { name: 'Tesouro IPCA+ 2029', type: 'fixed', category: 'Tesouro Direto', currentRate: IPCA_RATE + 6.5, risk: 'baixo', liquidity: 'D+1', minInvestment: 30, description: 'IPCA + 6.5% a.a. Proteção contra inflação.', recommended: true },
  { name: 'Tesouro Prefixado 2027', type: 'fixed', category: 'Tesouro Direto', currentRate: 12.5, risk: 'baixo', liquidity: 'D+1', minInvestment: 30, description: 'Taxa fixa de 12.5% a.a.', recommended: true },
  { name: 'CDB 100% CDI', type: 'fixed', category: 'CDB', currentRate: CDI_RATE, risk: 'baixo', liquidity: 'D+0 a D+1', minInvestment: 1000, description: 'Liquidez diária. FGC até 250k.', recommended: true },
  { name: 'CDB 120% CDI', type: 'fixed', category: 'CDB', currentRate: CDI_RATE * 1.2, risk: 'baixo', liquidity: '2-3 anos', minInvestment: 5000, description: 'Maior rentabilidade com prazo. FGC até 250k.', recommended: true },
  { name: 'LCI/LCA', type: 'fixed', category: 'LCI/LCA', currentRate: CDI_RATE * 0.93, risk: 'baixo', liquidity: '90 dias+', minInvestment: 1000, description: 'Isento de IR! Excelente para longo prazo.', taxFree: true, recommended: true },
  { name: 'CRI/CRA', type: 'fixed', category: 'Crédito Privado', currentRate: CDI_RATE + 2, risk: 'medio', liquidity: '2-5 anos', minInvestment: 1000, description: 'Isento de IR. Risco de crédito.', taxFree: true },
  { name: 'Debêntures Incentivadas', type: 'fixed', category: 'Crédito Privado', currentRate: IPCA_RATE + 7, risk: 'medio', liquidity: '3-10 anos', minInvestment: 1000, description: 'Isento de IR. Infraestrutura.', taxFree: true },
  
  // Renda Variável
  { name: 'Ações (IBOV)', type: 'variable', category: 'Ações', currentRate: 15, risk: 'alto', liquidity: 'D+2', minInvestment: 100, description: 'Média histórica ~15% a.a. Alta volatilidade.' },
  { name: 'FIIs', type: 'variable', category: 'Fundos Imobiliários', currentRate: 10, risk: 'medio', liquidity: 'D+2', minInvestment: 100, description: 'Dividendos mensais isentos de IR.' },
  { name: 'ETF BOVA11', type: 'variable', category: 'ETF', currentRate: 12, risk: 'alto', liquidity: 'D+2', minInvestment: 100, description: 'Replica o Ibovespa. Diversificação.' },
  { name: 'ETF IVVB11', type: 'variable', category: 'ETF', currentRate: 18, risk: 'alto', liquidity: 'D+2', minInvestment: 100, description: 'Replica S&P 500. Exposição ao dólar.' },
];

export default function InvestmentsPage() {
  const [monthlyInvestment, setMonthlyInvestment] = useState('1000');
  const [years, setYears] = useState('10');
  const [selectedType, setSelectedType] = useState<'all' | 'fixed' | 'variable'>('fixed');
  const [showCalculator, setShowCalculator] = useState(true);

  // Simulation
  const simulation = useMemo(() => {
    const monthly = parseFloat(monthlyInvestment) || 0;
    const period = parseInt(years) || 1;
    const months = period * 12;
    
    const results = INVESTMENTS.filter(inv => inv.type === 'fixed').slice(0, 5).map(inv => {
      const monthlyRate = inv.currentRate / 100 / 12;
      // Fórmula de juros compostos com aportes mensais
      const finalValue = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      const totalInvested = monthly * months;
      const profit = finalValue - totalInvested;
      
      return {
        name: inv.name,
        rate: inv.currentRate,
        finalValue,
        totalInvested,
        profit,
        profitPercent: (profit / totalInvested) * 100,
      };
    });
    
    return results.sort((a, b) => b.finalValue - a.finalValue);
  }, [monthlyInvestment, years]);

  // Growth chart data
  const chartData = useMemo(() => {
    const monthly = parseFloat(monthlyInvestment) || 0;
    const period = parseInt(years) || 1;
    const bestInvestment = INVESTMENTS.find(i => i.name === 'Tesouro IPCA+ 2029')!;
    const monthlyRate = bestInvestment.currentRate / 100 / 12;
    
    const data = [];
    let accumulated = 0;
    
    for (let year = 0; year <= period; year++) {
      const months = year * 12;
      if (months === 0) {
        data.push({ ano: `Ano ${year}`, valor: 0, investido: 0 });
      } else {
        accumulated = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        data.push({ 
          ano: `Ano ${year}`, 
          valor: Math.round(accumulated),
          investido: monthly * months,
        });
      }
    }
    
    return data;
  }, [monthlyInvestment, years]);

  const filtered = INVESTMENTS.filter(inv => 
    selectedType === 'all' ? true : inv.type === selectedType
  );

  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'baixo': return 'text-dola-success bg-dola-success/10';
      case 'medio': return 'text-dola-warning bg-dola-warning/10';
      case 'alto': return 'text-dola-danger bg-dola-danger/10';
      default: return 'text-dola-muted bg-dola-border/50';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dola-text flex items-center gap-2">
            <TrendingUp size={24} className="text-dola-success" />
            Central de Investimentos
          </h1>
          <p className="text-sm text-dola-muted mt-1">Planeje seu futuro financeiro • Foco em Renda Fixa</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass rounded-xl flex overflow-hidden">
            {(['fixed', 'variable', 'all'] as const).map(t => (
              <button key={t} onClick={() => setSelectedType(t)} className={`px-4 py-2 text-xs font-medium ${selectedType === t ? 'bg-dola-accent text-white' : 'text-dola-muted'}`}>
                {t === 'fixed' ? '🔒 Renda Fixa' : t === 'variable' ? '📈 Variável' : 'Todos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Market Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] text-dola-muted mb-1">Taxa Selic</p>
          <p className="text-xl font-bold text-dola-success">{SELIC_RATE}%</p>
          <p className="text-[10px] text-dola-muted">ao ano</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] text-dola-muted mb-1">CDI</p>
          <p className="text-xl font-bold text-dola-accent">{CDI_RATE}%</p>
          <p className="text-[10px] text-dola-muted">ao ano</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] text-dola-muted mb-1">IPCA (proj.)</p>
          <p className="text-xl font-bold text-dola-warning">{IPCA_RATE}%</p>
          <p className="text-[10px] text-dola-muted">ao ano</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] text-dola-muted mb-1">Poupança</p>
          <p className="text-xl font-bold text-dola-muted">{(SELIC_RATE * 0.7).toFixed(2)}%</p>
          <p className="text-[10px] text-dola-danger">Evite!</p>
        </div>
      </div>

      {/* Calculator */}
      {showCalculator && (
        <div className="glass rounded-2xl p-5 border border-dola-accent/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dola-text flex items-center gap-2">
              <Calculator size={16} className="text-dola-accent" />
              Simulador de Investimentos
            </h3>
            <button onClick={() => setShowCalculator(false)} className="text-xs text-dola-muted hover:text-dola-text">Fechar</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs text-dola-muted mb-1">Aporte Mensal (R$)</label>
              <input 
                type="number" 
                value={monthlyInvestment} 
                onChange={e => setMonthlyInvestment(e.target.value)}
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block text-xs text-dola-muted mb-1">Período (anos)</label>
              <select value={years} onChange={e => setYears(e.target.value)}>
                <option value="1">1 ano</option>
                <option value="3">3 anos</option>
                <option value="5">5 anos</option>
                <option value="10">10 anos</option>
                <option value="15">15 anos</option>
                <option value="20">20 anos</option>
                <option value="30">30 anos</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="glass rounded-xl p-3 w-full">
                <p className="text-[10px] text-dola-muted">Total investido</p>
                <p className="text-lg font-bold text-dola-text">
                  {fmt(parseFloat(monthlyInvestment || '0') * parseInt(years || '1') * 12)}
                </p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="ano" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '12px', fontSize: '11px', color: '#e4e4ef' }} 
                  formatter={(v: any) => fmt(Number(v))}
                />
                <Area type="monotone" dataKey="investido" name="Investido" stroke="#6366f1" fill="none" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="valor" name="Valor Final" stroke="#10b981" fill="url(#gradValor)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Results */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-dola-muted uppercase tracking-wider">Projeção em {years} anos:</p>
            {simulation.map((sim, i) => (
              <div key={sim.name} className={`flex items-center justify-between p-3 rounded-xl ${i === 0 ? 'bg-dola-success/10 border border-dola-success/30' : 'bg-dola-bg/50'}`}>
                <div className="flex items-center gap-2">
                  {i === 0 && <Star size={14} className="text-dola-warning" />}
                  <span className="text-sm font-medium text-dola-text">{sim.name}</span>
                  <span className="text-[10px] text-dola-muted">({sim.rate}% a.a.)</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-dola-success">{fmt(sim.finalValue)}</p>
                  <p className="text-[10px] text-dola-muted">Lucro: {fmt(sim.profit)} ({sim.profitPercent.toFixed(0)}%)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Section */}
      <div className="glass rounded-2xl p-5 border border-dola-success/20">
        <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
          <Star size={16} className="text-dola-warning" />
          Recomendados para Você (Renda Fixa)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {INVESTMENTS.filter(i => i.recommended).map(inv => (
            <div key={inv.name} className="p-4 rounded-xl bg-dola-bg/50 border border-dola-border/50 hover:border-dola-success/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-dola-text">{inv.name}</h4>
                  <p className="text-[10px] text-dola-muted">{inv.category}</p>
                </div>
                {inv.taxFree && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-dola-success/10 text-dola-success font-bold">ISENTO IR</span>
                )}
              </div>
              <p className="text-xl font-bold text-dola-success mb-2">{inv.currentRate.toFixed(2)}% <span className="text-xs font-normal text-dola-muted">a.a.</span></p>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getRiskColor(inv.risk)}`}>
                  {inv.risk === 'baixo' ? '🛡️ Baixo Risco' : inv.risk === 'medio' ? '⚠️ Médio' : '🔥 Alto'}
                </span>
                <span className="text-[10px] text-dola-muted flex items-center gap-1">
                  <Clock size={10} /> {inv.liquidity}
                </span>
              </div>
              <p className="text-[10px] text-dola-muted">{inv.description}</p>
              <p className="text-[10px] text-dola-accent mt-2">Mínimo: {fmt(inv.minInvestment)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* All Investments Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-dola-border">
          <h3 className="text-sm font-semibold text-dola-text">Todos os Investimentos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dola-border bg-dola-bg/30">
                <th className="text-left p-3 font-medium text-dola-muted">Investimento</th>
                <th className="text-left p-3 font-medium text-dola-muted">Categoria</th>
                <th className="text-right p-3 font-medium text-dola-muted">Rentabilidade</th>
                <th className="text-center p-3 font-medium text-dola-muted">Risco</th>
                <th className="text-center p-3 font-medium text-dola-muted">Liquidez</th>
                <th className="text-right p-3 font-medium text-dola-muted">Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.name} className="border-b border-dola-border/30 hover:bg-dola-border/10">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {inv.recommended && <Star size={12} className="text-dola-warning" />}
                      <div>
                        <p className="font-medium text-dola-text">{inv.name}</p>
                        {inv.taxFree && <span className="text-[9px] text-dola-success font-bold">ISENTO IR</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-dola-muted">{inv.category}</td>
                  <td className="p-3 text-right">
                    <span className={`font-bold ${inv.type === 'fixed' ? 'text-dola-success' : 'text-dola-warning'}`}>
                      {inv.currentRate.toFixed(2)}%
                    </span>
                    <span className="text-[10px] text-dola-muted ml-1">a.a.</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getRiskColor(inv.risk)}`}>
                      {inv.risk}
                    </span>
                  </td>
                  <td className="p-3 text-center text-dola-muted">{inv.liquidity}</td>
                  <td className="p-3 text-right text-dola-text">{fmt(inv.minInvestment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
          <Zap size={16} className="text-dola-warning" />
          Dicas DOLA AI para Investir
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: '🛡️', title: 'Reserva de Emergência', text: 'Primeiro, tenha 6-12 meses de gastos em Tesouro Selic ou CDB liquidez diária.' },
            { icon: '💰', title: 'Diversifique', text: 'Não coloque tudo em um só investimento. Mix de Tesouro + CDB + LCI é ideal.' },
            { icon: '📊', title: 'Prefira Isentos de IR', text: 'LCI, LCA e CRI/CRA são isentos de IR. Rentabilidade líquida maior!' },
            { icon: '⏰', title: 'Tempo é seu aliado', text: 'Juros compostos funcionam no longo prazo. Comece cedo, mesmo com pouco.' },
            { icon: '🚫', title: 'Fuja da Poupança', text: 'Rende apenas 70% da Selic. Tesouro Selic rende 100% e é tão seguro quanto.' },
            { icon: '🎯', title: 'Tenha Objetivos', text: 'Defina metas: aposentadoria, casa, viagem. Isso ajuda a manter disciplina.' },
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-dola-bg/50">
              <span className="text-xl">{tip.icon}</span>
              <div>
                <p className="text-sm font-medium text-dola-text">{tip.title}</p>
                <p className="text-xs text-dola-muted">{tip.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="glass rounded-xl p-4 border border-dola-warning/20">
        <div className="flex items-start gap-2">
          <Info size={14} className="text-dola-warning mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-dola-warning font-semibold">Aviso Importante</p>
            <p className="text-xs text-dola-muted mt-1">
              As taxas apresentadas são aproximadas e podem variar. Consulte sempre as corretoras para valores atualizados. 
              Investimentos envolvem riscos. Rentabilidade passada não garante rentabilidade futura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
