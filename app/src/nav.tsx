import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ScreenName, CartItem } from '@/types';

interface NavContextType {
  screen: ScreenName;
  navigate: (screen: ScreenName) => void;
  goBack: () => void;
  canGoBack: boolean;
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: (id: string | null) => void;
  selectedBusinessId: string | null;
  setSelectedBusinessId: (id: string | null) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  selectedShipmentId: string | null;
  setSelectedShipmentId: (id: string | null) => void;
  cartBusinessId: string | null;
  cart: CartItem[];
  addToCart: (item: { id: string; name: string; price: number }, restaurantName: string, businessId?: string | null) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  cartRestaurantName: string;
}

const NavContext = createContext<NavContextType | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenName>('splash');
  const [history, setHistory] = useState<ScreenName[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartRestaurantName, setCartRestaurantName] = useState('');
  const [cartBusinessId, setCartBusinessId] = useState<string | null>(null);

  const navigate = (next: ScreenName) => {
    setHistory((prev) => [...prev, screen]);
    setScreen(next);
  };

  const goBack = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setScreen(last);
      return prev.slice(0, -1);
    });
  };

  const addToCart = (item: { id: string; name: string; price: number }, restaurantName: string, businessId?: string | null) => {
    setCart((prev) => {
      // Cart must belong to a single business for real order creation.
      if (prev.length > 0 && cartBusinessId && businessId && cartBusinessId !== businessId) {
        return [{ ...item, quantity: 1, restaurantName }];
      }
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      return [...prev, { ...item, quantity: 1, restaurantName }];
    });
    if (businessId) setCartBusinessId(businessId);
    setCartRestaurantName(restaurantName);
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id));

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, quantity: c.quantity + delta } : c)).filter((c) => c.quantity > 0),
    );
  };

  const clearCart = () => {
    setCart([]);
    setCartRestaurantName('');
    setCartBusinessId(null);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <NavContext.Provider value={{
      screen, navigate, goBack, canGoBack: history.length > 0,
      selectedRestaurantId, setSelectedRestaurantId,
      selectedBusinessId: selectedRestaurantId, setSelectedBusinessId: setSelectedRestaurantId,
      selectedOrderId, setSelectedOrderId,
      selectedShipmentId, setSelectedShipmentId,
      cartBusinessId,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount, cartRestaurantName,
    }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}

