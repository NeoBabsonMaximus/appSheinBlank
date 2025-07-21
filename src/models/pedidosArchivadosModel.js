// Pedidos Archivados Model - Data Layer for Archived Orders Management
import { 
  collection, 
  onSnapshot, 
  query, 
  where,
  updateDoc,
  doc
} from 'firebase/firestore';

// Helper function to get collection reference
const getCollectionRef = (db, userId, appId, collectionName) => {
  return collection(db, `artifacts/${appId}/users/${userId}/${collectionName}`);
};

// Subscribe to archived orders
export const subscribeToArchivedPedidos = (db, userId, appId, callback) => {
  console.log('🗃️ Suscribiéndose a pedidos archivados...');
  
  try {
    const q = query(
      getCollectionRef(db, userId, appId, 'pedidos'), 
      where('isArchived', '==', true)
    );
    
    return onSnapshot(q, (snapshot) => {
      console.log('📊 Pedidos archivados recibidos:', snapshot.docs.length);
      
      const archivedPedidos = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Handle fechaEstimadaLlegada
        let fechaEstimadaLlegada;
        const fechaEstimadaData = data.fechaEstimadaLlegada;
        if (fechaEstimadaData && typeof fechaEstimadaData.toDate === 'function') {
          fechaEstimadaLlegada = fechaEstimadaData.toDate().toISOString().split('T')[0];
        } else if (fechaEstimadaData instanceof Date) {
          fechaEstimadaLlegada = fechaEstimadaData.toISOString().split('T')[0];
        } else {
          fechaEstimadaLlegada = fechaEstimadaData;
        }
        
        // Handle fechaCreacion
        let fechaCreacion;
        const fechaCreacionData = data.fechaCreacion;
        if (fechaCreacionData && typeof fechaCreacionData.toDate === 'function') {
          fechaCreacion = fechaCreacionData.toDate().toLocaleString();
        } else if (fechaCreacionData instanceof Date) {
          fechaCreacion = fechaCreacionData.toLocaleString();
        } else if (typeof fechaCreacionData === 'string') {
          fechaCreacion = fechaCreacionData;
        } else {
          fechaCreacion = 'N/A';
        }
        
        // Handle fechaArchivado
        let fechaArchivado;
        const fechaArchivadoData = data.fechaArchivado;
        if (fechaArchivadoData && typeof fechaArchivadoData.toDate === 'function') {
          fechaArchivado = fechaArchivadoData.toDate().toLocaleString();
        } else if (fechaArchivadoData instanceof Date) {
          fechaArchivado = fechaArchivadoData.toLocaleString();
        } else if (typeof fechaArchivadoData === 'string') {
          fechaArchivado = fechaArchivadoData;
        } else {
          fechaArchivado = 'N/A';
        }
        
        return {
          id: doc.id,
          ...data,
          fechaEstimadaLlegada: fechaEstimadaLlegada,
          fechaCreacion: fechaCreacion,
          fechaArchivado: fechaArchivado,
          productos: data.productos || [],
          precioTotal: data.precioTotal || 0,
          saldoPendiente: data.saldoPendiente || 0,
        };
      });

      console.log('✅ Pedidos archivados procesados:', archivedPedidos);
      callback(archivedPedidos);
    }, (error) => {
      console.error("❌ Error al obtener pedidos archivados:", error);
      // Call callback with empty array and error to handle gracefully
      callback([], error);
    });
  } catch (error) {
    console.error("❌ Error setting up archived pedidos subscription:", error);
  }
};

// Restore archived order
export const restoreArchivedPedido = async (db, userId, appId, pedidoId) => {
  try {
    const docRef = doc(getCollectionRef(db, userId, appId, 'pedidos'), pedidoId);
    await updateDoc(docRef, {
      isArchived: false,
      fechaArchivado: null,
      fechaActualizacion: new Date(),
    });
    console.log('✅ Pedido restaurado exitosamente');
  } catch (error) {
    console.error("❌ Error al restaurar pedido:", error);
    throw error;
  }
};

// Permanently delete archived order
export const deleteArchivedPedido = async (db, userId, appId, pedidoId) => {
  try {
    const { deleteDocument } = await import('./pedidosModel');
    await deleteDocument(db, userId, appId, 'pedidos', pedidoId);
    console.log('✅ Pedido eliminado permanentemente');
  } catch (error) {
    console.error("❌ Error al eliminar pedido permanentemente:", error);
    throw error;
  }
};
