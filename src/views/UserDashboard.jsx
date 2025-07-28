import React, { useState, useEffect } from 'react';
import { Bell, Package, MessageCircle, Phone, User, RefreshCw, Plus } from 'lucide-react';
import { db } from '../config/firebase';
import ENV_CONFIG from '../config/environment';
import { useUserController } from '../controllers/useUserController';
import useUserSolicitudesController from '../controllers/useUserSolicitudesController';
import OrderCard from '../components/OrderCard';
import NotificationCard from '../components/NotificationCard';
import MessageModal from '../components/MessageModal';
import SolicitudProductosModal from '../components/SolicitudProductosModal';
import SolicitudCard from '../components/SolicitudCard';
import SolicitudesUserCard from '../components/SolicitudesUserCard';

const UserDashboard = ({ phoneNumber, onLogout }) => {
  const {
    userPedidos,
    loading,
    userProfile,
    notifications,
    sendMessageToAdmin,
    markNotificationAsRead,
    deleteNotification,
    refreshNotifications,
    fetchAllMessages,
    subscribeToAdminResponses,
    getOrderStatusDescription
  } = useUserController(db, phoneNumber, ENV_CONFIG.APP_ID);

  // Controller para solicitudes del usuario
  const { 
    solicitudes: userSolicitudes, 
    loading: solicitudesLoading,
    deleteSolicitud,
    deleteStatus
  } = useUserSolicitudesController(db, phoneNumber, ENV_CONFIG.APP_ID);
  
  // Manejador para eliminar solicitudes con feedback
  const handleDeleteSolicitud = async (solicitudId) => {
    try {
      await deleteSolicitud(solicitudId);
      
      // Mostrar mensaje de éxito
      setDeleteMessage('✅ Solicitud eliminada correctamente');
      setShowDeleteMessage(true);
      
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setShowDeleteMessage(false);
        setTimeout(() => setDeleteMessage(''), 300); // Limpiar después de la transición
      }, 3000);
      
      return true;
    } catch (error) {
      // Mostrar mensaje de error
      setDeleteMessage('❌ Error al eliminar la solicitud. Intenta de nuevo.');
      setShowDeleteMessage(true);
      
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setShowDeleteMessage(false);
        setTimeout(() => setDeleteMessage(''), 300);
      }, 3000);
      
      return Promise.reject(error);
    }
  };

  // Manejador para cuando se crea una nueva solicitud
  const handleSolicitudCreated = (newSolicitud) => {
    // La lista se actualizará automáticamente a través del hook useUserSolicitudesController
    // Podemos mostrar un mensaje de confirmación aquí si es necesario
    console.log('Nueva solicitud creada:', newSolicitud);
  };

  const [activeTab, setActiveTab] = useState('orders');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    pedido: null,
    messages: []
  });

  // Estado para el modal de solicitud de productos SHEIN
  const [solicitudModal, setSolicitudModal] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);

  // Suscripción a respuestas del admin en tiempo real
  useEffect(() => {
    if (!messageModal.isOpen) return;

    console.log('🔔 Setting up real-time subscription for admin responses');
    const unsubscribe = subscribeToAdminResponses((adminMessages) => {
      console.log('📨 Received admin messages update:', adminMessages.length);
      
      // Recargar todos los mensajes cuando hay cambios
      fetchAllMessages().then(allMessages => {
        setMessageModal(prev => ({
          ...prev,
          messages: allMessages
        }));
      }).catch(error => {
        console.error('Error refreshing messages:', error);
      });
    });

    return () => {
      if (unsubscribe) {
        console.log('🔌 Unsubscribing from admin responses');
        unsubscribe();
      }
    };
  }, [messageModal.isOpen, subscribeToAdminResponses, fetchAllMessages]);

  const handleSendMessage = async (message, pedidoId) => {
    try {
      await sendMessageToAdmin(message, pedidoId);
      // Recargar mensajes después de enviar
      const updatedMessages = await fetchAllMessages();
      setMessageModal(prev => ({
        ...prev,
        messages: updatedMessages
      }));
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleOpenMessageModal = async (pedido = null) => {
    try {
      // Cargar todos los mensajes
      const messages = await fetchAllMessages();
      setMessageModal({
        isOpen: true,
        pedido: pedido,
        messages: messages
      });
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessageModal({
        isOpen: true,
        pedido: pedido,
        messages: []
      });
    }
  };

  const handleCloseMessageModal = () => {
    setMessageModal({
      isOpen: false,
      pedido: null,
      messages: []
    });
  };

  const handleRefreshNotifications = async () => {
    setIsRefreshing(true);
    try {
      await refreshNotifications();
      // Activar el efecto flash y mensaje
      setShowFlash(true);
      setRefreshMessage('✅ Notificaciones actualizadas');
      // Mantener el efecto por un momento para que sea visible
      setTimeout(() => {
        setIsRefreshing(false);
        setShowFlash(false);
        setRefreshMessage('');
      }, 2000);
    } catch (error) {
      console.error("Error refreshing notifications:", error);
      setIsRefreshing(false);
      setShowFlash(false);
      setRefreshMessage('❌ Error al actualizar');
      setTimeout(() => {
        setRefreshMessage('');
      }, 3000);
    }
  };

  // New Order Modal handlers
  const tabs = [
    {
      id: 'orders',
      name: 'Mis Pedidos',
      icon: Package,
      count: userPedidos.length
    },
    {
      id: 'notifications',
      name: 'Notificaciones',
      icon: Bell,
      count: notifications.filter(n => !n.read).length
    },
    {
      id: 'productos',
      name: 'Productos Shein',
      icon: Package,
      count: userSolicitudes.length
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {userProfile?.nombre || 'Cliente'}
                </h1>
                <p className="text-sm text-gray-500">{phoneNumber}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleOpenMessageModal()}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Contactar</span>
              </button>
              
              <button
                onClick={onLogout}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <Phone className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Mis Pedidos ({userPedidos.length})
              </h2>
            </div>

            {userPedidos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No tienes pedidos aún
                </h3>
                <p className="text-gray-600">
                  Cuando realices un pedido, aparecerá aquí con toda la información de seguimiento.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userPedidos.map((pedido) => (
                  <OrderCard
                    key={pedido.id}
                    pedido={pedido}
                    onMessageClick={handleOpenMessageModal}
                    getOrderStatusDescription={getOrderStatusDescription}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  Notificaciones ({notifications.length})
                </h2>
                <button
                  onClick={handleRefreshNotifications}
                  disabled={isRefreshing}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isRefreshing 
                      ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                      : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                  }`}
                  title="Refrescar notificaciones"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium">
                    {isRefreshing ? 'Refrescando...' : 'Refrescar'}
                  </span>
                </button>
              </div>
              <p className="text-gray-600">
                Mantente al día con las actualizaciones de tus pedidos y mensajes importantes.
              </p>
              {refreshMessage && (
                <div className={`mt-3 p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  refreshMessage.includes('✅') 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {refreshMessage}
                </div>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No tienes notificaciones
                </h3>
                <p className="text-gray-600">
                  Las notificaciones sobre tus pedidos y mensajes aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className={`space-y-4 transition-all duration-300 ${
                showFlash ? 'bg-green-50 border-2 border-green-200 rounded-lg p-4' : ''
              }`}>
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markNotificationAsRead}
                    onDelete={deleteNotification}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Productos Shein Tab */}
        {activeTab === 'productos' && (
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Productos SHEIN ({userSolicitudes.length})
                  </h2>
                  <p className="text-gray-600">
                    Solicita nuevos productos y ve todas tus solicitudes anteriores
                  </p>
                </div>
                <button
                  onClick={() => setSolicitudModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 font-medium shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Nueva Solicitud
                </button>
              </div>
              
              {/* Mensaje de eliminación */}
              {deleteMessage && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-medium transition-opacity duration-300 ${
                  showDeleteMessage ? 'opacity-100' : 'opacity-0'
                } ${
                  deleteMessage.includes('✅') 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {deleteMessage}
                </div>
              )}
            </div>

            {/* Lista de Solicitudes */}
            {solicitudesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Cargando tus solicitudes...</div>
              </div>
            ) : userSolicitudes.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-24 h-24 text-purple-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  No tienes solicitudes SHEIN
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Haz tu primera solicitud de productos SHEIN. Nosotros nos encargamos de obtener toda la información del producto.
                </p>
                <button
                  onClick={() => setSolicitudModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-3 mx-auto text-lg font-medium shadow-lg"
                >
                  <Plus className="w-6 h-6" />
                  Solicitar Primer Producto
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userSolicitudes.map((solicitud) => (
                  <SolicitudesUserCard
                    key={solicitud.id}
                    solicitud={solicitud}
                    onDelete={handleDeleteSolicitud}
                  />
                ))}
                
                {/* Botón flotante para nueva solicitud */}
                <div className="text-center pt-6">
                  <button
                    onClick={() => setSolicitudModal(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-8 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 mx-auto font-medium shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Solicitar Otro Producto
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message Modal */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={handleCloseMessageModal}
        onSendMessage={handleSendMessage}
        pedido={messageModal.pedido}
        messages={messageModal.messages}
        currentUserPhone={phoneNumber}
      />

      {/* Solicitud Productos Modal */}
      <SolicitudProductosModal
        isOpen={solicitudModal}
        onClose={() => setSolicitudModal(false)}
        phoneNumber={phoneNumber}
        onSolicitudCreated={handleSolicitudCreated}
      />
    </div>
  );
};

export default UserDashboard;
