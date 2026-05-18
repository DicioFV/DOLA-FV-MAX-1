import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { WhatsAppConfig, WhatsAppMessage } from '../services/whatsapp';

export interface NotificationLog {
  id: string;
  userId: string;
  type: 'reminder' | 'alert' | 'task' | 'event' | 'habit' | 'finance' | 'daily_summary';
  title: string;
  message: string;
  channel: 'whatsapp' | 'push' | 'email';
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  scheduledAt: string;
  sentAt?: string;
  error?: string;
  relatedId?: string; // ID do lembrete, tarefa, etc.
}

export interface NotificationSettings {
  userId: string;
  enabled: boolean;
  channels: {
    whatsapp: boolean;
    push: boolean;
    email: boolean;
  };
  types: {
    reminders: boolean;
    tasks: boolean;
    events: boolean;
    habits: boolean;
    finance: boolean;
    dailySummary: boolean;
    weeklyReport: boolean;
  };
  timing: {
    morningBriefing: string; // "07:00"
    eveningSummary: string; // "21:00"
    reminderMinutesBefore: number; // 15, 30, 60
  };
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "07:00"
  };
}

interface WhatsAppState {
  // Config
  whatsappConfig: WhatsAppConfig;
  setWhatsAppConfig: (config: Partial<WhatsAppConfig>) => void;
  
  // Notification Settings per user
  notificationSettings: Record<string, NotificationSettings>;
  setNotificationSettings: (userId: string, settings: Partial<NotificationSettings>) => void;
  
  // Logs
  notificationLogs: NotificationLog[];
  addNotificationLog: (log: Omit<NotificationLog, 'id'>) => void;
  updateNotificationLog: (id: string, updates: Partial<NotificationLog>) => void;
  clearLogs: (userId: string) => void;
  
  // Queue
  messageQueue: WhatsAppMessage[];
  addToQueue: (msg: Omit<WhatsAppMessage, 'id'>) => void;
  removeFromQueue: (id: string) => void;
  processQueue: () => void;
  
  // Stats
  getStats: (userId: string) => { sent: number; failed: number; pending: number };
}

const DEFAULT_CONFIG: WhatsAppConfig = {
  enabled: true,
  phoneNumber: '+5521964367184',
  provider: 'demo',
  apiKey: '',
  apiUrl: '',
  instanceName: '',
};

const DEFAULT_NOTIFICATION_SETTINGS: Omit<NotificationSettings, 'userId'> = {
  enabled: true,
  channels: {
    whatsapp: true,
    push: true,
    email: false,
  },
  types: {
    reminders: true,
    tasks: true,
    events: true,
    habits: true,
    finance: true,
    dailySummary: true,
    weeklyReport: true,
  },
  timing: {
    morningBriefing: '07:00',
    eveningSummary: '21:00',
    reminderMinutesBefore: 15,
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '07:00',
  },
};

export const useWhatsAppStore = create<WhatsAppState>()(
  persist(
    (set, get) => ({
      whatsappConfig: DEFAULT_CONFIG,
      
      setWhatsAppConfig: (config) => set(s => ({
        whatsappConfig: { ...s.whatsappConfig, ...config }
      })),
      
      notificationSettings: {},
      
      setNotificationSettings: (userId, settings) => set(s => ({
        notificationSettings: {
          ...s.notificationSettings,
          [userId]: {
            ...DEFAULT_NOTIFICATION_SETTINGS,
            ...s.notificationSettings[userId],
            ...settings,
            userId,
          }
        }
      })),
      
      notificationLogs: [],
      
      addNotificationLog: (log) => set(s => ({
        notificationLogs: [...s.notificationLogs, { ...log, id: uuid() }]
      })),
      
      updateNotificationLog: (id, updates) => set(s => ({
        notificationLogs: s.notificationLogs.map(l => 
          l.id === id ? { ...l, ...updates } : l
        )
      })),
      
      clearLogs: (userId) => set(s => ({
        notificationLogs: s.notificationLogs.filter(l => l.userId !== userId)
      })),
      
      messageQueue: [],
      
      addToQueue: (msg) => set(s => ({
        messageQueue: [...s.messageQueue, { ...msg, id: uuid() }]
      })),
      
      removeFromQueue: (id) => set(s => ({
        messageQueue: s.messageQueue.filter(m => m.id !== id)
      })),
      
      processQueue: () => {
        // Seria processado por um worker/service
        console.log('Processing queue:', get().messageQueue.length, 'messages');
      },
      
      getStats: (userId) => {
        const logs = get().notificationLogs.filter(l => l.userId === userId);
        return {
          sent: logs.filter(l => l.status === 'sent' || l.status === 'delivered').length,
          failed: logs.filter(l => l.status === 'failed').length,
          pending: logs.filter(l => l.status === 'pending').length,
        };
      },
    }),
    {
      name: 'dola-whatsapp-storage',
    }
  )
);
