// Script para explorar la estructura de Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDYjnQ8FUuDkHQe1TW08TLGkw9j-_vMYhU",
  authDomain: "appsheinblank.firebaseapp.com",
  projectId: "appsheinblank",
  storageBucket: "appsheinblank.firebasestorage.app",
  messagingSenderId: "234064942013",
  appId: "1:234064942013:web:7ce90fb7b6fab1071edc3a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function exploreFirestore() {
  try {
    console.log('🔍 Explorando estructura de Firestore...');
    
    // Try artifacts collection
    const artifactsSnapshot = await getDocs(collection(db, 'artifacts'));
    console.log(`📁 Artifacts: ${artifactsSnapshot.size} documentos`);
    
    for (const doc of artifactsSnapshot.docs) {
      console.log(`  - ${doc.id}`);
    }
    
    // Try specific path with Neo
    const neoUsersSnapshot = await getDocs(collection(db, 'artifacts', 'Neo', 'users'));
    console.log(`👤 Neo/users: ${neoUsersSnapshot.size} documentos`);
    
    for (const doc of neoUsersSnapshot.docs) {
      console.log(`  - Usuario: ${doc.id}`);
      
      // Try to get clientes for this user
      try {
        const clientesSnapshot = await getDocs(collection(db, 'artifacts', 'Neo', 'users', doc.id, 'clientes'));
        console.log(`    📱 Clientes: ${clientesSnapshot.size}`);
        
        if (clientesSnapshot.size > 0) {
          const firstClient = clientesSnapshot.docs[0];
          console.log(`    📋 Primer cliente:`, firstClient.data());
        }
      } catch (e) {
        console.log(`    ❌ Error accediendo clientes: ${e.message}`);
      }
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

exploreFirestore();
