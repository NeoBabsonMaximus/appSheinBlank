// Notificaciones Controller - Business Logic for Notifications Management
import { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { 
  subscribeToNotifications, 
  createNotification, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  generateAutomaticNotifications,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITY
} from '../models/notificacionesModel';

const useNotificacionesController = (userId = 'demo-user', appId = 'shein-app') => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('all');
  const [filtroLeido, setFiltroLeido] = useState('all');

  // Subscribe to notifications
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(db, userId, appId, (notificationsData) => {
      setNotificaciones(notificationsData);
      setLoading(false);
    });

    return () => {
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

  // Filter notifications
  const notificacionesFiltradas = notificaciones.filter(notif => {
    const cumpleFiltroTipo = filtroTipo === 'all' || notif.tipo === filtroTipo;
    const cumpleFiltroLeido = filtroLeido === 'all' || 
      (filtroLeido === 'leido' && notif.leido) ||
      (filtroLeido === 'no_leido' && !notif.leido);
    
    return cumpleFiltroTipo && cumpleFiltroLeido;
  });

  // Get unread count
  const contadorNoLeidas = notificaciones.filter(notif => !notif.leido).length;

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

    // Filters
    setFiltroTipo,
    setFiltroLeido,

    // Constants
    NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITY
  };
};

export default useNotificacionesController;
