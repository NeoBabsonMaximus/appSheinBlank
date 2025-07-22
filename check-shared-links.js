import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA18hvrsBazGjX2iAIKJKRPfofJy81jdC0",
  authDomain: "appsheinblank.firebaseapp.com",
  projectId: "appsheinblank",
  storageBucket: "appsheinblank.firebasestorage.app",
  messagingSenderId: "209741152261",
  appId: "1:209741152261:web:aa475aceb2f64b61b69c6c",
  measurementId: "G-JQ7Q9MBHPE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const userId = 'zpVKGnsFlGM3scVLT6GTSVQGjTr2'; // El userId real usado en la app
const appId = 'dev-local-app-id';

console.log('🔍 Verificando enlaces compartidos...');

async function checkSharedPedidos() {
  try {
    // Path donde se guardan los pedidos compartidos según el código
    const sharedPath = `artifacts/${appId}/public/data/sharedPedidos`;
    console.log(`📂 Verificando path: ${sharedPath}`);
    
    const sharedRef = collection(db, sharedPath);
    const sharedSnapshot = await getDocs(sharedRef);
    
    console.log(`📊 Pedidos compartidos encontrados: ${sharedSnapshot.size}`);
    
    if (sharedSnapshot.size > 0) {
      sharedSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`🔗 Enlace compartido:`, {
          id: doc.id,
          token: data.shareableLinkToken,
          cliente: data.nombreCliente,
          originalId: data.originalPedidoId
        });
      });
    }
    
    // Verificar también pedidos normales con tokens
    const pedidosPath = `artifacts/${appId}/users/${userId}/pedidos`;
    console.log(`📂 Verificando pedidos con tokens en: ${pedidosPath}`);
    
    const pedidosRef = collection(db, pedidosPath);
    const pedidosSnapshot = await getDocs(pedidosRef);
    
    console.log(`📊 Pedidos normales encontrados: ${pedidosSnapshot.size}`);
    
    pedidosSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.shareableLinkToken) {
        console.log(`🔗 Pedido con token:`, {
          id: doc.id,
          token: data.shareableLinkToken,
          cliente: data.nombreCliente
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

await checkSharedPedidos();
