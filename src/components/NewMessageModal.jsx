// NewMessageModal Component - Modal for admin to send new messages to users
import React, { useState } from 'react';
import { X, Send, MessageCircle, Phone } from 'lucide-react';

const NewMessageModal = ({ 
  isOpen, 
  onClose, 
  onSendMessage 
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim() || !message.trim() || isSending) return;
    
    setIsSending(true);
    try {
      await onSendMessage(phoneNumber.trim(), message.trim());
      
      // Limpiar formulario y cerrar modal
      setPhoneNumber('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setIsSending(false);
    }
  };

  const formatPhoneNumber = (value) => {
    // Limpiar número y formatear
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length <= 10) {
      // Formato para números mexicanos: XXX XXX XXXX
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        return [match[1], match[2], match[3]]
          .filter(Boolean)
          .join(' ');
      }
    }
    
    return value;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Nuevo Mensaje
              </h3>
              <p className="text-sm opacity-90">
                Enviar mensaje a cliente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Phone Number Input */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Número de teléfono
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="phoneNumber"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="555 123 4567"
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSending}
                maxLength={12} // XXX XXX XXXX with spaces
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Formato: 555 123 4567 (sin código de país)
            </p>
          </div>

          {/* Message Input */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={isSending}
              maxLength={500}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">
                Mensaje que recibirá el cliente
              </p>
              <p className="text-xs text-gray-400">
                {message.length}/500
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!phoneNumber.trim() || !message.trim() || isSending}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">💡 Consejo</p>
                <p>
                  El mensaje se enviará directamente al cliente y aparecerá en su aplicación. 
                  También puedes continuar la conversación desde las "Conversaciones con Clientes".
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMessageModal;
