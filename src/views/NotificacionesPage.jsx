// NotificacionesPage View - Notifications (View Layer)
import React, { useState } from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import NotificationItem from '../components/NotificationItem';
import useNotificacionesController from '../controllers/useNotificacionesController';
import { 
  Filter, 
  CheckCheck, 
  RefreshCw, 
  Bell,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  User,
  Settings
} from 'lucide-react';

const NotificacionesPage = () => {
  const controller = useNotificacionesController();
  const [showFilters, setShowFilters] = useState(false);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await controller.marcarComoLeido(notificationId);
    } catch (error) {
      alert("Error al marcar como leído. Por favor, inténtalo de nuevo.");
    }
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm("¿Estás segura de que quieres eliminar esta notificación?")) {
      try {
        await controller.eliminarNotificacion(notificationId);
      } catch (error) {
        alert("Error al eliminar la notificación. Por favor, inténtalo de nuevo.");
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await controller.marcarTodoComoLeido();
    } catch (error) {
      alert("Error al marcar todas como leídas. Por favor, inténtalo de nuevo.");
    }
  };

  const getFilterIcon = (tipo) => {
    switch (tipo) {
      case 'pedido_nuevo':
      case 'pedido_estado':
        return <ShoppingBag size={16} />;
      case 'pago_pendiente':
      case 'pago_recibido':
        return <CreditCard size={16} />;
      case 'cliente_nuevo':
        return <User size={16} />;
      case 'sistema':
        return <Settings size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const getFilterLabel = (tipo) => {
    switch (tipo) {
      case 'pedido_nuevo': return 'Nuevos Pedidos';
      case 'pedido_estado': return 'Estado Pedidos';
      case 'pago_pendiente': return 'Pagos Pendientes';
      case 'pago_recibido': return 'Pagos Recibidos';
      case 'cliente_nuevo': return 'Nuevos Clientes';
      case 'sistema': return 'Sistema';
      default: return 'Todas';
    }
  };

  const tiposNotificacion = [
    'all',
    'pedido_nuevo',
    'pedido_estado', 
    'pago_pendiente',
    'pago_recibido',
    'cliente_nuevo',
    'sistema'
  ];

  if (controller.loading) {
    return (
      <div className="p-4">
        <Header title="Notificaciones y Alertas" />
        <div className="flex items-center justify-center mt-8">
          <RefreshCw className="animate-spin mr-2" size={20} />
          <span>Cargando notificaciones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Header title="Notificaciones y Alertas" />
      
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Bell size={16} />
            <span>{controller.notificaciones.length} notificaciones</span>
            {controller.contadorNoLeidas > 0 && (
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                {controller.contadorNoLeidas} sin leer
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            <span>Filtros</span>
          </button>

          {controller.contadorNoLeidas > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <CheckCheck size={16} />
              <span>Marcar todas como leídas</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Filtrar notificaciones</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Por tipo:
              </label>
              <div className="flex flex-wrap gap-2">
                {tiposNotificacion.map(tipo => (
                  <button
                    key={tipo}
                    onClick={() => controller.setFiltroTipo(tipo)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      controller.filtroTipo === tipo
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {getFilterIcon(tipo)}
                    <span>{getFilterLabel(tipo)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Por estado:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => controller.setFiltroLeido('all')}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    controller.filtroLeido === 'all'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => controller.setFiltroLeido('no_leido')}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    controller.filtroLeido === 'no_leido'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Sin leer
                </button>
                <button
                  onClick={() => controller.setFiltroLeido('leido')}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    controller.filtroLeido === 'leido'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Leídas
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Notifications List */}
      <Card>
        {controller.notificaciones.length === 0 ? (
          <div className="text-center py-8">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              No hay notificaciones
            </h3>
            <p className="text-gray-400">
              {controller.filtroTipo !== 'all' || controller.filtroLeido !== 'all'
                ? 'No se encontraron notificaciones con los filtros aplicados.'
                : 'Cuando recibas notificaciones, aparecerán aquí.'
              }
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Notificaciones
              </h2>
            </div>
            
            <div className="space-y-0">
              {controller.notificaciones.map(notificacion => (
                <NotificationItem
                  key={notificacion.id}
                  notification={notificacion}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}
      </Card>
      
      {/* Info Note */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sistema de Notificaciones Activo</p>
            <p>
              Las notificaciones se generan automáticamente cuando ocurren eventos importantes 
              como nuevos pedidos, cambios de estado, pagos recibidos, y recordatorios de pagos pendientes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificacionesPage;
