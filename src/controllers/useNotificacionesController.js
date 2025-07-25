// Notificaciones Controller - Business Logic for Notifications Management
import { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { ENV_CONFIG } from '../config/environment';
import { 
  subscribeToNotifications, 
  createNotification, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  generateAutomaticNotifications,
  sendAdminResponse,
  markMessageAsResponded,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITY
} from '../models/notificacionesModel';

const useNotificacionesController = (
  userId = ENV_CONFIG.ADMIN_USER_ID, 
  appId = ENV_CONFIG.APP_ID
) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('all');
  const [filtroLeido, setFiltroLeido] = useState('all');

  console.log('🔍 Notificaciones Controller iniciado con:', { userId, appId });

  // Subscribe to notifications
  useEffect(() => {
    console.log('📡 Iniciando suscripción a notificaciones...');
    const unsubscribe = subscribeToNotifications(db, userId, appId, (notificationsData) => {
      console.log('📋 Notificaciones recibidas:', notificationsData);
      setNotificaciones(notificationsData);
      setLoading(false);
    });

    return () => {
      console.log('🔌 Desconectando suscripción a notificaciones');
      if (unsubscribe) unsubscribe();
    };
  }, [userId, appId]);

  // Create notification
  const crearNotificacion = useCallback(async (notificationData) => {
    try {
      await createNotification(db, userId, appId, notificationData);
    } catch (error) {
      console.error("Error al crear notificación:", error);
      throw error;
    }
  }, [userId, appId]);

  // Mark as read
  const marcarComoLeido = useCallback(async (notificationId) => {
    try {
      await markAsRead(db, userId, appId, notificationId);
    } catch (error) {
      console.error("Error al marcar como leído:", error);
      throw error;
    }
  }, [userId, appId]);

  // Mark all as read
  const marcarTodoComoLeido = useCallback(async () => {
    try {
      await markAllAsRead(db, userId, appId);
    } catch (error) {
      console.error("Error al marcar todo como leído:", error);
      throw error;
    }
  }, [userId, appId]);

  // Delete notification
  const eliminarNotificacion = useCallback(async (notificationId) => {
    try {
      await deleteNotification(db, userId, appId, notificationId);
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
      throw error;
    }
  }, [userId, appId]);

  // Generate automatic notifications
  const generarNotificacionesAutomaticas = useCallback(async (pedidos, transacciones) => {
    try {
      const count = await generateAutomaticNotifications(db, userId, appId, pedidos, transacciones);
      return count;
    } catch (error) {
      console.error("Error al generar notificaciones automáticas:", error);
      throw error;
    }
  }, [userId, appId]);

  // Helper functions for business events
  const notificarNuevoPedido = useCallback(async (pedido) => {
    await crearNotificacion({
      tipo: NOTIFICATION_TYPES.PEDIDO_NUEVO,
      titulo: 'Nuevo Pedido',
      mensaje: `Nuevo pedido de ${pedido.nombreCliente} por $${pedido.precioTotal}`,
      prioridad: NOTIFICATION_PRIORITY.MEDIUM,
      relacionadoId: pedido.id,
      relacionadoTipo: 'pedido'
    });
  }, [crearNotificacion]);

  const notificarCambioEstadoPedido = useCallback(async (pedido, nuevoEstado) => {
    await crearNotificacion({
      tipo: NOTIFICATION_TYPES.PEDIDO_ESTADO,
      titulo: 'Estado de Pedido Actualizado',
      mensaje: `El pedido ${pedido.id} cambió a: ${nuevoEstado}`,
      prioridad: NOTIFICATION_PRIORITY.MEDIUM,
      relacionadoId: pedido.id,
      relacionadoTipo: 'pedido'
    });
  }, [crearNotificacion]);

  const notificarPagoRecibido = useCallback(async (pedido, monto) => {
    await crearNotificacion({
      tipo: NOTIFICATION_TYPES.PAGO_RECIBIDO,
      titulo: 'Pago Recibido',
      mensaje: `Pago de $${monto} recibido para el pedido ${pedido.id}`,
      prioridad: NOTIFICATION_PRIORITY.HIGH,
      relacionadoId: pedido.id,
      relacionadoTipo: 'pedido'
    });
  }, [crearNotificacion]);

  const notificarNuevoCliente = useCallback(async (cliente) => {
    await crearNotificacion({
      tipo: NOTIFICATION_TYPES.CLIENTE_NUEVO,
      titulo: 'Nuevo Cliente',
      mensaje: `${cliente.nombre} se registró como nuevo cliente`,
      prioridad: NOTIFICATION_PRIORITY.LOW,
      relacionadoId: cliente.id,
      relacionadoTipo: 'cliente'
    });
  }, [crearNotificacion]);

  // Responder mensaje de cliente
  const responderMensajeCliente = useCallback(async (notificationId, clientPhone, responseMessage) => {
    try {
      console.log('📤 Enviando respuesta a cliente:', { notificationId, clientPhone, responseMessage });
      
      // Enviar respuesta al cliente
      await sendAdminResponse(db, appId, clientPhone, responseMessage, notificationId);
      
      // Marcar el mensaje original como respondido
      await markMessageAsResponded(db, userId, appId, notificationId, responseMessage);
      
      console.log('✅ Respuesta enviada exitosamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error enviando respuesta:', error);
      throw error;
    }
  }, [db, userId, appId]);

  // Limpiar notificaciones con números de teléfono inválidos
  const limpiarNotificacionesInvalidas = useCallback(async () => {
    try {
      console.log('🧹 Limpiando notificaciones con números de teléfono inválidos...');
      
      const notificacionesInvalidas = notificaciones.filter(notif => 
        notif.tipo === 'mensaje_cliente' && 
        (!notif.numeroTelefono || 
         notif.numeroTelefono === 'undefined' || 
         notif.numeroTelefono.toString().trim() === '')
      );
      
      console.log(`🗑️ Encontradas ${notificacionesInvalidas.length} notificaciones inválidas`);
      
      for (const notif of notificacionesInvalidas) {
        await eliminarNotificacion(notif.id);
        console.log(`❌ Eliminada notificación inválida: ${notif.id}`);
      }
      
      console.log('✅ Limpieza completada');
      return notificacionesInvalidas.length;
      
    } catch (error) {
      console.error('❌ Error limpiando notificaciones:', error);
      throw error;
    }
  }, [notificaciones, eliminarNotificacion]);

  // Enviar mensaje iniciado por admin (no como respuesta)
  const enviarMensajeAdmin = useCallback(async (clientPhone, message) => {
    try {
      console.log('📤 Admin enviando mensaje inicial a:', clientPhone);
      
      // Limpiar y validar número de teléfono
      let cleanPhone = clientPhone.toString().replace(/\D/g, '');
      if (cleanPhone.length === 12 && cleanPhone.startsWith('52')) {
        cleanPhone = cleanPhone.substring(2);
      }
      
      if (cleanPhone.length < 10) {
        throw new Error('Número de teléfono inválido');
      }
      
      // Enviar mensaje directamente al cliente
      await sendAdminResponse(db, appId, cleanPhone, message);
      
      // Crear una notificación interna para registro (opcional)
      await crearNotificacion({
        tipo: 'mensaje_admin_enviado',
        titulo: `Mensaje enviado a ${cleanPhone}`,
        mensaje: message,
        prioridad: NOTIFICATION_PRIORITY.MEDIUM,
        numeroTelefono: cleanPhone,
        adminIniciado: true
      });
      
      console.log('✅ Mensaje de admin enviado exitosamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error enviando mensaje de admin:', error);
      throw error;
    }
  }, [db, appId, crearNotificacion]);

  // Filter notifications
  const notificacionesFiltradas = notificaciones.filter(notif => {
    const cumpleFiltroTipo = filtroTipo === 'all' || notif.tipo === filtroTipo;
    const cumpleFiltroLeido = filtroLeido === 'all' || 
      (filtroLeido === 'leido' && notif.leido) ||
      (filtroLeido === 'no_leido' && !notif.leido);
    
    // Si el filtro es "all", excluir mensajes de cliente individuales ya que se muestran agrupados
    const noEsMensajeClienteEnAll = !(filtroTipo === 'all' && notif.tipo === 'mensaje_cliente');
    
    return cumpleFiltroTipo && cumpleFiltroLeido && noEsMensajeClienteEnAll;
  });

  // Get unread count
  const contadorNoLeidas = notificaciones.filter(notif => !notif.leido).length;

  // Group client messages by phone number for conversation view
  const agruparMensajesPorTelefono = () => {
    const clientMessages = notificaciones.filter(notif => 
      notif.tipo === 'mensaje_cliente' && 
      notif.numeroTelefono && 
      notif.numeroTelefono !== 'undefined' &&
      notif.numeroTelefono.toString().trim() !== ''
    );
    const grouped = {};
    
    clientMessages.forEach(message => {
      const phone = message.numeroTelefono;
      if (!grouped[phone]) {
        grouped[phone] = [];
      }
      grouped[phone].push(message);
    });
    
    // Convert to array and sort by most recent message
    return Object.entries(grouped)
      .map(([phone, messages]) => ({
        phoneNumber: phone,
        messages: messages.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)),
        lastMessageDate: Math.max(...messages.map(m => new Date(m.fechaCreacion).getTime())),
        unreadCount: messages.filter(m => !m.leido).length
      }))
      .sort((a, b) => b.lastMessageDate - a.lastMessageDate);
  };

  return {
    // Data
    notificaciones: notificacionesFiltradas,
    loading,
    contadorNoLeidas,
    filtroTipo,
    filtroLeido,

    // Actions
    crearNotificacion,
    marcarComoLeido,
    marcarTodoComoLeido,
    eliminarNotificacion,
    generarNotificacionesAutomaticas,
    
    // Business event notifications
    notificarNuevoPedido,
    notificarCambioEstadoPedido,
    notificarPagoRecibido,
    notificarNuevoCliente,
    responderMensajeCliente,
    enviarMensajeAdmin,
    limpiarNotificacionesInvalidas,

    // Filters
    setFiltroTipo,
    setFiltroLeido,

    // Conversation grouping
    agruparMensajesPorTelefono,

    // Constants
    NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITY
  };
};

export default useNotificacionesController;
