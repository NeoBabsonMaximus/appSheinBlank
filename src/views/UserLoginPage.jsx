import React, { useState, useEffect } from 'react';
import { Phone, Search, AlertCircle, MessageCircle } from 'lucide-react';
import { db } from '../config/firebase';
import ENV_CONFIG from '../config/environment';
import { useUserController } from '../controllers/useUserController';
import OrderCard from '../components/OrderCard';
import MessageModal from '../components/MessageModal';

const UserLoginPage = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      setLoading(true);
      // Simular validación
      setTimeout(() => {
        setIsSearching(true);
        setLoading(false);
        if (onLogin) {
          onLogin(phoneNumber.trim());
        }
      }, 1000);
    }
  };

  const UserResults = () => {
    const {
      userPedidos,
      loading: dataLoading,
      userProfile,
      sendMessageToAdmin,
      fetchAllMessages,
      subscribeToAdminResponses,
      getOrderStatusDescription
    } = useUserController(db, phoneNumber, ENV_CONFIG.APP_ID);

    const [messageModal, setMessageModal] = useState({
      isOpen: false,
      pedido: null,
      messages: []
    });

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
        console.error('Error sending message:', error);
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

    if (dataLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando tus pedidos...</p>
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
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Mis Pedidos</h1>
                  {userProfile && (
                    <p className="text-sm text-gray-500">Hola, {userProfile.nombre}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleOpenMessageModal()}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Contactar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {userPedidos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron pedidos
              </h3>
              <p className="text-gray-600 mb-6">
                No hay pedidos asociados con el número {phoneNumber}
              </p>
              <button
                onClick={() => setIsSearching(false)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Intentar con otro número
              </button>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Tus Pedidos ({userPedidos.length})
                </h2>
              </div>

              {/* Orders Grid */}
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
            </>
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
      </div>
    );
  };

  if (isSearching) {
    return <UserResults />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Consulta tu Pedido
          </h1>
          <p className="text-gray-600">
            Ingresa tu número de teléfono para ver el estado de tus pedidos
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Número de Teléfono
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="10 dígitos (ej: 5512345678)"
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Usa el mismo número con el que hiciste tu pedido
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !phoneNumber.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Buscar mis Pedidos</span>
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">¿No encuentras tu pedido?</p>
              <p>Verifica que estés usando el mismo número de teléfono con el que realizaste tu compra.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLoginPage;