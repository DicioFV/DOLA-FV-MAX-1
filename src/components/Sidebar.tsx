import { useStore } from '../store/useStore';
import {
  LayoutDashboard, CalendarDays, CheckSquare, Bell, Heart,
  TrendingUp, Wallet, Users, Settings, LogOut,
  Target, FileText, Menu, X, Bot
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'agenda', label: 'Agenda', icon: CalendarDays },
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  { id: 'reminders', label: 'Lembretes', icon: Bell },
  { id: 'habits', label: 'Hábitos', icon: Target },
  { id: 'finance', label: 'Financeiro', icon: Wallet },
  { id: 'family', label: 'Família', icon: Heart },
  { id: 'notes', label: 'Notas', icon: FileText },
  { id: 'productivity', label: 'Produtividade', icon: TrendingUp },
  { id: 'assistant', label: 'DOLA IA', icon: Bot },
];

const adminItems = [
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, currentUser, logout, sidebarOpen, setSidebarOpen } = useStore();
  const isAdmin = currentUser?.role === 'admin';

  const NavItem = ({ item }: { item: typeof menuItems[0] }) => {
    const Icon = item.icon;
    const active = currentPage === item.id;
    return (
      <button
        onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
        className={`sidebar-item w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          active ? 'active text-dola-accent bg-dola-accent/10' : 'text-dola-muted hover:text-dola-text'
        }`}
      >
        <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl glass"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-dola-surface border-r border-dola-border z-40 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="p-6 pb-4 border-b border-dola-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dola-accent to-dola-accent2 flex items-center justify-center">
              <span className="text-lg font-black text-white">D</span>
            </div>
            <div>
              <h1 className="text-base font-bold gradient-text">DOLA AI</h1>
              <p className="text-[10px] text-dola-muted tracking-widest uppercase">Executive Assistant</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <p className="text-[10px] text-dola-muted/60 uppercase tracking-widest font-semibold px-4 pt-2 pb-1">Principal</p>
          {menuItems.map(item => <NavItem key={item.id} item={item} />)}

          {isAdmin && (
            <>
              <div className="my-3 border-t border-dola-border" />
              <p className="text-[10px] text-dola-muted/60 uppercase tracking-widest font-semibold px-4 pt-1 pb-1">Admin</p>
              {adminItems.map(item => <NavItem key={item.id} item={item} />)}
            </>
          )}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-dola-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-dola-accent to-dola-pink flex items-center justify-center text-white text-sm font-bold">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dola-text truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-dola-muted truncate">{currentUser?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
            </div>
            <button onClick={logout} className="p-2 rounded-lg hover:bg-dola-danger/10 text-dola-muted hover:text-dola-danger transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
