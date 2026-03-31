# APIS PENDIENTES DE INTEGRACIÓN

## Status: COMPLETO ✅

---

## 1. ElevenLabs (TTS - Text to Speech)

**Descripción:** Voz IA para videos de marketing
**Prioridad:** Alta
**Status:** ✅ Implementado y conectado a UI
**Archivos:**
- `lib/instagram/elevenlabs.ts` ✅
- `views/instagram/VoiceGenerator.tsx` ✅
- `server.ts` - endpoints ✅

**Voces disponibles:**
- Bella (ES female) - voiceId: EXAVITQu4vr4xnSDxMaL
- Diego (ES male) - voiceId: CYwZAkSkUdNQxY7cBexa
- Sarah (EN female) - voiceId: XrFsEohJpTF5HTKo93pm
- Charlie (EN male) - voiceId: pFZP5JQG7iQjIQuC4Bku
- Grace (EN female UK) - voiceId: FGY2WhTYpP7Gdsc4CGbj
- James (EN male UK) - voiceId: oWAxZDx7w5VtjUsAxdZ7

**Modelos:**
- `eleven_multilingual_v2` - Soporta 28 idiomas
- `eleven_turbo_v2` - Más rápido
- `eleven_v2` - Optimizado inglés

**Pendiente:**
- [x] Integrar en UI ✅
- [ ] Configurar `ELEVENLABS_API_KEY` en `.env.local`
- [ ] Probar generación de audio

---

## 2. Fish.Audio (TTS - Text to Speech)

**Descripción:** Alternativa a ElevenLabs, voces emocionales y expresivas
**Prioridad:** Media
**Status:** ✅ Implementado y conectado a UI
**Archivos:**
- `lib/instagram/fishaudio.ts` ✅
- `server.ts` - endpoints ✅

**Features:**
- Text-to-speech con velocidad ajustable
- Voice cloning (pendiente probar)
- Modelos disponibles

**Pendiente:**
- [x] Integrar en UI (selector de proveedor) ✅
- [ ] Configurar `FISH_AUDIO_API_KEY` en `.env.local`
- [ ] Probar voice cloning

---

## 3. Audio Enhancement (Local)

**Descripción:** Mejorar calidad de grabaciones de voz
**Status:** ✅ Implementado
**Archivos:**
- `views/instagram/AudioEnhancer.tsx` ✅

**Features:**
- Reducción de ruido de fondo
- Normalización de volumen
- Mejora de claridad de voz
- Ecualizador (bajos/medios/altos)
- Reducción de reverberación

---

## 4. Video Creation (Local)

**Descripción:** Crear videos combinando voz + imagen
**Status:** ✅ Implementado
**Archivos:**
- `views/instagram/VideoCreator.tsx` ✅

**Features:**
- Generar voz con IA
- Mejorar audio
- Subir imagen de fondo
- Crear preview de video
- Guardar proyectos
- Exportar a Cloudinary

---

## 5. Cloudinary Integration

**Descripción:** Almacenar audio y video en la nube
**Status:** ✅ Implementado
**Features:**
- Upload automático de audio generado
- Upload de video creado
- Preset: tradeshare_uploads
- Cloud: dpm4bnral

---

## UI - Instagram Dashboard

**Tabs agregados:**
- **Resumen** - Overview de la cuenta
- **Posts** - Publicaciones programadas
- **Voz IA** - Generador de voz (ElevenLabs + Fish.Audio)
- **Audio** - Mejorador de audio
- **Video** - Creador de videos
- **Mensajes** - Bandeja de entrada
- **Analytics** - Métricas
- **Config** - Configuración

---

## Próximos Pasos

### Configurar API Keys
```bash
# .env.local
ELEVENLABS_API_KEY=tu_api_key
FISH_AUDIO_API_KEY=tu_api_key
```

### Testing
1. Ir a Instagram Hub → Tab "Voz IA"
2. Escribir texto → Seleccionar proveedor → Generar
3. Ir a Tab "Audio" → Subir grabación → Mejorar
4. Ir a Tab "Video" → Crear video con voz + fondo

### Mejoras Futuras
- [ ] Integración con API de video (Runway, Pika, etc.)
- [ ] Subtítulos automáticos
- [ ] Transcripción de audio
- [ ] Multi-idioma translations
- [ ] Templates de video pre-hechos

---

*Creado: 2026-03-23*
*Última actualización: 2026-03-23*
