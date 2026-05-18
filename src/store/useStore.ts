import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sector: string;
  dueDate?: string;
  subtasks: { id: string; title: string; done: boolean }[];
  timeSpent: number; // minutes
  createdAt: string;
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'business' | 'family' | 'financial' | 'health' | 'spiritual' | 'personal';
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  reminder: boolean;
  color: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  datetime: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  done: boolean;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  icon: string;
  category: string;
  streak: number;
  bestStreak: number;
  completedDates: string[];
  target: number; // days per week
}

export interface FinanceEntry {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'pending' | 'paid' | 'overdue';
  recurring: boolean;
}

export interface FamilyEvent {
  id: string;
  userId: string;
  title: string;
  date: string;
  type: 'school' | 'birthday' | 'trip' | 'family_time' | 'medical' | 'other';
  members: string[];
  notes: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AppState {
  // Auth
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  removeUser: (id: string) => void;
  
  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: Task['status']) => void;

  // Events
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;

  // Reminders
  reminders: Reminder[];
  addReminder: (r: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;

  // Habits
  habits: Habit[];
  addHabit: (h: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completedDates'>) => void;
  toggleHabitDay: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;

  // Finance
  finances: FinanceEntry[];
  addFinance: (f: Omit<FinanceEntry, 'id'>) => void;
  updateFinance: (id: string, updates: Partial<FinanceEntry>) => void;
  deleteFinance: (id: string) => void;

  // Family
  familyEvents: FamilyEvent[];
  addFamilyEvent: (f: Omit<FamilyEvent, 'id'>) => void;
  deleteFamilyEvent: (id: string) => void;

  // Notes
  notes: Note[];
  addNote: (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
}

const ADMIN_USER: User = {
  id: 'admin-001',
  name: 'Administrador DOLA',
  email: '10felitec@gmail.com',
  password: '135Amor.',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

// Seed data
const today = new Date().toISOString().split('T')[0];

const seedTasks: Task[] = [
  { id: uuid(), userId: 'admin-001', title: 'Revisar planejamento estratégico Q1', description: 'Analisar metas e KPIs do trimestre', status: 'doing', priority: 'high', sector: 'Negócios', dueDate: today, subtasks: [{ id: uuid(), title: 'Analisar relatório financeiro', done: true }, { id: uuid(), title: 'Definir novas metas', done: false }], timeSpent: 120, createdAt: new Date().toISOString() },
  { id: uuid(), userId: 'admin-001', title: 'Reunião com equipe de marketing', description: 'Apresentar nova campanha', status: 'todo', priority: 'medium', sector: 'Marketing', dueDate: today, subtasks: [], timeSpent: 0, createdAt: new Date().toISOString() },
  { id: uuid(), userId: 'admin-001', title: 'Preparar apresentação investidores', description: 'Deck para rodada de investimento', status: 'backlog', priority: 'urgent', sector: 'Negócios', subtasks: [], timeSpent: 0, createdAt: new Date().toISOString() },
  { id: uuid(), userId: 'admin-001', title: 'Plano de conteúdo mensal', description: 'Criar calendário editorial', status: 'done', priority: 'medium', sector: 'Conteúdo', subtasks: [], timeSpent: 90, createdAt: new Date().toISOString() },
  { id: uuid(), userId: 'admin-001', title: 'Tempo de qualidade com família', description: 'Jantar especial sexta-feira', status: 'todo', priority: 'high', sector: 'Família', subtasks: [], timeSpent: 0, createdAt: new Date().toISOString() },
  { id: uuid(), userId: 'admin-001', title: 'Estudar novo framework', description: 'Aprofundar conhecimentos em IA', status: 'doing', priority: 'medium', sector: 'Estudos', subtasks: [], timeSpent: 60, createdAt: new Date().toISOString() },
];

const seedEvents: Event[] = [
  { id: uuid(), userId: 'admin-001', title: 'Reunião de Diretoria', description: 'Revisão trimestral', date: today, startTime: '09:00', endTime: '10:30', type: 'business', recurring: 'none', reminder: true, color: '#6366f1' },
  { id: uuid(), userId: 'admin-001', title: 'Almoço com Cliente VIP', description: 'Restaurante Premium', date: today, startTime: '12:00', endTime: '13:30', type: 'business', recurring: 'none', reminder: true, color: '#8b5cf6' },
  { id: uuid(), userId: 'admin-001', title: 'Treino', description: 'Academia', date: today, startTime: '06:00', endTime: '07:00', type: 'health', recurring: 'daily', reminder: true, color: '#10b981' },
  { id: uuid(), userId: 'admin-001', title: 'Tempo com Filhos', description: 'Parque', date: today, startTime: '17:00', endTime: '18:30', type: 'family', recurring: 'none', reminder: true, color: '#ec4899' },
];

const seedHabits: Habit[] = [
  { id: uuid(), userId: 'admin-001', name: 'Exercício Físico', icon: '🏋️', category: 'Saúde', streak: 12, bestStreak: 30, completedDates: Array.from({ length: 12 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0]; }), target: 6 },
  { id: uuid(), userId: 'admin-001', name: 'Leitura Bíblica', icon: '📖', category: 'Espiritual', streak: 45, bestStreak: 45, completedDates: Array.from({ length: 45 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0]; }), target: 7 },
  { id: uuid(), userId: 'admin-001', name: 'Beber 3L Água', icon: '💧', category: 'Saúde', streak: 8, bestStreak: 20, completedDates: Array.from({ length: 8 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0]; }), target: 7 },
  { id: uuid(), userId: 'admin-001', name: 'Meditação', icon: '🧘', category: 'Espiritual', streak: 5, bestStreak: 15, completedDates: Array.from({ length: 5 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0]; }), target: 5 },
  { id: uuid(), userId: 'admin-001', name: 'Leitura 30min', icon: '📚', category: 'Estudos', streak: 20, bestStreak: 25, completedDates: Array.from({ length: 20 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0]; }), target: 5 },
  { id: uuid(), userId: 'admin-001', name: 'Sono 7h+', icon: '😴', category: 'Saúde', streak: 3, bestStreak: 14, completedDates: Array.from({ length: 3 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0]; }), target: 7 },
];

