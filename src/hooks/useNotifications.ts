import { useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { useWhatsAppStore } from '../store/useWhatsAppStore';
import { 
  sendWhatsAppMessage, 
  MESSAGE_TEMPLATES, 
  isAppropriateTime 
} from '../services/whatsapp';
import {
  checkRemindersToSend,
  checkEventsToRemind,
  checkUrgentTasks,
  checkFinanceDue,
  checkHabitsReminder,
} from '../services/notifications';

export function useNotifications() {
  const { reminders, events, tasks, habits, finances, currentUser } = useStore();
  const { whatsappConfig, notificationSettings, addNotificationLog } = useWhatsAppStore();
  
  const uid = currentUser?.id || '';
  const userSettings = notificationSettings[uid];

  const sendNotification = useCallback(async (
    type: 'reminder' | 'event' | 'task' | 'habit' | 'finance' | 'daily_summary',
    title: string,
    message: string,
    relatedId?: string
  ) => {
    if (!whatsappConfig.enabled || !userSettings?.enabled) return;
    if (!userSettings.channels.whatsapp) return;
    if (!isAppropriateTime()) return;
    
    // Check quiet hours
    if (userSettings.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const { start, end } = userSettings.quietHours;
      
      // If start > end, it spans midnight
      if (start > end) {
        if (currentTime >= start || currentTime < end) return;
      } else {
        if (currentTime >= start && currentTime < end) return;
      }
    }
    
    const result = await sendWhatsAppMessage(whatsappConfig, message, type);
    
    addNotificationLog({
      userId: uid,
      type,
      title,
      message,
      channel: 'whatsapp',
      status: result.success ? 'sent' : 'failed',
      scheduledAt: new Date().toISOString(),
      sentAt: result.success ? new Date().toISOString() : undefined,
      error: result.error,
      relatedId,
    });
    
    return result.success;
  }, [whatsappConfig, userSettings, uid, addNotificationLog]);

  // Check for notifications every minute
  useEffect(() => {
    if (!uid || !whatsappConfig.enabled) return;
    
    const sentThisSession = new Set<string>();
    
    const checkNotifications = async () => {
      if (!isAppropriateTime()) return;
      
      const minutesBefore = userSettings?.timing?.reminderMinutesBefore || 15;
      
      // Check reminders
      if (userSettings?.types?.reminders) {
        const dueReminders = checkRemindersToSend(reminders, uid, minutesBefore);
        for (const r of dueReminders) {
          const key = `reminder-${r.id}`;
          if (sentThisSession.has(key)) continue;
          
          const time = new Date(r.datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const msg = MESSAGE_TEMPLATES.reminder(r.title, time, r.priority);
          const success = await sendNotification('reminder', r.title, msg, r.id);
          if (success) sentThisSession.add(key);
        }
      }
      
      // Check events
      if (userSettings?.types?.events) {
        const dueEvents = checkEventsToRemind(events, uid, 30);
        for (const e of dueEvents) {
          const key = `event-${e.id}`;
          if (sentThisSession.has(key)) continue;
          
          const msg = MESSAGE_TEMPLATES.event_reminder(e.title, `${e.startTime} - ${e.endTime}`, e.description);
          const success = await sendNotification('event', e.title, msg, e.id);
          if (success) sentThisSession.add(key);
        }
      }
      
      // Check urgent tasks (once per hour)
      if (userSettings?.types?.tasks) {
        const now = new Date();
        if (now.getMinutes() === 0) { // Only at the start of each hour
          const urgentTasks = checkUrgentTasks(tasks, uid);
          if (urgentTasks.length > 0) {
            const key = `tasks-urgent-${now.getHours()}`;
            if (!sentThisSession.has(key)) {
              const msg = `🚨 *TAREFAS URGENTES*\n\nVocê tem ${urgentTasks.length} tarefa(s) urgente(s) pendente(s):\n\n` +
                urgentTasks.slice(0, 5).map(t => `• ${t.title}`).join('\n');
              await sendNotification('task', 'Tarefas Urgentes', msg);
              sentThisSession.add(key);
            }
          }
        }
      }
      
      // Check finance due (once per day at 9am)
      if (userSettings?.types?.finance) {
        const now = new Date();
        if (now.getHours() === 9 && now.getMinutes() === 0) {
          const dueSoon = checkFinanceDue(finances, uid, 3);
          if (dueSoon.length > 0) {
            const total = dueSoon.reduce((s, f) => s + f.amount, 0);
            const msg = `💰 *CONTAS A VENCER*\n\n` +
              `${dueSoon.length} conta(s) vencem em até 3 dias:\n\n` +
              dueSoon.slice(0, 5).map(f => 
                `• ${f.description}: R$ ${f.amount.toLocaleString('pt-BR')}`
              ).join('\n') +
              `\n\n📊 Total: R$ ${total.toLocaleString('pt-BR')}`;
            await sendNotification('finance', 'Contas a Vencer', msg);
          }
        }
        
        // ALERTA 16h01 - Contas não pagas no dia do vencimento
        if (now.getHours() === 16 && now.getMinutes() === 1) {
          const today = now.toISOString().split('T')[0];
          const unpaidToday = finances.filter(f => 
            f.userId === uid && 
            f.type === 'expense' && 
            f.status === 'pending' && 
            f.date === today
          );
          
          if (unpaidToday.length > 0) {
            const total = unpaidToday.reduce((s, f) => s + f.amount, 0);
            const msg = `🚨 *ALERTA URGENTE - 16h01*\n\n` +
              `⚠️ ${unpaidToday.length} conta(s) VENCEM HOJE e ainda não foram pagas!\n\n` +
              unpaidToday.map(f => 
                `• ${f.description}: R$ ${f.amount.toLocaleString('pt-BR')}`
              ).join('\n') +
              `\n\n💵 Total: R$ ${total.toLocaleString('pt-BR')}\n\n` +
              `_Pague AGORA para evitar juros e multas!_`;
            await sendNotification('finance', '⚠️ CONTAS VENCEM HOJE!', msg);
          }
        }
      }
      
      // Check habits (at 7pm)
      if (userSettings?.types?.habits) {
        const now = new Date();
        if (now.getHours() === 19 && now.getMinutes() === 0) {
          const pendingHabits = checkHabitsReminder(habits, uid);
          if (pendingHabits.length > 0) {
            const msg = MESSAGE_TEMPLATES.habit_reminder(pendingHabits.map(h => `${h.icon} ${h.name}`));
            await sendNotification('habit', 'Hábitos Pendentes', msg);
          }
        }
      }
      
      // Morning briefing
      if (userSettings?.types?.dailySummary && userSettings?.timing?.morningBriefing) {
        const now = new Date();
        const [hour, minute] = userSettings.timing.morningBriefing.split(':').map(Number);
        if (now.getHours() === hour && now.getMinutes() === minute) {
          const key = `briefing-${now.toISOString().split('T')[0]}`;
          if (!sentThisSession.has(key)) {
            const today = now.toISOString().split('T')[0];
            const msg = MESSAGE_TEMPLATES.morning_briefing(currentUser?.name || 'Executivo', {
              events: events.filter(e => e.userId === uid && e.date === today).length,
              tasks: tasks.filter(t => t.userId === uid && t.status !== 'done').length,
              reminders: reminders.filter(r => r.userId === uid && !r.done).length,
              habits: habits.filter(h => h.userId === uid).length,
            });
            await sendNotification('daily_summary', 'Briefing Matinal', msg);
            sentThisSession.add(key);
          }
        }
      }
    };
    
    // Initial check
    checkNotifications();
    
    // Check every minute
    const interval = setInterval(checkNotifications, 60000);
    
    return () => clearInterval(interval);
  }, [uid, whatsappConfig, userSettings, reminders, events, tasks, habits, finances, currentUser, sendNotification]);

  return { sendNotification };
}
