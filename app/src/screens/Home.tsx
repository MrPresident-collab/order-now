import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { useAuth } from '@/auth';
import { listActiveBusinesses, type CatalogBusiness } from '@/repositories/catalog';
import { getDefaultCustomerAddress, type CustomerAddress } from '@/repositories/addresses';
import { User, ChevronDown, ArrowRight } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingView, ErrorView, EmptyView, BackendBlockedView } from '@/components/StateViews';

const categoryCards = [
  { label: 'COMIDA', screen: 'comida' as const, image: '/category-comida.svg' },
  { label: 'COMPRAS', screen: 'compras' as const, image: '/category-compras.svg' },
  { label: 'ENVIAR', screen: 'enviar' as const, image: '/category-enviar.svg' },
  { label: 'LOJAS', screen: 'lojas' as const, image: '/category-lojas.svg' },
];

const categoryLabel = (value: string | null) => {
  if (value === 'comida') return 'Comida';
  if (value === 'compras') return 'Compras';
  if (value === 'lojas') return 'Lojas';
  return 'Pedejá';
};

export function Home() {
  const { navigate, setSelectedRestaurantId } = useNav();
  const { user, profile } = useAuth();
  const [businesses, setBusinesses] = useState<CatalogBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<CustomerAddress | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    listActiveBusinesses().then(setBusinesses).catch((err: Error) => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!user) {
      setDefaultAddress(null);
      return;
    }
    getDefaultCustomerAddress().then(setDefaultAddress).catch(() => setDefaultAddress(null));
  }, [user]);

  const greetingName = profile?.fullName?.split(' ')[0] ?? null;
  const blocked = error?.includes('permission denied') || error?.includes('42501');

  return (
    <div className="min-h-screen bg-[#F8F7FA] dark:bg-[#0B0B0D] pb-24">
      <header className="bg-[#F8F7FA]/95 dark:bg-[#0B0B0D]/95 backdrop-blur-md px-5 pt-10 pb-3 safe-top sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('profile')} aria-label="Perfil" className="w-10 h-10 rounded-full bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-white/5 flex items-center justify-center active:scale-90 transition-transform">
            <User className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
          <button onClick={() => navigate(user ? 'saved-places' : 'address')} className="flex items-center gap-1.5 max-w-[55%] text-gray-800 dark:text-white font-semibold text-sm truncate">
            <span className="truncate">{defaultAddress ? defaultAddress.label : 'Casa'}</span>
            <ChevronDown className="w-4 h-4 shrink-0 text-gray-500" />
          </button>
          <ThemeToggle />
        </div>
        <div className="pt-4">
          <h1 className="text-[26px] leading-tight font-extrabold text-gray-950 dark:text-white">{greetingName ? 'Olá, ' + greetingName + ' 👋' : 'Olá 👋'}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">O que precisas hoje?</p>
        </div>
        {!user && <button onClick={() => navigate('auth')} className="mt-4 w-full rounded-2xl bg-[#8A2BE2]/10 dark:bg-[#8A2BE2]/15 px-4 py-3 text-left text-xs font-semibold text-[#6f20b9] dark:text-purple-300">Entra na tua conta para pedir, guardar moradas e ver o histórico.</button>}
      </header>

      <main>
        <section className="px-5 pt-4">
          <div className="grid grid-cols-2 gap-3">
            {categoryCards.map(({ label, screen, image }) => (
              <button key={label} onClick={() => navigate(screen)} className="group relative aspect-[1.42] overflow-hidden rounded-2xl bg-[#1A1A1A] text-white text-left shadow-sm active:scale-[0.97] transition-transform">
                <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-active:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute bottom-3.5 left-3.5 font-extrabold text-sm tracking-wide">{label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-7 px-5">
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2 className="text-base font-extrabold text-gray-950 dark:text-white">Perto de ti</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Negócios disponíveis no Pedejá</p>
            </div>
            <button onClick={() => navigate('discover')} className="text-xs font-bold text-[#8A2BE2] flex items-center gap-1">Ver todos <ArrowRight className="w-3.5 h-3.5" /></button>
          </div>

          {loading && <LoadingView message="A carregar negócios..." />}
          {error && blocked && <BackendBlockedView message="O catálogo está bloqueado para esta sessão. Entra na tua conta para continuar." />}
          {error && !blocked && <ErrorView message={'Não foi possível carregar o catálogo. ' + error} onRetry={load} />}
          {!loading && !error && businesses.length === 0 && <EmptyView title="Sem negócios activos" hint="Ainda não há negócios publicados no catálogo." />}

          {!loading && !error && businesses.length > 0 && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1 snap-x">
              {businesses.slice(0, 8).map((business) => (
                <button key={business.id} onClick={() => { setSelectedRestaurantId(business.id); navigate('restaurant'); }} className="w-[220px] shrink-0 snap-start text-left bg-white dark:bg-[#1A1A1A] rounded-2xl p-4 border border-black/[0.04] dark:border-white/[0.05] active:scale-[0.98] transition-transform">
                  <div className="w-full h-24 rounded-xl bg-gradient-to-br from-[#8A2BE2]/15 to-[#8A2BE2]/5 flex items-center justify-center mb-3"><span className="text-2xl font-extrabold text-[#8A2BE2]">{business.name.charAt(0).toUpperCase()}</span></div>
                  <h3 className="font-bold text-sm text-gray-950 dark:text-white truncate">{business.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{business.description || categoryLabel(business.marketplace_category)}</p>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
      <BottomNav current="home" />
    </div>
  );
}
