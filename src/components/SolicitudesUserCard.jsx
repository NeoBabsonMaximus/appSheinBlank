import React, { useState } from 'react';
import { Clock, CheckCircle, Package, ExternalLink, Calendar, Trash2 } from 'lucide-react';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const SolicitudesUserCard = ({ solicitud, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const getStatusIcon = (procesada) => {
    if (procesada) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };
  
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };
  
  const handleCloseModal = () => {
    setShowDeleteModal(false);
  };
  
  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      // Iniciar animación de eliminación
      setIsDeleting(true);
      
      // Pequeña pausa para la animación antes de eliminar
      setTimeout(async () => {
        try {
          await onDelete(solicitud.id);
          // La eliminación fue exitosa, el modal se cerrará automáticamente
          setShowDeleteModal(false);
        } catch (error) {
          // Si hay error, revertir la animación
          setIsDeleting(false);
          setDeleteLoading(false);
          console.error('Error al eliminar solicitud:', error);
        }
      }, 300);
    } catch (error) {
      console.error('Error al eliminar solicitud:', error);
      setDeleteLoading(false);
      setIsDeleting(false);
    }
  };

  const getStatusText = (procesada) => {
    return procesada ? 'Procesada' : 'Pendiente';
  };

  const getStatusColor = (procesada) => {
    return procesada 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    
    let dateObj;
    if (date.toDate) {
      // Firestore Timestamp
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-4 hover:shadow-lg transition-all duration-300 ${
      isDeleting ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
    }`}>
      {/* Header con estado */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="font-medium text-gray-900">
              {solicitud.productos && solicitud.productos.length > 0 
                ? (solicitud.productos.length === 1 
                    ? solicitud.productos[0].nombre 
                    : `${solicitud.productos.length} productos`)
                : (solicitud.nombreProducto || 'Solicitud de Productos SHEIN')}
            </h3>
            {solicitud.totalProductos && (
              <p className="text-xs text-purple-600 font-medium">
                {solicitud.totalProductos} {solicitud.totalProductos === 1 ? 'producto' : 'productos'} • {solicitud.cantidadTotal || solicitud.cantidad || 1} piezas total
              </p>
            )}
            {solicitud.precioProducto && (
              <p className="text-sm text-green-600 font-semibold">
                {solicitud.precioProducto}
              </p>
            )}
          </div>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(solicitud.procesada)}`}>
          {getStatusIcon(solicitud.procesada)}
          {getStatusText(solicitud.procesada)}
        </div>
      </div>

      {/* Detalles del producto */}
      <div className="space-y-2 mb-4">
        {/* Información del cliente */}
        {(solicitud.clienteNombre || solicitud.numeroTelefono) && (
          <div className="bg-gray-50 rounded p-2 mb-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {solicitud.clienteNombre && (
                <div>
                  <span className="text-gray-500">Cliente:</span>
                  <span className="ml-1 font-medium">{solicitud.clienteNombre}</span>
                </div>
              )}
              {solicitud.numeroTelefono && (
                <div>
                  <span className="text-gray-500">Tel:</span>
                  <span className="ml-1 font-medium">{solicitud.numeroTelefono}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lista de Productos Individuales */}
        {solicitud.productos && solicitud.productos.length > 0 && (
          <div className="mb-3">
            <span className="text-sm text-gray-600 font-medium">Productos solicitados:</span>
            <div className="mt-2 space-y-2">
              {solicitud.productos.map((producto, index) => (
                <div key={producto.id || index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-purple-900">{producto.nombre}</h4>
                      <div className="text-xs text-purple-700 mt-1">
                        <span className="inline-block mr-3">
                          <strong>Cantidad:</strong> {producto.cantidad}
                        </span>
                        {producto.comentario && (
                          <span className="inline-block">
                            <strong>Detalles:</strong> {producto.comentario}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                  </div>
                  {producto.enlace && (
                    <a 
                      href={producto.enlace} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ver en SHEIN
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Descripción del producto */}
        {solicitud.descripcionProducto && (
          <div className="mb-3">
            <span className="text-sm text-gray-600 font-medium">Descripción:</span>
            <p className="text-sm text-gray-800 mt-1 p-2 bg-gray-50 rounded">
              {solicitud.descripcionProducto}
            </p>
          </div>
        )}
        
        {/* Detalles específicos del producto */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {solicitud.talla && solicitud.talla !== 'No especificada' && (
            <div className="flex justify-between">
              <span className="text-gray-600">Talla:</span>
              <span className="font-medium">{solicitud.talla}</span>
            </div>
          )}
          
          {solicitud.color && solicitud.color !== 'No especificado' && (
            <div className="flex justify-between">
              <span className="text-gray-600">Color:</span>
              <span className="font-medium">{solicitud.color}</span>
            </div>
          )}
        </div>
        
        {/* Resumen de cantidades */}
        {solicitud.productos && solicitud.productos.length > 0 ? (
          <div className="bg-gray-50 rounded p-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total productos:</span>
                <span className="font-medium">{solicitud.totalProductos || solicitud.productos.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total piezas:</span>
                <span className="font-medium">{solicitud.cantidadTotal || solicitud.cantidad || 1}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cantidad:</span>
            <span className="font-medium">{solicitud.cantidad || 1}</span>
          </div>
        )}
        
        {solicitud.comentarios && (
          <div className="mt-2">
            <span className="text-sm text-gray-600 font-medium">Comentarios:</span>
            <p className="text-sm text-gray-800 mt-1 p-2 bg-gray-50 rounded">
              {solicitud.comentarios}
            </p>
          </div>
        )}
      </div>

      {/* Imagen del producto */}
      {solicitud.imagenProducto && (
        <div className="mb-3">
          <img 
            src={solicitud.imagenProducto} 
            alt={solicitud.nombreProducto || 'Producto SHEIN'}
            className="w-full h-32 object-cover rounded-lg"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Enlaces de productos - PRIORITARIO */}
      <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Enlaces de Productos SHEIN
        </h4>
        
        {/* Si hay productos individuales, mostrar sus enlaces */}
        {solicitud.productos && solicitud.productos.length > 0 ? (
          <div className="space-y-2">
            {solicitud.productos.map((producto, index) => (
              <a 
                key={producto.id || index}
                href={producto.enlace} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm py-2 px-3 bg-white rounded border hover:bg-blue-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {producto.nombre} (Cant: {producto.cantidad})
              </a>
            ))}
          </div>
        ) : solicitud.linkProducto ? (
          <div>
            <a 
              href={solicitud.linkProducto} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm py-2 px-3 bg-white rounded border hover:bg-blue-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver producto principal en SHEIN
            </a>
            
            {/* Enlaces adicionales si existen */}
            {solicitud.linksProductos && solicitud.linksProductos.length > 1 && (
              <div className="mt-2">
                <span className="text-xs text-blue-700 font-medium">Enlaces adicionales:</span>
                <div className="mt-1 space-y-1">
                  {solicitud.linksProductos.slice(1).map((link, index) => (
                    <a 
                      key={index}
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm py-1 px-3 bg-white rounded border hover:bg-blue-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Producto adicional {index + 2}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (solicitud.linksProductos && solicitud.linksProductos.length > 0) ? (
          <div className="space-y-1">
            {solicitud.linksProductos.map((link, index) => (
              <a 
                key={index}
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm py-2 px-3 bg-white rounded border hover:bg-blue-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Producto {index + 1} en SHEIN
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No hay enlaces disponibles</p>
        )}
      </div>

      {/* Fecha de solicitud y botón eliminar */}
      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-4 h-4" />
          Solicitado el {formatDate(solicitud.fechaCreacion)}
        </div>
        
        {/* Botón de eliminar - Solo visible si no está procesada */}
        {!solicitud.procesada && (
          <button
            onClick={handleDeleteClick}
            className="flex items-center gap-1 py-1 px-3 rounded-md text-xs font-medium transition-all text-gray-600 hover:bg-gray-100 hover:text-red-600"
          >
            <Trash2 className="w-3 h-3" />
            Eliminar
          </button>
        )}
      </div>

      {/* Información adicional si está procesada */}
      {solicitud.procesada && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800 font-medium">
            ✅ Tu solicitud ha sido procesada y agregada a un pedido
          </p>
          <p className="text-xs text-green-700 mt-1">
            Recibirás una notificación cuando tu pedido esté listo
          </p>
        </div>
      )}
      
      {/* Modal de confirmación para eliminar */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
        title="Eliminar solicitud"
        message={`¿Estás seguro de que deseas eliminar esta solicitud${
          solicitud.productos && solicitud.productos.length > 0 
            ? ` con ${solicitud.productos.length} producto${solicitud.productos.length > 1 ? 's' : ''} (${solicitud.cantidadTotal || solicitud.cantidad || 1} piezas)` 
            : ` "${solicitud.nombreProducto || 'Productos SHEIN'}"`
        }? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default SolicitudesUserCard;
