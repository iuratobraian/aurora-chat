# Plan Detail: El Saboteador Invisible

## Concepto
Un juego social de deducción y sabotaje para reuniones, optimizado para un solo dispositivo (offline-first) con expansión a multi-celular local y online.

## Identidad Visual (Obsidian Ether x Cyber Neon)
- **Fondo**: Deep Obsidian (#0a0a0b).
- **Acentos**: Neon Red (#ff003c) para saboteadores, Neon Green (#00ff94) para normales.
- **Tipografía**: Orbitron o Roboto Black para títulos, Inter para UI de juego.
- **Micro-animaciones**: Glitch effects sutiles en pantallas de error/sabotaje.

## Arquitectura de la Aplicación

### Fases de Desarrollo
1.  **Fase 1: Motor Offline (Single Device)**
    - Configuración de jugadores.
    - Reparto aleatorio de roles (N jugadores, ceil(N/4) saboteadores).
    - Loop de misiones -> Votación -> Resultados.
2.  **Fase 2: Multi-Celular Local (Local Relay)**
    - Uso de un servidor local o QR para sincronizar estados.
3.  **Fase 3: Online (Convex Cloud)**
    - Lobby con códigos de sala.
    - Sockets en tiempo real para votaciones.

## Flujo de Pantallas (Detalle Lógico)

### 1. Inicio & Pre-juego
- **Pantalla de Inicio**: Logo pulsante neón, botones de entrada rápida.
- **Selector de Jugadores**: Input numérico 5-10.
- **Carga de Nombres**: (Opcional) Registro rápido de nombres para personalización.

### 2. El Reparto (The Reveal)
- **Asignación**: Pantalla de "cortina" negra. Solo se revela al tocar y mantener presionado para evitar espías.
- **Roles Especiales**: Toggle para activar Detective, Doble Agente, etc.

### 3. Loop de Juego (The Mission)
- **Misión Aleatoria**: Pool de ~50 misiones (Elegir, Memorizar, Decidir).
- **Votación Secreta**: El dispositivo pasa de mano en mano. Se bloquea la pantalla entre turnos.
- **Resolución**: Algoritmo: `if (votosSaboteo > 0) return FAILURE; else return SUCCESS;`

### 4. La Discusión & El Exilio
- **Timer de 60s**: Alertas visuales cuando quedan 10s.
- **Votación de Sospechoso**: Interfaz de tarjetas de jugador. Animación de "eliminación" al confirmar.

## Lista Inicial de Misiones (Pool)
- "Secuencia de Colores": Memorizar y repetir.
- "Dilema del Prisionero": Decidir entre todos una opción A o B.
- "El Intruso": Seleccionar la palabra que no encaja.

## Next Steps:
- [ ] Crear Mockups en CSS puro para la Pantalla de Inicio y Reveal.
- [ ] Implementar el State Manager para el loop de turnos offline.

---

## Especificaciones Técnicas

### Modelo de Datos (TypeScript)

```typescript
type Role = 'normal' | 'saboteur' | 'detective' | 'double_agent';

type GamePhase = 
  | 'setup'           // Configuración inicial
  | 'reveal'          // Revelación de roles
  | 'mission_active'  // Misión en curso
  | 'vote'            // Votación
  | 'discussion'      // Discusión
  | 'exile'           // Eliminación
  | 'game_over';      // Fin del juego

type MissionResult = 'success' | 'failure';

interface Player {
  id: string;
  name: string;
  role: Role;
  isAlive: boolean;
  hasVoted: boolean;
  voteTarget?: string;
}

interface Mission {
  id: number;
  type: 'sequence' | 'dilemma' | 'intruder' | 'decrypt' | 'choose';
  data: Record<string, unknown>;
  result?: MissionResult;
  sabotageVotes: number;
}

interface GameState {
  phase: GamePhase;
  players: Player[];
  missions: Mission[];
  currentMissionIndex: number;
  currentRound: number;
  missionHistory: { round: number; result: MissionResult }[];
  exiledPlayerIds: string[];
  winner?: 'saboteurs' | 'normals';
  revealedThisRound: string[]; // IDs de jugadores que saben quién es saboteador
}
```

### Algoritmos Core

**Asignación de roles:**
```typescript
function assignRoles(playerCount: number): Role[] {
  const saboteurCount = Math.ceil(playerCount / 4); // 1 saboteador por cada 4 jugadores
  const roles: Role[] = Array(saboteurCount).fill('saboteur');
  
  if (playerCount >= 7) roles.push('detective');
  if (playerCount >= 8) roles.push('double_agent');
  
  const normalsNeeded = playerCount - roles.length;
  roles.push(...Array(normalsNeeded).fill('normal'));
  
  return shuffle(roles);
}
```

**Resolución de misión:**
```typescript
function resolveMission(mission: Mission, saboteurVoting: boolean): MissionResult {
  // Saboteadores activos votan sabotaje
  // Si >= 1 vota sabotaje, la misión falla
  if (mission.sabotageVotes > 0) return 'failure';
  return 'success';
}
```

**Condiciones de victoria:**
- **Normales**: Lograr 3 misiones exitosas O expulsar a todos los Saboteadores.
- **Saboteadores**: Lograr 3 misiones fallidas O que el número de saboteadores vivos sea igual al de normales vivos.
- **Roles Especiales**:
  - **Detective**: Al final de una ronda, puede ver cuántos saboteadores votaron (no quiénes, sino el conteo exacto).
  - **Doble Agente**: Vota como normal, pero cuenta como Saboteador para las condiciones de victoria física (conteo de vivos). Su objetivo es llegar al empate sin ser expulsado.
  - **Protector**: Una vez por partida, si se elige "Sabotear", el Protector puede anular un voto de sabotaje si está en la misión.

**Sistema de Votación (Misión & Expulsión):**
- **Empate en Expulsión**: Nadie es expulsado en esa ronda, pero el Saboteador gana "puntos de sospecha" que otorgan una pista extra al Detective en la siguiente ronda.
- **Voto en Blanco**: Permitido. Si la mayoría vota en blanco, la ronda se salta sin resultado, pero avanza el contador de rondas (máximo 7 rondas totales).

### Fase 2: Spec Multi-Celular (Local Sync)
- **Tecnología**: WebRTC (P2P) para latencia cero o un Relay Server efímero sobre Node.js.
- **QR Handshake**: El Host genera un QR con un SessionID y un par de llaves públicas. Los invitados escanean para unirse al "Lobby Local".
- **Sync**: Cada vez que el Host cambia de fase, emite un `BROADCAST_PHASE_CHANGE`.

### Fase 3: Spec Online (Convex)
- **Lobby Persistence**: Uso de `convex/schema.ts` para persistir `rooms`.
- **Reconnect Logic**: Cada jugador tiene un `browserId` único en `localStorage`. Si se desconecta, al recargar el `/lobby/[code]` recupera su estado de `Player` y `Role` desde Convex.
- **Heartbeat**: 5s para detectar desconexiones y pausar el timer de discusión.

### Persistencia Offline (Local Storage)
- **Auto-Save**: Cada cambio de estado se guarda en la key `SABOTEADOR_GAME_STATE`.
- **Resume Button**: Al abrir la app, si existe un estado `mission_active`, aparece un botón "Continuar Partida".

### Pool de Misiones (Ampliación)

**Elegir (10 nuevas):**
- "Puerta Izquierda o Derecha"
- "Cara o Cruz"
- "El Precio Justo"
- etc

**Memorizar (10 nuevas):**
- "Código Morse"
- "Quién no está"
- "El Intruso Visual"
- etc

**Decidir (10 nuevas):**
- "Reparto del Tesoro"
- "El Sacrificado"
- "Voto del Silencio"
- etc

### Stack Técnico
- **Framework**: React + Vite
- **Estado**: React Context + useReducer
- **Estilos**: CSS puro con variables CSS (Neon theme)
- **Storage**: localStorage para persistencia de partida
- **Deploy**: Vercel (mismo pattern que TradePortal)

### Componentes UI
1. `App.tsx` - Router y Provider global
2. `GameProvider.tsx` - Contexto de estado del juego
3. `StartScreen.tsx` - Logo + botones entrada
4. `PlayerSetup.tsx` - Selector de jugadores
5. `NameInput.tsx` - Carga de nombres
6. `RevealScreen.tsx` - Pantalla de cortina
7. `MissionScreen.tsx` - Misión activa
8. `VoteScreen.tsx` - Votación
9. `DiscussionScreen.tsx` - Timer + chat
10. `ExileScreen.tsx` - Votación de eliminación
11. `GameOverScreen.tsx` - Resultado final

### Pool de Misiones (50 total)

**Elegir (15):**
- "Afore o Casino" - Elige tu destino
- "Verde o Rojo" - pick a color
- "1-100" - adivina el número del grupo
- etc.

**Memorizar (15):**
- "Secuencia de Colores" - repetir patrón
- "Código Secreto" - memorizar 4 dígitos
- "Cara Oculta" - recordar quién eligió qué
- etc.

**Decidir (20):**
- "Dilema del Prisionero" - cooperar o traicionar
- "El Treshold" - mayoría silenciosa
- "Bono o Castigo" - bien común vs personal
- etc.

---

## Especificaciones Refinadas (SAB-000)

### 1. Selección de Equipo para Misión

Cada ronda tiene un **líder rotativo** que propone el equipo. El primer líder es el jugador 1 y rota en sentido horario.

**Flujo de selección:**
```
1. Líder propone equipo (1 a N jugadores, según ronda)
2. Votación: todos votan SÍ o NO al equipo propuesto
3. Si mayoría SÍ (>50%): equipo seleccionado → pasar a misión
4. Si mayoría NO: líder pasa al siguiente jugador → repetir
5. Si todos son líderes y ninguno logra equipo: misión FALLA por inacción
```

**Tamaño del equipo por ronda:**
| Ronda | Jugadores 5-6 | Jugadores 7-8 | Jugadores 9-10 |
|-------|:---:|:---:|:---:|
| 1 | 2 | 2 | 3 |
| 2 | 3 | 3 | 4 |
| 3 | 2 | 4 | 4 |
| 4 | 3 | 4 | 5 |
| 5 | 3 | 5 | 5 |

> Si en la votación de equipo la mayoría vota **en blanco** 3 veces seguidas, la misión falla por parálisis.

---

### 2. Sistema de Votación de Misión

Dentro del equipo, cada jugador vota **secretamente**:

- **ÉXITO** ✅ — Vota que la misión sale bien (todos los normales + Doble Agente votan esto)
- **SABOTAJE** 💥 — Solo los Saboteadores y Doble Agente pueden votar esto. Votar sabotaje como normal es **imposible** (el botón no aparece).

**Resolución:**
```
if (votosSabotaje >= 1) {
  if (hayProtectorActivoEnEquipo) {
    if (protectorAnula) return 'BLOCKED';
  }
  return 'FAILURE';
}
return 'SUCCESS';
```

---

### 3. Protector — Mecánica Completa

El Protector aparece con **≥9 jugadores** (no en 5-8).

**Mecánica:**
- 1 uso por partida, en cualquier ronda
- Se activa **automáticamente** cuando un Saboteador vota sabotaje Y el Protector está en la misión
- El juego muestra pantalla: "¡El Protector detectó el sabotaje y lo neutralizó!"
- El sabotaje se convierte en SUCCESS
- El Protector **no se revela** al equipo

**Si hay 2 protectores y 2 saboteadores en misión:**
- Cada Saboteador vota sabotaje
- Cada Protector puede anular 1 voto
- Si hay igual Protectores que Saboteadores → se anulan todos → SUCCESS
- Si hay más Saboteadores que Protectores → FAILURE

**Código:**
```typescript
interface Protector {
  id: string;
  usesLeft: 1;
  activatedThisRound: boolean;
}

function resolveWithProtector(sabotageVotes: number, protectorInTeam: boolean): MissionResult {
  if (sabotageVotes > 0 && protectorInTeam) {
    return 'BLOCKED'; // Protector anula el sabotaje
  }
  return sabotageVotes > 0 ? 'FAILURE' : 'SUCCESS';
}
```

---

### 4. Detective — Mecánica Completa

Aparece con **≥7 jugadores**.

**Mecánica:**
- Al **final de cada ronda de misión** (después de resolver), el Detective puede activar su poder
- El juego pregunta: "¿Quieres usar tu intuición?"
- Si activa: se revela **cuántos Saboteadores exactamente**参加了 esa misión
  - "En esta misión hubo 1 Saboteador" o "No había ningún Saboteador"
- Si no activa: puede guardar la pregunta para la siguiente misión
- **Solo puede hacer 1 pregunta por partida** (no una por ronda)

```typescript
function detectiveReveal(missionPlayers: Player[]): number {
  return missionPlayers.filter(p => p.role === 'saboteur').length;
}
```

---

### 5. Doble Agente — Mecánica Completa

Aparece con **≥8 jugadores**.

**Mecánica:**
- Vota ÉXITO siempre (nadie sabe que es Doble Agente)
- Para las **condiciones de victoria física** cuenta como Saboteador
- Su objetivo secreto: que haya igual cantidad de Saboteadores+vivos que Normales+vivos al final
- Gana si: se llega al empate Y el Doble Agente no es expulsado
- Pierde si: los Normales ganan (3 exitosas o todos expulsados) O es expulsado

---

### 6. Empate en Votación de Expulsión

Si hay empate en votos (2+ jugadores con mismo conteo máximo):
- Ningún jugador es expulsado esa ronda
- El Saboteador que no votó gana +1 punto de sospecha (visible para Detective)
- La ronda avanza normalmente

**Código:**
```typescript
function resolveExile(votes: Record<string, number>): string | null {
  const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  const topCount = sorted[0][1];
  const tied = sorted.filter(([, count]) => count === topCount);
  
  if (tied.length > 1) {
    return null; // Empate: nadie sale
  }
  return tied[0][0]; // ID del expulsado
}
```

---

### 7. Accesibilidad — Colorblindness

Se añade sistema de **iconos + patrones** como backup visual:

| Rol | Color | Icono | Patrón de fondo |
|-----|-------|-------|-----------------|
| Normal | Verde #00ff94 | ☘️ | Líneas horizontales |
| Saboteador | Rojo #ff003c | 💀 | Diagonales |
| Detective | Azul #2563eb | 🔍 | Puntos |
| Doble Agente | Amarillo #ffd700 | 🃏 | Zigzag |
| Protector | Cian #00d4ff | 🛡️ | Hexágonos |

**Implementación UI:**
- Nunca depender solo de color — **siempre icono + texto + patrón**
- Las tarjetas de jugador muestran: nombre + icono + iniciales + color
- Para daltonismo total (acromatopsia), el texto es obligatorio y nunca se oculta

---

### 8. Timer de Misión

Cada misión tiene un timer de **60 segundos** (configurable en settings).

**Comportamiento:**
- Timer empieza cuando el equipo ve la misión
- Si el timer llega a 0 → se asume que el equipo **falló en completar** la misión (votos de éxito cuentan, pero si hay inacción → FAILURE)
- Si el timer llega a 10s → alerta visual (glitch sutil)
- Si el timer llega a 5s → vibración del dispositivo

**Configuración (en settings):**
| Dificultad | Timer Misión | Timer Discusión |
|-----------|:---:|:---:|
| Fácil | 90s | 90s |
| Normal | 60s | 60s |
| Difícil | 30s | 30s |

---

### 9. Hold-to-Reveal — Spec de Interacción

**Pantalla de cortina:**
- Fondo negro sólido con textura sutil (ruido estático)
- Texto centrado: "¿Listo para ver tu rol?"
- Botón circular grande con ícono de ojo cerrado
- Mantener presionado: barra de progreso fill desde el borde
- **Duración del hold**: 2.5 segundos
- Si se suelta antes → la barra retrocede, nada pasa
- Si se completa → transición de glitch: la cortina se "rompe" y aparece el rol

**Feedback:**
- Los primeros 0.5s: vibración suave de confirmación
- Del 0.5s al 2.0s: sonido de "tensión" que sube de volumen
- Al 2.5s: vibración corta + flash de revelación

---

### 10. Fase 2 — Host Desconectado

Si el host cierra la app durante Fase 2 (multi-celular):
- Cualquier jugador puede convertirse en **Nuevo Host** con un botón
- El Nuevo Host recibe el estado actual serializado y puede continuar
- Si no hay consenso: se ofrece "Guardar y Salir" que persiste el estado para resuming

---

### 11. Asignación de Roles — Algoritmo Final

```typescript
function assignRoles(playerCount: number): Role[] {
  const roles: Role[] = [];

  // Saboteadores: ceil(N/4)
  const saboteurCount = Math.ceil(playerCount / 4);
  roles.push(...Array(saboteurCount).fill('saboteur'));

  // Roles especiales según cantidad
  if (playerCount >= 9) roles.push('protector');
  if (playerCount >= 8) roles.push('double_agent');
  if (playerCount >= 7) roles.push('detective');

  // Normales: lo que queda
  const normalsNeeded = playerCount - roles.length;
  roles.push(...Array(normalsNeeded).fill('normal'));

  return shuffle(roles);
}
```

**Resumen por cantidad de jugadores:**

| Jugadores | Saboteadores | Detective | Doble Agente | Protector | Normales |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 5 | 2 | — | — | — | 3 |
| 6 | 2 | — | — | — | 4 |
| 7 | 2 | 1 | — | — | 4 |
| 8 | 2 | 1 | 1 | — | 4 |
| 9 | 3 | 1 | — | 1 | 4 |
| 10 | 3 | 1 | 1 | 1 | 4 |

---

### 12. Tipos de Misión — Definición Formal

```typescript
type MissionType = 'choose' | 'memorize' | 'decide' | 'react';

interface MissionDefinition {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  difficulty: 'easy' | 'normal' | 'hard';
  timeBudget: number; // segundos adicionales sobre el base
}

type MissionTypeConfig = {
  choose: { prompt: string; options: string[]; correctIndex: number };
  memorize: { sequence: string[]; displaySeconds: number };
  decide: { statement: string; options: ['A', 'B']; votesToWin: number };
  react: { scenario: string; correctReaction: string; timeout: number };
};
```

---

### 13. Condiciones de Victoria — Resumen Final

| Bando | Condiciones (en orden de evaluación) |
|-------|-------------------------------------|
| **Saboteadores** | 1. 3 misiones fallidas |
| | 2. Vivos(Saboteadores) = Vivos(Normales + Doble Agente) |
| **Normales** | 1. 3 misiones exitosas |
| | 2. Todos los Saboteadores expulsados |
| | 3. Doble Agente expulsado por error (los Normales ganan) |
| **Doble Agente** | 1. Empate vivo (Saboteadores = Normales + Doble Agente) + Doble Agente vivo |
| | 2. Si Doble Agente es expulsado → ganan Normales |
| **Empate** | Si se llega a 7 rondas sin victoria → gana el bando con más misiones exitosas |

---

## Validación Completada (SAB-000)

- [x] Equipos de misión: líder + votación con skip/blank
- [x] Protector en assignRoles: aparece en ≥9 jugadores
- [x] Colorblindness: iconos + patrones como backup
- [x] Timer de misión: configurable (30/60/90s)
- [x] Hold-to-reveal: 2.5s con feedback háptico y sonoro
- [x] Empate en expulsión: nadie sale, +punto de sospecha
- [x] Host desconectado (Fase 2): Nuevo Host automático
- [x] Algoritmo final de roles por cantidad de jugadores
- [x] Condiciones de victoria completas con Doble Agente
- [x] Tipos de misión formalizados

> **Siguiente:** SAB-002 (BIG-PICKLE) para diseño UI/UX con estas specs cerradas.
