import { useStore } from './store/useStore';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import AgendaPage from './pages/AgendaPage';
import TasksPage from './pages/TasksPage';
import RemindersPage from './pages/RemindersPage';
import HabitsPage from './pages/HabitsPage';
import FinancePage from './pages/FinancePage';
import FamilyPage from './pages/FamilyPage';
import NotesPage from './pages/NotesPage';
import ProductivityPage from './pages/ProductivityPage';
import AssistantPage from './pages/AssistantPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import { Bell, Search } from 'lucide-react';
import { useState } from 'react';

function AppContent() {
  const { currentPage, currentUser, reminders, setCurrentPage } = useStore();
  const pendingReminders = reminders.filter(r => r.userId === currentUser?.id && !r.done);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage />,
    agenda: <AgendaPage />,
    tasks: <TasksPage />,
    reminders: <RemindersPage />,
    habits: <HabitsPage />,
    finance: <FinancePage />,
    family: <FamilyPage />,
    notes: <NotesPage />,
    productivity: <ProductivityPage />,
    assistant: <AssistantPage />,
    users: <UsersPage />,
    settings: <SettingsPage />,
  };

  const pageTitle: Record<string, string> = {
    dashboard: 'Dashboard',
    agenda: 'Agenda',
    tasks: 'Tarefas',
    reminders: 'Lembretes',
    habits: 'Hábitos',
    finance: 'Financeiro',
    family: 'Família',
    notes: 'Notas',
    productivity: 'Produtividade',
    assistant: 'DOLA IA',
    users: 'Usuários',
    settings: 'Configurações',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dola-bg">
      <Sidebar />

      <main className="flex-1 lg:ml-64 overflow-hidden flex flex-col">
        {/* Top bar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-dola-border/50 bg-dola-bg/80 backdrop-blur-xl">
          <div className="flex items-center gap-4 ml-12 lg:ml-0">
            <h2 className="text-sm font-semibold text-dola-text hidden sm:block">{pageTitle[currentPage]}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-xl hover:bg-dola-border/30 text-dola-muted transition-colors">
                <Search size={18} />
              </button>
              {showSearch && (
                <div className="absolute right-0 top-12 w-72 glass-strong rounded-2xl p-3 animate-slide-up z-50">
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="!text-sm"
                    onKeyDown={e => {
                      if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(''); }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Notifications */}
            <button
              onClick={() => setCurrentPage('reminders')}
              className="relative p-2 rounded-xl hover:bg-dola-border/30 text-dola-muted transition-colors"
            >
              <Bell size={18} />
              {pendingReminders.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-dola-danger text-white text-[9px] font-bold flex items-center justify-center rounded-full min-w-[18px] h-[18px]">
                  {pendingReminders.length}
                </span>
              )}
            </button>

            {/* User */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dola-accent to-dola-pink flex items-center justify-center text-white text-xs font-bold">
              {currentUser?.name?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {pages[currentPage] || <DashboardPage />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useStore();

  if (!isAuthenticated) return <LoginPage />;
  return <AppContent />;
}
