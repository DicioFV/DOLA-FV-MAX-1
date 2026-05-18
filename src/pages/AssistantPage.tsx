import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useWhatsAppStore } from '../store/useWhatsAppStore';
import { Bot, Send, Trash2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { sendWhatsAppMessage, MESSAGE_TEMPLATES, formatPhoneNumber } from '../services/whatsapp';

const QUICK_COMMANDS = [
  'Qual minha agenda de hoje?',
  'Criar tarefa urgente',
  'Resumo do dia',
  'Enviar briefing WhatsApp',
  'Sugerir horários para reunião',
  'Relatório de produtividade',
  'Configurar WhatsApp',
];

export default function AssistantPage() {
  const { chatMessages, addChatMessage, clearChat, tasks, events, habits, reminders, currentUser, setCurrentPage } = useStore();
  const { whatsappConfig, addNotificationLog } = useWhatsAppStore();
  const uid = currentUser?.id || '';
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages]);

  const myTasks = tasks.filter(t => t.userId === uid);
  const myEvents = events.filter(e => e.userId === uid);
  const myHabits = habits.filter(h => h.userId === uid);
  const myReminders = reminders.filter(r => r.userId === uid);
  const today = new Date().toISOString().split('T')[0];

  const generateResponse = (message: string): string => {
    const lower = message.toLowerCase();

    if (lower.includes('agenda') && (lower.includes('hoje') || lower.includes('today'))) {
      const todayEvents = myEvents.filter(e => e.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
      if (todayEvents.length === 0) return '📅 Sua agenda de hoje está livre! Que tal usar o tempo para planejar ou descansar?';
      return `📅 **Agenda de Hoje:**\n\n${todayEvents.map(e => `• ${e.startTime} - ${e.endTime}: **${e.title}** (${e.type})`).join('\n')}\n\nVocê tem ${todayEvents.length} compromisso(s) hoje.`;
    }

    if (lower.includes('resumo') || lower.includes('summary')) {
      const pendingTasks = myTasks.filter(t => t.status !== 'done').length;
      const doneTasks = myTasks.filter(t => t.status === 'done').length;
      const pendingReminders = myReminders.filter(r => !r.done).length;
      const todayHabits = myHabits.filter(h => h.completedDates.includes(today)).length;
      return `📊 **Resumo do Dia — ${format(new Date(), 'dd/MM/yyyy')}**\n\n` +
        `✅ Tarefas concluídas: ${doneTasks}\n` +
        `⏳ Tarefas pendentes: ${pendingTasks}\n` +
        `📅 Eventos hoje: ${myEvents.filter(e => e.date === today).length}\n` +
        `🔔 Lembretes pendentes: ${pendingReminders}\n` +
        `🎯 Hábitos feitos: ${todayHabits}/${myHabits.length}\n\n` +
        `${pendingTasks > 5 ? '⚠️ Você tem muitas tarefas pendentes. Priorize as urgentes!' : '✨ Bom ritmo! Continue assim!'}`;
    }

    if (lower.includes('tarefa') && (lower.includes('urgente') || lower.includes('criar'))) {
      return '📝 Para criar uma tarefa urgente, vá ao módulo **Tarefas** e clique em **Nova Tarefa**. Defina a prioridade como "Urgente" e o setor adequado.\n\n💡 **Dica:** Tarefas urgentes aparecem com alerta especial no dashboard!';
    }

    if (lower.includes('lembre') || lower.includes('remind')) {
      return '🔔 Para criar um lembrete, vá ao módulo **Lembretes** e clique em **Novo**. Você pode definir prioridade, categoria e recorrência.\n\n💡 **Dica:** Lembretes críticos aparecem com animação no dashboard!';
    }

    if (lower.includes('produtividade') || lower.includes('relatório') || lower.includes('report')) {
      const prod = myTasks.length > 0 ? Math.round((myTasks.filter(t => t.status === 'done').length / myTasks.length) * 100) : 0;
      const totalStreak = myHabits.reduce((s, h) => s + h.streak, 0);
      return `📈 **Relatório de Produtividade**\n\n` +
        `🎯 Taxa de conclusão: ${prod}%\n` +
        `🔥 Total de streaks: ${totalStreak}\n` +
        `📊 Tarefas ativas: ${myTasks.filter(t => t.status !== 'done').length}\n` +
        `⏰ Tempo investido: ${Math.floor(myTasks.reduce((s, t) => s + t.timeSpent, 0) / 60)}h\n\n` +
        `${prod >= 70 ? '🌟 Excelente produtividade! Mantenha o ritmo!' : '💪 Há espaço para melhorar. Foque nas tarefas de maior impacto!'}`;
    }

    if (lower.includes('horário') || lower.includes('sugerir') || lower.includes('reunião')) {
      const busyTimes = myEvents.filter(e => e.date === today).map(e => e.startTime);
      const slots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].filter(s => !busyTimes.includes(s));
      return `🕐 **Horários disponíveis hoje:**\n\n${slots.map(s => `• ${s}`).join('\n')}\n\n💡 Recomendo agendar reuniões pela manhã para maior produtividade.`;
    }

    if (lower.includes('cancelar')) {
      return '❌ Para cancelar um compromisso, vá ao módulo **Agenda**, selecione o dia e clique no ❌ ao lado do evento.\n\n💡 Lembre-se de avisar os participantes sobre o cancelamento!';
    }

    if (lower.includes('olá') || lower.includes('oi') || lower.includes('hello') || lower.includes('bom')) {
      const h = new Date().getHours();
      const greeting = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
      return `${greeting}, ${currentUser?.name?.split(' ')[0]}! 👋\n\nSou a DOLA, sua assistente executiva. Como posso ajudar?\n\n**Posso ajudar com:**\n• 📅 Verificar sua agenda\n• 📝 Gerenciar tarefas\n• 📊 Relatórios de produtividade\n• 🔔 Criar lembretes\n• 🕐 Sugerir horários`;
    }

    if (lower.includes('hábito') || lower.includes('streak')) {
      return `🎯 **Seus Hábitos:**\n\n${myHabits.map(h => `${h.icon} ${h.name}: ${h.streak} dias 🔥`).join('\n')}\n\n` +
        `${myHabits.some(h => h.streak >= 7) ? '🌟 Excelente consistência!' : '💪 Continue firme nos seus hábitos!'}`;
    }

    // WhatsApp commands
    if (lower.includes('whatsapp') && (lower.includes('briefing') || lower.includes('enviar'))) {
      // Send WhatsApp briefing
      const msg = MESSAGE_TEMPLATES.morning_briefing(currentUser?.name || 'Executivo', {
        events: myEvents.filter(e => e.date === today).length,
        tasks: myTasks.filter(t => t.status !== 'done').length,
        reminders: myReminders.filter(r => !r.done).length,
        habits: myHabits.length,
      });
      
      sendWhatsAppMessage(whatsappConfig, msg, 'daily_summary').then(result => {
        addNotificationLog({
          userId: uid,
          type: 'daily_summary',
          title: 'Briefing via DOLA IA',
          message: msg,
          channel: 'whatsapp',
          status: result.success ? 'sent' : 'failed',
          scheduledAt: new Date().toISOString(),
          sentAt: result.success ? new Date().toISOString() : undefined,
          error: result.error,
        });
      });
      
      return `📱 **Enviando Briefing por WhatsApp!**\n\n` +
        `📞 Número: ${formatPhoneNumber(whatsappConfig.phoneNumber)}\n` +
        `📊 Modo: ${whatsappConfig.provider === 'demo' ? 'Demonstração (veja console)' : whatsappConfig.provider}\n\n` +
        `${whatsappConfig.provider === 'demo' ? '⚠️ No modo demo, a mensagem é simulada. Configure uma API real no módulo WhatsApp para envio real.' : '✅ Mensagem enviada!'}`;
    }

    if (lower.includes('whatsapp') && lower.includes('config')) {
      setCurrentPage('whatsapp');
      return `⚙️ **Configurar WhatsApp**\n\n` +
        `Redirecionando para a página de configuração do WhatsApp...\n\n` +
        `📞 Número atual: ${formatPhoneNumber(whatsappConfig.phoneNumber)}\n` +
        `📊 Provedor: ${whatsappConfig.provider}\n` +
        `✅ Status: ${whatsappConfig.enabled ? 'Ativo' : 'Desativado'}`;
    }

    return `🤖 Entendi sua mensagem. Aqui estão algumas coisas que posso fazer:\n\n` +
      `• **"Qual minha agenda de hoje?"** — Ver compromissos\n` +
      `• **"Resumo do dia"** — Relatório completo\n` +
      `• **"Enviar briefing WhatsApp"** — Enviar resumo por WhatsApp\n` +
      `• **"Configurar WhatsApp"** — Ajustar notificações\n` +
      `• **"Relatório de produtividade"** — Análise de desempenho\n\n` +
      `💡 WhatsApp integrado! Diga "enviar briefing" para testar.`;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    addChatMessage({ role: 'user', content: input.trim() });
    const userMsg = input.trim();
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(userMsg);
      addChatMessage({ role: 'assistant', content: response });
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-dola-text flex items-center gap-2">
            <Bot size={24} className="text-dola-accent" />
            DOLA IA Assistant
          </h1>
          <p className="text-sm text-dola-muted mt-1">Sua secretária executiva inteligente</p>
        </div>
        <button onClick={clearChat} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-dola-muted hover:text-dola-danger hover:bg-dola-danger/10 transition-colors">
          <Trash2 size={14} /> Limpar
        </button>
      </div>

      {/* Chat area */}
      <div ref={chatRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        {chatMessages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dola-accent to-dola-accent2 flex items-center justify-center mx-auto mb-4 animate-float">
              <Sparkles size={28} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-dola-text mb-2">Olá! Sou a DOLA 🤖</h2>
            <p className="text-sm text-dola-muted mb-6">Sua assistente executiva inteligente. Como posso ajudar?</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              {QUICK_COMMANDS.map(cmd => (
                <button
                  key={cmd}
                  onClick={() => { setInput(cmd); }}
                  className="px-3 py-1.5 rounded-lg glass text-xs text-dola-muted hover:text-dola-accent hover:border-dola-accent/30 border border-transparent transition-all"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] sm:max-w-[70%] p-4 rounded-2xl ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-dola-accent to-dola-accent2 text-white rounded-br-md'
                : 'glass rounded-bl-md'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-dola-accent to-dola-accent2 flex items-center justify-center">
                    <Bot size={12} className="text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-dola-accent">DOLA AI</span>
                </div>
              )}
              <div className="text-sm whitespace-pre-line leading-relaxed">
                {msg.content.split('**').map((part, i) =>
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                )}
              </div>
              <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-white/50' : 'text-dola-muted/50'}`}>
                {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="glass p-4 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-dola-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-dola-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-dola-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="glass-strong rounded-2xl p-3 flex items-center gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Pergunte à DOLA..."
          className="!border-none !bg-transparent !p-2 flex-1"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-3 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white hover:opacity-90 transition-opacity disabled:opacity-30"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
