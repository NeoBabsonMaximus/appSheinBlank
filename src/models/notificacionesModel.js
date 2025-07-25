// Notificaciones Model - Data Layer for Notifications Management
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  doc, 
  updateDoc, 
  deleteDoc, 
  where, 
  orderBy,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { mockData, createMockSubscription } from '../utils/mockData';

// Flag to determine if we should use mock data
let useMockData = false; // Use Firebase for real data storage

// Export function to check/set mock data mode
export const getMockDataMode = () => useMockData;
export const setMockDataMode = (value) => {
  useMockData = value;
  console.log('🔧 Mock data mode set to:', useMockData);
};

// Helper function to get collection reference
const getCollectionRef = (db, userId, appId, collectionName, isPublic = false) => {
  if (isPublic) {
    return collection(db, `artifacts/${appId}/public/data/${collectionName}`);
  }
  return collection(db, `artifacts/${appId}/users/${userId}/${collectionName}`);
};

// Notification types
export const NOTIFICATION_TYPES = {
  PEDIDO_NUEVO: 'pedido_nuevo',
  PEDIDO_ESTADO: 'pedido_estado',
  PAGO_PENDIENTE: 'pago_pendiente',
  PAGO_RECIBIDO: 'pago_recibido',
  STOCK_BAJO: 'stock_bajo',
  CLIENTE_NUEVO: 'cliente_nuevo',
  MENSAJE_ADMIN_ENVIADO: 'mensaje_admin_enviado',
  SISTEMA: 'sistema'
};

// Notification priorities
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Create notification
export const createNotification = async (db, userId, appId, notificationData) => {
  console.log('🔍 createNotification llamado con useMockData:', useMockData);
  
  if (useMockData) {
    console.log('📦 Using mock data for notification creation');
    const newNotification = {
      id: `mock-notif-${Date.now()}`,
      ...notificationData,
      fechaCreacion: new Date().toISOString(),
      leido: false,
    };
    if (!mockData.notificaciones) mockData.notificaciones = [];
    mockData.notificaciones.unshift(newNotification);
    return newNotification.id;
  }

  console.log('🔥 Intentando crear notificación en Firebase...');
  
  try {
    const collectionPath = `artifacts/${appId}/users/${userId}/notificaciones`;
    console.log('📂 Creando en colección:', collectionPath);
    
    const docRef = await addDoc(getCollectionRef(db, userId, appId, 'notificaciones'), {
      ...notificationData,
      fechaCreacion: serverTimestamp(),
      leido: false,
    });
    
    console.log('✅ Notificación creada exitosamente con ID:', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("❌ Error creating notification: ", e);
    console.error("🔍 Error code:", e.code);
    console.error("📝 Error message:", e.message);
    
    if (e.code === 'permission-denied' || e.code === 'unavailable') {
      console.warn('⚠️ Firebase not accessible, switching to mock data');
      useMockData = true;
      return createNotification(db, userId, appId, notificationData);
    }
    throw e;
  }
};

// Subscribe to notifications
export const subscribeToNotifications = (db, userId, appId, callback) => {
  console.log('🔍 subscribeToNotifications llamado con:', { userId, appId, useMockData });
  
  if (useMockData) {
    console.log('📦 Using mock data for notifications subscription');
    if (!mockData.notificaciones) mockData.notificaciones = [];
    return createMockSubscription(mockData.notificaciones, callback);
  }

  try {
    const collectionPath = `artifacts/${appId}/users/${userId}/notificaciones`;
    console.log('📂 Suscribiéndose a colección:', collectionPath);
    
    const q = query(
      getCollectionRef(db, userId, appId, 'notificaciones'),
      orderBy('fechaCreacion', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      console.log('📊 Snapshot recibido con', snapshot.docs.length, 'documentos');
      
      const notificationsData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 Documento:', doc.id, data);
        
        // Handle fechaCreacion
        let fechaCreacion;
        const fechaCreacionData = data.fechaCreacion;
        if (fechaCreacionData && typeof fechaCreacionData.toDate === 'function') {
          fechaCreacion = fechaCreacionData.toDate().toISOString();
        } else if (fechaCreacionData instanceof Date) {
          fechaCreacion = fechaCreacionData.toISOString();
        } else if (typeof fechaCreacionData === 'string') {
          fechaCreacion = fechaCreacionData;
        } else {
          fechaCreacion = new Date().toISOString();
        }
        
        return {
          id: doc.id,
          ...data,
          fechaCreacion: fechaCreacion,
        };
      });

      console.log('✅ Notificaciones procesadas:', notificationsData);
      callback(notificationsData);
    }, (error) => {
      console.error("❌ Error al obtener notificaciones:", error);
      if (error.code === 'permission-denied' || error.code === 'unavailable') {
        console.warn('⚠️ Firebase subscription failed, switching to mock data');
        useMockData = true;
        return subscribeToNotifications(db, userId, appId, callback);
      }
    });
  } catch (error) {
    console.error("❌ Error setting up notifications subscription:", error);
    useMockData = true;
    return subscribeToNotifications(db, userId, appId, callback);
  }
};

