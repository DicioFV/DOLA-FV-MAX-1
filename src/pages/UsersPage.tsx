import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Users, Plus, X, Trash2, Shield, User } from 'lucide-react';

export default function UsersPage() {
  const { users, addUser, removeUser, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' as 'admin' | 'user' });

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield size={40} className="mx-auto mb-4 text-dola-danger" />
          <p className="text-dola-text font-semibold">Acesso Restrito</p>
          <p className="text-sm text-dola-muted mt-1">Apenas administradores podem acessar esta área.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.length >= 6) {
      alert('Limite de 6 usuários atingido (1 admin + 5 selecionados)');
      return;
    }
    addUser(form);
    setForm({ name: '', email: '', password: '', role: 'user' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dola-text flex items-center gap-2">
            <Users size={24} className="text-dola-accent" />
            Gerenciar Usuários
          </h1>
          <p className="text-sm text-dola-muted mt-1">{users.length}/6 vagas utilizadas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={users.length >= 6}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          <Plus size={16} /> Adicionar Usuário
        </button>
      </div>

      {/* Info */}
      <div className="glass rounded-xl p-4 border border-dola-accent/20">
        <p className="text-sm text-dola-text">
          <Shield size={14} className="inline mr-2 text-dola-accent" />
          Apenas você (admin) pode adicionar, editar ou remover usuários. Cada usuário tem seus dados privados e separados.
        </p>
      </div>

      {/* Users list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user.id} className={`glass rounded-2xl p-5 card-hover ${user.id === currentUser.id ? 'border border-dola-accent/30' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-dola-accent to-dola-pink flex items-center justify-center text-white text-lg font-bold">
                {user.name.charAt(0)}
              </div>
              {user.id !== currentUser.id && (
                <button
                  onClick={() => { if (confirm(`Remover ${user.name}?`)) removeUser(user.id); }}
                  className="p-1.5 rounded-lg text-dola-muted hover:text-dola-danger hover:bg-dola-danger/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <h3 className="text-sm font-semibold text-dola-text mt-3">{user.name}</h3>
            <p className="text-xs text-dola-muted mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 ${
                user.role === 'admin' ? 'bg-dola-accent/15 text-dola-accent' : 'bg-dola-border/50 text-dola-muted'
              }`}>
                {user.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                {user.role === 'admin' ? 'Admin' : 'Usuário'}
              </span>
              {user.id === currentUser.id && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-dola-success/15 text-dola-success font-medium">Você</span>
              )}
            </div>
            <p className="text-[10px] text-dola-muted/50 mt-3">
              Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-dola-text">Adicionar Usuário</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-dola-border/50"><X size={18} className="text-dola-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" required />
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="E-mail" required />
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Senha" required />
              <div>
                <label className="block text-xs text-dola-muted mb-1">Função</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as 'admin' | 'user' })}>
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <p className="text-xs text-dola-muted">
                ⚠️ Cada login terá dados privados separados. Máximo 6 usuários.
              </p>
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white font-semibold text-sm hover:opacity-90">
                Adicionar Usuário
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
