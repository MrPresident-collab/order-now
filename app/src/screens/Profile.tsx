import { useNav } from '@/nav';
import { useAuth } from '@/auth';
import { useTheme } from '@/theme';
import {
  ChevronLeft, ChevronRight,
  MapPin, Moon, Sun, Bell, Tag, Wallet, Info, Package, LogOut, User as UserIcon,
  Shield,
} from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingView, ErrorView } from '@/components/StateViews';

export function Profile() {
  const { goBack, navigate } = useNav();
  const { user, profile, profileLoading, profileError, refreshProfile, signOut } = useAuth();
  const { theme, toggle } = useTheme();

  const displayName = profile?.fullName ?? (user?.email ? user.email.split('@')[0] : null) ?? 'Cliente Pedejá';
  const displayPhone = profile?.phone ?? user?.phone ?? user?.email ?? 'Sem contacto registado';
  const initial = (displayName.trim()[0] ?? 'P').toUpperCase();

  const logout = async () => {
    await signOut();
    navigate('welcome');
  };

  const sections = [
    {
      title: 'Conta',
      items: [
        { icon: UserIcon, label: 'Editar perfil', sublabel: 'Nome, telefone, email', screen: 'edit-profile' as const },
        { icon: Wallet, label: 'Carteira', sublabel: 'Ver estado segundo o backend', screen: 'wallet' as const },
        { icon: MapPin, label: 'Locais guardados', sublabel: 'Casa, Trabalho, outros', screen: 'saved-places' as const },
        { icon: Package, label: 'Pedidos', sublabel: 'Histórico e pedidos activos', screen: 'pedidos' as const },
      ],
    },
    {
      title: 'Promoções',
      items: [
        { icon: Tag, label: 'Códigos promocionais', sublabel: 'Ver ofertas disponíveis', screen: 'promotions' as const },
      ],
    },
    {
      title: 'Preferências',
      items: [
        { icon: Bell, label: 'Notificações', sublabel: 'Push, SMS, email', screen: 'notifications' as const },
        {
          icon: theme === 'light' ? Moon : Sun,
          label: theme === 'light' ? 'Modo escuro' : 'Modo claro',
          sublabel: theme === 'light' ? 'Mudar para escuro' : 'Mudar para claro',
          action: 'toggle-theme' as const,
        },
      ],
    },
    {
      title: 'Suporte',
      items: [
        { icon: Info, label: 'Conversar com suporte', sublabel: 'Ajuda e contacto', screen: 'help' as const },
        { icon: Info, label: 'Sobre a Pedejá', sublabel: 'Versão 1.0.0', screen: 'about' as const },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 safe-top sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="-ml-1 p-1 active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Conta</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* User card */}
      <div className="px-5 pt-5">
        {!user && (
          <button
            onClick={() => navigate('auth')}
            className="w-full bg-white dark:bg-gray-900 rounded-2xl p-5 text-left shadow-sm"
          >
            <p className="font-extrabold text-gray-900 dark:text-white">Entra na tua conta</p>
            <p className="text-sm text-gray-500">Autenticação real via Supabase.</p>
          </button>
        )}
        {user && profileLoading && <LoadingView message="A carregar perfil..." />}
        {user && profileError && <ErrorView message={profileError} onRetry={refreshProfile} />}
        {user && !profileLoading && !profileError && (
          <button
            onClick={() => navigate('edit-profile')}
            className="w-full bg-white dark:bg-gray-900 rounded-2xl p-5 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-16 h-16 rounded-full bg-pedeja-600 flex items-center justify-center">
              <span className="text-white text-2xl font-extrabold">{initial}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">{displayName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{displayPhone}</p>
              <p className="text-xs font-medium text-gray-500 mt-1">Cliente Pedejá</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />
          </button>
        )}
      </div>

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.title} className="px-5 pt-5">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 px-1">{section.title}</h3>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
            {section.items.map((item, i) => (
              <button
                key={item.label}
                onClick={() => {
                  if ('action' in item && item.action === 'toggle-theme') {
                    toggle();
                  } else if ('screen' in item) {
                    navigate(item.screen);
                  }
                }}
                className={`w-full flex items-center gap-3 p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors text-left ${
                  i < section.items.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.sublabel}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Legal */}
      <div className="px-5 pt-5">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
          <button className="w-full flex items-center gap-3 p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors text-left">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="flex-1 font-semibold text-gray-900 dark:text-white text-sm">Privacidade e termos</span>
            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />
          </button>
          <div className="border-t border-gray-50 dark:border-gray-800" />
          <button onClick={logout} className="w-full flex items-center gap-3 p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors text-left">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <span className="flex-1 font-semibold text-red-500 text-sm">Sair da conta</span>
          </button>
        </div>
      </div>

      <div className="px-5 pt-6 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-600">Pedejá v1.0.0 — A promessa que se move</p>
      </div>

      <BottomNav current="profile" />
    </div>
  );
}
