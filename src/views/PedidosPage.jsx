// PedidosPage View - Orders Management (View Layer)
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePedidosController } from '../controllers/usePedidosController';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import { Archive, CreditCard, Share2, PlusCircle, Trash2, Copy, Send } from 'lucide-react';
import { formatPhoneNumber } from '../utils/formatters';

// Modal component for adding products to order
const AddProductToOrderModal = ({ isOpen, onClose, onAddProduct }) => {
  const [nombreProducto, setNombreProducto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAdd = () => {
    const qty = parseInt(cantidad);
    const unitPrice = parseFloat(precioUnitario);

    if (!nombreProducto || isNaN(qty) || qty <= 0 || isNaN(unitPrice) || unitPrice <= 0) {
      setErrorMessage('Por favor, completa todos los campos con valores válidos.');
      return;
    }

    const newProduct = {
      nombreProducto,
      cantidad: qty,
      precioUnitario: unitPrice,
      subtotal: qty * unitPrice,
    };
    onAddProduct(newProduct);
    onClose();
    setNombreProducto('');
    setCantidad('');
    setPrecioUnitario('');
    setErrorMessage('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir Producto al Pedido">
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4">
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      <Input
        label="Nombre del Producto"
        id="nombreProducto"
        value={nombreProducto}
        onChange={(e) => { setNombreProducto(e.target.value); setErrorMessage(''); }}
        placeholder="Ej: Vestido de verano"
      />
      <Input
        label="Cantidad"
        id="cantidad"
        type="number"
        value={cantidad}
        onChange={(e) => { setCantidad(e.target.value); setErrorMessage(''); }}
        placeholder="Ej: 1"
      />
      <Input
        label="Precio Unitario"
        id="precioUnitario"
        type="number"
        value={precioUnitario}
        onChange={(e) => { setPrecioUnitario(e.target.value); setErrorMessage(''); }}
        placeholder="Ej: 250.00"
      />
      <Button onClick={handleAdd} className="mt-4 bg-purple-500 hover:bg-purple-600">
        Añadir Producto
      </Button>
    </Modal>
  );
};

// Payment Modal Component
const PaymentModal = ({ isOpen, onClose, pedido, onPaymentSuccess, processPayment }) => {
  const [montoAbono, setMontoAbono] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleProcessPayment = async (isFullPayment = false) => {
    try {
      let amountToPay = isFullPayment ? pedido.saldoPendiente : parseFloat(montoAbono);

      if (isNaN(amountToPay) || amountToPay <= 0) {
        setErrorMessage("Por favor, ingresa un monto válido y mayor a cero.");
        return;
      }

      if (amountToPay > pedido.saldoPendiente) {
        setErrorMessage(`El monto a pagar ($${amountToPay.toFixed(2)}) no puede ser mayor que el saldo pendiente ($${pedido.saldoPendiente.toFixed(2)}).`);
        return;
      }

      await processPayment(pedido, amountToPay, isFullPayment);
      onPaymentSuccess();
      setMontoAbono('');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage("Error al procesar el pago. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Registrar Pago para: ${pedido?.nombreCliente}`}>
      {pedido && (
        <>
          <p className="text-gray-700 mb-2">
            Productos: <span className="font-semibold">{pedido.productos.map(p => `${p.nombreProducto} (x${p.cantidad})`).join(', ')}</span>
          </p>
          <p className="text-gray-700 mb-2">
            Precio Total del Pedido: <span className="font-semibold text-lg">${pedido.precioTotal?.toFixed(2) || '0.00'}</span>
          </p>
          <p className="text-gray-700 mb-4">
            Saldo Pendiente: <span className="font-semibold text-xl text-red-600">${pedido.saldoPendiente?.toFixed(2) || '0.00'}</span>
          </p>

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}

          <Input
            label="Monto a Abonar"
            id="montoAbono"
            type="number"
            value={montoAbono}
            onChange={(e) => {
              setMontoAbono(e.target.value);
              setErrorMessage('');
            }}
            placeholder={`Máx. ${pedido.saldoPendiente?.toFixed(2) || '0.00'}`}
          />

          <div className="flex flex-col space-y-3 mt-4">
            <Button 
              onClick={() => handleProcessPayment(false)} 
              className="bg-green-500 hover:bg-green-600" 
              disabled={!montoAbono || parseFloat(montoAbono) <= 0 || parseFloat(montoAbono) > pedido.saldoPendiente}
            >
              Registrar Abono
            </Button>
            <Button 
              onClick={() => handleProcessPayment(true)} 
              className="bg-blue-500 hover:bg-blue-600" 
              disabled={pedido.saldoPendiente <= 0}
            >
              Pagar Completo (${pedido.saldoPendiente?.toFixed(2) || '0.00'})
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

// Share Link Modal Component
const ShareLinkModal = ({ isOpen, onClose, shareLink, phoneNumber }) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      console.log("Enlace copiado al portapapeles:", shareLink);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  };

  const handleShareWhatsApp = () => {
    const message = `¡Hola! Aquí puedes ver el estado de tu pedido de SHEIN: ${shareLink}`;
    const whatsappUrl = `https://wa.me/${formatPhoneNumber(phoneNumber)}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compartir Enlace del Pedido">
      <p className="text-gray-700 mb-2">Envía este enlace a tu cliente para que vea el estado de su pedido:</p>
      <div className="bg-gray-100 p-3 rounded-lg break-all text-sm mb-4">
        {shareLink}
      </div>
      <div className="flex flex-col space-y-3">
        <Button onClick={handleCopyLink} className="bg-blue-500 hover:bg-blue-600 flex items-center justify-center">
          <Copy size={18} className="mr-2" /> Copiar Enlace
        </Button>
        <Button 
          onClick={handleShareWhatsApp} 
          className="bg-green-500 hover:bg-green-600 flex items-center justify-center" 
          disabled={!phoneNumber}
        >
          <Send size={18} className="mr-2" /> Enviar por WhatsApp
        </Button>
      </div>
      {!phoneNumber && <p className="text-red-500 text-xs mt-2">Para enviar por WhatsApp, el pedido debe tener un número de teléfono.</p>}
    </Modal>
  );
};

const PedidosPage = () => {
  const { userId, db, appId } = useAuth();
  const controller = usePedidosController(db, userId, appId);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isShareLinkModalOpen, setIsShareLinkModalOpen] = useState(false);
  const [currentShareableLink, setCurrentShareableLink] = useState('');
  const [currentShareablePhoneNumber, setCurrentShareablePhoneNumber] = useState('');
  const [paymentPedido, setPaymentPedido] = useState(null);

  const handleSavePedido = async () => {
    try {
      await controller.savePedido();
      setIsModalOpen(false);
    } catch (error) {
      alert("Error al guardar el pedido. Por favor, inténtalo de nuevo.");
    }
  };

  const handleOpenPaymentModal = (pedido) => {
    setPaymentPedido(pedido);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setPaymentPedido(null);
  };

  const handleGenerateShareLink = async (pedido) => {
    try {
      const shareLink = await controller.generateShareLink(pedido);
      setCurrentShareableLink(shareLink);
      setCurrentShareablePhoneNumber(pedido.numeroTelefono);
      setIsShareLinkModalOpen(true);
    } catch (error) {
      alert("No se pudo generar el enlace. Por favor, inténtalo de nuevo.");
    }
  };

  const handleDeletePedido = async (id) => {
    if (window.confirm("¿Estás segura de que quieres eliminar este pedido?")) {
      try {
        await controller.deletePedido(id);
      } catch (error) {
        alert("Error al eliminar el pedido. Por favor, inténtalo de nuevo.");
      }
    }
  };

  const handleArchivePedido = async (pedidoId) => {
    // Find the order to check for pending balance
    const pedido = controller.pedidos.find(p => p.id === pedidoId);
    
    if (pedido && pedido.saldoPendiente > 0) {
      alert("No se puede archivar un pedido que tiene saldo pendiente. Por favor, complete el pago primero.");
      return;
    }
    
    if (window.confirm("¿Estás segura de que quieres archivar este pedido?")) {
      try {
        await controller.archivePedido(pedidoId);
      } catch (error) {
        alert("Error al archivar el pedido. Por favor, inténtalo de nuevo.");
      }
    }
  };

  const openAddModal = () => {
    controller.resetCurrentPedido();
    setIsModalOpen(true);
  };

  const openEditModal = (pedido) => {
    controller.setCurrentPedidoForEdit(pedido);
    setIsModalOpen(true);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Enviado': return 'bg-blue-100 text-blue-800';
      case 'Entregado': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4">
      <Header title="Gestión de Pedidos" onAddClick={openAddModal} />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {controller.pedidos.length === 0 ? (
          <p className="text-center text-gray-600 col-span-full">No hay pedidos activos. ¡Añade uno o revisa los archivados!</p>
        ) : (
          controller.pedidos.map((pedido) => (
            <Card key={pedido.id} className="flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Pedido para: {pedido.nombreCliente}</h3>
                {pedido.numeroTelefono && <p className="text-gray-600">Teléfono: {pedido.numeroTelefono}</p>}
                <p className="text-gray-700 font-bold mt-2">Productos:</p>
                <ul className="list-disc list-inside text-gray-600 text-sm mb-2">
                  {pedido.productos && pedido.productos.length > 0 ? (
                    pedido.productos.map((item, idx) => (
                      <li key={idx}>
                        {item.nombreProducto} (x{item.cantidad}) - ${item.subtotal?.toFixed(2) || '0.00'}
                      </li>
                    ))
                  ) : (
                    <li>No hay productos registrados.</li>
                  )}
                </ul>
                <p className="text-gray-600">Precio Total: <span className="font-bold">${pedido.precioTotal?.toFixed(2) || 'N/A'}</span></p>
                <p className="text-gray-600">Saldo Pendiente: <span className="font-bold text-red-600">${pedido.saldoPendiente?.toFixed(2) || '0.00'}</span></p>
                <p className="text-gray-600">Fecha Estimada: {pedido.fechaEstimadaLlegada || 'N/A'}</p>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(pedido.estado)} mt-2`}>
                  {pedido.estado}
                </span>
                {pedido.numeroRastreo && (
                  <p className="text-sm text-gray-500 mt-1">Rastreo: {pedido.numeroRastreo}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">Creado: {pedido.fechaCreacion}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2 mt-4">
                {pedido.estado === 'Entregado' && !pedido.isArchived && pedido.saldoPendiente === 0 && (
                  <Button onClick={() => handleArchivePedido(pedido.id)} className="bg-gray-500 hover:bg-gray-600 px-3 py-1 text-sm flex items-center">
                    <Archive size={16} className="mr-1" /> Archivar
                  </Button>
                )}
                {!pedido.pagado && pedido.saldoPendiente > 0 && (
                  <Button onClick={() => handleOpenPaymentModal(pedido)} className="bg-purple-500 hover:bg-purple-600 px-3 py-1 text-sm flex items-center">
                    <CreditCard size={16} className="mr-1" /> Hacer Pago
                  </Button>
                )}
                <Button onClick={() => handleGenerateShareLink(pedido)} className="bg-orange-500 hover:bg-orange-600 px-3 py-1 text-sm flex items-center">
                  <Share2 size={16} className="mr-1" /> Compartir
                </Button>
                <Button onClick={() => openEditModal(pedido)} className="bg-blue-500 hover:bg-blue-600 px-3 py-1 text-sm">
                  Editar
                </Button>
                <Button onClick={() => handleDeletePedido(pedido.id)} className="bg-red-500 hover:bg-red-600 px-3 py-1 text-sm">
                  Eliminar
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Main Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={controller.editingId ? "Editar Pedido" : "Añadir Nuevo Pedido"}
      >
        <Input
          label="Nombre del Cliente"
          id="nombreCliente"
          value={controller.currentPedido.nombreCliente}
          onChange={(e) => controller.setCurrentPedido({ ...controller.currentPedido, nombreCliente: e.target.value })}
          placeholder="Ej: María García"
        />
        <Input
          label="Número de Teléfono del Cliente"
          id="numeroTelefono"
          type="tel"
          value={controller.currentPedido.numeroTelefono}
          onChange={(e) => controller.setCurrentPedido({ ...controller.currentPedido, numeroTelefono: e.target.value })}
          placeholder="Ej: 5512345678"
        />

        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Productos del Pedido</h3>
          {controller.currentPedido.productos.length === 0 ? (
            <p className="text-gray-600 text-sm mb-2">No hay productos en este pedido.</p>
          ) : (
            <ul className="border rounded-lg p-3 mb-2 bg-gray-50">
              {controller.currentPedido.productos.map((item, index) => (
                <li key={index} className="flex justify-between items-center py-1 border-b last:border-b-0">
                  <span className="text-gray-700 text-sm">
                    {item.nombreProducto} (x{item.cantidad}) - ${item.subtotal?.toFixed(2) || '0.00'}
                  </span>
                  <button
                    onClick={() => controller.removeProductFromCurrentPedido(index)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full"
                    aria-label="Eliminar producto"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Button
            onClick={() => setIsAddProductModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 px-3 py-2 text-sm flex items-center justify-center"
          >
            <PlusCircle size={18} className="mr-2" /> Añadir Producto al Pedido
          </Button>
          <p className="text-gray-800 font-bold mt-3">Total del Pedido: ${controller.currentPedido.precioTotal?.toFixed(2) || '0.00'}</p>
        </div>

        <Select
          label="Estado"
          id="estado"
          value={controller.currentPedido.estado}
          onChange={(e) => controller.setCurrentPedido({ ...controller.currentPedido, estado: e.target.value })}
          options={[
            { value: 'Pendiente', label: 'Pendiente' },
            { value: 'Enviado', label: 'Enviado' },
            { value: 'Entregado', label: 'Entregado' },
            { value: 'Cancelado', label: 'Cancelado' },
          ]}
        />
        <Input
          label="Fecha Estimada de Llegada"
          id="fechaEstimadaLlegada"
          type="date"
          value={controller.currentPedido.fechaEstimadaLlegada}
          onChange={(e) => controller.setCurrentPedido({ ...controller.currentPedido, fechaEstimadaLlegada: e.target.value })}
        />
        <Input
          label="Número de Rastreo (Opcional)"
          id="numeroRastreo"
          value={controller.currentPedido.numeroRastreo}
          onChange={(e) => controller.setCurrentPedido({ ...controller.currentPedido, numeroRastreo: e.target.value })}
          placeholder="Ej: SY123456789"
        />
        <p className="text-gray-700 text-sm mb-2">Saldo Pendiente: <span className="font-bold">${controller.currentPedido.saldoPendiente?.toFixed(2) || '0.00'}</span></p>
        <p className="text-gray-700 text-sm mb-4">Pagado: <span className="font-bold">{controller.currentPedido.pagado ? 'Sí' : 'No'}</span></p>

        <Button onClick={handleSavePedido} className="mt-4 bg-purple-500 hover:bg-purple-600" disabled={controller.currentPedido.productos.length === 0}>
          {controller.editingId ? "Guardar Cambios" : "Añadir Pedido"}
        </Button>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        pedido={paymentPedido}
        onPaymentSuccess={handlePaymentSuccess}
        processPayment={controller.processPayment}
      />

      {/* Add Product Modal */}
      <AddProductToOrderModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onAddProduct={controller.addProductToCurrentPedido}
      />

      {/* Share Link Modal */}
      <ShareLinkModal
        isOpen={isShareLinkModalOpen}
        onClose={() => setIsShareLinkModalOpen(false)}
        shareLink={currentShareableLink}
        phoneNumber={currentShareablePhoneNumber}
      />
    </div>
  );
};

export default PedidosPage;
