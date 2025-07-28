import React, { useState } from 'react';
import { Plus, Send, Package, Link, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import ENV_CONFIG from '../config/environment';

const SolicitudProductosForm = ({ phoneNumber, onSolicitudCreated, onClose, isModal = false }) => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [telefonoUsuario, setTelefonoUsuario] = useState(phoneNumber || '');
  const [comentarios, setComentarios] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para productos individuales
  const [productos, setProductos] = useState([]);
  const [currentProducto, setCurrentProducto] = useState({
    nombre: '',
    cantidad: 1,
    enlace: '',
    comentario: ''
  });

  // Función para agregar producto al carrito
  const handleAddProducto = () => {
    if (!currentProducto.nombre.trim() || !currentProducto.enlace.trim()) {
      alert('Por favor completa el nombre del producto y el enlace');
      return;
    }

    const nuevoProducto = {
      id: Date.now(),
      ...currentProducto,
      nombre: currentProducto.nombre.trim(),
      enlace: currentProducto.enlace.trim(),
      comentario: currentProducto.comentario.trim()
    };

    setProductos([...productos, nuevoProducto]);
    
    // Limpiar formulario del producto actual
    setCurrentProducto({
      nombre: '',
      cantidad: 1,
      enlace: '',
      comentario: ''
    });
  };

  // Función para eliminar producto del carrito
  const handleRemoveProducto = (id) => {
    setProductos(productos.filter(p => p.id !== id));
  };

  // Función para actualizar campo del producto actual
  const updateCurrentProducto = (field, value) => {
    setCurrentProducto({
      ...currentProducto,
      [field]: value
    });
  };

  const handleSubmitSolicitud = async () => {
    if (!nombreUsuario.trim()) {
      alert('Por favor ingresa tu nombre completo');
      return;
    }

    if (!telefonoUsuario.trim()) {
      alert('Por favor ingresa tu número de teléfono');
      return;
    }

    if (productos.length === 0) {
      alert('Por favor agrega al menos un producto al carrito');
      return;
    }

    setIsLoading(true);
    
    try {
      // Crear solicitud con todos los productos
      const solicitudData = {
        clienteNombre: nombreUsuario.trim(),
        numeroTelefono: telefonoUsuario.trim(),
        productos: productos,
        totalProductos: productos.length,
        cantidadTotal: productos.reduce((sum, p) => sum + parseInt(p.cantidad), 0),
        linkProducto: productos[0].enlace, // Primer enlace como principal
        linksProductos: productos.map(p => p.enlace),
        nombreProducto: productos.length === 1 ? productos[0].nombre : `${productos.length} productos`,
        cantidad: productos.reduce((sum, p) => sum + parseInt(p.cantidad), 0),
        comentarios: comentarios || '',
        fechaCreacion: new Date(),
        procesada: false,
        estado: 'pendiente'
      };

      // Guardar en Firebase
      await addDoc(collection(db, `artifacts/${ENV_CONFIG.APP_ID}/clientSolicitudes`), solicitudData);

      // Limpiar formulario
      setNombreUsuario('');
      setTelefonoUsuario(phoneNumber || '');
      setProductos([]);
      setCurrentProducto({
        nombre: '',
        cantidad: 1,
        enlace: '',
        comentario: ''
      });
      setComentarios('');
      
      // Mostrar mensaje de éxito
      alert('✅ Solicitud enviada correctamente!');
      
      // Llamar callbacks si están disponibles
      if (onSolicitudCreated) {
        onSolicitudCreated(solicitudData);
      }
      
      if (isModal && onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      alert('❌ Error enviando la solicitud. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={isModal ? "p-6" : "max-w-2xl mx-auto"}>
      {/* Header - Solo mostrar si no es modal */}
      {!isModal && (
        <div className="text-center mb-8">
          <Package className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Solicitudes de Productos Shein
          </h2>
          <p className="text-gray-600">
            Comienza a solicitar productos pegando el enlace de Shein
          </p>
        </div>
      )}

      {/* Formulario Principal */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="space-y-6">
          {/* Información del Cliente */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Cliente *
              </label>
              <input
                type="text"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                placeholder="Ej: María García"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Teléfono del Cliente *
              </label>
              <input
                type="tel"
                value={telefonoUsuario}
                onChange={(e) => setTelefonoUsuario(e.target.value)}
                placeholder="Ej: 5512345678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Carrito de Productos */}
          {productos.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-green-800 flex items-center gap-2">
                  🛒 Carrito de Productos ({productos.length} {productos.length === 1 ? 'producto' : 'productos'})
                </h3>
                <span className="text-sm text-green-700">
                  Total: {productos.reduce((sum, p) => sum + parseInt(p.cantidad), 0)} piezas
                </span>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {productos.map((producto) => (
                  <div key={producto.id} className="bg-white p-3 rounded border flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{producto.nombre}</div>
                      <div className="text-sm text-gray-600">
                        Cantidad: {producto.cantidad}
                        {producto.comentario && ` • ${producto.comentario}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProducto(producto.id)}
                      className="text-red-600 hover:text-red-800 font-bold text-lg px-2"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulario para Agregar Producto */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
              ➕ Agregar Producto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={currentProducto.nombre}
                  onChange={(e) => updateCurrentProducto('nombre', e.target.value)}
                  placeholder="Ej: Blusa Negra, Pantalón, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={currentProducto.cantidad}
                  onChange={(e) => updateCurrentProducto('cantidad', e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enlace de SHEIN *
              </label>
              <input
                type="url"
                value={currentProducto.enlace}
                onChange={(e) => updateCurrentProducto('enlace', e.target.value)}
                placeholder="Pega aquí el enlace del producto de SHEIN"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detalles del producto (opcional)
              </label>
              <input
                type="text"
                value={currentProducto.comentario}
                onChange={(e) => updateCurrentProducto('comentario', e.target.value)}
                placeholder="Ej: Talla M, Color Negro, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>

            <button
              type="button"
              onClick={handleAddProducto}
              disabled={!currentProducto.nombre.trim() || !currentProducto.enlace.trim() || isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Agregar al Carrito
            </button>
          </div>

          {/* Comentarios Generales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentarios generales del pedido (opcional)
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Información adicional sobre todo el pedido, instrucciones especiales, etc."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              disabled={isLoading}
            />
          </div>

          {/* Botón de Envío */}
          <div className="text-center">
            <button
              onClick={handleSubmitSolicitud}
              disabled={!nombreUsuario.trim() || !telefonoUsuario.trim() || productos.length === 0 || isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg font-medium"
            >
              <Send className="w-6 h-6" />
              {isLoading ? 'Enviando pedido...' : `Enviar Pedido ${productos.length > 0 ? `(${productos.length} ${productos.length === 1 ? 'producto' : 'productos'})` : ''}`}
            </button>
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">¿Cómo funciona? 🛒</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>1. 👤 Completa el nombre y teléfono del cliente</li>
          <li>2. 🏷️ Agrega cada producto uno por uno al carrito</li>
          <li>3. 🔗 Para cada producto: nombre, cantidad, enlace SHEIN y detalles</li>
          <li>4. ✅ Ve cómo se llena tu carrito en tiempo real</li>
          <li>5. 💬 Agrega comentarios generales si necesitas</li>
          <li>6. 🚀 Envía todo el pedido de una vez</li>
        </ul>
        <div className="mt-3 p-2 bg-blue-100 rounded">
          <p className="text-blue-800 text-xs font-medium">
            💡 Tip: Puedes agregar tantos productos como quieras. Cada uno con su propio enlace, cantidad y detalles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SolicitudProductosForm;
