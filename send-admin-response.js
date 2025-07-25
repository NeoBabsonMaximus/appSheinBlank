// Script para enviar una respuesta del admin a un cliente
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyA18hvrsBazGjX2iAIKJKRPfofJy81jdC0",
  authDomain: "appsheinblank.firebaseapp.com",
  projectId: "appsheinblank",
  storageBucket: "appsheinblank.firebasestorage.app",
  messagingSenderId: "209741152261",
  appId: "1:209741152261:web:aa475aceb2f64b61b69c6c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sendAdminResponse = async () => {
  try {
    const appId = 'dev-local-app-id';
    const clientPhone = '4191059644';
    
    console.log('📤 Enviando respuesta del admin al cliente...');
    
    // Crear respuesta del admin en clientNotifications
    const clientNotificationsRef = collection(db, `artifacts/${appId}/public/data/clientNotifications`);
    await addDoc(clientNotificationsRef, {
      tipo: 'respuesta_admin',
      titulo: '💬 Respuesta del administrador',
      mensaje: '¡Hola TATIANA! Tu pedido #jh3MDG está en proceso y llegará el miércoles 30 de julio. ¡Gracias por tu paciencia! 😊',
      fechaCreacion: new Date(),
      leido: false,
      prioridad: 'high',
      numeroTelefono: clientPhone,
      originalNotificationId: 'test-response-001'
    });
    
    console.log('✅ Respuesta del admin enviada exitosamente');
    console.log('📱 Cliente: TATIANA TINAJERO (4191059644)');
    console.log('💬 Respuesta: Información sobre pedido #jh3MDG');
    
  } catch (error) {
    console.error('❌ Error enviando respuesta del admin:', error);
  }
};

sendAdminResponse().then(() => {
  console.log('🏁 Script completado');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Error en el script:', error);
  process.exit(1);
});
