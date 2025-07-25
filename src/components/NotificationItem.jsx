// NotificationItem Component - Individual notification display
import React from 'react';
import { 
  Bell, 
  ShoppingBag, 
  CreditCard, 
  User, 
  AlertTriangle, 
  Trash2, 
  Check,
  Clock,
  MessageCircle,
  Reply
} from 'lucide-react';

const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  onReply 
}) => {
  const getIcon = (tipo) => {
    switch (tipo) {
      case 'pedido_nuevo':
      case 'pedido_estado':
        return <ShoppingBag size={20} className="text-blue-500" />;
      case 'pago_pendiente':
      case 'pago_recibido':
        return <CreditCard size={20} className="text-green-500" />;
      case 'cliente_nuevo':
        return <User size={20} className="text-purple-500" />;
      case 'mensaje_cliente':
        return <MessageCircle size={20} className="text-green-500" />;
      case 'mensaje_admin_enviado':
        return <MessageCircle size={20} className="text-blue-500" />;
      case 'stock_bajo':
        return <AlertTriangle size={20} className="text-orange-500" />;
      case 'sistema':
        return <Bell size={20} className="text-gray-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-300 bg-white';
    }
  };

  const formatDate = (fechaString) => {
    const fecha = new Date(fechaString);
    const ahora = new Date();
    const diffMs = ahora - fecha;
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutos < 60) {
      return `Hace ${diffMinutos} min`;
    } else if (diffHoras < 24) {
      return `Hace ${diffHoras}h`;
    } else if (diffDias < 7) {
      return `Hace ${diffDias}d`;
    } else {
      return fecha.toLocaleDateString();
    }
  };

  return (
    <div className={`border-l-4 p-4 mb-3 rounded-r-lg shadow-sm transition-all hover:shadow-md ${
      getPriorityColor(notification.prioridad)
    } ${!notification.leido ? 'ring-2 ring-blue-200' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            {getIcon(notification.tipo)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className={`text-sm font-semibold ${
                !notification.leido ? 'text-gray-900' : 'text-gray-600'
              }`}>
                {notification.titulo}
              </h4>
              {!notification.leido && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              )}
            </div>
            
            <p className={`text-sm ${
              !notification.leido ? 'text-gray-800' : 'text-gray-600'
            }`}>
              {notification.mensaje}
            </p>
            
            {/* Client info for messages */}
            {notification.tipo === 'mensaje_cliente' && (
              <div className="text-xs text-gray-500 mt-1 bg-gray-100 rounded px-2 py-1">
                📱 Cliente: {notification.fromName || notification.clientePhone || 'Desconocido'}
                {notification.pedidoId && (
                  <span className="ml-2">• Pedido: {notification.pedidoId}</span>
                )}
              </div>
            )}

            {/* Response status */}
            {notification.tipo === 'mensaje_cliente' && notification.respondido && (
              <div className="text-xs text-green-600 mt-1 flex items-center">
                <Check className="w-3 h-3 mr-1" />
                Respondido
              </div>
            )}
            
            <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
              <Clock size={12} />
              <span>{formatDate(notification.fechaCreacion)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {/* Reply button for client messages */}
          {notification.tipo === 'mensaje_cliente' && !notification.respondido && onReply && (
            <button
              onClick={() => onReply(notification)}
              className="p-1 text-gray-400 hover:text-green-500 transition-colors"
              title="Responder mensaje"
            >
              <Reply size={16} />
            </button>
          )}
          
          {!notification.leido && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
              title="Marcar como leído"
            >
              <Check size={16} />
            </button>
          )}
          
          <button
            onClick={() => onDelete(notification.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Eliminar notificación"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
