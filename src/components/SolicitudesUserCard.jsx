import React from 'react';
import { Clock, CheckCircle, Package, ExternalLink, Calendar } from 'lucide-react';

const SolicitudesUserCard = ({ solicitud }) => {
  const getStatusIcon = (procesada) => {
    if (procesada) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <Clock className="w-5 h-5 text-yellow-500" />;
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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-4 hover:shadow-lg transition-shadow">
      {/* Header con estado */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="font-medium text-gray-900">
              {solicitud.nombreProducto || 'Producto SHEIN'}
            </h3>
            {solicitud.precio && (
              <p className="text-sm text-green-600 font-semibold">
                ${solicitud.precio}
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
        
        {solicitud.talla && solicitud.talla !== 'No especificada' && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Talla:</span>
            <span className="text-sm font-medium">{solicitud.talla}</span>
          </div>
        )}
        
        {solicitud.color && solicitud.color !== 'No especificado' && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Color:</span>
            <span className="text-sm font-medium">{solicitud.color}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Cantidad:</span>
          <span className="text-sm font-medium">{solicitud.cantidad || 1}</span>
        </div>
        
        {solicitud.comentarios && (
          <div className="mt-2">
            <span className="text-sm text-gray-600">Comentarios:</span>
            <p className="text-sm text-gray-800 mt-1 p-2 bg-gray-50 rounded">
              {solicitud.comentarios}
            </p>
          </div>
        )}
      </div>

      {/* Link del producto */}
      {solicitud.linkProducto && (
        <div className="mb-3">
          <a 
            href={solicitud.linkProducto} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Ver producto en SHEIN
          </a>
        </div>
      )}

      {/* Fecha de solicitud */}
      <div className="flex items-center gap-2 text-xs text-gray-500 border-t pt-3">
        <Calendar className="w-4 h-4" />
        Solicitado el {formatDate(solicitud.fechaCreacion)}
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
    </div>
  );
};

export default SolicitudesUserCard;
