// PedidosArchivadosPage View - Archived Orders Management (View Layer)
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePedidosArchivadosController } from '../controllers/usePedidosArchivadosController';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import { 
  Archive, 
  Trash2, 
  RotateCcw, 
  Search, 
  Filter,
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  Phone,
  Package,
  RefreshCw
} from 'lucide-react';

const ArchivedOrderCard = ({ pedido, onRestore, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Entregado': return 'bg-green-100 text-green-800';
      case 'Enviado': return 'bg-blue-100 text-blue-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      case 'Procesando': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mb-4 border-l-4 border-l-gray-400">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Archive size={20} className="text-gray-500" />
            <h3 className="font-semibold text-lg text-gray-800">{pedido.nombreCliente}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(pedido.estado)}`}>
              {pedido.estado}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-gray-400" />
              <span>{pedido.numeroTelefono || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-gray-400" />
              <span>${pedido.precioTotal?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package size={16} className="text-gray-400" />
              <span>{pedido.productos?.length || 0} productos</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span>Archivado: {pedido.fechaArchivado}</span>
            </div>
          </div>

          {pedido.saldoPendiente > 0 && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle size={16} />
                <span className="font-medium">Saldo pendiente: ${pedido.saldoPendiente.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <Button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-3 py-1"
          >
            <FileText size={16} className="mr-1" />
            {showDetails ? 'Ocultar' : 'Detalles'}
          </Button>
          
          <Button
            onClick={() => onRestore(pedido.id, pedido.nombreCliente)}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1"
          >
            <RotateCcw size={16} className="mr-1" />
            Restaurar
          </Button>
          
          <Button
            onClick={() => onDelete(pedido.id, pedido.nombreCliente)}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1"
          >
            <Trash2 size={16} className="mr-1" />
            Eliminar
          </Button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium mb-3 text-gray-700">Productos:</h4>
          <div className="space-y-2">
            {pedido.productos?.map((producto, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{producto.nombreProducto}</p>
                    <p className="text-sm text-gray-600">Cantidad: {producto.cantidad}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${producto.subtotal?.toLocaleString() || 0}</p>
                    <p className="text-sm text-gray-600">${producto.precioUnitario?.toLocaleString() || 0} c/u</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Fecha de creación:</strong> {pedido.fechaCreacion}</p>
              <p><strong>Fecha estimada:</strong> {pedido.fechaEstimadaLlegada || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Número de rastreo:</strong> {pedido.numeroRastreo || 'N/A'}</p>
              <p><strong>Total:</strong> ${pedido.precioTotal?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

const StatsCard = ({ title, value, icon: Icon, color = "text-gray-600" }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
      <Icon size={32} className={color} />
    </div>
  </Card>
);

const PedidosArchivadosPage = () => {
  const { userId, db, appId } = useAuth();
  const controller = usePedidosArchivadosController(db, userId, appId);
  
  const [showFilters, setShowFilters] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', pedidoId: '', clienteName: '' });

  const handleRestore = (pedidoId, clienteName) => {
    setConfirmModal({
      isOpen: true,
      type: 'restore',
      pedidoId,
      clienteName
    });
  };

  const handleDelete = (pedidoId, clienteName) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      pedidoId,
      clienteName
    });
  };

  const confirmAction = async () => {
    if (confirmModal.type === 'restore') {
      const success = await controller.restaurarPedido(confirmModal.pedidoId);
      if (success) {
        alert('Pedido restaurado exitosamente');
      }
    } else if (confirmModal.type === 'delete') {
      const success = await controller.eliminarPermanentemente(confirmModal.pedidoId);
      if (success) {
        alert('Pedido eliminado permanentemente');
      }
    }
    setConfirmModal({ isOpen: false, type: '', pedidoId: '', clienteName: '' });
  };

  const estados = ['todos', 'Entregado', 'Enviado', 'Cancelado', 'Procesando', 'Pendiente'];

  if (controller.loading) {
    return (
      <div className="p-4">
        <Header title="Pedidos Archivados" />
        <div className="flex items-center justify-center mt-8">
          <RefreshCw className="animate-spin mr-2" size={20} />
          <span>Cargando pedidos archivados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Header title="Pedidos Archivados" />
      
      {/* Error Message */}
      {controller.error && (
        <Card className="mb-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertTriangle size={20} />
              <span>{controller.error}</span>
            </div>
            <Button onClick={controller.clearError} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1">
              Cerrar
            </Button>
          </div>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Archivados"
          value={controller.estadisticas.total}
          icon={Archive}
          color="text-gray-600"
        />
        <StatsCard
          title="Ventas Totales"
          value={`$${controller.estadisticas.totalVentas.toLocaleString()}`}
          icon={DollarSign}
          color="text-green-600"
        />
        <StatsCard
          title="Saldos Pendientes"
          value={`$${controller.estadisticas.saldosPendientes.toLocaleString()}`}
          icon={AlertTriangle}
          color="text-red-600"
        />
        <StatsCard
          title="Entregados"
          value={controller.estadisticas.porEstado.Entregado || 0}
          icon={Package}
          color="text-blue-600"
        />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 ${
                showFilters ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <Filter size={16} />
              <span>Filtros</span>
            </Button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Archive size={16} />
              <span>{controller.pedidosArchivados.length} pedidos archivados</span>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por cliente:
                </label>
                <Input
                  type="text"
                  placeholder="Nombre del cliente..."
                  value={controller.filtroCliente}
                  onChange={(e) => controller.setFiltroCliente(e.target.value)}
                  icon={<Search size={16} />}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por estado:
                </label>
                <Select
                  value={controller.filtroEstado}
                  onChange={(e) => controller.setFiltroEstado(e.target.value)}
                  options={estados.map(estado => ({
                    value: estado,
                    label: estado === 'todos' ? 'Todos los estados' : estado
                  }))}
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Archived Orders List */}
      <div>
        {controller.pedidosArchivados.length === 0 ? (
          <Card className="text-center py-8">
            <Archive size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              No hay pedidos archivados
            </h3>
            <p className="text-gray-400">
              {controller.filtroEstado !== 'todos' || controller.filtroCliente ? 
                'No se encontraron pedidos con los filtros aplicados.' :
                'Los pedidos archivados aparecerán aquí.'
              }
            </p>
          </Card>
        ) : (
          <div>
            {controller.pedidosArchivados.map(pedido => (
              <ArchivedOrderCard
                key={pedido.id}
                pedido={pedido}
                onRestore={handleRestore}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, type: '', pedidoId: '', clienteName: '' })}>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            {confirmModal.type === 'restore' ? (
              <RotateCcw className="h-6 w-6 text-yellow-600" />
            ) : (
              <Trash2 className="h-6 w-6 text-red-600" />
            )}
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {confirmModal.type === 'restore' ? 'Restaurar Pedido' : 'Eliminar Permanentemente'}
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            {confirmModal.type === 'restore' ? 
              `¿Estás segura de que quieres restaurar el pedido de ${confirmModal.clienteName}? El pedido volverá a aparecer en la lista principal.` :
              `¿Estás segura de que quieres eliminar permanentemente el pedido de ${confirmModal.clienteName}? Esta acción no se puede deshacer.`
            }
          </p>
          
          <div className="flex space-x-3 justify-center">
            <Button
              onClick={() => setConfirmModal({ isOpen: false, type: '', pedidoId: '', clienteName: '' })}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmAction}
              className={confirmModal.type === 'restore' ? 
                'bg-blue-500 hover:bg-blue-600 text-white' : 
                'bg-red-500 hover:bg-red-600 text-white'
              }
            >
              {confirmModal.type === 'restore' ? 'Restaurar' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PedidosArchivadosPage;
