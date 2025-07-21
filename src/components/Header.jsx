// Reusable Header Component (View Layer)
import React from 'react';

const Header = ({ title, onAddClick }) => (
  <header className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 shadow-md flex justify-between items-center rounded-b-xl">
    <h1 className="text-2xl font-bold">{title}</h1>
    {onAddClick && (
      <button
        onClick={onAddClick}
        className="bg-white text-purple-600 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        aria-label="Añadir nuevo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    )}
  </header>
);

export default Header;
