import { useState } from 'react';
import { useStore } from '../store/useStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useStore(s => s.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const success = login(email, password);
      if (!success) setError('E-mail ou senha incorretos');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dola-bg relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-dola-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-dola-accent2/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-dola-pink/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-dola-accent to-dola-accent2 mb-6 animate-pulse-glow">
            <span className="text-3xl font-black text-white">D</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">DOLA AI</h1>
          <p className="text-dola-muted text-sm tracking-wider uppercase">Executive Assistant</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-xs font-medium text-dola-muted mb-2 uppercase tracking-wider">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-dola-muted mb-2 uppercase tracking-wider">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full"
            />
          </div>

          {error && (
            <div className="text-dola-danger text-sm text-center bg-dola-danger/10 rounded-lg py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white font-semibold text-sm tracking-wide hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <p className="text-center text-dola-muted/50 text-xs mt-8">
          DOLA AI © 2025 — Acesso restrito
        </p>
      </div>
    </div>
  );
}
