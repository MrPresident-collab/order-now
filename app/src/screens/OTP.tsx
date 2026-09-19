import { useState, useRef, useEffect } from 'react';
import { useNav } from '@/nav';
import { supabase } from '@/lib/supabase';
import { ChevronLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function OTP() {
  const { navigate, goBack } = useNav();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const verify = async (fullCode: string) => {
    if (fullCode.length !== 6 || !email.includes('@')) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: fullCode, type: 'email' });
      if (error) throw error;
      navigate('home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email.includes('@')) {
      setError('Introduz primeiro o email que recebeu o código.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
      if (error) throw error;
      setInfo('Novo código enviado.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível reenviar.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    const full = next.join('');
    if (full.length === 6) void verify(full);
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
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Verificar email</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Introduz o email e o código de 6 dígitos enviado pela Pedejá.
          </p>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nome@email.ao"
          className="mb-6 w-full rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-transparent px-4 py-3 text-base outline-none focus:border-pedeja-600"
        />
        <div className="flex gap-2 justify-center mb-8">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              type="tel"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus();
              }}
              className={`w-12 h-16 text-center text-2xl font-bold border-2 rounded-2xl outline-none transition-colors text-gray-900 dark:text-white bg-transparent ${
                digit ? 'border-pedeja-600' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
          ))}
        </div>
        {error && <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 p-3 text-center text-sm font-medium text-red-700 dark:text-red-300">{error}</div>}
        {info && <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 p-3 text-center text-sm font-medium text-green-700 dark:text-green-300">{info}</div>}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Não recebeste o código?{' '}
          <button onClick={resend} disabled={loading} className="text-pedeja-600 font-semibold disabled:opacity-40">
            {loading ? 'Aguarda...' : 'Reenviar'}
          </button>
        </p>
      </div>
    </div>
  );
}
