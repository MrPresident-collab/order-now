import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { useAuth } from '@/auth';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Camera, Check } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ErrorView } from '@/components/StateViews';

export function EditProfile() {
  const { goBack } = useNav();
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(profile?.fullName ?? '');
    setPhone(profile?.phone ?? '');
    setEmail(profile?.email ?? user?.email ?? '');
    setLoading(false);
  }, [profile, user]);

  const handleSave = async () => {
    if (!user) {
      setError('Entra na conta para editar o perfil.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Update whichever profile table exists and is writable under RLS.
      let lastError: string | null = null;
      for (const table of ['customer_profiles', 'profiles']) {
        const { error } = await supabase.from(table).upsert(
          { id: user.id, full_name: name, name, phone, email },
          { onConflict: 'id' },
        );
        if (!error) {
          lastError = null;
          break;
        }
        lastError = error.message;
      }
      if (lastError) throw new Error(lastError);
      await refreshProfile();
      setSaved(true);
      setTimeout(() => goBack(), 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-sm text-gray-500">A carregar perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 safe-top sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="-ml-1 p-1 active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Editar perfil</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Avatar */}
      <div className="px-5 pt-6 flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-pedeja-600 flex items-center justify-center">
            <span className="text-white text-3xl font-extrabold">{(name.trim()[0] ?? 'P').toUpperCase()}</span>
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
            <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="px-5 pt-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 text-base font-medium text-gray-900 dark:text-white bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-pedeja-600 transition-colors pb-2 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Telefone</label>
            <div className="mt-2 flex items-center gap-2 border-b-2 border-gray-200 dark:border-gray-700 focus-within:border-pedeja-600 transition-colors pb-2">
              <span className="text-gray-700 dark:text-gray-300 font-semibold text-base">+244</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+244 ..."
                className="flex-1 text-base font-medium text-gray-900 dark:text-white bg-transparent outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 text-base font-medium text-gray-900 dark:text-white bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-pedeja-600 transition-colors pb-2 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="px-5 pt-5">
        {error && <div className="mb-3"><ErrorView message={error} /></div>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-pedeja-600 text-white font-bold text-base py-4 rounded-2xl active:scale-[0.98] transition-transform shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" /> Guardado
            </>
          ) : saving ? 'A guardar...' : 'Guardar alterações'}
        </button>
      </div>
    </div>
  );
}
