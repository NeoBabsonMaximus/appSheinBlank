# 🚀 Deployment con Subdominios - Guía Completa

## 📋 Arquitectura de Deployment

### 🎯 Estrategia Elegida: Subdominios
- **Admin**: `admin.appsheinblank.web.app`
- **Cliente**: `cliente.appsheinblank.web.app`

### 🏗️ Estructura del Proyecto

```
appSheinBlank/
├── src/
│   ├── components/
│   │   └── AppRouter.jsx          # Router condicional
│   ├── views/
│   │   ├── App.jsx               # Punto de entrada principal
│   │   ├── AdminApp.jsx          # Aplicación de administración
│   │   └── ClienteApp.jsx        # Aplicación del cliente
│   └── config/
│       └── environment.js        # Configuración de entorno
├── build-admin/                  # Build para admin (generado)
├── build-cliente/               # Build para cliente (generado)
├── firebase.json               # Configuración de hosting
├── .firebaserc                # Targets de Firebase
└── deploy-subdominios.sh      # Script de deployment
```

## 🔧 Configuración

### 1. Variables de Entorno

El sistema detecta automáticamente el tipo de app usando `REACT_APP_TYPE`:

```bash
# Para desarrollo local
npm run start:admin      # Admin en localhost:3000
npm run start:cliente    # Cliente en localhost:3000

# Para build
npm run build:admin      # Genera build-admin/
npm run build:cliente    # Genera build-cliente/
npm run build:both       # Genera ambos builds
```

### 2. Environment.js

```javascript
APP_TYPE: process.env.REACT_APP_TYPE || 'admin'
IS_ADMIN_APP: (process.env.REACT_APP_TYPE || 'admin') === 'admin'
IS_CLIENT_APP: (process.env.REACT_APP_TYPE || 'admin') === 'cliente'
```

## 🚀 Proceso de Deployment

### Opción 1: Deployment Automático (Recomendado)

```bash
./deploy-subdominios.sh
```

### Opción 2: Deployment Manual

```bash
# 1. Build aplicación admin
REACT_APP_TYPE=admin npm run build
mv build build-admin

# 2. Build aplicación cliente  
REACT_APP_TYPE=cliente npm run build
mv build build-cliente

# 3. Configurar targets
firebase target:apply hosting admin admin-appsheinblank
firebase target:apply hosting cliente cliente-appsheinblank

# 4. Deploy
firebase deploy --only hosting
```

### Opción 3: Deployment Selectivo

```bash
# Solo admin
npm run deploy:admin

# Solo cliente
npm run deploy:cliente

# Ambos
npm run deploy
```

## 🌐 URLs de Acceso

### Producción
- **Admin**: https://admin-appsheinblank.web.app
- **Cliente**: https://cliente-appsheinblank.web.app

### Con Dominio Personalizado (Futuro)
- **Admin**: https://admin.appsheinblank.com
- **Cliente**: https://cliente.appsheinblank.com

## 📱 Diferencias entre Apps

### Admin App (`AdminApp.jsx`)
- Panel completo de administración
- Gestión de pedidos, productos, clientes
- Sistema de mensajería bidireccional
- Dashboard financiero
- Notificaciones y alertas

### Cliente App (`ClienteApp.jsx`)
- Interfaz simplificada para clientes
- Login con número de teléfono
- Dashboard de pedidos personales
- Sistema de mensajería con admin
- Vista de productos disponibles

## 🔄 Sistema de Routing

### AppRouter.jsx
```javascript
if (ENV_CONFIG.IS_CLIENT_APP) {
  return <ClienteApp />;
}
return <AdminApp />; // Default
```

## 🛠️ Configuración Firebase

### firebase.json
```json
{
  "hosting": [
    {
      "target": "admin",
      "public": "build-admin"
    },
    {
      "target": "cliente", 
      "public": "build-cliente"
    }
  ]
}
```

### .firebaserc
```json
{
  "targets": {
    "appsheinblank": {
      "hosting": {
        "admin": ["admin-appsheinblank"],
        "cliente": ["cliente-appsheinblank"]
      }
    }
  }
}
```

## 🔍 Validación de Deployment

### 1. Verificar Builds
```bash
ls -la build-admin/    # Debe existir
ls -la build-cliente/  # Debe existir
```

### 2. Verificar Variables
```bash
# En cada build, verificar en console:
ENV_CONFIG.APP_TYPE    # 'admin' o 'cliente'
ENV_CONFIG.IS_ADMIN_APP
ENV_CONFIG.IS_CLIENT_APP
```

### 3. Probar URLs
- Navegar a ambas URLs
- Verificar que muestren interfaces diferentes
- Comprobar funcionalidad completa

## 📋 Scripts Disponibles

```json
{
  "start:admin": "REACT_APP_TYPE=admin react-scripts start",
  "start:cliente": "REACT_APP_TYPE=cliente react-scripts start", 
  "build:admin": "REACT_APP_TYPE=admin react-scripts build && mv build build-admin",
  "build:cliente": "REACT_APP_TYPE=cliente react-scripts build && mv build build-cliente",
  "build:both": "npm run build:admin && npm run build:cliente",
  "deploy": "npm run build:both && firebase deploy",
  "deploy:admin": "npm run build:admin && firebase deploy --only hosting:admin",
  "deploy:cliente": "npm run build:cliente && firebase deploy --only hosting:cliente"
}
```

## 🎯 Ventajas de esta Estrategia

### ✅ Pros
- **Separación Clara**: Admin y cliente completamente separados
- **URLs Profesionales**: Subdominios específicos
- **Escalabilidad**: Fácil mantener y actualizar por separado
- **Performance**: Cada app solo carga lo necesario
- **SEO**: Mejor indexación para cada tipo de contenido

### ⚠️ Consideraciones
- Builds separados aumentan tiempo de deployment
- Configuración inicial más compleja
- Necesita gestión de dos sitios en Firebase

## 🔄 Mantenimiento

### Actualizaciones
1. Desarrollar cambios localmente
2. Probar con `npm run start:admin` y `npm run start:cliente`
3. Hacer commit de cambios
4. Ejecutar `./deploy-subdominios.sh`

### Monitoreo
- Firebase Console para métricas de cada sitio
- Logs separados por aplicación
- Analytics individuales

## 🆘 Troubleshooting

### Error: Build no encontrado
```bash
rm -rf build-admin build-cliente
npm run build:both
```

### Error: Firebase targets
```bash
firebase target:clear hosting admin
firebase target:clear hosting cliente
firebase target:apply hosting admin admin-appsheinblank
firebase target:apply hosting cliente cliente-appsheinblank
```

### Error: Permisos
```bash
chmod +x deploy-subdominios.sh
```
