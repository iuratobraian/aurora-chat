# Guía para Generar APK de TradePortal Games

Esta guía detalla los pasos para convertir la sección de juegos en una aplicación nativa de Android (.apk) utilizando **Capacitor**.

## Requisitos Previos
1. **Android Studio** instalado y configurado.
2. **Java 17+** instalado.
3. Node.js y npm (ya instalados en el proyecto).

## Pasos para el Desarrollador

### 1. Preparar el Build Web
Antes de sincronizar con el móvil, genera el build de producción:
```bash
npm run build
```

### 2. Sincronizar con Capacitor
Actualiza los archivos de la app Android con los cambios de la web:
```bash
npx cap copy
npx cap sync
```

### 3. Abrir en Android Studio
Para generar el APK, abre el proyecto nativo:
```bash
npx cap open android
```

### 4. Generar el APK (Dentro de Android Studio)
1. Ve a **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
2. Android Studio compilará el proyecto.
3. Una vez terminado, aparecerá un aviso en la esquina inferior derecha con un link **"locate"** para ver el archivo `app-debug.apk`.

### 5. Distribución
Copia el archivo `.apk` generado a la carpeta `public/downloads/` del servidor para que el link de descarga en la web funcione:
`public/downloads/tradeportal-games.apk`

---

## Notas de Desarrollo Offline
- El juego **El Saboteador Invisible** utiliza `localStorage` para guardar el estado.
- No requiere conexión a internet una vez instalado.
- Los sonidos y assets están embebidos en el build para garantizar funcionamiento 100% offline.
