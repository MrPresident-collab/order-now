import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { useAuth } from '@/auth';
import { listActiveBusinesses, type CatalogBusiness } from '@/repositories/catalog';
import { getDefaultCustomerAddress, type CustomerAddress } from '@/repositories/addresses';
import { User, ChevronDown } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingView, ErrorView, EmptyView, BackendBlockedView } from '@/components/StateViews';

const categoryCards = [
  { label: 'COMIDA', screen: 'comida' as const, image: '/category-comida.svg' },
  { label: 'COMPRAS', screen: 'compras' as const, image: '/category-compras.svg' },
  { label: 'ENVIAR', screen: 'enviar' as const, image: '/category-enviar.svg' },
  { label: 'LOJAS', screen: 'lojas' as const, image: '/category-lojas.svg' },
];

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
    listActiveBusinesses()
      .then((rows) => setBusinesses(rows))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 safe-top sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('profile')} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-90 transition-transform"><User className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
          <button
            onClick={() => navigate(user ? 'saved-places' : 'address')}
            className="flex items-center gap-1 text-gray-800 dark:text-white font-semibold text-sm"
          >
            {defaultAddress ? defaultAddress.label : 'Casa'} <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <ThemeToggle />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          {greetingName ? `Olá, ${greetingName} 👋` : 'Olá 👋'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">O que precisas hoje?</p>
        {!user && (
          <button
            onClick={() => navigate('auth')}
            className="mt-3 w-full rounded-2xl bg-pedeja-50 dark:bg-pedeja-950/40 px-4 py-3 text-left text-xs font-semibold text-pedeja-700 dark:text-pedeja-300"
          >
            Entra na tua conta para pedir, guardar moradas e ver o histórico.
          </button>
        )}
      </div>

      <div className="px-5 pt-5">
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white mb-3">O que precisas hoje?</h2>
        <div className="grid grid-cols-2 gap-3">
          {categoryCards.map(({ label, screen, image }) => (
            <button
              key={label}
              onClick={() => navigate(screen)}
              className="group relative aspect-[1.42] overflow-hidden rounded-2xl bg-[#1A1A1A] text-white text-left shadow-sm active:scale-[0.97] transition-transform"
            >
              <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-active:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-3 font-extrabold text-sm tracking-wide">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 px-5">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">Disponível agora</h2>
        {loading && <LoadingView message="A carregar negócios..." />}
        {error && blocked && (
          <BackendBlockedView message="O catálogo público está bloqueado por RLS para sessões anónimas. O backend precisa de permitir leitura autenticada/anon de businesses. Tenta entrar na conta." />
        )}
        {error && !blocked && <ErrorView message={`Não foi possível carregar o catálogo. ${error}`} onRetry={load} />}
        {!loading && !error && businesses.length === 0 && (
          <EmptyView title="Sem negócios activos" hint="Ainda não há negócios publicados no catálogo." />
        )}
        <div className="space-y-3">
          {businesses.map((business) => (
            <button key={business.id} onClick={() => { setSelectedRestaurantId(business.id); navigate('restaurant'); }} className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{business.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{business.description || business.marketplace_category || 'Negócio Pedejá'}</p>
                </div>
                {business.marketplace_category && <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{business.marketplace_category}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
      <BottomNav current="home" />
    </div>
  );
}
