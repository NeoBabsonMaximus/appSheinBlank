// CatalogoPage View - Product Catalog (View Layer)
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProductosController } from '../controllers/useProductosController';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';

const CatalogoPage = () => {
  const { userId, db, appId } = useAuth();
  const controller = useProductosController(db, userId, appId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveProducto = async () => {
    try {
      await controller.saveProducto();
      setIsModalOpen(false);
    } catch (error) {
      alert("Error al guardar el producto. Por favor, inténtalo de nuevo.");
    }
  };

  const handleDeleteProducto = async (id) => {
    if (window.confirm("¿Estás segura de que quieres eliminar este producto?")) {
      try {
        await controller.deleteProductoById(id);
      } catch (error) {
        alert("Error al eliminar el producto. Por favor, inténtalo de nuevo.");
      }
    }
  };

  const openAddModal = () => {
    controller.resetCurrentProducto();
    setIsModalOpen(true);
  };

  const openEditModal = (producto) => {
    controller.setCurrentProductoForEdit(producto);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4">
      <Header title="Catálogo Personalizado" onAddClick={openAddModal} />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {controller.productos.length === 0 ? (
          <p className="text-center text-gray-600 col-span-full">No hay productos en el catálogo. ¡Añade uno!</p>
        ) : (
          controller.productos.map((producto) => (
            <Card key={producto.id} className="flex flex-col justify-between">
              <div>
                {producto.fotoUrl ? (
                  <img
                    src={producto.fotoUrl}
                    alt={producto.nombre}
                    className="w-full h-48 object-cover rounded-lg mb-2"
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = "https://placehold.co/400x300/E0E0E0/666666?text=No+Imagen"; 
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg mb-2 text-gray-500">
                    No Imagen
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-800">{producto.nombre}</h3>
                <p className="text-gray-600 text-sm">{producto.descripcion}</p>
                <p className="text-gray-700 font-bold mt-2">Precio: ${producto.precioSugerido?.toFixed(2) || 'N/A'}</p>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button onClick={() => controller.shareProduct(producto)} className="bg-green-500 hover:bg-green-600 px-3 py-1 text-sm">
                  Compartir
                </Button>
                <Button onClick={() => openEditModal(producto)} className="bg-blue-500 hover:bg-blue-600 px-3 py-1 text-sm">
                  Editar
                </Button>
                <Button onClick={() => handleDeleteProducto(producto.id)} className="bg-red-500 hover:bg-red-600 px-3 py-1 text-sm">
                  Eliminar
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={controller.editingId ? "Editar Producto" : "Añadir Nuevo Producto"}
      >
        <Input
          label="Nombre del Producto"
          id="nombreProducto"
          value={controller.currentProducto.nombre}
          onChange={(e) => controller.setCurrentProducto({ ...controller.currentProducto, nombre: e.target.value })}
          placeholder="Ej: Blusa de encaje"
        />
        <Input
          label="Descripción"
          id="descripcionProducto"
          value={controller.currentProducto.descripcion}
          onChange={(e) => controller.setCurrentProducto({ ...controller.currentProducto, descripcion: e.target.value })}
          placeholder="Ej: Blusa elegante para ocasiones especiales"
        />
        <Input
          label="Precio Sugerido"
          id="precioSugerido"
          type="number"
          value={controller.currentProducto.precioSugerido}
          onChange={(e) => controller.setCurrentProducto({ ...controller.currentProducto, precioSugerido: e.target.value })}
          placeholder="Ej: 299.99"
        />
        <Input
          label="URL de la Foto (Opcional)"
          id="fotoUrl"
          value={controller.currentProducto.fotoUrl}
          onChange={(e) => controller.setCurrentProducto({ ...controller.currentProducto, fotoUrl: e.target.value })}
          placeholder="Ej: https://ejemplo.com/imagen.jpg"
        />
        <Button onClick={handleSaveProducto} className="mt-4 bg-purple-500 hover:bg-purple-600">
          {controller.editingId ? "Guardar Cambios" : "Añadir Producto"}
        </Button>
      </Modal>
    </div>
  );
};

export default CatalogoPage;
