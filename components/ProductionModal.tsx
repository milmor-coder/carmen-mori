import React, { useState, useEffect } from 'react';
import { Order, ProductionItem, OrderStatus } from '../types';
import { X, Plus, Trash2, Calculator, CheckCircle } from 'lucide-react';

interface ProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSave: (orderId: string, items: ProductionItem[]) => void;
}

export const ProductionModal: React.FC<ProductionModalProps> = ({ isOpen, onClose, order, onSave }) => {
  const [items, setItems] = useState<ProductionItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState<number | ''>('');

  useEffect(() => {
    if (order && order.production) {
      setItems(order.production.items);
    } else {
      setItems([]);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemQty) return;

    const newItem: ProductionItem = {
      id: Date.now().toString(),
      name: newItemName,
      quantity: Number(newItemQty)
    };

    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemQty('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSave = () => {
    onSave(order.id, items);
    onClose();
  };

  const totalUnits = items.reduce((acc, curr) => acc + curr.quantity, 0);
  // Simple visual check if we match headcount (not a hard constraint, just UX feedback)
  const isMatch = totalUnits >= order.headcount;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Gestión de Producción</h2>
            <p className="text-sm text-slate-500">Pedido #{order.id.slice(-6)} - {order.clientName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Order Context */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 flex justify-between items-center">
            <div>
               <span className="block text-xs font-bold text-blue-600 uppercase tracking-wider">Meta del Evento</span>
               <span className="text-lg font-medium text-slate-800">{order.headcount} Personas</span>
            </div>
            <div className="text-right">
               <span className="block text-xs font-bold text-blue-600 uppercase tracking-wider">Total Actual</span>
               <div className={`text-2xl font-bold ${isMatch ? 'text-green-600' : 'text-orange-500'} flex items-center justify-end gap-2`}>
                 {totalUnits} Unidades
                 {isMatch && <CheckCircle size={20} />}
               </div>
            </div>
          </div>

          {/* Add Item Form */}
          <form onSubmit={handleAddItem} className="flex gap-3 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
            <div className="flex-1">
              <input
                autoFocus
                type="text"
                placeholder="Nombre del producto (ej. Bocaditos salados)"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
              />
            </div>
            <div className="w-28">
              <input
                type="number"
                min="1"
                placeholder="Cant."
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                value={newItemQty}
                onChange={e => setNewItemQty(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <button
              type="submit"
              disabled={!newItemName || !newItemQty}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 rounded-md flex items-center transition-colors"
            >
              <Plus size={20} />
            </button>
          </form>

          {/* List */}
          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="text-center py-10 text-slate-400 italic">
                No hay items en el desglose. Agrega productos arriba.
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow group">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold text-sm">
                      {item.quantity} un.
                    </span>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={items.length === 0}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <Calculator size={18} />
            Guardar Desglose
          </button>
        </div>
      </div>
    </div>
  );
};