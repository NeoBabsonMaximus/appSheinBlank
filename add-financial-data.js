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

async function addFinancialDataToPedidos() {
  const appId = 'dev-local-app-id';
  const userId = 'zpVKGnsFlGM3scVLT6GTSVQGjTr2';
  const phoneNumber = '4463139949';
  
  try {
    console.log('🔍 Buscando pedidos para agregar datos financieros...');
    
    // Buscar pedidos del cliente
    const pedidosRef = collection(db, `artifacts/${appId}/users/${userId}/pedidos`);
    const q = query(pedidosRef, where('numeroTelefono', '==', phoneNumber));
    const snapshot = await getDocs(q);
    
    console.log(`📦 Encontrados ${snapshot.docs.length} pedidos para actualizar`);
    
    for (const pedidoDoc of snapshot.docs) {
      const pedido = pedidoDoc.data();
      const pedidoId = pedidoDoc.id;
      
      // Calcular total del pedido
      let total = pedido.total || 0;
      if (total === 0 && pedido.productos) {
        total = pedido.productos.reduce((sum, producto) => {
          return sum + (producto.subtotal || (producto.precioUnitario * producto.cantidad) || 0);
        }, 0);
      }
      
      // Generar datos financieros de ejemplo basados en el estado del pedido
      let abonos = 0;
      
      switch (pedido.estado) {
        case 'Pendiente':
          abonos = 0; // Sin pagos
          break;
        case 'Confirmado':
          abonos = total * 0.5; // 50% abonado
          break;
        case 'Enviado':
          abonos = total * 0.8; // 80% abonado
          break;
        case 'Entregado':
          abonos = total; // Pagado completo
          break;
        case 'Cancelado':
          abonos = 0; // Sin pagos
          break;
        default:
          abonos = total * 0.3; // 30% abonado por defecto
      }
      
      // Actualizar el pedido con información financiera
      const updateData = {
        total: Number(total.toFixed(2)),
        abonos: Number(abonos.toFixed(2)),
        saldoPendiente: Number((total - abonos).toFixed(2)),
        ultimaActualizacionFinanciera: new Date()
      };
      
      await updateDoc(doc(db, `artifacts/${appId}/users/${userId}/pedidos`, pedidoId), updateData);
      
      console.log(`💰 Pedido ${pedidoId.slice(-6)} actualizado:`);
      console.log(`   Total: $${updateData.total}`);
      console.log(`   Abonos: $${updateData.abonos}`);
      console.log(`   Saldo: $${updateData.saldoPendiente}`);
      console.log(`   Estado: ${pedido.estado}`);
      console.log('');
    }
    
    console.log('✅ Todos los pedidos han sido actualizados con información financiera');
    
  } catch (error) {
    console.error('❌ Error actualizando datos financieros:', error);
  }
}

addFinancialDataToPedidos();
