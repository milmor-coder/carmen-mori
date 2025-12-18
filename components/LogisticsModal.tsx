import React, { useState } from 'react';
import { Order, DeliveryData } from '../types';
import { X, Truck, CheckCircle, MapPin, Link as LinkIcon } from 'lucide-react';

interface LogisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirm: (orderId: string, deliveryData: DeliveryData) => void;
}

export const LogisticsModal: React.FC<LogisticsModalProps> = ({ isOpen, onClose, order, onConfirm }) => {
  const [proofUrl, setProofUrl] = useState('');

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const deliveryData: DeliveryData = {
      deliveryDate: new Date().toISOString(),
      proofUrl: proofUrl,
      itemsSnapshot: order.production?.items || []
    };

    onConfirm(order.id, deliveryData);
    setProofUrl('');
    onClose();
  };

  const items = order.production?.items || [];
  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-indigo-600 p-5 flex justify-between items-center">
          <div className="flex items-center gap-3 text-white">
            <Truck size={24} />
            <div>
              <h2 className="text-lg font-bold">Confirmar Entrega</h2>
              <p className="text-indigo-200 text-xs uppercase tracking-wider">Logística y Despacho</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Order Summary */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-indigo-900 text-lg">{order.clientName}</span>
                <span className="bg-white text-indigo-600 px-2 py-1 rounded text-xs font-bold shadow-sm border border-indigo-100">
                  #{order.id.slice(-6)}
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm text-indigo-700">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span>{order.eventLocation}</span>
              </div>
              <div className="mt-3 text-xs text-indigo-500">
                Fecha Automática: {new Date().toLocaleString()}
              </div>
            </div>

            {/* Items List (Read Only) */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Resumen de Carga ({totalItems} Unidades)</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="font-bold text-slate-900">{item.quantity} un.</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-sm">Sin items registrados en producción.</p>
                )}
              </div>
            </div>

            {/* Evidence Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Evidencia de Entrega
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="url"
                  placeholder="https://foto-evidencia.com/..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-1">
                Pega la URL de la foto o documento firmado (Opcional).
              </p>
            </div>
          </div>

          <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Confirmar Entrega
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};