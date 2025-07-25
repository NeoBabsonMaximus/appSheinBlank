import React from 'react';
import { Bell, Clock, Check, Gift, MessageCircle, X, Trash2, Reply } from 'lucide-react';

const NotificationCard = ({ notification, onMarkAsRead, onDelete, onReply }) => {
  const getNotificationIcon = (type) => {
    const notType = type || notification.tipo;
    switch (notType) {
      case 'order_update':
      case 'pedido_actualizado':
        return <Bell className="w-5 h-5" />;
      case 'message':
      case 'mensaje_cliente':
        return <MessageCircle className="w-5 h-5" />;
      case 'offer':
      case 'oferta':
        return <Gift className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type) => {
    const notType = type || notification.tipo;
    switch (notType) {
      case 'order_update':
      case 'pedido_actualizado':
        return 'from-blue-500 to-blue-600';
      case 'message':
      case 'mensaje_cliente':
        return 'from-green-500 to-green-600';
      case 'offer':
      case 'oferta':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffInHours = (now - dateObj) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
      return dateObj.toLocaleDateString('es-MX', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Get values in both Spanish and English formats
  const title = notification.title || notification.titulo || 'Notificación';
  const message = notification.message || notification.mensaje || 'Sin mensaje';
  const createdAt = notification.createdAt || notification.fechaCreacion;
  const type = notification.type || notification.tipo;
  const isRead = notification.read || notification.leido;
  const isResponded = notification.respondido;
  const isClientMessage = type === 'mensaje_cliente';

  console.log('🔔 NotificationCard data:', { 
    title, 
    message, 
    createdAt, 
    type, 
    isRead,
    isResponded,
    isClientMessage,
    originalNotification: notification 
  });

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${isRead ? 'border-gray-100' : 'border-purple-200'} overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`w-10 h-10 bg-gradient-to-r ${getNotificationColor(type)} rounded-full flex items-center justify-center flex-shrink-0`}>
            <div className="text-white">
              {getNotificationIcon(type)}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {title}
              </h3>
              <div className="flex items-center space-x-2">
                {!isRead && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                )}
                {/* Delete button */}
                <button
                  onClick={() => onDelete(notification.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 hover:bg-red-50 rounded-full"
                  title="Eliminar notificación"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {message}
            </p>

            {/* Client info for messages */}
            {isClientMessage && (
              <div className="text-xs text-gray-500 mb-2 bg-gray-50 rounded px-2 py-1">
                📱 Cliente: {notification.fromName || notification.clientePhone || 'Desconocido'}
                {notification.pedidoId && (
                  <span className="ml-2">• Pedido: {notification.pedidoId}</span>
                )}
              </div>
            )}

            {/* Response status */}
            {isClientMessage && isResponded && (
              <div className="text-xs text-green-600 mb-2 flex items-center">
                <Check className="w-3 h-3 mr-1" />
                Respondido
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {formatDate(createdAt)}
              </span>
              
              <div className="flex items-center space-x-2">
                {/* Reply button for client messages */}
                {isClientMessage && !isResponded && onReply && (
                  <button
                    onClick={() => onReply(notification)}
                    className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded-full font-medium transition-colors duration-200 flex items-center space-x-1"
                  >
                    <Reply className="w-3 h-3" />
                    <span>Responder</span>
                  </button>
                )}
                
                {!isRead && (
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Marcar como leída
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
