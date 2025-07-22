// FinancialSummaryFloat Component - Floating financial summary for orders
import React from 'react';

const FinancialSummaryFloat = ({ totals }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-xl p-3 shadow-lg z-50 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center gap-6 text-sm">
        <div className="font-bold text-gray-800 text-base border-r border-gray-200 pr-4">
          📊 Resumen Financiero
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-gray-600">💰</span>
          <span className="font-bold text-gray-800">
            {formatCurrency(totals.totalGeneral)}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-gray-600">✅</span>
          <span className="font-bold text-green-600">
            {formatCurrency(totals.totalPagado)}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-gray-600">⏳</span>
          <span className="font-bold text-orange-500">
            {formatCurrency(totals.totalPendiente)}
          </span>
        </div>
        
        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
          <span className="text-xs text-gray-500">📈 {totals.porcentajePagado}%</span>
          
          {/* Barra de progreso horizontal */}
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${totals.porcentajePagado}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryFloat;
