import { useNav } from '@/nav';
import { Home, Compass, ClipboardList, User } from 'lucide-react';
import type { ScreenName } from '@/types';

export function BottomNav({ current }: { current: ScreenName }) {
  const { navigate } = useNav();

  const tabs: { id: ScreenName; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'comida', label: 'Explorar', icon: Compass },
    { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-phone mx-auto bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-bottom z-40">
      <div className="flex">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = current === id;
          return (
            <button
              key={id}
              onClick={() => navigate(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors active:scale-90"
            >
              <Icon
                className={`w-6 h-6 transition-colors ${active ? 'text-pedeja-600' : 'text-gray-400 dark:text-gray-500'}`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`text-xs font-medium transition-colors ${active ? 'text-pedeja-600' : 'text-gray-400 dark:text-gray-500'}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
