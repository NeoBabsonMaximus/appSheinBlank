// Pedidos Model - Data Layer for Orders Management
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { mockData, createMockSubscription } from '../utils/mockData';

// Flag to determine if we should use mock data
let useMockData = false; // Use Firebase for real data storage

// Helper function to get collection reference
const getCollectionRef = (db, userId, appId, collectionName, isPublic = false) => {
  if (isPublic) {
    return collection(db, `artifacts/${appId}/public/data/${collectionName}`);
  }
  return collection(db, `artifacts/${appId}/users/${userId}/${collectionName}`);
};

// Generic document operations
export const addDocument = async (db, userId, appId, collectionName, data, isPublic = false) => {
  // Check if Firebase is accessible
  if (useMockData) {
    console.log('Using mock data for add operation');
    const newDoc = {
      id: `mock-${Date.now()}`,
      ...data,
      fechaCreacion: new Date().toLocaleString(),
      fechaActualizacion: new Date().toLocaleString(),
    };
    mockData.pedidos.push(newDoc);
    return newDoc.id;
  }

  try {
    const docRef = await addDoc(getCollectionRef(db, userId, appId, collectionName, isPublic), {
      ...data,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    // Switch to mock data if Firebase is not accessible
    if (e.code === 'permission-denied' || e.code === 'unavailable') {
      console.warn('Firebase not accessible, switching to mock data');
      useMockData = true;
      return addDocument(db, userId, appId, collectionName, data, isPublic);
    }
    throw e;
  }
};

export const updateDocument = async (db, userId, appId, collectionName, docId, data, isPublic = false) => {
  // Check if Firebase is accessible
  if (useMockData) {
    console.log('Using mock data for update operation');
    // Find and update in mock data
    const index = mockData.pedidos.findIndex(item => item.id === docId);
    if (index > -1) {
      mockData.pedidos[index] = {
        ...mockData.pedidos[index],
        ...data,
        fechaActualizacion: new Date().toLocaleString(),
      };
    }
    return;
  }

  try {
    const docRef = doc(getCollectionRef(db, userId, appId, collectionName, isPublic), docId);
    await updateDoc(docRef, {
      ...data,
      fechaActualizacion: new Date(),
    });
  } catch (e) {
    console.error("Error updating document: ", e);
    // Switch to mock data if Firebase is not accessible
    if (e.code === 'permission-denied' || e.code === 'unavailable') {
      console.warn('Firebase update failed, switching to mock data');
      useMockData = true;
      return updateDocument(db, userId, appId, collectionName, docId, data, isPublic);
    }
    throw e;
  }
};

export const deleteDocument = async (db, userId, appId, collectionName, docId, isPublic = false) => {
  // Check if Firebase is accessible
  if (useMockData) {
    console.log('Using mock data for delete operation');
    // Find and remove from mock data
    const index = mockData.pedidos.findIndex(item => item.id === docId);
    if (index > -1) {
      mockData.pedidos.splice(index, 1);
    }
    return;
  }

  try {
    await deleteDoc(doc(getCollectionRef(db, userId, appId, collectionName, isPublic), docId));
  } catch (e) {
    console.error("Error deleting document: ", e);
    // Switch to mock data if Firebase is not accessible
    if (e.code === 'permission-denied' || e.code === 'unavailable') {
      console.warn('Firebase delete failed, switching to mock data');
      useMockData = true;
      return deleteDocument(db, userId, appId, collectionName, docId, isPublic);
    }
    throw e;
  }
};

export const getDocumentById = async (db, userId, appId, collectionName, docId, isPublic = false) => {
  try {
    const docRef = doc(getCollectionRef(db, userId, appId, collectionName, isPublic), docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error getting document: ", e);
    throw e;
  }
};

// Pedidos-specific operations
export const subscribeToPedidos = (db, userId, appId, callback) => {
  console.log('🔍 subscribeToPedidos llamado con:', { userId, appId, useMockData });
  
  // Use mock data if Firebase is not accessible
  if (useMockData) {
    console.log('📦 Using mock data for pedidos subscription');
    return createMockSubscription(mockData.pedidos, callback);
  }

  try {
    const collectionPath = `artifacts/${appId}/users/${userId}/pedidos`;
    console.log('📂 Suscribiéndose a colección de pedidos:', collectionPath);
    
    const q = query(getCollectionRef(db, userId, appId, 'pedidos'), where('isArchived', '==', false));
    return onSnapshot(q, (snapshot) => {
      console.log('📊 Snapshot de pedidos recibido con', snapshot.docs.length, 'documentos');
      
      const pedidosData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 Pedido documento:', doc.id, data);
        
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
        
        return {
          id: doc.id,
          ...data,
          fechaEstimadaLlegada: fechaEstimadaLlegada,
          fechaCreacion: fechaCreacion,
          productos: data.productos || [],
          precioTotal: data.precioTotal || 0,
          saldoPendiente: data.saldoPendiente || 0,
        };
      });

    // Sort orders by creation date in memory (descending)
    pedidosData.sort((a, b) => {
      const dateA = a.fechaCreacion === 'N/A' ? 0 : new Date(a.fechaCreacion).getTime();
      const dateB = b.fechaCreacion === 'N/A' ? 0 : new Date(b.fechaCreacion).getTime();
      return dateB - dateA;
    });

    console.log('✅ Pedidos procesados:', pedidosData);
    callback(pedidosData);
  }, (error) => {
    console.error("❌ Error al obtener pedidos:", error);
    // Switch to mock data if Firebase fails
    if (error.code === 'permission-denied' || error.code === 'unavailable') {
      console.warn('⚠️ Firebase subscription failed, switching to mock data');
      useMockData = true;
      return subscribeToPedidos(db, userId, appId, callback);
    }
  });
  } catch (error) {
    console.error("❌ Error setting up pedidos subscription:", error);
    useMockData = true;
    return subscribeToPedidos(db, userId, appId, callback);
  }
};

export const getSharedOrderByToken = async (db, appId, token) => {
  try {
    const q = query(
      collection(db, `artifacts/${appId}/public/data/sharedPedidos`), 
      where('shareableLinkToken', '==', token)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      
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
      
      return {
        ...data,
        fechaEstimadaLlegada: fechaEstimadaLlegada,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al obtener pedido compartido:", error);
    throw error;
  }
};
