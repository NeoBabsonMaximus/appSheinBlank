import React from 'react';
import { Package, Clock, CheckCircle, ExternalLink, Calendar } from 'lucide-react';

const SolicitudCard = ({ solicitud, pedidoRelacionado }) => {
  const getStatusIcon = (procesada) => {
    if (procesada) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  const getStatusText = (procesada) => {
    if (procesada) {
      return { text: 'Procesada', color: 'text-green-700 bg-green-100' };
    }
    return { text: 'Pendiente', color: 'text-yellow-700 bg-yellow-100' };
  };

  const status = getStatusText(solicitud.procesada);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header con estado */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">
              {solicitud.nombreProducto || 'Producto SHEIN'}
            </h3>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {getStatusIcon(solicitud.procesada)}
            <span>{status.text}</span>
          </div>
        </div>

        {/* Información del producto */}
        <div className="space-y-3 mb-4">
          {solicitud.talla && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Talla:</span>
              <span className="font-medium">{solicitud.talla}</span>
            </div>
          )}
          
          {solicitud.color && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Color:</span>
              <span className="font-medium">{solicitud.color}</span>
            </div>
          )}
          
          {solicitud.cantidad && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cantidad:</span>
              <span className="font-medium">{solicitud.cantidad}</span>
            </div>
          )}

          {solicitud.comentarios && (
            <div className="text-sm">
              <span className="text-gray-600">Comentarios:</span>
              <p className="text-gray-900 mt-1">{solicitud.comentarios}</p>
            </div>
          )}
        </div>

        {/* Fecha de solicitud */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Calendar className="w-4 h-4" />
          <span>
            Solicitado: {new Date(solicitud.fechaCreacion?.toDate?.() || solicitud.fechaCreacion).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>

        {/* Link del producto */}
        {solicitud.linkProducto && (
          <div className="mb-4">
            <a
              href={solicitud.linkProducto}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Ver producto en SHEIN
            </a>
          </div>
        )}

        {/* Información del pedido si está procesada */}
        {solicitud.procesada && pedidoRelacionado && (
          <div className="border-t border-gray-200 pt-4">
            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="font-medium text-green-900 mb-2">Pedido Creado</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Número de pedido:</span>
                  <span className="font-medium text-green-900">#{pedidoRelacionado.numeroPedido}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Estado:</span>
                  <span className="font-medium text-green-900">{pedidoRelacionado.estado || 'Pendiente'}</span>
                </div>
                {pedidoRelacionado.numeroRastreo && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Rastreo:</span>
                    <span className="font-medium text-green-900">{pedidoRelacionado.numeroRastreo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudCard;
