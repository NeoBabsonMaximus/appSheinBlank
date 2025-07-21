// Productos Controller - Business Logic for Product Catalog Management
import { useState, useEffect } from 'react';
import { subscribeToProductos, addProducto, updateProducto, deleteProducto } from '../models/productosModel';

export const useProductosController = (db, userId, appId) => {
  const [productos, setProductos] = useState([]);
  const [currentProducto, setCurrentProducto] = useState({
    nombre: '',
    descripcion: '',
    precioSugerido: '',
    fotoUrl: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!db || !userId) return;

    const unsubscribe = subscribeToProductos(db, userId, appId, setProductos);
    return unsubscribe;
  }, [db, userId, appId]);

  const saveProducto = async () => {
    try {
      if (editingId) {
        await updateProducto(db, userId, appId, editingId, currentProducto);
      } else {
        await addProducto(db, userId, appId, currentProducto);
      }

      resetCurrentProducto();
      return true;
    } catch (error) {
      console.error("Error al guardar producto:", error);
      throw error;
    }
  };

  const deleteProductoById = async (id) => {
    try {
      await deleteProducto(db, userId, appId, id);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      throw error;
    }
  };

  const shareProduct = (product) => {
    const message = `¡Mira este producto de SHEIN!\n\n*${product.nombre}*\n${product.descripcion}\nPrecio: $${product.precioSugerido?.toFixed(2) || 'N/A'} MXN\n\n${product.fotoUrl ? `[Imagen: ${product.fotoUrl}]` : ''}\n\n¡Contáctame para pedirlo!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const resetCurrentProducto = () => {
    setCurrentProducto({ nombre: '', descripcion: '', precioSugerido: '', fotoUrl: '' });
    setEditingId(null);
  };

  const setCurrentProductoForEdit = (producto) => {
    setEditingId(producto.id);
    setCurrentProducto({
      ...producto,
      precioSugerido: producto.precioSugerido?.toString() || '',
    });
  };

  return {
    productos,
    currentProducto,
    setCurrentProducto,
    editingId,
    saveProducto,
    deleteProductoById,
    shareProduct,
    resetCurrentProducto,
    setCurrentProductoForEdit,
  };
};
