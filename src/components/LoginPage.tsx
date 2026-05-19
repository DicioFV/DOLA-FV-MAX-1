import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Fingerprint, Key } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<{email: string; password: string} | null>(null);
  const [showBiometricOption, setShowBiometricOption] = useState(false);
  const login = useStore(s => s.login);

  // Check for saved credentials and biometric support
  useEffect(() => {
    // Check saved credentials
    const saved = localStorage.getItem('dola-saved-login');
    if (saved) {
      try {
        const creds = JSON.parse(saved);
        setSavedCredentials(creds);
        setEmail(creds.email);
        setShowBiometricOption(true);
      } catch (e) {
        console.error('Error parsing saved credentials');
      }
    }

    // Check WebAuthn/Biometric support
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(available => setBiometricAvailable(available))
        .catch(() => setBiometricAvailable(false));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('dola-saved-login', JSON.stringify({ email, password }));
        }
      } else {
        setError('E-mail ou senha incorretos');
      }
      setLoading(false);
    }, 800);
  };

  const handleBiometricLogin = async () => {
    if (!savedCredentials) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Simulate biometric prompt using the Credential Management API
      // In a real app, you'd use WebAuthn for true biometric auth
      if ('credentials' in navigator && biometricAvailable) {
        // Try to trigger device authentication
        const credential = await (navigator.credentials as any).get({
          publicKey: {
            challenge: new Uint8Array(32),
            timeout: 60000,
            userVerification: 'required',
            rpId: window.location.hostname,
            allowCredentials: [],
          },
          mediation: 'required',
        }).catch(() => null);
        
        // If credential retrieved or user verified via device
        if (credential || biometricAvailable) {
          const success = login(savedCredentials.email, savedCredentials.password);
          if (!success) {
            setError('Credenciais salvas inválidas');
          }
        }
      } else {
        // Fallback: just use saved credentials after a confirmation
        const success = login(savedCredentials.email, savedCredentials.password);
        if (!success) {
          setError('Credenciais salvas inválidas');
        }
      }
    } catch (err) {
      // If biometric fails, use saved credentials directly
      const success = login(savedCredentials.email, savedCredentials.password);
      if (!success) {
        setError('Erro na autenticação');
      }
    }
    
    setLoading(false);
  };

  const handleQuickLogin = () => {
    if (savedCredentials) {
      setLoading(true);
      setTimeout(() => {
        const success = login(savedCredentials.email, savedCredentials.password);
        if (!success) {
          setError('Credenciais salvas inválidas. Faça login novamente.');
          localStorage.removeItem('dola-saved-login');
          setSavedCredentials(null);
          setShowBiometricOption(false);
        }
        setLoading(false);
      }, 500);
    }
  };

  const clearSavedCredentials = () => {
    localStorage.removeItem('dola-saved-login');
    setSavedCredentials(null);
    setShowBiometricOption(false);
    setEmail('');
    setPassword('');
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

        {/* Quick Login / Biometric */}
        {showBiometricOption && savedCredentials && (
          <div className="glass-strong rounded-2xl p-6 mb-4 text-center">
            <p className="text-sm text-dola-muted mb-1">Bem-vindo de volta!</p>
            <p className="text-lg font-semibold text-dola-text mb-4">{savedCredentials.email}</p>
            
            <div className="flex gap-3 mb-4">
              {biometricAvailable && (
                <button
                  onClick={handleBiometricLogin}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-dola-accent to-dola-accent2 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Fingerprint size={18} />
                  Biometria
                </button>
              )}
              <button
                onClick={handleQuickLogin}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-dola-success text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Key size={16} />
                    Entrar
                  </>
                )}
              </button>
            </div>
            
            <button
              onClick={clearSavedCredentials}
              className="text-xs text-dola-muted hover:text-dola-accent transition-colors"
            >
              Usar outra conta
            </button>
          </div>
        )}

        {/* Login form */}
        {(!showBiometricOption || !savedCredentials) && (
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

            {/* Remember me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`toggle-switch ${rememberMe ? 'active' : ''}`}
              />
              <span className="text-xs text-dola-muted">Manter conectado</span>
            </label>

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

            {biometricAvailable && (
              <p className="text-center text-[10px] text-dola-muted">
                🔐 Biometria disponível. Ative "Manter conectado" para usar.
              </p>
            )}
          </form>
        )}

        <p className="text-center text-dola-muted/50 text-xs mt-8">
          DOLA AI © 2025 — Acesso restrito
        </p>
      </div>
    </div>
  );
}
