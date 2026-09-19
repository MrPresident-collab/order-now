import { useNav } from '@/nav';
import { Home, Compass, ClipboardList, User } from 'lucide-react';
import type { ScreenName } from '@/types';

export function BottomNav({ current }: { current: ScreenName }) {
  const { navigate } = useNav();
  const tabs: { id: ScreenName; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'discover', label: 'Descobrir', icon: Compass },
    { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-phone mx-auto bg-[#1A1A1A] border-t border-white/5 safe-bottom z-40">
      <div className="flex">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = current === id;
          return (
            <button key={id} onClick={() => navigate(id)} className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors active:scale-90">
              <Icon className={active ? 'w-6 h-6 text-[#8A2BE2] drop-shadow-[0_0_8px_rgba(138,43,226,0.35)]' : 'w-6 h-6 text-gray-500'} strokeWidth={active ? 2.5 : 2} />
              <span className={active ? 'text-xs font-medium text-[#8A2BE2]' : 'text-xs font-medium text-gray-500'}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
