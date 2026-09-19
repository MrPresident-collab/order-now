import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { listActiveBusinesses, type CatalogBusiness } from '@/repositories/catalog';
import { ChevronLeft, Search } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingView, ErrorView, EmptyView, BackendBlockedView } from '@/components/StateViews';

function CategoryBusinesses({ category, emptyTitle, searchPlaceholder }: { category: 'compras' | 'lojas'; emptyTitle: string; searchPlaceholder: string }) {
  const { goBack, navigate, setSelectedRestaurantId } = useNav();
  const [query, setQuery] = useState('');
  const [businesses, setBusinesses] = useState<CatalogBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    listActiveBusinesses(category).then(setBusinesses).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const filtered = businesses.filter(
    (b) => query === '' || b.name.toLowerCase().includes(query.toLowerCase()) || (b.description ?? '').toLowerCase().includes(query.toLowerCase()),
  );
  const blocked = error?.includes('permission denied') || error?.includes('42501');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-3 safe-top sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="-ml-1 p-1 active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white capitalize">{category}</h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-pedeja-600/30"
          />
        </div>
      </div>
      <div className="px-5 pt-4 space-y-3">
        {loading && <LoadingView message="A carregar negócios..." />}
        {error && blocked && <BackendBlockedView message="Catálogo bloqueado por RLS. Entra na conta ou pede ao backend leitura autenticada de businesses." />}
        {error && !blocked && <ErrorView message={`Não foi possível carregar. ${error}`} onRetry={load} />}
        {!loading && !error && filtered.map((b) => (
          <button
            key={b.id}
            onClick={() => { setSelectedRestaurantId(b.id); navigate('restaurant'); }}
            className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform"
          >
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{b.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{b.description || `Negócio de ${category}`}</p>
          </button>
        ))}
        {!loading && !error && filtered.length === 0 && <EmptyView title={emptyTitle} hint="Ainda não há negócios publicados nesta categoria." />}
      </div>
      <BottomNav current="comida" />
    </div>
  );
}

export function Compras() {
  return <CategoryBusinesses category="compras" emptyTitle="Sem lojas de compras" searchPlaceholder="O que procuras?" />;
}

