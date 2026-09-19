import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { useAuth } from '@/auth';
import { Wordmark } from '@/components/Wordmark';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Splash() {
  const { navigate } = useNav();
  const { session, authLoading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready || authLoading) return;
    const t = setTimeout(() => navigate(session ? 'home' : 'welcome'), 400);
    return () => clearTimeout(t);
  }, [ready, authLoading, session, navigate]);
  return (
    <div className="min-h-screen bg-pedeja-950 flex flex-col items-center justify-between py-16 safe-top safe-bottom relative">
      <div className="absolute top-12 right-5">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <h1 className="text-5xl">
          <Wordmark />
        </h1>
        <p className="text-gray-400 text-sm font-medium">A promessa que se move</p>
      </div>
      <button
        onClick={() => navigate(session ? 'home' : 'welcome')}
        className="text-gray-300 text-sm font-semibold tracking-wide flex items-center gap-2 px-8 py-3 rounded-full hover:bg-white/10 transition-colors"
      >
        {authLoading || !ready ? 'A carregar...' : session ? 'Continuar' : 'Próximo'}
        <span className="text-lg">→</span>
      </button>
    </div>
  );
}
