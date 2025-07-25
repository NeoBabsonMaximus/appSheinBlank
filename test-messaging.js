// Test script para verificar el sistema de mensajes
import { db } from './src/config/firebase.js';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const testMessaging = async () => {
  const appId = 'dev-local-app-id';
  const testPhone = '5555551234';
  
  console.log('🧪 Testing messaging system...');
  
  try {
    // 1. Simular mensaje de usuario a admin
    console.log('📤 Sending test message from user to admin...');
    const messagesRef = collection(db, `artifacts/${appId}/users/zpVKGnsFlGM3scVLT6GTSVQGjTr2/mensajes`);
    await addDoc(messagesRef, {
      fromPhone: testPhone,
      fromName: 'Usuario Test',
      message: 'Hola, este es un mensaje de prueba',
      pedidoId: null,
      createdAt: new Date(),
      read: false,
      type: 'customer_to_admin'
    });
    console.log('✅ User message sent');
    
    // 2. Simular respuesta de admin
    console.log('📥 Sending test response from admin to user...');
    const clientNotificationsRef = collection(db, `artifacts/${appId}/public/data/clientNotifications`);
    await addDoc(clientNotificationsRef, {
      tipo: 'respuesta_admin',
      titulo: '💬 Respuesta del administrador',
      mensaje: 'Hola! Esta es una respuesta de prueba del admin',
      fechaCreacion: new Date(),
      leido: false,
      prioridad: 'high',
      numeroTelefono: testPhone,
      originalNotificationId: null
    });
    console.log('✅ Admin response sent');
    
    // 3. Verificar que se pueden leer ambos mensajes
    console.log('🔍 Reading messages...');
    
    // Leer mensajes del usuario
    const userMessagesQuery = query(
      messagesRef,
      where('fromPhone', '==', testPhone)
    );
    const userMessagesSnapshot = await getDocs(userMessagesQuery);
    console.log(`📤 Found ${userMessagesSnapshot.docs.length} user messages`);
    
    // Leer respuestas del admin
    const adminResponsesQuery = query(
      clientNotificationsRef,
      where('numeroTelefono', '==', testPhone),
      where('tipo', '==', 'respuesta_admin')
    );
    const adminResponsesSnapshot = await getDocs(adminResponsesQuery);
    console.log(`📥 Found ${adminResponsesSnapshot.docs.length} admin responses`);
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Ejecutar test
if (typeof window !== 'undefined') {
  window.testMessaging = testMessaging;
  console.log('Test function loaded. Run window.testMessaging() in console to test.');
}
