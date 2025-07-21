// Mock Data Service - For development when Firebase is not accessible
export const mockData = {
  pedidos: [
    {
      id: 'mock-1',
      nombreCliente: 'María García',
      numeroTelefono: '+5215512345678',
      productos: [
        {
          nombreProducto: 'Vestido Floral',
          cantidad: 1,
          precioUnitario: 450,
          subtotal: 450
        }
      ],
      precioTotal: 450,
      saldoPendiente: 200,
      estado: 'Pendiente',
      fechaEstimadaLlegada: '2025-07-25',
      numeroRastreo: 'SY123456789',
      pagado: false,
      isArchived: false,
      fechaCreacion: new Date().toLocaleString(),
      clienteId: 'mock-client-1'
    }
  ],
  clientes: [
    {
      id: 'mock-client-1',
      nombre: 'María García',
      contacto: '+5215512345678',
      fechaCreacion: new Date().toLocaleString()
    },
    {
      id: 'mock-client-2',
      nombre: 'Ana López',
      contacto: '+5215587654321',
      fechaCreacion: new Date().toLocaleString()
    }
  ],
  productos: [
    {
      id: 'mock-product-1',
      nombre: 'Vestido Floral',
      descripcion: 'Hermoso vestido con estampado floral',
      precioSugerido: 450,
      fotoUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop',
      fechaCreacion: new Date().toLocaleString()
    }
  ],
  transacciones: [
    {
      id: 'mock-trans-1',
      tipo: 'Ingreso',
      monto: 250,
      descripcion: 'Abono pedido María García',
      fecha: new Date().toISOString().split('T')[0],
      pedidoId: 'mock-1'
    }
  ],
  notificaciones: [
    {
      id: 'mock-notif-1',
      tipo: 'pedido_nuevo',
      titulo: 'Nuevo Pedido',
      mensaje: 'Nuevo pedido de María García por $450',
      prioridad: 'medium',
      leido: false,
      fechaCreacion: new Date().toISOString(),
      relacionadoId: 'mock-1',
      relacionadoTipo: 'pedido'
    },
    {
      id: 'mock-notif-2',
      tipo: 'pago_pendiente',
      titulo: 'Pago Pendiente',
      mensaje: 'El pedido mock-1 de María García tiene un saldo pendiente de $200',
      prioridad: 'high',
      leido: false,
      fechaCreacion: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      relacionadoId: 'mock-1',
      relacionadoTipo: 'pedido'
    },
    {
      id: 'mock-notif-3',
      tipo: 'cliente_nuevo',
      titulo: 'Nuevo Cliente',
      mensaje: 'Ana López se registró como nuevo cliente',
      prioridad: 'low',
      leido: true,
      fechaCreacion: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      relacionadoId: 'mock-client-2',
      relacionadoTipo: 'cliente'
    },
    {
      id: 'mock-notif-4',
      tipo: 'sistema',
      titulo: 'Actualización del Sistema',
      mensaje: 'El sistema ha sido actualizado exitosamente',
      prioridad: 'medium',
      leido: true,
      fechaCreacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      relacionadoId: null,
      relacionadoTipo: null
    }
  ]
};

// Mock subscription functions that simulate Firebase real-time behavior
export const createMockSubscription = (data, callback) => {
  // Simulate initial data load
  setTimeout(() => {
    callback(data);
  }, 100);

  // Return unsubscribe function
  return () => {
    console.log('Mock subscription unsubscribed');
  };
};

export const createMockDashboardSubscription = (callbacks) => {
  setTimeout(() => {
    callbacks.onPendingOrdersChange(1);
    callbacks.onDeliveredTodayChange(0);
    callbacks.onWeeklyRevenueChange(250);
  }, 100);

  return () => {
    console.log('Mock dashboard subscription unsubscribed');
  };
};
