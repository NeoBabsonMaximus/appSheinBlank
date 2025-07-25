import React, { useState } from 'react';
import { Phone, Search, AlertCircle, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { db } from '../config/firebase';
import { useUserController } from '../controllers/useUserController';
import { ENV_CONFIG } from '../config/environment';

const TestUserPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('4463139949');
  const [isSearching, setIsSearching] = useState(true);

  const {
    userPedidos,
    loading,
    userProfile,
    sendMessageToAdmin,
    getOrderStatusDescription
  } = useUserController(db, isSearching ? phoneNumber : null, ENV_CONFIG.APP_ID);

  const handleSearch = () => {
    setIsSearching(true);
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return <Clock className="w-5 h-5" />;
      case 'Confirmado':
        return <CheckCircle className="w-5 h-5" />;
      case 'Enviado':
        return <Truck className="w-5 h-5" />;
      case 'Entregado':
        return <Package className="w-5 h-5" />;
      case 'Cancelado':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-8">
            <h1 className="text-2xl font-bold text-white text-center">
              Prueba Cliente
            </h1>
            <p className="text-purple-100 text-center mt-2">
              Buscar pedidos para: {phoneNumber}
            </p>
          </div>

          {/* Search */}
          <div className="p-6">
            <div className="flex space-x-2 mb-6">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Número de teléfono"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Buscando pedidos...</p>
              </div>
            )}

            {!loading && isSearching && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">
                  Resultados ({userPedidos.length} pedidos)
                </h3>
                
                {userPedidos.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No se encontraron pedidos</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userPedidos.map(pedido => (
                      <div key={pedido.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(pedido.estado)}
                          <div>
                            <h4 className="font-medium">{pedido.nombreCliente}</h4>
                            <p className="text-sm text-gray-500">Estado: {pedido.estado}</p>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            Productos: {pedido.productos?.length || 0}
                          </p>
                          {pedido.productos?.map((producto, idx) => (
                            <div key={idx} className="text-xs text-gray-500 ml-4">
                              • {producto.nombreProducto} - ${producto.precioUnitario} x {producto.cantidad}
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-2 text-right">
                          <p className="font-semibold text-purple-600">
                            Total: ${pedido.precioTotal || (pedido.productos?.reduce((sum, p) => sum + (p.subtotal || p.precioUnitario * p.cantidad), 0) || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestUserPage;
