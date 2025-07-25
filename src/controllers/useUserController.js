// User Controller - Business Logic for Customer/User View
import { useState, useEffect } from 'react';
import { 
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { ENV_CONFIG } from '../config/environment';

export const useUserController = (db, phoneNumber, appId = ENV_CONFIG.APP_ID) => {
  const [userPedidos, setUserPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [offers, setOffers] = useState([]);

  // Función para buscar pedidos por número de teléfono
  useEffect(() => {
    if (!db || !phoneNumber) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Limpiar número de teléfono
        let cleanPhone = phoneNumber.toString().replace(/\D/g, '');
        if (cleanPhone.length === 12 && cleanPhone.startsWith('52')) {
          cleanPhone = cleanPhone.substring(2);
        }
        
        console.log(`🔍 Searching for phone number: Original: ${phoneNumber}, Cleaned: ${cleanPhone}`);
        console.log(`🏷️ Using appId: ${appId}`);

        // Buscar en las colecciones públicas compartidas primero
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
        } catch (error) {
          console.log("No shared pedidos found, trying user collections...");
        }

        // Si no encontramos en shared, buscar en colecciones de usuarios
        if (foundPedidos.length === 0) {
          // Usar el userId específico del sistema
          const adminUserIds = [ENV_CONFIG.ADMIN_USER_ID, 'admin', 'default', 'user1', 'main'];
          
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
                console.log(`✅ Using pedidos from userId: ${userId}`, pedidosData);
                break;
              }
            } catch (error) {
              console.log(`❌ Error searching userId ${userId}:`, error.message);
            }
          }
        }

        console.log(`📋 Final result: Found ${foundPedidos.length} pedidos`, foundPedidos);
        setUserPedidos(foundPedidos);

        // Buscar perfil del cliente en las mismas colecciones
        if (foundPedidos.length > 0) {
          const adminUserIds = [ENV_CONFIG.ADMIN_USER_ID, 'admin', 'default', 'user1', 'main'];
          for (const userId of adminUserIds) {
            try {
              const clientesRef = collection(db, `artifacts/${appId}/users/${userId}/clientes`);
              const clienteQuery = query(clientesRef, where('numeroTelefono', '==', cleanPhone));
              const clienteSnapshot = await getDocs(clienteQuery);
              
              if (!clienteSnapshot.empty) {
                const clienteData = clienteSnapshot.docs[0].data();
                setUserProfile({
                  id: clienteSnapshot.docs[0].id,
                  ...clienteData
                });
                break;
              }
            } catch (error) {
              console.log(`No cliente found for userId: ${userId}`, error.message);
            }
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [db, phoneNumber, appId]);

  // Función para buscar notificaciones (separada para reutilizar)
  const fetchNotifications = async () => {
    try {
      let cleanPhone = phoneNumber.toString().replace(/\D/g, '');
      if (cleanPhone.length === 12 && cleanPhone.startsWith('52')) {
        cleanPhone = cleanPhone.substring(2);
      }

      // Buscar en colecciones públicas o de usuarios conocidos
      const adminUserIds = [ENV_CONFIG.ADMIN_USER_ID, 'admin', 'default', 'user1', 'main'];
      let foundNotifications = [];

      for (const userId of adminUserIds) {
        try {
          let notificationsData = [];
          let clientNotificationsData = [];
          
          // Buscar notificaciones generales con ordenamiento
          try {
            const notificationsRef = collection(db, `artifacts/${appId}/users/${userId}/notificaciones`);
            const q = query(
              notificationsRef,
              orderBy('fechaCreacion', 'desc')
            );
            
            const snapshot = await getDocs(q);
            notificationsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            // Filtrar por teléfono en el cliente
            .filter(notification => notification.targetPhone === cleanPhone);
          } catch (orderError) {
            // Si falla el ordenamiento, intentar sin orderBy
            console.log(`Fallback: querying without orderBy for notificaciones in ${userId}`);
            const notificationsRef = collection(db, `artifacts/${appId}/users/${userId}/notificaciones`);
            const q = query(notificationsRef);
            
            const snapshot = await getDocs(q);
            notificationsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .filter(notification => notification.targetPhone === cleanPhone);
          }
          
          // Buscar notificaciones específicas del cliente con ordenamiento
          try {
            const clientNotificationsRef = collection(db, `artifacts/${appId}/users/${userId}/clientNotifications`);
            const clientQuery = query(
              clientNotificationsRef,
              where('numeroTelefono', '==', cleanPhone),
              orderBy('fechaCreacion', 'desc')
            );
            
            const clientSnapshot = await getDocs(clientQuery);
            clientNotificationsData = clientSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          } catch (orderError) {
            // Si falla el ordenamiento, intentar sin orderBy
            console.log(`Fallback: querying without orderBy for clientNotifications in ${userId}`);
            const clientNotificationsRef = collection(db, `artifacts/${appId}/users/${userId}/clientNotifications`);
            const clientQuery = query(
              clientNotificationsRef,
              where('numeroTelefono', '==', cleanPhone)
            );
            
            const clientSnapshot = await getDocs(clientQuery);
            clientNotificationsData = clientSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          }
          
          // Combinar ambos tipos de notificaciones
          const allNotifications = [...notificationsData, ...clientNotificationsData];
          
          if (allNotifications.length > 0) {
            foundNotifications = allNotifications;
            console.log(`📱 Found ${allNotifications.length} notifications for client ${cleanPhone}`);
            break;
          }
        } catch (error) {
          console.log(`No notifications found for userId: ${userId}`, error.message);
        }
      }

      // Ordenar notificaciones por fecha de creación (más reciente primero)
      const sortedNotifications = foundNotifications.sort((a, b) => {
        // Manejar diferentes formatos de fecha
        const getTimestamp = (notification) => {
          const dateField = notification.fechaCreacion || notification.createdAt || notification.timestamp;
          if (!dateField) return 0; // Si no hay fecha, poner al final
          
          // Si es un Timestamp de Firebase
          if (dateField && typeof dateField.toDate === 'function') {
            return dateField.toDate().getTime();
          }
          
          // Si es una fecha normal
          if (dateField instanceof Date) {
            return dateField.getTime();
          }
          
          // Si es un string, intentar parsearlo
          if (typeof dateField === 'string') {
            return new Date(dateField).getTime();
          }
          
          return 0;
        };
        
        const timestampA = getTimestamp(a);
        const timestampB = getTimestamp(b);
        
        // Ordenar descendente (más reciente primero)
        return timestampB - timestampA;
      });

      console.log(`📅 Sorted ${sortedNotifications.length} notifications by date`);
      setNotifications(sortedNotifications);
      console.log(`🔔 FINAL: Set ${sortedNotifications.length} notifications for client`, sortedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Función para refrescar notificaciones manualmente
  const refreshNotifications = async () => {
    console.log("🔄 Refreshing notifications...");
    await fetchNotifications();
  };

  // Función para obtener todos los mensajes (enviados y recibidos)
  const fetchAllMessages = async () => {
    try {
      console.log('💬 Fetching all messages for phone:', phoneNumber);
      
      let cleanPhone = phoneNumber.toString().replace(/\D/g, '');
      if (cleanPhone.length === 12 && cleanPhone.startsWith('52')) {
        cleanPhone = cleanPhone.substring(2);
      }

      const allMessages = [];

      // 1. Buscar mensajes recibidos del admin (respuestas_admin en clientNotifications)
      console.log('📥 Fetching admin responses...');
      const clientNotificationsRef = collection(db, `artifacts/${appId}/public/data/clientNotifications`);
      const adminResponsesQuery = query(
        clientNotificationsRef,
        where('numeroTelefono', '==', cleanPhone),
        where('tipo', '==', 'respuesta_admin')
      );
      
      const adminResponsesSnapshot = await getDocs(adminResponsesQuery);
      console.log(`📧 Found ${adminResponsesSnapshot.docs.length} admin responses for phone ${cleanPhone}`);
      adminResponsesSnapshot.forEach(doc => {
        const data = doc.data();
        allMessages.push({
          id: doc.id,
          ...data,
          type: 'admin_to_customer',
          isFromAdmin: true
        });
        console.log('📨 Admin response found:', data.mensaje);
      });

      // 2. Buscar mensajes enviados por el usuario (en colecciones de admin)
      console.log('📤 Fetching sent messages...');
      const adminUserIds = [ENV_CONFIG.ADMIN_USER_ID, 'admin', 'default', 'user1', 'main'];
      
      for (const userId of adminUserIds) {
        try {
          const messagesRef = collection(db, `artifacts/${appId}/users/${userId}/mensajes`);
          const sentMessagesQuery = query(
            messagesRef,
            where('fromPhone', '==', cleanPhone)
          );
          
          const sentMessagesSnapshot = await getDocs(sentMessagesQuery);
          sentMessagesSnapshot.forEach(doc => {
            const data = doc.data();
            allMessages.push({
              id: doc.id,
              ...data,
              type: 'customer_to_admin',
              isFromAdmin: false,
              mensaje: data.message, // Normalizar campo
              fechaCreacion: data.createdAt // Normalizar campo
            });
            console.log('📤 Sent message found:', data.message);
          });
        } catch (error) {
          console.log(`❌ Error fetching from userId ${userId}:`, error);
        }
      }

      // Ordenar mensajes por fecha
      const sortedMessages = allMessages.sort((a, b) => {
        const getTimestamp = (msg) => {
          const date = msg.fechaCreacion || msg.createdAt;
          if (!date) return 0;
          return date.toDate ? date.toDate().getTime() : new Date(date).getTime();
        };
        
        return getTimestamp(a) - getTimestamp(b); // Ascendente (más antiguo primero)
      });

      console.log(`💬 Found ${sortedMessages.length} total messages`);
      return sortedMessages;
      
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      return [];
    }
  };

  // Función para suscribirse a respuestas de admin en tiempo real
  const subscribeToAdminResponses = (callback) => {
    if (!db || !phoneNumber) return null;

    try {
      let cleanPhone = phoneNumber.toString().replace(/\D/g, '');
      if (cleanPhone.length === 12 && cleanPhone.startsWith('52')) {
        cleanPhone = cleanPhone.substring(2);
      }

      console.log('🔔 Subscribing to admin responses for phone:', cleanPhone);
      
      const clientNotificationsRef = collection(db, `artifacts/${appId}/public/data/clientNotifications`);
      const adminResponsesQuery = query(
        clientNotificationsRef,
        where('numeroTelefono', '==', cleanPhone),
        where('tipo', '==', 'respuesta_admin')
      );

      return onSnapshot(adminResponsesQuery, (snapshot) => {
        console.log('📨 Admin responses snapshot received:', snapshot.docs.length, 'messages');
        
        const adminMessages = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('📧 Admin message:', data.mensaje);
          return {
            id: doc.id,
            ...data,
            type: 'admin_to_customer',
            isFromAdmin: true
          };
        });

        callback(adminMessages);
      }, (error) => {
        console.error('❌ Error in admin responses subscription:', error);
      });

    } catch (error) {
      console.error('❌ Error setting up admin responses subscription:', error);
      return null;
    }
  };

  // Función para buscar notificaciones del usuario
  useEffect(() => {
    if (!db || !phoneNumber) return;

    fetchNotifications();
  }, [db, phoneNumber, appId]);

  // Función para buscar ofertas generales
  useEffect(() => {
    if (!db) return;

    const fetchOffers = async () => {
      try {
        const adminUserIds = [ENV_CONFIG.ADMIN_USER_ID, 'admin', 'default', 'user1', 'main'];
        let foundOffers = [];

        for (const userId of adminUserIds) {
          try {
            const offersRef = collection(db, `artifacts/${appId}/users/${userId}/ofertas`);
            const q = query(offersRef, orderBy('createdAt', 'desc'));
            
            const snapshot = await getDocs(q);
            const offersData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            // Filtrar ofertas activas en el cliente
            .filter(offer => offer.active === true);
            
            if (offersData.length > 0) {
              foundOffers = offersData;
              break;
            }
          } catch (error) {
            console.log(`No offers found for userId: ${userId}`);
          }
        }

        setOffers(foundOffers);
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    };

    fetchOffers();
  }, [db, appId]);

  // Función para enviar mensaje al administrador
  const sendMessageToAdmin = async (message, pedidoId = null) => {
    try {
      // Validar que phoneNumber existe
      if (!phoneNumber || phoneNumber.toString().trim() === '') {
        throw new Error('Número de teléfono no válido');
      }

      let cleanPhone = phoneNumber.toString().replace(/\D/g, '');
      if (cleanPhone.length === 12 && cleanPhone.startsWith('52')) {
        cleanPhone = cleanPhone.substring(2);
      }

      // Validar que el número limpio tiene la longitud correcta
      if (cleanPhone.length < 10) {
        throw new Error('Número de teléfono demasiado corto');
      }

      console.log('📤 Enviando mensaje con número validado:', cleanPhone);

      // Intentar enviar a las colecciones de usuarios conocidos
      const adminUserIds = [ENV_CONFIG.ADMIN_USER_ID, 'admin', 'default', 'user1', 'main'];
      
      for (const userId of adminUserIds) {
        try {
          // Enviar mensaje
          const messagesRef = collection(db, `artifacts/${appId}/users/${userId}/mensajes`);
          await addDoc(messagesRef, {
            fromPhone: cleanPhone,
            fromName: userProfile?.nombre || 'Cliente',
            message: message,
            pedidoId: pedidoId,
            createdAt: new Date(),
            read: false,
            type: 'customer_to_admin'
          });
          
          // También crear una notificación
          const notificationsRef = collection(db, `artifacts/${appId}/users/${userId}/notificaciones`);
          await addDoc(notificationsRef, {
            tipo: 'mensaje_cliente',
            titulo: `Nuevo mensaje de ${userProfile?.nombre || cleanPhone}`,
            mensaje: message,
            fechaCreacion: new Date(),
            leido: false,
            prioridad: 'high',
            numeroTelefono: cleanPhone, // Campo necesario para respuestas - validado
            pedidoId: pedidoId,
            respondido: false
          });
          
          console.log(`✅ Message and notification sent to admin user: ${userId} with phone: ${cleanPhone}`);
          return true;
        } catch (error) {
          console.log(`❌ Failed to send message to userId: ${userId}`, error);
        }
      }
      
      throw new Error('No se pudo enviar el mensaje a ningún administrador');
    } catch (error) {
      console.error("❌ Error sending message:", error);
      throw error;
    }
  };

  // Función para marcar notificación como leída
  const markNotificationAsRead = async (notificationId) => {
    try {
      console.log(`🔔 Marking notification ${notificationId} as read for phone ${phoneNumber}`);
      
      // Try to update in clientNotifications collection first
      try {
        const clientNotificationRef = doc(db, `artifacts/${appId}/users/${ENV_CONFIG.ADMIN_USER_ID}/clientNotifications`, notificationId);
        await updateDoc(clientNotificationRef, {
          leido: true,
          readAt: new Date()
        });
        console.log(`✅ Successfully marked client notification ${notificationId} as read`);
        return;
      } catch (error) {
        console.log(`❌ Failed to update client notification ${notificationId}:`, error.message);
      }
      
      // If not found in clientNotifications, try in regular notificaciones collection
      try {
        const notificationRef = doc(db, `artifacts/${appId}/users/${ENV_CONFIG.ADMIN_USER_ID}/notificaciones`, notificationId);
        await updateDoc(notificationRef, {
          leido: true,
          readAt: new Date()
        });
        console.log(`✅ Successfully marked notification ${notificationId} as read in notificaciones`);
        return;
      } catch (error) {
        console.log(`❌ Failed to update notification ${notificationId}:`, error.message);
      }
      
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Función para eliminar notificación
  const deleteNotification = async (notificationId) => {
    try {
      console.log(`🗑️ Deleting notification ${notificationId} for phone ${phoneNumber}`);
      
      // Try to delete from clientNotifications collection first
      try {
        const clientNotificationRef = doc(db, `artifacts/${appId}/users/${ENV_CONFIG.ADMIN_USER_ID}/clientNotifications`, notificationId);
        await deleteDoc(clientNotificationRef);
        console.log(`✅ Successfully deleted client notification ${notificationId}`);
        
        // Update local state
        setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
        return;
      } catch (error) {
        console.log(`❌ Failed to delete client notification ${notificationId}:`, error.message);
      }
      
      // If not found in clientNotifications, try in regular notificaciones collection
      try {
        const notificationRef = doc(db, `artifacts/${appId}/users/${ENV_CONFIG.ADMIN_USER_ID}/notificaciones`, notificationId);
        await deleteDoc(notificationRef);
        console.log(`✅ Successfully deleted notification ${notificationId} from notificaciones`);
        
        // Update local state
        setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
        return;
      } catch (error) {
        console.log(`❌ Failed to delete notification ${notificationId}:`, error.message);
      }
      
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Función para obtener estado del pedido con descripción amigable
  const getOrderStatusDescription = (estado) => {
    const statusMap = {
      'Pendiente': {
        description: 'Tu pedido ha sido recibido y está siendo procesado',
        icon: '⏳',
        color: 'text-yellow-600'
      },
      'Confirmado': {
        description: 'Tu pedido ha sido confirmado y está en preparación',
        icon: '✅',
        color: 'text-blue-600'
      },
      'Enviado': {
        description: 'Tu pedido está en camino',
        icon: '🚚',
        color: 'text-purple-600'
      },
      'Entregado': {
        description: 'Tu pedido ha sido entregado exitosamente',
        icon: '📦',
        color: 'text-green-600'
      },
      'Cancelado': {
        description: 'Este pedido ha sido cancelado',
        icon: '❌',
        color: 'text-red-600'
      }
    };

    return statusMap[estado] || {
      description: 'Estado del pedido no disponible',
      icon: '❓',
      color: 'text-gray-600'
    };
  };

  return {
    userPedidos,
    loading,
    userProfile,
    notifications,
    offers,
    sendMessageToAdmin,
    markNotificationAsRead,
    deleteNotification,
    refreshNotifications,
    fetchAllMessages,
    subscribeToAdminResponses,
    getOrderStatusDescription
  };
};
