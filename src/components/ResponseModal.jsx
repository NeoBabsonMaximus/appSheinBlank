import React, { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';

const ResponseModal = ({ notification, isOpen, onClose, onSendResponse }) => {
  const [responseMessage, setResponseMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!responseMessage.trim()) return;

    setIsLoading(true);
    try {
      await onSendResponse(notification.id, notification.clientePhone, responseMessage.trim());
      setResponseMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending response:', error);
      alert('Error al enviar la respuesta. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !notification) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-6 h-6" />
              <h2 className="text-lg font-semibold">Responder Mensaje</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Original Message */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Mensaje Original:</h3>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-800 font-medium mb-1">
                {notification.titulo || 'Mensaje de cliente'}
              </p>
              <p className="text-sm text-gray-600">
                {notification.mensaje || notification.message}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                De: {notification.fromName || notification.clientePhone || 'Cliente'}
              </div>
            </div>
          </div>

          {/* Response Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
                Tu Respuesta:
              </label>
              <textarea
                id="response"
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={4}
                required
                disabled={isLoading}
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!responseMessage.trim() || isLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Respuesta</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResponseModal;
