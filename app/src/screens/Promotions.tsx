import { useNav } from '@/nav';
import { useAuth } from '@/auth';
import { ChevronLeft, Tag, Plus } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Promotions() {
  const { goBack } = useNav();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 safe-top sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="-ml-1 p-1 active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Promoções</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Promo codes */}
      <div className="px-5 pt-5">
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 px-1">Códigos</h2>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm text-center">
          <Tag className="w-8 h-8 text-pedeja-600 mx-auto mb-2" />
          <p className="text-sm font-bold">Sem promoções verificadas</p>
          <p className="text-xs text-gray-500 mt-1">
            {user ? 'O backend não expõe promoções para clientes nesta versão. Não mostramos códigos inventados.' : 'Entra na conta para veres ofertas associadas ao teu perfil.'}
          </p>
        </div>
        <button className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform mt-3">
          <Plus className="w-5 h-5 text-pedeja-600" />
          <span className="font-semibold text-pedeja-600 text-sm">Adicionar código promocional</span>
        </button>
      </div>
    </div>
  );
}
