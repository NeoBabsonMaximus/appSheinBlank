// Script para crear pedidos de prueba
import pkg from './firebase-test-config.js';
const { db } = pkg;
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const createTestOrders = async () => {
  console.log('📦 Creando pedidos de prueba...');
  
  const appId = 'dev-local-app-id';
  const userId = 'zpVKGnsFlGM3scVLT6GTSVQGjTr2';
  
  const testOrders = [
    {
      numeroTelefono: '4191059644',
      nombreCliente: 'TATIANA TINAJERO',
      descripcion: 'Blusa Rosa Talla M + Pantalón Negro Talla L',
      precioTotal: 850,
      estado: 'pendiente',
      fechaCreacion: serverTimestamp(),
      fechaUltimaModificacion: serverTimestamp(),
      notas: 'Cliente prefiere entrega por la tarde'
    },
    {
      numeroTelefono: '4463139949',
      nombreCliente: 'MARIA RODRIGUEZ',
      descripcion: 'Vestido Azul Talla S + Zapatos Negros #37',
      precioTotal: 1250,
      estado: 'confirmado',
      fechaCreacion: serverTimestamp(),
      fechaUltimaModificacion: serverTimestamp(),
      notas: 'Pago en efectivo'
    },
    {
      numeroTelefono: '4491234567',
      nombreCliente: 'ANA GOMEZ',
      descripcion: 'Conjunto deportivo completo + Tenis blancos',
      precioTotal: 980,
      estado: 'en_proceso',
      fechaCreacion: serverTimestamp(),
      fechaUltimaModificacion: serverTimestamp(),
      notas: 'Cliente solicita envío urgente'
    }
  ];
  
  try {
    const pedidosRef = collection(db, `artifacts/${appId}/users/${userId}/pedidos`);
    
    for (const order of testOrders) {
      const docRef = await addDoc(pedidosRef, order);
      console.log(`✅ Pedido creado: ${docRef.id} - ${order.nombreCliente}`);
    }
    
    console.log('\n🎉 ¡Todos los pedidos de prueba creados exitosamente!');
    
  } catch (error) {
    console.error('❌ Error creando pedidos:', error);
  }
};

createTestOrders();
