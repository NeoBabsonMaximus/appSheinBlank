#!/bin/bash

# Script de deployment para subdominios
# Este script configura y despliega las dos aplicaciones web separadas

echo "🚀 Iniciando deployment para subdominios..."

# Verificar que Firebase CLI esté instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI no está instalado. Por favor instálalo con: npm install -g firebase-tools"
    exit 1
fi

# Verificar que esté logueado en Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ No estás logueado en Firebase. Por favor ejecuta: firebase login"
    exit 1
fi

echo "📦 Construyendo aplicación de admin..."
REACT_APP_TYPE=admin npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error construyendo aplicación de admin"
    exit 1
fi

# Mover build de admin
mv build build-admin
echo "✅ Build de admin completado"

echo "📦 Construyendo aplicación de cliente..."
REACT_APP_TYPE=cliente npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error construyendo aplicación de cliente"
    exit 1
fi

# Mover build de cliente
mv build build-cliente
echo "✅ Build de cliente completado"

# Configurar targets de hosting en Firebase
echo "🔧 Configurando targets de Firebase Hosting..."

firebase target:apply hosting admin admin-appsheinblank
firebase target:apply hosting cliente cliente-appsheinblank

echo "🌐 Desplegando a Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡Deployment completado exitosamente!"
    echo ""
    echo "📱 Aplicaciones disponibles en:"
    echo "🔧 Admin: https://admin-appsheinblank.web.app"
    echo "👤 Cliente: https://cliente-appsheinblank.web.app"
    echo ""
    echo "💡 También disponibles en subdominios personalizados:"
    echo "🔧 Admin: https://admin.appsheinblank.web.app"
    echo "👤 Cliente: https://cliente.appsheinblank.web.app"
else
    echo "❌ Error durante el deployment"
    exit 1
fi
