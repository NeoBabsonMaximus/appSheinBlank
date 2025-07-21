// Home Controller - Business Logic for Dashboard
import { useState, useEffect } from 'react';
import { subscribeToDashboardStats } from '../models/transaccionesModel';

export const useHomeController = (db, userId, appId) => {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [deliveredTodayCount, setDeliveredTodayCount] = useState(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState(0);

  useEffect(() => {
    if (!db || !userId) return;

    const callbacks = {
      onPendingOrdersChange: setPendingOrdersCount,
      onDeliveredTodayChange: setDeliveredTodayCount,
      onWeeklyRevenueChange: setWeeklyRevenue,
    };

    const unsubscribe = subscribeToDashboardStats(db, userId, appId, callbacks);
    
    return unsubscribe;
  }, [db, userId, appId]);

  return {
    pendingOrdersCount,
    deliveredTodayCount,
    weeklyRevenue,
  };
};
