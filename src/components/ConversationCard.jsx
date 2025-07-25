// ConversationCard Component - Groups messages by phone number like a chat
import React, { useState } from 'react';
import { 
  MessageCircle, 
  Send, 
  Clock, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  Bot, 
  User 
} from 'lucide-react';

const ConversationCard = ({ 
  phoneNumber, 
  messages, 
  onSendResponse,
  onMarkAsRead 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Ordenar mensajes por fecha
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion)
  );

  // Obtener el último mensaje
  const lastMessage = sortedMessages[sortedMessages.length - 1];
  const unreadCount = messages.filter(msg => !msg.leido).length;
  const hasAdminResponse = messages.some(msg => msg.respondido);

  const handleSendResponse = async () => {
    if (!responseText.trim() || isSending) return;
    
    setIsSending(true);
    try {
      // Enviar respuesta usando el último mensaje no respondido
      const lastUnrespondedMessage = messages
        .filter(msg => !msg.respondido)
        .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))[0];
      
      if (lastUnrespondedMessage) {
        await onSendResponse(lastUnrespondedMessage.id, phoneNumber, responseText);
        setResponseText('');
      }
    } catch (error) {
      console.error('Error sending response:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAllAsRead = () => {
    messages.forEach(msg => {
      if (!msg.leido) {
        onMarkAsRead(msg.id);
      }
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className={`border rounded-lg bg-white ${unreadCount > 0 ? 'ring-2 ring-blue-200 border-blue-300' : 'border-gray-200'}`}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Phone size={18} className="text-green-600" />
              </div>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">{unreadCount}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900 truncate">
                  {phoneNumber}
                </h3>
                <span className="text-xs text-gray-500">
                  {messages.length} mensaje{messages.length > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-sm text-gray-600 truncate">
                  {lastMessage?.mensaje || 'Sin mensajes'}
                </p>
                <span className="text-xs text-gray-400">
                  {lastMessage && formatTime(lastMessage.fechaCreacion)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {hasAdminResponse && (
              <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <Bot size={12} />
                <span>Respondido</span>
              </div>
            )}
            
            {unreadCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAllAsRead();
                }}
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
              >
                Marcar leído
              </button>
            )}
            
            {isExpanded ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Messages List */}
          <div className="max-h-80 overflow-y-auto p-4 space-y-3">
            {sortedMessages.map((message) => (
              <div key={message.id} className="space-y-2">
                {/* Original Message */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-gray-800">{message.mensaje}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(message.fechaCreacion)} a las {formatTime(message.fechaCreacion)}
                        </span>
                        {!message.leido && (
                          <span className="text-xs text-blue-600 font-medium">No leído</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Response if exists */}
                {message.respondido && message.respuestaAdmin && (
                  <div className="flex items-start space-x-3 ml-8">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot size={14} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-gray-800">{message.respuestaAdmin}</p>
                        <span className="text-xs text-gray-500">
                          Respondido por Admin
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Response Input */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex space-x-3">
              <div className="flex-1">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                  disabled={isSending}
                />
              </div>
              <button
                onClick={handleSendResponse}
                disabled={!responseText.trim() || isSending}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 self-end"
              >
                <Send size={16} />
                <span>{isSending ? 'Enviando...' : 'Enviar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationCard;
