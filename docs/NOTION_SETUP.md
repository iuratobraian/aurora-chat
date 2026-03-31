# 🚀 Notion Setup & Troubleshooting

Este documento describe cómo configurar y solucionar problemas de conexión con Notion en diferentes PCs para el proyecto TradeShare.

## 📋 Requisitos Previos

1.  **NOTION_API_KEY**: Una clave de integración interna de Notion (comienza con `secret_`).
2.  **NOTION_DATABASE_ID**: El ID de la base de datos de Notion que contiene el Tablero de Tareas.

## 🛠️ Configuración Inicial (Cada PC)

1.  Copia el archivo `.env.example` a un nuevo archivo llamado `.env.local`:
    ```bash
    cp .env.example .env.local
    ```
2.  Abre `.env.local` y busca las variables de Notion:
    ```env
    NOTION_API_KEY=secret_tu_clave_aqui
    NOTION_DATABASE_ID=tu_id_de_base_de_datos_aqui
    ```
3.  Guarda el archivo. **NUNCA** subas `.env.local` al repositorio Git.

## 🔍 Solución de Problemas (Troubleshooting)

Si una PC no puede conectarse a Notion, sigue estos pasos:

### 1. Verificar el Estado de Conexión
Ejecuta el script de diagnóstico:
```bash
node scripts/aurora-notion-sync.mjs
```
El script te dirá exactamente qué falta (API Key o Database ID).

### 2. Error: "Unauthorized" or "Not Found"
*   **Causa:** La API Key es incorrecta o no tiene permisos sobre la base de datos.
*   **Solución:** Ve a la base de datos en Notion, haz clic en `...` (arriba a la derecha) -> `Connections` -> `Add Connections` -> Selecciona tu integración.

### 3. Error: "Connection Failed" o Timeouts
*   **Causa:** Firewall o proxy bloqueando la conexión a `api.notion.com`.
*   **Solución:** Asegúrate de que la PC tenga acceso a internet y que no haya reglas de red estrictas.

### 4. Error: "Notion API Key not configured"
*   **Causa:** El script no encuentra el archivo `.env.local`.
*   **Solución:** Asegúrate de que el archivo se llame exactamente `.env.local` y esté en la raíz del proyecto. El sistema ahora también busca en `.env`.

### 5. Sincronización Forzada
Si los cambios no aparecen, intenta ejecutar:
```bash
git pull origin main
node scripts/aurora-notion-sync.mjs
```

## 🧠 Flujo de Trabajo
Recuerda que Notion es la **Fuente de Verdad**. TASK_BOARD.md es solo un espejo. Siempre sincroniza antes de empezar a trabajar.
