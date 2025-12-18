import React, { useState } from 'react';
import { Order, ServiceType, OrderStatus } from '../types';
import { X, Save } from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    serviceType: ServiceType.CATERING,
    headcount: 0,
    eventDate: '',
    eventLocation: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      clientName: '',
      serviceType: ServiceType.CATERING,
      headcount: 0,
      eventDate: '',
      eventLocation: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Nuevo Pedido</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Cliente</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={formData.clientName}
              onChange={e => setFormData({...formData, clientName: e.target.value})}
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Servicio</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.serviceType}
                onChange={e => setFormData({...formData, serviceType: e.target.value as ServiceType})}
              >
                {Object.values(ServiceType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Personas</label>
              <input
                required
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.headcount || ''}
                onChange={e => setFormData({...formData, headcount: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha del Evento</label>
            <input
              required
              type="date"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.eventDate}
              onChange={e => setFormData({...formData, eventDate: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lugar del Evento</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.eventLocation}
              onChange={e => setFormData({...formData, eventLocation: e.target.value})}
              placeholder="Ej. Salón Los Olivos"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Save size={18} />
              Registrar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};