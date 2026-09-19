import { supabase } from '@/lib/supabase';

export type CustomerOrderDetail = {
  orderId: string;
  orderReference: string;
  status: string;
  paymentStatus: string;
  businessId: string;
  businessName: string;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discountAmount: number;
  totalAmount: number;
  currencyCode: string;
  paymentMethod: string | null;
  placedAt: string | null;
  acceptedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  line1: string | null;
  neighborhood: string | null;
  municipality: string | null;
  city: string | null;
  province: string | null;
  recipientName: string | null;
  recipientPhone: string | null;
  deliveryInstructions: string | null;
  customerNote: string | null;
  items: { id: string; productId: string | null; name: string; unitPrice: number; quantity: number; lineTotal: number }[];
  delivery: {
    jobId: string;
    status: string;
    riderName: string | null;
    riderPhone: string | null;
    vehicleType: string | null;
    vehicleMake: string | null;
    vehicleModel: string | null;
    vehicleRegistration: string | null;
  } | null;
};

const num = (v: unknown) => (v == null ? 0 : Number(v));
const str = (v: unknown, fallback = '') => (v == null ? fallback : String(v));
const strNull = (v: unknown) => (v == null ? null : String(v));

export async function getCustomerOrderDetail(orderId: string): Promise<CustomerOrderDetail | null> {
  const { data, error } = await supabase.rpc('get_customer_order_detail', { p_order_id: orderId });
  if (error) throw new Error(error.code === '42501'
    ? 'Sem permissão no backend (RLS). Inicia sessão e tenta novamente.'
    : (error.message ?? 'Não foi possível carregar o detalhe do pedido.'));
  if (!data) return null;
  const d = data as Record<string, unknown>;
  const addr = (d.deliveryAddress ?? d.delivery_address ?? {}) as Record<string, unknown>;
  const del = (d.delivery ?? null) as Record<string, unknown> | null;
  const items = Array.isArray(d.items) ? (d.items as Record<string, unknown>[]) : [];
  return {
    orderId: str(d.orderId ?? d.order_id ?? orderId),
    orderReference: str(d.orderReference ?? d.order_reference ?? orderId),
    status: str(d.status),
    paymentStatus: str(d.paymentStatus ?? d.payment_status),
    businessId: str(d.businessId ?? d.business_id),
    businessName: str(d.businessName ?? d.business_name, 'Negócio Pedejá'),
    subtotal: num(d.subtotal),
    deliveryFee: num(d.deliveryFee ?? d.delivery_fee),
    serviceFee: num(d.serviceFee ?? d.service_fee),
    discountAmount: num(d.discountAmount ?? d.discount_amount),
    totalAmount: num(d.totalAmount ?? d.total_amount),
    currencyCode: str(d.currencyCode ?? d.currency_code, 'AOA'),
    paymentMethod: strNull(d.paymentMethod ?? d.payment_method),
    placedAt: strNull(d.placedAt ?? d.placed_at),
    acceptedAt: strNull(d.acceptedAt ?? d.accepted_at),
    deliveredAt: strNull(d.deliveredAt ?? d.delivered_at),
    cancelledAt: strNull(d.cancelledAt ?? d.cancelled_at),
    line1: strNull(addr.line1 ?? addr.line_1 ?? addr.address_line_1),
    neighborhood: strNull(addr.neighborhood),
    municipality: strNull(addr.municipality),
    city: strNull(addr.city),
    province: strNull(addr.province),
    recipientName: strNull(d.recipientName ?? d.recipient_name),
    recipientPhone: strNull(d.recipientPhone ?? d.recipient_phone),
    deliveryInstructions: strNull(d.deliveryInstructions ?? d.delivery_instructions),
    customerNote: strNull(d.customerNote ?? d.customer_note),
    items: items.map((item) => ({
      id: str(item.id),
      productId: item.productId != null ? String(item.productId) : null,
      name: str(item.name, 'Produto'),
      unitPrice: num(item.unitPrice ?? item.unit_price),
      quantity: num(item.quantity),
      lineTotal: num(item.lineTotal ?? item.line_total),
    })),
    delivery: del ? {
      jobId: str(del.jobId ?? del.job_id),
      status: str(del.status),
      riderName: strNull(del.riderName ?? del.rider_name),
      riderPhone: strNull(del.riderPhone ?? del.rider_phone),
      vehicleType: strNull(del.vehicleType ?? del.vehicle_type),
      vehicleMake: strNull(del.vehicleMake ?? del.vehicle_make),
      vehicleModel: strNull(del.vehicleModel ?? del.vehicle_model),
      vehicleRegistration: strNull(del.vehicleRegistration ?? del.vehicle_registration),
    } : null,
  };
}

export function subscribeToOrder(orderId: string, refresh: () => void) {
  const channel = supabase
    .channel(`order:${orderId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, refresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'delivery_jobs', filter: `order_id=eq.${orderId}` }, refresh)
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
