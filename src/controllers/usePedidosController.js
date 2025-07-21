// Pedidos Controller - Business Logic for Orders Management
import { useState, useEffect } from 'react';
import { 
  subscribeToPedidos, 
  addDocument, 
  updateDocument, 
  deleteDocument
} from '../models/pedidosModel';
import { 
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { getClientByPhoneNumber, addCliente, updateCliente } from '../models/clientesModel';
import { addTransaccion } from '../models/transaccionesModel';
import { formatPhoneNumber, generateUniqueToken } from '../utils/formatters';

export const usePedidosController = (db, userId, appId) => {
  const [pedidos, setPedidos] = useState([]);
  const [currentPedido, setCurrentPedido] = useState({
    clienteId: '',
    nombreCliente: '',
    numeroTelefono: '',
    productos: [],
    precioTotal: 0,
    estado: 'Pendiente',
    fechaEstimadaLlegada: '',
    numeroRastreo: '',
    saldoPendiente: 0,
    pagado: false,
    isArchived: false,
    shareableLinkToken: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!db || !userId) return;

    const unsubscribe = subscribeToPedidos(db, userId, appId, setPedidos);
    return unsubscribe;
  }, [db, userId, appId]);

  const calculateTotals = (products) => {
    const total = products.reduce((sum, item) => sum + item.subtotal, 0);
    return {
      totalPrice: total,
      newSaldoPendiente: total,
    };
  };

  const addProductToCurrentPedido = (newProduct) => {
    const updatedProducts = [...currentPedido.productos, newProduct];
    const { totalPrice, newSaldoPendiente } = calculateTotals(updatedProducts);
    setCurrentPedido({
      ...currentPedido,
      productos: updatedProducts,
      precioTotal: totalPrice,
      saldoPendiente: newSaldoPendiente,
    });
  };

  const removeProductFromCurrentPedido = (indexToRemove) => {
    const updatedProducts = currentPedido.productos.filter((_, index) => index !== indexToRemove);
    const { totalPrice, newSaldoPendiente } = calculateTotals(updatedProducts);
    setCurrentPedido({
      ...currentPedido,
      productos: updatedProducts,
      precioTotal: totalPrice,
      saldoPendiente: newSaldoPendiente,
    });
  };

  const savePedido = async () => {
    try {
      if (currentPedido.productos.length === 0) {
        throw new Error("No se puede guardar un pedido sin productos.");
      }

      const formattedPhoneNumber = formatPhoneNumber(currentPedido.numeroTelefono);

      let clienteIdToUse = currentPedido.clienteId;
      if (currentPedido.nombreCliente && formattedPhoneNumber) {
        let existingClient = await getClientByPhoneNumber(db, userId, appId, formattedPhoneNumber);

        if (existingClient) {
          clienteIdToUse = existingClient.id;
          if (existingClient.nombre !== currentPedido.nombreCliente) {
            await updateCliente(db, userId, appId, existingClient.id, { nombre: currentPedido.nombreCliente });
          }
        } else {
          const newClientId = await addCliente(db, userId, appId, {
            nombre: currentPedido.nombreCliente,
            contacto: formattedPhoneNumber,
          });
          clienteIdToUse = newClientId;
        }
      }

      const dataToSave = {
        ...currentPedido,
        clienteId: clienteIdToUse,
        numeroTelefono: formattedPhoneNumber,
        pagado: currentPedido.saldoPendiente <= 0.01,
      };

      if (editingId) {
        await updateDocument(db, userId, appId, 'pedidos', editingId, dataToSave);
      } else {
        await addDocument(db, userId, appId, 'pedidos', dataToSave);
      }

      resetCurrentPedido();
      return true;
    } catch (error) {
      console.error("Error al guardar pedido:", error);
      throw error;
    }
  };

  const deletePedido = async (id) => {
    try {
      await deleteDocument(db, userId, appId, 'pedidos', id);
      
      // Also delete from shared orders if exists
      const q = query(
        collection(db, `artifacts/${appId}/public/data/sharedPedidos`),
        where('originalPedidoId', '==', id)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDocument(db, userId, appId, 'sharedPedidos', doc.id, true);
      });
    } catch (error) {
      console.error("Error al eliminar pedido:", error);
      throw error;
    }
  };

  const archivePedido = async (pedidoId) => {
    try {
      // Find the order to validate
      const pedido = pedidos.find(p => p.id === pedidoId);
      
      if (pedido && pedido.saldoPendiente > 0) {
        throw new Error("No se puede archivar un pedido que tiene saldo pendiente");
      }
      
      await updateDocument(db, userId, appId, 'pedidos', pedidoId, { isArchived: true });
    } catch (error) {
      console.error("Error al archivar pedido:", error);
      throw error;
    }
  };

  const processPayment = async (pedido, amountToPay, isFullPayment = false) => {
    try {
      const finalAmount = isFullPayment ? pedido.saldoPendiente : amountToPay;
      
      if (finalAmount > pedido.saldoPendiente) {
        throw new Error(`El monto a pagar no puede ser mayor que el saldo pendiente.`);
      }

      const newSaldoPendiente = pedido.saldoPendiente - finalAmount;
      const newPagadoStatus = newSaldoPendiente <= 0.01;

      await updateDocument(db, userId, appId, 'pedidos', pedido.id, {
        saldoPendiente: newSaldoPendiente,
        pagado: newPagadoStatus,
      });

      await addTransaccion(db, userId, appId, {
        tipo: 'Ingreso',
        monto: finalAmount,
        descripcion: `Pago de pedido: ${pedido.nombreCliente} - ${pedido.productos.map(p => p.nombreProducto).join(', ')}`,
        fecha: new Date().toISOString().split('T')[0],
        pedidoId: pedido.id,
        clienteId: pedido.clienteId,
      });

      return true;
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      throw error;
    }
  };

  const generateShareLink = async (pedido) => {
    try {
      let token = pedido.shareableLinkToken;

      // Check if shared document already exists
      const q = query(
        collection(db, `artifacts/${appId}/public/data/sharedPedidos`),
        where('originalPedidoId', '==', pedido.id)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        token = querySnapshot.docs[0].data().shareableLinkToken;
      } else {
        token = generateUniqueToken();
        await addDocument(db, userId, appId, 'sharedPedidos', {
          originalPedidoId: pedido.id,
          shareableLinkToken: token,
          nombreCliente: pedido.nombreCliente,
          productos: pedido.productos,
          precioTotal: pedido.precioTotal,
          estado: pedido.estado,
          fechaEstimadaLlegada: pedido.fechaEstimadaLlegada,
          numeroRastreo: pedido.numeroRastreo,
          saldoPendiente: pedido.saldoPendiente,
          pagado: pedido.pagado,
        }, true);
      }

      if (pedido.shareableLinkToken !== token) {
        await updateDocument(db, userId, appId, 'pedidos', pedido.id, { shareableLinkToken: token });
      }

      const baseUrl = window.location.origin;
      const shareLink = `${baseUrl}/?view=share&token=${token}`;
      
      return shareLink;
    } catch (error) {
      console.error("Error al generar enlace compartible:", error);
      throw error;
    }
  };

  const resetCurrentPedido = () => {
    setCurrentPedido({
      clienteId: '', nombreCliente: '', numeroTelefono: '', productos: [], precioTotal: 0, estado: 'Pendiente',
      fechaEstimadaLlegada: '', numeroRastreo: '', saldoPendiente: 0, pagado: false, isArchived: false, shareableLinkToken: '',
    });
    setEditingId(null);
  };

  const setCurrentPedidoForEdit = (pedido) => {
    setEditingId(pedido.id);
    setCurrentPedido({
      ...pedido,
      productos: pedido.productos || [],
      fechaEstimadaLlegada: pedido.fechaEstimadaLlegada ? 
        new Date(pedido.fechaEstimadaLlegada).toISOString().split('T')[0] : '',
    });
  };

  return {
    pedidos,
    currentPedido,
    setCurrentPedido,
    editingId,
    addProductToCurrentPedido,
    removeProductFromCurrentPedido,
    savePedido,
    deletePedido,
    archivePedido,
    processPayment,
    generateShareLink,
    resetCurrentPedido,
    setCurrentPedidoForEdit,
  };
};
