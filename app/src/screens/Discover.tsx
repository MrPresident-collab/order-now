import { useEffect, useMemo, useState } from 'react';
import { useNav } from '@/nav';
import { listActiveBusinesses, type CatalogBusiness } from '@/repositories/catalog';
import { BottomNav } from '@/components/BottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingView, ErrorView, EmptyView, BackendBlockedView } from '@/components/StateViews';
import { Search, UtensilsCrossed, ShoppingBag, Store } from 'lucide-react';

const shortcuts = [
  { id: 'comida' as const, label: 'Comida', icon: UtensilsCrossed, description: 'Restaurantes e comida local' },
  { id: 'compras' as const, label: 'Compras', icon: ShoppingBag, description: 'Compras do dia a dia' },
  { id: 'lojas' as const, label: 'Lojas', icon: Store, description: 'Supermercados e grandes lojas' },
];

export function Discover() {
  const { navigate, setSelectedRestaurantId } = useNav();
  const [query, setQuery] = useState('');
  const [businesses, setBusinesses] = useState<CatalogBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    listActiveBusinesses()
      .then(setBusinesses)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return businesses;
    return businesses.filter((business) => {
      const haystack = (business.name + ' ' + (business.description ?? '')).toLowerCase();
      return haystack.includes(q);
    });
  }, [businesses, query]);

  const blocked = error?.includes('permission denied') || error?.includes('42501');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <header className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 safe-top sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Descobrir</h1>
          <ThemeToggle />
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Procurar negócio"
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-pedeja-600/30"
          />
        </div>
      </header>

      <main className="px-5 pt-5 space-y-7">
        <section>
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white mb-3">Explorar por categoria</h2>
          <div className="space-y-2">
            {shortcuts.map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => navigate(id)}
                className="w-full flex items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl text-left shadow-sm active:scale-[0.98] transition-transform"
              >
                <span className="w-11 h-11 rounded-xl bg-pedeja-600/10 text-pedeja-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-gray-900 dark:text-white">{label}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white mb-1">
            {query.trim() ? 'Resultados' : 'Negócios disponíveis'}
          </h2>
          {!loading && !error && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {filtered.length} {filtered.length === 1 ? 'negócio' : 'negócios'}
            </p>
          )}

          {loading && <LoadingView message="A carregar negócios..." />}
          {error && blocked && (
            <BackendBlockedView message="O catálogo não está disponível para esta sessão. Verifica o acesso autenticado e as políticas RLS." />
          )}
          {error && !blocked && (
            <ErrorView message={'Não foi possível carregar os negócios. ' + error} onRetry={load} />
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.map((business) => (
                <button
                  key={business.id}
                  onClick={() => {
                    setSelectedRestaurantId(business.id);
                    navigate('restaurant');
                  }}
                  className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">{business.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {business.description || 'Negócio parceiro Pedejá'}
                      </p>
                    </div>
                    {business.marketplace_category && (
                      <span className="shrink-0 text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
                        {business.marketplace_category}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <EmptyView
              title={query.trim() ? 'Nenhum negócio encontrado' : 'Nenhum negócio disponível'}
              hint={query.trim() ? 'Tenta procurar por outro nome.' : 'Ainda não há negócios publicados.'}
            />
          )}
        </section>
      </main>

      <BottomNav current="discover" />
    </div>
  );
}
