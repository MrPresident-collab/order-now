import { useNav } from '@/nav';
import { ChevronLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Wallet() {
  const { goBack } = useNav();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 safe-top sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="-ml-1 p-1 active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Carteira</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Balance card */}
      <div className="px-5 pt-5">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-sm font-bold text-gray-900 dark:text-white">Carteira ainda não ligada</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            O backend não expõe saldo nem métodos de pagamento para clientes nesta versão. Não mostramos valores inventados.
          </p>
        </div>
      </div>
    </div>
  );
}
