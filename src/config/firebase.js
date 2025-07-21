// Firebase Configuration and Initialization (Model Layer)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration as specified in requirements
const firebaseConfig = {
  apiKey: "AIzaSyA18hvrsBazGjX2iAIKJKRPfofJy81jdC0",
  authDomain: "appsheinblank.firebaseapp.com",
  projectId: "appsheinblank",
  storageBucket: "appsheinblank.firebasestorage.app",
  messagingSenderId: "209741152261",
  appId: "1:209741152261:web:aa475aceb2f64b61b69c6c",
  measurementId: "G-JQ7Q9MBHPE"
};

console.log('🔥 Inicializando Firebase con configuración:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('🔥 Firebase inicializado correctamente');
console.log('🔑 Auth:', auth);
console.log('🗄️ Database:', db);

// Solo inicializar Analytics si estamos en el navegador
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
    console.log('📊 Analytics inicializado:', analytics);
  } catch (error) {
    console.warn('⚠️ No se pudo inicializar Analytics:', error);
  }
}

export { analytics };
export default app;
