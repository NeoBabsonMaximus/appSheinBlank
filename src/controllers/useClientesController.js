// Clientes Controller - Business Logic for Customer Management
import { useState, useEffect } from 'react';
import { subscribeToClientes, addCliente, updateCliente, deleteCliente } from '../models/clientesModel';
import { formatPhoneNumber } from '../utils/formatters';

export const useClientesController = (db, userId, appId) => {
  const [clientes, setClientes] = useState([]);
  const [currentCliente, setCurrentCliente] = useState({
    nombre: '',
    contacto: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!db || !userId) return;

    const unsubscribe = subscribeToClientes(db, userId, appId, setClientes);
    return unsubscribe;
  }, [db, userId, appId]);

  const saveCliente = async () => {
    try {
      const formattedContacto = formatPhoneNumber(currentCliente.contacto);
      const dataToSave = { ...currentCliente, contacto: formattedContacto };

      if (editingId) {
        await updateCliente(db, userId, appId, editingId, dataToSave);
      } else {
        await addCliente(db, userId, appId, dataToSave);
      }

      resetCurrentCliente();
      return true;
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      throw error;
    }
  };

  const deleteClienteById = async (id) => {
    try {
      await deleteCliente(db, userId, appId, id);
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      throw error;
    }
  };

  const sendMessage = (contact, messageType) => {
    let message = '';
    switch (messageType) {
      case 'pedidoLlego':
        message = '¡Hola! Tu pedido de SHEIN ha llegado y está listo para la entrega. Por favor, contáctame para coordinar.';
        break;
      case 'saldoPendiente':
        message = '¡Hola! Te recuerdo que tienes un saldo pendiente por tu pedido de SHEIN. Por favor, házmelo saber cuándo puedes realizar el pago.';
        break;
      default:
        message = 'Hola, te escribo desde tu app de pedidos SHEIN.';
    }
    
    // Extraer solo los números del contacto
    let numero = contact.toString().replace(/\D/g, '');
    
    // Si tiene 12 dígitos y empieza con 52, quitar el 52
    if (numero.length === 12 && numero.startsWith('52')) {
      numero = numero.substring(2);
    }
    
    // NUEVA LÓGICA: Probar diferentes formatos según el prefijo
    let whatsappUrl;
    const prefijo = numero.substring(0, 3);
    
    if (prefijo === '442') {
      // Para números de Querétaro, probar sin código de país
      whatsappUrl = `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
      console.log(`� Querétaro SIN código: https://wa.me/${numero}`);
    } else {
      // Para otros números, usar código de país normal
      const numeroConCodigo = '52' + numero;
      whatsappUrl = `https://wa.me/${numeroConCodigo}?text=${encodeURIComponent(message)}`;
      console.log(`� Otros CON código: https://wa.me/${numeroConCodigo}`);
    }
    
    window.open(whatsappUrl, '_blank');
  };

  const resetCurrentCliente = () => {
    setCurrentCliente({ nombre: '', contacto: '' });
    setEditingId(null);
  };

  const setCurrentClienteForEdit = (cliente) => {
    setEditingId(cliente.id);
    setCurrentCliente(cliente);
  };

  return {
    clientes,
    currentCliente,
    setCurrentCliente,
    editingId,
    saveCliente,
    deleteClienteById,
    sendMessage,
    resetCurrentCliente,
    setCurrentClienteForEdit,
  };
};
