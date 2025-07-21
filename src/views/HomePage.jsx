// HomePage View - Dashboard (View Layer)
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHomeController } from '../controllers/useHomeController';
import Card from '../components/Card';

const HomePage = () => {
  const { userId, db, appId } = useAuth();
  const { pendingOrdersCount, deliveredTodayCount, weeklyRevenue } = useHomeController(db, userId, appId);

  return (
    <div className="p-4">
      <Card>
        <h2 className="text-xl font-semibold mb-2 text-gray-800">¡Bienvenida!</h2>
        <p className="text-gray-600">Este es tu panel de control para gestionar tus ventas de SHEIN.</p>
        {userId && (
          <p className="text-sm text-gray-500 mt-2">
            ID de Usuario: <span className="font-mono break-all">{userId}</span>
          </p>
        )}
      </Card>

      <Card className="mt-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Resumen Rápido</h3>
        <ul className="text-gray-700">
          <li>
            Pedidos Pendientes: <span className="font-bold text-orange-500">{pendingOrdersCount}</span>
          </li>
          <li>
            Pedidos Entregados Hoy: <span className="font-bold text-green-600">{deliveredTodayCount}</span>
          </li>
          <li>
            Ingresos Semanales: <span className="font-bold text-blue-600">${weeklyRevenue.toFixed(2)} MXN</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default HomePage;
