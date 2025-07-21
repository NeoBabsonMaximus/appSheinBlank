// Pedidos Archivados Controller - Business Logic for Archived Orders Management
import { useState, useEffect } from 'react';
import { 
  subscribeToArchivedPedidos, 
  restoreArchivedPedido, 
  deleteArchivedPedido 
} from '../models/pedidosArchivadosModel';

export const usePedidosArchivadosController = (db, userId, appId) => {
  const [pedidosArchivados, setPedidosArchivados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [error, setError] = useState(null);

  // Subscribe to archived orders
  useEffect(() => {
    if (!db || !userId || !appId) {
      setLoading(false);
      return;
    }

    console.log('🗃️ Iniciando suscripción a pedidos archivados...');
    
    const unsubscribe = subscribeToArchivedPedidos(db, userId, appId, (archivedData, error) => {
      if (error) {
        console.error('❌ Error en suscripción de pedidos archivados:', error);
        setError('Error al cargar pedidos archivados. Por favor intenta más tarde.');
        setLoading(false);
        return;
      }
      
      // Sort by fechaCreacion in descending order on client side
      const sortedData = archivedData.sort((a, b) => {
        const dateA = new Date(a.fechaCreacion);
        const dateB = new Date(b.fechaCreacion);
        return dateB - dateA; // Most recent first
      });
      
      setPedidosArchivados(sortedData);
      setLoading(false);
      setError(null);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [db, userId, appId]);

  // Filter archived orders
  const pedidosFiltrados = pedidosArchivados.filter(pedido => {
    const matchEstado = filtroEstado === 'todos' || pedido.estado === filtroEstado;
    const matchCliente = filtroCliente === '' || 
      pedido.nombreCliente.toLowerCase().includes(filtroCliente.toLowerCase());
    
    return matchEstado && matchCliente;
  });

  // Restore order from archive
  const restaurarPedido = async (pedidoId) => {
    try {
      await restoreArchivedPedido(db, userId, appId, pedidoId);
      return true;
    } catch (error) {
      console.error("Error al restaurar pedido:", error);
      setError("Error al restaurar el pedido");
      return false;
    }
  };

  // Permanently delete order
  const eliminarPermanentemente = async (pedidoId) => {
    try {
      await deleteArchivedPedido(db, userId, appId, pedidoId);
      return true;
    } catch (error) {
      console.error("Error al eliminar pedido permanentemente:", error);
      setError("Error al eliminar el pedido permanentemente");
      return false;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Get statistics
  const estadisticas = {
    total: pedidosArchivados.length,
    porEstado: pedidosArchivados.reduce((acc, pedido) => {
      acc[pedido.estado] = (acc[pedido.estado] || 0) + 1;
      return acc;
    }, {}),
    totalVentas: pedidosArchivados.reduce((sum, pedido) => sum + (pedido.precioTotal || 0), 0),
    saldosPendientes: pedidosArchivados.reduce((sum, pedido) => sum + (pedido.saldoPendiente || 0), 0)
  };

  return {
    // Data
    pedidosArchivados: pedidosFiltrados,
    loading,
    error,
    estadisticas,

    // Filters
    filtroEstado,
    setFiltroEstado,
    filtroCliente,
    setFiltroCliente,

    // Actions
    restaurarPedido,
    eliminarPermanentemente,
    clearError
  };
};
