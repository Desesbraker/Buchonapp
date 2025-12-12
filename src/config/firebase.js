/**
 * CONFIGURACIÓN DE FIREBASE - BuchonApp
 * 
 * Para sincronizar entre dispositivos:
 * 1. Ve a https://console.firebase.google.com
 * 2. Crea un nuevo proyecto (ej: "BuchonApp")
 * 3. Agrega una app Web (icono </>)
 * 4. Copia las credenciales aquí abajo
 * 5. En Firestore Database, crea una base de datos en modo "test"
 * 
 * ⚠️ IMPORTANTE: Reemplaza los valores de firebaseConfig con los tuyos
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

// =====================================================
// ⬇️ REEMPLAZA ESTOS VALORES CON TUS CREDENCIALES ⬇️
// =====================================================
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
// =====================================================

// Verificar si Firebase está configurado
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "TU_API_KEY_AQUI" && 
         firebaseConfig.projectId !== "tu-proyecto";
};

// Inicializar Firebase solo si está configurado
let app = null;
let db = null;

try {
  if (isFirebaseConfigured()) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase inicializado correctamente');
  } else {
    console.log('⚠️ Firebase no configurado - usando almacenamiento local');
  }
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error);
}

export { db, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy };
export default app;
