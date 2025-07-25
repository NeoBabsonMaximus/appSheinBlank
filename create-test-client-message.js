// Script para crear un mensaje de cliente de prueba
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyD5Z2Z1Z0Z1Z0Z1Z0Z1Z0Z1Z0Z1Z0Z1Z0Z",
  authDomain: "appsheinblank.firebaseapp.com",
  projectId: "appsheinblank",
  storageBucket: "appsheinblank.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const createTestClientMessage = async () => {
  try {
    const userId = 'zpVKGnsFlGM3scVLT6GTSVQGjTr2';
    const appId = 'dev-local-app-id';
    
    console.log('📨 Creando mensaje de cliente de prueba...');
    
    // Crear mensaje en la colección de mensajes
    const messagesRef = collection(db, `artifacts/${appId}/users/${userId}/mensajes`);
    await addDoc(messagesRef, {
      fromPhone: '4191059644',
      fromName: 'TATIANA TINAJERO',
      message: '¡Hola! Quería preguntarte sobre el estado de mi pedido #jh3MDG. ¿Cuándo llegará? Muchas gracias.',
      pedidoId: 'mock-pedido-123',
      createdAt: new Date(),
      read: false,
      type: 'customer_to_admin'
    });
    
    // También crear una notificación
    const notificationsRef = collection(db, `artifacts/${appId}/users/${userId}/notificaciones`);
    await addDoc(notificationsRef, {
      tipo: 'mensaje_cliente',
      titulo: 'Nuevo mensaje de TATIANA TINAJERO',
      mensaje: '¡Hola! Quería preguntarte sobre el estado de mi pedido #jh3MDG. ¿Cuándo llegará? Muchas gracias.',
      fechaCreacion: new Date(),
      leido: false,
      prioridad: 'high',
      clientePhone: '4191059644',
      fromName: 'TATIANA TINAJERO',
      pedidoId: 'mock-pedido-123',
      respondido: false
    });
    
    console.log('✅ Mensaje de cliente creado exitosamente');
    console.log('📱 Cliente: TATIANA TINAJERO (4191059644)');
    console.log('💬 Mensaje: Pregunta sobre pedido #jh3MDG');
    
  } catch (error) {
    console.error('❌ Error creando mensaje de cliente:', error);
  }
};

createTestClientMessage();
