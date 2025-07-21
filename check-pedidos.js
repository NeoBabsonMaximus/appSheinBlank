// Script para verificar pedidos en Firebase
import { db } from './src/config/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

const checkPedidos = async () => {
  console.log('🔍 Verificando pedidos en Firebase...');
  
  try {
    // Verificar diferentes posibles ubicaciones
    const paths = [
      'artifacts/shein-app/users/demo-user/pedidos',
      'artifacts/default-app-id/users/demo-user/pedidos',
      'pedidos',
    ];

    for (const path of paths) {
      console.log(`📂 Verificando path: ${path}`);
      try {
        const querySnapshot = await getDocs(collection(db, path));
        console.log(`📊 Encontrados ${querySnapshot.size} pedidos en ${path}`);
        
        if (querySnapshot.size > 0) {
          querySnapshot.forEach((doc) => {
            console.log('📋 Pedido:', doc.id, '=>', doc.data());
          });
        }
      } catch (error) {
        console.log(`❌ Error en path ${path}:`, error.message);
      }
    }

    // También verificar usuarios existentes
    console.log('\n🔍 Verificando usuarios...');
    try {
      const usersSnapshot = await getDocs(collection(db, 'artifacts/shein-app/users'));
      console.log(`👥 Usuarios encontrados: ${usersSnapshot.size}`);
      usersSnapshot.forEach((doc) => {
        console.log('👤 Usuario:', doc.id);
      });
    } catch (error) {
      console.log('❌ Error verificando usuarios:', error.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
};

// Ejecutar
checkPedidos();
