// Script para limpiar números de teléfono en la base de datos
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDYjnQ8FUuDkHQe1TW08TLGkw9j-_vMYhU",
  authDomain: "appsheinblank.firebaseapp.com",
  projectId: "appsheinblank",
  storageBucket: "appsheinblank.firebasestorage.app",
  messagingSenderId: "234064942013",
  appId: "1:234064942013:web:7ce90fb7b6fab1071edc3a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function cleanPhoneNumber(phoneNumber) {
  if (!phoneNumber) return '';
  let cleaned = ('' + phoneNumber).replace(/\D/g, '');

  // Remove Mexican prefixes
  if (cleaned.startsWith('044') || cleaned.startsWith('045')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('01')) {
    cleaned = cleaned.substring(2);
  }

  // Remove country code if present
  if (cleaned.startsWith('52') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }

  return cleaned;
}

async function fixPhoneNumbers() {
  try {
    console.log('🔧 Iniciando limpieza de números de teléfono...');
    
    const userId = 'zpVKGnsFlGM3scVLT6GTSVQGjTr2';
    const appId = 'dev-local-app-id';
    
    // Fix clientes
    const clientesSnapshot = await getDocs(collection(db, `artifacts/${appId}/users/${userId}/clientes`));
    console.log(`📱 Encontrados ${clientesSnapshot.size} clientes`);
    
    for (const clienteDoc of clientesSnapshot.docs) {
      const data = clienteDoc.data();
      if (data.contacto) {
        const cleanedPhone = cleanPhoneNumber(data.contacto);
        if (cleanedPhone !== data.contacto) {
          await updateDoc(doc(db, `artifacts/${appId}/users/${userId}/clientes`, clienteDoc.id), {
            contacto: cleanedPhone
          });
          console.log(`✅ Cliente ${data.nombre}: ${data.contacto} → ${cleanedPhone}`);
        } else {
          console.log(`⚪ Cliente ${data.nombre}: ${data.contacto} (ya limpio)`);
        }
      }
    }
    
    // Fix pedidos
    const pedidosSnapshot = await getDocs(collection(db, `artifacts/${appId}/users/${userId}/pedidos`));
    console.log(`📦 Encontrados ${pedidosSnapshot.size} pedidos`);
    
    for (const pedidoDoc of pedidosSnapshot.docs) {
      const data = pedidoDoc.data();
      if (data.numeroTelefono) {
        const cleanedPhone = cleanPhoneNumber(data.numeroTelefono);
        if (cleanedPhone !== data.numeroTelefono) {
          await updateDoc(doc(db, `artifacts/${appId}/users/${userId}/pedidos`, pedidoDoc.id), {
            numeroTelefono: cleanedPhone
          });
          console.log(`✅ Pedido ${data.nombreCliente}: ${data.numeroTelefono} → ${cleanedPhone}`);
        } else {
          console.log(`⚪ Pedido ${data.nombreCliente}: ${data.numeroTelefono} (ya limpio)`);
        }
      }
    }
    
    console.log('🎉 Limpieza completada!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixPhoneNumbers();
