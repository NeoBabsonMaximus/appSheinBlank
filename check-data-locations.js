// Script para verificar datos en ambos APP_IDs
import pkg from './firebase-test-config.js';
const { db } = pkg;
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

const checkData = async () => {
  console.log('🔍 Verificando datos en ambas ubicaciones...\n');
  
  const userId = 'zpVKGnsFlGM3scVLT6GTSVQGjTr2';
  const appIds = ['dev-local-app-id', 'shein-blank-prod'];
  
  for (const appId of appIds) {
    console.log(`📂 Verificando APP_ID: ${appId}`);
    
    try {
      // Verificar pedidos
      const pedidosRef = collection(db, `artifacts/${appId}/users/${userId}/pedidos`);
      const pedidosSnapshot = await getDocs(pedidosRef);
      console.log(`  📦 Pedidos: ${pedidosSnapshot.size}`);
      
      if (pedidosSnapshot.size > 0) {
        console.log('  📝 Algunos pedidos:');
        pedidosSnapshot.docs.slice(0, 3).forEach(doc => {
          const data = doc.data();
          console.log(`    - ${doc.id}: ${data.nombreCliente || 'Sin nombre'} - ${data.estado || 'Sin estado'}`);
        });
      }
      
      // Verificar clientes
      const clientesRef = collection(db, `artifacts/${appId}/users/${userId}/clientes`);
      const clientesSnapshot = await getDocs(clientesRef);
      console.log(`  👤 Clientes: ${clientesSnapshot.size}`);
      
      // Verificar notificaciones
      const notificacionesRef = collection(db, `artifacts/${appId}/users/${userId}/notificaciones`);
      const notificacionesSnapshot = await getDocs(notificacionesRef);
      console.log(`  🔔 Notificaciones: ${notificacionesSnapshot.size}`);
      
      // Verificar productos
      const productosRef = collection(db, `artifacts/${appId}/users/${userId}/productos`);
      const productosSnapshot = await getDocs(productosRef);
      console.log(`  🛍️ Productos: ${productosSnapshot.size}`);
      
    } catch (error) {
      console.log(`  ❌ Error accediendo a ${appId}:`, error.message);
    }
    
    console.log('');
  }
};

checkData();
