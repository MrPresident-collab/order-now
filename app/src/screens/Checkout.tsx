import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { useAuth } from '@/auth';
import { createCustomerOrder } from '@/repositories/orderCreate';
import { getCustomerAddresses, type CustomerAddress } from '@/repositories/addresses';
import { formatKz } from '@/data';
import { ChevronLeft, Home, Check } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingView, ErrorView } from '@/components/StateViews';

export function Checkout() {
  const { goBack, navigate, cart, cartTotal, cartCount, cartRestaurantName, cartBusinessId, clearCart, setSelectedOrderId } = useNav();
  const { user } = useAuth();
  const [note, setNote] = useState('');
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [addrLoading, setAddrLoading] = useState(true);
  const [addrError, setAddrError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadAddresses = () => {
    if (!user) {
      setAddrLoading(false);
      return;
    }
    setAddrLoading(true);
    setAddrError(null);
    getCustomerAddresses()
      .then((rows) => {
        setAddresses(rows);
        const def = rows.find((r) => r.isDefault) ?? rows[0];
        if (def) setAddressId(def.addressId);
      })
      .catch((e: Error) => setAddrError(e.message))
      .finally(() => setAddrLoading(false));
  };

  useEffect(() => {
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const chosen = addresses.find((a) => a.addressId === addressId) ?? null;

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitError(null);
    if (!user) {
      setSubmitError('Entra na conta para criar um pedido real.');
      return;
    }
    if (!cartBusinessId) {
      setSubmitError('Carrinho sem negócio associado. Volta ao negócio e adiciona produtos.');
      return;
    }
    if (!addressId) {
      setSubmitError('Escolhe uma morada de entrega.');
      return;
    }
    setSubmitting(true);
    try {
      const orderId = await createCustomerOrder({
        businessId: cartBusinessId,
        deliveryAddressId: addressId,
        items: cart.map((c) => ({ productId: c.id, quantity: c.quantity })),
        customerNote: note,
      });
      clearCart();
      setSelectedOrderId(orderId);
      navigate('tracking');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Não foi possível criar o pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-6">
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">O teu carrinho está vazio</p>
        <button onClick={() => navigate('home')} className="text-pedeja-600 font-semibold">
          Voltar ao início
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-32">
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 safe-top sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="-ml-1 p-1 active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Confirmar pedido</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Delivery */}
      <div className="px-5 pt-5">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Entrega</h2>
        {!user && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm">
            Entra na conta para escolher a morada. <button onClick={() => navigate('auth')} className="font-bold text-pedeja-600">Entrar</button>
          </div>
        )}
        {user && addrLoading && <LoadingView message="A carregar moradas..." />}
        {user && addrError && <ErrorView message={addrError} onRetry={loadAddresses} />}
        {user && !addrLoading && !addrError && addresses.length === 0 && (
          <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 text-sm">
            Sem moradas. <button onClick={() => navigate('address')} className="font-bold text-pedeja-600">Adicionar morada</button>
          </div>
        )}
        {user && chosen && (
          <div className="space-y-2">
            {addresses.map((a) => (
              <button
                key={a.addressId}
                onClick={() => setAddressId(a.addressId)}
                className={`w-full rounded-2xl p-4 flex items-center gap-3 shadow-sm border-2 text-left ${addressId === a.addressId ? 'border-pedeja-600 bg-white dark:bg-gray-900' : 'border-transparent bg-white dark:bg-gray-900'}`}
              >
                <div className="w-10 h-10 rounded-xl bg-pedeja-50 dark:bg-pedeja-950/50 flex items-center justify-center">
                  <Home className="w-5 h-5 text-pedeja-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{a.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{a.addressLine1}{a.city ? `, ${a.city}` : ''}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="px-5 pt-5">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Itens · {cartCount} produtos</h2>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 space-y-3 shadow-sm">
          <p className="text-xs font-medium text-gray-400">{cartRestaurantName}</p>
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.quantity}×</span>
                <span className="text-sm text-gray-900 dark:text-white">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatKz(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 pt-5">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 space-y-2.5 shadow-sm">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Subtotal</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatKz(cartTotal)}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Entrega e taxas são calculadas pelo backend no momento da criação do pedido. Este subtotal não é o valor final.
          </p>
        </div>
      </div>

      {/* Note */}
      <div className="px-5 pt-5">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Nota (opcional)</h2>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex: ligar ao chegar"
          className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 text-sm shadow-sm outline-none"
        />
      </div>

      {/* Payment */}
      <div className="px-5 pt-5">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Pagamento</h2>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-pedeja-50 dark:bg-pedeja-950/50 flex items-center justify-center">
            <span className="text-pedeja-600 font-extrabold text-xs">Kz</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-white text-sm">Pagamento</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">O método de pagamento será definido pelo fluxo de pagamento disponível.</p>
          </div>
          <span className="text-[11px] font-semibold text-gray-400">Backend</span>
        </div>
      </div>

      {submitError && <div className="px-5 pt-4"><ErrorView message={submitError} /></div>}

      {/* Sticky confirm */}
      <div className="fixed bottom-0 left-0 right-0 max-w-phone mx-auto px-5 pb-6 pt-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 safe-bottom z-40">
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="w-full bg-pedeja-600 text-white font-bold text-base py-4 rounded-2xl active:scale-[0.98] transition-transform shadow-lg disabled:opacity-50"
        >
          {submitting ? 'A criar pedido...' : `Criar pedido real · ${formatKz(cartTotal)}`}
        </button>
      </div>
    </div>
  );
}
