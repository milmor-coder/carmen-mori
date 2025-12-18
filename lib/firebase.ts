import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// --------------------------------------------------------
// CONFIGURACIÓN DE FIREBASE
// --------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyBvTqO0OAtd4oMH-3Kyo83jT7xl8m66M3Y",
  authDomain: "eventmaster-pro-c8be1.firebaseapp.com",
  projectId: "eventmaster-pro-c8be1",
  storageBucket: "eventmaster-pro-c8be1.firebasestorage.app",
  messagingSenderId: "182551851402",
  appId: "1:182551851402:web:9ea7b312a31463c4619873"
};

// Validamos si la configuración es la real
// (La API Key de ejemplo solía ser "TU_API_KEY_AQUI")
const isConfigured = firebaseConfig.apiKey !== "TU_API_KEY_AQUI";

let db = null;
let app = null;
let auth = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('Firebase conectado correctamente');
  } catch (error) {
    console.error('Error inicializando Firebase:', error);
  }
} else {
  console.log('Firebase no configurado. Usando modo LocalStorage.');
}

export { db, auth, isConfigured };