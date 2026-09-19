import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { useAuth } from '@/auth';
import { getCustomerOrderDetail, subscribeToOrder, type CustomerOrderDetail } from '@/repositories/orderDetail';
import { formatKz } from '@/data';
import { ChevronLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingView, ErrorView, EmptyView } from '@/components/StateViews';

export function OrderDetail() {
  const { goBack, selectedOrderId } = useNav();
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 safe-top sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="-ml-1 p-1"><ChevronLeft className="w-6 h-6" /></button>
            <h1 className="text-xl font-extrabold">Detalhe do pedido</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>
      <div className="px-5 pt-5 space-y-3">
        {!selectedOrderId && <EmptyView title="Sem pedido seleccionado" hint="Abre um pedido a partir de Pedidos." />}
        {loading && <LoadingView message="A carregar detalhe..." />}
        {error && <ErrorView message={error} onRetry={load} />}
        {!loading && !error && detail && (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-400">Referência</p>
              <p className="font-extrabold">{detail.orderReference}</p>
              <p className="mt-1 text-sm">{detail.businessName} · {({ DELIVERED: 'Entregue', CANCELLED: 'Cancelado', ACCEPTED: 'Aceite', PREPARING: 'A preparar', READY: 'Pronto', PICKED_UP: 'Recolhido', IN_TRANSIT: 'A caminho' } as Record<string, string>)[detail.status.toUpperCase()] ?? 'Em processamento'}</p>
              <p className="text-xs text-gray-500 mt-1">Pagamento: {detail.paymentStatus}{detail.paymentMethod ? ` · ${detail.paymentMethod}` : ''}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
              <h2 className="text-sm font-bold mb-2">Itens</h2>
              {detail.items.map((i) => (
                <div key={i.id} className="flex justify-between py-1 text-sm">
                  <span>{i.quantity}× {i.name}</span>
                  <span className="font-semibold">{formatKz(i.lineTotal)}</span>
                </div>
              ))}
              <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
              <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>{formatKz(detail.subtotal)}</span></div>
              <div className="flex justify-between text-sm text-gray-500"><span>Entrega</span><span>{formatKz(detail.deliveryFee)}</span></div>
              <div className="flex justify-between text-sm text-gray-500"><span>Taxa</span><span>{formatKz(detail.serviceFee)}</span></div>
              {detail.discountAmount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Desconto</span><span>-{formatKz(detail.discountAmount)}</span></div>}
              <div className="flex justify-between font-extrabold mt-1"><span>Total</span><span className="text-pedeja-600">{formatKz(detail.totalAmount)}</span></div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm text-sm">
              <h2 className="font-bold mb-1">Entrega</h2>
              <p className="text-gray-600 dark:text-gray-300">{detail.recipientName ?? ''} {detail.recipientPhone ? `· ${detail.recipientPhone}` : ''}</p>
              <p className="text-gray-600 dark:text-gray-300">{[detail.line1, detail.neighborhood, detail.city, detail.province].filter(Boolean).join(', ')}</p>
              {detail.deliveryInstructions && <p className="text-xs text-gray-500 mt-1">Instruções: {detail.deliveryInstructions}</p>}
              {detail.delivery && (
                <p className="text-xs text-gray-500 mt-2">
                  Estafeta: {detail.delivery.riderName ?? '—'}{detail.delivery.riderPhone ? ` · ${detail.delivery.riderPhone}` : ''}
                  {[detail.delivery.vehicleMake, detail.delivery.vehicleModel, detail.delivery.vehicleRegistration].filter(Boolean).length > 0
                    ? ` · ${[detail.delivery.vehicleMake, detail.delivery.vehicleModel, detail.delivery.vehicleRegistration].filter(Boolean).join(' ')}`
                    : ''}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
