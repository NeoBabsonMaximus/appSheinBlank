// FinanzasPage View - Financial Management (View Layer)
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinanzasController } from '../controllers/useFinanzasController';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';

const FinanzasPage = () => {
  const { userId, db, appId } = useAuth();
  const controller = useFinanzasController(db, userId, appId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveTransaccion = async () => {
    try {
      await controller.saveTransaccion();
      setIsModalOpen(false);
    } catch (error) {
      alert("Error al guardar la transacción. Por favor, inténtalo de nuevo.");
    }
  };

  const handleDeleteTransaccion = async (id) => {
    if (window.confirm("¿Estás segura de que quieres eliminar esta transacción?")) {
      try {
        await controller.deleteTransaccionById(id);
      } catch (error) {
        alert("Error al eliminar la transacción. Por favor, inténtalo de nuevo.");
      }
    }
  };

  const openAddModal = () => {
    controller.resetCurrentTransaccion();
    setIsModalOpen(true);
  };

  const openEditModal = (transaccion) => {
    controller.setCurrentTransaccionForEdit(transaccion);
    setIsModalOpen(true);
  };

  const { totalIngresos, totalEgresos, utilidad } = controller.calculateFinancialSummary();

  return (
    <div className="p-4">
      <Header title="Control de Pagos y Finanzas" onAddClick={openAddModal} />

      <Card className="mt-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Resumen Financiero</h3>
        <p className="text-green-600 text-lg">Ingresos Totales: <span className="font-bold">${totalIngresos.toFixed(2)}</span></p>
        <p className="text-red-600 text-lg">Egresos Totales: <span className="font-bold">${totalEgresos.toFixed(2)}</span></p>
        <p className={`text-lg font-bold ${utilidad >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
          Utilidad Neta: ${utilidad.toFixed(2)}
        </p>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4">
        {controller.transacciones.length === 0 ? (
          <p className="text-center text-gray-600 col-span-full">No hay transacciones registradas. ¡Añade una!</p>
        ) : (
          controller.transacciones.map((transaccion) => (
            <Card key={transaccion.id} className="flex flex-col justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${transaccion.tipo === 'Ingreso' ? 'text-green-700' : 'text-red-700'}`}>
                  {transaccion.tipo}: ${transaccion.monto?.toFixed(2) || 'N/A'}
                </h3>
                <p className="text-gray-600 text-sm">{transaccion.descripcion}</p>
                <p className="text-gray-500 text-xs mt-1">Fecha: {transaccion.fecha}</p>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button onClick={() => openEditModal(transaccion)} className="bg-blue-500 hover:bg-blue-600 px-3 py-1 text-sm">
                  Editar
                </Button>
                <Button onClick={() => handleDeleteTransaccion(transaccion.id)} className="bg-red-500 hover:bg-red-600 px-3 py-1 text-sm">
                  Eliminar
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={controller.editingId ? "Editar Transacción" : "Añadir Nueva Transacción"}
      >
        <Select
          label="Tipo de Transacción"
          id="tipoTransaccion"
          value={controller.currentTransaccion.tipo}
          onChange={(e) => controller.setCurrentTransaccion({ ...controller.currentTransaccion, tipo: e.target.value })}
          options={[
            { value: 'Ingreso', label: 'Ingreso' },
            { value: 'Egreso', label: 'Egreso' },
          ]}
        />
        <Input
          label="Monto"
          id="montoTransaccion"
          type="number"
          value={controller.currentTransaccion.monto}
          onChange={(e) => controller.setCurrentTransaccion({ ...controller.currentTransaccion, monto: e.target.value })}
          placeholder="Ej: 150.00"
        />
        <Input
          label="Descripción"
          id="descripcionTransaccion"
          value={controller.currentTransaccion.descripcion}
          onChange={(e) => controller.setCurrentTransaccion({ ...controller.currentTransaccion, descripcion: e.target.value })}
          placeholder="Ej: Pago de pedido #123"
        />
        <Input
          label="Fecha"
          id="fechaTransaccion"
          type="date"
          value={controller.currentTransaccion.fecha}
          onChange={(e) => controller.setCurrentTransaccion({ ...controller.currentTransaccion, fecha: e.target.value })}
        />
        <Button onClick={handleSaveTransaccion} className="mt-4 bg-purple-500 hover:bg-purple-600">
          {controller.editingId ? "Guardar Cambios" : "Añadir Transacción"}
        </Button>
      </Modal>
    </div>
  );
};

export default FinanzasPage;
