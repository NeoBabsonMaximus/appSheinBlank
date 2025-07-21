// Clientes Model - Data Layer for Customer Management
import { 
  collection,
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { addDocument, updateDocument, deleteDocument } from './pedidosModel';
import { mockData, createMockSubscription } from '../utils/mockData';

// Flag to determine if we should use mock data
let useMockData = false; // Use Firebase for real data storage

// Helper function to get collection reference
const getCollectionRef = (db, userId, appId, collectionName) => {
  return collection(db, `artifacts/${appId}/users/${userId}/${collectionName}`);
};

// Subscribe to clients data
export const subscribeToClientes = (db, userId, appId, callback) => {
  // Use mock data if Firebase is not accessible
  if (useMockData) {
    console.log('Using mock data for clientes subscription');
    return createMockSubscription(mockData.clientes, callback);
  }

  try {
    const q = query(getCollectionRef(db, userId, appId, 'clientes'), orderBy('fechaCreacion', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const clientesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(clientesData);
    }, (error) => {
      console.error("Error al obtener clientes:", error);
      // Switch to mock data on permission error
      if (error.code === 'permission-denied' || error.code === 'unavailable') {
        console.warn('Clientes subscription failed, switching to mock data');
        useMockData = true;
        return subscribeToClientes(db, userId, appId, callback);
      }
    });
  } catch (error) {
    console.error("Error setting up clientes subscription:", error);
    useMockData = true;
    return subscribeToClientes(db, userId, appId, callback);
  }
};

// Get client by phone number
export const getClientByPhoneNumber = async (db, userId, appId, phoneNumber) => {
  // Use mock data if Firebase is not accessible
  if (useMockData) {
    console.log('Using mock data for client search');
    const client = mockData.clientes.find(c => c.contacto === phoneNumber);
    return client || null;
  }

  try {
    const q = query(
      getCollectionRef(db, userId, appId, 'clientes'),
      where('contacto', '==', phoneNumber)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    return null;
  } catch (error) {
    console.error("Error al buscar cliente por número de teléfono:", error);
    // Switch to mock data on permission error
    if (error.code === 'permission-denied' || error.code === 'unavailable') {
      console.warn('Client search failed, switching to mock data');
      useMockData = true;
      return getClientByPhoneNumber(db, userId, appId, phoneNumber);
    }
    return null;
  }
};

// Client CRUD operations using generic functions
export const addCliente = (db, userId, appId, clienteData) => {
  return addDocument(db, userId, appId, 'clientes', clienteData);
};

export const updateCliente = (db, userId, appId, clienteId, clienteData) => {
  return updateDocument(db, userId, appId, 'clientes', clienteId, clienteData);
};

export const deleteCliente = (db, userId, appId, clienteId) => {
  return deleteDocument(db, userId, appId, 'clientes', clienteId);
};
