import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { formatPhoneNumber } from '../utils/formatters';

const SolicitudDetailsModal = ({ isOpen, onClose, group, onCreateOrder }) => {
  if (!group) return null;

  const handleCreateOrder = () => {
    if (onCreateOrder) {
      onCreateOrder(group);
    }
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Solicitudes de ${group.clienteNombre}`}
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Información del Cliente */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Información del Cliente</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nombre:</p>
              <p className="font-medium">{group.clienteNombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teléfono:</p>
              <p className="font-medium">{formatPhoneNumber(group.numeroTelefono)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Solicitudes:</p>
              <p className="font-medium">{group.solicitudes.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Productos:</p>
              <p className="font-medium">{group.totalProductos}</p>
            </div>
          </div>
        </div>

        {/* Lista de Solicitudes */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Solicitudes Detalladas</h3>
          
          {group.solicitudes.map((solicitud, idx) => (
            <div key={solicitud.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-800">
                    Solicitud #{idx + 1}
                  </h4>
                  <p className="text-sm text-gray-600">
                    📅 {new Date(solicitud.fechaCreacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  solicitud.procesada 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {solicitud.procesada ? 'Procesada' : 'Pendiente'}
                </div>
              </div>

              {/* Producto de esta solicitud */}
              <div className="space-y-2">
                <p className="font-medium text-sm text-gray-700">
                  Producto:
                </p>
                <div className="bg-gray-50 rounded p-3">
                  {/* Imagen del producto si existe */}
                  {solicitud.imagenProducto && (
                    <div className="mb-3">
                      <img 
                        src={solicitud.imagenProducto} 
                        alt={solicitud.nombreProducto || 'Producto SHEIN'}
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start py-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {solicitud.nombreProducto || 'Producto sin nombre'}
                      </p>
                      {solicitud.talla && (
                        <p className="text-xs text-gray-600">
                          Talla: {solicitud.talla}
                        </p>
                      )}
                      {solicitud.color && (
                        <p className="text-xs text-gray-600">
                          Color: {solicitud.color}
                        </p>
                      )}
                      {solicitud.comentarios && (
                        <p className="text-xs text-gray-600">
                          Notas: {solicitud.comentarios}
                        </p>
                      )}
                      {/* Enlaces de productos */}
                      {(solicitud.linkProducto || (solicitud.linksProductos && solicitud.linksProductos.length > 0)) && (
                        <div className="mt-2">
                          {solicitud.linkProducto && (
                            <p className="text-xs text-blue-600 mb-1">
                              <a href={solicitud.linkProducto} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                🔗 Ver producto principal en SHEIN →
                              </a>
                            </p>
                          )}
                          {solicitud.linksProductos && solicitud.linksProductos.length > 1 && (
                            <div className="space-y-1">
                              {solicitud.linksProductos.slice(1).map((link, linkIndex) => (
                                <p key={linkIndex} className="text-xs text-blue-600">
                                  <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    🔗 Producto adicional {linkIndex + 2} en SHEIN →
                                  </a>
                                </p>
                              ))}
                            </div>
                          )}
                          {!solicitud.linkProducto && solicitud.linksProductos && solicitud.linksProductos.length > 0 && (
                            <div className="space-y-1">
                              {solicitud.linksProductos.map((link, linkIndex) => (
                                <p key={linkIndex} className="text-xs text-blue-600">
                                  <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    🔗 Producto {linkIndex + 1} en SHEIN →
                                  </a>
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {/* Precio del producto */}
                      {solicitud.precioProducto && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          💰 Precio: {solicitud.precioProducto}
                        </p>
                      )}
                      {/* Descripción del producto */}
                      {solicitud.descripcionProducto && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-gray-700">
                          <strong>Descripción:</strong> {solicitud.descripcionProducto}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium">
                        Cantidad: {solicitud.cantidad || 1}
                      </p>
                      {solicitud.precio && (
                        <p className="text-xs text-gray-600">
                          Est: ${solicitud.precio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Comentarios adicionales si existen */}
              {solicitud.comentarios && (
                <div className="mt-3 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Comentarios:</strong> {solicitud.comentarios}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2"
          >
            Cerrar
          </Button>
          <Button
            onClick={handleCreateOrder}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
          >
            Crear Pedido Completo
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SolicitudDetailsModal;
