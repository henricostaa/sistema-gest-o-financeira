import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { getSupabaseClient } from '../supabase/client';
import {
  Mail,
  Lock,
  User,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon,
  Loader2,
} from 'lucide-react';

interface AuthViewProps {
  onContinueAsGuest?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onContinueAsGuest }) => {
  const { setUser, settings, updateSettings } = useFinance();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  // OAuth Handler (Google / GitHub)
  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!supabase) {
      setErrorMessage('O Supabase não está configurado.');
      return;
    }

    setOauthLoading(provider);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error(`Erro ao autenticar com ${provider}:`, err);
      let msg = err.message || `Falha ao iniciar autenticação via ${provider}.`;
      if (msg.includes('provider is not enabled')) {
        msg = `O provedor ${provider.toUpperCase()} não está ativado no seu painel do Supabase.`;
      }
      setErrorMessage(msg);
      setOauthLoading(null);
    }
  };

  // Login Email/Senha
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!supabase) {
      setErrorMessage('Supabase não conectado.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;

      if (data.user) {
        // Obter perfil de public.profiles se existir
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        const userName =
          profile?.name ||
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          email.split('@')[0];

        setUser({
          id: data.user.id,
          name: userName,
          email: data.user.email || email,
          avatarUrl: profile?.avatar_url || data.user.user_metadata?.avatar_url,
        });

        setSuccessMessage('Login efetuado com sucesso!');
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      let msg = err.message || 'Ocorreu um erro ao fazer login.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'E-mail ou senha incorretos.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Cadastro Email/Senha
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!supabase) {
      setErrorMessage('Supabase não conectado.');
      return;
    }

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Preencha todos os campos obrigatórios.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            name: name.trim(),
            full_name: name.trim(),
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        setUser({
          id: data.user.id,
          name: name.trim(),
          email: data.user.email || email,
        });

        setSuccessMessage('Conta criada com sucesso! Redirecionando...');
      }
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      let msg = err.message || 'Erro ao criar conta.';
      if (msg.includes('User already registered')) {
        msg = 'Este e-mail já possui cadastro. Faça login na sua conta.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestEntry = () => {
    setUser({
      id: 'usr-guest',
      name: 'Visitante',
      email: 'visitante@financeiro.com',
    });
    if (onContinueAsGuest) {
      onContinueAsGuest();
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Ambient Glow Background */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 translate-y-1/2 w-[30rem] h-[30rem] bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Navigation */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl w-full mx-auto">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-emerald-600 dark:from-white dark:via-slate-200 dark:to-emerald-400 bg-clip-text text-transparent">
              Plurix Finance
            </span>
            <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Sistema de Gestão
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Alternar tema"
          >
            {settings.theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left Column: Presentation & Value Props */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-950/50 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-md">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span>Controle Financeiro de Alto Nível</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              Assuma a gestão das suas economias com{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                clareza & segurança
              </span>
              .
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-lg">
              Acompanhe lançamentos, planeje orçamentos mensais, monitore suas dívidas e atinja suas metas com sincronização completa na nuvem.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start space-x-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-md">
                <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Dashboard em Tempo Real</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Visão geral do seu fluxo de caixa e relatórios visuais.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-md">
                <div className="rounded-xl bg-teal-500/10 p-2 text-teal-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Segurança & Nuvem</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Autenticação segura com Google, GitHub e criptografia.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Auth Card Form */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
              {/* Card Header & Tabs */}
              <div className="mb-6">
                <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setErrorMessage(null);
                    }}
                    className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      tab === 'login'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Entrar na Conta
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('signup');
                      setErrorMessage(null);
                    }}
                    className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      tab === 'signup'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Criar Nova Conta
                  </button>
                </div>
              </div>

              {/* Status Alert Banners */}
              {errorMessage && (
                <div className="mb-5 flex items-start space-x-3 rounded-2xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                  <div className="flex-1">{errorMessage}</div>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 flex items-start space-x-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-3.5 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <div className="flex-1">{successMessage}</div>
                </div>
              )}

              {/* OAuth Buttons */}
              <div className="space-y-3 mb-4">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={oauthLoading !== null || loading}
                  className="w-full flex items-center justify-center space-x-3 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-white hover:bg-slate-700/80 hover:border-slate-600 active:scale-98 transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {oauthLoading === 'google' ? (
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Continuar com Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthLogin('github')}
                  disabled={oauthLoading !== null || loading}
                  className="w-full flex items-center justify-center space-x-3 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-white hover:bg-slate-700/80 hover:border-slate-600 active:scale-98 transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {oauthLoading === 'github' ? (
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                  ) : (
                    <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  )}
                  <span>Continuar com GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="w-full border-t border-slate-800" />
                <span className="absolute bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  ou e-mail
                </span>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={tab === 'login' ? handleLogin : handleSignUp} className="space-y-4">
                {tab === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                        required
                        className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:bg-slate-900 focus:outline-none transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Endereço de E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      required
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:bg-slate-900 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:bg-slate-900 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {tab === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Confirmar Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:bg-slate-900 focus:outline-none transition"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || oauthLoading !== null}
                  className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-400 active:scale-98 transition disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>{tab === 'login' ? 'Acessar Conta' : 'Criar minha Conta'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Guest / Demo Option */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
                <button
                  type="button"
                  onClick={handleGuestEntry}
                  className="text-xs font-medium text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                >
                  Continuar como Visitante (Modo Demonstração) &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>



      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500">
        Plurix Finance &copy; {new Date().getFullYear()} &bull; Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default AuthView;
