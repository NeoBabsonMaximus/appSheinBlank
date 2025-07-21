// Reusable Button Component (View Layer)
import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  className = 'bg-purple-500 hover:bg-purple-600', 
  disabled = false,
  type = "button"
}) => (
  <button
    type={type}
    onClick={onClick}
    className={`w-full text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 ${className} ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    }`}
    disabled={disabled}
  >
    {children}
  </button>
);

export default Button;
