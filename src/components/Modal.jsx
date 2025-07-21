// Reusable Modal Component (View Layer)
import React from 'react';

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto relative flex flex-col max-h-[90vh]">
        <div className="p-6 pb-2">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>
        <div className="px-6 pb-6 pt-0 overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
