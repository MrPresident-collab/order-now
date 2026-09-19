import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { useAuth } from '@/auth';
import { createCustomerEnviarShipment, getEnviarTracking, subscribeToEnviarTracking, type EnviarTracking } from '@/repositories/enviar';
import { getDefaultCustomerAddress, type CustomerAddress } from '@/repositories/addresses';
import { ChevronLeft, MapPin, Package, FileText, Box, HelpCircle, Bike } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingView, ErrorView } from '@/components/StateViews';

export function Enviar() {
  const { goBack, navigate, selectedShipmentId, setSelectedShipmentId } = useNav();
  const { user } = useAuth();
  const [type, setType] = useState<string | null>(null);
  const [destination, setDestination] = useState('');
  const [instructions, setInstructions] = useState('');
  const [tracking, setTracking] = useState<EnviarTracking | null>(null);
  const [pickupAddress, setPickupAddress] = useState<CustomerAddress | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('+244 ');
  const [recipientCity, setRecipientCity] = useState('Luanda');
  const [recipientProvince, setRecipientProvince] = useState('Luanda');
  const [recipientLatitude, setRecipientLatitude] = useState('');
  const [recipientLongitude, setRecipientLongitude] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [packageSize, setPackageSize] = useState('');
  const [fragile, setFragile] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [shipmentInput, setShipmentInput] = useState(selectedShipmentId ?? '');

  const types = [
    { id: 'documento', label: 'Documento', icon: FileText },
    { id: 'pequena', label: 'Pequena encomenda', icon: Package },
    { id: 'pacote', label: 'Pacote', icon: Box },
    { id: 'outro', label: 'Outro', icon: HelpCircle },
  ];

  const trackShipment = (id: string) => {
    if (!id.trim() || !user) return;
    setTrackLoading(true);
    setTrackError(null);
    getEnviarTracking(id.trim())
      .then((t) => {
        setTracking(t);
        if (t) setSelectedShipmentId(t.shipmentId);
      })
      .catch((e: Error) => setTrackError(e.message))
      .finally(() => setTrackLoading(false));
  };

  useEffect(() => {
    if (!user) return;
    getDefaultCustomerAddress().then(setPickupAddress).catch(() => setPickupAddress(null));
  }, [user]);

  const createShipment = async () => {
    setCreateError(null);
    if (!user) return setCreateError('Entra na conta para criar um envio.');
    if (!pickupAddress) return setCreateError('Adiciona uma morada de recolha antes de continuar.');
    if (!recipientName.trim() || recipientName.trim().length < 2) return setCreateError('Indica o nome de quem vai receber.');
    if (recipientPhone.replace(/\\D/g, '').length < 9) return setCreateError('Indica um telefone válido para o destinatário.');
    if (!destination.trim() || destination.trim().length < 2) return setCreateError('Indica a morada de destino.');
    if (!packageDescription.trim()) return setCreateError('Descreve brevemente o que vais enviar.');
    setCreating(true);
    try {
      const latitude = Number(recipientLatitude);
      const longitude = Number(recipientLongitude);
      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        throw new Error('Indica a localização do destinatário (latitude e longitude).');
      }
      const shipmentId = await createCustomerEnviarShipment({
        pickupAddressId: pickupAddress.addressId,
        recipientName,
        recipientPhone,
        recipientAddressLine1: destination,
        recipientCity,
        recipientProvince,
        recipientLatitude: latitude,
        recipientLongitude: longitude,
        packageDescription,
        packageSize,
        isFragile: fragile,
        customerNote: instructions,
      });
      setSelectedShipmentId(shipmentId);
      setShipmentInput(shipmentId);
      setCreateError(null);
      trackShipment(shipmentId);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Não foi possível criar o envio.');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (selectedShipmentId && user) trackShipment(selectedShipmentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShipmentId]);

  useEffect(() => {
    if (!selectedShipmentId) return;
    return subscribeToEnviarTracking(selectedShipmentId, () => trackShipment(selectedShipmentId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShipmentId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 safe-top sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="-ml-1 p-1 active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Enviar</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="px-5 pt-5">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">O que queres enviar?</h2>
        <div className="grid grid-cols-2 gap-3">
          {types.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setType(id)}
              className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-colors ${
                type === id
                  ? 'border-pedeja-600 bg-pedeja-50 dark:bg-pedeja-950/50'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
              }`}
            >
              <Icon className={`w-8 h-8 ${type === id ? 'text-pedeja-600' : 'text-gray-500 dark:text-gray-400'}`} />
              <span className={`text-sm font-medium ${type === id ? 'text-pedeja-700 dark:text-pedeja-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {type && (
        <div className="px-5 pt-6 animate-fade-in">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Recolha</h2>
          <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{pickupAddress?.label ?? 'Sem morada'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pickupAddress?.addressLine1 ?? 'Adiciona uma morada de recolha no Perfil.'}</p>
            {!pickupAddress && <button onClick={() => navigate('address')} className="mt-2 text-xs font-bold text-pedeja-600">Adicionar morada</button>}
          </div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 mt-5">Quem recebe?</h2>
          <div className="grid grid-cols-2 gap-3">
            <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Nome" className="bg-white dark:bg-gray-900 rounded-2xl p-4 text-sm shadow-sm outline-none" />
            <input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="Telefone" className="bg-white dark:bg-gray-900 rounded-2xl p-4 text-sm shadow-sm outline-none" />
          </div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 mt-5">Para onde?</h2>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Morada de destino"
            className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 text-sm shadow-sm outline-none"
          />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <input value={recipientCity} onChange={(e) => setRecipientCity(e.target.value)} placeholder="Cidade" className="bg-white dark:bg-gray-900 rounded-2xl p-4 text-sm shadow-sm outline-none" />
            <input value={recipientProvince} onChange={(e) => setRecipientProvince(e.target.value)} placeholder="Província" className="bg-white dark:bg-gray-900 rounded-2xl p-4 text-sm shadow-sm outline-none" />
          </div>
          <div className="mt-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Localização do destino</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">Obrigatória para o backend calcular a distância. Nesta versão, introduz as coordenadas do destino; o seletor de mapa será ligado depois.</p>
            <div className="grid grid-cols-2 gap-3">
              <input value={recipientLatitude} onChange={(e) => setRecipientLatitude(e.target.value)} inputMode="decimal" placeholder="Latitude" className="bg-gray-50 dark:bg-gray-950 rounded-xl p-3 text-sm outline-none" />
              <input value={recipientLongitude} onChange={(e) => setRecipientLongitude(e.target.value)} inputMode="decimal" placeholder="Longitude" className="bg-gray-50 dark:bg-gray-950 rounded-xl p-3 text-sm outline-none" />
            </div>
          </div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 mt-5">O que estás a enviar?</h2>
          <input value={packageDescription} onChange={(e) => setPackageDescription(e.target.value)} placeholder="Ex: documentos, roupa, pequeno pacote" className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 text-sm shadow-sm outline-none" />
          <input value={packageSize} onChange={(e) => setPackageSize(e.target.value)} placeholder="Tamanho / observação (opcional)" className="mt-3 w-full bg-white dark:bg-gray-900 rounded-2xl p-4 text-sm shadow-sm outline-none" />
          <label className="mt-3 flex items-center gap-3 rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm">
            <input type="checkbox" checked={fragile} onChange={(e) => setFragile(e.target.checked)} className="accent-pedeja-600" />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">É frágil</span>
          </label>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 mt-5">Instruções</h2>
          <input
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Detalhes do pacote"
            className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 text-sm shadow-sm outline-none"
          />
          {createError && <div className="mt-4"><ErrorView message={createError} /></div>}
          <button onClick={createShipment} disabled={creating} className="mt-4 w-full rounded-2xl bg-pedeja-600 py-4 text-sm font-bold text-white disabled:opacity-50">
            {creating ? 'A criar envio...' : 'Criar envio'}
          </button>
        </div>
      )}

      <div className="px-5 pt-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Bike className="w-4 h-4" /> Acompanhar envio existente
        </h2>
        {!user && <p className="text-xs text-gray-500">Entra na conta para acompanhar envios.</p>}
        {user && (
          <div className="flex gap-2">
            <input
              value={shipmentInput}
              onChange={(e) => setShipmentInput(e.target.value)}
              placeholder="ID do envio"
              className="flex-1 rounded-2xl bg-white dark:bg-gray-900 p-4 text-sm shadow-sm outline-none"
            />
            <button onClick={() => trackShipment(shipmentInput)} className="rounded-2xl bg-pedeja-600 px-4 text-sm font-bold text-white">
              Seguir
            </button>
          </div>
        )}
        {trackLoading && <div className="mt-3"><LoadingView message="A carregar envio..." /></div>}
        {trackError && <div className="mt-3"><ErrorView message={trackError} onRetry={() => trackShipment(shipmentInput)} /></div>}
        {tracking && (
          <div className="mt-3 rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm text-sm">
            <p className="font-bold">Envio {tracking.shipmentId}</p>
            <p className="text-gray-500">Estado: {tracking.status}</p>
            <p className="text-gray-500">Estafeta: {tracking.riderName ?? '—'}{tracking.riderPhone ? ` · ${tracking.riderPhone}` : ''}</p>
            <p className="text-gray-500">
              Viatura: {[tracking.vehicleMake, tracking.vehicleModel, tracking.vehicleRegistration].filter(Boolean).join(' ') || '—'}
            </p>
            {tracking.distanceKm != null && <p className="text-gray-500">Distância: {tracking.distanceKm} km</p>}
            <p className="mt-2 text-xs text-pedeja-600 font-bold">O acompanhamento actualiza automaticamente quando o backend emitir novos estados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
