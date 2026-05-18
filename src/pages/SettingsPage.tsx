import { useStore } from '../store/useStore';
import {
  Settings, Shield, Bell, Palette, Database, Globe, Smartphone,
  Key, Webhook, Calendar, MessageSquare, Brain, Cloud, ChevronRight
} from 'lucide-react';

export default function SettingsPage() {
  const { currentUser } = useStore();

  const sections = [
    {
      title: 'Conta & Segurança',
      icon: Shield,
      items: [
        { label: 'Perfil', desc: 'Nome, e-mail, avatar', icon: Settings, status: 'Ativo' },
        { label: 'Autenticação', desc: 'Senha, 2FA (futuro)', icon: Key, status: 'Básico' },
        { label: 'Sessões Ativas', desc: 'Gerenciar dispositivos', icon: Smartphone, status: '1 sessão' },
        { label: 'Logs de Atividade', desc: 'Histórico de ações', icon: Database, status: 'Ativo' },
      ],
    },
    {
      title: 'Integrações',
      icon: Webhook,
      items: [
        { label: 'Google Calendar', desc: 'Sincronizar agenda', icon: Calendar, status: '🔜 Em breve' },
        { label: 'WhatsApp API', desc: 'Secretária no WhatsApp', icon: MessageSquare, status: '🔜 Em breve' },
        { label: 'OpenAI / ChatGPT', desc: 'IA avançada', icon: Brain, status: '🔜 Em breve' },
        { label: 'Outlook', desc: 'Sincronizar e-mail', icon: Globe, status: '🔜 Em breve' },
      ],
    },
    {
      title: 'Aparência',
      icon: Palette,
      items: [
        { label: 'Tema', desc: 'Dark mode premium', icon: Palette, status: '🌙 Dark' },
        { label: 'Idioma', desc: 'Português (BR)', icon: Globe, status: 'PT-BR' },
        { label: 'Notificações Push', desc: 'Alertas no dispositivo', icon: Bell, status: '🔜 PWA' },
      ],
    },
    {
      title: 'Sistema',
      icon: Cloud,
      items: [
        { label: 'Dados', desc: 'Armazenamento local (LocalStorage)', icon: Database, status: 'Ativo' },
        { label: 'PWA', desc: 'Instalar como aplicativo', icon: Smartphone, status: 'Disponível' },
        { label: 'Versão', desc: 'DOLA AI v1.0.0', icon: Settings, status: 'Atual' },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dola-text flex items-center gap-2">
          <Settings size={24} className="text-dola-accent" />
          Configurações
        </h1>
        <p className="text-sm text-dola-muted mt-1">Gerencie sua conta e preferências</p>
      </div>

      {/* Profile card */}
      <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dola-accent to-dola-pink flex items-center justify-center text-white text-2xl font-bold">
          {currentUser?.name?.charAt(0)}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-lg font-bold text-dola-text">{currentUser?.name}</h2>
          <p className="text-sm text-dola-muted">{currentUser?.email}</p>
          <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-dola-accent/15 text-dola-accent font-semibold flex items-center gap-1">
              <Shield size={10} /> {currentUser?.role === 'admin' ? 'Administrador' : 'Usuário'}
            </span>
          </div>
        </div>
      </div>

      {/* Settings sections */}
      {sections.map(section => {
        const SectionIcon = section.icon;
        return (
          <div key={section.title} className="glass rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-dola-border flex items-center gap-2">
              <SectionIcon size={16} className="text-dola-accent" />
              <h3 className="text-sm font-semibold text-dola-text">{section.title}</h3>
            </div>
            <div>
              {section.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`flex items-center justify-between p-4 hover:bg-dola-border/10 transition-colors cursor-pointer ${i < section.items.length - 1 ? 'border-b border-dola-border/30' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-dola-border/30 flex items-center justify-center">
                        <Icon size={16} className="text-dola-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-dola-text">{item.label}</p>
                        <p className="text-xs text-dola-muted">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-dola-muted">{item.status}</span>
                      <ChevronRight size={14} className="text-dola-muted/40" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Roadmap */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-dola-text mb-4 flex items-center gap-2">
          <Brain size={16} className="text-dola-accent2" />
          Roadmap — Próximas Versões
        </h3>
        <div className="space-y-3">
          {[
            { version: 'v1.1', items: ['Integração Google Calendar', 'Push Notifications', 'Modo offline completo'], status: 'Em desenvolvimento' },
            { version: 'v1.2', items: ['WhatsApp Bot com IA', 'Comandos de voz (Whisper)', 'Integração OpenAI'], status: 'Planejado' },
            { version: 'v2.0', items: ['Backend PHP/MySQL', 'App nativo (React Native)', 'Sistema SaaS multi-tenant'], status: 'Futuro' },
            { version: 'v3.0', items: ['CRM Executivo completo', 'Integração Outlook', 'Marketplace de plugins'], status: 'Visão' },
          ].map(release => (
            <div key={release.version} className="p-4 rounded-xl bg-dola-bg/50 border border-dola-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold gradient-text">{release.version}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-dola-accent/10 text-dola-accent font-medium">{release.status}</span>
              </div>
              <ul className="space-y-1">
                {release.items.map(item => (
                  <li key={item} className="text-xs text-dola-muted flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-dola-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
