import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { formatKz } from '@/data';
import { getBusiness, listActiveProducts, type CatalogBusiness, type CatalogProduct } from '@/repositories/catalog';
import { ChevronLeft, Plus, Minus, ShoppingBag } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Restaurant() {
  const { goBack, selectedRestaurantId, navigate, cart, addToCart, updateQuantity, cartCount, cartTotal, cartRestaurantName } = useNav();
  const [business, setBusiness] = useState<CatalogBusiness | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedRestaurantId) { setLoading(false); return; }
    let active = true;
    Promise.all([getBusiness(selectedRestaurantId), listActiveProducts(selectedRestaurantId)])
      .then(([b, p]) => { if (active) { setBusiness(b); setProducts(p); } })
      .catch((err: Error) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [selectedRestaurantId]);

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-500">A carregar negócio...</div>;
  if (error) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-6"><div className="text-center"><p className="text-red-600 mb-4">Não foi possível carregar este negócio.</p><button onClick={goBack} className="bg-pedeja-600 text-white px-5 py-3 rounded-xl font-semibold">Voltar</button></div></div>;
  if (!business) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-500">Negócio não encontrado.</div>;

  const renderItem = (item: CatalogProduct) => {
    const inCart = cart.find((c) => c.id === item.id);
    return <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
      <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center flex-shrink-0">{item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : <ShoppingBag className="w-6 h-6 text-gray-300" />}</div>
      <div className="flex-1 min-w-0"><h3 className="font-semibold text-sm truncate">{item.name}</h3><p className="text-xs text-gray-500 truncate">{item.description || 'Produto'}</p><p className="text-sm font-bold text-pedeja-600 mt-0.5">{formatKz(item.price)}</p></div>
      {inCart ? <div className="flex items-center gap-2 flex-shrink-0"><button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><Minus className="w-4 h-4" /></button><span className="text-sm font-bold w-5 text-center">{inCart.quantity}</span><button onClick={() => addToCart(item, business.name, business.id)} className="w-8 h-8 rounded-full bg-pedeja-600 flex items-center justify-center"><Plus className="w-4 h-4 text-white" /></button></div> : <button onClick={() => addToCart(item, business.name, business.id)} className="w-9 h-9 rounded-full bg-pedeja-600 flex items-center justify-center flex-shrink-0"><Plus className="w-5 h-5 text-white" /></button>}
    </div>;
  };

  return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-32">
    <div className="relative h-44 bg-pedeja-950"><button onClick={goBack} className="absolute top-12 left-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button><div className="absolute top-12 right-4"><ThemeToggle className="bg-white/90" /></div></div>
    <div className="bg-white dark:bg-gray-900 px-5 pt-4 pb-5 -mt-6 relative rounded-t-3xl"><h1 className="text-2xl font-extrabold">{business.name}</h1><p className="text-sm text-gray-500 mt-2">{business.description || business.marketplace_category || 'Negócio Pedejá'}</p></div>
    <div className="px-5 pt-5"><h2 className="text-base font-bold mb-3">Produtos</h2><div className="space-y-2.5">{products.map(renderItem)}{products.length === 0 && <p className="text-sm text-gray-500 text-center py-10">Este negócio ainda não tem produtos disponíveis.</p>}</div></div>
    {cart.length > 0 && <div className="fixed bottom-0 left-0 right-0 max-w-phone mx-auto px-5 pb-6 safe-bottom z-40"><button onClick={() => navigate('checkout')} className="w-full bg-pedeja-600 text-white rounded-2xl py-4 px-5 flex items-center justify-between shadow-2xl"><div className="flex items-center gap-3"><ShoppingBag className="w-6 h-6" /><span className="text-sm font-medium">{cartCount} {cartCount === 1 ? 'item' : 'itens'}</span></div><span className="font-bold">{formatKz(cartTotal)} · Ver pedido →</span></button>{cartRestaurantName !== business.name && <p className="text-xs text-center text-gray-500 mt-2">Já tens itens de {cartRestaurantName} no carrinho.</p>}</div>}
  </div>;
}
