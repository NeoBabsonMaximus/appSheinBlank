import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { Plus, X } from 'lucide-react';

const NewOrderModal = ({ isOpen, onClose, onCreateOrder, isLoading }) => {
  const [formData, setFormData] = useState({
    nombreCliente: '',
    numeroTelefono: '',
    productos: [],
    fechaEstimadaLlegada: '',
    precioTotal: 0,
    saldoPendiente: 0
  });

  const [newProduct, setNewProduct] = useState({
    nombreProducto: '',
    cantidad: 1,
    precio: 0
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductChange = (field, value) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addProduct = () => {
    if (newProduct.nombreProducto && newProduct.precio > 0) {
      const subtotal = newProduct.cantidad * newProduct.precio;
      const product = {
        ...newProduct,
        subtotal,
        id: Date.now().toString()
      };
      
      setFormData(prev => ({
        ...prev,
        productos: [...prev.productos, product]
      }));

      // Reset product form
      setNewProduct({
        nombreProducto: '',
        cantidad: 1,
        precio: 0
      });

      // Update totals
      updateTotals([...formData.productos, product]);
    }
  };

  const removeProduct = (productId) => {
    const updatedProducts = formData.productos.filter(p => p.id !== productId);
    setFormData(prev => ({
      ...prev,
      productos: updatedProducts
    }));
    updateTotals(updatedProducts);
  };

  const updateTotals = (products) => {
    const total = products.reduce((sum, product) => sum + product.subtotal, 0);
    setFormData(prev => ({
      ...prev,
      precioTotal: total,
      saldoPendiente: total
    }));
  };

  const handleSubmit = async () => {
    if (formData.nombreCliente && formData.numeroTelefono && formData.productos.length > 0) {
      try {
        await onCreateOrder(formData);
        // Reset form
        setFormData({
          nombreCliente: '',
          numeroTelefono: '',
          productos: [],
          fechaEstimadaLlegada: '',
          precioTotal: 0,
          saldoPendiente: 0
        });
        onClose();
      } catch (error) {
        console.error('Error creating order:', error);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Pedido">
      <div className="space-y-4">
        {/* Cliente Info */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre del Cliente"
            value={formData.nombreCliente}
            onChange={(e) => handleInputChange('nombreCliente', e.target.value)}
            placeholder="Nombre completo"
          />
          <Input
            label="Número de Teléfono"
            value={formData.numeroTelefono}
            onChange={(e) => handleInputChange('numeroTelefono', e.target.value)}
            placeholder="5551234567"
          />
        </div>

        <Input
          label="Fecha Estimada de Llegada"
          type="date"
          value={formData.fechaEstimadaLlegada}
          onChange={(e) => handleInputChange('fechaEstimadaLlegada', e.target.value)}
        />

        {/* Productos */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-4">Productos</h3>
          
          {/* Add Product Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-4 gap-2">
              <Input
                label="Producto"
                value={newProduct.nombreProducto}
                onChange={(e) => handleProductChange('nombreProducto', e.target.value)}
                placeholder="Nombre del producto"
              />
              <Input
                label="Cantidad"
                type="number"
                value={newProduct.cantidad}
                onChange={(e) => handleProductChange('cantidad', parseInt(e.target.value) || 1)}
                min="1"
              />
              <Input
                label="Precio"
                type="number"
                value={newProduct.precio}
                onChange={(e) => handleProductChange('precio', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
              <div className="flex items-end">
                <Button
                  onClick={addProduct}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products List */}
          {formData.productos.length > 0 && (
            <div className="space-y-2">
              {formData.productos.map((product) => (
                <div key={product.id} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div className="flex-1">
                    <span className="font-medium">{product.nombreProducto}</span>
                    <span className="text-gray-600 ml-2">x{product.cantidad}</span>
                    <span className="text-green-600 ml-2">{formatCurrency(product.subtotal)}</span>
                  </div>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        {formData.productos.length > 0 && (
          <div className="border-t pt-4">
            <div className="text-right">
              <p className="text-lg font-semibold">
                Total: {formatCurrency(formData.precioTotal)}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={isLoading || !formData.nombreCliente || !formData.numeroTelefono || formData.productos.length === 0}
          >
            {isLoading ? 'Creando...' : 'Crear Pedido'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NewOrderModal;