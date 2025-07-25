// Script para probar el sistema de notificaciones cliente
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, where } from 'firebase/firestore';

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

const testClientNotifications = async () => {
  console.log('🧪 Probando sistema de notificaciones del cliente...');
  
  const phoneNumber = '4463139949';
  const userId = 'zpVKGnsFlGM3scVLT6GTSVQGjTr2';
  const appId = 'dev-local-app-id';
  const pedidoId = '8l4Avz2Rzhpzd4DD9BGs';
  
  try {
    // 1. Crear una notificación de prueba para el cliente
    console.log('📝 Creando notificación de prueba...');
    
    const notificationData = {
      tipo: 'pedido_actualizado',
      titulo: '📦 Tu pedido ha sido actualizado (PRUEBA)',
      mensaje: `Tu pedido de TELESFORA TINAJERO ha sido actualizado. Estado: Enviado`,
      fechaCreacion: new Date(),
      leido: false,
      prioridad: 'medium',
      pedidoId: pedidoId,
      numeroTelefono: phoneNumber
    };

    const clientNotificationsRef = collection(db, `artifacts/${appId}/users/${userId}/clientNotifications`);
    const docRef = await addDoc(clientNotificationsRef, notificationData);
    
    console.log(`✅ Notificación creada con ID: ${docRef.id}`);
    
    // 2. Verificar que se puede leer
    console.log('🔍 Verificando que se puede leer la notificación...');
    
    const clientQuery = query(
      clientNotificationsRef,
      where('numeroTelefono', '==', phoneNumber)
    );
    
    const clientSnapshot = await getDocs(clientQuery);
    console.log(`📊 Notificaciones encontradas: ${clientSnapshot.size}`);
    
    clientSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('🔔 Notificación encontrada:');
      console.log(`  - ID: ${doc.id}`);
      console.log(`  - Título: ${data.titulo}`);
      console.log(`  - Mensaje: ${data.mensaje}`);
      console.log(`  - Teléfono: ${data.numeroTelefono}`);
      console.log(`  - Pedido: ${data.pedidoId}`);
      console.log(`  - Fecha: ${data.fechaCreacion}`);
    });
    
    // 3. Simular la lógica del UserController
    console.log('\n🎯 Simulando lógica del UserController...');
    
    const adminUserIds = ['zpVKGnsFlGM3scVLT6GTSVQGjTr2', 'admin', 'default', 'user1', 'main'];
    let foundNotifications = [];
    
    for (const uid of adminUserIds) {
      try {
        console.log(`🔍 Buscando en userId: ${uid}`);
        
        // Buscar notificaciones generales
        const notificationsRef = collection(db, `artifacts/${appId}/users/${uid}/notificaciones`);
        const generalSnapshot = await getDocs(notificationsRef);
        const generalNotifications = generalSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(notification => notification.targetPhone === phoneNumber);
        
        // Buscar notificaciones específicas del cliente
        const clientNotificationsRef2 = collection(db, `artifacts/${appId}/users/${uid}/clientNotifications`);
        const clientQuery2 = query(
          clientNotificationsRef2,
          where('numeroTelefono', '==', phoneNumber)
        );
        
        const clientSnapshot2 = await getDocs(clientQuery2);
        const clientNotifications = clientSnapshot2.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const allNotifications = [...generalNotifications, ...clientNotifications];
        
        console.log(`  - Generales: ${generalNotifications.length}`);
        console.log(`  - Cliente específicas: ${clientNotifications.length}`);
        console.log(`  - Total: ${allNotifications.length}`);
        
        if (allNotifications.length > 0) {
          foundNotifications = allNotifications;
          console.log(`✅ Encontradas ${allNotifications.length} notificaciones en ${uid}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Error buscando en ${uid}:`, error.message);
      }
    }
    
    console.log(`\n🎯 RESULTADO FINAL: ${foundNotifications.length} notificaciones encontradas`);
    foundNotifications.forEach(notif => {
      console.log(`  - ${notif.titulo}: ${notif.mensaje}`);
    });
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
};

testClientNotifications();
