# Instrucciones para generar APK

## APK Debug (para pruebas)
La APK de debug ya está generada en: `android/app/build/outputs/apk/debug/app-debug.apk`

Para regenerar la APK de debug:
```bash
npm run android:build
```

## APK Release (para distribución)
Para generar una APK de release firmada:

1. **Crear keystore (solo la primera vez):**
```bash
cd android/app
keytool -genkey -v -keystore release-key.keystore -alias release-key -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configurar gradle.properties:**
Agregar estas líneas a `android/gradle.properties`:
```
RELEASE_STORE_FILE=release-key.keystore
RELEASE_KEY_ALIAS=release-key
RELEASE_STORE_PASSWORD=tu_password_aqui
RELEASE_KEY_PASSWORD=tu_password_aqui
```

3. **Generar APK de release:**
```bash
npm run android:release
```

## Ubicación de archivos generados:
- APK Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- APK Release: `android/app/build/outputs/apk/release/app-release.apk`

## Comandos útiles:
- `npm run android:clean` - Limpiar build cache
- `npm run android:build` - Generar APK debug
- `npm run android:release` - Generar APK release
- `npm run capacitor:sync` - Sincronizar cambios web con Android

## Información de la aplicación:
- **Nombre:** Shein Blank App
- **Package ID:** com.appsheinblank.starter
- **Versión:** 1.0 (código: 1)
- **Min SDK:** 22 (Android 5.1)
- **Target SDK:** 34 (Android 14)
