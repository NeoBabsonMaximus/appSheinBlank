// ClientesPage View - Customer Management (View Layer)
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useClientesController } from '../controllers/useClientesController';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';

const ClientesPage = () => {
  const { userId, db, appId } = useAuth();
  const controller = useClientesController(db, userId, appId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveCliente = async () => {
    try {
      await controller.saveCliente();
      setIsModalOpen(false);
    } catch (error) {
      alert("Error al guardar el cliente. Por favor, inténtalo de nuevo.");
    }
  };

  const handleDeleteCliente = async (id) => {
    if (window.confirm("¿Estás segura de que quieres eliminar este cliente?")) {
      try {
        await controller.deleteClienteById(id);
      } catch (error) {
        alert("Error al eliminar el cliente. Por favor, inténtalo de nuevo.");
      }
    }
  };

  const openAddModal = () => {
    controller.resetCurrentCliente();
    setIsModalOpen(true);
  };

  const openEditModal = (cliente) => {
    controller.setCurrentClienteForEdit(cliente);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4">
      <Header title="Gestión de Clientes" onAddClick={openAddModal} />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {controller.clientes.length === 0 ? (
          <p className="text-center text-gray-600 col-span-full">No hay clientes registrados. ¡Añade uno!</p>
        ) : (
          controller.clientes.map((cliente) => (
            <Card key={cliente.id} className="flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{cliente.nombre}</h3>
                <p className="text-gray-600">Contacto: {cliente.contacto}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2 mt-4">
                <Button 
                  onClick={() => controller.sendMessage(cliente.contacto, 'pedidoLlego')} 
                  className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 text-sm"
                >
                  Pedido Llegó
                </Button>
                <Button 
                  onClick={() => controller.sendMessage(cliente.contacto, 'saldoPendiente')} 
                  className="bg-orange-500 hover:bg-orange-600 px-3 py-1 text-sm"
                >
                  Saldo Pendiente
                </Button>
                <Button onClick={() => openEditModal(cliente)} className="bg-blue-500 hover:bg-blue-600 px-3 py-1 text-sm">
                  Editar
                </Button>
                <Button onClick={() => handleDeleteCliente(cliente.id)} className="bg-red-500 hover:bg-red-600 px-3 py-1 text-sm">
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
        title={controller.editingId ? "Editar Cliente" : "Añadir Nuevo Cliente"}
      >
        <Input
          label="Nombre del Cliente"
          id="nombreCliente"
          value={controller.currentCliente.nombre}
          onChange={(e) => controller.setCurrentCliente({ ...controller.currentCliente, nombre: e.target.value })}
          placeholder="Ej: Ana López"
        />
        <Input
          label="Contacto (WhatsApp)"
          id="contactoCliente"
          type="tel"
          value={controller.currentCliente.contacto}
          onChange={(e) => controller.setCurrentCliente({ ...controller.currentCliente, contacto: e.target.value })}
          placeholder="Ej: +521234567890 o 5512345678"
        />
        <Button onClick={handleSaveCliente} className="mt-4 bg-purple-500 hover:bg-purple-600">
          {controller.editingId ? "Guardar Cambios" : "Añadir Cliente"}
        </Button>
      </Modal>
    </div>
  );
};

export default ClientesPage;
