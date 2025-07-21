// OrderShareView - Public Order View (View Layer)
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getSharedOrderByToken } from '../models/pedidosModel';
import Card from '../components/Card';

const OrderShareView = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        // eslint-disable-next-line no-undef
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        // eslint-disable-next-line no-undef
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
          apiKey: "AIzaSyA18hvrsBazGjX2iAIKJKRPfofJy81jdC0",
          authDomain: "appsheinblank.firebaseapp.com",
          projectId: "appsheinblank",
          storageBucket: "appsheinblank.firebasestorage.app",
          messagingSenderId: "209741152261",
          appId: "1:209741152261:web:aa475aceb2f64b61b69c6c",
          measurementId: "G-JQ7Q9MBHPE"
        };

        if (!token) {
          setError('Token de pedido no encontrado en la URL.');
          setLoading(false);
          return;
        }

        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);

        const data = await getSharedOrderByToken(firestoreDb, appId, token);
        
        if (data) {
          setOrderData(data);
        } else {
          setError('Pedido no encontrado o enlace inválido.');
        }
      } catch (err) {
        console.error("Error al cargar el pedido compartido:", err);
        setError('Error al cargar el estado del pedido. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, []);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Enviado': return 'bg-blue-100 text-blue-800';
      case 'Entregado': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-purple-600 text-lg font-semibold">Cargando estado del pedido...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800 p-4">
        <p className="text-center">{error}</p>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <p className="text-center text-gray-600">No se pudo cargar la información del pedido.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto text-center">
        <h2 className="text-3xl font-bold text-purple-700 mb-4">Estado de Tu Pedido SHEIN</h2>
        <p className="text-gray-700 text-lg mb-2">Cliente: <span className="font-semibold">{orderData.nombreCliente}</span></p>

        <div className="mt-4 text-left border-t pt-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Detalles del Pedido:</h3>
          <ul className="list-disc list-inside text-gray-700 mb-2">
            {orderData.productos && orderData.productos.length > 0 ? (
              orderData.productos.map((item, idx) => (
                <li key={idx} className="mb-1">
                  {item.nombreProducto} (x{item.cantidad}) - ${item.subtotal?.toFixed(2) || '0.00'}
                </li>
              ))
            ) : (
              <li>No hay productos registrados para este pedido.</li>
            )}
          </ul>
          <p className="text-gray-800 font-bold text-lg mt-3">Precio Total: ${orderData.precioTotal?.toFixed(2) || '0.00'}</p>
          <p className="text-gray-800 font-bold text-lg">Saldo Pendiente: <span className="text-red-600">${orderData.saldoPendiente?.toFixed(2) || '0.00'}</span></p>

          <div className="mt-4">
            <p className="text-gray-800 text-lg font-bold">Estado Actual:</p>
            <span className={`inline-block px-4 py-2 text-lg font-bold rounded-full ${getEstadoColor(orderData.estado)} mt-2 shadow-md`}>
              {orderData.estado}
            </span>
          </div>

          {orderData.fechaEstimadaLlegada && (
            <p className="text-gray-700 mt-4">Fecha Estimada de Llegada: <span className="font-semibold">{orderData.fechaEstimadaLlegada}</span></p>
          )}
          {orderData.numeroRastreo && (
            <p className="text-gray-700 mt-2">Número de Rastreo: <span className="font-semibold">{orderData.numeroRastreo}</span></p>
          )}
        </div>

        <p className="text-gray-500 text-sm mt-6">
          Para cualquier consulta, por favor contacta a tu revendedora.
        </p>
      </Card>
    </div>
  );
};

export default OrderShareView;
