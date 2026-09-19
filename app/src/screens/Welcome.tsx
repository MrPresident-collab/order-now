import { useNav } from '@/nav';
import { useAuth } from '@/auth';
import { Wordmark } from '@/components/Wordmark';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Welcome() {
  const { navigate } = useNav();
  const { session } = useAuth();
  return (
    <div className="min-h-screen bg-pedeja-950 flex flex-col items-center justify-between py-16 px-6 safe-top safe-bottom relative">
      <div className="absolute top-12 right-5">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <h1 className="text-4xl">
          <Wordmark />
        </h1>
        <div className="text-center space-y-4">
          <h2 className="text-white text-2xl font-extrabold tracking-tight">Bem-vindo à Pedejá</h2>
          <p className="text-gray-400 text-base font-medium leading-relaxed">
            Entrega o que precisas,<br />onde precisares.
          </p>
        </div>
      </div>

      {/* Role selection */}
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center space-y-2">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Experiência cliente</p>
          <p className="text-gray-400 text-sm">Compra, envia e acompanha tudo num só lugar.</p>
        </div>

        <button
          onClick={() => navigate(session ? 'home' : 'auth')}
          className="w-full bg-white text-pedeja-700 font-bold text-base py-4 rounded-2xl active:scale-[0.98] transition-transform shadow-lg"
        >
          Entrar
        </button>
        <button
          onClick={() => navigate(session ? 'home' : 'auth')}
          className="w-full bg-white/10 backdrop-blur-sm text-white font-bold text-base py-4 rounded-2xl border border-white/20 active:scale-[0.98] transition-transform"
        >
          Criar conta
        </button>
        <button
          onClick={() => navigate('home')}
          className="w-full text-gray-400 font-medium text-sm py-3 hover:text-white transition-colors"
        >
          Explorar catálogo sem conta
        </button>
      </div>
    </div>
  );
}
