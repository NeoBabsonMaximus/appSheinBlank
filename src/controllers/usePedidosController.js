// Pedidos Controller - Business Logic for Orders Management
import { useState, useEffect, useRef } from 'react';
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
import { generateUniqueToken } from '../utils/formatters';

export const usePedidosController = (db, userId, appId) => {
  const [pedidos, setPedidos] = useState([]);
  const [currentPedido, setCurrentPedido] = useState({
    nombreCliente: '',
    numeroTelefono: '',
    productos: [],
    precioTotal: 0,
    estado: 'pendiente',
    fechaEstimadaLlegada: '',
    numeroRastreo: '',
    saldoPendiente: 0,
    pagado: false,
  });
  const [editingId, setEditingId] = useState(null);
  const isLocallyEditingRef = useRef(false);

  useEffect(() => {
    if (!db || !userId) {
      return;
    }

    const unsubscribe = subscribeToPedidos(db, userId, appId, (pedidosData) => {
      console.log("📥 Datos recibidos de Firestore:", pedidosData.length, "pedidos");
      console.log("🔒 IsLocallyEditing:", isLocallyEditingRef.current);
      console.log("🆔 EditingId actual:", editingId);
      
      // Siempre actualizar la lista de pedidos
      setPedidos(pedidosData);
      
      // Si estamos editando un pedido, actualizar también el currentPedido con los datos más recientes
      if (editingId && !isLocallyEditingRef.current) {
        const updatedPedido = pedidosData.find(p => p.id === editingId);
        if (updatedPedido) {
          console.log("🔄 Actualizando currentPedido con datos de Firestore");
          setCurrentPedido({
            ...updatedPedido,
            productos: updatedPedido.productos || [],
            fechaEstimadaLlegada: updatedPedido.fechaEstimadaLlegada ? 
              new Date(updatedPedido.fechaEstimadaLlegada).toISOString().split('T')[0] : '',
          });
        }
      } else if (isLocallyEditingRef.current) {
        console.log("⏸️ Pausando actualización de currentPedido - editando localmente");
      } else {
        console.log("✅ Actualizando solo lista de pedidos");
      }
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [db, userId, appId, editingId]);

  const calculateTotals = (products) => {
    const total = products.reduce((sum, item) => sum + item.subtotal, 0);
    return {
      totalPrice: total,
      newSaldoPendiente: total,
    };
  };

  const addProductToCurrentPedido = (newProduct) => {
    console.log("➕ Agregando producto:", newProduct);
    console.log("📝 Productos antes de agregar:", currentPedido.productos);
    isLocallyEditingRef.current = true;
    
    // Agregar campos de tracking al nuevo producto
    const productWithTracking = {
      ...newProduct,
      estado: 'pendiente', // Estados: 'pendiente', 'en_transito', 'llegado', 'entregado'
      fechaLlegada: null,
      fechaEntrega: null
    };
    
    const updatedProducts = [...currentPedido.productos, productWithTracking];
    const { totalPrice, newSaldoPendiente } = calculateTotals(updatedProducts);
    console.log("📝 Productos después de agregar:", updatedProducts);
    setCurrentPedido({
      ...currentPedido,
      productos: updatedProducts,
      precioTotal: totalPrice,
      saldoPendiente: newSaldoPendiente,
    });
    
    // NO resetear el flag aquí - se reseteará después del guardado automático
  };

  const removeProductFromCurrentPedido = (indexToRemove) => {
    console.log("🗑️ Eliminando producto en índice:", indexToRemove);
    console.log("📝 Productos antes de eliminar:", currentPedido.productos);
    console.log("📝 Índice a eliminar:", indexToRemove);
    
    // Activar modo de edición local
    isLocallyEditingRef.current = true;
    
    const updatedProducts = currentPedido.productos.filter((_, index) => {
      console.log(`Comparando índice ${index} con ${indexToRemove}: ${index !== indexToRemove ? 'MANTENER' : 'ELIMINAR'}`);
      return index !== indexToRemove;
    });
    console.log("📝 Productos después de eliminar:", updatedProducts);
    
    const { totalPrice, newSaldoPendiente } = calculateTotals(updatedProducts);
    setCurrentPedido({
      ...currentPedido,
      productos: updatedProducts,
      precioTotal: totalPrice,
      saldoPendiente: newSaldoPendiente,
    });
    
    // NO resetear el flag aquí - se reseteará después del guardado automático
  };

  const editProductInCurrentPedido = (indexToEdit, updatedProduct) => {
    isLocallyEditingRef.current = true;
    const updatedProducts = [...currentPedido.productos];
    updatedProducts[indexToEdit] = updatedProduct;
    const { totalPrice, newSaldoPendiente } = calculateTotals(updatedProducts);
    setCurrentPedido({
      ...currentPedido,
      productos: updatedProducts,
      precioTotal: totalPrice,
      saldoPendiente: newSaldoPendiente,
    });
    
    // NO resetear el flag aquí - se reseteará después del guardado automático
  };

  const updateProductStatus = (productIndex, newStatus, fechaLlegada = null, fechaEntrega = null) => {
    console.log(`📦 Actualizando estado del producto ${productIndex} a: ${newStatus}`);
    isLocallyEditingRef.current = true;
    
    const updatedProducts = [...currentPedido.productos];
    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      estado: newStatus,
      fechaLlegada: newStatus === 'llegado' || newStatus === 'entregado' ? (fechaLlegada || new Date().toISOString().split('T')[0]) : updatedProducts[productIndex].fechaLlegada,
      fechaEntrega: newStatus === 'entregado' ? (fechaEntrega || new Date().toISOString().split('T')[0]) : updatedProducts[productIndex].fechaEntrega
    };
    
    setCurrentPedido({
      ...currentPedido,
      productos: updatedProducts,
    });
    
    // Guardar automáticamente el cambio de estado
    setTimeout(() => {
      savePedido().catch(error => {
        console.error("Error al guardar cambio de estado:", error);
      });
    }, 100);
  };

  const savePedido = async () => {
    try {
      if (currentPedido.productos.length === 0) {
        throw new Error("No se puede guardar un pedido sin productos.");
      }

      // Limpiar número de teléfono sin agregar código de país automáticamente
      let cleanPhoneNumber = currentPedido.numeroTelefono.toString().replace(/\D/g, '');
      
      // Si tiene 12 dígitos y empieza con 52, quitar el 52
      if (cleanPhoneNumber.length === 12 && cleanPhoneNumber.startsWith('52')) {
        cleanPhoneNumber = cleanPhoneNumber.substring(2);
      }
      
      // Si tiene prefijos mexicanos, quitarlos
      if (cleanPhoneNumber.startsWith('044') || cleanPhoneNumber.startsWith('045')) {
        cleanPhoneNumber = cleanPhoneNumber.substring(3);
      } else if (cleanPhoneNumber.startsWith('01')) {
        cleanPhoneNumber = cleanPhoneNumber.substring(2);
      }

      let clienteIdToUse = currentPedido.clienteId;
      if (currentPedido.nombreCliente && cleanPhoneNumber) {
        let existingClient = await getClientByPhoneNumber(db, userId, appId, cleanPhoneNumber);

        if (existingClient) {
          clienteIdToUse = existingClient.id;
          if (existingClient.nombre !== currentPedido.nombreCliente) {
            await updateCliente(db, userId, appId, existingClient.id, { nombre: currentPedido.nombreCliente });
          }
        } else {
          const newClientId = await addCliente(db, userId, appId, {
            nombre: currentPedido.nombreCliente,
            contacto: cleanPhoneNumber,
          });
          clienteIdToUse = newClientId;
        }
      }

      const dataToSave = {
        ...currentPedido,
        clienteId: clienteIdToUse,
        numeroTelefono: cleanPhoneNumber,
        pagado: currentPedido.saldoPendiente <= 0.01,
      };

      if (editingId) {
        await updateDocument(db, userId, appId, 'pedidos', editingId, dataToSave);
      } else {
        await addDocument(db, userId, appId, 'pedidos', dataToSave);
      }

      console.log("💾 Guardado completado, esperando antes de resetear flag...");
      
      // Esperar un momento para que Firestore procese el cambio completamente
      setTimeout(() => {
        console.log("🔓 Reseteando isLocallyEditing después de guardar exitosamente");
        isLocallyEditingRef.current = false;
        
        // Forzar una actualización inmediata si hay datos pendientes
        setTimeout(() => {
          console.log("🔄 Verificando actualizaciones pendientes de Firestore...");
          // No hacer nada aquí, solo esperar a que Firestore se sincronice
        }, 100);
      }, 500); // Tiempo más largo para asegurar que Firestore procese
      
      // Solo resetear el pedido si NO estamos editando un pedido existente
      if (!editingId) {
        resetCurrentPedido(false); // No resetear el flag aquí, se hace en el setTimeout
      }
      
      return true;
    } catch (error) {
      console.error("Error al guardar pedido:", error);
      // En caso de error, resetear el flag también
      isLocallyEditingRef.current = false;
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
      let sharedDocId = null;

      // Check if shared document already exists
      const q = query(
        collection(db, `artifacts/${appId}/public/data/sharedPedidos`),
        where('originalPedidoId', '==', pedido.id)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Document exists, get token and document ID
        const existingDoc = querySnapshot.docs[0];
        token = existingDoc.data().shareableLinkToken;
        sharedDocId = existingDoc.id;
        
        // UPDATE the existing shared document with current pedido data
        await updateDocument(db, userId, appId, 'sharedPedidos', sharedDocId, {
          nombreCliente: pedido.nombreCliente,
          productos: pedido.productos,
          precioTotal: pedido.precioTotal,
          estado: pedido.estado,
          fechaEstimadaLlegada: pedido.fechaEstimadaLlegada,
          numeroRastreo: pedido.numeroRastreo,
          saldoPendiente: pedido.saldoPendiente,
          pagado: pedido.pagado,
        }, true);
        
        console.log("🔄 Enlace compartido actualizado con datos más recientes");
      } else {
        // Create new shared document
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
        
        console.log("🆕 Nuevo enlace compartido creado");
      }

      if (pedido.shareableLinkToken !== token) {
        await updateDocument(db, userId, appId, 'pedidos', pedido.id, { shareableLinkToken: token });
      }

      // Use the deployed web URL instead of local origin for mobile compatibility
      const webUrl = 'https://appsheinblank.web.app';
      const shareLink = `${webUrl}/?view=share&token=${token}`;
      
      return shareLink;
    } catch (error) {
      console.error("Error al generar enlace compartible:", error);
      throw error;
    }
  };

  const resetCurrentPedido = (resetEditingFlag = true) => {
    setCurrentPedido({
      clienteId: '', nombreCliente: '', numeroTelefono: '', productos: [], precioTotal: 0, estado: 'Pendiente',
      fechaEstimadaLlegada: '', numeroRastreo: '', saldoPendiente: 0, pagado: false, isArchived: false, shareableLinkToken: '',
    });
    setEditingId(null);
    
    // Solo resetear el flag si se especifica (para casos como cancelar edición)
    if (resetEditingFlag) {
      isLocallyEditingRef.current = false;
    }
  };

  const setCurrentPedidoForEdit = (pedido) => {
    // Asegurar que tomamos la versión más reciente del pedido de la lista
    const latestPedido = pedidos.find(p => p.id === pedido.id) || pedido;
    
    console.log("🔧 setCurrentPedidoForEdit llamado con pedido:", pedido.id);
    console.log("📋 Productos en pedido original:", pedido.productos?.length || 0);
    console.log("📋 Productos en pedido más reciente:", latestPedido.productos?.length || 0);
    
    // Migrar productos existentes para que tengan campos de tracking
    const productosWithTracking = (latestPedido.productos || []).map(producto => ({
      ...producto,
      estado: producto.estado || 'pendiente',
      fechaLlegada: producto.fechaLlegada || null,
      fechaEntrega: producto.fechaEntrega || null
    }));
    
    setEditingId(latestPedido.id);
    isLocallyEditingRef.current = true; // Activar modo de edición local cuando se abre un pedido para editar
    setCurrentPedido({
      ...latestPedido,
      productos: productosWithTracking,
      fechaEstimadaLlegada: latestPedido.fechaEstimadaLlegada ? 
        new Date(latestPedido.fechaEstimadaLlegada).toISOString().split('T')[0] : '',
    });
  };

  return {
    pedidos,
    currentPedido,
    setCurrentPedido,
    editingId,
    addProductToCurrentPedido,
    removeProductFromCurrentPedido,
    editProductInCurrentPedido,
    updateProductStatus,
    savePedido,
    deletePedido,
    archivePedido,
    processPayment,
    generateShareLink,
    resetCurrentPedido,
    setCurrentPedidoForEdit,
  };
};
