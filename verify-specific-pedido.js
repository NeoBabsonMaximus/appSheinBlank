// Verificación directa del pedido específico
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

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

const verifySpecificPedido = async () => {
  console.log('🎯 Verificando pedido específico...');
  
  const pedidoPath = 'artifacts/dev-local-app-id/users/zpVKGnsFlGM3scVLT6GTSVQGjTr2/pedidos/8l4Avz2Rzhpzd4DD9BGs';
  
  try {
    // 1. Verificar el pedido directamente por su ID
    console.log('📍 Accediendo directamente al pedido...');
    const pedidoRef = doc(db, pedidoPath);
    const pedidoSnap = await getDoc(pedidoRef);
    
    if (pedidoSnap.exists()) {
      const pedidoData = pedidoSnap.data();
      console.log('✅ Pedido encontrado directamente:');
      console.log('  - ID:', pedidoSnap.id);
      console.log('  - Cliente:', pedidoData.nombreCliente);
      console.log('  - Teléfono:', pedidoData.numeroTelefono);
      console.log('  - Estado:', pedidoData.estado);
      console.log('  - Archivado:', pedidoData.isArchived);
      console.log('  - Productos:', pedidoData.productos?.length || 0);
      console.log('  - Data completa:', pedidoData);
    } else {
      console.log('❌ Pedido no encontrado directamente');
    }
    
    // 2. Verificar con consulta por número de teléfono
    console.log('\n🔍 Verificando con consulta por teléfono...');
    const phoneNumber = '4463139949';
    const userId = 'zpVKGnsFlGM3scVLT6GTSVQGjTr2';
    const appId = 'dev-local-app-id';
    
    const pedidosRef = collection(db, `artifacts/${appId}/users/${userId}/pedidos`);
    const q = query(
      pedidosRef,
      where('numeroTelefono', '==', phoneNumber)
    );
    
    const snapshot = await getDocs(q);
    console.log(`📊 Consulta por teléfono encontró: ${snapshot.size} documentos`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('📄 Documento encontrado:');
      console.log('  - ID:', doc.id);
      console.log('  - Cliente:', data.nombreCliente);
      console.log('  - Teléfono:', data.numeroTelefono);
      console.log('  - Archivado:', data.isArchived);
      console.log('  - Filtrado:', !data.isArchived ? 'SÍ aparecerá' : 'NO aparecerá (archivado)');
    });
    
    // 3. Listar todos los pedidos en la colección
    console.log('\n📋 Listando todos los pedidos en la colección...');
    const allPedidosSnapshot = await getDocs(pedidosRef);
    console.log(`Total pedidos en colección: ${allPedidosSnapshot.size}`);
    
    allPedidosSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.nombreCliente} (${data.numeroTelefono}) - Archivado: ${data.isArchived}`);
    });
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
};

verifySpecificPedido();
