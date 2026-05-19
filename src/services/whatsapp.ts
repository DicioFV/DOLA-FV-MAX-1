// DOLA AI - WhatsApp Integration Service
// Suporta: CallMeBot (GRATUITO!), Twilio, Evolution API, Meta Business API

export interface WhatsAppConfig {
  enabled: boolean;
  phoneNumber: string; // Número que receberá as mensagens
  provider: 'callmebot' | 'twilio' | 'evolution' | 'meta' | 'demo';
  apiKey?: string; // Para CallMeBot, é o apikey recebido após ativação
  apiUrl?: string;
  instanceName?: string;
}

export interface WhatsAppMessage {
  id: string;
  to: string;
  message: string;
  type: 'reminder' | 'alert' | 'task' | 'event' | 'habit' | 'finance' | 'daily_summary';
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'read';
  scheduledAt?: string;
  sentAt?: string;
  error?: string;
}

// Templates de mensagens
export const MESSAGE_TEMPLATES = {
  reminder: (title: string, time: string, priority: string) => 
    `🔔 *LEMBRETE DOLA AI*\n\n` +
    `📌 ${title}\n` +
    `⏰ ${time}\n` +
    `🎯 Prioridade: ${priority}\n\n` +
    `_Responda "OK" para confirmar_`,

  alert_critical: (title: string) =>
    `🚨 *ALERTA CRÍTICO*\n\n` +
    `⚠️ ${title}\n\n` +
    `_Ação imediata necessária!_`,

  task_due: (title: string, dueDate: string) =>
    `✅ *TAREFA PENDENTE*\n\n` +
    `📝 ${title}\n` +
    `📅 Prazo: ${dueDate}\n\n` +
    `_Não esqueça de concluir!_`,

  event_reminder: (title: string, time: string, description: string) =>
    `📅 *EVENTO EM BREVE*\n\n` +
    `🎯 ${title}\n` +
    `⏰ Horário: ${time}\n` +
    `${description ? `📝 ${description}\n` : ''}\n` +
    `_Prepare-se!_`,

  habit_reminder: (habits: string[]) =>
    `🎯 *HÁBITOS DO DIA*\n\n` +
    habits.map(h => `▫️ ${h}`).join('\n') +
    `\n\n_Mantenha sua consistência! 🔥_`,

  daily_summary: (data: { tasks: number; events: number; reminders: number; habits: string }) =>
    `📊 *RESUMO DIÁRIO DOLA AI*\n\n` +
    `✅ Tarefas pendentes: ${data.tasks}\n` +
    `📅 Eventos hoje: ${data.events}\n` +
    `🔔 Lembretes: ${data.reminders}\n` +
    `🎯 Hábitos: ${data.habits}\n\n` +
    `_Tenha um dia produtivo!_`,

  finance_alert: (description: string, amount: string, dueDate: string) =>
    `💰 *ALERTA FINANCEIRO*\n\n` +
    `📌 ${description}\n` +
    `💵 Valor: ${amount}\n` +
    `📅 Vencimento: ${dueDate}\n\n` +
    `_Não esqueça de pagar!_`,

  morning_briefing: (name: string, data: any) =>
    `☀️ *BOM DIA, ${name.toUpperCase()}!*\n\n` +
    `Seu briefing de hoje:\n\n` +
    `📅 ${data.events} compromisso(s)\n` +
    `✅ ${data.tasks} tarefa(s) pendente(s)\n` +
    `🔔 ${data.reminders} lembrete(s)\n` +
    `🎯 ${data.habits} hábito(s) para hoje\n\n` +
    `_DOLA AI ao seu serviço!_ 🤖`,

  weekly_report: (data: any) =>
    `📈 *RELATÓRIO SEMANAL DOLA AI*\n\n` +
    `✅ Tarefas concluídas: ${data.tasksCompleted}\n` +
    `📊 Produtividade: ${data.productivity}%\n` +
    `🔥 Total streaks: ${data.streaks}\n` +
    `💰 Balanço: R$ ${data.balance}\n\n` +
    `${data.productivity >= 70 ? '🌟 Excelente semana!' : '💪 Continue progredindo!'}\n\n` +
    `_DOLA AI - Seu assistente executivo_`,
};

// Função para enviar via diferentes provedores
export async function sendWhatsAppMessage(
  config: WhatsAppConfig,
  message: string,
  _type: WhatsAppMessage['type'] = 'reminder'
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  
  if (!config.enabled) {
    return { success: false, error: 'WhatsApp não está habilitado' };
  }

  const phoneNumber = config.phoneNumber.replace(/\D/g, '');
  
  // CALLMEBOT - GRATUITO! 🎉
  // Funciona enviando mensagens para seu próprio número
  if (config.provider === 'callmebot') {
    if (!config.apiKey) {
      return { success: false, error: 'API Key do CallMeBot não configurada. Siga as instruções de ativação.' };
    }
    
    try {
      // CallMeBot API - 100% gratuito
      const encodedMessage = encodeURIComponent(message);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${encodedMessage}&apikey=${config.apiKey}`;
      
      // Usar modo no-cors para evitar problemas de CORS
      // A API do CallMeBot não retorna JSON, apenas texto
      await fetch(url, { 
        method: 'GET',
        mode: 'no-cors' // CallMeBot não suporta CORS, mas a mensagem é enviada
      });
      
      // Com no-cors, não temos acesso à resposta, mas a requisição é feita
      console.log('📱 [CallMeBot] Mensagem enviada para:', phoneNumber);
      console.log('📝 Mensagem:', message);
      
      return { 
        success: true, 
        messageId: `callmebot_${Date.now()}`,
      };
    } catch (error: any) {
      console.error('❌ Erro CallMeBot:', error);
      return { success: false, error: error.message };
    }
  }
  
  // MODO DEMO - Simula envio
  if (config.provider === 'demo') {
    console.log('📱 [DEMO] Enviando WhatsApp para:', phoneNumber);
    console.log('📝 Mensagem:', message);
    
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { 
      success: true, 
      messageId: `demo_${Date.now()}`,
    };
  }

  // TWILIO
  if (config.provider === 'twilio') {
    try {
      const response = await fetch(`${config.apiUrl || 'https://api.twilio.com'}/2010-04-01/Accounts/${config.instanceName}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${config.instanceName}:${config.apiKey}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `whatsapp:+${phoneNumber}`,
          From: `whatsapp:+${config.instanceName}`,
          Body: message,
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        return { success: true, messageId: data.sid };
      }
      return { success: false, error: data.message };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // EVOLUTION API
  if (config.provider === 'evolution') {
    try {
      const response = await fetch(`${config.apiUrl}/message/sendText/${config.instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.apiKey || '',
        },
        body: JSON.stringify({
          number: phoneNumber,
          text: message,
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        return { success: true, messageId: data.key?.id };
      }
      return { success: false, error: data.message };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // META BUSINESS API
  if (config.provider === 'meta') {
    try {
      const response = await fetch(`https://graph.facebook.com/v17.0/${config.instanceName}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: message },
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        return { success: true, messageId: data.messages?.[0]?.id };
      }
      return { success: false, error: data.error?.message };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  return { success: false, error: 'Provedor não suportado' };
}

// Gerar link direto do WhatsApp (fallback)
export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  const phone = phoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

// Verificar se é horário apropriado para enviar
export function isAppropriateTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 7 && hour <= 22; // Entre 7h e 22h
}

// Formatar número de telefone
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 13) {
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
  }
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}
