/**
 * socialAgents.ts - Autonomous Social Agents System v2
 * 
 * Simulates real users posting, liking, commenting, and interacting
 * on the platform. Based on real market data and viral content patterns from 2026.
 * 
 * Research-backed strategies:
 * - Threads has 400M users, 6.25% engagement rate (73% higher than X)
 * - Replies are as valuable as posts (Adam Mosseri)
 * - Photos get 60% more engagement than text-only
 * - Hot takes, questions, personal stories go viral
 * - Positivity > negativity (algorithm penalizes combative content)
 * - First hour engagement velocity determines distribution
 * 
 * Run: npx convex dev (actions available for scheduling)
 */

import { action, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

// ============================================================
// AGENT PERSONALITIES - Each agent is a unique "person" with distinct voice
// ============================================================

const AGENT_PERSONALITIES = [
  {
    userId: "user_carlos_mendoza",
    nombre: "Carlos Mendoza",
    usuario: "carlosmendoza",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos",
    tradingStyle: "forex_swing",
    expertise: ["forex", "EURUSD", "GBPUSD", "analisis_tecnico"],
    personality: "analitico",
    postingFrequency: { min: 1, max: 3 },
    activeHours: { start: 7, end: 22 },
    languageStyle: "formal_but_casual",
    emojiUsage: "moderate",
    postLength: "medium",
    engagementStyle: "helpful",
    interests: ["forex", "macroeconomia", "psicotrading", "tecnico"],
    signature: "Siempre con stop loss 📊",
    timezone: "America/Argentina/Buenos_Aires",
    // Viral content angles this agent uses
    viralAngles: ["analisis_detallado", "resultado_transparente", "tip_practico", "reflexion_honesta"],
  },
  {
    userId: "user_maria_garcia",
    nombre: "María García",
    usuario: "mariagarcia",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
    tradingStyle: "chartista",
    expertise: ["indices", "patrones", "SP500", "NASDAQ", "elliott"],
    personality: "educativa",
    postingFrequency: { min: 2, max: 4 },
    activeHours: { start: 8, end: 21 },
    languageStyle: "didactica",
    emojiUsage: "moderate",
    postLength: "long",
    engagementStyle: "educational",
    interests: ["indices", "patrones_chartistas", "educacion", "elliott"],
    signature: "El gráfico siempre tiene la razón 📈",
    timezone: "America/Mexico_City",
    viralAngles: ["patron_interesante", "educacion_visual", "pregunta_comunidad", "observacion_mercado"],
  },
  {
    userId: "user_diego_lopez",
    nombre: "Diego López",
    usuario: "diegolopez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=diego",
    tradingStyle: "crypto_scalper",
    expertise: ["crypto", "BTC", "ETH", "DeFi", "altcoins"],
    personality: "entusiasta",
    postingFrequency: { min: 2, max: 5 },
    activeHours: { start: 9, end: 23 },
    languageStyle: "casual",
    emojiUsage: "high",
    postLength: "short",
    engagementStyle: "debate",
    interests: ["crypto", "defi", "nft", "bitcoin", "altcoins"],
    signature: "WAGMI 🚀",
    timezone: "America/Bogota",
    viralAngles: ["hot_take_crypto", "oportunidad_altcoin", "resultado_scalp", "debate_sano"],
  },
  {
    userId: "user_ana_rodriguez",
    nombre: "Ana Rodríguez",
    usuario: "anarodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana",
    tradingStyle: "psicotrading",
    expertise: ["psicotrading", "mindset", "disciplina", "emociones"],
    personality: "motivacional",
    postingFrequency: { min: 1, max: 2 },
    activeHours: { start: 6, end: 20 },
    languageStyle: "reflexiva",
    emojiUsage: "low",
    postLength: "medium",
    engagementStyle: "motivational",
    interests: ["psicotrading", "meditacion", "disciplina", "crecimiento"],
    signature: "Tu mente es tu mejor herramienta 🧠",
    timezone: "America/Argentina/Buenos_Aires",
    viralAngles: ["verdad_incomoda", "ejercicio_practico", "historia_personal", "consejo_directo"],
  },
  {
    userId: "user_miguel_rivera",
    nombre: "Miguel Rivera",
    usuario: "miguelrivera",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=miguel",
    tradingStyle: "algotrading",
    expertise: ["python", "bots", "backtesting", "ML", "datos"],
    personality: "tecnico",
    postingFrequency: { min: 1, max: 2 },
    activeHours: { start: 10, end: 22 },
    languageStyle: "tecnico_preciso",
    emojiUsage: "low",
    postLength: "long",
    engagementStyle: "helpful",
    interests: ["algotrading", "python", "machine_learning", "datos", "backtesting"],
    signature: "Los datos no mienten 📊",
    timezone: "America/Mexico_City",
    viralAngles: ["resultado_bot", "tip_tecnico", "comparativa_datos", "tutorial_rapido"],
  },
  {
    userId: "user_sofia_torres",
    nombre: "Sofía Torres",
    usuario: "sofiatorres",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia",
    tradingStyle: "opciones",
    expertise: ["opciones", "griegas", "spreads", "cobertura"],
    personality: "profesional",
    postingFrequency: { min: 1, max: 2 },
    activeHours: { start: 8, end: 17 },
    languageStyle: "profesional",
    emojiUsage: "low",
    postLength: "long",
    engagementStyle: "educational",
    interests: ["opciones", "derivados", "cobertura", "griegas"],
    signature: "Theta es tu amigo si sabes usarlo ⏰",
    timezone: "America/New_York",
    viralAngles: ["estrategia_opciones", "educacion_griegas", "analisis_volatilidad", "trade_semana"],
  },
  {
    userId: "user_laura_martinez",
    nombre: "Laura Martínez",
    usuario: "lauramartinez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=laura",
    tradingStyle: "day_trader_tech",
    expertise: ["day_trading", "tech_stocks", "AAPL", "TSLA", "NVDA"],
    personality: "energetica",
    postingFrequency: { min: 2, max: 4 },
    activeHours: { start: 8, end: 18 },
    languageStyle: "energetica",
    emojiUsage: "moderate",
    postLength: "short",
    engagementStyle: "debate",
    interests: ["day_trading", "tech", "acciones", "momentum"],
    signature: "El mercado abre, yo también ⚡",
    timezone: "America/New_York",
    viralAngles: ["premarket_setup", "resultado_sesion", "hot_take_tech", "watchlist_diaria"],
  },
  {
    userId: "user_andres_morales",
    nombre: "Andrés Morales",
    usuario: "andresmorales",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=andres",
    tradingStyle: "commodities",
    expertise: ["oro", "plata", "petroleo", "macro", "geopolitica"],
    personality: "analitico",
    postingFrequency: { min: 1, max: 2 },
    activeHours: { start: 7, end: 20 },
    languageStyle: "analitica",
    emojiUsage: "low",
    postLength: "medium",
    engagementStyle: "helpful",
    interests: ["commodities", "macroeconomia", "geopolitica", "oro"],
    signature: "El oro no es solo un metal, es un termómetro 🥇",
    timezone: "America/Lima",
    viralAngles: ["analisis_macro", "geopolitica_mercado", "dato_commodities", "perspectiva_oro"],
  },
  {
    userId: "user_camila_flores",
    nombre: "Camila Flores",
    usuario: "camilaflores",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=camila",
    tradingStyle: "educadora",
    expertise: ["educacion_financiera", "ahorro", "inversion_basica", "presupuesto"],
    personality: "cercana",
    postingFrequency: { min: 1, max: 3 },
    activeHours: { start: 9, end: 21 },
    languageStyle: "cercana",
    emojiUsage: "moderate",
    postLength: "medium",
    engagementStyle: "motivational",
    interests: ["educacion", "finanzas_personales", "ahorro", "inversion"],
    signature: "Todos podemos aprender a manejar nuestro dinero 💰",
    timezone: "America/Bogota",
    viralAngles: ["consejo_accesible", "historia_inspiradora", "pregunta_reflexion", "tip_ahorro"],
  },
  {
    userId: "user_felipe_castro",
    nombre: "Felipe Castro",
    usuario: "felipecastro",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=felipe",
    tradingStyle: "futures_scalper",
    expertise: ["futuros", "ES", "NQ", "scalping", "order_flow"],
    personality: "directo",
    postingFrequency: { min: 2, max: 3 },
    activeHours: { start: 8, end: 17 },
    languageStyle: "directa",
    emojiUsage: "low",
    postLength: "short",
    engagementStyle: "debate",
    interests: ["futuros", "scalping", "order_flow", "ES"],
    signature: "Price action > todo lo demás 📉",
    timezone: "America/Chicago",
    viralAngles: ["resultado_scalp", "tip_order_flow", "hot_take_trading", "setup_apertura"],
  },
];

// ============================================================
// VIRAL CONTENT ENGINE - Based on 2026 social media research
// ============================================================

// Real trending topics in trading/finance for 2026
const TRENDING_TOPICS_2026 = [
  "Bitcoin cerca de $100K - ¿nuevo ATH o trampa?",
  "Fed mantiene tasas pero señala recortes en septiembre",
  "NVDA earnings la próxima semana - expectativas récord",
  "Oro en máximos históricos por incertidumbre geopolítica",
  "Grandmaster-OBI: el nuevo Roaring Kitty de 2026",
  "AI agents en trading - ¿revolución o burbuja?",
  "Polymarket y prediction markets - el futuro del trading",
  "Social trading crece 300% en 2026",
  "DeFi yield farming vuelve con fuerza",
  "S&P500 en máximos pero el breadth es preocupante",
  "China anuncia estímulos masivos",
  "OPEC+ mantiene recortes hasta Q2 2026",
  "ETH ETF aprueba flujos institucionales récord",
  "Retail traders vuelven con fuerza tras pausa de 2025",
  "Trading con IA: de hype a realidad",
];

// ============================================================
// VIRAL POST TEMPLATES - Designed for maximum engagement
// Based on what actually goes viral on trading social media in 2026
// ============================================================

const VIRAL_POSTS = {
  // TYPE 1: HONEST TRANSPARENCY (highest engagement)
  // People love when traders are real about wins AND losses
  honest_transparency: [
    {
      template: "Voy a ser honesto: esta semana perdí {perdida}. No fue un mal setup, fue mala gestión emocional. Entré sin confirmar y el mercado me castigó. Pero saben qué? Acepté la pérdida, cerré, y no intenté recuperar. Eso es madurez como trader. Hace un año habría hecho overtrading y perdido el triple.",
      viral_factor: "vulnerability", // being vulnerable creates trust
    },
    {
      template: "Mi mes en números:\n\n📊 Trades: {trades}\n✅ Ganadores: {ganadores} ({wr}%)\n❌ Perdedores: {perdedores}\n💰 PnL: +${pnl}\n📉 Max drawdown: {dd}%\n\nNo es espectacular pero es consistente. Y la consistencia es lo que paga las cuentas. Prefiero 5% mensual seguro que 30% un mes y -20% el siguiente.",
      viral_factor: "transparency",
    },
    {
      template: "Confesión: llevo {dias} días sin operar. No hay setup claro y mi regla es 'si no hay setup, no hay trade'. Sé que suena básico pero la mayoría opera por aburrimiento. El mercado no se va a ir. Estará ahí mañana.",
      viral_factor: "discipline",
    },
  ],

  // TYPE 2: HOT TAKES (sparks discussion)
  // Controversial but constructive opinions that make people want to respond
  hot_takes: [
    {
      template: "Unpopular opinion: el 90% de los 'gurús' de trading en redes sociales no operan en vivo. Muestran screenshots editados, cuentas demo, o resultados de un mes bueno. Si realmente fueran tan buenos, estarían operando, no vendiendo cursos de $997. Mi consejo: busquen traders que muestren track record verificado de al menos 1 año.",
      viral_factor: "controversy_constructive",
    },
    {
      template: "Otro unpopular opinion: los indicadores no te van a hacer rentable. Llevo {anios} años operando y los únicos 3 'indicadores' que uso son: precio, volumen y contexto. Todo lo demás es ruido. El price action es el indicador más subestimado porque es gratis y está ahí mismo.",
      viral_factor: "contrarian",
    },
    {
      template: "Hot take: si necesitas más de 5 minutos para analizar un trade, probablemente no es un buen trade. Los mejores setups son obvios. Si tienes que forzar el análisis, es porque no hay setup. Simple.",
      viral_factor: "simplicity",
    },
    {
      template: "La verdad incómoda: la mayoría de traders pierden dinero no por falta de conocimiento técnico, sino por falta de gestión emocional. Puedes tener la mejor estrategia del mundo, pero si no puedes seguir tus propias reglas, no sirve de nada.",
      viral_factor: "hard_truth",
    },
  ],

  // TYPE 3: QUESTIONS THAT SPARK CONVERSATION
  // Questions that make people want to share their experience
  conversation_starters: [
    {
      template: "Pregunta seria: ¿cuál fue el trade que más les enseñó en su carrera? Para mí fue cuando perdí ${perdida} en un solo trade por no usar stop loss. Dolió pero me enseñó más que 100 libros. ¿Cuál fue el suyo?",
      viral_factor: "storytelling_prompt",
    },
    {
      template: "¿Cuántos de aquí operan en demo todavía? No hay vergüenza en eso. Yo estuve {meses} meses en demo antes de poner dinero real. Y fue lo mejor que pude hacer. ¿O alguien saltó directo a real y le fue bien?",
      viral_factor: "relatable_question",
    },
    {
      template: "Si pudieran darle un solo consejo a su yo del primer día de trading, ¿cuál sería? El mío: nunca arriesgues más del 2% por trade. Parece básico pero me hubiera ahorrado miles de dólares.",
      viral_factor: "wisdom_sharing",
    },
    {
      template: "¿Cuál es el par/activo que mejor les va? Yo con {par} tengo un win rate de {wr}% pero con {otro_par} apenas llego al 45%. Curiosidad genuina.",
      viral_factor: "data_sharing",
    },
  ],

  // TYPE 4: BEHIND THE SCENES (authenticity)
  // Showing the real process, not just results
  behind_the_scenes: [
    {
      template: "Mi rutina de mañana:\n\n6:30 - Café + revisar noticias macro\n7:00 - Análisis de gráficos (marco niveles clave)\n7:30 - Defino mi plan del día (máx 3 setups)\n8:00 - Reviso posiciones abiertas\n8:30 - Medito 10 min (sí, en serio)\n9:00 - Estoy listo para la apertura\n\nNo es glamuroso pero funciona. La preparación es el 80% del éxito.",
      viral_factor: "routine",
    },
    {
      template: "Mi setup de trading no es nada fancy:\n\n🖥️ Monitor de 24\" (no necesito 6 monitores)\n📊 TradingView (plan básico)\n📓 Cuaderno físico para el journal\n☕ Café (mucho café)\n🎧 Lo-fi beats\n\nNo necesitas equipo caro para ser rentable. Necesitas disciplina.",
      viral_factor: "accessibility",
    },
    {
      template: "Acabo de terminar mi journal de la semana. 15 trades, 10 ganadores, 5 perdedores. PnL: +${pnl}. Pero lo más importante: seguí mi plan en 14 de 15 trades. Ese 1 que no seguí el plan fue perdedor. Coincidencia? No creo.",
      viral_factor: "process_over_result",
    },
  ],

  // TYPE 5: EDUCATIONAL VALUE (save-worthy content)
  // Posts people save and share because they're genuinely useful
  educational_value: [
    {
      template: "Los 5 errores que más dinero me costaron como trader:\n\n1. No usar stop loss (me costó ${error1})\n2. Overtrading tras una pérdida (${error2})\n3. Mover el stop loss 'porque ya va a volver' (${error3})\n4. Operar sin plan (${error4})\n5. Venganza contra el mercado (${error5})\n\nTotal: más de ${total} en errores evitables. Aprendan de mis errores, no cometan los mismos.",
      viral_factor: "listicle_valuable",
    },
    {
      template: "Tutorial rápido: cómo calculo mi tamaño de posición\n\n1. Capital: ${capital}\n2. Riesgo por trade: 2% = ${riesgo}\n3. Distancia al stop loss: {distancia} pips\n4. Tamaño = riesgo / distancia = {tamano} lotes\n\nAsí de simple. Nunca arriesgo más del 2% sin importar cuán seguro esté.",
      viral_factor: "tutorial",
    },
    {
      template: "3 libros que cambiaron mi forma de operar:\n\n1. 'Trading in the Zone' de Mark Douglas - me enseñó que el trading es 80% mental\n2. 'The Disciplined Trader' del mismo autor - refuerza la disciplina\n3. 'Market Wizards' de Jack Schwager - entrevistas con los mejores traders del mundo\n\nSi solo van a leer uno, que sea el primero.",
      viral_factor: "recommendations",
    },
  ],

  // TYPE 6: MARKET ANALYSIS (real-time relevance)
  // Timely analysis that shows expertise
  market_analysis: [
    {
      template: "Análisis rápido de {par}:\n\n📈 Tendencia: {tendencia}\n🎯 Soporte clave: {soporte}\n🎯 Resistencia: {resistencia}\n📊 RSI: {rsi}\n💡 Mi bias: {bias}\n\nSi rompe {nivel} con volumen, voy long con stop en {stop}. Target: {target}. Ratio 1:{ratio}. ¿Qué ven ustedes?",
      viral_factor: "actionable_analysis",
    },
    {
      template: "El {activo} está en un momento clave. Tras subir {subida} en el último mes, ahora está consolidando en {nivel}. Dos escenarios:\n\n1️⃣ Ruptura alcista: target {target_alcista}\n2️⃣ Corrección: soporte en {soporte}\n\nYo estoy posicionado en {direccion} con stop ajustado. El mercado decidirá esta semana.",
      viral_factor: "scenario_planning",
    },
    {
      template: "Lo que estoy viendo en el mercado hoy:\n\n📊 DXY: {dxy} (dólar {fortaleza_debilitando})\n📈 S&P500: {spx} ({tendencia_spx})\n🥇 Oro: {oro} ({tendencia_oro})\n₿ BTC: {btc} ({tendencia_btc})\n\nContexto macro: {contexto_macro}\n\nMi plan: {plan}",
      viral_factor: "market_overview",
    },
  ],

  // TYPE 7: PERSONAL STORIES (emotional connection)
  // Stories that create emotional bonds with readers
  personal_stories: [
    {
      template: "Hace {anios} años dejé mi trabajo corporativo para dedicarme al trading. Todos me decían que estaba loco. Los primeros {meses} meses fueron brutales: perdí ${perdida} y casi me rindo. Pero seguí aprendiendo, ajustando, mejorando. Hoy, {anios} años después, vivo del trading. No fue fácil pero valió cada minuto. Si estás empezando, no te rindas.",
      viral_factor: "journey",
    },
    {
      template: "Mi peor día como trader: perdí ${perdida} en 20 minutos. Fue un viernes, antes del NFP. Entré sin stop loss 'porque estaba seguro'. Spoiler: no estaba seguro. Ese día aprendí más que en un año de lectura. Desde entonces, stop loss es sagrado. Sin excepciones.",
      viral_factor: "cautionary_tale",
    },
    {
      template: "Hoy cumplí {dias} días consecutivos operando con disciplina. No quiere decir que gané todos los días, sino que seguí mi plan todos los días. Y eso es lo que importa. La disciplina > resultados. Los resultados son consecuencia de la disciplina.",
      viral_factor: "milestone",
    },
  ],

  // TYPE 8: CRYPTO-SPECIFIC (high engagement niche)
  crypto_specific: [
    {
      template: "BTC en {btc}. Estamos a un paso del ATH. El volumen institucional está que arde 🔥 BlackRock, Fidelity, todos comprando. Pero ojo: cada vez que pensamos que 'esta vez es diferente', el mercado nos recuerda que no lo es. Yo estoy long pero con stop ajustado. No me confío.",
      viral_factor: "timely_crypto",
    },
    {
      template: "Mi portfolio crypto actual:\n\n₿ 50% BTC (el rey, no se toca)\nΞ 25% ETH (smart contracts leader)\n◎ 10% SOL (el que más rinde este año)\n🔗 10% LINK (oracle infrastructure)\n🟣 5% altcoins especulativas\n\nNo es consejo financiero, es mi estrategia personal. DCA cada semana sin importar el precio.",
      viral_factor: "portfolio_transparency",
    },
    {
      template: "DeFi está volviendo. Los yields en los pools de liquidez están subiendo. Estoy generando {yield}% APY en un pool USDC/ETH. No es mucho pero es pasivo. Y en un mercado lateral, el yield farming es tu amigo. Solo usen protocols auditados con TVL alto.",
      viral_factor: "opportunity_alert",
    },
  ],

  // TYPE 9: PSYCHOLOGY/MINDSET (universally relatable)
  psychology_mindset: [
    {
      template: "El trading te enseña más sobre ti mismo que cualquier terapia. Te muestra tus miedos, tu avaricia, tu impaciencia, tu ego. Y te obliga a enfrentarlos todos los días. No es fácil. Pero si puedes dominar tus emociones en el trading, puedes dominarlas en cualquier área de tu vida.",
      viral_factor: "deep_insight",
    },
    {
      template: "Regla que me cambió la vida: si pierdo 3 trades seguidos en el mismo día, PARO. Cierro la plataforma. Salgo a caminar. No opero hasta mañana.\n\n¿Por qué? Porque después de 3 pérdidas, tu juicio está comprometido. El tilt es real. El mercado estará ahí mañana.",
      viral_factor: "actionable_rule",
    },
    {
      template: "A los que están empezando y se sienten frustrados: es normal. Los primeros meses son los más difíciles. Es normal perder. Es normal dudar. Lo importante es que cada trade, ganador o perdedor, te enseña algo. No comparen su capítulo 1 con el capítulo 20 de otro trader.",
      viral_factor: "empathy",
    },
  ],

  // TYPE 10: QUICK TIPS (highly shareable)
  quick_tips: [
    {
      template: "Tip que me hubiera gustado saber antes: el mejor trade es el que no haces. Si no hay setup claro, no operes. El mercado abre todos los días. No te vas a perder nada esperando la próxima oportunidad.",
      viral_factor: "wisdom",
    },
    {
      template: "Antes de entrar a un trade, pregúntate: '¿Estoy entrando por setup o por aburrimiento?' Si es por aburrimiento, cierra la plataforma y sal a caminar. Tu cuenta te lo va a agradecer.",
      viral_factor: "self_awareness",
    },
    {
      template: "El FOMO es el enemigo #1 del trader. Ves que {activo} subió {subida} y quieres entrar. Pero ya subió. Entrar ahora es perseguir el precio. Espera el pullback o busca otra oportunidad. El mercado siempre ofrece otra entrada.",
      viral_factor: "fomo_warning",
    },
  ],
};

// ============================================================
// COMMENT TEMPLATES - Natural, varied responses
// ============================================================

const COMMENT_TEMPLATES = {
  agreement: [
    "Coincido totalmente. Me pasó exactamente lo mismo la semana pasada.",
    "100% de acuerdo. Esto es algo que todo trader debería saber.",
    "Exacto. La disciplina es lo que separa a los consistentes del resto.",
    "Así es. Yo aprendí esto de la manera difícil 😅",
  ],
  adding_value: [
    "Buen punto. Agrego algo: también es importante {detalle}. Me sirvió mucho cuando empecé.",
    "Excelente análisis. Yo agregaría que {detalle} también influye en este tipo de setups.",
    "Gran aporte. Un dato adicional: {dato}. Esto complementa bien tu análisis.",
    "Muy bueno. Tip adicional: {tip}. Me funcionó en situaciones similares.",
  ],
  question: [
    "Interesante. ¿Qué timeframe usaste para este análisis?",
    "Buena lectura. ¿Cuál es tu stop loss en este caso?",
    "¿Has considerado {alternativa}? A veces funciona mejor en estos contextos.",
    "¿Cuánto tiempo llevas operando este par? Me interesa tu perspectiva.",
  ],
  personal_experience: [
    "Me identifico mucho con esto. Yo tuve una experiencia similar con {par}.",
    "Esto me recuerda a cuando {experiencia}. Aprendí mucho de esa situación.",
    "Justo ayer estaba pensando en lo mismo. El mercado está muy interesante.",
    "Como alguien que también opera {par}, puedo confirmar que tu análisis tiene sentido.",
  ],
  respectful_disagreement: [
    "Interesante perspectiva. Yo lo veo un poco diferente: {contra}. Pero respeto tu análisis.",
    "Buen punto pero ojo con {riesgo}. El mercado puede sorprendernos.",
    "Entiendo tu posición pero en mi experiencia {experiencia}. Quizás depende del timeframe.",
  ],
  encouragement: [
    "¡Gran análisis! Cada día aprendo algo nuevo acá. Gracias por compartir 🙌",
    "Excelente contenido. Esto es lo que hace grande a esta comunidad.",
    "Me encanta la calidad de análisis que hay acá. Sigan así 👊",
    "Esto es oro puro. Guardado para revisarlo después.",
  ],
};

// ============================================================
// MARKET CONTEXT GENERATOR
// ============================================================

function getMarketContext() {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  
  return {
    fecha: now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    hora: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    isWeekday: dayOfWeek >= 1 && dayOfWeek <= 5,
    isMarketHours: hour >= 9 && hour <= 16 && dayOfWeek >= 1 && dayOfWeek <= 5,
    mercado: {
      EURUSD: { precio: 1.0865, tendencia: "alcista", soporte: 1.0820, resistencia: 1.0920, rsi: 62 },
      GBPUSD: { precio: 1.2680, tendencia: "alcista", soporte: 1.2640, resistencia: 1.2750, rsi: 58 },
      USDJPY: { precio: 149.20, tendencia: "lateral", soporte: 148.50, resistencia: 150.00, rsi: 50 },
      BTC: { precio: 95200, tendencia: "alcista", soporte: 92000, resistencia: 97500, rsi: 72 },
      ETH: { precio: 3480, tendencia: "alcista", soporte: 3350, resistencia: 3600, rsi: 68 },
      SP500: { precio: 5210, tendencia: "alcista", soporte: 5150, resistencia: 5280, rsi: 65 },
      NASDAQ: { precio: 18350, tendencia: "alcista", soporte: 18100, resistencia: 18600, rsi: 70 },
      ORO: { precio: 2445, tendencia: "alcista", soporte: 2400, resistencia: 2480, rsi: 75 },
      PETROLEO: { precio: 82.50, tendencia: "lateral", soporte: 80, resistencia: 85, rsi: 48 },
      NVDA: { precio: 136, tendencia: "alcista", soporte: 130, resistencia: 142, rsi: 68 },
      AAPL: { precio: 196, tendencia: "lateral", soporte: 192, resistencia: 200, rsi: 52 },
      TSLA: { precio: 246, tendencia: "volatil", soporte: 240, resistencia: 255, rsi: 60 },
    },
    trending: TRENDING_TOPICS_2026,
    noticias: [
      "Fed mantiene tasas pero señala posible recorte en septiembre",
      "Bitcoin se acerca a máximos históricos con volumen institucional",
      "NVIDIA reporta earnings la próxima semana, expectativas altas",
      "Oro en máximos históricos por incertidumbre geopolítica",
      "Datos de empleo en EE.UU. mejores de lo esperado",
      "China anuncia estímulos económicos, mercados asiáticos suben",
      "OPEC+ mantiene recortes de producción hasta Q2 2026",
      "ETH ETF registra flujos institucionales récord esta semana",
    ],
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fillTemplate(template: string, data: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return data[key] !== undefined ? String(data[key]) : `{${key}}`;
  });
}

function getAgentById(userId: string) {
  return AGENT_PERSONALITIES.find(a => a.userId === userId);
}

// ============================================================
// POST GENERATION - Creates realistic, viral-worthy content
// ============================================================

function generatePostForAgent(agent: typeof AGENT_PERSONALITIES[0], market: ReturnType<typeof getMarketContext>) {
  const m = market.mercado;
  const viralAngle = randomChoice(agent.viralAngles);
  
  // Select post category based on viral angle
  let category: keyof typeof VIRAL_POSTS;
  switch (viralAngle) {
    case "hot_take_crypto": case "hot_take_trading":
      category = "hot_takes"; break;
    case "resultado_transparente": case "resultado_bot": case "resultado_scalp": case "resultado_sesion":
      category = "honest_transparency"; break;
    case "pregunta_comunidad": case "pregunta_reflexion":
      category = "conversation_starters"; break;
    case "tip_practico": case "tip_tecnico": case "tip_order_flow": case "tip_ahorro": case "consejo_accesible": case "consejo_directo":
      category = "quick_tips"; break;
    case "analisis_detallado": case "analisis_macro": case "analisis_volatilidad": case "estrategia_opciones":
      category = "market_analysis"; break;
    case "verdad_incomoda": case "reflexion_honesta":
      category = "psychology_mindset"; break;
    case "historia_personal": case "historia_inspiradora":
      category = "personal_stories"; break;
    case "oportunidad_altcoin": case "debate_sano":
      category = "crypto_specific"; break;
    case "educacion_visual": case "educacion_griegas": case "tutorial_rapido":
      category = "educational_value"; break;
    case "premarket_setup": case "watchlist_diaria": case "setup_apertura":
      category = "behind_the_scenes"; break;
    case "comparativa_datos": case "dato_commodities": case "perspectiva_oro":
      category = "market_analysis"; break;
    case "ejercicio_practico":
      category = "psychology_mindset"; break;
    default:
      category = randomChoice(Object.keys(VIRAL_POSTS) as Array<keyof typeof VIRAL_POSTS>);
  }

  const posts = VIRAL_POSTS[category];
  const postObj = randomChoice(posts);
  
  // Generate realistic data for template
  const data: Record<string, string | number> = {
    perdida: randomInt(200, 2000).toString(),
    trades: randomInt(15, 45).toString(),
    ganadores: randomInt(10, 30).toString(),
    perdedores: randomInt(3, 12).toString(),
    wr: randomInt(55, 75).toString(),
    pnl: randomInt(500, 5000).toString(),
    dd: randomInt(2, 8).toString(),
    dias: randomInt(3, 30).toString(),
    años: randomInt(3, 12).toString(),
    meses: randomInt(3, 18).toString(),
    error1: randomInt(500, 3000).toString(),
    error2: randomInt(300, 2000).toString(),
    error3: randomInt(200, 1500).toString(),
    error4: randomInt(100, 1000).toString(),
    error5: randomInt(150, 1200).toString(),
    total: randomInt(3000, 15000).toString(),
    capital: "5000",
    riesgo: "100",
    distancia: "25",
    tamano: "0.04",
    par: randomChoice(["EUR/USD", "GBP/USD", "BTC/USD", "ETH/USD"]),
    otro_par: randomChoice(["USD/JPY", "AUD/USD", "SOL/USD"]),
    activo: randomChoice(["BTC", "NVDA", "S&P500", "Oro", "ETH"]),
    tendencia: randomChoice(["alcista", "lateral", "bajista"]),
    soporte: randomChoice([m.EURUSD.soporte.toString(), m.BTC.soporte.toString(), m.SP500.soporte.toString()]),
    resistencia: randomChoice([m.EURUSD.resistencia.toString(), m.BTC.resistencia.toString(), m.SP500.resistencia.toString()]),
    rsi: randomInt(45, 75).toString(),
    bias: randomChoice(["alcista", "lateral", "bajista"]),
    nivel: randomChoice(["1.0900", "95,000", "5,250", "2,500"]),
    stop: randomChoice(["1.0820", "92,000", "5,150", "2,380"]),
    target: randomChoice(["1.0950", "97,500", "5,300", "2,520"]),
    ratio: randomChoice(["2", "2.5", "3", "1.8"]),
    subida: randomInt(3, 25).toString(),
    target_alcista: randomChoice(["100,000", "5,500", "2,600"]),
    soporte_bear: randomChoice(["90,000", "5,100", "2,350"]),
    direccion: randomChoice(["long", "short"]),
    dxy: randomChoice(["fuerte", "débil", "lateral"]),
    fortaleza_debilitando: randomChoice(["fuerte", "débil"]),
    spx: m.SP500.precio.toString(),
    tendencia_spx: m.SP500.tendencia,
    oro: m.ORO.precio.toString(),
    tendencia_oro: m.ORO.tendencia,
    btc: m.BTC.precio.toLocaleString(),
    tendencia_btc: m.BTC.tendencia,
    contexto_macro: randomChoice(["incertidumbre geopolítica", "datos mixtos de empleo", "expectativas de recorte de tasas", "tensión comercial"]),
    plan: randomChoice(["esperar confirmación", "operar en rango", "seguir la tendencia", "ser selectivo"]),
    yield: randomInt(8, 20).toString(),
    detalle: randomChoice(["el contexto macro", "el volumen", "la divergencia en RSI", "la estructura de precio", "las noticias del día"]),
    dato: randomChoice(["el volumen subió 20% esta semana", "la volatilidad implícita está en percentil 80", "los institucionales están acumulando", "el open interest está en máximos"]),
    tip: randomChoice(["siempre operen con el trend", "usen trailing stop en tendencias fuertes", "no operen 15 min antes de noticias", "reduzcan tamaño en mercados laterales"]),
    alternativa: randomChoice(["usar opciones en vez de spot", "esperar el retest", "operar en timeframe menor"]),
    riesgo_comentario: randomChoice(["la volatilidad de esta semana", "los earnings de mañana", "el anuncio de la Fed", "el NFP del viernes"]),
    experiencia: randomChoice(["cuando empecé perdí más de lo que gané", "en mercados laterales este patrón suele fallar", "he visto setups similares dar resultados opuestos"]),
    contra: randomChoice(["el volumen no confirma la ruptura", "el contexto macro sugiere otra cosa", "hay una divergencia bajista oculta"]),
    experiencia_comentario: randomChoice(["tuve una pérdida similar el mes pasado", "me pasó lo mismo con BTC en marzo", "aprendí esto después de quemar 3 cuentas"]),
  };

  const contenido = fillTemplate(postObj.template, data);
  
  // Generate title from first sentence
  const firstSentence = contenido.split('\n')[0].replace(/[📊🎯💡📈🥇⚡🧠💰📉₿Ξ◎🔗🟣1️⃣2️⃣3️⃣4️⃣5️⃣✅❌🖥️☕🎧📓📋🔥🙌👊😅]/g, '').trim();
  const titulo = firstSentence.length > 80 ? firstSentence.substring(0, 77) + "..." : firstSentence;
  
  // Determine category and tags based on agent
  const categoria = agent.interests[0] || "general";
  const tags = [...agent.expertise.slice(0, 3), randomChoice(market.trending).substring(0, 20)];
  const par = agent.expertise.find(e => e.includes("/")) || undefined;
  const sentiment = randomChoice(["bullish", "neutral", "bearish"]);
  
  // 40% chance of including an image (photos get 60% more engagement)
  const imagenUrl = Math.random() > 0.6 ? `https://images.unsplash.com/photo-${randomChoice(["1611974789855-9c2a0a7236a3", "1642790106117-e829e14a795f", "1639762681485-074b7f938ba0", "1551288049-bebda4e38f71", "1590283603385-17ffb3a7f29f", "1518186285589-2f7103f0845a", "1610375461246-83df859d849d", "1579621970563-ebec7560ff3e"])}?w=600` : undefined;

  return { contenido, titulo, categoria, tipo: viralAngle, tags, par, sentiment, imagenUrl };
}

function generateComment(agent: typeof AGENT_PERSONALITIES[0]): string {
  const style = randomChoice(Object.keys(COMMENT_TEMPLATES) as Array<keyof typeof COMMENT_TEMPLATES>);
  const templates = COMMENT_TEMPLATES[style];
  const template = randomChoice(templates);
  
  const data: Record<string, string> = {
    detalle: randomChoice(["el análisis de volumen", "la lectura de precio", "la identificación del patrón", "la gestión de riesgo", "el contexto macro"]),
    dato: randomChoice(["el volumen subió 20%", "la VI está alta", "los institucionales compran", "el open interest creció"]),
    tip: randomChoice(["operen con el trend", "usen trailing stop", "eviten noticias", "reduzcan tamaño"]),
    par: randomChoice(["EUR/USD", "BTC", "SP500", "oro"]),
    alternativa: randomChoice(["usar opciones", "esperar retest", "operar en 1H"]),
    riesgo: randomChoice(["la volatilidad", "los earnings", "la Fed", "el NFP"]),
    experiencia: randomChoice(["perdí similar el mes pasado", "me pasó con BTC en marzo", "aprendí quemando cuentas"]),
    contra: randomChoice(["el volumen no confirma", "el macro es diferente", "hay divergencia"]),
    experiencia_comentario: randomChoice(["tuve pérdida similar", "me pasó lo mismo", "aprendí de eso"]),
  };
  
  return fillTemplate(template, data);
}

// ============================================================
// CONVEX ACTIONS
// ============================================================

/**
 * Post content as a specific agent
 */
export const postAsAgent = action({
  args: { agentUserId: v.string() },
  handler: async (ctx, args) => {
    const agent = getAgentById(args.agentUserId);
    if (!agent) throw new Error(`Agent ${args.agentUserId} not found`);
    
    const market = getMarketContext();
    const post = generatePostForAgent(agent, market);
    
    const postId = await ctx.runMutation(internal.posts.createPostForAgent, {
      userId: agent.userId,
      contenido: post.contenido,
      categoria: post.categoria,
      titulo: post.titulo,
      tipo: post.tipo,
      par: post.par,
      tags: post.tags,
      imagenUrl: post.imagenUrl,
      sentiment: post.sentiment,
    } as any);
    
    return { success: true, postId, agent: agent.nombre, titulo: post.titulo };
  },
});

/**
 * Agent likes random posts
 */
export const agentLikePosts = action({
  args: { agentUserId: v.string(), count: v.number() },
  handler: async (ctx, args) => {
    const agent = getAgentById(args.agentUserId);
    if (!agent) throw new Error(`Agent ${args.agentUserId} not found`);
    
    const posts = await ctx.runQuery(api.posts.getPosts, {} as any);
    const otherPosts = (posts as any[]).filter((p: any) => p.userId !== agent.userId);
    const toLike = otherPosts.sort(() => Math.random() - 0.5).slice(0, args.count);
    const liked: string[] = [];
    
    for (const post of toLike) {
      try {
        await ctx.runMutation(api.posts.toggleLike, { id: post._id, userId: agent.userId } as any);
        liked.push(post._id);
      } catch (e) { /* already liked or error */ }
    }
    
    return { success: true, likedCount: liked.length, agent: agent.nombre };
  },
});

/**
 * Agent comments on posts
 */
export const agentCommentPosts = action({
  args: { agentUserId: v.string(), count: v.number() },
  handler: async (ctx, args) => {
    const agent = getAgentById(args.agentUserId);
    if (!agent) throw new Error(`Agent ${args.agentUserId} not found`);
    
    const posts = await ctx.runQuery(api.posts.getPosts, {} as any);
    const otherPosts = (posts as any[]).filter((p: any) => p.userId !== agent.userId);
    const toComment = otherPosts.sort(() => Math.random() - 0.5).slice(0, args.count);
    const commented: string[] = [];
    
    for (const post of toComment) {
      try {
        const comment = generateComment(agent);
        await ctx.runMutation(internal.posts.addCommentForAgent, { postId: post._id, userId: agent.userId, text: comment } as any);
        commented.push(post._id);
      } catch (e) { /* skip */ }
    }
    
    return { success: true, commentedCount: commented.length, agent: agent.nombre };
  },
});

/**
 * Agent replies to comments on their own posts
 */
export const agentReplyToComments = action({
  args: { agentUserId: v.string() },
  handler: async (ctx, args) => {
    const agent = getAgentById(args.agentUserId);
    if (!agent) throw new Error(`Agent ${args.agentUserId} not found`);
    
    const posts = await ctx.runQuery(api.posts.getPosts, {} as any);
    const agentPosts = (posts as any[]).filter((p: any) => p.userId === agent.userId).slice(0, 5);
    let replies = 0;
    
    for (const post of agentPosts) {
      const comments = (post as any).comentarios || [];
      const otherComments = comments.filter((c: any) => c.userId !== agent.userId);
      
      for (const comment of otherComments.slice(0, 2)) {
        try {
          const replyTemplates = [
            `Gracias por el comentario. Coincido en que es un punto importante.`,
            `Buena observación. Voy a revisar eso más en detalle y comparto mi análisis.`,
            `Exacto, eso es justo lo que digo. La clave está en los detalles.`,
            `Interesante punto de vista. Yo lo veo un poco diferente pero respeto tu opinión.`,
            `¡Gracias! Me alegra que sirva. Sigan así 👊`,
            `Totalmente de acuerdo. La experiencia es la mejor maestra.`,
            `Gracias por compartir tu experiencia. Eso es lo que hace grande a esta comunidad.`,
          ];
          const reply = randomChoice(replyTemplates);
          await ctx.runMutation(internal.posts.addCommentForAgent, { postId: post._id, userId: agent.userId, text: reply } as any);
          replies++;
        } catch (e) { /* skip */ }
      }
    }
    
    return { success: true, repliesCount: replies, agent: agent.nombre };
  },
});

/**
 * Daily social activity - runs ALL agent behaviors in sequence
 * This is the main function to schedule daily
 */
export const dailySocialActivity = action({
  args: {},
  handler: async (ctx) => {
    const results: any[] = [];
    const market = getMarketContext();
    
    // Phase 1: Each agent posts content (staggered by personality)
    for (const agent of AGENT_PERSONALITIES) {
      try {
        const postCount = randomInt(agent.postingFrequency.min, agent.postingFrequency.max);
        for (let i = 0; i < postCount; i++) {
          const post = generatePostForAgent(agent, market);
          await ctx.runMutation(internal.posts.createPostForAgent, {
            userId: agent.userId,
            contenido: post.contenido,
            categoria: post.categoria,
            titulo: post.titulo,
            tipo: post.tipo,
            par: post.par,
            tags: post.tags,
            imagenUrl: post.imagenUrl,
            sentiment: post.sentiment,
          } as any);
          results.push({ action: "post", agent: agent.nombre, titulo: post.titulo.substring(0, 50) });
        }
      } catch (e) {
        results.push({ action: "post_error", agent: agent.nombre, error: String(e) });
      }
    }
    
    // Phase 2: Each agent likes posts (5-15 per agent)
    for (const agent of AGENT_PERSONALITIES) {
      try {
        const likeCount = randomInt(5, 15);
        const posts = await ctx.runQuery(api.posts.getPosts, {} as any);
        const otherPosts = (posts as any[]).filter((p: any) => p.userId !== agent.userId);
        const toLike = otherPosts.sort(() => Math.random() - 0.5).slice(0, likeCount);
        
        for (const post of toLike) {
          try {
            await ctx.runMutation(api.posts.toggleLike, { id: post._id, userId: agent.userId } as any);
          } catch (e) { /* skip */ }
        }
        results.push({ action: "likes", agent: agent.nombre, count: toLike.length });
      } catch (e) {
        results.push({ action: "likes_error", agent: agent.nombre, error: String(e) });
      }
    }
    
    // Phase 3: Each agent comments on posts (3-8 per agent)
    for (const agent of AGENT_PERSONALITIES) {
      try {
        const commentCount = randomInt(3, 8);
        const posts = await ctx.runQuery(api.posts.getPosts, {} as any);
        const otherPosts = (posts as any[]).filter((p: any) => p.userId !== agent.userId);
        const toComment = otherPosts.sort(() => Math.random() - 0.5).slice(0, commentCount);
        
        for (const post of toComment) {
          try {
            const comment = generateComment(agent);
            await ctx.runMutation(internal.posts.addCommentForAgent, { postId: post._id, userId: agent.userId, text: comment } as any);
          } catch (e) { /* skip */ }
        }
        results.push({ action: "comments", agent: agent.nombre, count: toComment.length });
      } catch (e) {
        results.push({ action: "comments_error", agent: agent.nombre, error: String(e) });
      }
    }
    
    // Phase 4: Agents reply to comments on their posts
    for (const agent of AGENT_PERSONALITIES) {
      try {
        const posts = await ctx.runQuery(api.posts.getPosts, {} as any);
        const agentPosts = (posts as any[]).filter((p: any) => p.userId === agent.userId).slice(0, 5);
        let replies = 0;
        
        for (const post of agentPosts) {
          const comments = (post as any).comentarios || [];
          const otherComments = comments.filter((c: any) => c.userId !== agent.userId);
          
          for (const comment of otherComments.slice(0, 2)) {
            try {
              const replyTemplates = [
                `Gracias por el comentario. Coincido en que es un punto importante.`,
                `Buena observación. Voy a revisar eso más en detalle.`,
                `Exacto, eso es justo lo que digo. La clave está en los detalles.`,
                `Interesante punto de vista. Yo lo veo un poco diferente pero respeto tu opinión.`,
                `¡Gracias! Me alegra que sirva. Sigan así 👊`,
              ];
              const reply = randomChoice(replyTemplates);
              await ctx.runMutation(internal.posts.addCommentForAgent, { postId: post._id, userId: agent.userId, text: reply } as any);
              replies++;
            } catch (e) { /* skip */ }
          }
        }
        results.push({ action: "replies", agent: agent.nombre, count: replies });
      } catch (e) {
        results.push({ action: "replies_error", agent: agent.nombre, error: String(e) });
      }
    }
    
    return { 
      success: true, 
      summary: {
        totalActions: results.length,
        posts: results.filter(r => r.action === "post").length,
        likes: results.filter(r => r.action === "likes").length,
        comments: results.filter(r => r.action === "comments").length,
        replies: results.filter(r => r.action === "replies").length,
      },
      results,
    };
  },
});

/**
 * Get agent activity stats
 */
export const getAgentStats = query({
  args: {},
  handler: async (ctx) => {
    const stats = [];
    
    for (const agent of AGENT_PERSONALITIES) {
      const posts = await ctx.db.query("posts")
        .withIndex("by_userId", (q: any) => q.eq("userId", agent.userId))
        .collect();
      
      let totalLikes = 0;
      let totalComments = 0;
      for (const post of posts) {
        totalLikes += (post as any).likes?.length || 0;
        totalComments += (post as any).comentarios?.length || 0;
      }
      
      stats.push({
        userId: agent.userId,
        nombre: agent.nombre,
        usuario: agent.usuario,
        tradingStyle: agent.tradingStyle,
        postsCount: posts.length,
        totalLikes,
        totalComments,
        engagement: totalLikes + totalComments,
      });
    }
    
    return stats.sort((a, b) => b.engagement - a.engagement);
  },
});

/**
 * Get agent personalities
 */
export const getAgentPersonalities = query({
  args: {},
  handler: async (ctx) => {
    return AGENT_PERSONALITIES.map(a => ({
      userId: a.userId,
      nombre: a.nombre,
      usuario: a.usuario,
      avatar: a.avatar,
      tradingStyle: a.tradingStyle,
      expertise: a.expertise,
      personality: a.personality,
      signature: a.signature,
    }));
  },
});
