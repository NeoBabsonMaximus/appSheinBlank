// Script para buscar un número de teléfono específico
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

const searchPhoneNumber = async () => {
  console.log('🔍 Buscando número de teléfono: 4463139949...');
  
  const phoneNumber = '4463139949';
  const userId = 'zpVKGnsFlGM3scVLT6GTSVQGjTr2';
  const appId = 'dev-local-app-id';
  
  try {
    // Buscar en pedidos por numeroTelefono
    console.log('📦 Buscando en pedidos...');
    const pedidosRef = collection(db, `artifacts/${appId}/users/${userId}/pedidos`);
    const pedidosQuery = query(pedidosRef, where('numeroTelefono', '==', phoneNumber));
    const pedidosSnapshot = await getDocs(pedidosQuery);
    
    console.log(`Pedidos encontrados con número ${phoneNumber}: ${pedidosSnapshot.size}`);
    
    pedidosSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('✅ Pedido encontrado:');
      console.log(`  - ID: ${doc.id}`);
      console.log(`  - Nombre: ${data.nombreCliente}`);
      console.log(`  - Teléfono: ${data.numeroTelefono}`);
      console.log(`  - Estado: ${data.estado}`);
      console.log(`  - Total: $${data.total}`);
      console.log(`  - Productos:`, data.productos);
    });
    
    // También buscar en clientes
    console.log('👤 Buscando en clientes...');
    const clientesRef = collection(db, `artifacts/${appId}/users/${userId}/clientes`);
    const clientesQuery = query(clientesRef, where('numeroTelefono', '==', phoneNumber));
    const clientesSnapshot = await getDocs(clientesQuery);
    
    console.log(`Clientes encontrados con número ${phoneNumber}: ${clientesSnapshot.size}`);
    
    clientesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('✅ Cliente encontrado:');
      console.log(`  - ID: ${doc.id}`);
      console.log(`  - Nombre: ${data.nombre}`);
      console.log(`  - Teléfono: ${data.numeroTelefono}`);
    });
    
    // Si no encontramos nada, vamos a buscar en todos los pedidos para ver si existe
    if (pedidosSnapshot.size === 0) {
      console.log('❌ No se encontraron pedidos. Verificando todos los pedidos...');
      const allPedidosSnapshot = await getDocs(pedidosRef);
      
      console.log(`Total de pedidos en la colección: ${allPedidosSnapshot.size}`);
      
      allPedidosSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.numeroTelefono) {
          console.log(`- Pedido ${doc.id}: Teléfono: ${data.numeroTelefono}, Cliente: ${data.nombreCliente}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

searchPhoneNumber();
