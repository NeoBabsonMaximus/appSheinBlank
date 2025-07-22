// Script para listar todos los datos en Firebase
import pkg from './firebase-test-config.js';
const { db } = pkg;
import { collection, getDocs } from 'firebase/firestore';

const listAllData = async () => {
  console.log('🔍 Listando todos los datos en Firebase...');
  
  try {
    // Listar todas las colecciones en artifacts/dev-local-app-id/users/
    const usersPath = 'artifacts/dev-local-app-id/users';
    const usersSnapshot = await getDocs(collection(db, usersPath));
    
    console.log('👥 Usuarios encontrados:');
    for (const userDoc of usersSnapshot.docs) {
      console.log(`📁 User ID: ${userDoc.id}`);
      
      // Verificar pedidos para este usuario
      try {
        const pedidosSnapshot = await getDocs(collection(db, `${usersPath}/${userDoc.id}/pedidos`));
        console.log(`  📦 Pedidos: ${pedidosSnapshot.size}`);
        
        // Listar algunos pedidos
        pedidosSnapshot.docs.slice(0, 3).forEach(pedidoDoc => {
          const data = pedidoDoc.data();
          console.log(`    - ${pedidoDoc.id}: ${data.nombreCliente || 'Sin nombre'}`);
        });
      } catch (e) {
        console.log(`  📦 Pedidos: Error accediendo (${e.message})`);
      }
      
      // Verificar clientes para este usuario
      try {
        const clientesSnapshot = await getDocs(collection(db, `${usersPath}/${userDoc.id}/clientes`));
        console.log(`  👤 Clientes: ${clientesSnapshot.size}`);
      } catch (e) {
        console.log(`  👤 Clientes: Error accediendo (${e.message})`);
      }
      
      // Verificar notificaciones para este usuario
      try {
        const notificacionesSnapshot = await getDocs(collection(db, `${usersPath}/${userDoc.id}/notificaciones`));
        console.log(`  🔔 Notificaciones: ${notificacionesSnapshot.size}`);
      } catch (e) {
        console.log(`  🔔 Notificaciones: Error accediendo (${e.message})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error listando datos:', error);
  }
};

// Ejecutar
listAllData();
