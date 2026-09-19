import { useEffect, useMemo, useState } from 'react';
import { useNav } from '@/nav';
import { listActiveBusinesses, type CatalogBusiness } from '@/repositories/catalog';
import { BottomNav } from '@/components/BottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingView, ErrorView, EmptyView, BackendBlockedView } from '@/components/StateViews';
import { Search, UtensilsCrossed, ShoppingBag, Store, X } from 'lucide-react';

const shortcuts = [
  { id: 'comida' as const, label: 'Comida', icon: UtensilsCrossed },
  { id: 'compras' as const, label: 'Compras', icon: ShoppingBag },
  { id: 'lojas' as const, label: 'Lojas', icon: Store },
];

const categoryLabel = (value: string | null) => value === 'comida' ? 'Comida' : value === 'compras' ? 'Compras' : value === 'lojas' ? 'Lojas' : 'Pedejá';

export function Discover() {
  const { navigate, setSelectedRestaurantId } = useNav();
  const [query, setQuery] = useState('');
  const [businesses, setBusinesses] = useState<CatalogBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    listActiveBusinesses().then(setBusinesses).catch((err: Error) => setError(err.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? businesses.filter((business) => (business.name + ' ' + (business.description ?? '')).toLowerCase().includes(q)) : businesses;
  }, [businesses, query]);

  const blocked = error?.includes('permission denied') || error?.includes('42501');

  return (
    <div className="min-h-screen bg-[#F8F7FA] dark:bg-[#0B0B0D] pb-24">
      <header className="bg-[#F8F7FA]/95 dark:bg-[#0B0B0D]/95 backdrop-blur-md px-5 pt-10 pb-4 safe-top sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <div><p className="text-xs font-bold tracking-[0.16em] uppercase text-[#8A2BE2]">Pedejá</p><h1 className="text-2xl font-extrabold text-gray-950 dark:text-white mt-0.5">Descobrir</h1></div>
          <ThemeToggle />
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="O que procuras?" className="w-full bg-white dark:bg-[#1A1A1A] border border-black/[0.04] dark:border-white/[0.05] rounded-2xl pl-11 pr-11 py-3.5 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#8A2BE2]/30" />
          {query && <button onClick={() => setQuery('')} aria-label="Limpar pesquisa" className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><X className="w-4 h-4 text-gray-500" /></button>}
        </div>
      </header>

      <main className="px-5 pt-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
          {shortcuts.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => navigate(id)} className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-[#1A1A1A] border border-black/[0.04] dark:border-white/[0.05] text-sm font-bold text-gray-700 dark:text-gray-200 active:scale-95 transition-transform"><Icon className="w-4 h-4 text-[#8A2BE2]" />{label}</button>)}
        </div>

        <section className="mt-6">
          <div className="mb-3"><h2 className="text-base font-extrabold text-gray-950 dark:text-white">{query.trim() ? 'Resultados' : 'Explorar negócios'}</h2>{!loading && !error && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{filtered.length} {filtered.length === 1 ? 'negócio' : 'negócios'}</p>}</div>
          {loading && <LoadingView message="A carregar negócios..." />}
          {error && blocked && <BackendBlockedView message="O catálogo não está disponível para esta sessão. Verifica o acesso autenticado e as políticas RLS." />}
          {error && !blocked && <ErrorView message={'Não foi possível carregar os negócios. ' + error} onRetry={load} />}
          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.map((business) => <button key={business.id} onClick={() => { setSelectedRestaurantId(business.id); navigate('restaurant'); }} className="w-full flex items-center gap-3.5 bg-white dark:bg-[#1A1A1A] rounded-2xl p-3.5 border border-black/[0.04] dark:border-white/[0.05] text-left active:scale-[0.985] transition-transform">
                <div className="w-14 h-14 rounded-xl bg-[#8A2BE2]/10 flex items-center justify-center shrink-0"><span className="text-xl font-extrabold text-[#8A2BE2]">{business.name.charAt(0).toUpperCase()}</span></div>
                <div className="min-w-0 flex-1"><h3 className="font-bold text-sm text-gray-950 dark:text-white truncate">{business.name}</h3><p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{business.description || categoryLabel(business.marketplace_category)}</p></div>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">{categoryLabel(business.marketplace_category)}</span>
              </button>)}
            </div>
          )}
          {!loading && !error && filtered.length === 0 && <EmptyView title={query.trim() ? 'Nenhum negócio encontrado' : 'Nenhum negócio disponível'} hint={query.trim() ? 'Tenta procurar por outro nome.' : 'Ainda não há negócios publicados.'} />}
        </section>
      </main>
      <BottomNav current="discover" />
    </div>
  );
}
