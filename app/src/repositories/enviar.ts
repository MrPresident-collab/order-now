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
