import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { listActiveBusinesses, type CatalogBusiness } from '@/repositories/catalog';
import { ChevronLeft, Search } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingView, ErrorView, EmptyView, BackendBlockedView } from '@/components/StateViews';

export function Comida() {
  const { goBack, navigate, setSelectedRestaurantId } = useNav();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [businesses, setBusinesses] = useState<CatalogBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    listActiveBusinesses('comida').then(setBusinesses).catch((err: Error) => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const categories = ['Todos', 'Hambúrguer', 'Pizza', 'Sushi', 'Angolana'];
  const q = query.trim().toLowerCase();
  const filtered = businesses.filter((b) => {
    const hay = `${b.name} ${(b.description ?? '')}`.toLowerCase();
    const matchesQuery = q === '' || hay.includes(q);
    // O backend só expõe nome/descrição/categoria de marketplace.
    // O filtro de cozinha é uma conveniência local sobre os dados reais.
    const matchesCategory = activeCategory === 'Todos' || hay.includes(activeCategory.toLowerCase());
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-3 safe-top sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><button onClick={goBack} className="-ml-1 p-1"><ChevronLeft className="w-6 h-6" /></button><h1 className="text-xl font-extrabold">Comida</h1></div><ThemeToggle /></div>
        <div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Procurar comida ou restaurante" className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm outline-none" /></div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3">{categories.map((cat) => <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium ${activeCategory === cat ? 'bg-pedeja-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{cat}</button>)}</div>
      </div>
      <div className="px-5 pt-4 space-y-3">
        {loading && <LoadingView message="A carregar comida..." />}
        {error && (error.includes('permission denied') || error.includes('42501')) && (
          <BackendBlockedView message="Catálogo bloqueado por RLS. Entra na conta ou pede ao backend leitura autenticada de businesses." />
        )}
        {error && !error.includes('permission denied') && !error.includes('42501') && (
          <ErrorView message={`Não foi possível carregar o catálogo. ${error}`} onRetry={load} />
        )}
        {!loading && !error && filtered.map((b) => <button key={b.id} onClick={() => { setSelectedRestaurantId(b.id); navigate('restaurant'); }} className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm text-left"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-sm">{b.name}</h3><p className="text-xs text-gray-500 mt-1">{b.description || 'Negócio de alimentação'}</p></div><span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">comida</span></div></button>)}
        {!loading && !error && filtered.length === 0 && <EmptyView title="Nenhum negócio de comida" hint="Ainda não há negócios de comida publicados." />}
      </div>
      <BottomNav current="discover" />
    </div>
  );
}
