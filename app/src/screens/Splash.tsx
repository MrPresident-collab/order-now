import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { Wordmark } from '@/components/Wordmark';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Splash() {
  const { navigate } = useNav();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-pedeja-950 flex flex-col items-center justify-between py-16 safe-top safe-bottom relative">
      <div className="absolute top-12 right-5"><ThemeToggle /></div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <h1 className="text-5xl"><Wordmark /></h1>
        <p className="text-gray-400 text-sm font-medium">A promessa que se move</p>
      </div>
      <button
        onClick={() => navigate('welcome')}
        disabled={!ready}
        className="text-gray-300 text-sm font-semibold tracking-wide flex items-center gap-2 px-8 py-3 rounded-full hover:bg-white/10 transition-colors disabled:opacity-60 disabled:cursor-wait"
      >
        {ready ? 'Próximo' : 'A carregar...'}
        <span className="text-lg">→</span>
      </button>
    </div>
  );
}
