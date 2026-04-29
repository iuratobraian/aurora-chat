# ✦ GEMMA CODE STUDIO v1.0.0

> **Codificador Profesional de Nivel Senior** integrado con Aurora AI

Transforma el modelo Gemma 4 (31b) en un **ingeniero de software elite** con herramientas profesionales de análisis, generación, refactorización y verificación de código.

---

## 🚀 Inicio Rápido

```bash
# Windows
gemma.cmd

# Linux/Mac
chmod +x gemma.sh
./gemma.sh

# Modo interactivo
gemma chat

# Generar componente
gemma generate "auth form component" --type react

# Refactorizar
gemma refactor src/utils.ts --focus "mejorar manejo de errores"

# Revisar código
gemma review src/components/

# Generar tests
gemma test src/services/auth.ts

# Analizar
gemma analyze src/ --metrics
```

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Comandos](#-comandos)
- [Perfiles de Coder](#-perfiles-de-coder)
- [Tipos de Generación](#-tipos-de-generación)
- [Pipeline de Verificación](#-pipeline-de-verificación)
- [Integración con Aurora](#-integración-con-aurora)
- [Configuración](#-configuración)
- [Ejemplos](#-ejemplos)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Características

### 🧠 Motor de IA Profesional
- **Gemma 4 (31b)** como modelo principal
- **Fallback automático** a través de Aurora FreeProviderRouter
- **Contexto del proyecto** inyectado automáticamente
- **Plantillas especializadas** para cada tipo de código
- **Perfiles de coder** adaptados por especialidad

### 🛠️ Herramientas de Código
| Herramienta | Descripción |
|------------|-------------|
| `ast-analyzer` | Análisis AST de estructura y complejidad |
| `code-linter` | Integración con ESLint |
| `test-generator` | Generación automática de tests con Vitest |
| `import-resolver` | Resolución de dependencias |
| `pattern-detector` | Detección de anti-patrones |
| `complexity-checker` | Métricas de complejidad ciclomática |

### ✅ Pipeline de Verificación
- **Lint** → ESLint check (0 errores)
- **Type Check** → TypeScript validation (tsc --noEmit)
- **Tests** → Ejecución automática de tests generados
- **Auto-Correction** → Reintento con feedback de errores

### 📊 Sistema de Review
- **Análisis estático** de calidad
- **Score A-F** basado en métricas objetivas
- **Detección de code smells** con severidad
- **Sugerencias de mejora** con ejemplos

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│  CAPA 1: CLI Profesional                                 │
│  gemma generate | refactor | review | test | analyze    │
├─────────────────────────────────────────────────────────┤
│  CAPA 2: Core Engines                                    │
│  gemma-coder.mjs    → Generación de código              │
│  gemma-refactor.mjs → Refactorización                   │
│  gemma-review.mjs   → Revisión de calidad               │
│  gemma-verify.mjs   → Pipeline de verificación          │
├─────────────────────────────────────────────────────────┤
│  CAPA 3: Herramientas                                    │
│  ast-analyzer | code-linter | test-generator            │
│  import-resolver | pattern-detector | complexity-checker │
├─────────────────────────────────────────────────────────┤
│  CAPA 4: Contexto del Proyecto                           │
│  project-scanner | codebase-index | dependency-map       │
├─────────────────────────────────────────────────────────┤
│  CAPA 5: Plantillas y Perfiles                           │
│  Templates: React, Convex, API, Tests, TypeScript        │
│  Profiles: backend, frontend, test, refactor, fullstack  │
└─────────────────────────────────────────────────────────┘
```

---

## 💻 Comandos

### `gemma chat`
Inicia sesión interactiva de codificación.

```bash
gemma chat                              # Perfil por defecto (fullstack-senior)
gemma chat --profile backend-expert     # Perfil específico
gemma chat --verbose                    # Modo detallado
```

### `gemma generate <descripción>`
Genera código nuevo con IA.

```bash
gemma generate "authentication form" --type react
gemma generate "user query" --type convex
gemma generate "webhook handler" --type api
gemma generate "utility functions" --type util
gemma generate "custom hook" --type hook
gemma generate --dry-run                # Solo mostrar, no guardar
gemma generate --output src/my-file.ts  # Ruta específica
```

### `gemma refactor <ruta>`
Refactoriza código existente.

```bash
gemma refactor src/utils.ts
gemma refactor src/components/auth.tsx --focus "extraer lógica reutilizable"
gemma refactor src/services/ --profile refactor-master
gemma refactor --dry-run                # Mostrar cambios sin aplicar
```

### `gemma review <ruta>`
Revisa calidad del código.

```bash
gemma review src/main.ts
gemma review src/components/            # Directorio completo
gemma review src/ --metrics             # Con métricas detalladas
```

### `gemma test <ruta>`
Genera tests automáticamente.

```bash
gemma test src/utils/calculator.ts
gemma test src/services/auth.ts --coverage
gemma test src/ --auto-fix              # Auto-corregir errores
```

### `gemma analyze <ruta>`
Análisis estático de código.

```bash
gemma analyze src/main.ts
gemma analyze src/ --metrics
gemma analyze src/ --report             # Reporte completo
```

### `gemma profiles`
Lista perfiles de coder disponibles.

### `gemma types`
Lista tipos de generación disponibles.

---

## 👤 Perfiles de Coder

| Perfil | Emoji | Especialidad | Temperatura |
|--------|-------|--------------|-------------|
| `backend-expert` | 🔧 | Convex, APIs, DB, seguridad | 0.1 |
| `frontend-expert` | 🎨 | React, TSX, UI, accesibilidad | 0.2 |
| `test-engineer` | 🧪 | Tests unitarios, E2E, coverage | 0.1 |
| `refactor-master` | ♻️ | Optimización, clean code | 0.1 |
| `fullstack-senior` | 💎 | Features end-to-end | 0.15 |

---

## 📦 Tipos de Generación

| Tipo | Descripción | Extensión |
|------|-------------|-----------|
| `react` | Componente React con TypeScript | `.tsx` |
| `convex` | Función Convex (query/mutation) | `.ts` |
| `api` | Ruta API RESTful | `.ts` |
| `test` | Suite de tests con Vitest | `.test.ts` |
| `type` | Tipos e interfaces TypeScript | `.ts` |
| `hook` | Custom Hook de React | `.ts` |
| `service` | Servicio/módulo de lógica | `.ts` |
| `util` | Función utilitaria | `.ts` |

---

## ✅ Pipeline de Verificación

Cuando generas o modificas código, Gemma ejecuta automáticamente:

```
1. ESLint Check
   ↓ (si falla)
   → Auto-corrección con feedback
   
2. TypeScript Type Check
   ↓ (si falla)
   → Auto-corrección con feedback
   
3. Test Execution (si generó tests)
   ↓ (si falla)
   → Re-generación con corrección
   
4. Build Check (si aplica)
   ↓
   ✓ Código verificado y listo para producción
```

---

## 🔌 Integración con Aurora

Gemma Code Studio usa la infraestructura existente de Aurora:

- **FreeProviderRouter**: Routing automático entre 9+ proveedores
- **PermissionSystem**: Control de acceso para operaciones de escritura
- **MCP Servers**: 10+ MCPs instalados para contexto adicional
- **Agent Coordinator**: Se registra como `gemma_coder` en el coordinador

### Variables de Entorno Necesarias

```bash
# Al menos una de estas debe estar configurada:
GEMINI_API_KEY=aiza...           # Google Gemini API
OPENROUTER_API_KEY=sk-or-v1...   # OpenRouter API

# Opcionales (para fallback automático):
GROQ_API_KEY=gsk_...
NVIDIA_API_KEY=nvapi-...
DEEPSEEK_API_KEY=sk-...
```

---

## ⚙️ Configuración

### Instalar dependencias

```bash
cd gemma
npm install
```

### Estructura del proyecto

```
gemma/
├── package.json
├── profiles/
│   ├── backend-expert.md
│   ├── frontend-expert.md
│   ├── test-engineer.md
│   ├── refactor-master.md
│   └── fullstack-senior.md
├── src/
│   ├── cli/
│   │   └── gemma-cli.mjs          # CLI principal
│   ├── core/
│   │   ├── gemma-coder.mjs        # Motor de generación
│   │   ├── gemma-refactor.mjs     # Motor de refactorización
│   │   ├── gemma-review.mjs       # Motor de revisión
│   │   └── gemma-verify.mjs       # Pipeline de verificación
│   ├── tools/
│   │   └── ast-analyzer.mjs       # Análisis AST
│   └── templates/
│       ├── react-component.mjs
│       ├── convex-function.mjs
│       ├── api-route.mjs
│       ├── test-suite.mjs
│       └── typescript-type.mjs
└── README.md
```

---

## 📚 Ejemplos

### Generar componente React

```bash
$ gemma generate "user profile card with avatar and bio" --type react

✓ Código generado exitosamente

  Archivo: src/components/user-profile-card.tsx
  Líneas: 87
  Tiempo: 4231ms
```

### Refactorizar con enfoque

```bash
$ gemma refactor src/auth.ts --focus "mejorar manejo de errores y validación"

✓ Código refactorizado exitosamente

  Archivo: src/auth.ts
  Cambios: 23
  Tiempo: 5102ms
```

### Revisar calidad

```bash
$ gemma review src/services/

✓ Revisión completada - Calificación: B

## 🔍 Revisión de Código

### ✅ Puntos Fuertes
- Buen manejo de errores en servicios externos
- Tipado estricto consistente

### ⚠️ Problemas Encontrados
- [WARNING] Funciones muy largas (+40 líneas)
- [INFO] Faltan tests para edge cases

### 💡 Sugerencias de Mejora
- Extraer lógica de validación en funciones separadas
- Agregar tests para inputs inválidos
```

### Generar tests

```bash
$ gemma test src/utils/calculator.ts --coverage

✓ Tests generados exitosamente

  Archivo de tests: src/utils/calculator.test.ts
  Tests creados: 12
  Tiempo: 3845ms
```

---

## 🔧 Troubleshooting

### Error: API key no configurada

```bash
# Configurar al menos una API key
export GEMINI_API_KEY=aiza...
# o
export OPENROUTER_API_KEY=sk-or-v1...
```

### Error: Módulo no encontrado

```bash
cd gemma
npm install
```

### Error: Puerto o conexión

Verifica que las variables de Aurora estén configuradas:

```bash
cat .env.aurora | grep API_KEY
```

### Código generado no pasa lint

Ejecuta con auto-corrección:

```bash
gemma generate "..." --verbose
# O refactoriza el resultado
gemma refactor src/generated-file.ts --focus "fix lint errors"
```

---

## 📄 Licencia

MIT - TradeShare + Aurora AI

---

## 🤝 Contribuir

1. Revisa `TASK_BOARD.md` para tareas pendientes
2. Elige una tarea y marca como `claimed`
3. Implementa y verifica con `npm run lint && npm test`
4. Actualiza `AGENT_LOG.md`
5. Marca como `done`

---

**✦ GEMMA CODE STUDIO** - *Codificación profesional de nivel senior*
