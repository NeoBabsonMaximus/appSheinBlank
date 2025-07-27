// Script para crear pedidos de prueba
import pkg from './firebase-test-config.js';
const { db } = pkg;
import { addDoc, collection } from 'firebase/firestore';

const createTestPedidos = async () => {
  console.log('🔧 Creando pedidos de prueba...');
  
  const userId = 'zpVKGnsFlGM3scVLT6GTSVQGjTr2';
  const appId = 'dev-local-app-id';
  
  const testPedidos = [
    {
      nombreCliente: 'Juan Pérez',
      numeroTelefono: '4424567890',
      productos: [
        { nombre: 'Camiseta', cantidad: 2, precio: 25.99 },
        { nombre: 'Pantalón', cantidad: 1, precio: 45.99 }
      ],
      precioTotal: 97.97,
      estado: 'pendiente',
      fechaEstimadaLlegada: '2025-08-01',
      numeroRastreo: 'ABC123456',
      saldoPendiente: 50.00,
      pagado: false,
      isArchived: false,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    },
    {
      nombreCliente: 'María García',
      numeroTelefono: '4429876543',
      productos: [
        { nombre: 'Vestido', cantidad: 1, precio: 65.99 }
      ],
      precioTotal: 65.99,
      estado: 'en_transito',
      fechaEstimadaLlegada: '2025-07-30',
      numeroRastreo: 'XYZ789012',
      saldoPendiente: 0,
      pagado: true,
      isArchived: false,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    },
    {
      nombreCliente: 'Carlos López',
      numeroTelefono: '4421234567',
      productos: [
        { nombre: 'Zapatos', cantidad: 1, precio: 89.99 },
        { nombre: 'Calcetines', cantidad: 3, precio: 12.99 }
      ],
      precioTotal: 128.96,
      estado: 'entregado',
      fechaEstimadaLlegada: '2025-07-25',
      numeroRastreo: 'DEF345678',
      saldoPendiente: 0,
      pagado: true,
      isArchived: false,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    }
  ];
  
  try {
    const collectionPath = `artifacts/${appId}/users/${userId}/pedidos`;
    console.log('📁 Creando en colección:', collectionPath);
    
    for (const pedido of testPedidos) {
      const docRef = await addDoc(collection(db, collectionPath), pedido);
      console.log(`✅ Pedido creado: ${docRef.id} - ${pedido.nombreCliente}`);
    }
    
    console.log('🎉 ¡Todos los pedidos de prueba fueron creados exitosamente!');
    
  } catch (error) {
    console.error('❌ Error creando pedidos:', error);
  }
};

// Ejecutar
createTestPedidos();
