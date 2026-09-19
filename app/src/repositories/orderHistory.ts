import { supabase } from '@/lib/supabase';

export type CustomerOrderHistory = {
  orderId: string;
  orderReference: string;
  status: string;
  paymentStatus: string;
  businessId: string;
  businessName: string;
  businessCategory: string;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discountAmount: number;
  totalAmount: number;
  currencyCode: string;
  paymentMethod: string | null;
  placedAt: string | null;
  deliveryJobId: string | null;
  deliveryStatus: string | null;
  riderName: string | null;
  riderPhone: string | null;
  vehicleType: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleRegistration: string | null;
};

const num = (v: unknown) => (v == null ? 0 : Number(v));
const str = (v: unknown, fallback = '') => (v == null ? fallback : String(v));
const strNull = (v: unknown) => (v == null ? null : String(v));

export async function getCustomerOrdersHistory(): Promise<CustomerOrderHistory[]> {
  const { data, error } = await supabase.rpc('get_customer_orders_history');
  if (error) throw new Error(error.code === '42501'
    ? 'Sem permissão no backend (RLS). Inicia sessão e tenta novamente.'
    : (error.message ?? 'Não foi possível carregar os pedidos.'));
  if (!Array.isArray(data)) return [];
  return (data as Record<string, unknown>[]).map((row) => ({
    orderId: str(row.order_id ?? row.orderId),
    orderReference: str(row.order_reference ?? row.orderReference ?? row.order_id ?? row.orderId),
    status: str(row.status),
    paymentStatus: str(row.payment_status ?? row.paymentStatus),
    businessId: str(row.business_id ?? row.businessId),
    businessName: str(row.business_name ?? row.businessName, 'Negócio Pedejá'),
    businessCategory: str(row.business_category ?? row.businessCategory),
    subtotal: num(row.subtotal),
    deliveryFee: num(row.delivery_fee ?? row.deliveryFee),
    serviceFee: num(row.service_fee ?? row.serviceFee),
    discountAmount: num(row.discount_amount ?? row.discountAmount),
    totalAmount: num(row.total_amount ?? row.totalAmount),
    currencyCode: str(row.currency_code ?? row.currencyCode, 'AOA'),
    paymentMethod: strNull(row.payment_method ?? row.paymentMethod),
    placedAt: strNull(row.placed_at ?? row.placedAt),
    deliveryJobId: strNull(row.delivery_job_id ?? row.deliveryJobId),
    deliveryStatus: strNull(row.delivery_status ?? row.deliveryStatus),
    riderName: strNull(row.rider_name ?? row.riderName),
    riderPhone: strNull(row.rider_phone ?? row.riderPhone),
    vehicleType: strNull(row.vehicle_type ?? row.vehicleType),
    vehicleMake: strNull(row.vehicle_make ?? row.vehicleMake),
    vehicleModel: strNull(row.vehicle_model ?? row.vehicleModel),
    vehicleRegistration: strNull(row.vehicle_registration ?? row.vehicleRegistration),
  }));
}
