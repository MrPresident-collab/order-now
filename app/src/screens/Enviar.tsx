import { useEffect, useState } from 'react';
import { useNav } from '@/nav';
import { useAuth } from '@/auth';
import { getEnviarTracking, subscribeToEnviarTracking, type EnviarTracking } from '@/repositories/enviar';
import { ChevronLeft, MapPin, Package, FileText, Box, HelpCircle, Bike } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingView, ErrorView } from '@/components/StateViews';

export function Enviar() {
  const { goBack, navigate, selectedShipmentId, setSelectedShipmentId } = useNav();
  const { user } = useAuth();
  const [type, setType] = useState<string | null>(null);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [instructions, setInstructions] = useState('');
  const [tracking, setTracking] = useState<EnviarTracking | null>(null);
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
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">De onde?</h2>
          <input
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Morada de recolha"
            className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 text-sm shadow-sm outline-none"
          />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 mt-5">Para onde?</h2>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Morada de destino"
            className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 text-sm shadow-sm outline-none"
          />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 mt-5">Instruções</h2>
          <input
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Detalhes do pacote"
            className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 text-sm shadow-sm outline-none"
          />
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
              Criação de Enviar ainda não ligada: o backend não expõe create_customer_enviar_shipment. Guarda estes dados e repete quando a RPC existir.
            </p>
          </div>
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
            <button onClick={() => navigate('tracking')} className="mt-2 flex items-center gap-2 text-pedeja-600 font-bold text-xs">
              <MapPin className="w-4 h-4" /> Abrir acompanhamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
