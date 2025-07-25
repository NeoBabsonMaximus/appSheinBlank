// Test directo de la búsqueda
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

const testUserController = async () => {
  console.log('🧪 Probando la lógica del UserController...');
  
  const phoneNumber = '4463139949';
  const appId = 'dev-local-app-id';
  
  // Limpiar número de teléfono (misma lógica que en useUserController)
  let cleanPhone = phoneNumber.toString().replace(/\D/g, '');
  if (cleanPhone.length === 12 && cleanPhone.startsWith('52')) {
    cleanPhone = cleanPhone.substring(2);
  }
  
  console.log(`🔍 Searching for phone number: Original: ${phoneNumber}, Cleaned: ${cleanPhone}`);
  
  try {
    // Buscar en las colecciones públicas compartidas primero
    console.log('📂 Checking shared pedidos...');
    const sharedPedidosRef = collection(db, `artifacts/${appId}/public/data/sharedPedidos`);
    const sharedQuery = query(
      sharedPedidosRef,
      where('numeroTelefono', '==', cleanPhone)
    );

    let foundPedidos = [];
    
    try {
      const sharedSnapshot = await getDocs(sharedQuery);
      foundPedidos = sharedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(pedido => !pedido.isArchived);
      console.log(`📊 Found ${foundPedidos.length} in shared collection`);
    } catch (error) {
      console.log("❌ No shared pedidos found, trying user collections...");
    }

    // Si no encontramos en shared, buscar en colecciones de usuarios
    if (foundPedidos.length === 0) {
      const adminUserIds = ['zpVKGnsFlGM3scVLT6GTSVQGjTr2', 'admin', 'default', 'user1', 'main'];
      
      for (const userId of adminUserIds) {
        try {
          console.log(`🔍 Searching for phone ${cleanPhone} in userId: ${userId}`);
          const pedidosRef = collection(db, `artifacts/${appId}/users/${userId}/pedidos`);
          const q = query(
            pedidosRef,
            where('numeroTelefono', '==', cleanPhone)
          );
          
          const snapshot = await getDocs(q);
          const pedidosData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).filter(pedido => !pedido.isArchived);

          console.log(`📊 Found ${pedidosData.length} pedidos for userId: ${userId}`);
          if (pedidosData.length > 0) {
            foundPedidos = pedidosData;
            console.log(`✅ Using pedidos from userId: ${userId}`);
            console.log('📋 Pedido details:', pedidosData);
            break;
          }
        } catch (error) {
          console.log(`❌ Error searching userId ${userId}:`, error.message);
        }
      }
    }

    console.log(`📋 Final result: Found ${foundPedidos.length} pedidos`);
    if (foundPedidos.length > 0) {
      foundPedidos.forEach(pedido => {
        console.log(`✅ Pedido ${pedido.id}:`);
        console.log(`  - Cliente: ${pedido.nombreCliente}`);
        console.log(`  - Teléfono: ${pedido.numeroTelefono}`);
        console.log(`  - Estado: ${pedido.estado}`);
        console.log(`  - Productos: ${pedido.productos?.length || 0} items`);
        if (pedido.productos) {
          pedido.productos.forEach(producto => {
            console.log(`    - ${producto.nombreProducto}: $${producto.precioUnitario} x ${producto.cantidad}`);
          });
        }
      });
    } else {
      console.log('❌ No se encontraron pedidos');
    }
    
  } catch (error) {
    console.error('💥 Error general:', error);
  }
};

testUserController();
