import { useNav } from '@/nav';
import { ChevronLeft, Shield, FileText, Mail, Phone } from 'lucide-react';
import { Wordmark } from '@/components/Wordmark';
import { ThemeToggle } from '@/components/ThemeToggle';

export function About() {
  const { goBack } = useNav();

  const links = [
    { icon: FileText, label: 'Termos de serviço' },
    { icon: Shield, label: 'Política de privacidade' },
    { icon: Shield, label: 'Cookies' },
  ];

  const contact = [
    { icon: Mail, label: 'Email', value: 'Contacto será publicado pela Pedejá antes do lançamento' },
    { icon: Phone, label: 'Telefone', value: 'Contacto será publicado pela Pedejá antes do lançamento' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 safe-top sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="-ml-1 p-1 active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Sobre a Pedejá</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Hero */}
      <div className="px-5 pt-6">
        <div className="bg-pedeja-950 rounded-2xl p-6 text-center">
          <h1 className="text-3xl mb-2">
            <Wordmark />
          </h1>
          <p className="text-gray-400 text-sm font-medium">A promessa que se move</p>
          <p className="text-xs text-gray-500 mt-3">Entrega de comida, compras e encomendas em Luanda, Angola.</p>
        </div>
      </div>

      {/* About text */}
      <div className="px-5 pt-5">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            A Pedejá é a plataforma de entrega de Angola. Entregamos comida, compras e encomendas
            onde precisares, quando precisares. Ligamos clientes, restaurantes, lojistas e estafetas
            numa só plataforma.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-3">
            Os negócios, produtos, preços e disponibilidade apresentados no catálogo são os dados reais
            publicados no backend Supabase. Sem dados publicados, mostramos um estado vazio honesto.
          </p>
        </div>
      </div>

      {/* Legal links */}
      <div className="px-5 pt-5">
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 px-1">Legal</h2>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
          {links.map((l, i) => (
            <button
              key={l.label}
              className={`w-full flex items-center gap-3 p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors text-left ${
                i < links.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <l.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="flex-1 font-semibold text-gray-900 dark:text-white text-sm">{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="px-5 pt-5">
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 px-1">Contacto</h2>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
          {contact.map((c, i) => (
            <div
              key={c.label}
              className={`w-full flex items-center gap-3 p-4 ${
                i < contact.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <c.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pt-6 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-600">Pedejá v1.0.0 — Luanda, Angola</p>
      </div>
    </div>
  );
}
