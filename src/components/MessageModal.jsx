import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, User, Bot, Clock } from 'lucide-react';

const MessageModal = ({ 
  isOpen, 
  onClose, 
  onSendMessage, 
  messages = [],
  pedido = null,
  isLoading = false,
  currentUserPhone = null
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await onSendMessage(newMessage.trim(), pedido?.id);
      setNewMessage('');
    }
  };

  const formatMessageTime = (date) => {
    if (!date) return '';
    const messageDate = date.toDate ? date.toDate() : new Date(date);
    return messageDate.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isAdminMessage = (message) => {
    return message.tipo === 'respuesta_admin' || message.type === 'admin_to_customer';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Chat con Administrador
              </h3>
              {pedido && (
                <p className="text-sm opacity-90">
                  Pedido {pedido.numeroPedido || `#${pedido.id?.slice(-6)}`}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay mensajes aún.</p>
              <p className="text-sm">¡Envía tu primer mensaje!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isAdmin = isAdminMessage(message);
              return (
                <div
                  key={index}
                  className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      isAdmin
                        ? 'bg-white border border-gray-200'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    }`}
                  >
                    {/* Message header */}
                    <div className="flex items-center space-x-2 mb-1">
                      {isAdmin ? (
                        <Bot className="w-4 h-4 text-purple-500" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span className={`text-xs font-medium ${
                        isAdmin ? 'text-purple-600' : 'text-white opacity-90'
                      }`}>
                        {isAdmin ? 'Administrador' : 'Tú'}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Clock className={`w-3 h-3 ${
                          isAdmin ? 'text-gray-400' : 'text-white opacity-70'
                        }`} />
                        <span className={`text-xs ${
                          isAdmin ? 'text-gray-500' : 'text-white opacity-70'
                        }`}>
                          {formatMessageTime(message.fechaCreacion || message.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Message content */}
                    <p className={`text-sm ${
                      isAdmin ? 'text-gray-800' : 'text-white'
                    }`}>
                      {message.mensaje || message.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !newMessage.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
