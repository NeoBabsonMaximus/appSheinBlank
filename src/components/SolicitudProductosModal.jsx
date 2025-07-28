import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import SolicitudProductosForm from './SolicitudProductosForm';

const SolicitudProductosModal = ({ isOpen, onClose, phoneNumber, onSolicitudCreated }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll del body cuando el modal se cierra
      document.body.style.overflow = 'unset';
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    
    // Cleanup: restaurar scroll cuando el componente se desmonta
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Manejar cierre con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Manejar clic fuera del modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-center z-50 p-4 ${
        isOpen ? 'bg-opacity-50' : 'bg-opacity-0'
      } ${isOpen ? 'visible' : 'invisible'}`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🛍️</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Nueva Solicitud de Producto SHEIN
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <SolicitudProductosForm 
            phoneNumber={phoneNumber}
            onSolicitudCreated={onSolicitudCreated}
            onClose={onClose}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
};

export default SolicitudProductosModal;
