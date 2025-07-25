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
    numeroPedido: '',
  });
  const [editingId, setEditingId] = useState(null);
  const isLocallyEditingRef = useRef(false);
  const lastSaveTimeRef = useRef(0);
  const isSavingRef = useRef(false);

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
    
    // Agregar campo de completado al nuevo producto
    const productWithCompletion = {
      ...newProduct,
      completed: false // Campo simple para marcar como completado
    };
    
    const updatedProducts = [...currentPedido.productos, productWithCompletion];
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

  const toggleProductCompleted = (productIndex) => {
    console.log(`✅ Cambiando estado de completado del producto ${productIndex}`);
    isLocallyEditingRef.current = true;
    
    const updatedProducts = [...currentPedido.productos];
    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      completed: !updatedProducts[productIndex].completed
    };
    
    setCurrentPedido({
      ...currentPedido,
      productos: updatedProducts,
    });
    
    // Guardar automáticamente solo el cambio de producto, sin notificación de estado
    setTimeout(() => {
      saveProductCompletionOnly(productIndex).catch(error => {
        console.error("Error al guardar cambio de completado:", error);
      });
    }, 100);
  };

  // Función específica para guardar solo cambios de productos sin notificaciones
  const saveProductCompletionOnly = async (productIndex) => {
    try {
      if (!editingId) {
        console.log("⏭️ No es una edición, saltando guardado automático de producto");
        return;
      }

      console.log(`💾 Guardando solo cambio de completado del producto ${productIndex}`);
      
      // Limpiar número de teléfono
      let cleanPhoneNumber = currentPedido.numeroTelefono.toString().replace(/\D/g, '');
      if (cleanPhoneNumber.length === 12 && cleanPhoneNumber.startsWith('52')) {
        cleanPhoneNumber = cleanPhoneNumber.substring(2);
      }

      const dataToSave = {
        ...currentPedido,
        numeroTelefono: cleanPhoneNumber,
        pagado: currentPedido.saldoPendiente <= 0.01,
      };

      await updateDocument(db, userId, appId, 'pedidos', editingId, dataToSave);
      
      console.log("✅ Producto actualizado sin enviar notificación");
      
      setTimeout(() => {
        console.log("🔓 Reseteando isLocallyEditing después de guardar producto");
        isLocallyEditingRef.current = false;
      }, 500);
      
    } catch (error) {
      console.error("❌ Error guardando cambio de producto:", error);
      isLocallyEditingRef.current = false;
    }
  };

  const savePedido = async () => {
    // Prevenir guardados múltiples simultáneos
    if (isSavingRef.current) {
      console.log("⏸️ Ya se está guardando, saltando duplicado");
      return;
    }

    const now = Date.now();
    // Prevenir guardados muy frecuentes (menos de 1 segundo)
    if (now - lastSaveTimeRef.current < 1000) {
      console.log("⏸️ Guardado muy reciente, saltando para evitar spam");
      return;
    }

    isSavingRef.current = true;
    lastSaveTimeRef.current = now;

    try {
      if (currentPedido.productos.length === 0) {
        throw new Error("No se puede guardar un pedido sin productos.");
      }

      console.log("💾 Iniciando guardado de pedido...");

      // Obtener los datos anteriores del pedido si estamos editando
      let previousOrderData = null;
      if (editingId) {
        const existingOrder = pedidos.find(p => p.id === editingId);
        previousOrderData = {
          estado: existingOrder?.estado,
          fechaEstimadaLlegada: existingOrder?.fechaEstimadaLlegada,
          numeroRastreo: existingOrder?.numeroRastreo
        };
        console.log(`📊 Datos anteriores:`, previousOrderData);
        console.log(`📊 Datos nuevos: estado=${currentPedido.estado}, fecha=${currentPedido.fechaEstimadaLlegada}, rastreo=${currentPedido.numeroRastreo}`);
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

      // Generar número de pedido si no existe (solo para pedidos nuevos)
      let numeroPedido = currentPedido.numeroPedido;
      if (!editingId && !numeroPedido) {
        // Generar número secuencial basado en la fecha y cantidad de pedidos
        const today = new Date();
        const datePrefix = today.getFullYear().toString().slice(-2) + 
                          (today.getMonth() + 1).toString().padStart(2, '0') + 
                          today.getDate().toString().padStart(2, '0');
        
        // Obtener el último número de pedido del día para hacer el secuencial
        const todaysPedidos = pedidos.filter(p => {
          const pedidoDate = new Date(p.fechaCreacion);
          return pedidoDate.toDateString() === today.toDateString();
        });
        
        const nextSequence = (todaysPedidos.length + 1).toString().padStart(3, '0');
        numeroPedido = `#${datePrefix}${nextSequence}`;
        
        console.log(`🔢 Número de pedido generado: ${numeroPedido}`);
      }

      const dataToSave = {
        ...currentPedido,
        clienteId: clienteIdToUse,
        numeroTelefono: cleanPhoneNumber,
        pagado: currentPedido.saldoPendiente <= 0.01,
        numeroPedido: numeroPedido,
      };

      if (editingId) {
        await updateDocument(db, userId, appId, 'pedidos', editingId, dataToSave);
        
        // Verificar qué cambios ocurrieron y crear notificaciones apropiadas
        const notifications = [];
        
        // 1. Cambio de estado
        if (previousOrderData.estado && previousOrderData.estado !== currentPedido.estado) {
          const pedidoRef = currentPedido.numeroPedido || `#${editingId.slice(-6)}`;
          notifications.push({
            tipo: 'pedido_actualizado',
            titulo: '📦 Estado de tu pedido actualizado',
            mensaje: `Tu pedido ${pedidoRef} ha cambiado de "${previousOrderData.estado}" a "${currentPedido.estado}"`,
            fechaCreacion: new Date(),
            leido: false,
            prioridad: 'high',
            pedidoId: editingId,
            numeroTelefono: cleanPhoneNumber,
            estadoAnterior: previousOrderData.estado,
            estadoNuevo: currentPedido.estado,
            numeroPedido: currentPedido.numeroPedido
          });
          console.log(`🔔 Estado cambió: "${previousOrderData.estado}" → "${currentPedido.estado}"`);
        }
        
        // 2. Cambio de fecha de llegada
        if (previousOrderData.fechaEstimadaLlegada !== currentPedido.fechaEstimadaLlegada && currentPedido.fechaEstimadaLlegada) {
          const fechaAnterior = previousOrderData.fechaEstimadaLlegada ? 
            new Date(previousOrderData.fechaEstimadaLlegada).toLocaleDateString('es-MX') : 'Sin fecha';
          const fechaNueva = new Date(currentPedido.fechaEstimadaLlegada).toLocaleDateString('es-MX');
          const pedidoRef = currentPedido.numeroPedido || `#${editingId.slice(-6)}`;
          
          notifications.push({
            tipo: 'fecha_actualizada',
            titulo: '📅 Fecha de llegada actualizada',
            mensaje: `La fecha estimada de llegada de tu pedido ${pedidoRef} se actualizó a: ${fechaNueva}`,
            fechaCreacion: new Date(),
            leido: false,
            prioridad: 'medium',
            pedidoId: editingId,
            numeroTelefono: cleanPhoneNumber,
            fechaAnterior: fechaAnterior,
            fechaNueva: fechaNueva,
            numeroPedido: currentPedido.numeroPedido
          });
          console.log(`🔔 Fecha cambió: "${fechaAnterior}" → "${fechaNueva}"`);
        }
        
        // 3. Cambio de número de rastreo
        if (previousOrderData.numeroRastreo !== currentPedido.numeroRastreo && currentPedido.numeroRastreo) {
          const pedidoRef = currentPedido.numeroPedido || `#${editingId.slice(-6)}`;
          notifications.push({
            tipo: 'rastreo_actualizado',
            titulo: '🚚 Número de rastreo disponible',
            mensaje: `Tu pedido ${pedidoRef} ya tiene número de rastreo: ${currentPedido.numeroRastreo}`,
            fechaCreacion: new Date(),
            leido: false,
            prioridad: 'medium',
            pedidoId: editingId,
            numeroTelefono: cleanPhoneNumber,
            numeroRastreo: currentPedido.numeroRastreo,
            numeroPedido: currentPedido.numeroPedido
          });
          console.log(`🔔 Número de rastreo agregado: "${currentPedido.numeroRastreo}"`);
        }
        
        // Enviar todas las notificaciones
        for (const notificationData of notifications) {
          try {
            await addDocument(db, userId, appId, 'clientNotifications', notificationData);
            console.log(`✅ Notificación enviada: ${notificationData.titulo}`);
          } catch (notifError) {
            console.error('❌ Error enviando notificación:', notifError);
          }
        }
        
        if (notifications.length === 0) {
          console.log(`⏭️ Sin cambios relevantes detectados - No se envían notificaciones`);
        }
      } else {
        await addDocument(db, userId, appId, 'pedidos', dataToSave);
        console.log('📝 Nuevo pedido creado - No se envía notificación');
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
    } finally {
      // Siempre resetear el flag de saving
      isSavingRef.current = false;
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

      // Limpiar número de teléfono para la notificación
      let cleanPhoneNumber = pedido.numeroTelefono.toString().replace(/\D/g, '');
      if (cleanPhoneNumber.length === 12 && cleanPhoneNumber.startsWith('52')) {
        cleanPhoneNumber = cleanPhoneNumber.substring(2);
      }

      // Crear notificación de pago
      try {
        const isPagoCompleto = newPagadoStatus;
        const montoFormateado = new Intl.NumberFormat('es-MX', { 
          style: 'currency', 
          currency: 'MXN' 
        }).format(finalAmount);
        
        const saldoRestanteFormateado = new Intl.NumberFormat('es-MX', { 
          style: 'currency', 
          currency: 'MXN' 
        }).format(newSaldoPendiente);

        const pedidoRef = pedido.numeroPedido || `#${pedido.id.slice(-6)}`;

        const notificationData = {
          tipo: isPagoCompleto ? 'pago_completo' : 'abono_registrado',
          titulo: isPagoCompleto ? '💚 ¡Pago completado!' : '💰 Abono registrado',
          mensaje: isPagoCompleto ? 
            `¡Gracias! Hemos recibido tu pago completo de ${montoFormateado} para el pedido ${pedidoRef}. Tu pedido está totalmente pagado.` :
            `Hemos recibido tu abono de ${montoFormateado} para el pedido ${pedidoRef}. Saldo restante: ${saldoRestanteFormateado}`,
          fechaCreacion: new Date(),
          leido: false,
          prioridad: 'high',
          pedidoId: pedido.id,
          numeroTelefono: cleanPhoneNumber,
          montoPagado: finalAmount,
          saldoRestante: newSaldoPendiente,
          pagoCompleto: isPagoCompleto,
          numeroPedido: pedido.numeroPedido
        };

        await addDocument(db, userId, appId, 'clientNotifications', notificationData);
        console.log(`✅ Notificación de pago enviada: ${isPagoCompleto ? 'Pago completo' : 'Abono'} - ${montoFormateado}`);
      } catch (notifError) {
        console.error('❌ Error enviando notificación de pago:', notifError);
        // No fallar si la notificación falla
      }

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
          numeroPedido: pedido.numeroPedido,
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
          numeroPedido: pedido.numeroPedido,
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
      fechaEstimadaLlegada: '', numeroRastreo: '', saldoPendiente: 0, pagado: false, isArchived: false, shareableLinkToken: '', numeroPedido: '',
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
    
    // Migrar productos existentes para que tengan campo completed
    const productosWithCompletion = (latestPedido.productos || []).map(producto => ({
      ...producto,
      completed: producto.completed || false
    }));
    
    setEditingId(latestPedido.id);
    isLocallyEditingRef.current = true; // Activar modo de edición local cuando se abre un pedido para editar
    setCurrentPedido({
      ...latestPedido,
      productos: productosWithCompletion,
      fechaEstimadaLlegada: latestPedido.fechaEstimadaLlegada ? 
        new Date(latestPedido.fechaEstimadaLlegada).toISOString().split('T')[0] : '',
    });
  };

  // Función para calcular totales financieros
  const calculateFinancialTotals = () => {
    const activePedidos = pedidos.filter(pedido => !pedido.isArchived);
    
    const totalGeneral = activePedidos.reduce((sum, pedido) => sum + (pedido.precioTotal || 0), 0);
    const totalPendiente = activePedidos.reduce((sum, pedido) => sum + (pedido.saldoPendiente || 0), 0);
    const totalPagado = totalGeneral - totalPendiente;
    const porcentajePagado = totalGeneral > 0 ? (totalPagado / totalGeneral) * 100 : 0;
    
    return {
      totalGeneral,
      totalPagado,
      totalPendiente,
      porcentajePagado: Math.round(porcentajePagado)
    };
  };

  return {
    pedidos,
    currentPedido,
    setCurrentPedido,
    editingId,
    addProductToCurrentPedido,
    removeProductFromCurrentPedido,
    editProductInCurrentPedido,
    toggleProductCompleted,
    savePedido,
    deletePedido,
    archivePedido,
    processPayment,
    generateShareLink,
    resetCurrentPedido,
    setCurrentPedidoForEdit,
    calculateFinancialTotals,
  };
};
