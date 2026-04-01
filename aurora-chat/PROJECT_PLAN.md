# Aurora Chat - Proyecto Standalone

## Estado Actual (Actualizado: 2026-04-01)
- **Repo PNA:** https://github.com/iuratobraian/PNA
- **URL PNA:** https://app-pna.vercel.app/
- **Aurora Chat (Vercel):** https://aurora-chat-seven.vercel.app/
- **Convex URL:** https://optimistic-akita-410.convex.cloud
- **Convex Token:** optimistic-akita-410|eyJ2MiI6ImVkOTA0MDhmMjA5MDQxNmNhMWNhYjgzMjA3MzhlMzY1In0=

## Estructura de Carpetas
```
C:\Users\iurato\Desktop\PROYECTO ACTUAL\
├── aurora-chat/          ← App standalone (fuente) ✅ CREADA
│   ├── src/
│   │   ├── main.tsx      ← Entry point con ConvexProvider ✅
│   │   ├── App.tsx       ← Chat completo con Convex ✅
│   │   ├── api.ts        ← Convex api reference ✅
│   │   ├── types.ts      ← TypeScript interfaces ✅
│   │   └── index.css     ← Tailwind + custom styles ✅
│   ├── index.html        ← HTML shell ✅
│   ├── package.json      ← Dependencies ✅
│   ├── vite.config.ts    ← Vite config (base: /aurora/) ✅
│   ├── tsconfig.json     ← TypeScript config ✅
│   ├── dist/             ← Build output ✅
│   └── PROJECT_PLAN.md   ← Este archivo
│
C:\Users\iurato\Desktop\backup pc\COSAS BRAI\APP IA\PNA APP\APP PNA FUNCIONANDO\
├── public/aurora/        ← Build copiado (iframe) ✅
│   ├── index.html
│   └── assets/
│       ├── index-*.css
│       └── index-*.js
├── components/
│   ├── AuroraChatPopup.tsx  ← Popup minimizable con tabs Chat+OCR
│   └── NewSummaryModal.tsx  ← OCR, PDF, Word, Excel, texto
└── utils/ocr.ts          ← Tesseract.js OCR
```

## Lo que FUNCIONA en PNA
- ✅ OCR de imágenes (Tesseract.js) en modal nuevo sumario
- ✅ Parseo de PDF (pdfjs-dist) y Word (mammoth)
- ✅ Detección inteligente de etapas procesales
- ✅ Popup AuroraChat con tabs Chat + OCR
- ✅ Archivos aurora en public/aurora/ (iframe)
- ✅ Botón de chat en header del Layout
- ✅ Aurora Chat con código fuente completo
- ✅ Conexión a Convex (optimistic-akita-410.convex.cloud)
- ✅ Mensajes en tiempo real (useQuery)
- ✅ Envío de mensajes (useMutation)
- ✅ Indicador "escribiendo..."
- ✅ Adjuntar imágenes (base64)
- ✅ Emoji picker

## Tareas Pendientes
### Alta Prioridad
- [ ] **Mejorar diseño del input** - Implementar styled-components con el diseño proporcionado (botón + para imagen, input texto, botón enviar flecha)
- [ ] **Botón de entrada animado** - Gradiente rainbow border animado para abrir el chat
- [ ] **Card container** - bg-[#3d3c3d] con blur decorativo como contenedor principal
- [ ] **Mejorar visualización de imágenes** - Las imágenes subidas deben verse correctamente en los mensajes
- [ ] **Soporte para canales** - Agregar tabs de canales (global, comunidades)
- [ ] **Notificaciones** - Sonidos y badges de mensajes nuevos

### Media Prioridad
- [ ] **Autenticación** - Permitir que el usuario se identifique (nombre, avatar)
- [ ] **Paginación** - Cargar más mensajes al hacer scroll arriba
- [ ] **Pegar imágenes** - Soporte para Ctrl+V para pegar imágenes
- [ ] **Timestamps** - Mostrar fecha/hora en mensajes
- [ ] **Moderación** - Integrar moderación de mensajes del Convex original

### Baja Prioridad
- [ ] **PWA** - Agregar service worker y manifest
- [ ] **Modo offline** - Cachear mensajes localmente
- [ ] **Tema claro** - Toggle dark/light mode
- [ ] **Búsqueda** - Buscar mensajes en el chat

## Convex Schema (chat tables)
```typescript
chat: {
  userId, nombre, avatar, texto, imagenUrl?, isAi?, channelId?, createdAt
}
chatChannels: {
  name, slug, type, communityId?, participants?, createdBy?, createdAt
}
chatTyping: {
  channelId, userId, expiresAt, nombre
}
```

## Convex Functions (chat.ts en TradeShare)
- `getChannels` (query)
- `getMessages` (query, limit)
- `getMessagesByChannel` (query, paginated)
- `getLatestMessages` (query)
- `getTypingUsers` (query)
- `setTyping` (mutation)
- `sendMessage` (mutation) - con moderación, rate limit, spam detection
- `getOrCreateChannel` (mutation)

## Componentes de Diseño Proporcionados
### 1. Input de Mensaje (MessageInput)
- Botón "+" circular para adjuntar imagen
- Input de texto transparente
- Botón enviar con ícono de flecha/papel
- Tooltip "Add an image" en hover
- Fondo #2d2d2d con borde #3f3f3f

### 2. Botón de Entrada (CodepenButton)
- Gradiente animado rainbow: #4fcf70, #fad648, #a767e5, #12bcfe, #44ce7b
- Borde animado con translate
- Fondo negro interior
- Border radius 6px

### 3. Card Container
- bg-[#3d3c3d] con inset de 0.5px bg-[#323132]
- Blur decorativo: w-56 h-48 bg-white blur-[50px] posicionado -left-1/2 -top-1/2
- Drop shadow xl
- Rounded xl

## Dependencias instaladas en PNA
- tesseract.js (OCR)
- pdfjs-dist (PDF parsing)
- mammoth (Word parsing)
- xlsx (Excel parsing)

## Dependencias de Aurora Chat
- convex (base de datos real-time)
- react + react-dom
- lucide-react (iconos)
- date-fns (formato de fechas)
- zustand (estado local)
- tailwindcss v4 (estilos)

## Comandos
```bash
# En aurora-chat:
cd aurora-chat && npm install && npm run dev
npm run build  → copiar dist/ a PNA public/aurora/

# En PNA:
npm run dev
```

## Notas Importantes
- El chat usa Convex REAL (no localStorage)
- Las imágenes se envían como base64 (data URLs)
- El userId es hardcodeado a 'aurora-user' (pendiente autenticación)
- El channelId es hardcodeado a 'global' (pendiente canales)
- El build usa base: '/aurora/' para funcionar como iframe en PNA