// Mark notification as read
export const markAsRead = async (db, userId, appId, notificationId) => {
  if (useMockData) {
    console.log('Using mock data for mark as read');
    if (!mockData.notificaciones) mockData.notificaciones = [];
    const index = mockData.notificaciones.findIndex(item => item.id === notificationId);
    if (index > -1) {
      mockData.notificaciones[index].leido = true;
    }
    return;
  }

  try {
    const docRef = doc(getCollectionRef(db, userId, appId, 'notificaciones'), notificationId);
    await updateDoc(docRef, { leido: true });
  } catch (e) {
    console.error("Error marking notification as read: ", e);
    if (e.code === 'permission-denied' || e.code === 'unavailable') {
      console.warn('Firebase update failed, switching to mock data');
      useMockData = true;
      return markAsRead(db, userId, appId, notificationId);
    }
    throw e;
  }
};

// Mark all notifications as read
export const markAllAsRead = async (db, userId, appId) => {
  if (useMockData) {
    console.log('Using mock data for mark all as read');
    if (!mockData.notificaciones) mockData.notificaciones = [];
    mockData.notificaciones.forEach(notif => notif.leido = true);
    return;
  }

  try {
    const q = query(
      getCollectionRef(db, userId, appId, 'notificaciones'),
      where('leido', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(document => 
      updateDoc(document.ref, { leido: true })
    );
    
    await Promise.all(updatePromises);
  } catch (e) {
    console.error("Error marking all notifications as read: ", e);
    if (e.code === 'permission-denied' || e.code === 'unavailable') {
      console.warn('Firebase update failed, switching to mock data');
      useMockData = true;
      return markAllAsRead(db, userId, appId);
    }
    throw e;
  }
};

// Delete notification
export const deleteNotification = async (db, userId, appId, notificationId) => {
  if (useMockData) {
    console.log('Using mock data for delete notification');
    if (!mockData.notificaciones) mockData.notificaciones = [];
    const index = mockData.notificaciones.findIndex(item => item.id === notificationId);
    if (index > -1) {
      mockData.notificaciones.splice(index, 1);
    }
    return;
  }

  try {
    await deleteDoc(doc(getCollectionRef(db, userId, appId, 'notificaciones'), notificationId));
  } catch (e) {
    console.error("Error deleting notification: ", e);
    if (e.code === 'permission-denied' || e.code === 'unavailable') {
      console.warn('Firebase delete failed, switching to mock data');
      useMockData = true;
      return deleteNotification(db, userId, appId, notificationId);
    }
    throw e;
  }
};

// Auto-generate notifications based on business logic
export const generateAutomaticNotifications = async (db, userId, appId, pedidos, transacciones) => {
  const notifications = [];
  
  // Check for pending payments (older than 3 days)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  pedidos.forEach(pedido => {
    if (pedido.saldoPendiente > 0) {
      const fechaCreacion = new Date(pedido.fechaCreacion);
      if (fechaCreacion < threeDaysAgo) {
        notifications.push({
          tipo: NOTIFICATION_TYPES.PAGO_PENDIENTE,
          titulo: 'Pago Pendiente',
          mensaje: `El pedido ${pedido.id} de ${pedido.nombreCliente} tiene un saldo pendiente de $${pedido.saldoPendiente}`,
          prioridad: NOTIFICATION_PRIORITY.HIGH,
          relacionadoId: pedido.id,
          relacionadoTipo: 'pedido'
        });
      }
    }
  });
  
  // Create notifications
  for (const notification of notifications) {
    try {
      await createNotification(db, userId, appId, notification);
    } catch (error) {
      console.error('Error creating automatic notification:', error);
    }
  }
  
  return notifications.length;
};

// Send admin response to client
export const sendAdminResponse = async (db, appId, clientPhone, responseMessage, originalNotificationId = null) => {
  try {
    console.log('📤 Enviando respuesta del admin a cliente:', clientPhone);
    
    // Crear notificación para el cliente en la colección pública
    const clientNotificationData = {
      tipo: 'respuesta_admin',
      titulo: '💬 Respuesta del administrador',
      mensaje: responseMessage,
      fechaCreacion: serverTimestamp(),
      leido: false,
      prioridad: 'high',
      numeroTelefono: clientPhone,
      originalNotificationId: originalNotificationId
    };

    const clientNotificationsRef = collection(db, `artifacts/${appId}/public/data/clientNotifications`);
    const docRef = await addDoc(clientNotificationsRef, clientNotificationData);
    
    console.log('✅ Respuesta del admin enviada exitosamente con ID:', docRef.id);
    return docRef.id;
    
  } catch (error) {
    console.error('❌ Error enviando respuesta del admin:', error);
    throw error;
  }
};

// Mark message as responded
export const markMessageAsResponded = async (db, userId, appId, notificationId, responseMessage) => {
  try {
    console.log('📝 Marcando mensaje como respondido:', notificationId);
    
    const notificationRef = doc(getCollectionRef(db, userId, appId, 'notificaciones'), notificationId);
    await updateDoc(notificationRef, { 
      respondido: true,
      respuestaAdmin: responseMessage,
      fechaRespuesta: serverTimestamp()
    });
    
    console.log('✅ Mensaje marcado como respondido exitosamente');
    
  } catch (error) {
    console.error('❌ Error marcando mensaje como respondido:', error);
    throw error;
  }
};
