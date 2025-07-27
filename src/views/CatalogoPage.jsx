// CatalogoPage View - Client Solicitations Management (View Layer)
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import useSolicitudesController from '../controllers/useSolicitudesController';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import SolicitudDetailsModal from '../components/SolicitudDetailsModal';
import { Package, Users, Calendar, Phone, ShoppingBag } from 'lucide-react';
import { formatPhoneNumber } from '../utils/formatters';

const CatalogoPage = ({ onCreateOrder }) => {
  const { userId, db, appId } = useAuth();
  const controller = useSolicitudesController(db, userId, appId);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Manejar creación de pedido desde solicitud individual
  const handleCreateOrderFromSolicitud = (solicitud) => {
    const orderData = {
      nombreCliente: solicitud.nombreCliente,
      numeroTelefono: solicitud.numeroTelefono,
      productos: [{
        nombreProducto: solicitud.nombreProducto,
        cantidad: solicitud.cantidad || 1,
        precioUnitario: 0,
        subtotal: 0,
        enlaceShein: solicitud.enlaceShein,
        completed: false
      }],
      precioTotal: 0,
      saldoPendiente: 0,
      solicitudOriginalId: solicitud.id
    };
    
    if (onCreateOrder) {
      onCreateOrder('pedidos', orderData);
    }
  };

  // Manejar creación de pedido desde grupo de solicitudes
  const handleCreateOrderFromGroup = (group) => {
    // Cada solicitud ES un producto individual
    const allProducts = group.solicitudes.map(solicitud => ({
      nombreProducto: solicitud.nombreProducto,
      cantidad: solicitud.cantidad || 1,
      precioUnitario: 0,
      subtotal: 0,
      enlaceShein: solicitud.enlaceShein,
      completed: false
    }));

    const orderData = {
      nombreCliente: group.clienteNombre,
      numeroTelefono: group.numeroTelefono,
      productos: allProducts,
      precioTotal: 0,
      saldoPendiente: 0,
      solicitudesOriginales: group.solicitudes.map(s => s.id)
    };
    
    if (onCreateOrder) {
      onCreateOrder('pedidos', orderData);
    }
  };

  // Obtener grupos de solicitudes
  const groupedSolicitudes = controller.groupSolicitudesByPhone(controller.solicitudes);

  if (controller.loading) {
    return (
      <div className="p-4">
        <Header title="Solicitudes de Clientes" />
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Cargando solicitudes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Header title="Solicitudes de Clientes" />
      
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Solicitudes</p>
              <p className="text-2xl font-bold text-blue-800">{controller.solicitudes.length}</p>
            </div>
            <Package className="text-blue-500" size={24} />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Clientes Únicos</p>
              <p className="text-2xl font-bold text-green-800">{groupedSolicitudes.length}</p>
            </div>
            <Users className="text-green-500" size={24} />
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Productos Total</p>
              <p className="text-2xl font-bold text-orange-800">
                {controller.solicitudes.length}
              </p>
            </div>
            <ShoppingBag className="text-orange-500" size={24} />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-purple-800">
                {controller.solicitudes.filter(s => !s.procesada).length}
              </p>
            </div>
            <Calendar className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Lista de Solicitudes Agrupadas por Cliente */}
      <div className="space-y-4">
        {groupedSolicitudes.length === 0 ? (
          <div className="text-center py-8">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes pendientes</h3>
            <p className="text-gray-500">Las nuevas solicitudes de clientes aparecerán aquí.</p>
          </div>
        ) : (
          groupedSolicitudes.map((group) => (
            <Card key={group.numeroTelefono} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{group.clienteNombre}</h3>
                    <div className="flex items-center text-gray-600">
                      <Phone size={16} className="mr-1" />
                      <span className="text-sm">{formatPhoneNumber(group.numeroTelefono)}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-4">
                      <span>📦 {group.solicitudes.length} solicitud(es)</span>
                      <span>🛍️ {group.totalProductos} producto(s)</span>
                      <span>📅 {new Date(group.fechaUltima).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>

                  {/* Preview de productos */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Productos solicitados:</p>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {group.solicitudes.slice(0, 5).map((solicitud, idx) => (
                        <p key={idx} className="text-xs text-gray-600">
                          • {(solicitud.nombreProducto || 'Producto sin nombre').substring(0, 60)}
                          {(solicitud.nombreProducto || '').length > 60 ? '...' : ''} (x{solicitud.cantidad || 1})
                        </p>
                      ))}
                      {group.solicitudes.length > 5 && (
                        <p className="text-xs text-gray-500 font-medium">
                          ... y {group.solicitudes.length - 5} producto(s) más
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    onClick={() => {
                      setSelectedGroup(group);
                      setIsDetailsModalOpen(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm"
                  >
                    Ver Detalles
                  </Button>
                  <Button
                    onClick={() => handleCreateOrderFromGroup(group)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm"
                  >
                    Crear Pedido
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Detalles de Solicitud */}
      <SolicitudDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        onCreateOrder={handleCreateOrderFromGroup}
      />
    </div>
  );
};

export default CatalogoPage;
