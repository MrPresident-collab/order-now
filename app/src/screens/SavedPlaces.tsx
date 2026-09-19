import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { useAuth } from '@/auth';
import { getCustomerAddresses, type CustomerAddress } from '@/repositories/addresses';
import { ChevronLeft, Home, Briefcase, Plus, MapPin, Edit3 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingView, ErrorView, EmptyView } from '@/components/StateViews';

export function SavedPlaces() {
  const { goBack, navigate } = useNav();
  const { user } = useAuth();
  const [places, setPlaces] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getCustomerAddresses().then(setPlaces).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 safe-top sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="-ml-1 p-1 active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Locais guardados</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="px-5 pt-5">
        {loading && <LoadingView message="A carregar locais..." />}
        {error && <ErrorView message={error} onRetry={load} />}
        {!loading && !error && places.length === 0 && (
          <EmptyView title={user ? 'Sem locais guardados' : 'Entra para ver locais'} hint={user ? 'Guarda moradas no ecrã Endereço.' : 'Os locais guardados exigem sessão.'} />
        )}
        {!loading && !error && places.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
            {places.map((p, i) => (
              <div
                key={p.addressId}
                className={`w-full flex items-center gap-3 p-4 ${
                  i < places.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {p.label.toLowerCase().includes('trabalho') ? <Briefcase className="w-5 h-5" /> : p.label.toLowerCase().includes('casa') ? <Home className="w-5 h-5 text-pedeja-600" /> : <MapPin className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{p.label}{p.isDefault ? ' · Padrão' : ''}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.addressLine1}{p.city ? `, ${p.city}` : ''}</p>
                </div>
                <button onClick={() => navigate('address')} className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ))}
            <button onClick={() => navigate('address')} className="w-full flex items-center gap-3 p-4 border-t border-gray-50 dark:border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-pedeja-50 dark:bg-pedeja-950/50 flex items-center justify-center">
                <Plus className="w-5 h-5 text-pedeja-600" />
              </div>
              <span className="font-semibold text-pedeja-600 text-sm">Adicionar local</span>
            </button>
          </div>
        )}
      </div>

      {/* Map preview */}
      <div className="px-5 pt-5">
        <div className="rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-800 h-48 map-pattern dark:map-dark-pattern relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-pedeja-600/30 animate-pulse-ring" />
              <MapPin className="w-10 h-10 text-pedeja-600 relative z-10" fill="currentColor" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
