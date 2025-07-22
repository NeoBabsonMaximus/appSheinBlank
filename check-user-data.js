// Script para verificar el usuario específico
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA18hvrsBazGjX2iAIKJKRPfofJy81jdC0",
  authDomain: "appsheinblank.firebaseapp.com",
  projectId: "appsheinblank",
  storageBucket: "appsheinblank.firebasestorage.app",
  messagingSenderId: "209741152261",
  appId: "1:209741152261:web:aa475aceb2f64b61b69c6c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const checkSpecificUser = async () => {
  console.log('🔍 Verificando usuario específico...');
  
  const userId = 'zpVKGnsFlGM3scVLT6GTSVQGjTr2';
  const appId = 'dev-local-app-id';
  
  try {
    // Verificar pedidos
    console.log('📦 Verificando pedidos...');
    const pedidosRef = collection(db, `artifacts/${appId}/users/${userId}/pedidos`);
    const pedidosSnapshot = await getDocs(pedidosRef);
    console.log(`Pedidos encontrados: ${pedidosSnapshot.size}`);
    
    pedidosSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- Pedido ${doc.id}: ${data.nombreCliente || 'Sin nombre'} - Estado: ${data.estado || 'N/A'}`);
    });
    
    // Verificar clientes
    console.log('👤 Verificando clientes...');
    const clientesRef = collection(db, `artifacts/${appId}/users/${userId}/clientes`);
    const clientesSnapshot = await getDocs(clientesRef);
    console.log(`Clientes encontrados: ${clientesSnapshot.size}`);
    
    clientesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- Cliente ${doc.id}: ${data.nombre || 'Sin nombre'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

checkSpecificUser();
