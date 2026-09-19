import { supabase } from '@/lib/supabase';

export type EnviarTracking = {
  shipmentId: string;
  status: string;
  deliveryJobId: string | null;
  riderName: string | null;
  riderPhone: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleRegistration: string | null;
  expectedDeliveryAt: string | null;
  distanceKm: number | null;
};

export async function createCustomerEnviarShipment(input: {
  pickupAddressId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddressLine1: string;
  recipientAddressLine2?: string;
  recipientNeighborhood?: string;
  recipientMunicipality?: string;
  recipientCity: string;
  recipientProvince: string;
  recipientLatitude: number;
  recipientLongitude: number;
  packageDescription: string;
  packageWeightKg?: number | null;
  packageSize?: string;
  vehicleType?: string;
  isFragile?: boolean;
  customerNote?: string;
}): Promise<string> {
  const idempotencyKey = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const { data, error } = await supabase.rpc('create_customer_enviar_shipment', {
    p_pickup_address_id: input.pickupAddressId,
    p_recipient_name: input.recipientName.trim(),
    p_recipient_phone: input.recipientPhone.trim(),
    p_recipient_address_line_1: input.recipientAddressLine1.trim(),
    p_recipient_address_line_2: input.recipientAddressLine2?.trim() ?? '',
    p_recipient_neighborhood: input.recipientNeighborhood?.trim() ?? '',
    p_recipient_municipality: input.recipientMunicipality?.trim() ?? '',
    p_recipient_city: input.recipientCity.trim(),
    p_recipient_province: input.recipientProvince.trim(),
    p_recipient_latitude: input.recipientLatitude,
    p_recipient_longitude: input.recipientLongitude,
    p_package_description: input.packageDescription.trim(),
    p_package_weight_kg: input.packageWeightKg ?? null,
    p_package_size: input.packageSize ?? '',
    p_vehicle_type: input.vehicleType ?? '',
    p_is_fragile: input.isFragile ?? false,
    p_customer_note: input.customerNote?.trim() ?? '',
    p_idempotency_key: idempotencyKey,
  });

  if (error) throw new Error(error.code === '42501'
    ? 'Sem permissão no backend (RLS). Inicia sessão e tenta novamente.'
    : (error.message ?? 'Não foi possível criar o envio.'));
  if (!data) throw new Error('ENVIAR_CREATION_FAILED');
  return String(data);
}

export async function getEnviarTracking(shipmentId: string): Promise<EnviarTracking | null> {
  const { data, error } = await supabase.rpc('get_customer_enviar_tracking', { p_shipment_id: shipmentId });
  if (error) throw error;
  if (!data) return null;
  const d = data as Record<string, unknown>;
  return {
    shipmentId: String(d.shipmentId ?? d.shipment_id ?? shipmentId),
    status: String(d.status ?? d.shipmentStatus ?? d.shipment_status ?? 'REQUESTED'),
    deliveryJobId: (d.deliveryJobId ?? d.delivery_job_id ?? null) as string | null,
    riderName: (d.riderName ?? d.rider_name ?? null) as string | null,
    riderPhone: (d.riderPhone ?? d.rider_phone ?? null) as string | null,
    vehicleMake: (d.vehicleMake ?? d.vehicle_make ?? null) as string | null,
    vehicleModel: (d.vehicleModel ?? d.vehicle_model ?? null) as string | null,
    vehicleRegistration: (d.vehicleRegistration ?? d.vehicle_registration ?? null) as string | null,
    expectedDeliveryAt: (d.expectedDeliveryAt ?? d.expected_delivery_at ?? null) as string | null,
    distanceKm: d.distanceKm == null && d.distance_km == null ? null : Number(d.distanceKm ?? d.distance_km),
  };
}

export function subscribeToEnviarTracking(shipmentId: string, refresh: () => void) {
  const channel = supabase
    .channel(`enviar-tracking:${shipmentId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'enviar_shipments', filter: `id=eq.${shipmentId}` }, refresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'delivery_jobs', filter: `enviar_shipment_id=eq.${shipmentId}` }, refresh)
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
