import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { formatKz } from '@/data';
import { getBusiness, listActiveProducts, type CatalogBusiness, type CatalogProduct } from '@/repositories/catalog';
import { ChevronLeft, Plus, Minus, ShoppingBag } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const categoryLabel = (value: string | null) => value === 'comida' ? 'Comida' : value === 'compras' ? 'Compras' : value === 'lojas' ? 'Lojas' : 'Negócio';

export function Restaurant() {
  const { goBack, selectedRestaurantId, navigate, cart, addToCart, updateQuantity, cartCount, cartTotal, cartRestaurantName } = useNav();
  const [business, setBusiness] = useState<CatalogBusiness | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedRestaurantId) { setLoading(false); return; }
    let active = true;
    Promise.all([getBusiness(selectedRestaurantId), listActiveProducts(selectedRestaurantId)]).then(([b, p]) => { if (active) { setBusiness(b); setProducts(p); } }).catch((err: Error) => active && setError(err.message)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [selectedRestaurantId]);

  if (loading) return <div className="min-h-screen bg-[#F8F7FA] dark:bg-[#0B0B0D] flex items-center justify-center text-gray-500">A carregar negócio...</div>;
  if (error) return <div className="min-h-screen bg-[#F8F7FA] dark:bg-[#0B0B0D] flex items-center justify-center px-6"><div className="text-center"><p className="text-red-600 mb-4">Não foi possível carregar este negócio.</p><button onClick={goBack} className="bg-[#8A2BE2] text-white px-5 py-3 rounded-xl font-semibold">Voltar</button></div></div>;
  if (!business) return <div className="min-h-screen bg-[#F8F7FA] dark:bg-[#0B0B0D] flex items-center justify-center text-gray-500">Negócio não encontrado.</div>;

  const renderItem = (item: CatalogProduct) => {
    const inCart = cart.find((c) => c.id === item.id);
    return <div key={item.id} className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-3 flex items-center gap-3 border border-black/[0.04] dark:border-white/[0.05]">
      <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center shrink-0">{item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : <ShoppingBag className="w-6 h-6 text-gray-300" />}</div>
      <div className="flex-1 min-w-0"><h3 className="font-bold text-sm text-gray-950 dark:text-white truncate">{item.name}</h3><p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{item.description || 'Produto disponível'}</p><p className="text-sm font-extrabold text-[#8A2BE2] mt-1">{formatKz(item.price)}</p></div>
      {inCart ? <div className="flex items-center gap-1.5 shrink-0"><button aria-label="Diminuir quantidade" onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-90"><Minus className="w-4 h-4" /></button><span className="text-sm font-bold w-5 text-center">{inCart.quantity}</span><button aria-label="Aumentar quantidade" onClick={() => addToCart(item, business.name, business.id)} className="w-8 h-8 rounded-full bg-[#8A2BE2] flex items-center justify-center active:scale-90"><Plus className="w-4 h-4 text-white" /></button></div> : <button aria-label={'Adicionar ' + item.name} onClick={() => addToCart(item, business.name, business.id)} className="w-9 h-9 rounded-full bg-[#8A2BE2] flex items-center justify-center shrink-0 active:scale-90"><Plus className="w-5 h-5 text-white" /></button>}
    </div>;
  };

  return <div className="min-h-screen bg-[#F8F7FA] dark:bg-[#0B0B0D] pb-32">
    <header className="relative h-48 bg-gradient-to-br from-[#8A2BE2] to-[#54158f] overflow-hidden">
      <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full border-[44px] border-white/10" />
      <div className="absolute -left-20 -bottom-28 w-56 h-56 rounded-full border-[38px] border-white/10" />
      <button onClick={goBack} aria-label="Voltar" className="absolute top-12 left-4 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-sm active:scale-90"><ChevronLeft className="w-5 h-5 text-gray-900" /></button>
      <div className="absolute top-12 right-4"><ThemeToggle className="bg-white/95" /></div>
    </header>
    <section className="relative -mt-7 mx-4 bg-white dark:bg-[#1A1A1A] rounded-3xl p-5 border border-black/[0.04] dark:border-white/[0.05] shadow-sm">
      <div className="w-14 h-14 -mt-10 rounded-2xl bg-[#8A2BE2] text-white flex items-center justify-center text-2xl font-extrabold shadow-lg shadow-purple-900/20">{business.name.charAt(0).toUpperCase()}</div>
      <div className="mt-3 flex items-start justify-between gap-3"><div className="min-w-0"><h1 className="text-2xl leading-tight font-extrabold text-gray-950 dark:text-white">{business.name}</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">{business.description || 'Negócio parceiro Pedejá'}</p></div><span className="shrink-0 px-2.5 py-1 rounded-full bg-[#8A2BE2]/10 text-[#8A2BE2] text-[10px] font-extrabold uppercase tracking-wide">{categoryLabel(business.marketplace_category)}</span></div>
    </section>
    <main className="px-4 pt-6">
      <div className="mb-3"><h2 className="text-base font-extrabold text-gray-950 dark:text-white">Produtos</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{products.length ? products.length + ' disponíveis' : 'Catálogo'}</p></div>
      <div className="space-y-2.5">{products.map(renderItem)}{products.length === 0 && <p className="text-sm text-gray-500 text-center py-12">Este negócio ainda não tem produtos disponíveis.</p>}</div>
    </main>
    {cart.length > 0 && <div className="fixed bottom-0 left-0 right-0 max-w-phone mx-auto px-4 pb-4 safe-bottom z-40"><button onClick={() => navigate('checkout')} className="w-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-2xl py-3.5 px-4 flex items-center justify-between shadow-2xl active:scale-[0.99]"><div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-[#8A2BE2] text-white flex items-center justify-center text-xs font-extrabold">{cartCount}</span><span className="text-sm font-bold">Ver pedido</span></div><span className="font-extrabold">{formatKz(cartTotal)} <span className="text-[#8A2BE2]">→</span></span></button>{cartRestaurantName !== business.name && <p className="text-xs text-center text-gray-500 mt-2">Já tens itens de {cartRestaurantName} no carrinho.</p>}</div>}
  </div>;
}
