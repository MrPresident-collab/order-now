import { supabase } from '@/lib/supabase';

export type CustomerAddress = {
  addressId: string;
  label: string;
  addressLine1: string;
  neighborhood: string | null;
  municipality: string | null;
  city: string;
  province: string;
  recipientName: string;
  recipientPhone: string;
  deliveryInstructions: string | null;
  isDefault: boolean;
};

type AddressJoin = {
  address_line_1?: unknown;
  address_line1?: unknown;
  line1?: unknown;
  neighborhood?: unknown;
  municipality?: unknown;
  city?: unknown;
  province?: unknown;
} | null;

function mapRow(item: Record<string, unknown>): CustomerAddress {
  const rawJoin = item.addresses ?? item.address;
  const join: AddressJoin = Array.isArray(rawJoin) ? (rawJoin[0] as AddressJoin) : (rawJoin as AddressJoin);
  const str = (v: unknown, fallback = '') => (v == null ? fallback : String(v));
  return {
    addressId: str(item.address_id ?? item.id),
    label: str(item.label, 'Casa'),
    addressLine1: str(join?.address_line_1 ?? join?.address_line1 ?? join?.line1),
    neighborhood: join?.neighborhood == null ? null : String(join.neighborhood),
    municipality: join?.municipality == null ? null : String(join.municipality),
    city: str(join?.city),
    province: str(join?.province),
    recipientName: str(item.recipient_name),
    recipientPhone: str(item.recipient_phone),
    deliveryInstructions: item.delivery_instructions == null ? null : String(item.delivery_instructions),
    isDefault: Boolean(item.is_default),
  };
}

export async function getCustomerAddresses(): Promise<CustomerAddress[]> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return [];
  const { data, error } = await supabase
    .from('customer_addresses')
    .select('address_id,label,recipient_name,recipient_phone,delivery_instructions,is_default,addresses(address_line_1,neighborhood,municipality,city,province)')
    .eq('customer_id', user.id)
    .order('is_default', { ascending: false });
  if (error) throw error;
  if (!Array.isArray(data)) return [];
  return (data as unknown as Record<string, unknown>[]).map(mapRow);
}

export async function getDefaultCustomerAddress(): Promise<CustomerAddress | null> {
  const rows = await getCustomerAddresses();
  return rows.find((r) => r.isDefault) ?? rows[0] ?? null;
}

export async function createCustomerAddress(input: {
  label: string;
  addressLine1: string;
  neighborhood?: string;
  municipality?: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  deliveryInstructions?: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc('create_customer_address', {
    p_label: input.label,
    p_address_line_1: input.addressLine1,
    p_neighborhood: input.neighborhood ?? '',
    p_municipality: input.municipality ?? '',
    p_city: input.city,
    p_province: input.province,
    p_latitude: input.latitude,
    p_longitude: input.longitude,
    p_delivery_instructions: input.deliveryInstructions ?? '',
  });
  if (error) throw error;
  if (!data) throw new Error('ADDRESS_CREATION_FAILED');
  return String(data);
}

export async function setDefaultCustomerAddress(addressId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('set_default_customer_address', { p_address_id: addressId });
  if (error) throw error;
  return Boolean(data);
}

export async function removeCustomerAddress(addressId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('remove_customer_address', { p_address_id: addressId });
  if (error) throw error;
  return Boolean(data);
}
