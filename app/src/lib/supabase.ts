import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

export const supabaseConfigError =
  !supabaseUrl || !supabasePublishableKey
    ? 'Configuração Supabase em falta. Define VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.'
    : null;

export const supabase = createClient(supabaseUrl ?? 'https://placeholder.supabase.co', supabasePublishableKey ?? 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

