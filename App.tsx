import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, ProductionItem, DeliveryData, ServiceType } from './types';
import { OrderModal } from './components/OrderModal';
import { ProductionModal } from './components/ProductionModal';
import { QualityControlModal } from './components/QualityControlModal';
import { LogisticsModal } from './components/LogisticsModal';
import { LoginPage } from './components/LoginPage';
import { 
  generateOrderReport, 
  generateProductionReport, 
  generateQualityControlReport,
  generateLogisticsReport
} from './services/reportGenerator';
import { subscribeToOrders, saveOrder } from './services/storage';
import { isConfigured as isCloudConfigured, auth } from './lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { 
  ClipboardList, 
  Factory, 
  Plus, 
  Printer, 
  Calendar, 
  MapPin, 
  Users, 
  ChefHat, 
  Edit3,
  Search,
  ClipboardCheck,
  CheckCircle,
  Truck,
  PackageCheck,
  History,
  AlertCircle,
  CloudOff,
  Wifi,
  LogOut,
  LayoutDashboard
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'production' | 'logistics'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingProductionOrder, setEditingProductionOrder] = useState<Order | null>(null);
  const [editingQcOrder, setEditingQcOrder] = useState<Order | null>(null);
  const [deliveringOrder, setDeliveringOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isCloudConfigured && auth) {
      const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      });
      return () => unsubscribeAuth();
    } else {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isCloudConfigured || (isCloudConfigured && user)) {
      const unsubscribeOrders = subscribeToOrders((newOrders) => {
        setOrders(newOrders);
      });
      return () => unsubscribeOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  const handleLogout = async () => {
    if (auth) await signOut(auth);
  };

  const handleCreateOrder = async (newOrderData: any) => {
    const order: Order = {
      ...newOrderData,
      id: `ORD-${Date.now()}`,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      production: {
        items: [],
        startDate: null
      }
    };
    
    if (!isCloudConfigured) {
        setOrders(prev => [order, ...prev]);
    }
    await saveOrder(order);
  };

  const handleSaveProduction = async (orderId: string, items: ProductionItem[]) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    const isFirstProduction = !orderToUpdate.production?.startDate;
    const updatedOrder: Order = {
      ...orderToUpdate,
      status: OrderStatus.IN_PRODUCTION,
      production: {
        ...orderToUpdate.production,
        items,
        startDate: isFirstProduction ? new Date().toISOString() : orderToUpdate.production!.startDate
      }
    };

    if (!isCloudConfigured) {
       setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    }
    await saveOrder(updatedOrder);
  };

  const handleSaveQualityControl = async (orderId: string, items: ProductionItem[]) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    const updatedOrder: Order = {
      ...orderToUpdate,
      production: {
        ...orderToUpdate.production!,
        items,
        lastQcDate: new Date().toISOString()
      }
    };

    if (!isCloudConfigured) {
        setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    }
    await saveOrder(updatedOrder);
  };

  const handleConfirmDelivery = async (orderId: string, deliveryData: DeliveryData) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    const updatedOrder: Order = {
      ...orderToUpdate,
      status: OrderStatus.DELIVERED,
      delivery: deliveryData
    };

    if (!isCloudConfigured) {
        setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    }
    await saveOrder(updatedOrder);
  };

  const filteredOrders = orders.filter(o => 
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatusBadge = ({ status }: { status: OrderStatus }) => {
    const styles = {
      [OrderStatus.PENDING]: 'bg-slate-100 text-slate-600 border-slate-200',
      [OrderStatus.IN_PRODUCTION]: 'bg-amber-50 text-amber-700 border-amber-200',
      [OrderStatus.DELIVERED]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      [OrderStatus.COMPLETED]: 'bg-green-50 text-green-700 border-green-200'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 font-medium animate-pulse">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  if (isCloudConfigured && !user) return <LoginPage />;

  const renderOrdersView = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative w-full md:w-96">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text" 
             placeholder="Buscar por cliente o número de orden..." 
             className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => generateOrderReport(orders)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-all active:scale-95"
          >
            <Printer size={18} />
            <span>Exportar</span>
          </button>
          <button 
            onClick={() => setIsOrderModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Nuevo Pedido</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300">
            <ClipboardList size={64} className="mb-4 opacity-20" />
            <p className="font-medium">No se encontraron pedidos registrados.</p>
            <button 
              onClick={() => setIsOrderModalOpen(true)}
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              Crea tu primer pedido aquí
            </button>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all group cursor-default">
              <div className="p-6 border-b border-slate-50 bg-gradient-to-r from-transparent to-slate-50/50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 truncate pr-2 group-hover:text-blue-600 transition-colors">
                      {order.clientName}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase mt-0.5">ID: {order.id}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              </div>
              <div className="p-6 space-y-4">
                 <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2 rounded-xl">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm text-blue-500">
                      <Calendar size={16} />
                    </div>
                    <span className="font-medium">{new Date(order.eventDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-slate-600 px-2">
                    <MapPin size={16} className="text-rose-500" />
                    <span className="truncate">{order.eventLocation}</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-slate-600 px-2">
                    <Users size={16} className="text-indigo-500" />
                    <span className="font-medium">{order.headcount} personas <span className="text-slate-400 font-normal">({order.serviceType})</span></span>
                 </div>
              </div>
              <div className="px-6 pb-6">
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div className={`h-full ${order.status === OrderStatus.PENDING ? 'w-1/4 bg-slate-300' : order.status === OrderStatus.IN_PRODUCTION ? 'w-2/4 bg-amber-400' : 'w-full bg-green-500'}`}></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderProductionView = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-xl">
              <Factory size={24} />
            </div>
            <h2 className="font-bold text-slate-800 text-lg">Módulo de Producción</h2>
          </div>
          <button 
            onClick={() => generateProductionReport(orders)}
            className="flex items-center gap-2 px-5 py-2.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-all"
          >
            <Printer size={18} />
            <span className="hidden sm:inline">Reporte Producción</span>
          </button>
       </div>

       <div className="space-y-4">
         {filteredOrders.filter(o => o.status !== OrderStatus.DELIVERED).length === 0 ? (
           <div className="text-center py-24 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300">
              <ChefHat size={64} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">No hay pedidos pendientes de producción.</p>
           </div>
         ) : (
           filteredOrders.filter(o => o.status !== OrderStatus.DELIVERED).map(order => {
             const hasBreakdown = order.production && order.production.items.length > 0;
             const approvedItems = order.production?.items.filter(i => i.qcApproved).length || 0;
             const qcTotalItems = order.production?.items.length || 0;
             const isFullyApproved = qcTotalItems > 0 && approvedItems === qcTotalItems;

             return (
               <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-blue-100 transition-all">
                  <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-50">
                     <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${hasBreakdown ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                           <ChefHat size={28} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 flex flex-wrap items-center gap-2">
                            {order.clientName}
                            {isFullyApproved && hasBreakdown && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                                <CheckCircle size={10} /> QC OK
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                             <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">{order.serviceType}</span>
                             <span>•</span>
                             <span>{new Date(order.eventDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                     </div>
                     
                     <div className="flex flex-wrap items-center gap-3">
                        {hasBreakdown && (
                           <>
                              <button 
                                onClick={() => setEditingQcOrder(order)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                                    isFullyApproved 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100'
                                }`}
                              >
                                <ClipboardCheck size={16} />
                                {isFullyApproved ? 'QC Completado' : 'Control de Calidad'}
                              </button>
                           </>
                        )}
                        <button 
                          onClick={() => setEditingProductionOrder(order)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                            hasBreakdown 
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100'
                          }`}
                        >
                          {hasBreakdown ? <Edit3 size={16} /> : <Plus size={16} />}
                          {hasBreakdown ? 'Editar Producción' : 'Agregar Desglose'}
                        </button>
                     </div>
                  </div>

                  {hasBreakdown && (
                    <div className="bg-slate-50/50 p-6 border-t border-slate-50">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {order.production!.items.map(item => (
                           <div key={item.id} className={`border px-3 py-2.5 rounded-xl text-xs flex justify-between items-center shadow-sm ${item.qcApproved ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200'}`}>
                              <span className={`truncate mr-2 flex items-center gap-1.5 font-medium ${item.qcApproved ? 'text-emerald-800' : 'text-slate-600'}`}>
                                 {item.qcApproved && <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />}
                                 {item.name}
                              </span>
                              <span className={`font-bold px-2 py-1 rounded-lg text-[10px] ${item.qcApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>{item.quantity}</span>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}
               </div>
             );
           })
         )}
       </div>
    </div>
  );

  const renderLogisticsView = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
         <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
              <Truck size={24} />
            </div>
            <h2 className="font-bold text-slate-800 text-lg">Centro de Logística</h2>
         </div>
         <button 
            onClick={() => generateLogisticsReport(orders)}
            className="flex items-center gap-2 px-5 py-2.5 text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-xl font-bold text-sm transition-all"
          >
            <Printer size={18} />
            <span>Reporte Entregas</span>
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 px-2">
             <PackageCheck size={18} className="text-indigo-500" /> Pendientes de Envío
           </h3>
           <div className="space-y-4">
              {orders.filter(o => o.status !== OrderStatus.DELIVERED && o.production?.items.length).length === 0 ? (
                <div className="py-16 text-center text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">
                  No hay pedidos listos para envío.
                </div>
              ) : (
                orders.filter(o => o.status !== OrderStatus.DELIVERED && o.production?.items.length).map(order => (
                   <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                      <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                         <span className="font-bold text-slate-800">{order.clientName}</span>
                         <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-slate-500">#{order.id.slice(-6)}</span>
                      </div>
                      <div className="p-5 flex justify-between items-center">
                        <div className="space-y-2">
                          <div className="text-xs flex items-start gap-2 text-slate-600">
                             <MapPin size={14} className="text-indigo-500 mt-0.5" />
                             {order.eventLocation}
                          </div>
                          <div className="text-xs flex items-center gap-2 text-slate-600">
                             <Calendar size={14} className="text-indigo-500" />
                             {new Date(order.eventDate).toLocaleDateString()}
                          </div>
                        </div>
                        <button 
                          onClick={() => setDeliveringOrder(order)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 text-xs active:scale-95"
                        >
                          <Truck size={16} />
                          Enviar
                        </button>
                      </div>
                   </div>
                ))
              )}
           </div>
        </div>

        <div>
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 px-2">
             <History size={18} className="text-slate-400" /> Historial Reciente
           </h3>
           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
             {orders.filter(o => o.status === OrderStatus.DELIVERED).length === 0 ? (
                <div className="p-16 text-center text-slate-400 font-medium">Sin historial de entregas.</div>
             ) : (
                <div className="divide-y divide-slate-100">
                  {orders.filter(o => o.status === OrderStatus.DELIVERED).slice(0, 5).map(order => (
                    <div key={order.id} className="p-5 hover:bg-slate-50 transition-colors flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{order.clientName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Entregado el {new Date(order.delivery?.deliveryDate || '').toLocaleDateString()}</div>
                      </div>
                      <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        Completado
                      </div>
                    </div>
                  ))}
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-2.5 rounded-2xl shadow-xl shadow-blue-200">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent hidden sm:block leading-none">
                EventMaster
              </h1>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1 hidden sm:block">Enterprise Manager</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="flex space-x-1 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <ClipboardList size={16} />
                  <span className="hidden md:inline">Pedidos</span>
                </button>
                <button
                  onClick={() => setActiveTab('production')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'production' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Factory size={16} />
                  <span className="hidden md:inline">Producción</span>
                </button>
                <button
                  onClick={() => setActiveTab('logistics')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'logistics' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Truck size={16} />
                  <span className="hidden md:inline">Logística</span>
                </button>
            </nav>

            {isCloudConfigured && user && (
              <button 
                onClick={handleLogout}
                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                title="Cerrar Sesión"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'orders' && renderOrdersView()}
        {activeTab === 'production' && renderProductionView()}
        {activeTab === 'logistics' && renderLogisticsView()}
      </main>

      <OrderModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} onSave={handleCreateOrder} />
      <ProductionModal isOpen={!!editingProductionOrder} order={editingProductionOrder} onClose={() => setEditingProductionOrder(null)} onSave={handleSaveProduction} />
      <QualityControlModal isOpen={!!editingQcOrder} order={editingQcOrder} onClose={() => setEditingQcOrder(null)} onSave={handleSaveQualityControl} />
      <LogisticsModal isOpen={!!deliveringOrder} order={deliveringOrder} onClose={() => setDeliveringOrder(null)} onConfirm={handleConfirmDelivery} />
    </div>
  );
};

export default App;