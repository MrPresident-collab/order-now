import { useState } from 'react';
import { useNav } from '@/nav';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Mail, Lock } from 'lucide-react';
import { Wordmark } from '@/components/Wordmark';
import { ThemeToggle } from '@/components/ThemeToggle';

type Mode = 'signin' | 'signup' | 'otp';

export function Auth() {
  const { navigate, goBack } = useNav();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const validPassword = password.length >= 6;

  const submitPassword = async () => {
    setError(null);
    setInfo(null);
    if (!validEmail) {
      setError('Introduz um email válido.');
      return;
    }
    if (!validPassword) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        navigate('home');
      } else {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        setInfo('Conta criada. Se a confirmação por email estiver activa, verifica o teu email. Caso contrário, entra com a tua palavra-passe.');
        setMode('signin');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async () => {
    setError(null);
    setInfo(null);
    if (!validEmail) {
      setError('Introduz um email válido para receber o código.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
      if (error) throw error;
      setInfo('Código enviado para o teu email. Introduz o código de 6 dígitos.');
      navigate('otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível enviar o código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col px-6 pt-16 safe-top safe-bottom">
      <div className="flex items-center justify-between mb-6">
        <button onClick={goBack} className="-ml-2 p-2">
          <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
        <ThemeToggle />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="mb-10">
          <div className="mb-4 bg-pedeja-950 inline-block px-4 py-2 rounded-lg">
            <Wordmark className="text-2xl" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {mode === 'signup' ? 'Criar conta Pedejá' : mode === 'otp' ? 'Entrar com código' : 'Entrar na Pedejá'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Autenticação real via Supabase. OTP por SMS está desactivado no backend — usa email.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['signin', 'signup', 'otp'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setInfo(null); }}
                className={`flex-1 py-2 rounded-xl text-sm font-bold ${mode === m ? 'bg-pedeja-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
              >
                {m === 'signin' ? 'Entrar' : m === 'signup' ? 'Registar' : 'Código'}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</label>
            <div className="mt-2 flex items-center gap-3 border-b-2 border-gray-200 dark:border-gray-700 focus-within:border-pedeja-600 transition-colors pb-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@email.ao"
                autoComplete="email"
                className="flex-1 text-base font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none bg-transparent"
              />
            </div>
          </div>
          {mode !== 'otp' && (
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Palavra-passe</label>
              <div className="mt-2 flex items-center gap-3 border-b-2 border-gray-200 dark:border-gray-700 focus-within:border-pedeja-600 transition-colors pb-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="flex-1 text-base font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none bg-transparent"
                />
              </div>
            </div>
          )}
          {error && <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 p-3 text-sm font-medium text-red-700 dark:text-red-300">{error}</div>}
          {info && <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 p-3 text-sm font-medium text-green-700 dark:text-green-300">{info}</div>}
          {mode === 'otp' ? (
            <button
              onClick={requestOtp}
              disabled={!validEmail || loading}
              className="w-full bg-pedeja-600 text-white font-bold text-base py-4 rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-30"
            >
              {loading ? 'A enviar...' : 'Enviar código por email'}
            </button>
          ) : (
            <button
              onClick={submitPassword}
              disabled={!validEmail || !validPassword || loading}
              className="w-full bg-pedeja-600 text-white font-bold text-base py-4 rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-30"
            >
              {loading ? 'A autenticar...' : mode === 'signup' ? 'Criar conta' : 'Entrar'}
            </button>
          )}
          <button onClick={() => navigate('home')} className="w-full text-gray-400 font-medium text-sm py-2">
            Explorar catálogo sem conta
          </button>
        </div>
      </div>
    </div>
  );
}
