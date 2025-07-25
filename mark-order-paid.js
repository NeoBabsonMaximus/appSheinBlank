const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDocs, collection, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyA18hvrsBazGjX2iAIKJKRPfofJy81jdC0",
  authDomain: "appsheinblank.firebaseapp.com",
  projectId: "appsheinblank",
  storageBucket: "appsheinblank.firebasestorage.app",
  messagingSenderId: "209741152261",
  appId: "1:209741152261:web:5c8e24c8f5b8b8f5a8b8b8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function markOrderAsPaid() {
  const appId = 'dev-local-app-id';
  const userId = 'zpVKGnsFlGM3scVLT6GTSVQGjTr2';
  const phoneNumber = '4463139949';
  
  try {
    console.log('🔍 Buscando pedido para marcar como pagado...');
    
    // Buscar el pedido específico
    const pedidosRef = collection(db, `artifacts/${appId}/users/${userId}/pedidos`);
    const q = query(pedidosRef, where('numeroTelefono', '==', phoneNumber));
    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length === 0) {
      console.log('❌ No se encontró ningún pedido');
      return;
    }
    
    for (const pedidoDoc of snapshot.docs) {
      const pedido = pedidoDoc.data();
      const pedidoId = pedidoDoc.id;
      
      console.log(`📦 Procesando pedido ${pedidoId.slice(-6)}`);
      console.log(`   Estado actual: ${pedido.estado}`);
      console.log(`   Total actual: $${pedido.total || 'no definido'}`);
      console.log(`   Abonos actuales: $${pedido.abonos || 'no definido'}`);
      
      // Marcar como completamente pagado
      const total = pedido.total || 408; // Usar 408 como se ve en las imágenes
      
      const updateData = {
        total: total,
        abonos: total, // Abonos = total (pagado completo)
        saldoPendiente: 0, // Sin saldo pendiente
        estado: 'Entregado', // Cambiar estado a entregado ya que está pagado
        ultimaActualizacionFinanciera: new Date(),
        estadoPago: 'pagado'
      };
      
      await updateDoc(doc(db, `artifacts/${appId}/users/${userId}/pedidos`, pedidoId), updateData);
      
      console.log(`✅ Pedido ${pedidoId.slice(-6)} marcado como pagado completo:`);
      console.log(`   Total: $${updateData.total}`);
      console.log(`   Abonos: $${updateData.abonos}`);
      console.log(`   Saldo: $${updateData.saldoPendiente}`);
      console.log(`   Estado: ${updateData.estado}`);
    }
    
    console.log('🎉 Pedido actualizado correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

markOrderAsPaid();
