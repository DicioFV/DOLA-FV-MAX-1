// DOLA AI - Notification Service
// Gerencia o envio automático de notificações

import { sendWhatsAppMessage, MESSAGE_TEMPLATES, isAppropriateTime, WhatsAppConfig } from './whatsapp';
import { Reminder, Event, Task, Habit, FinanceEntry } from '../store/useStore';

export interface NotificationJob {
  id: string;
  type: 'reminder' | 'event' | 'task' | 'habit' | 'finance';
  scheduledAt: Date;
  executed: boolean;
  data: any;
}

// Verifica lembretes que precisam ser enviados
export function checkRemindersToSend(
  reminders: Reminder[],
  userId: string,
  minutesBefore: number = 15
): Reminder[] {
  const now = new Date();
  const threshold = new Date(now.getTime() + minutesBefore * 60 * 1000);
  
  return reminders.filter(r => {
    if (r.userId !== userId || r.done) return false;
    const reminderTime = new Date(r.datetime);
    return reminderTime <= threshold && reminderTime > now;
  });
}

// Verifica eventos que precisam de lembrete
export function checkEventsToRemind(
  events: Event[],
  userId: string,
  minutesBefore: number = 30
): Event[] {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  return events.filter(e => {
    if (e.userId !== userId || e.date !== today || !e.reminder) return false;
    const eventTime = new Date(`${e.date}T${e.startTime}`);
    const reminderTime = new Date(eventTime.getTime() - minutesBefore * 60 * 1000);
    return now >= reminderTime && now < eventTime;
  });
}

// Verifica tarefas urgentes vencendo
export function checkUrgentTasks(tasks: Task[], userId: string): Task[] {
  const today = new Date().toISOString().split('T')[0];
  
  return tasks.filter(t => {
    if (t.userId !== userId || t.status === 'done') return false;
    if (t.priority !== 'urgent' && t.priority !== 'high') return false;
    return t.dueDate && t.dueDate <= today;
  });
}

// Verifica contas a vencer
export function checkFinanceDue(finances: FinanceEntry[], userId: string, daysBefore: number = 3): FinanceEntry[] {
  const now = new Date();
  const threshold = new Date(now.getTime() + daysBefore * 24 * 60 * 60 * 1000);
  const thresholdStr = threshold.toISOString().split('T')[0];
  
  return finances.filter(f => {
    if (f.userId !== userId || f.status === 'paid' || f.type !== 'expense') return false;
    return f.date <= thresholdStr;
  });
}

// Verifica hábitos não feitos hoje
export function checkHabitsReminder(habits: Habit[], userId: string): Habit[] {
  const today = new Date().toISOString().split('T')[0];
  const hour = new Date().getHours();
  
  // Só lembra à noite (depois das 18h)
  if (hour < 18) return [];
  
  return habits.filter(h => {
    if (h.userId !== userId) return false;
    return !h.completedDates.includes(today);
  });
}

// Gera mensagem de lembrete
export function generateReminderMessage(reminder: Reminder): string {
  const time = new Date(reminder.datetime).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return MESSAGE_TEMPLATES.reminder(
    reminder.title,
    time,
    reminder.priority === 'critical' ? '🚨 CRÍTICA' :
    reminder.priority === 'high' ? '⚠️ Alta' :
    reminder.priority === 'medium' ? '📌 Média' : '📋 Baixa'
  );
}

// Gera mensagem de evento
export function generateEventMessage(event: Event): string {
  return MESSAGE_TEMPLATES.event_reminder(
    event.title,
    `${event.startTime} - ${event.endTime}`,
    event.description
  );
}

// Gera mensagem de alerta de tarefa
export function generateTaskAlertMessage(task: Task): string {
  const dueDate = task.dueDate 
    ? new Date(task.dueDate).toLocaleDateString('pt-BR') 
    : 'Sem prazo';
    
  return MESSAGE_TEMPLATES.task_due(task.title, dueDate);
}

// Gera mensagem de alerta financeiro
export function generateFinanceAlertMessage(finance: FinanceEntry): string {
  const amount = finance.amount.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
  const dueDate = new Date(finance.date).toLocaleDateString('pt-BR');
  
  return MESSAGE_TEMPLATES.finance_alert(finance.description, amount, dueDate);
}

// Gera mensagem de hábitos pendentes
export function generateHabitsReminderMessage(habits: Habit[]): string {
  return MESSAGE_TEMPLATES.habit_reminder(habits.map(h => `${h.icon} ${h.name}`));
}

// Sistema de notificação principal
export class NotificationManager {
  private config: WhatsAppConfig;
  private checkInterval: number | null = null;
  private sentNotifications: Set<string> = new Set();
  
  constructor(config: WhatsAppConfig) {
    this.config = config;
  }
  
  updateConfig(config: WhatsAppConfig) {
    this.config = config;
  }
  
  // Inicia o monitoramento
  start(checkIntervalMs: number = 60000) { // Verifica a cada minuto
    if (this.checkInterval) return;
    
    console.log('🔔 NotificationManager iniciado');
    this.checkInterval = window.setInterval(() => {
      this.check();
    }, checkIntervalMs);
    
    // Verifica imediatamente
    this.check();
  }
  
  // Para o monitoramento
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('🔔 NotificationManager parado');
  }
  
  // Método principal de verificação
  private async check() {
    if (!this.config.enabled || !isAppropriateTime()) return;
    
    // Aqui seria integrado com o store real
    console.log('🔔 Verificando notificações pendentes...');
  }
  
  // Envia notificação
  async sendNotification(type: string, message: string, referenceId: string): Promise<boolean> {
    const notifKey = `${type}-${referenceId}-${new Date().toISOString().split('T')[0]}`;
    
    // Evita duplicatas no mesmo dia
    if (this.sentNotifications.has(notifKey)) {
      console.log('⏭️ Notificação já enviada hoje:', notifKey);
      return false;
    }
    
    const result = await sendWhatsAppMessage(this.config, message, type as any);
    
    if (result.success) {
      this.sentNotifications.add(notifKey);
      console.log('✅ Notificação enviada:', type);
    } else {
      console.error('❌ Falha ao enviar:', result.error);
    }
    
    return result.success;
  }
  
  // Limpa cache de notificações enviadas (chamar à meia-noite)
  clearSentCache() {
    this.sentNotifications.clear();
  }
}

// Singleton do NotificationManager
let notificationManager: NotificationManager | null = null;

export function getNotificationManager(config?: WhatsAppConfig): NotificationManager {
  if (!notificationManager && config) {
    notificationManager = new NotificationManager(config);
  }
  if (config && notificationManager) {
    notificationManager.updateConfig(config);
  }
  return notificationManager!;
}
