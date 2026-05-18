import { useState } from 'react';
import { useStore, Task } from '../store/useStore';
import { CheckSquare, Plus, X, GripVertical, Clock, AlertTriangle, Trash2 } from 'lucide-react';

const STATUSES: { key: Task['status']; label: string; color: string }[] = [
  { key: 'backlog', label: 'Backlog', color: '#8888a0' },
  { key: 'todo', label: 'A Fazer', color: '#3b82f6' },
  { key: 'doing', label: 'Em Andamento', color: '#f59e0b' },
  { key: 'done', label: 'Concluído', color: '#10b981' },
];

const PRIORITIES: { key: Task['priority']; label: string; color: string }[] = [
  { key: 'low', label: 'Baixa', color: '#8888a0' },
  { key: 'medium', label: 'Média', color: '#3b82f6' },
  { key: 'high', label: 'Alta', color: '#f59e0b' },
  { key: 'urgent', label: 'Urgente', color: '#ef4444' },
];

const SECTORS = ['Negócios', 'Marketing', 'Vendas', 'Família', 'Saúde', 'Espiritual', 'Financeiro', 'Estudos', 'Equipe', 'Conteúdo'];

export default function TasksPage() {
  const { tasks, addTask, moveTask, deleteTask, updateTask, currentUser } = useStore();
  const uid = currentUser?.id || '';
  const myTasks = tasks.filter(t => t.userId === uid);

  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [dragOver, setDragOver] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium' as Task['priority'],
    sector: 'Negócios', status: 'todo' as Task['status'], dueDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      userId: uid,
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      sector: form.sector,
      dueDate: form.dueDate || undefined,
      subtasks: [],
      timeSpent: 0,
    });
    setForm({ title: '', description: '', priority: 'medium', sector: 'Negócios', status: 'todo', dueDate: '' });
    setShowForm(false);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    moveTask(taskId, status);
    setDragOver(null);
  };

  const priorityInfo = (p: Task['priority']) => PRIORITIES.find(pr => pr.key === p) || PRIORITIES[1];

  const TaskCard = ({ task }: { task: Task }) => {
    const pri = priorityInfo(task.priority);
    const doneSubtasks = task.subtasks.filter(s => s.done).length;

    return (
      <div
        draggable
        onDragStart={e => handleDragStart(e, task.id)}
        className="p-3.5 rounded-xl bg-dola-bg/60 border border-dola-border/50 card-hover cursor-grab active:cursor-grabbing group"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <GripVertical size={14} className="text-dola-muted/30 group-hover:text-dola-muted/60" />
            <div className="w-2 h-2 rounded-full" style={{ background: pri.color }} />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => moveTask(task.id, task.status === 'done' ? 'todo' : 'done')}
              className={`p-1 rounded-md transition-colors ${task.status === 'done' ? 'text-dola-success' : 'text-dola-muted/40 hover:text-dola-success'}`}
            >
              <CheckSquare size={14} />
            </button>
            <button onClick={() => deleteTask(task.id)} className="p-1 rounded-md text-dola-muted/30 hover:text-dola-danger opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        <p className={`text-sm font-medium mt-2 ${task.status === 'done' ? 'text-dola-muted line-through' : 'text-dola-text'}`}>
          {task.title}
        </p>
        {task.description && <p className="text-xs text-dola-muted/60 mt-1 line-clamp-2">{task.description}</p>}
        <div className="flex items-center flex-wrap gap-1.5 mt-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${pri.color}15`, color: pri.color }}>
            {pri.label}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-dola-border/50 text-dola-muted font-medium">
            {task.sector}
          </span>
          {task.dueDate && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-dola-border/50 text-dola-muted font-medium flex items-center gap-1">
              <Clock size={9} /> {new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </span>
          )}
          {task.subtasks.length > 0 && (
            <span className="text-[10px] text-dola-muted">{doneSubtasks}/{task.subtasks.length}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dola-text flex items-center gap-2">
            <CheckSquare size={24} className="text-dola-accent" />
            Gestor de Tarefas
          </h1>
          <p className="text-sm text-dola-muted mt-1">{myTasks.length} tarefas • {myTasks.filter(t => t.status === 'done').length} concluídas</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass rounded-xl flex overflow-hidden">
            <button onClick={() => setView('kanban')} className={`px-4 py-2 text-xs font-medium ${view === 'kanban' ? 'bg-dola-accent text-white' : 'text-dola-muted'}`}>Kanban</button>
            <button onClick={() => setView('list')} className={`px-4 py-2 text-xs font-medium ${view === 'list' ? 'bg-dola-accent text-white' : 'text-dola-muted'}`}>Lista</button>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={16} /> Nova Tarefa
          </button>
        </div>
      </div>

      {/* Urgent Alert */}
      {myTasks.some(t => t.priority === 'urgent' && t.status !== 'done') && (
        <div className="glass rounded-xl p-3 border border-dola-danger/30 flex items-center gap-3">
          <AlertTriangle size={16} className="text-dola-danger" />
          <span className="text-sm text-dola-danger font-medium">
            {myTasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length} tarefa(s) urgente(s) pendente(s)
          </span>
        </div>
      )}

      {view === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUSES.map(status => {
            const columnTasks = myTasks.filter(t => t.status === status.key);
            return (
              <div
                key={status.key}
                className={`glass rounded-2xl p-4 kanban-column transition-all ${
                  dragOver === status.key ? 'ring-2 ring-dola-accent/40' : ''
                }`}
                onDragOver={e => { e.preventDefault(); setDragOver(status.key); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => handleDrop(e, status.key)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: status.color }} />
                    <h3 className="text-sm font-semibold text-dola-text">{status.label}</h3>
                  </div>
                  <span className="text-xs text-dola-muted bg-dola-border/50 px-2 py-0.5 rounded-full">{columnTasks.length}</span>
                </div>
                <div className="space-y-2.5">
                  {columnTasks.map(task => <TaskCard key={task.id} task={task} />)}
                  {columnTasks.length === 0 && (
                    <div className="text-center py-6 text-dola-muted/40 text-xs">Vazio</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dola-border">
                <th className="text-left text-xs font-medium text-dola-muted p-4">Tarefa</th>
                <th className="text-left text-xs font-medium text-dola-muted p-4 hidden sm:table-cell">Setor</th>
                <th className="text-left text-xs font-medium text-dola-muted p-4 hidden md:table-cell">Prioridade</th>
                <th className="text-left text-xs font-medium text-dola-muted p-4">Status</th>
                <th className="text-right text-xs font-medium text-dola-muted p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {myTasks.map(task => {
                const pri = priorityInfo(task.priority);
                const statusInfo = STATUSES.find(s => s.key === task.status);
                return (
                  <tr key={task.id} className="border-b border-dola-border/30 hover:bg-dola-border/10 transition-colors">
                    <td className="p-4">
                      <p className={`text-sm font-medium ${task.status === 'done' ? 'text-dola-muted line-through' : 'text-dola-text'}`}>{task.title}</p>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className="text-xs text-dola-muted">{task.sector}</span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${pri.color}15`, color: pri.color }}>
                        {pri.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={task.status}
                        onChange={e => updateTask(task.id, { status: e.target.value as Task['status'] })}
                        className="text-xs !p-1.5 !rounded-lg !bg-dola-bg/50 !border-dola-border/50 w-auto"
                        style={{ color: statusInfo?.color }}
                      >
                        {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg hover:bg-dola-danger/10 text-dola-muted hover:text-dola-danger transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-dola-text">Nova Tarefa</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-dola-border/50"><X size={18} className="text-dola-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título da tarefa" required />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição (opcional)" rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Prioridade</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Task['priority'] })}>
                    {PRIORITIES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Setor</label>
                  <select value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })}>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Task['status'] })}>
                    {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dola-muted mb-1">Prazo</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
                Criar Tarefa
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
