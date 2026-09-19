import { supabase } from '@/lib/supabase';

export type CreateCustomerOrderItem = { productId: string; quantity: number };

export async function createCustomerOrder(input: {
  businessId: string;
  deliveryAddressId: string;
  items: CreateCustomerOrderItem[];
  customerNote?: string;
  deliveryInstructions?: string;
}): Promise<string> {
  const idempotencyKey = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const { data, error } = await supabase.rpc('create_customer_order', {
    p_business_id: input.businessId,
    p_delivery_address_id: input.deliveryAddressId,
    p_items: input.items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
    p_customer_note: input.customerNote ?? '',
    p_delivery_instructions: input.deliveryInstructions ?? '',
    p_idempotency_key: idempotencyKey,
  });
  if (error) throw new Error(error.code === '42501'
    ? 'Sem permissão no backend (RLS). Inicia sessão e tenta novamente.'
    : (error.message ?? 'Não foi possível criar o pedido.'));
  if (!data) throw new Error('ORDER_CREATION_FAILED');
  return String(data);
}
