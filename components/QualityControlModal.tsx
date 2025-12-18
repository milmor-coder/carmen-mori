import React, { useState, useEffect } from 'react';
import { Order, ProductionItem } from '../types';
import { X, CheckCircle, Circle, Save, ClipboardCheck, AlertCircle } from 'lucide-react';

interface QualityControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSave: (orderId: string, items: ProductionItem[]) => void;
}

export const QualityControlModal: React.FC<QualityControlModalProps> = ({ isOpen, onClose, order, onSave }) => {
  const [items, setItems] = useState<ProductionItem[]>([]);

  useEffect(() => {
    if (order && order.production) {
      // Initialize with existing QC data or defaults
      setItems(order.production.items.map(item => ({
        ...item,
        qcApproved: item.qcApproved || false,
        qcNotes: item.qcNotes || ''
      })));
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const toggleApproval = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, qcApproved: !item.qcApproved } : item
    ));
  };

  const updateNotes = (id: string, notes: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, qcNotes: notes } : item
    ));
  };

  const handleSave = () => {
    onSave(order.id, items);
    onClose();
  };

  const approvedCount = items.filter(i => i.qcApproved).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;
  const isAllApproved = approvedCount === totalCount && totalCount > 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Control de Calidad</h2>
              <p className="text-sm text-slate-500">Pedido #{order.id.slice(-6)} - {order.clientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Progress Bar */}
          <div className="mb-8 bg-white p-4 border border-slate-100 rounded-xl shadow-sm">
             <div className="flex justify-between items-end mb-2">
               <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Progreso de Aprobación</span>
               <span className={`text-lg font-bold ${isAllApproved ? 'text-emerald-600' : 'text-blue-600'}`}>
                 {approvedCount}/{totalCount} Items
               </span>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
               <div 
                 className={`h-full transition-all duration-500 ease-out ${isAllApproved ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                 style={{ width: `${progress}%` }}
               ></div>
             </div>
             {isAllApproved && (
               <div className="mt-2 flex items-center gap-2 text-emerald-600 text-sm font-medium animate-pulse">
                 <CheckCircle size={16} />
                 <span>¡Todo aprobado! Listo para entrega.</span>
               </div>
             )}
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            {items.map(item => (
              <div 
                key={item.id} 
                className={`p-4 border rounded-lg transition-all ${
                  item.qcApproved 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => toggleApproval(item.id)}
                    className={`mt-1 flex-shrink-0 transition-transform active:scale-95 ${
                      item.qcApproved ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-400'
                    }`}
                  >
                    {item.qcApproved ? (
                      <CheckCircle size={28} className="fill-emerald-100" />
                    ) : (
                      <Circle size={28} />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-medium text-lg ${item.qcApproved ? 'text-emerald-900' : 'text-slate-800'}`}>
                          {item.name}
                        </h3>
                        <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-semibold mt-1">
                          Cantidad: {item.quantity}
                        </span>
                      </div>
                      {item.qcApproved && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                          APROBADO
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <label className="text-xs font-semibold text-slate-500 mb-1 block uppercase">Observaciones / Detalles</label>
                      <input 
                        type="text"
                        value={item.qcNotes || ''}
                        onChange={(e) => updateNotes(item.id, e.target.value)}
                        placeholder="Escribe observaciones aquí..."
                        className={`w-full text-sm px-3 py-2 border rounded-md outline-none focus:ring-1 ${
                          item.qcApproved 
                            ? 'bg-white border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500' 
                            : 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-between items-center">
          <div className="text-xs text-slate-400">
             Fecha de revisión: {new Date().toLocaleDateString()}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm hover:shadow-emerald-200 transition-all flex items-center gap-2"
            >
              <Save size={18} />
              Guardar Control
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};