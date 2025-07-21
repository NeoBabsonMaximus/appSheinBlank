// Transacciones Model - Data Layer for Financial Transactions Management
import { 
  collection,
  onSnapshot, 
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { addDocument, updateDocument, deleteDocument } from './pedidosModel';
import { mockData, createMockDashboardSubscription, createMockSubscription } from '../utils/mockData';

// Flag to determine if we should use mock data
let useMockData = false; // Use Firebase for real data storage

// Helper function to get collection reference
const getCollectionRef = (db, userId, appId, collectionName) => {
  return collection(db, `artifacts/${appId}/users/${userId}/${collectionName}`);
};

// Subscribe to transactions data
export const subscribeToTransacciones = (db, userId, appId, callback) => {
  // Use mock data if Firebase is not accessible
  if (useMockData) {
    console.log('Using mock data for transacciones subscription');
    return createMockSubscription(mockData.transacciones, callback);
  }

  try {
    const q = query(getCollectionRef(db, userId, appId, 'transacciones'), orderBy('fecha', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const transaccionesData = snapshot.docs.map(doc => {
        const fechaData = doc.data().fecha;
        let fecha;
        
        // Handle different date formats
        if (fechaData && typeof fechaData.toDate === 'function') {
          // Firebase Timestamp
          fecha = fechaData.toDate().toISOString().split('T')[0];
        } else if (fechaData instanceof Date) {
          // Already a Date object
          fecha = fechaData.toISOString().split('T')[0];
        } else if (typeof fechaData === 'string') {
          // String date
          fecha = fechaData;
        } else {
          fecha = fechaData;
        }
        
        return {
          id: doc.id,
          ...doc.data(),
          fecha: fecha,
        };
      });
      callback(transaccionesData);
    }, (error) => {
      console.error("Error al obtener transacciones:", error);
      // Switch to mock data on permission error
      if (error.code === 'permission-denied' || error.code === 'unavailable') {
        console.warn('Transacciones subscription failed, switching to mock data');
        useMockData = true;
        return subscribeToTransacciones(db, userId, appId, callback);
      }
    });
  } catch (error) {
    console.error("Error setting up transacciones subscription:", error);
    useMockData = true;
    return subscribeToTransacciones(db, userId, appId, callback);
  }
};

// Subscribe to dashboard statistics
export const subscribeToDashboardStats = (db, userId, appId, callbacks) => {
  const { onPendingOrdersChange, onDeliveredTodayChange, onWeeklyRevenueChange } = callbacks;

  // Use mock data if Firebase is not accessible
  if (useMockData) {
    console.log('Using mock data for dashboard stats');
    return createMockDashboardSubscription(callbacks);
  }

  try {
    // Pending orders count
    const qPending = query(
      getCollectionRef(db, userId, appId, 'pedidos'),
      where('isArchived', '==', false),
      where('estado', '==', 'Pendiente')
    );
    const unsubscribePending = onSnapshot(qPending, (snapshot) => {
      onPendingOrdersChange(snapshot.size);
    }, (error) => {
      console.error("Error al obtener pedidos pendientes:", error);
      // Switch to mock data on permission error
      if (error.code === 'permission-denied' || error.code === 'unavailable') {
        console.warn('Dashboard stats failed, switching to mock data');
        useMockData = true;
        return subscribeToDashboardStats(db, userId, appId, callbacks);
      }
    });

    // Delivered today count
    const qDelivered = query(
      getCollectionRef(db, userId, appId, 'pedidos'),
      where('isArchived', '==', false),
      where('estado', '==', 'Entregado')
    );
    const unsubscribeDelivered = onSnapshot(qDelivered, (snapshot) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let count = 0;
      snapshot.forEach(doc => {
        const fechaData = doc.data().fechaActualizacion;
        let fechaActualizacion;
        
        // Handle different date formats
        if (fechaData && typeof fechaData.toDate === 'function') {
          // Firebase Timestamp
          fechaActualizacion = fechaData.toDate();
        } else if (fechaData instanceof Date) {
          // Already a Date object
          fechaActualizacion = fechaData;
        } else if (typeof fechaData === 'string') {
          // String date
          fechaActualizacion = new Date(fechaData);
        }
        
        if (fechaActualizacion && fechaActualizacion.toDateString() === today.toDateString()) {
        count++;
      }
    });
    onDeliveredTodayChange(count);
  }, (error) => {
    console.error("Error al obtener pedidos entregados hoy:", error);
  });

  // Weekly revenue
  const qRevenue = query(
    getCollectionRef(db, userId, appId, 'transacciones'),
    where('tipo', '==', 'Ingreso')
  );
  const unsubscribeRevenue = onSnapshot(qRevenue, (snapshot) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    let totalRevenue = 0;
    snapshot.forEach(doc => {
      const fechaData = doc.data().fecha;
      let fechaTransaccion;
      
      // Handle different date formats
      if (fechaData && typeof fechaData.toDate === 'function') {
        // Firebase Timestamp
        fechaTransaccion = fechaData.toDate();
      } else if (fechaData instanceof Date) {
        // Already a Date object
        fechaTransaccion = fechaData;
      } else if (typeof fechaData === 'string') {
        // String date
        fechaTransaccion = new Date(fechaData);
      }
      
      if (fechaTransaccion && fechaTransaccion >= sevenDaysAgo) {
        totalRevenue += doc.data().monto || 0;
      }
    });
    onWeeklyRevenueChange(totalRevenue);
  }, (error) => {
    console.error("Error al obtener ingresos semanales:", error);
  });

  return () => {
    unsubscribePending();
    unsubscribeDelivered();
    unsubscribeRevenue();
  };
  } catch (error) {
    console.error("Error setting up dashboard subscriptions:", error);
    useMockData = true;
    return subscribeToDashboardStats(db, userId, appId, callbacks);
  }
};

// Transaction CRUD operations using generic functions
export const addTransaccion = (db, userId, appId, transaccionData) => {
  return addDocument(db, userId, appId, 'transacciones', {
    ...transaccionData,
    monto: parseFloat(transaccionData.monto || 0),
    fecha: transaccionData.fecha, // Keep as string to avoid Date object issues
  });
};

export const updateTransaccion = (db, userId, appId, transaccionId, transaccionData) => {
  return updateDocument(db, userId, appId, 'transacciones', transaccionId, {
    ...transaccionData,
    monto: parseFloat(transaccionData.monto || 0),
    fecha: transaccionData.fecha, // Keep as string to avoid Date object issues
  });
};

export const deleteTransaccion = (db, userId, appId, transaccionId) => {
  return deleteDocument(db, userId, appId, 'transacciones', transaccionId);
};
