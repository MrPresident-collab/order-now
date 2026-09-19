import { useState } from 'react';
import { useNav } from '@/nav';
import { ChevronLeft, Search, MessageCircle, Phone, Mail, FileText, ChevronRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Help() {
  const { goBack } = useNav();
  const [query, setQuery] = useState('');

  const faqs = [
    { q: 'Como faço um pedido?', a: 'Escolhe um negócio no catálogo, adiciona produtos ao carrinho e cria o pedido real no Checkout.' },
    { q: 'Quanto tempo demora a entrega?', a: 'O estado e o estafeta aparecem no acompanhamento do pedido em tempo real.' },
    { q: 'Como pago o meu pedido?', a: 'O pagamento segue as regras do backend. O Checkout regista a tua preferência na nota do pedido.' },
    { q: 'Posso cancelar um pedido?', a: 'O cancelamento depende das regras do backend e do estado do pedido. Fala com o suporte a partir do acompanhamento do pedido.' },
    { q: 'Como funciona o Enviar?', a: 'Escolhe o tipo de item e indica recolha e destino. A criação de envios ainda aguarda a RPC do backend; o acompanhamento de envios existentes já está ligado.' },
    { q: 'Como uso códigos promocionais?', a: 'O backend não expõe promoções para clientes nesta versão, por isso não há códigos activos na app.' },
  ];

  const filtered = query === '' ? faqs : faqs.filter((f) => f.q.toLowerCase().includes(query.toLowerCase()));

  const channels = [
    { icon: MessageCircle, label: 'Chat ao vivo', sublabel: 'Fala com a equipa Pedejá', color: 'text-pedeja-600' },
    { icon: Phone, label: 'Telefone', sublabel: '+244 932 000 000', color: 'text-success-600' },
    { icon: Mail, label: 'Email', sublabel: 'suporte@pedeja.ao', color: 'text-accent-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-3 safe-top sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="-ml-1 p-1 active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Ajuda</h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Procurar ajuda"
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-pedeja-600/30"
          />
        </div>
      </div>

      {/* Contact channels */}
      <div className="px-5 pt-5">
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 px-1">Fala connosco</h2>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
          {channels.map((c, i) => (
            <button
              key={c.label}
              className={`w-full flex items-center gap-3 p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors text-left ${
                i < channels.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{c.sublabel}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />
            </button>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="px-5 pt-5">
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 px-1">Perguntas frequentes</h2>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
          {filtered.map((faq, i) => (
            <button
              key={i}
              className={`w-full flex items-start gap-3 p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors text-left ${
                i < filtered.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''
              }`}
            >
              <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{faq.q}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{faq.a}</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-400 dark:text-gray-500 text-sm">Nenhum resultado encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
