#!/bin/bash

# Script para generar APKs debug de Admin y Cliente
echo "📱 Generando APKs debug para Admin y Cliente..."

# Verificar que Capacitor esté instalado
if ! command -v npx &> /dev/null; then
    echo "❌ NPX no está instalado. Por favor instala Node.js"
    exit 1
fi

# Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
rm -rf build-admin build-cliente

# Función para generar APK
generate_apk() {
    local app_type=$1
    local package_name=$2
    local app_name=$3
    
    echo "📦 Generando APK para $app_name..."
    
    # 1. Build de la app
    echo "  🔨 Construyendo app $app_type..."
    REACT_APP_TYPE=$app_type npm run build
    if [ $? -ne 0 ]; then
        echo "  ❌ Error en build de $app_type"
        return 1
    fi
    
    # 2. Mover build a carpeta específica
    mv build build-$app_type
    
    # 3. Crear configuración específica de Capacitor
    echo "  ⚙️ Configurando Capacitor para $app_type..."
    cat > capacitor.config.json << EOF
{
  "appId": "$package_name",
  "appName": "$app_name",
  "webDir": "build-$app_type",
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "allowMixedContent": true
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#3B82F6",
      "showSpinner": false
    },
    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "alert"]
    }
  }
}
EOF
    
    # 4. Sync con Capacitor
    echo "  🔄 Sincronizando con Capacitor..."
    npx cap sync android
    if [ $? -ne 0 ]; then
        echo "  ❌ Error en sync de Capacitor"
        return 1
    fi
    
    # 5. Build APK
    echo "  🔨 Construyendo APK..."
    cd android
    ./gradlew assembleDebug
    if [ $? -eq 0 ]; then
        echo "  ✅ APK de $app_name generado exitosamente"
        
        # Copiar APK con nombre específico
        cp app/build/outputs/apk/debug/app-debug.apk "../app-$app_type-debug.apk"
        echo "  📱 APK copiado como: app-$app_type-debug.apk"
    else
        echo "  ❌ Error generando APK de $app_type"
        cd ..
        return 1
    fi
    cd ..
    
    return 0
}

# Generar APK Admin
echo "🔧 === GENERANDO APK ADMIN ==="
generate_apk "admin" "com.appsheinblank.admin" "SheinBlank Admin"

if [ $? -eq 0 ]; then
    echo ""
    echo "👤 === GENERANDO APK CLIENTE ==="
    generate_apk "cliente" "com.appsheinblank.cliente" "SheinBlank Cliente"
fi

# Restaurar configuración original
echo ""
echo "🔄 Restaurando configuración original..."
cat > capacitor.config.json << EOF
{
  "appId": "com.appsheinblank.starter",
  "appName": "Shein Blank App",
  "webDir": "build",
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "allowMixedContent": true
  }
}
EOF

echo ""
echo "📱 === RESUMEN ==="
if [ -f "app-admin-debug.apk" ]; then
    echo "✅ APK Admin: app-admin-debug.apk"
    ls -lh app-admin-debug.apk
fi

if [ -f "app-cliente-debug.apk" ]; then
    echo "✅ APK Cliente: app-cliente-debug.apk"
    ls -lh app-cliente-debug.apk
fi

echo ""
echo "🎉 ¡Proceso completado!"
echo ""
echo "📋 Para instalar las APKs:"
echo "   - Admin: adb install app-admin-debug.apk"
echo "   - Cliente: adb install app-cliente-debug.apk"
