import { useState } from 'react';
import { useNav } from '@/nav';
import { ChevronLeft, Bell, MessageSquare, Mail, Check } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Notifications() {
  const { goBack } = useNav();
  const [settings, setSettings] = useState({
    orderUpdates: true,
    promotions: true,
    sms: false,
    email: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    {
      title: 'Notificações push',
      items: [
        { key: 'orderUpdates' as const, icon: Bell, label: 'Actualizações de pedidos', sublabel: 'Estado, ETA, entrega' },
        { key: 'promotions' as const, icon: MessageSquare, label: 'Promoções', sublabel: 'Ofertas e descontos' },
      ],
    },
    {
      title: 'Outros canais',
      items: [
        { key: 'sms' as const, icon: MessageSquare, label: 'SMS', sublabel: 'Notificações por SMS' },
        { key: 'email' as const, icon: Mail, label: 'Email', sublabel: 'Resumos e novidades' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 safe-top sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="-ml-1 p-1 active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Notificações</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="px-5 pt-5">
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Estas preferências ficam guardadas apenas neste dispositivo. O backend não expõe tabela de
            notificações para clientes nesta versão, por isso não há histórico de notificações sincronizado.
          </p>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="px-5 pt-5">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 px-1">{section.title}</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
            {section.items.map((item, i) => (
              <button
                key={item.key}
                onClick={() => toggle(item.key)}
                className={`w-full flex items-center gap-3 p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors text-left ${
                  i < section.items.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.sublabel}</p>
                </div>
                <div
                  className={`w-12 h-7 rounded-full transition-colors flex items-center px-0.5 ${
                    settings[item.key] ? 'bg-pedeja-600 justify-end' : 'bg-gray-200 dark:bg-gray-700 justify-start'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center">
                    {settings[item.key] && <Check className="w-3.5 h-3.5 text-pedeja-600" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
