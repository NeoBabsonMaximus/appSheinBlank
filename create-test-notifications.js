// Script para crear notificaciones de prueba en Firebase
import { db } from './firebase-test-config.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const createTestNotifications = async () => {
  console.log('🔍 Creando notificaciones de prueba...');
  
  const notifications = [
    {
      tipo: 'pedido_nuevo',
      titulo: 'Nuevo Pedido #001',
      mensaje: 'Se ha recibido un nuevo pedido de la cliente María García',
      prioridad: 'high',
      fechaCreacion: serverTimestamp(),
      leido: false
    },
    {
      tipo: 'pago_recibido',
      titulo: 'Pago Recibido',
      mensaje: 'Se ha confirmado el pago de $250.000 del pedido #001',
      prioridad: 'medium',
      fechaCreacion: serverTimestamp(),
      leido: false
    },
    {
      tipo: 'cliente_nuevo',
      titulo: 'Cliente Nuevo',
      mensaje: 'Se ha registrado una nueva cliente: Ana Rodríguez',
      prioridad: 'low',
      fechaCreacion: serverTimestamp(),
      leido: false
    },
    {
      tipo: 'sistema',
      titulo: 'Bienvenida al Sistema',
      mensaje: 'Sistema de notificaciones iniciado correctamente. ¡Todo funcionando!',
      prioridad: 'medium',
      fechaCreacion: serverTimestamp(),
      leido: false
    }
  ];

  try {
    for (const notification of notifications) {
      const docRef = await addDoc(
        collection(db, 'artifacts/shein-app/users/demo-user/notificaciones'), 
        notification
      );
      console.log('✅ Notificación creada:', docRef.id, notification.titulo);
    }
    console.log('🎉 ¡Todas las notificaciones de prueba fueron creadas!');
  } catch (error) {
    console.error('❌ Error creando notificaciones:', error);
  }
};

// Ejecutar
createTestNotifications();
