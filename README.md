# Shein Blank App - Sistema de Gestión de Pedidos MVC

Una aplicación React con arquitectura MVC para gestionar ventas y pedidos de productos SHEIN.

## 🏗️ Arquitectura MVC

### **Models (Modelos - Capa de Datos)**
- `src/models/` - Lógica de datos y comunicación con Firebase Firestore
- `pedidosModel.js` - Gestión de pedidos
- `clientesModel.js` - Gestión de clientes  
- `productosModel.js` - Gestión del catálogo de productos
- `transaccionesModel.js` - Gestión financiera y transacciones

### **Views (Vistas - Capa de Presentación)**
- `src/views/` - Componentes React que renderizan la interfaz
- `src/components/` - Componentes UI reutilizables (Button, Card, Modal, etc.)

### **Controllers (Controladores - Lógica de Negocio)**
- `src/controllers/` - Custom hooks que manejan la lógica de negocio
- Conectan las vistas con los modelos
- Gestionan el estado de la aplicación

## 🚀 Configuración Inicial

### Prerequisitos
- Node.js (v14 o superior)
- npm o yarn
- Git

### Instalación Rápida

```bash
# Clonar e instalar dependencias
git clone <repository-url>
cd appSheinBlank

# Ejecutar script de configuración
chmod +x setup.sh
./setup.sh
```

### Instalación Manual

```bash
# Instalar dependencias
npm install

# Configurar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Configurar Capacitor para móvil
npx cap init "Shein Blank App" "com.appsheinblank.starter"
npx cap add android

# Crear build y sincronizar
npm run build
npx cap sync
```

## 📱 Tecnologías Utilizadas

### Frontend
- **React 18** - Framework de interfaz
- **Tailwind CSS** - Framework de estilos
- **Lucide React** - Iconos

### Backend/Database
- **Firebase Firestore** - Base de datos NoSQL
- **Firebase Authentication** - Autenticación
- **Firebase Hosting** - Hosting web

### Móvil
- **Capacitor** - Framework híbrido para generar APK

## 🔥 Configuración de Firebase

La aplicación está configurada para usar el proyecto Firebase:
- **Project ID**: `appsheinblank`
- **Auth Domain**: `appsheinblank.firebaseapp.com`

### Variables de Entorno

El archivo `public/index.html` incluye variables globales que se inyectan en tiempo de ejecución:

```javascript
// Variables inyectadas por el entorno de hosting
var __firebase_config = "..."; // Configuración de Firebase
var __initial_auth_token = "..."; // Token de autenticación inicial
var __app_id = "..."; // ID de la aplicación
```

## 📂 Estructura del Proyecto

```
src/
├── components/          # Componentes UI reutilizables
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Header.jsx
│   ├── Input.jsx
│   ├── Modal.jsx
│   └── Select.jsx
├── config/
│   └── firebase.js      # Configuración de Firebase
├── contexts/
│   └── AuthContext.jsx  # Contexto de autenticación
├── controllers/         # Lógica de negocio (Custom Hooks)
│   ├── useClientesController.js
│   ├── useFinanzasController.js
│   ├── useHomeController.js
│   ├── usePedidosController.js
│   └── useProductosController.js
├── models/              # Capa de datos
│   ├── clientesModel.js
│   ├── pedidosModel.js
│   ├── productosModel.js
│   └── transaccionesModel.js
├── utils/
│   └── formatters.js    # Funciones de utilidad
├── views/               # Páginas/Vistas
│   ├── App.jsx
│   ├── CatalogoPage.jsx
│   ├── ClientesPage.jsx
│   ├── FinanzasPage.jsx
│   ├── HomePage.jsx
│   ├── NotificacionesPage.jsx
│   ├── OrderShareView.jsx
│   └── PedidosPage.jsx
├── index.css
└── index.js             # Punto de entrada
```

## 🛠️ Comandos de Desarrollo

```bash
# Desarrollo
npm start                    # Ejecutar en modo desarrollo (http://localhost:3000)

# Producción
npm run build               # Crear build optimizado
npm run deploy              # Desplegar a Firebase Hosting

# Capacitor (Móvil)
npm run capacitor:sync      # Sincronizar cambios con plataformas móviles
npm run capacitor:open      # Abrir proyecto Android en Android Studio

# Testing
npm test                    # Ejecutar tests
```

## 📱 Generar APK

```bash
# 1. Crear build actualizado
npm run build

# 2. Sincronizar con Capacitor
npm run capacitor:sync

# 3. Abrir en Android Studio
npm run capacitor:open

# 4. En Android Studio:
#    - Build > Generate Signed Bundle/APK
#    - Seguir el asistente para generar APK firmado
```

## 🌐 Despliegue en Firebase

### Primera vez:
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar proyecto (solo la primera vez)
firebase init hosting
# Seleccionar: build/, Yes para SPA, No para GitHub

# Desplegar
npm run deploy
```

### Posteriores despliegues:
```bash
npm run deploy
```

## ✨ Características Principales

### Gestión de Pedidos
- ✅ Crear, editar y eliminar pedidos
- ✅ Seguimiento de estado (Pendiente, Enviado, Entregado, Cancelado)
- ✅ Gestión de productos por pedido
- ✅ Enlaces compartibles para clientes
- ✅ Sistema de pagos y saldos pendientes

### Gestión de Clientes
- ✅ Base de datos de clientes
- ✅ Envío automático de mensajes WhatsApp
- ✅ Búsqueda por número telefónico

### Catálogo de Productos
- ✅ Gestión de productos con fotos
- ✅ Precios sugeridos
- ✅ Compartir productos por WhatsApp

### Control Financiero
- ✅ Registro de ingresos y egresos
- ✅ Resumen financiero automático
- ✅ Seguimiento de pagos por pedido

### Dashboard
- ✅ Resumen de pedidos pendientes
- ✅ Entregas del día
- ✅ Ingresos semanales

## 🔧 Características Técnicas

### Patrones de Diseño
- **MVC (Model-View-Controller)** - Separación clara de responsabilidades
- **Observer Pattern** - Suscripciones en tiempo real con Firebase
- **Custom Hooks** - Reutilización de lógica de negocio

### Optimizaciones
- **Code Splitting** - Carga lazy de componentes
- **Firebase Realtime** - Actualizaciones en tiempo real
- **Responsive Design** - Compatible con móvil y desktop

### Seguridad
- **Firebase Auth** - Autenticación segura
- **Firestore Rules** - Reglas de base de datos
- **Token-based Sharing** - Enlaces seguros para clientes

## 🐛 Troubleshooting

### Error: Firebase not initialized
Asegúrate de que las variables globales estén definidas en `public/index.html`.

### Error: Module not found
Ejecuta `npm install` para instalar todas las dependencias.

### Error: Tailwind classes not working
Verifica que `tailwind.config.js` esté configurado correctamente y que se haya ejecutado el build.

### Error: Capacitor sync failed
Asegúrate de tener Android Studio instalado y configurado correctamente.

## 📄 Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados.

## 👥 Soporte

Para soporte técnico o preguntas sobre el proyecto, contacta al equipo de desarrollo.
