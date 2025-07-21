// Main App Component and Router (View Layer)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import HomePage from './HomePage';
import PedidosPage from './PedidosPage';
import CatalogoPage from './CatalogoPage';
import ClientesPage from './ClientesPage';
import FinanzasPage from './FinanzasPage';
import NotificacionesPage from './NotificacionesPage';
import OrderShareView from './OrderShareView';
import NotificationBadge from '../components/NotificationBadge';
import useNotificacionesController from '../controllers/useNotificacionesController';
import { Home, Package, ShoppingBag, Users, DollarSign, Bell } from 'lucide-react';

// Navigation Item Component
const NavItem = ({ icon, label, page, currentPage, setCurrentPage, badge }) => {
  const isActive = currentPage === page;
  return (
    <li className="flex-1">
      <button
        onClick={() => setCurrentPage(page)}
        className={`flex flex-col items-center justify-center w-full h-full text-sm font-medium py-2 px-1 transition-colors duration-200 relative
          ${isActive ? 'text-purple-600' : 'text-gray-500 hover:text-purple-500'}`}
      >
        <div className="relative">
          {icon}
          {badge && (
            <div className="absolute -top-2 -right-2">
              {badge}
            </div>
          )}
        </div>
        <span className="mt-1 text-xs">{label}</span>
      </button>
    </li>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const { loadingAuth } = useAuth();
  const { contadorNoLeidas: unreadCount } = useNotificacionesController();

  // Logic to detect if URL is for shared view
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'share' && urlParams.get('token')) {
      setCurrentPage('shareOrderView');
    }
  }, []);

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-purple-600 text-lg font-semibold">Cargando aplicación...</div>
      </div>
    );
  }

  const renderPage = () => {
    if (currentPage === 'shareOrderView') {
      return <OrderShareView />;
    }
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'pedidos':
        return <PedidosPage />;
      case 'catalogo':
        return <CatalogoPage />;
      case 'clientes':
        return <ClientesPage />;
      case 'finanzas':
        return <FinanzasPage />;
      case 'notificaciones':
        return <NotificacionesPage />;
      default:
        return <HomePage />;
    }
  };

  // Don't show navigation bar if we're in shared view
  const showNavBar = currentPage !== 'shareOrderView';

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
        }
        `}
      </style>
      <div className={`flex-grow overflow-y-auto ${showNavBar ? 'pb-16' : ''}`}>
        {renderPage()}
      </div>

      {showNavBar && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 h-16">
          <ul className="flex justify-around items-center h-full">
            <NavItem icon={<Home size={24} />} label="Inicio" page="home" currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavItem icon={<Package size={24} />} label="Pedidos" page="pedidos" currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavItem icon={<ShoppingBag size={24} />} label="Catálogo" page="catalogo" currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavItem icon={<Users size={24} />} label="Clientes" page="clientes" currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavItem icon={<DollarSign size={24} />} label="Finanzas" page="finanzas" currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavItem 
              icon={<Bell size={24} />} 
              label="Alertas" 
              page="notificaciones" 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage}
              badge={unreadCount > 0 ? <NotificationBadge count={unreadCount} /> : null}
            />
          </ul>
        </nav>
      )}
    </div>
  );
};

export default App;
