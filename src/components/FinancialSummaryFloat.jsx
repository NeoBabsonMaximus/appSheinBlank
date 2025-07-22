// FinancialSummaryFloat Component - Financial summary for orders
import React from 'react';

const FinancialSummaryFloat = ({ totals, isInCard = false }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  if (isInCard) {
    // Versión para usar dentro de una Card (HomePage)
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">💰</span>
              <div>
                <p className="text-sm text-gray-600">Total General</p>
                <p className="font-bold text-lg text-gray-800">{formatCurrency(totals.totalGeneral)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm text-gray-600">Total Pagado</p>
                <p className="font-bold text-lg text-green-600">{formatCurrency(totals.totalPagado)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-orange-600">⏳</span>
              <div>
                <p className="text-sm text-gray-600">Total Pendiente</p>
                <p className="font-bold text-lg text-orange-500">{formatCurrency(totals.totalPendiente)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">📈 Porcentaje cobrado:</span>
            <span className="font-bold text-gray-800">{totals.porcentajePagado}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300 flex items-center justify-center" 
              style={{ width: `${totals.porcentajePagado}%` }}
            >
              {totals.porcentajePagado > 15 && (
                <span className="text-xs text-white font-bold">{totals.porcentajePagado}%</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Versión flotante original (para usar en PedidosPage si se necesita)
  return (
    <div className="fixed top-20 md:top-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-xl p-2 md:p-3 shadow-lg z-40 transition-all duration-300 hover:shadow-xl max-w-xs md:max-w-none overflow-hidden">
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-xs md:text-sm">
        <div className="font-bold text-gray-800 text-sm md:text-base border-b md:border-b-0 md:border-r border-gray-200 pb-1 md:pb-0 md:pr-4 w-full md:w-auto text-center">
          📊 Resumen Financiero
        </div>
        
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 md:gap-6">
          <div className="flex items-center gap-1">
            <span className="text-gray-600">💰</span>
            <span className="font-bold text-gray-800 text-xs md:text-sm">
              {formatCurrency(totals.totalGeneral)}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-gray-600">✅</span>
            <span className="font-bold text-green-600 text-xs md:text-sm">
              {formatCurrency(totals.totalPagado)}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-gray-600">⏳</span>
            <span className="font-bold text-orange-500 text-xs md:text-sm">
              {formatCurrency(totals.totalPendiente)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 border-l border-gray-200 pl-2 md:pl-4">
            <span className="text-xs text-gray-500">📈 {totals.porcentajePagado}%</span>
            
            {/* Barra de progreso horizontal */}
            <div className="w-12 md:w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${totals.porcentajePagado}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryFloat;
