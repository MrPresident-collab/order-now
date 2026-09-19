export type ScreenName =
  | 'splash'
  | 'welcome'
  | 'auth'
  | 'otp'
  | 'address'
  | 'home'
  | 'comida'
  | 'restaurant'
  | 'compras'
  | 'lojas'
  | 'enviar'
  | 'enviar-details'
  | 'checkout'
  | 'tracking'
  | 'order-detail'
  | 'pedidos'
  | 'profile'
  | 'wallet'
  | 'saved-places'
  | 'promotions'
  | 'notifications'
  | 'help'
  | 'about'
  | 'edit-profile';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantName: string;
}

