// Test Script para verificar la conexión de Firebase y Notificaciones
import { db } from './firebase-test-config.js';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

const testFirebaseConnection = async () => {
  console.log('🔍 Probando conexión con Firebase...');
  
  try {
    // Test 1: Crear una notificación de prueba
    console.log('📝 Creando notificación de prueba...');
    const testNotification = {
      tipo: 'sistema',
      titulo: 'Test de Conexión',
      mensaje: 'Esta es una notificación de prueba para verificar la conexión',
      prioridad: 'medium',
      fechaCreacion: serverTimestamp(),
      leido: false
    };

    const docRef = await addDoc(collection(db, 'artifacts/shein-app/users/demo-user/notificaciones'), testNotification);
    console.log('✅ Notificación creada con ID:', docRef.id);

    // Test 2: Leer notificaciones
    console.log('📖 Leyendo notificaciones...');
    const querySnapshot = await getDocs(collection(db, 'artifacts/shein-app/users/demo-user/notificaciones'));
    
    console.log('📊 Total de notificaciones encontradas:', querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      console.log('📋 Notificación:', doc.id, '=>', doc.data());
    });

    console.log('🎉 ¡Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    console.error('🔍 Código de error:', error.code);
    console.error('📝 Mensaje:', error.message);
  }
};

// Ejecutar la prueba
testFirebaseConnection();
