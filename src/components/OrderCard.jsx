import React from 'react';
import { Package, Clock, CheckCircle, Truck, XCircle, DollarSign, CreditCard, AlertCircle } from 'lucide-react';

const OrderCard = ({ pedido, onMessageClick, getOrderStatusDescription }) => {
  console.log('🔍 OrderCard received pedido:', pedido);
  
  const statusInfo = getOrderStatusDescription(pedido.estado);
  
  // Calcular total si no está disponible
  const calculateTotal = () => {
    if (pedido.total && !isNaN(pedido.total)) {
      return pedido.total;
    }
    
    if (pedido.productos && Array.isArray(pedido.productos)) {
      return pedido.productos.reduce((sum, producto) => {
        const subtotal = producto.subtotal || (producto.precioUnitario * producto.cantidad) || 0;
        return sum + subtotal;
      }, 0);
    }
    
    return 0;
  };
  
  const total = calculateTotal();
  
  // Calcular información financiera
  const calculateFinancialInfo = () => {
    // Usar pedido.total si existe, sino calcular
    const totalAmount = pedido.total && !isNaN(pedido.total) ? pedido.total : total;
    const abonos = pedido.abonos || pedido.pagos || 0;
    
    // Usar saldoPendiente guardado si existe, sino calcular
    const saldoPendiente = pedido.saldoPendiente !== undefined && !isNaN(pedido.saldoPendiente) 
      ? pedido.saldoPendiente 
      : Math.max(0, totalAmount - abonos);
      
    const porcentajePagado = totalAmount > 0 ? (abonos / totalAmount) * 100 : 0;
    
    console.log('💰 Financial calculation:', {
      pedidoId: pedido.id,
      pedidoTotal: pedido.total,
      pedidoSaldoPendiente: pedido.saldoPendiente,
      pedidoAbonos: pedido.abonos,
      calculatedTotal: total,
      finalTotal: totalAmount,
      abonos,
      saldoPendiente,
      porcentajePagado
    });
    
    // Determinar estado de pago
    let estadoPago = 'pendiente';
    let estatusTexto = 'Pago pendiente';
    let colorEstatus = 'text-red-600';
    let iconoEstatus = <AlertCircle className="w-4 h-4" />;
    
    if (saldoPendiente <= 0.01 && abonos > 0) { // Considerar pagado si el saldo es menor a 1 centavo
      estadoPago = 'pagado';
      estatusTexto = 'Pagado completo';
      colorEstatus = 'text-green-600';
      iconoEstatus = <CheckCircle className="w-4 h-4" />;
    } else if (abonos > 0) {
      estadoPago = 'abono';
      estatusTexto = 'Abono parcial';
      colorEstatus = 'text-yellow-600';
      iconoEstatus = <DollarSign className="w-4 h-4" />;
    }
    
    return {
      totalAmount,
      abonos,
      saldoPendiente: Math.max(0, saldoPendiente),
      porcentajePagado: Math.min(100, porcentajePagado),
      estadoPago,
      estatusTexto,
      colorEstatus,
      iconoEstatus
    };
  };
  
  const financialInfo = calculateFinancialInfo();
  
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

  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProgress = (estado) => {
    const statusProgress = {
      'Pendiente': 25,
      'Confirmado': 50,
      'Enviado': 75,
      'Entregado': 100,
      'Cancelado': 0
    };
    return statusProgress[estado] || 0;
  };

  const progress = calculateProgress(pedido.estado);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with status */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
        <div className="flex items-center justify-between text-white mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {getStatusIcon(pedido.estado)}
            </div>
            <div>
              <h3 className="font-semibold">
                {pedido.numeroPedido || `Pedido #${pedido.id.slice(-6)}`}
              </h3>
              <p className="text-sm opacity-90">{formatDate(pedido.createdAt)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${financialInfo.totalAmount.toFixed(2)}</p>
            <p className="text-sm opacity-90">Total</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 py-2 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progreso del pedido</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Status description */}
        <div className={`flex items-center space-x-3 mb-4 ${statusInfo.color}`}>
          <span className="text-lg">{statusInfo.icon}</span>
          <p className="font-medium">{statusInfo.description}</p>
        </div>

        {/* Client info and delivery date */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-500">Cliente</p>
            <p className="font-medium">{pedido.nombreCliente}</p>
          </div>
          <div>
            <p className="text-gray-500">Teléfono</p>
            <p className="font-medium">{pedido.numeroTelefono}</p>
          </div>
        </div>

        {/* Delivery Information */}
        {(pedido.fechaEstimadaLlegada || pedido.numeroRastreo) && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-700 flex items-center space-x-2">
                <Truck className="w-4 h-4" />
                <span>Información de Entrega</span>
              </h4>
            </div>
            
            <div className="grid grid-cols-1 gap-2 text-sm">
              {pedido.fechaEstimadaLlegada && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fecha estimada:</span>
                  <span className="font-medium text-blue-600">
                    {new Date(pedido.fechaEstimadaLlegada).toLocaleDateString('es-MX', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {pedido.numeroRastreo && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Número de rastreo:</span>
                  <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded text-blue-700">
                    {pedido.numeroRastreo}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Financial Status */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-700 flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Estado Financiero</span>
            </h4>
            <div className={`flex items-center space-x-1 ${financialInfo.colorEstatus}`}>
              {financialInfo.iconoEstatus}
              <span className="text-sm font-medium">{financialInfo.estatusTexto}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center">
              <p className="text-gray-500">Total</p>
              <p className="font-semibold text-lg">${financialInfo.totalAmount.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Abonado</p>
              <p className="font-semibold text-lg text-green-600">${financialInfo.abonos.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Saldo</p>
              <p className={`font-semibold text-lg ${financialInfo.saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${financialInfo.saldoPendiente.toFixed(2)}
              </p>
            </div>
          </div>
          
          {/* Payment progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progreso de pago</span>
              <span>{financialInfo.porcentajePagado.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  financialInfo.estadoPago === 'pagado' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                    : financialInfo.estadoPago === 'abono'
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                    : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${financialInfo.porcentajePagado}%` }}
              />
            </div>
          </div>
        </div>

        {/* Address */}
        {pedido.direccion && (
          <div className="mb-4">
            <p className="text-gray-500 text-sm">Dirección de entrega</p>
            <p className="font-medium">{pedido.direccion}</p>
          </div>
        )}

        {/* Products */}
        <div className="mb-4">
          <p className="text-gray-500 text-sm mb-2">Productos ({pedido.productos?.length || 0})</p>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
            {pedido.productos?.map((producto, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors px-3 py-2 rounded-lg">
                <div className="flex items-center space-x-3">
                  {producto.completed && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium">{producto.nombreProducto || producto.nombre}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${(producto.precioUnitario || producto.precio || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Cant: {producto.cantidad}</p>
                  {producto.subtotal && (
                    <p className="text-xs text-purple-600 font-medium">Subtotal: ${producto.subtotal.toFixed(2)}</p>
                  )}
                </div>
              </div>
            )) || (
              <p className="text-xs text-gray-500 text-center py-4">No hay productos disponibles</p>
            )}
          </div>
          {pedido.productos?.length > 5 && (
            <div className="flex items-center justify-center mt-2 text-xs text-gray-400">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
              </svg>
              Desliza para ver todos los productos
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17l-4 4m0 0l-4-4m4 4V3" />
              </svg>
            </div>
          )}
        </div>

        {/* Total Summary */}
        <div className="flex justify-between items-center mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
          <div>
            <span className="font-semibold text-gray-700">Resumen Total</span>
            {financialInfo.saldoPendiente > 0 && (
              <p className="text-xs text-red-600">Saldo pendiente: ${financialInfo.saldoPendiente.toFixed(2)}</p>
            )}
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-purple-600">${financialInfo.totalAmount.toFixed(2)}</span>
            {financialInfo.estadoPago === 'pagado' && (
              <p className="text-xs text-green-600 font-medium">✓ Pagado</p>
            )}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => onMessageClick(pedido)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
        >
          <Package className="w-4 h-4" />
          <span>Contactar sobre este pedido</span>
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
