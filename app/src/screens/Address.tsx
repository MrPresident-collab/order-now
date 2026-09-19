import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { useAuth } from '@/auth';
import { getDefaultCustomerAddress, getCustomerAddresses, createCustomerAddress, setDefaultCustomerAddress, removeCustomerAddress, type CustomerAddress } from '@/repositories/addresses';
import { ChevronLeft, MapPin, Plus, Trash2, Check } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingView, ErrorView, EmptyView } from '@/components/StateViews';

export function Address() {
  const { navigate, goBack } = useNav();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ label: 'Casa', addressLine1: '', city: 'Luanda', province: 'Luanda' });
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = () => {
    if (!user) {
      setLoading(false);
      setAddresses([]);
      return;
    }
    setLoading(true);
    setError(null);
    getCustomerAddresses()
      .then((rows) => {
        setAddresses(rows);
        const def = rows.find((r) => r.isDefault) ?? rows[0];
        if (def) setSelected(def.addressId);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const saveNew = async () => {
    if (!user) {
      setError('Entra na conta para guardar moradas.');
      return;
    }
    if (form.addressLine1.trim().length < 4) {
      setError('Escreve a rua e número da morada.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const pos = await new Promise<GeolocationPosition | null>((resolve) => {
        if (!('geolocation' in navigator)) return resolve(null);
        navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 5000 });
      });
      const id = await createCustomerAddress({
        label: form.label,
        addressLine1: form.addressLine1.trim(),
        city: form.city.trim() || 'Luanda',
        province: form.province.trim() || 'Luanda',
        latitude: pos?.coords.latitude ?? 0,
        longitude: pos?.coords.longitude ?? 0,
      });
      setForm({ label: 'Casa', addressLine1: '', city: 'Luanda', province: 'Luanda' });
      setActionMsg('Morada guardada.');
      await load();
      setSelected(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível guardar.');
    } finally {
      setSaving(false);
    }
  };

  const makeDefault = async (id: string) => {
    try {
      await setDefaultCustomerAddress(id);
      setSelected(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível definir padrão.');
    }
  };

  const remove = async (id: string) => {
    try {
      await removeCustomerAddress(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível remover.');
    }
  };

  const confirm = async () => {
    if (selected) {
      try {
        await setDefaultCustomerAddress(selected);
      } catch {
        // Selecção local continua válida mesmo se o backend falhar.
      }
    }
    navigate('home');
  };

  const fallbackDefault = async () => {
    try {
      const def = await getDefaultCustomerAddress();
      if (def) setSelected(def.addressId);
    } catch {
      // ignora
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col px-6 pt-16 safe-top safe-bottom">
      <div className="flex items-center justify-between mb-6">
        <button onClick={goBack} className="-ml-2 p-2">
          <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
        <ThemeToggle />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Onde entregamos?</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">As tuas moradas reais da Pedejá</p>
        </div>
        {!user && (
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 mb-4">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Entra para guardar moradas</p>
            <button onClick={() => navigate('auth')} className="mt-2 text-sm font-bold text-pedeja-600">Ir para autenticação</button>
          </div>
        )}
        {loading && <LoadingView message="A carregar moradas..." />}
        {error && <div className="mb-4"><ErrorView message={error} onRetry={() => { load(); void fallbackDefault(); }} /></div>}
        {actionMsg && <p className="mb-3 text-sm font-semibold text-green-600">{actionMsg}</p>}
        {!loading && !error && addresses.length === 0 && user && (
          <EmptyView title="Sem moradas guardadas" hint="Adiciona a tua primeira morada de entrega abaixo." />
        )}
        <div className="space-y-3 mt-4">
          {addresses.map((a) => (
            <div
              key={a.addressId}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-colors ${
                selected === a.addressId ? 'border-pedeja-600 bg-pedeja-50 dark:bg-pedeja-950/50' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <button onClick={() => setSelected(a.addressId)} className="flex flex-1 items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-pedeja-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {a.label} {a.isDefault && <span className="ml-1 text-[11px] font-bold text-pedeja-600">Padrão</span>}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{a.addressLine1}{a.city ? `, ${a.city}` : ''}</p>
                </div>
                {selected === a.addressId && <Check className="w-5 h-5 text-pedeja-600" />}
              </button>
              <button onClick={() => makeDefault(a.addressId)} title="Definir padrão" className="text-xs font-bold text-pedeja-600 px-2 py-1">Padrão</button>
              <button onClick={() => remove(a.addressId)} title="Remover" className="p-2"><Trash2 className="w-4 h-4 text-gray-400" /></button>
            </div>
          ))}
        </div>
        {user && (
          <div className="mt-6 rounded-2xl border-2 border-gray-100 dark:border-gray-800 p-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Plus className="w-4 h-4" /> Nova morada</h2>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Etiqueta (Casa)" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none" />
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Cidade" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none" />
            </div>
            <input value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} placeholder="Rua, número, bairro" className="mt-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none" />
            <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="Província" className="mt-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none" />
            <button onClick={saveNew} disabled={saving || !user} className="mt-3 w-full bg-pedeja-600 text-white font-bold text-sm py-3 rounded-2xl disabled:opacity-40">
              {saving ? 'A guardar...' : 'Guardar morada'}
            </button>
          </div>
        )}
        <button
          onClick={confirm}
          disabled={!selected && addresses.length > 0}
          className="mt-6 w-full bg-pedeja-950 dark:bg-white dark:text-gray-900 text-white font-bold text-base py-4 rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-30"
        >
          Confirmar localização
        </button>
        <button onClick={() => navigate('home')} className="w-full text-pedeja-600 font-semibold text-sm py-3 mt-2">
          Saltar este passo
        </button>
      </div>
    </div>
  );
}
