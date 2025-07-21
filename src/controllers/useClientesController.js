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
    
    const formattedContactForWhatsapp = formatPhoneNumber(contact);
    const whatsappUrl = `https://wa.me/${formattedContactForWhatsapp}?text=${encodeURIComponent(message)}`;
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
