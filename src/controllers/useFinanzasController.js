// Finanzas Controller - Business Logic for Financial Management
import { useState, useEffect } from 'react';
import { subscribeToTransacciones, addTransaccion, updateTransaccion, deleteTransaccion } from '../models/transaccionesModel';

export const useFinanzasController = (db, userId, appId) => {
  const [transacciones, setTransacciones] = useState([]);
  const [currentTransaccion, setCurrentTransaccion] = useState({
    tipo: 'Ingreso',
    monto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!db || !userId) return;

    const unsubscribe = subscribeToTransacciones(db, userId, appId, setTransacciones);
    return unsubscribe;
  }, [db, userId, appId]);

  const saveTransaccion = async () => {
    try {
      if (editingId) {
        await updateTransaccion(db, userId, appId, editingId, currentTransaccion);
      } else {
        await addTransaccion(db, userId, appId, currentTransaccion);
      }

      resetCurrentTransaccion();
      return true;
    } catch (error) {
      console.error("Error al guardar transacción:", error);
      throw error;
    }
  };

  const deleteTransaccionById = async (id) => {
    try {
      await deleteTransaccion(db, userId, appId, id);
    } catch (error) {
      console.error("Error al eliminar transacción:", error);
      throw error;
    }
  };

  const calculateFinancialSummary = () => {
    const totalIngresos = transacciones
      .filter(t => t.tipo === 'Ingreso')
      .reduce((sum, t) => sum + t.monto, 0);
    
    const totalEgresos = transacciones
      .filter(t => t.tipo === 'Egreso')
      .reduce((sum, t) => sum + t.monto, 0);
    
    const utilidad = totalIngresos - totalEgresos;

    return {
      totalIngresos,
      totalEgresos,
      utilidad,
    };
  };

  const resetCurrentTransaccion = () => {
    setCurrentTransaccion({
      tipo: 'Ingreso',
      monto: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
  };

  const setCurrentTransaccionForEdit = (transaccion) => {
    setEditingId(transaccion.id);
    setCurrentTransaccion({
      ...transaccion,
      monto: transaccion.monto?.toString() || '',
    });
  };

  return {
    transacciones,
    currentTransaccion,
    setCurrentTransaccion,
    editingId,
    saveTransaccion,
    deleteTransaccionById,
    calculateFinancialSummary,
    resetCurrentTransaccion,
    setCurrentTransaccionForEdit,
  };
};
