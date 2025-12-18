import { db, isConfigured } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Order } from '../types';

const COLLECTION_NAME = 'orders';
const LOCAL_STORAGE_KEY = 'eventmaster_orders';

// Tipo para la función de suscripción
type Unsubscribe = () => void;
type OrdersCallback = (orders: Order[]) => void;

/**
 * Suscribe a los cambios en la lista de pedidos.
 * Funciona tanto para Firebase (tiempo real) como para LocalStorage (carga inicial).
 */
export const subscribeToOrders = (callback: OrdersCallback): Unsubscribe => {
  if (isConfigured && db) {
    // --- MODO NUBE (FIREBASE) ---
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((doc) => {
        orders.push(doc.data() as Order);
      });
      callback(orders);
    }, (error) => {
      console.error("Error escuchando pedidos de Firebase:", error);
      // Fallback silencioso o manejo de errores
    });

    return unsubscribe;

  } else {
    // --- MODO LOCAL (LOCALSTORAGE) ---
    // Carga inicial
    const loadLocal = () => {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          callback(JSON.parse(stored));
        } else {
          callback([]);
        }
      } catch (e) {
        console.error("Error leyendo LocalStorage", e);
        callback([]);
      }
    };

    loadLocal();
    
    // En modo local no tenemos "realtime" real entre pestañas sin listeners complejos,
    // pero para este MVP simplemente retornamos una función vacía.
    return () => {};
  }
};

/**
 * Guarda o actualiza un pedido completo
 */
export const saveOrder = async (order: Order): Promise<void> => {
  if (isConfigured && db) {
    // Firebase
    try {
      await setDoc(doc(db, COLLECTION_NAME, order.id), order);
    } catch (e) {
      console.error("Error guardando en Firebase", e);
      throw e;
    }
  } else {
    // LocalStorage
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const orders: Order[] = stored ? JSON.parse(stored) : [];
    
    const existingIndex = orders.findIndex(o => o.id === order.id);
    if (existingIndex >= 0) {
      orders[existingIndex] = order;
    } else {
      orders.unshift(order); // Add new at start
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
    
    // Forzamos una recarga "manual" simulando el evento para que la UI se actualice
    // En una app real usaríamos un Context o Redux, pero aquí el subscribe local es simple.
    // Hack simple: despachamos un evento custom si fuera necesario, 
    // pero la App.tsx actualiza su estado local optimísticamente o recarga.
    // Dado que App.tsx usa el subscribe, para local storage necesitamos que 
    // App.tsx refresque. Veremos cómo lo maneja App.tsx.
  }
};