import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useWhatsAppStore } from '../store/useWhatsAppStore';
import { 
  sendWhatsAppMessage, 
  MESSAGE_TEMPLATES, 
  formatPhoneNumber, 
  generateWhatsAppLink,
  isAppropriateTime
} from '../services/whatsapp';
import { 
  MessageCircle, Send, CheckCircle2, XCircle, Clock, 
  Settings, Bell, Smartphone, Zap, RefreshCw, ExternalLink,
  AlertTriangle, Info, Trash2, TestTube, Phone, Copy, Check,
  Sparkles
} from 'lucide-react';

export default function WhatsAppPage() {
  const { currentUser, reminders, tasks, events, habits } = useStore();
  const { 
    whatsappConfig, setWhatsAppConfig, 
    notificationLogs, addNotificationLog, clearLogs,
    notificationSettings, setNotificationSettings,
    getStats
  } = useWhatsAppStore();
  
  const uid = currentUser?.id || '';
  const stats = getStats(uid);
  const userLogs = notificationLogs.filter(l => l.userId === uid).slice(-50).reverse();
  const userSettings = notificationSettings[uid] || {
    enabled: true,
    channels: { whatsapp: true, push: true, email: false },
    types: { reminders: true, tasks: true, events: true, habits: true, finance: true, dailySummary: true, weeklyReport: true },
    timing: { morningBriefing: '07:00', eveningSummary: '21:00', reminderMinutesBefore: 15 },
    quietHours: { enabled: true, start: '22:00', end: '07:00' },
  };
  
  const [testMessage, setTestMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'settings'>('overview');
  const [copied, setCopied] = useState(false);

  // Initialize settings for user
  useEffect(() => {
    if (uid && !notificationSettings[uid]) {
      setNotificationSettings(uid, {});
    }
  }, [uid, notificationSettings, setNotificationSettings]);

  // Check if CallMeBot is configured
  const isCallMeBotConfigured = whatsappConfig.provider === 'callmebot' && whatsappConfig.apiKey;

  const handleTestMessage = async () => {
    if (!testMessage.trim()) return;
    setSending(true);
    
    const result = await sendWhatsAppMessage(whatsappConfig, testMessage, 'reminder');
    
    addNotificationLog({
      userId: uid,
      type: 'reminder',
      title: 'Mensagem de Teste',
      message: testMessage,
      channel: 'whatsapp',
      status: result.success ? 'sent' : 'failed',
      scheduledAt: new Date().toISOString(),
      sentAt: result.success ? new Date().toISOString() : undefined,
      error: result.error,
    });
    
    setSending(false);
    if (result.success) {
      setTestMessage('');
      alert('✅ Mensagem enviada! Verifique seu WhatsApp.');
    }
  };

  const handleSendDailySummary = async () => {
    setSending(true);
    const today = new Date().toISOString().split('T')[0];
    const pendingTasks = tasks.filter(t => t.userId === uid && t.status !== 'done').length;
    const todayEvents = events.filter(e => e.userId === uid && e.date === today).length;
    const pendingReminders = reminders.filter(r => r.userId === uid && !r.done).length;
    const todayHabits = habits.filter(h => h.userId === uid);
    const doneHabits = todayHabits.filter(h => h.completedDates.includes(today)).length;
    
    const message = MESSAGE_TEMPLATES.daily_summary({
      tasks: pendingTasks,
      events: todayEvents,
      reminders: pendingReminders,
      habits: `${doneHabits}/${todayHabits.length}`,
    });
    
    const result = await sendWhatsAppMessage(whatsappConfig, message, 'daily_summary');
    
    addNotificationLog({
      userId: uid,
      type: 'daily_summary',
      title: 'Resumo Diário',
      message,
      channel: 'whatsapp',
      status: result.success ? 'sent' : 'failed',
      scheduledAt: new Date().toISOString(),
      sentAt: result.success ? new Date().toISOString() : undefined,
      error: result.error,
    });
    
    setSending(false);
    if (result.success) {
      alert('✅ Resumo enviado! Verifique seu WhatsApp.');
    }
  };

  const handleSendMorningBriefing = async () => {
    setSending(true);
    const today = new Date().toISOString().split('T')[0];
    
    const message = MESSAGE_TEMPLATES.morning_briefing(currentUser?.name || 'Executivo', {
      events: events.filter(e => e.userId === uid && e.date === today).length,
      tasks: tasks.filter(t => t.userId === uid && t.status !== 'done').length,
      reminders: reminders.filter(r => r.userId === uid && !r.done).length,
      habits: habits.filter(h => h.userId === uid).length,
    });
    
    const result = await sendWhatsAppMessage(whatsappConfig, message, 'daily_summary');
    
    addNotificationLog({
      userId: uid,
      type: 'daily_summary',
      title: 'Briefing Matinal',
      message,
      channel: 'whatsapp',
      status: result.success ? 'sent' : 'failed',
      scheduledAt: new Date().toISOString(),
      sentAt: result.success ? new Date().toISOString() : undefined,
      error: result.error,
    });
    
    setSending(false);
    if (result.success) {
      alert('✅ Briefing enviado! Verifique seu WhatsApp.');
    }
  };

  const handleSendReminder = async (reminder: typeof reminders[0]) => {
    setSending(true);
    const time = new Date(reminder.datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const message = MESSAGE_TEMPLATES.reminder(reminder.title, time, reminder.priority);
    
    const result = await sendWhatsAppMessage(whatsappConfig, message, 'reminder');
    
    addNotificationLog({
      userId: uid,
      type: 'reminder',
      title: reminder.title,
      message,
      channel: 'whatsapp',
      status: result.success ? 'sent' : 'failed',
      scheduledAt: new Date().toISOString(),
      sentAt: result.success ? new Date().toISOString() : undefined,
      error: result.error,
      relatedId: reminder.id,
    });
    
    setSending(false);
    if (result.success) {
      alert('✅ Lembrete enviado! Verifique seu WhatsApp.');
    }
  };

  const openWhatsAppDirect = (message: string) => {
    const link = generateWhatsAppLink(whatsappConfig.phoneNumber, message);
    window.open(link, '_blank');
  };

  const copyActivationMessage = () => {
    navigator.clipboard.writeText('I allow callmebot to send me messages');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string; text: string; icon: any }> = {
      sent: { bg: 'bg-dola-success/10', text: 'text-dola-success', icon: CheckCircle2 },
      delivered: { bg: 'bg-dola-success/10', text: 'text-dola-success', icon: CheckCircle2 },
      failed: { bg: 'bg-dola-danger/10', text: 'text-dola-danger', icon: XCircle },
      pending: { bg: 'bg-dola-warning/10', text: 'text-dola-warning', icon: Clock },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}>
        <Icon size={10} />
        {status === 'sent' ? 'Enviado' : status === 'delivered' ? 'Entregue' : status === 'failed' ? 'Falhou' : 'Pendente'}
      </span>
    );
  };

  const pendingReminders = reminders.filter(r => r.userId === uid && !r.done);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dola-text flex items-center gap-2">
            <MessageCircle size={24} className="text-green-500" />
            WhatsApp Gratuito
          </h1>
          <p className="text-sm text-dola-muted mt-1">
            Receba lembretes automáticos no seu WhatsApp — 100% grátis!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            isCallMeBotConfigured ? 'bg-green-500/10 text-green-500' : 'bg-dola-warning/10 text-dola-warning'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isCallMeBotConfigured ? 'bg-green-500 animate-pulse' : 'bg-dola-warning'}`} />
            {isCallMeBotConfigured ? 'Configurado ✓' : 'Não configurado'}
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 rounded-xl glass hover:bg-dola-border/30 transition-colors"
          >
            <Settings size={18} className="text-dola-muted" />
          </button>
        </div>
      </div>

      {/* Setup Guide - Show if not configured */}
      {!isCallMeBotConfigured && (
        <div className="glass rounded-2xl p-6 border-2 border-green-500/30 animate-pulse-glow">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <Sparkles size={24} className="text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-dola-text mb-2">🎉 Configure WhatsApp GRATUITO em 2 Minutos!</h3>
              <p className="text-sm text-dola-muted mb-4">
                Usando <strong>CallMeBot</strong> — serviço 100% gratuito para enviar mensagens para seu próprio WhatsApp.
              </p>
              <button
                onClick={() => setShowSetup(true)}
                className="px-6 py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <MessageCircle size={18} />
                Configurar Agora (Gratuito)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowSetup(false)}>
          <div className="glass-strong rounded-2xl p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-dola-text mb-6 flex items-center gap-2">
              <MessageCircle size={24} className="text-green-500" />
              Configurar WhatsApp Gratuito
            </h3>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-dola-bg/50 border border-dola-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">1</div>
                  <h4 className="font-semibold text-dola-text">Envie uma mensagem de ativação</h4>
                </div>
                <p className="text-sm text-dola-muted mb-3">
                  Envie a mensagem abaixo para o número do CallMeBot:
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <code className="flex-1 p-3 rounded-lg bg-dola-surface text-green-400 text-sm font-mono">
                    I allow callmebot to send me messages
                  </code>
                  <button
                    onClick={copyActivationMessage}
                    className="p-3 rounded-lg bg-dola-surface hover:bg-dola-border/50 transition-colors"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-dola-muted" />}
                  </button>
                </div>
                <a
                  href="https://wa.me/34644718199?text=I%20allow%20callmebot%20to%20send%20me%20messages"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  <ExternalLink size={14} />
                  Abrir WhatsApp e Enviar
                </a>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-dola-bg/50 border border-dola-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">2</div>
                  <h4 className="font-semibold text-dola-text">Copie sua API Key</h4>
                </div>
                <p className="text-sm text-dola-muted mb-3">
                  O CallMeBot vai responder com sua <strong>API Key</strong>. A mensagem será assim:
                </p>
                <div className="p-3 rounded-lg bg-dola-surface text-xs text-dola-muted font-mono">
                  "API Activated for your phone number. Your APIKEY is <span className="text-green-400 font-bold">123456</span>"
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-dola-bg/50 border border-dola-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">3</div>
                  <h4 className="font-semibold text-dola-text">Cole sua API Key aqui</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-dola-muted mb-1">Seu Número WhatsApp</label>
                    <input
                      value={whatsappConfig.phoneNumber}
                      onChange={e => setWhatsAppConfig({ phoneNumber: e.target.value })}
                      placeholder="+5521964367184"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dola-muted mb-1">API Key do CallMeBot</label>
                    <input
                      value={whatsappConfig.apiKey || ''}
                      onChange={e => setWhatsAppConfig({ apiKey: e.target.value, provider: 'callmebot' })}
                      placeholder="Cole sua API Key aqui (ex: 123456)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setWhatsAppConfig({ provider: 'callmebot', enabled: true });
                    setShowSetup(false);
                  }}
                  disabled={!whatsappConfig.apiKey}
                  className="flex-1 py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✓ Salvar e Ativar
                </button>
                <button
                  onClick={() => setShowSetup(false)}
                  className="px-6 py-3 rounded-xl glass text-dola-muted font-medium text-sm hover:text-dola-text transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Config Panel */}
      {showConfig && (
        <div className="glass rounded-2xl p-5 border border-dola-accent/20 animate-slide-up">
          <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
            <Settings size={16} className="text-dola-accent" />
            Configuração do WhatsApp
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-dola-muted mb-1">Número de Telefone</label>
              <div className="flex gap-2">
                <input
                  value={whatsappConfig.phoneNumber}
                  onChange={e => setWhatsAppConfig({ phoneNumber: e.target.value })}
                  placeholder="+5521964367184"
                  className="flex-1"
                />
                <button className="p-2.5 rounded-xl glass" title="Número atual">
                  <Phone size={16} className="text-green-500" />
                </button>
              </div>
              <p className="text-[10px] text-dola-muted mt-1">
                Formatado: {formatPhoneNumber(whatsappConfig.phoneNumber)}
              </p>
            </div>
            <div>
              <label className="block text-xs text-dola-muted mb-1">Provedor</label>
              <select
                value={whatsappConfig.provider}
                onChange={e => setWhatsAppConfig({ provider: e.target.value as any })}
              >
                <option value="callmebot">🆓 CallMeBot (Gratuito!)</option>
                <option value="demo">🧪 Demo (Simulado)</option>
                <option value="evolution">Evolution API</option>
                <option value="twilio">Twilio</option>
                <option value="meta">Meta Business API</option>
              </select>
            </div>
            {whatsappConfig.provider === 'callmebot' && (
              <div className="md:col-span-2">
                <label className="block text-xs text-dola-muted mb-1">API Key do CallMeBot</label>
                <input
                  value={whatsappConfig.apiKey || ''}
                  onChange={e => setWhatsAppConfig({ apiKey: e.target.value })}
                  placeholder="Sua API Key (ex: 123456)"
                />
                {!whatsappConfig.apiKey && (
                  <button
                    onClick={() => setShowSetup(true)}
                    className="text-xs text-green-500 mt-1 hover:underline"
                  >
                    → Não tem API Key? Clique aqui para obter gratuitamente
                  </button>
                )}
              </div>
            )}
            {whatsappConfig.provider !== 'demo' && whatsappConfig.provider !== 'callmebot' && (
              <>
                <div>
                  <label className="block text-xs text-dola-muted mb-1">API URL</label>
                  <input
                    value={whatsappConfig.apiUrl}
                    onChange={e => setWhatsAppConfig({ apiUrl: e.target.value })}
                    placeholder="https://api.exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-dola-muted mb-1">API Key</label>
                  <input
                    type="password"
                    value={whatsappConfig.apiKey}
                    onChange={e => setWhatsAppConfig({ apiKey: e.target.value })}
                    placeholder="Sua chave de API"
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dola-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setWhatsAppConfig({ enabled: !whatsappConfig.enabled })}
                className={`toggle-switch ${whatsappConfig.enabled ? 'active' : ''}`}
              />
              <span className="text-sm text-dola-text">Ativar WhatsApp</span>
            </label>
          </div>
          
          {whatsappConfig.provider === 'callmebot' && whatsappConfig.apiKey && (
            <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-2">
              <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
              <p className="text-xs text-green-500">
                <strong>CallMeBot configurado!</strong> As mensagens serão enviadas automaticamente para {formatPhoneNumber(whatsappConfig.phoneNumber)}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass rounded-2xl p-4 text-center">
          <Send size={20} className="mx-auto text-dola-success mb-2" />
          <p className="text-2xl font-bold text-dola-success">{stats.sent}</p>
          <p className="text-xs text-dola-muted">Enviadas</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <Clock size={20} className="mx-auto text-dola-warning mb-2" />
          <p className="text-2xl font-bold text-dola-warning">{stats.pending}</p>
          <p className="text-xs text-dola-muted">Pendentes</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <XCircle size={20} className="mx-auto text-dola-danger mb-2" />
          <p className="text-2xl font-bold text-dola-danger">{stats.failed}</p>
          <p className="text-xs text-dola-muted">Falhas</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <Smartphone size={20} className="mx-auto text-green-500 mb-2" />
          <p className="text-lg font-bold text-dola-text truncate">{formatPhoneNumber(whatsappConfig.phoneNumber).slice(-9)}</p>
          <p className="text-xs text-dola-muted">Número</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dola-border pb-2">
        {(['overview', 'logs', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-dola-accent/10 text-dola-accent' : 'text-dola-muted hover:text-dola-text'
            }`}
          >
            {tab === 'overview' ? '📱 Visão Geral' : tab === 'logs' ? '📋 Histórico' : '⚙️ Preferências'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Quick Actions */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
              <Zap size={16} className="text-dola-warning" />
              Enviar Agora
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleSendMorningBriefing}
                disabled={sending || !isCallMeBotConfigured}
                className="w-full p-3 rounded-xl bg-dola-bg/50 hover:bg-dola-accent/10 border border-dola-border/50 flex items-center gap-3 transition-colors disabled:opacity-50"
              >
                <span className="text-xl">☀️</span>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-dola-text">Enviar Briefing Matinal</p>
                  <p className="text-[10px] text-dola-muted">Resumo de compromissos e tarefas</p>
                </div>
                {sending ? <RefreshCw size={14} className="animate-spin text-dola-muted" /> : <Send size={14} className="text-dola-muted" />}
              </button>
              
              <button
                onClick={handleSendDailySummary}
                disabled={sending || !isCallMeBotConfigured}
                className="w-full p-3 rounded-xl bg-dola-bg/50 hover:bg-dola-accent/10 border border-dola-border/50 flex items-center gap-3 transition-colors disabled:opacity-50"
              >
                <span className="text-xl">📊</span>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-dola-text">Enviar Resumo Diário</p>
                  <p className="text-[10px] text-dola-muted">Status de produtividade</p>
                </div>
                {sending ? <RefreshCw size={14} className="animate-spin text-dola-muted" /> : <Send size={14} className="text-dola-muted" />}
              </button>

              {!isCallMeBotConfigured && (
                <div className="p-3 rounded-xl bg-dola-warning/10 border border-dola-warning/20 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-dola-warning shrink-0" />
                  <p className="text-xs text-dola-warning">
                    Configure o CallMeBot acima para enviar mensagens
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Reminders to Send */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
              <Bell size={16} className="text-dola-accent" />
              Lembretes Pendentes
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {pendingReminders.length === 0 ? (
                <p className="text-sm text-dola-muted text-center py-4">Nenhum lembrete pendente</p>
              ) : pendingReminders.slice(0, 5).map(r => (
                <div key={r.id} className="p-3 rounded-xl bg-dola-bg/50 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    r.priority === 'critical' ? 'bg-dola-danger animate-pulse' :
                    r.priority === 'high' ? 'bg-dola-warning' : 'bg-dola-info'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dola-text truncate">{r.title}</p>
                    <p className="text-[10px] text-dola-muted">
                      {new Date(r.datetime).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSendReminder(r)}
                    disabled={sending || !isCallMeBotConfigured}
                    className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                  >
                    <Send size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Test Message */}
          <div className="glass rounded-2xl p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
              <TestTube size={16} className="text-dola-accent" />
              Testar Envio
            </h3>
            <textarea
              value={testMessage}
              onChange={e => setTestMessage(e.target.value)}
              placeholder="Digite uma mensagem de teste para enviar ao seu WhatsApp..."
              rows={3}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleTestMessage}
                disabled={!testMessage.trim() || sending || !isCallMeBotConfigured}
                className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                Enviar para WhatsApp
              </button>
              <button
                onClick={() => openWhatsAppDirect(testMessage || 'Teste DOLA AI')}
                className="px-4 py-2.5 rounded-xl glass text-dola-text font-medium text-sm hover:bg-dola-border/30 transition-colors flex items-center gap-2"
              >
                <ExternalLink size={14} />
                Abrir App
              </button>
            </div>
            
            {!isAppropriateTime() && (
              <div className="mt-3 p-2 rounded-lg bg-dola-warning/10 flex items-center gap-2">
                <AlertTriangle size={12} className="text-dola-warning" />
                <span className="text-[10px] text-dola-warning">Fora do horário permitido (7h-22h)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-dola-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-dola-text">Histórico de Mensagens</h3>
            <button
              onClick={() => clearLogs(uid)}
              className="text-xs text-dola-muted hover:text-dola-danger flex items-center gap-1"
            >
              <Trash2 size={12} /> Limpar
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {userLogs.length === 0 ? (
              <div className="p-8 text-center text-dola-muted">
                <MessageCircle size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma mensagem enviada ainda</p>
              </div>
            ) : userLogs.map(log => (
              <div key={log.id} className="p-4 border-b border-dola-border/30 hover:bg-dola-border/10 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-dola-text">{log.title}</span>
                      <StatusBadge status={log.status} />
                    </div>
                    <p className="text-xs text-dola-muted line-clamp-2">{log.message}</p>
                    {log.error && (
                      <p className="text-[10px] text-dola-danger mt-1">Erro: {log.error}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-dola-muted/60 whitespace-nowrap">
                    {new Date(log.sentAt || log.scheduledAt).toLocaleString('pt-BR', { 
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
              <Bell size={16} className="text-dola-accent" />
              Tipos de Notificação Automática
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'reminders', label: 'Lembretes', icon: '🔔' },
                { key: 'tasks', label: 'Tarefas Urgentes', icon: '✅' },
                { key: 'events', label: 'Eventos', icon: '📅' },
                { key: 'habits', label: 'Hábitos', icon: '🎯' },
                { key: 'finance', label: 'Contas a Vencer', icon: '💰' },
                { key: 'dailySummary', label: 'Resumo Diário', icon: '📊' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 p-3 rounded-xl bg-dola-bg/50 cursor-pointer hover:bg-dola-border/20 transition-colors">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm text-dola-text flex-1">{item.label}</span>
                  <div
                    onClick={() => setNotificationSettings(uid, {
                      types: { ...userSettings.types, [item.key]: !userSettings.types[item.key as keyof typeof userSettings.types] }
                    })}
                    className={`toggle-switch ${userSettings.types[item.key as keyof typeof userSettings.types] ? 'active' : ''}`}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
              <Clock size={16} className="text-dola-warning" />
              Horários de Envio Automático
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-dola-muted mb-1">Briefing Matinal</label>
                <input
                  type="time"
                  value={userSettings.timing.morningBriefing}
                  onChange={e => setNotificationSettings(uid, {
                    timing: { ...userSettings.timing, morningBriefing: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-xs text-dola-muted mb-1">Resumo Noturno</label>
                <input
                  type="time"
                  value={userSettings.timing.eveningSummary}
                  onChange={e => setNotificationSettings(uid, {
                    timing: { ...userSettings.timing, eveningSummary: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-xs text-dola-muted mb-1">Antecedência Lembretes</label>
                <select
                  value={userSettings.timing.reminderMinutesBefore}
                  onChange={e => setNotificationSettings(uid, {
                    timing: { ...userSettings.timing, reminderMinutesBefore: Number(e.target.value) }
                  })}
                >
                  <option value={5}>5 minutos antes</option>
                  <option value={10}>10 minutos antes</option>
                  <option value={15}>15 minutos antes</option>
                  <option value={30}>30 minutos antes</option>
                  <option value={60}>1 hora antes</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-dola-danger" />
              Horário Silencioso
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div
                onClick={() => setNotificationSettings(uid, {
                  quietHours: { ...userSettings.quietHours, enabled: !userSettings.quietHours.enabled }
                })}
                className={`toggle-switch ${userSettings.quietHours.enabled ? 'active' : ''}`}
              />
              <span className="text-sm text-dola-text">Não enviar mensagens durante horário silencioso</span>
            </div>
            {userSettings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Início (não perturbe)</label>
                  <input
                    type="time"
                    value={userSettings.quietHours.start}
                    onChange={e => setNotificationSettings(uid, {
                      quietHours: { ...userSettings.quietHours, start: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Fim</label>
                  <input
                    type="time"
                    value={userSettings.quietHours.end}
                    onChange={e => setNotificationSettings(uid, {
                      quietHours: { ...userSettings.quietHours, end: e.target.value }
                    })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="glass rounded-xl p-4 border border-green-500/20">
        <h4 className="text-xs font-semibold text-dola-text mb-2 flex items-center gap-2">
          <Info size={12} className="text-green-500" />
          Como Funciona o CallMeBot (Gratuito)
        </h4>
        <ul className="text-xs text-dola-muted space-y-1">
          <li>• <strong>100% Gratuito:</strong> Sem limites de mensagens para seu próprio número</li>
          <li>• <strong>Seu número:</strong> {formatPhoneNumber(whatsappConfig.phoneNumber)}</li>
          <li>• <strong>Automático:</strong> Lembretes são enviados minutos antes do horário</li>
          <li>• <strong>Seguro:</strong> Só funciona para o número que você ativou</li>
          <li>• <strong>Limitação:</strong> Só envia para SEU número (não para terceiros)</li>
        </ul>
      </div>
    </div>
  );
}
