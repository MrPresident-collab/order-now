import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type CustomerProfile = {
  id: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: CustomerProfile | null;
  authLoading: boolean;
  profileLoading: boolean;
  profileError: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function loadProfile(userId: string): Promise<CustomerProfile> {
  // Try customer_profiles first, then profiles. RLS failures surface as errors
  // which the caller converts into an honest UI state (never fake data).
  const attemptTables = ['customer_profiles', 'profiles'];
  let lastError: string | null = null;
  for (const table of attemptTables) {
    const { data, error } = await supabase.from(table).select('*').eq('id', userId).maybeSingle();
    if (!error && data) {
      const row = data as Record<string, unknown>;
      const str = (v: unknown) => (v == null ? null : String(v));
      return {
        id: userId,
        fullName: str(row.full_name ?? row.name ?? row.display_name),
        phone: str(row.phone ?? row.phone_number ?? row.msisdn),
        email: str(row.email),
      };
    }
    if (error && error.code !== 'PGRST116' && error.code !== 'PGRST205') {
      lastError = error.message;
    }
  }
  if (lastError) throw new Error(lastError);
  // No profile row yet — return identity-derived shell (not fake data).
  return { id: userId, fullName: null, phone: null, email: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const refreshProfile = async () => {
    const { data } = await supabase.auth.getUser();
    const u = data.user;
    if (!u) {
      setProfile(null);
      setProfileError(null);
      return;
    }
    setProfileLoading(true);
    setProfileError(null);
    try {
      const p = await loadProfile(u.id);
      // Enrich with auth identity (authoritative for email/phone when profile row lacks them).
      setProfile({
        ...p,
        email: p.email ?? u.email ?? (u.phone ?? null),
        phone: p.phone ?? u.phone ?? null,
      });
    } catch (e) {
      setProfile(null);
      setProfileError(e instanceof Error ? e.message : 'Não foi possível carregar o perfil.');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setAuthLoading(false);
      if (data.session?.user) void refreshProfile();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next?.user) void refreshProfile();
      else {
        setProfile(null);
        setProfileError(null);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setProfileError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        authLoading,
        profileLoading,
        profileError,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
