import { NavProvider, useNav } from '@/nav';
import { AuthProvider } from '@/auth';
import { ThemeProvider } from '@/theme';
import { Splash } from '@/screens/Splash';
import { Welcome } from '@/screens/Welcome';
import { Auth } from '@/screens/Auth';
import { OTP } from '@/screens/OTP';
import { Address } from '@/screens/Address';
import { Home } from '@/screens/Home';
import { Discover } from '@/screens/Discover';
import { Comida } from '@/screens/Comida';
import { Restaurant } from '@/screens/Restaurant';
import { Compras } from '@/screens/Compras';
import { Lojas } from '@/screens/Lojas';
import { Enviar } from '@/screens/Enviar';
import { Checkout } from '@/screens/Checkout';
import { Tracking } from '@/screens/Tracking';
import { OrderDetail } from '@/screens/OrderDetail';
import { Pedidos } from '@/screens/Pedidos';
import { Profile } from '@/screens/Profile';
import { Wallet } from '@/screens/Wallet';
import { SavedPlaces } from '@/screens/SavedPlaces';
import { Promotions } from '@/screens/Promotions';
import { Notifications } from '@/screens/Notifications';
import { Help } from '@/screens/Help';
import { About } from '@/screens/About';
import { EditProfile } from '@/screens/EditProfile';
import type { ScreenName } from '@/types';

function ScreenRouter() {
  const { screen } = useNav();

  const screens: Record<ScreenName, React.ReactNode> = {
    splash: <Splash />,
    welcome: <Welcome />,
    auth: <Auth />,
    otp: <OTP />,
    address: <Address />,
    home: <Home />,
    discover: <Discover />,
    comida: <Comida />,
    restaurant: <Restaurant />,
    compras: <Compras />,
    lojas: <Lojas />,
    enviar: <Enviar />,
    'enviar-details': <Enviar />,
    checkout: <Checkout />,
    tracking: <Tracking />,
    'order-detail': <OrderDetail />,
    pedidos: <Pedidos />,
    profile: <Profile />,
    wallet: <Wallet />,
    'saved-places': <SavedPlaces />,
    promotions: <Promotions />,
    notifications: <Notifications />,
    help: <Help />,
    about: <About />,
    'edit-profile': <EditProfile />,
  };

  return <div key={screen} className="animate-fade-in">{screens[screen]}</div>;
}

function App() {
  return (
    <ThemeProvider>
      <div className="max-w-phone mx-auto bg-white dark:bg-gray-950 min-h-screen shadow-xl relative transition-colors">
        <AuthProvider>
          <NavProvider>
            <ScreenRouter />
          </NavProvider>
        </AuthProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