const seedFinances: FinanceEntry[] = [
  { id: uuid(), userId: 'admin-001', type: 'income', category: 'Empresa', description: 'Faturamento mensal', amount: 85000, date: today, status: 'paid', recurring: true },
  { id: uuid(), userId: 'admin-001', type: 'income', category: 'Consultoria', description: 'Projeto especial', amount: 15000, date: today, status: 'pending', recurring: false },
  { id: uuid(), userId: 'admin-001', type: 'expense', category: 'Escritório', description: 'Aluguel', amount: 8500, date: today, status: 'paid', recurring: true },
  { id: uuid(), userId: 'admin-001', type: 'expense', category: 'Equipe', description: 'Folha de pagamento', amount: 32000, date: today, status: 'paid', recurring: true },
  { id: uuid(), userId: 'admin-001', type: 'expense', category: 'Marketing', description: 'Campanha digital', amount: 5000, date: today, status: 'pending', recurring: true },
  { id: uuid(), userId: 'admin-001', type: 'expense', category: 'Família', description: 'Escola dos filhos', amount: 4500, date: today, status: 'paid', recurring: true },
];

const seedReminders: Reminder[] = [
  { id: uuid(), userId: 'admin-001', title: 'Reunião com investidores', datetime: new Date(Date.now() + 3600000).toISOString(), priority: 'critical', category: 'Negócios', recurring: 'none', done: false },
  { id: uuid(), userId: 'admin-001', title: 'Buscar filhos na escola', datetime: new Date(Date.now() + 7200000).toISOString(), priority: 'high', category: 'Família', recurring: 'daily', done: false },
  { id: uuid(), userId: 'admin-001', title: 'Tomar vitaminas', datetime: new Date(Date.now() + 1800000).toISOString(), priority: 'medium', category: 'Saúde', recurring: 'daily', done: false },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
      users: [ADMIN_USER],
      isAuthenticated: false,

      login: (email, password) => {
        const user = get().users.find(u => u.email === email && u.password === password);
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => set({ currentUser: null, isAuthenticated: false, currentPage: 'dashboard' }),

      addUser: (userData) => {
        const newUser: User = { ...userData, id: uuid(), createdAt: new Date().toISOString() };
        set(s => ({ users: [...s.users, newUser] }));
      },

      removeUser: (id) => set(s => ({ users: s.users.filter(u => u.id !== id) })),

      // Navigation
      currentPage: 'dashboard',
      setCurrentPage: (page) => set({ currentPage: page }),
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Tasks
      tasks: seedTasks,
      addTask: (task) => set(s => ({ tasks: [...s.tasks, { ...task, id: uuid(), createdAt: new Date().toISOString() }] })),
      updateTask: (id, updates) => set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t) })),
      deleteTask: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),
      moveTask: (id, status) => set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, status } : t) })),

      // Events
      events: seedEvents,
      addEvent: (event) => set(s => ({ events: [...s.events, { ...event, id: uuid() }] })),
      updateEvent: (id, updates) => set(s => ({ events: s.events.map(e => e.id === id ? { ...e, ...updates } : e) })),
      deleteEvent: (id) => set(s => ({ events: s.events.filter(e => e.id !== id) })),

      // Reminders
      reminders: seedReminders,
      addReminder: (r) => set(s => ({ reminders: [...s.reminders, { ...r, id: uuid() }] })),
      updateReminder: (id, updates) => set(s => ({ reminders: s.reminders.map(r => r.id === id ? { ...r, ...updates } : r) })),
      deleteReminder: (id) => set(s => ({ reminders: s.reminders.filter(r => r.id !== id) })),

      // Habits
      habits: seedHabits,
      addHabit: (h) => set(s => ({ habits: [...s.habits, { ...h, id: uuid(), streak: 0, bestStreak: 0, completedDates: [] }] })),
      toggleHabitDay: (id, date) => set(s => ({
        habits: s.habits.map(h => {
          if (h.id !== id) return h;
          const dates = h.completedDates.includes(date)
            ? h.completedDates.filter(d => d !== date)
            : [...h.completedDates, date];
          // Calculate streak
          let streak = 0;
          const sorted = [...dates].sort().reverse();
          const todayStr = new Date().toISOString().split('T')[0];
          for (let i = 0; i < sorted.length; i++) {
            const d = new Date(todayStr);
            d.setDate(d.getDate() - i);
            if (sorted.includes(d.toISOString().split('T')[0])) streak++;
            else break;
          }
          return { ...h, completedDates: dates, streak, bestStreak: Math.max(h.bestStreak, streak) };
        })
      })),
      deleteHabit: (id) => set(s => ({ habits: s.habits.filter(h => h.id !== id) })),

      // Finance
      finances: seedFinances,
      addFinance: (f) => set(s => ({ finances: [...s.finances, { ...f, id: uuid() }] })),
      updateFinance: (id, updates) => set(s => ({ finances: s.finances.map(f => f.id === id ? { ...f, ...updates } : f) })),
      deleteFinance: (id) => set(s => ({ finances: s.finances.filter(f => f.id !== id) })),

      // Family
      familyEvents: [],
      addFamilyEvent: (f) => set(s => ({ familyEvents: [...s.familyEvents, { ...f, id: uuid() }] })),
      deleteFamilyEvent: (id) => set(s => ({ familyEvents: s.familyEvents.filter(f => f.id !== id) })),

      // Notes
      notes: [],
      addNote: (n) => {
        const now = new Date().toISOString();
        set(s => ({ notes: [...s.notes, { ...n, id: uuid(), createdAt: now, updatedAt: now }] }));
      },
      updateNote: (id, updates) => set(s => ({ notes: s.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n) })),
      deleteNote: (id) => set(s => ({ notes: s.notes.filter(n => n.id !== id) })),

      // Chat
      chatMessages: [],
      addChatMessage: (msg) => set(s => ({ chatMessages: [...s.chatMessages, { ...msg, id: uuid(), timestamp: new Date().toISOString() }] })),
      clearChat: () => set({ chatMessages: [] }),
    }),
    {
      name: 'dola-ai-storage',
      partialize: (state) => ({
        users: state.users,
        tasks: state.tasks,
        events: state.events,
        reminders: state.reminders,
        habits: state.habits,
        finances: state.finances,
        familyEvents: state.familyEvents,
        notes: state.notes,
        chatMessages: state.chatMessages,
      }),
    }
  )
);
