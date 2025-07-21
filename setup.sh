#!/bin/bash

# Configuración inicial del proyecto Shein Blank App
echo "🚀 Configurando el proyecto Shein Blank App..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Instalar Tailwind CSS
echo "🎨 Configurando Tailwind CSS..."
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Configurar Capacitor
echo "📱 Configurando Capacitor..."
npm install @capacitor/core @capacitor/cli
npx cap init "Shein Blank App" "com.appsheinblank.starter"

# Añadir plataforma Android para Capacitor
echo "🤖 Añadiendo plataforma Android..."
npm install @capacitor/android
npx cap add android

# Crear build inicial
echo "🏗️ Creando build inicial..."
npm run build

# Sincronizar con Capacitor
echo "🔄 Sincronizando con Capacitor..."
npx cap sync

echo "✅ ¡Configuración completada!"
echo ""
echo "📋 Comandos útiles:"
echo "  npm start              - Ejecutar en modo desarrollo"
echo "  npm run build          - Crear build para producción"
echo "  npm run deploy         - Desplegar a Firebase Hosting"
echo "  npm run capacitor:sync - Sincronizar cambios con Capacitor"
echo "  npm run capacitor:open - Abrir proyecto Android en Android Studio"
echo ""
echo "🔧 Para configurar Firebase:"
echo "  1. Instala Firebase CLI: npm install -g firebase-tools"
echo "  2. Inicia sesión: firebase login"
echo "  3. Inicializa: firebase init hosting"
echo "  4. Despliega: npm run deploy"
