import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { useAuth } from '@/auth';
import { getCustomerOrdersHistory, type CustomerOrderHistory } from '@/repositories/orderHistory';
import { formatKz } from '@/data';
import { ChevronLeft, Clock, CheckCircle, Bike } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingView, ErrorView, EmptyView, BackendBlockedView } from '@/components/StateViews';

export function Pedidos() {
  const { goBack, navigate, setSelectedOrderId } = useNav();
  const { user } = useAuth();
  const [tab, setTab] = useState<'ativo' | 'historico'>('ativo');
  const [orders, setOrders] = useState<CustomerOrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!user) {
      setLoading(false);
      setOrders([]);
      return;
    }
    setLoading(true);
    setError(null);
    getCustomerOrdersHistory().then(setOrders).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const openOrder = (id: string, asTracking: boolean) => {
    setSelectedOrderId(id);
    navigate(asTracking ? 'tracking' : 'order-detail');
  };

  const blocked = error?.includes('permission denied') || error?.includes('42501') || error?.includes('RLS');
  const active = orders.filter((o) => !['DELIVERED', 'CANCELLED', 'delivered', 'entregue'].includes(o.status));
  const history = orders.filter((o) => ['DELIVERED', 'CANCELLED', 'delivered', 'entregue'].includes(o.status));
  const shown = tab === 'ativo' ? active : history;

  const statusIcon = (status: string) => {
    if (status === 'DELIVERED' || status === 'entregue') return <CheckCircle className="w-4 h-4 text-success-500" />;
    if (status === 'CANCELLED') return <Clock className="w-4 h-4 text-gray-400" />;
    if (status.toLowerCase().includes('caminho') || status.toLowerCase().includes('transit')) return <Bike className="w-4 h-4 text-pedeja-600" />;
    return <Clock className="w-4 h-4 text-accent-500" />;
  };

  const statusColor = (status: string) => {
    if (status === 'DELIVERED' || status === 'entregue') return 'text-success-600';
    if (status === 'CANCELLED') return 'text-gray-400';
    return 'text-pedeja-600';
  };

  const fmtDate = (iso: string | null) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString('pt-AO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 safe-top sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="-ml-1 p-1 active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Pedidos</h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex gap-6 border-b border-gray-100 dark:border-gray-800 -mx-5 px-5">
          <button
            onClick={() => setTab('ativo')}
            className={`pb-3 border-b-2 transition-colors ${tab === 'ativo' ? 'border-pedeja-600' : 'border-transparent'}`}
          >
            <span className={`text-sm font-bold ${tab === 'ativo' ? 'text-pedeja-600' : 'text-gray-400 dark:text-gray-500'}`}>Ativo</span>
          </button>
          <button
            onClick={() => setTab('historico')}
            className={`pb-3 border-b-2 transition-colors ${tab === 'historico' ? 'border-pedeja-600' : 'border-transparent'}`}
          >
            <span className={`text-sm font-bold ${tab === 'historico' ? 'text-pedeja-600' : 'text-gray-400 dark:text-gray-500'}`}>Histórico</span>
          </button>
        </div>
      </div>

      {/* Orders */}
      <div className="px-5 pt-4 space-y-3">
        {!user && <EmptyView title="Entra para ver os teus pedidos" hint="O histórico de pedidos exige sessão autenticada." />}
        {user && loading && <LoadingView message="A carregar pedidos..." />}
        {user && error && blocked && <BackendBlockedView message="O histórico está bloqueado por RLS para esta sessão. O backend precisa de GRANT EXECUTE em get_customer_orders_history ao role authenticated." />}
        {user && error && !blocked && <ErrorView message={`Não foi possível carregar os pedidos. ${error}`} onRetry={load} />}
        {user && !loading && !error && shown.length === 0 && (
          <EmptyView title={tab === 'ativo' ? 'Sem pedidos activos' : 'Sem histórico'} hint="Os teus pedidos reais vão aparecer aqui." />
        )}
        {user && !loading && !error && shown.map((order) => (
          <button
            key={order.orderId}
            onClick={() => openOrder(order.orderId, tab === 'ativo')}
            className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform text-left"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{order.businessName}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{order.orderReference} · {fmtDate(order.placedAt)}</p>
              </div>
              <span className="font-extrabold text-gray-900 dark:text-white text-sm">{formatKz(order.totalAmount)}</span>
            </div>
            <div className={`flex items-center gap-1.5 mt-2 ${statusColor(order.status)}`}>
              {statusIcon(order.status)}
              <span className="text-xs font-semibold">{order.status}{order.riderName ? ` · ${order.riderName}` : ''}</span>
            </div>
          </button>
        ))}
      </div>
      <BottomNav current="pedidos" />
    </div>
  );
}
