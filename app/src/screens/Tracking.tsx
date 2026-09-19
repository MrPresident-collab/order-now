import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { useAuth } from '@/auth';
import { getCustomerOrderDetail, subscribeToOrder } from '@/repositories/orderDetail';
import type { CustomerOrderDetail } from '@/repositories/orderDetail';
import { ChevronLeft, Phone, MessageCircle, MapPin, Bike, Star } from 'lucide-react';
import { LoadingView, ErrorView, EmptyView } from '@/components/StateViews';

export function Tracking() {
  const { navigate, selectedOrderId } = useNav();
  const { user } = useAuth();
  const [detail, setDetail] = useState<CustomerOrderDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!user || !selectedOrderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getCustomerOrderDetail(selectedOrderId).then(setDetail).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedOrderId]);

  useEffect(() => {
    if (!selectedOrderId) return;
    return subscribeToOrder(selectedOrderId, load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrderId]);

  const status = (detail?.status ?? '').toUpperCase();
  const orderIdx = status.includes('DELIVER') ? 3 : status.includes('PICK') || status.includes('TRANSIT') || status.includes('WAY') ? 2 : status.includes('PREP') || status.includes('ACCEPT') ? 1 : 0;
  const labels = ['Recebido', 'Preparando', 'Estafeta a caminho', 'Entregue'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 px-5 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('pedidos')}
            className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800 dark:text-gray-200" />
          </button>
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {detail ? `Pedido ${detail.orderReference}` : 'Acompanhar pedido'}
            </span>
          </div>
        </div>
      </div>

      {/* Map placeholder honesto */}
      <div className="relative flex-1 map-pattern dark:map-dark-pattern min-h-[280px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-pedeja-600/30 animate-pulse-ring" />
            <div className="w-12 h-12 rounded-full bg-pedeja-600 flex items-center justify-center relative z-10 shadow-lg">
              <Bike className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute top-16 right-8">
            <MapPin className="w-8 h-8 text-pedeja-600" fill="currentColor" />
          </div>
        </div>
        <p className="absolute bottom-2 left-0 right-0 px-8 text-center text-[11px] text-gray-500">
          Mapa ilustrativo — coordenadas em tempo real indisponíveis nesta versão.
        </p>
      </div>

      {/* Bottom sheet */}
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl px-5 pt-5 pb-8 shadow-2xl safe-bottom">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />

        {!selectedOrderId && <EmptyView title="Sem pedido seleccionado" hint="Abre um pedido activo em Pedidos." />}
        {loading && <LoadingView message="A carregar estado do pedido..." />}
        {error && <ErrorView message={error} onRetry={load} />}
        {!loading && !error && detail && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-pedeja-50 dark:bg-pedeja-950/50 flex items-center justify-center">
                  <Bike className="w-6 h-6 text-pedeja-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{detail.delivery?.status ?? detail.status}</p>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white">{detail.businessName}</p>
                </div>
              </div>
            </div>
            <div className="space-y-1 mb-5">
              {labels.map((label, i) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-2 ${i <= orderIdx ? 'bg-pedeja-600 border-pedeja-600' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`} />
                    {i < labels.length - 1 && <div className={`w-0.5 h-6 ${i < orderIdx ? 'bg-pedeja-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                  </div>
                  <span className={`text-sm font-medium ${i <= orderIdx ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-pedeja-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{(detail.delivery?.riderName ?? 'P')[0]}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 dark:text-white text-sm">{detail.delivery?.riderName ?? 'Estafeta Pedejá'}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-accent-500 fill-accent-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {[detail.delivery?.vehicleMake, detail.delivery?.vehicleModel, detail.delivery?.vehicleRegistration].filter(Boolean).join(' ') || 'Entrega Pedejá'}
                  </span>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center"><Phone className="w-5 h-5 text-pedeja-600" /></button>
              <button className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-pedeja-600" /></button>
            </div>
            <button onClick={() => navigate('profile')} className="w-full text-center text-sm text-gray-500 dark:text-gray-400 font-medium mt-4 py-2">
              Precisas de ajuda? <span className="text-pedeja-600 font-semibold">Conversar com suporte</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
