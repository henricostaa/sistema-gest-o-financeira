import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { getSupabaseClient } from '../../supabase/client';
import { X, Mail, Lock, User, LogOut, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
  onReturnToLogin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings: _onOpenSettings,
  onReturnToLogin,
}) => {
  const { user, setUser } = useFinance();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Status State
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!supabase) {
      setErrorMessage('O serviço Supabase não está disponível.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Tenta obter os dados do perfil na tabela 'public.profiles'
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        const userName = profile?.name || data.user.user_metadata?.name || email.split('@')[0];

        setUser({
          id: data.user.id,
          name: userName,
          email: data.user.email || email,
          avatarUrl: profile?.avatar_url,
        });

        setSuccessMessage('Login realizado com sucesso!');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error('Erro de Login:', err);
      let msg = err.message || 'Erro ao realizar login.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'E-mail ou senha incorretos.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!supabase) {
      setErrorMessage('O serviço Supabase não está disponível.');
      return;
    }

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Todos os campos são obrigatórios para o cadastro.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
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
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          name: name.trim(),
          email: data.user.email || email,
        });

        setSuccessMessage('Conta criada com sucesso! Perfil sincronizado.');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Erro no Cadastro:', err);
      let msg = err.message || 'Erro ao criar conta.';
      if (msg.includes('User already registered')) {
        msg = 'Este e-mail já está cadastrado. Faça login na sua conta.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!supabase) {
      setErrorMessage('O serviço Supabase não está disponível.');
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
      console.error(`Erro OAuth ${provider}:`, err);
      let msg = err.message || `Erro ao autenticar com ${provider}.`;
      setErrorMessage(msg);
      setOauthLoading(null);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setLoading(false);
    onClose();
    if (onReturnToLogin) {
      onReturnToLogin();
    }
  };

  const isUserAuthenticated = user && user.id !== 'usr-default' && user.id !== 'usr-guest';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* If user is ALREADY logged in */}
        {isUserAuthenticated ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-3xl font-bold text-white shadow-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name || 'Usuário'}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user?.email || ''}</p>

            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Status da Conta</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Ativa
              </span>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex flex-1 items-center justify-center space-x-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50 cursor-pointer transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        ) : (
          /* FORM LOGIN / CADASTRO */
          <div>
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {tab === 'login' ? 'Acessar sua Conta' : 'Criar Perfil de Usuário'}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {tab === 'login'
                  ? 'Entre com OAuth ou suas credenciais'
                  : 'Cadastre seu perfil no banco de dados'}
              </p>
            </div>

            {!supabase && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-semibold">Supabase não conectado</p>
                    <p className="mt-0.5 text-slate-600 dark:text-amber-200/80">
                      O serviço de autenticação remota não está disponível no momento.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* OAUTH BUTTONS */}
            <div className="mb-4 space-y-2">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={oauthLoading !== null || loading}
                className="w-full flex items-center justify-center space-x-2.5 rounded-xl border border-slate-200 bg-white py-2 px-4 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 cursor-pointer transition"
              >
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
                <span>Continuar com Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('github')}
                disabled={oauthLoading !== null || loading}
                className="w-full flex items-center justify-center space-x-2.5 rounded-xl border border-slate-200 bg-white py-2 px-4 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 cursor-pointer transition"
              >
                <svg className="h-4 w-4 fill-current text-slate-900 dark:text-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>Continuar com GitHub</span>
              </button>
            </div>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative bg-white px-2 text-[10px] font-semibold text-slate-400 dark:bg-slate-900 uppercase">
                ou e-mail
              </span>
            </div>

            {/* TAB SELECTOR */}
            <div className="mb-5 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold cursor-pointer transition ${
                  tab === 'login'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold cursor-pointer transition ${
                  tab === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Criar Conta
              </button>
            </div>

            {/* Feedback messages */}
            {errorMessage && (
              <div className="mb-4 flex items-center space-x-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 flex items-center space-x-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={tab === 'login' ? handleLogin : handleSignUp} className="space-y-4">
              {tab === 'signup' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white dark:focus:border-emerald-400 dark:focus:bg-slate-900"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white dark:focus:border-emerald-400 dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white dark:focus:border-emerald-400 dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-500 active:scale-98 disabled:opacity-50 cursor-pointer transition"
              >
                {loading ? 'Processando...' : tab === 'login' ? 'Entrar' : 'Cadastrar Perfil'}
              </button>
            </form>

            {onReturnToLogin && (
              <div className="mt-4 pt-3 border-t border-slate-100 text-center dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReturnToLogin();
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  Sair do modo visitante e ir para a Tela Inicial &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
