// Script para ver mensajes/notificaciones del admin
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, orderBy, query } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA18hvrsBazGjX2iAIKJKRPfofJy81jdC0",
  authDomain: "appsheinblank.firebaseapp.com",
  projectId: "appsheinblank",
  storageBucket: "appsheinblank.firebasestorage.app",
  messagingSenderId: "209741152261",
  appId: "1:209741152261:web:aa475aceb2f64b61b69c6c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const checkAdminMessages = async () => {
  console.log('📨 Verificando mensajes del administrador...');
  
  const userId = 'zpVKGnsFlGM3scVLT6GTSVQGjTr2';
  const appId = 'dev-local-app-id';
  
  try {
    // Verificar notificaciones
    console.log('🔔 Verificando notificaciones...');
    const notificacionesRef = collection(db, `artifacts/${appId}/users/${userId}/notificaciones`);
    const notificacionesSnapshot = await getDocs(notificacionesRef);
    
    console.log(`Total notificaciones: ${notificacionesSnapshot.size}`);
    
    notificacionesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('📄 Notificación:');
      console.log(`  - ID: ${doc.id}`);
      console.log(`  - Tipo: ${data.tipo}`);
      console.log(`  - Título: ${data.titulo}`);
      console.log(`  - Mensaje: ${data.mensaje}`);
      console.log(`  - De cliente: ${data.clientePhone || 'N/A'}`);
      console.log(`  - Pedido ID: ${data.pedidoId || 'N/A'}`);
      console.log(`  - Fecha: ${data.fechaCreacion ? new Date(data.fechaCreacion.seconds * 1000).toLocaleString() : 'N/A'}`);
      console.log(`  - Leído: ${data.read ? 'Sí' : 'No'}`);
      console.log('---');
    });
    
    // También verificar mensajes si hay una colección separada
    console.log('💬 Verificando mensajes...');
    try {
      const mensajesRef = collection(db, `artifacts/${appId}/users/${userId}/mensajes`);
      const mensajesSnapshot = await getDocs(mensajesRef);
      
      console.log(`Total mensajes: ${mensajesSnapshot.size}`);
      
      mensajesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log('💌 Mensaje:');
        console.log(`  - ID: ${doc.id}`);
        console.log(`  - De: ${data.from || data.clientePhone}`);
        console.log(`  - Mensaje: ${data.message || data.mensaje}`);
        console.log(`  - Pedido: ${data.pedidoId}`);
        console.log(`  - Fecha: ${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : 'N/A'}`);
        console.log('---');
      });
    } catch (error) {
      console.log('ℹ️ No hay colección de mensajes separada');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

checkAdminMessages();
