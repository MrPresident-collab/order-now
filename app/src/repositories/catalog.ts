import { supabase } from '@/lib/supabase';

export type CatalogBusiness = {
  id: string;
  name: string;
  description: string | null;
  marketplace_category: 'comida' | 'compras' | 'lojas' | null;
  status: string;
};

export type CatalogProduct = {
  id: string;
  business_id: string;
  sku: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  currency_code: string;
  status: string;
  sort_order: number;
};

export async function listActiveBusinesses(category?: CatalogBusiness['marketplace_category']) {
  let query = supabase
    .from('businesses')
    .select('id,name,description,marketplace_category,status')
    .eq('status', 'ACTIVE')
    .order('name');

  if (category) query = query.eq('marketplace_category', category);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CatalogBusiness[];
}

export async function getBusiness(id: string) {
  const { data, error } = await supabase
    .from('businesses')
    .select('id,name,description,marketplace_category,status')
    .eq('id', id)
    .eq('status', 'ACTIVE')
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as CatalogBusiness | null;
}

export async function listActiveProducts(businessId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('id,business_id,sku,name,description,image_url,price,currency_code,status,sort_order')
    .eq('business_id', businessId)
    .eq('status', 'ACTIVE')
    .order('sort_order')
    .order('name');

  if (error) throw error;
  return (data ?? []).map((item) => ({
    ...item,
    price: Number(item.price),
  })) as CatalogProduct[];
}
