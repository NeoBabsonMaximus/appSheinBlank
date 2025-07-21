// Productos Model - Data Layer for Product Catalog Management
import { 
  collection,
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { addDocument, updateDocument, deleteDocument } from './pedidosModel';
import { mockData, createMockSubscription } from '../utils/mockData';

// Flag to determine if we should use mock data
let useMockData = false; // Use Firebase for real data storage

// Helper function to get collection reference
const getCollectionRef = (db, userId, appId, collectionName) => {
  return collection(db, `artifacts/${appId}/users/${userId}/${collectionName}`);
};

// Subscribe to products data
export const subscribeToProductos = (db, userId, appId, callback) => {
  // Use mock data if Firebase is not accessible
  if (useMockData) {
    console.log('Using mock data for productos subscription');
    return createMockSubscription(mockData.productos, callback);
  }

  try {
    const q = query(getCollectionRef(db, userId, appId, 'productos'), orderBy('fechaCreacion', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const productosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(productosData);
    }, (error) => {
      console.error("Error al obtener productos:", error);
      // Switch to mock data on permission error
      if (error.code === 'permission-denied' || error.code === 'unavailable') {
        console.warn('Productos subscription failed, switching to mock data');
        useMockData = true;
        return subscribeToProductos(db, userId, appId, callback);
      }
    });
  } catch (error) {
    console.error("Error setting up productos subscription:", error);
    useMockData = true;
    return subscribeToProductos(db, userId, appId, callback);
  }
};

// Product CRUD operations using generic functions
export const addProducto = (db, userId, appId, productoData) => {
  return addDocument(db, userId, appId, 'productos', {
    ...productoData,
    precioSugerido: parseFloat(productoData.precioSugerido || 0),
  });
};

export const updateProducto = (db, userId, appId, productoId, productoData) => {
  return updateDocument(db, userId, appId, 'productos', productoId, {
    ...productoData,
    precioSugerido: parseFloat(productoData.precioSugerido || 0),
  });
};

export const deleteProducto = (db, userId, appId, productoId) => {
  return deleteDocument(db, userId, appId, 'productos', productoId);
};
