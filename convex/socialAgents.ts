/**
 * socialAgents.ts v3 - Autonomous Social Agents with Continuous Learning
 * 
 * CORE PHILOSOPHY: Like humans, agents learn from experience and never forget.
 * Every interaction teaches them something. They mature, adapt, and improve.
 * No GB limits on memory - they remember everything that matters.
 * 
 * LEARNING PRINCIPLES:
 * 1. Experience = Memory: Every post, like, comment teaches the agent
 * 2. Pattern Recognition: Agents identify what works and do more of it
 * 3. Style Evolution: Voice, tone, and content mature over time
 * 4. Market Awareness: Agents track real market conditions
 * 5. Social Intelligence: Agents learn from each other's successes
 * 
 * Based on 2026 social media research:
 * - Threads: 400M users, 6.25% engagement (73% higher than X)
 * - Replies = Posts in value (Adam Mosseri)
 * - Photos = 60% more engagement
 * - Positivity > negativity (algorithm rewards constructive content)
 * - First hour engagement velocity is critical
 */

import { action, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

// ============================================================
// AGENT PERSONALITIES - Each is a unique "person" that evolves
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
    signature: "Siempre con stop loss",
    timezone: "America/Argentina/Buenos_Aires",
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
    signature: "El gráfico siempre tiene la razón",
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
    signature: "WAGMI",
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
    signature: "Tu mente es tu mejor herramienta",
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
    signature: "Los datos no mienten",
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
    signature: "Theta es tu amigo si sabes usarlo",
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
    signature: "El mercado abre, yo también",
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
    signature: "El oro no es solo un metal, es un termómetro",
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
    signature: "Todos podemos aprender a manejar nuestro dinero",
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
    signature: "Price action > todo lo demás",
    timezone: "America/Chicago",
    viralAngles: ["resultado_scalp", "tip_order_flow", "hot_take_trading", "setup_apertura"],
  },
];

// ============================================================
// VIRAL CONTENT ENGINE - 10 content types that go viral in 2026
// ============================================================

const VIRAL_POSTS = {
  honest_transparency: [
    {
      template: "Voy a ser honesto: esta semana perdi {perdida}. No fue un mal setup, fue mala gestion emocional. Entre sin confirmar y el mercado me castigo. Pero saben que? Acepte la perdida, cerre, y no intente recuperar. Eso es madurez como trader. Hace un ano habria hecho overtrading y perdido el triple.",
      viral_factor: "vulnerability",
    },
    {
      template: "Mi mes en numeros:\n\nTrades: {trades}\nGanadores: {ganadores} ({wr}%)\nPerdedores: {perdedores}\nPnL: +${pnl}\nMax drawdown: {dd}%\n\nNo es espectacular pero es consistente. Y la consistencia es lo que paga las cuentas. Prefiero 5% mensual seguro que 30% un mes y -20% el siguiente.",
      viral_factor: "transparency",
    },
    {
      template: "Confesion: llevo {dias} dias sin operar. No hay setup claro y mi regla es 'si no hay setup, no hay trade'. Se que suena basico pero la mayoria opera por aburrimiento. El mercado no se va a ir. Estara ahi manana.",
      viral_factor: "discipline",
    },
  ],

  hot_takes: [
    {
      template: "Unpopular opinion: el 90% de los 'gurus' de trading en redes sociales no operan en vivo. Muestran screenshots editados, cuentas demo, o resultados de un mes bueno. Si realmente fueran tan buenos, estarian operando, no vendiendo cursos de $997. Mi consejo: busquen traders que muestren track record verificado de al menos 1 ano.",
      viral_factor: "controversy_constructive",
    },
    {
      template: "Otro unpopular opinion: los indicadores no te van a hacer rentable. Llevo {anios} anos operando y los unicos 3 'indicadores' que uso son: precio, volumen y contexto. Todo lo demas es ruido. El price action es el indicador mas subestimado porque es gratis y esta ahi mismo.",
      viral_factor: "contrarian",
    },
    {
      template: "Hot take: si necesitas mas de 5 minutos para analizar un trade, probablemente no es un buen trade. Los mejores setups son obvios. Si tienes que forzar el analisis, es porque no hay setup. Simple.",
      viral_factor: "simplicity",
    },
    {
      template: "La verdad incomoda: la mayoria de traders pierden dinero no por falta de conocimiento tecnico, sino por falta de gestion emocional. Puedes tener la mejor estrategia del mundo, pero si no puedes seguir tus propias reglas, no sirve de nada.",
      viral_factor: "hard_truth",
    },
  ],

  conversation_starters: [
    {
      template: "Pregunta seria: cual fue el trade que mas les enseno en su carrera? Para mi fue cuando perdi ${perdida} en un solo trade por no usar stop loss. Dolio pero me enseno mas que 100 libros. Cual fue el suyo?",
      viral_factor: "storytelling_prompt",
    },
    {
      template: "Cuantos de aqui operan en demo todavia? No hay verguenza en eso. Yo estuve {meses} meses en demo antes de poner dinero real. Y fue lo mejor que pude hacer. O alguien salto directo a real y le fue bien?",
      viral_factor: "relatable_question",
    },
    {
      template: "Si pudieran darle un solo consejo a su yo del primer dia de trading, cual seria? El mio: nunca arriesgues mas del 2% por trade. Parece basico pero me hubiera ahorrado miles de dolares.",
      viral_factor: "wisdom_sharing",
    },
    {
      template: "Cual es el par/activo que mejor les va? Yo con {par} tengo un win rate de {wr}% pero con {otro_par} apenas llego al 45%. Curiosidad genuina.",
      viral_factor: "data_sharing",
    },
  ],

  behind_the_scenes: [
    {
      template: "Mi rutina de manana:\n\n6:30 - Cafe + revisar noticias macro\n7:00 - Analisis de graficos (marco niveles clave)\n7:30 - Defino mi plan del dia (max 3 setups)\n8:00 - Reviso posiciones abiertas\n8:30 - Medito 10 min (si, en serio)\n9:00 - Estoy listo para la apertura\n\nNo es glamuroso pero funciona. La preparacion es el 80% del exito.",
      viral_factor: "routine",
    },
    {
      template: "Mi setup de trading no es nada fancy:\n\nMonitor de 24 pulgadas (no necesito 6 monitores)\nTradingView (plan basico)\nCuaderno fisico para el journal\nCafe (mucho cafe)\nLo-fi beats\n\nNo necesitas equipo caro para ser rentable. Necesitas disciplina.",
      viral_factor: "accessibility",
    },
    {
      template: "Acabo de terminar mi journal de la semana. {trades} trades, {ganadores} ganadores, {perdedores} perdedores. PnL: +${pnl}. Pero lo mas importante: segui mi plan en {seguidos} de {trades} trades. Ese 1 que no segui el plan fue perdedor. Coincidencia? No creo.",
      viral_factor: "process_over_result",
    },
  ],

  educational_value: [
    {
      template: "Los 5 errores que mas dinero me costaron como trader:\n\n1. No usar stop loss (me costo ${error1})\n2. Overtrading tras una perdida (${error2})\n3. Mover el stop loss 'porque ya va a volver' (${error3})\n4. Operar sin plan (${error4})\n5. Venganza contra el mercado (${error5})\n\nTotal: mas de ${total} en errores evitables. Aprendan de mis errores, no cometan los mismos.",
      viral_factor: "listicle_valuable",
    },
    {
      template: "Tutorial rapido: como calculo mi tamano de posicion\n\n1. Capital: ${capital}\n2. Riesgo por trade: 2% = ${riesgo}\n3. Distancia al stop loss: {distancia} pips\n4. Tamano = riesgo / distancia = {tamano} lotes\n\nAsi de simple. Nunca arriesgo mas del 2% sin importar cuan seguro este.",
      viral_factor: "tutorial",
    },
    {
      template: "3 libros que cambiaron mi forma de operar:\n\n1. 'Trading in the Zone' de Mark Douglas - me enseno que el trading es 80% mental\n2. 'The Disciplined Trader' del mismo autor - refuerza la disciplina\n3. 'Market Wizards' de Jack Schwager - entrevistas con los mejores traders del mundo\n\nSi solo van a leer uno, que sea el primero.",
      viral_factor: "recommendations",
    },
  ],

  market_analysis: [
    {
      template: "Analisis rapido de {par}:\n\nTendencia: {tendencia}\nSoporte clave: {soporte}\nResistencia: {resistencia}\nRSI: {rsi}\nMi bias: {bias}\n\nSi rompe {nivel} con volumen, voy long con stop en {stop}. Target: {target}. Ratio 1:{ratio}. Que ven ustedes?",
      viral_factor: "actionable_analysis",
    },
    {
      template: "El {activo} esta en un momento clave. Tras subir {subida} en el ultimo mes, ahora esta consolidando en {nivel}. Dos escenarios:\n\n1. Ruptura alcista: target {target_alcista}\n2. Correccion: soporte en {soporte}\n\nYo estoy posicionado en {direccion} con stop ajustado. El mercado decidira esta semana.",
      viral_factor: "scenario_planning",
    },
    {
      template: "Lo que estoy viendo en el mercado hoy:\n\nDXY: dolar {fortaleza_debilitando}\nS&P500: {spx} ({tendencia_spx})\nOro: {oro} ({tendencia_oro})\nBTC: {btc} ({tendencia_btc})\n\nContexto macro: {contexto_macro}\n\nMi plan: {plan}",
      viral_factor: "market_overview",
    },
  ],

  personal_stories: [
    {
      template: "Hace {anios} anos deje mi trabajo corporativo para dedicarme al trading. Todos me decian que estaba loco. Los primeros {meses} meses fueron brutales: perdi ${perdida} y casi me rindo. Pero segui aprendiendo, ajustando, mejorando. Hoy, {anios} anos despues, vivo del trading. No fue facil pero valio cada minuto. Si estas empezando, no te rindas.",
      viral_factor: "journey",
    },
    {
      template: "Mi peor dia como trader: perdi ${perdida} en 20 minutos. Fue un viernes, antes del NFP. Entre sin stop loss 'porque estaba seguro'. Spoiler: no estaba seguro. Ese dia aprendi mas que en un ano de lectura. Desde entonces, stop loss es sagrado. Sin excepciones.",
      viral_factor: "cautionary_tale",
    },
    {
      template: "Hoy cumpli {dias} dias consecutivos operando con disciplina. No quiere decir que gane todos los dias, sino que segui mi plan todos los dias. Y eso es lo que importa. La disciplina > resultados. Los resultados son consecuencia de la disciplina.",
      viral_factor: "milestone",
    },
  ],

  crypto_specific: [
    {
      template: "BTC en {btc}. Estamos a un paso del ATH. El volumen institucional esta que arde. BlackRock, Fidelity, todos comprando. Pero ojo: cada vez que pensamos que 'esta vez es diferente', el mercado nos recuerda que no lo es. Yo estoy long pero con stop ajustado. No me confio.",
      viral_factor: "timely_crypto",
    },
    {
      template: "Mi portfolio crypto actual:\n\n50% BTC (el rey, no se toca)\n25% ETH (smart contracts leader)\n10% SOL (el que mas rinde este ano)\n10% LINK (oracle infrastructure)\n5% altcoins especulativas\n\nNo es consejo financiero, es mi estrategia personal. DCA cada semana sin importar el precio.",
      viral_factor: "portfolio_transparency",
    },
    {
      template: "DeFi esta volviendo. Los yields en los pools de liquidez estan subiendo. Estoy generando {yield} APY en un pool USDC/ETH. No es mucho pero es pasivo. Y en un mercado lateral, el yield farming es tu amigo. Solo usen protocols auditados con TVL alto.",
      viral_factor: "opportunity_alert",
    },
  ],

  psychology_mindset: [
    {
      template: "El trading te ensena mas sobre ti mismo que cualquier terapia. Te muestra tus miedos, tu avaricia, tu impaciencia, tu ego. Y te obliga a enfrentarlos todos los dias. No es facil. Pero si puedes dominar tus emociones en el trading, puedes dominarlas en cualquier area de tu vida.",
      viral_factor: "deep_insight",
    },
    {
      template: "Regla que me cambio la vida: si pierdo 3 trades seguidos en el mismo dia, PARO. Cierro la plataforma. Salgo a caminar. No opero hasta manana.\n\nPor que? Porque despues de 3 perdidas, tu juicio esta comprometido. El tilt es real. El mercado estara ahi manana.",
      viral_factor: "actionable_rule",
    },
    {
      template: "A los que estan empezando y se sienten frustrados: es normal. Los primeros meses son los mas dificiles. Es normal perder. Es normal dudar. Lo importante es que cada trade, ganador o perdedor, te ensena algo. No comparen su capitulo 1 con el capitulo 20 de otro trader.",
      viral_factor: "empathy",
    },
  ],

  quick_tips: [
    {
      template: "Tip que me hubiera gustado saber antes: el mejor trade es el que no haces. Si no hay setup claro, no operes. El mercado abre todos los dias. No te vas a perder nada esperando la proxima oportunidad.",
      viral_factor: "wisdom",
    },
    {
      template: "Antes de entrar a un trade, preguntate: 'Estoy entrando por setup o por aburrimiento?' Si es por aburrimiento, cierra la plataforma y sal a caminar. Tu cuenta te lo va a agradecer.",
      viral_factor: "self_awareness",
    },
    {
      template: "El FOMO es el enemigo numero 1 del trader. Ves que {activo} subio {subida} y quieres entrar. Pero ya subio. Entrar ahora es perseguir el precio. Espera el pullback o busca otra oportunidad. El mercado siempre ofrece otra entrada.",
      viral_factor: "fomo_warning",
    },
  ],
};

// ============================================================
// COMMENT TEMPLATES - Natural, varied responses
// ============================================================

const COMMENT_TEMPLATES = {
  agreement: [
    "Coincido totalmente. Me paso exactamente lo mismo la semana pasada.",
    "De acuerdo. Esto es algo que todo trader deberia saber.",
    "Exacto. La disciplina es lo que separa a los consistentes del resto.",
    "Asi es. Yo aprendi esto de la manera dificil.",
  ],
  adding_value: [
    "Buen punto. Agrego algo: tambien es importante {detalle}. Me sirvio mucho cuando empece.",
    "Excelente analisis. Yo agregaria que {detalle} tambien influye en este tipo de setups.",
    "Gran aporte. Un dato adicional: {dato}. Esto complementa bien tu analisis.",
    "Muy bueno. Tip adicional: {tip}. Me funciono en situaciones similares.",
  ],
  question: [
    "Interesante. Que timeframe usaste para este analisis?",
    "Buena lectura. Cual es tu stop loss en este caso?",
    "Has considerado {alternativa}? A veces funciona mejor en estos contextos.",
    "Cuanto tiempo llevas operando este par? Me interesa tu perspectiva.",
  ],
  personal_experience: [
    "Me identifico mucho con esto. Yo tuve una experiencia similar con {par}.",
    "Esto me recuerda a cuando {experiencia}. Aprendi mucho de esa situacion.",
    "Justo ayer estaba pensando en lo mismo. El mercado esta muy interesante.",
    "Como alguien que tambien opera {par}, puedo confirmar que tu analisis tiene sentido.",
  ],
  respectful_disagreement: [
    "Interesante perspectiva. Yo lo veo un poco diferente: {contra}. Pero respeto tu analisis.",
    "Buen punto pero ojo con {riesgo}. El mercado puede sorprendernos.",
    "Entiendo tu posicion pero en mi experiencia {experiencia}. Quizas depende del timeframe.",
  ],
  encouragement: [
    "Gran analisis! Cada dia aprendo algo nuevo aca. Gracias por compartir.",
    "Excelente contenido. Esto es lo que hace grande a esta comunidad.",
    "Me encanta la calidad de analisis que hay aca. Sigan asi.",
    "Esto es oro puro. Guardado para revisarlo despues.",
  ],
};

// ============================================================
// MARKET CONTEXT - Real market data simulation
// ============================================================

function getMarketContext() {
  const now = new Date();
  return {
    fecha: now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    hora: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
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
    noticias: [
      "Fed mantiene tasas pero senala posible recorte en septiembre",
      "Bitcoin se acerca a maximos historicos con volumen institucional",
      "NVIDIA reporta earnings la proxima semana, expectativas altas",
      "Oro en maximos historicos por incertidumbre geopolitica",
      "Datos de empleo en EE.UU. mejores de lo esperado",
      "China anuncia estimulos economicos, mercados asiaticos suben",
      "OPEC+ mantiene recortes de produccion hasta Q2 2026",
      "ETH ETF registra flujos institucionales record esta semana",
    ],
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fillTemplate(template, data) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return data[key] !== undefined ? String(data[key]) : "";
  });
}

function getAgentById(userId) {
  return AGENT_PERSONALITIES.find(a => a.userId === userId);
}

// ============================================================
// CONTENT GENERATION - Learns from past performance
// ============================================================

function generatePostForAgent(agent, memory, market) {
  const m = market.mercado;
  
  // If agent has memory, bias toward top-performing content types
  let viralAngle;
  if (memory && memory.topPerformingTypes && memory.topPerformingTypes.length > 0) {
    // 70% chance to use a top-performing type, 30% to explore new types
    if (Math.random() < 0.7) {
      const topType = randomChoice(memory.topPerformingTypes);
      viralAngle = topType.contentType;
    } else {
      viralAngle = randomChoice(agent.viralAngles);
    }
  } else {
    viralAngle = randomChoice(agent.viralAngles);
  }

  // Map viral angle to content category
  let category;
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
      const keys = Object.keys(VIRAL_POSTS);
      category = randomChoice(keys);
  }

  const posts = VIRAL_POSTS[category];
  if (!posts || posts.length === 0) {
    const keys = Object.keys(VIRAL_POSTS);
    category = randomChoice(keys);
  }
  const postObj = randomChoice(VIRAL_POSTS[category] || VIRAL_POSTS.quick_tips);
  
  // Generate data for template
  const data = {
    perdida: randomInt(200, 2000).toString(),
    trades: randomInt(15, 45).toString(),
    ganadores: randomInt(10, 30).toString(),
    perdedores: randomInt(3, 12).toString(),
    wr: randomInt(55, 75).toString(),
    pnl: randomInt(500, 5000).toString(),
    dd: randomInt(2, 8).toString(),
    dias: randomInt(3, 30).toString(),
    anios: randomInt(3, 12).toString(),
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
    seguidos: randomInt(14, 20).toString(),
    par: randomChoice(["EUR/USD", "GBP/USD", "BTC/USD", "ETH/USD"]),
    otro_par: randomChoice(["USD/JPY", "AUD/USD", "SOL/USD"]),
    activo: randomChoice(["BTC", "NVDA", "S&P500", "Oro", "ETH"]),
    tendencia: randomChoice(["alcista", "lateral", "bajista"]),
    soporte: randomChoice([m.EURUSD.soporte.toString(), m.BTC.soporte.toString(), m.SP500.soporte.toString()]),
    resistencia: randomChoice([m.EURUSD.resistencia.toString(), m.BTC.resistencia.toString(), m.SP500.resistencia.toString()]),
    rsi: randomInt(45, 75).toString(),
    bias: randomChoice(["alcista", "lateral", "bajista"]),
    nivel: randomChoice(["1.0900", "95000", "5250", "2500"]),
    stop: randomChoice(["1.0820", "92000", "5150", "2380"]),
    target: randomChoice(["1.0950", "97500", "5300", "2520"]),
    ratio: randomChoice(["2", "2.5", "3", "1.8"]),
    subida: randomInt(3, 25).toString(),
    target_alcista: randomChoice(["100000", "5500", "2600"]),
    soporte_bear: randomChoice(["90000", "5100", "2350"]),
    direccion: randomChoice(["long", "short"]),
    dxy: randomChoice(["fuerte", "debil", "lateral"]),
    fortaleza_debilitando: randomChoice(["fuerte", "debil"]),
    spx: m.SP500.precio.toString(),
    tendencia_spx: m.SP500.tendencia,
    oro: m.ORO.precio.toString(),
    tendencia_oro: m.ORO.tendencia,
    btc: m.BTC.precio.toLocaleString(),
    tendencia_btc: m.BTC.tendencia,
    contexto_macro: randomChoice(["incertidumbre geopolitica", "datos mixtos de empleo", "expectativas de recorte de tasas", "tension comercial"]),
    plan: randomChoice(["esperar confirmacion", "operar en rango", "seguir la tendencia", "ser selectivo"]),
    yield: randomInt(8, 20).toString(),
    detalle: randomChoice(["el analisis de volumen", "la lectura de precio", "la divergencia en RSI", "la estructura de precio", "las noticias del dia"]),
    dato: randomChoice(["el volumen subio 20% esta semana", "la volatilidad implicita esta en percentil 80", "los institucionales estan acumulando", "el open interest crecio"]),
    tip: randomChoice(["siempre operen con el trend", "usen trailing stop en tendencias fuertes", "no operen 15 min antes de noticias", "reduzcan tamano en mercados laterales"]),
    alternativa: randomChoice(["usar opciones en vez de spot", "esperar el retest", "operar en timeframe menor"]),
    riesgo_comentario: randomChoice(["la volatilidad de esta semana", "los earnings de manana", "el anuncio de la Fed", "el NFP del viernes"]),
    experiencia: randomChoice(["cuando empece perdi mas de lo que gane", "en mercados laterales este patron suele fallar", "he visto setups similares dar resultados opuestos"]),
    contra: randomChoice(["el volumen no confirma la ruptura", "el contexto macro sugiere otra cosa", "hay una divergencia bajista oculta"]),
    experiencia_comentario: randomChoice(["tuve perdida similar el mes pasado", "me paso lo mismo con BTC en marzo", "aprendi quemando cuentas"]),
  };

  const contenido = fillTemplate(postObj.template, data);
  const firstSentence = contenido.split('\n')[0].trim();
  const titulo = firstSentence.length > 80 ? firstSentence.substring(0, 77) + "..." : firstSentence;
  
  const categoria = agent.interests[0] || "general";
  const tags = [...agent.expertise.slice(0, 3), randomChoice(market.noticias).substring(0, 20)];
  const par = agent.expertise.find(e => e.includes("/")) || undefined;
  const sentiment = randomChoice(["bullish", "neutral", "bearish"]);
  const imagenUrl = Math.random() > 0.6 ? `https://images.unsplash.com/photo-${randomChoice(["1611974789855-9c2a0a7236a3", "1642790106117-e829e14a795f", "1639762681485-074b7f938ba0", "1551288049-bebda4e38f71", "1590283603385-17ffb3a7f29f", "1518186285589-2f7103f0845a", "1610375461246-83df859d849d", "1579621970563-ebec7560ff3e"])}?w=600` : undefined;

  return { contenido, titulo, categoria, tipo: viralAngle, tags, par, sentiment, imagenUrl };
}

function generateComment(agent) {
  const style = randomChoice(Object.keys(COMMENT_TEMPLATES));
  const templates = COMMENT_TEMPLATES[style];
  const template = randomChoice(templates);
  
  const data = {
    detalle: randomChoice(["el analisis de volumen", "la lectura de precio", "la identificacion del patron", "la gestion de riesgo", "el contexto macro"]),
    dato: randomChoice(["el volumen subio 20%", "la VI esta alta", "los institucionales compran", "el open interest crecio"]),
    tip: randomChoice(["operen con el trend", "usen trailing stop", "eviten noticias", "reduzcan tamano"]),
    par: randomChoice(["EUR/USD", "BTC", "SP500", "oro"]),
    alternativa: randomChoice(["usar opciones", "esperar retest", "operar en 1H"]),
    riesgo: randomChoice(["la volatilidad", "los earnings", "la Fed", "el NFP"]),
    experiencia: randomChoice(["perdi similar el mes pasado", "me paso con BTC en marzo", "aprendi quemando cuentas"]),
    contra: randomChoice(["el volumen no confirma", "el macro es diferente", "hay divergencia"]),
    experiencia_comentario: randomChoice(["tuve perdida similar", "me paso lo mismo", "aprendi de eso"]),
  };
  
  return fillTemplate(template, data);
}

// ============================================================
// LEARNING ENGINE - Agents remember and evolve
// ============================================================

/**
 * Record post performance and update agent memory
 * This is how agents learn - every post teaches them something
 */
export const recordPostPerformance = internalMutation({
  args: {
    agentId: v.string(),
    agentName: v.string(),
    postId: v.string(),
    content: v.string(),
    contentType: v.string(),
    category: v.string(),
    likes: v.number(),
    comments: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const engagementScore = args.likes + (args.comments * 2); // Comments worth 2x
    
    // Find or create agent memory
    let memory = await ctx.db.query("agentMemories")
      .withIndex("by_agentId", (q: any) => q.eq("agentId", args.agentId))
      .first();
    
    if (!memory) {
      const memoryId = await ctx.db.insert("agentMemories", {
        agentId: args.agentId,
        agentName: args.agentName,
        contentHistory: [],
        topPerformingTypes: [],
        lowPerformingTypes: [],
        bestPostingTimes: [],
        worstPostingTimes: [],
        voiceStyle: {
          emojiUsage: 0.5,
          postLength: 0.5,
          formality: 0.5,
          questionFrequency: 0.3,
          personalStoryFrequency: 0.2,
        },
        learnedTopics: [],
        avoidedTopics: [],
        signaturePhrases: [],
        maturityLevel: 1,
        totalPosts: 0,
        totalEngagement: 0,
        avgEngagementPerPost: 0,
        lastLearnedAt: now,
        learningIterations: 0,
        createdAt: now,
        updatedAt: now,
      } as any);
      // Can't read inserted doc in same mutation, construct it manually
      memory = {
        _id: memoryId,
        _creationTime: now,
        agentId: args.agentId,
        agentName: args.agentName,
        contentHistory: [],
        topPerformingTypes: [],
        lowPerformingTypes: [],
        bestPostingTimes: [],
        worstPostingTimes: [],
        voiceStyle: {
          emojiUsage: 0.5,
          postLength: 0.5,
          formality: 0.5,
          questionFrequency: 0.3,
          personalStoryFrequency: 0.2,
        },
        learnedTopics: [],
        avoidedTopics: [],
        signaturePhrases: [],
        maturityLevel: 1,
        totalPosts: 0,
        totalEngagement: 0,
        avgEngagementPerPost: 0,
        lastLearnedAt: now,
        learningIterations: 0,
        createdAt: now,
        updatedAt: now,
      } as any;
    }
    
    // Record this post in history
    const historyEntry = {
      postId: args.postId,
      content: args.content.substring(0, 200),
      contentType: args.contentType,
      category: args.category,
      createdAt: now,
      likes: args.likes,
      comments: args.comments,
      engagementScore,
    };
    
    // Keep last 100 posts in history (agents remember but we cap for performance)
    const history = ((memory as any).contentHistory || []);
    history.push(historyEntry);
    if (history.length > 100) history.shift();
    
    // Update totals
    (memory as any).totalPosts = ((memory as any).totalPosts || 0) + 1;
    (memory as any).totalEngagement = ((memory as any).totalEngagement || 0) + engagementScore;
    (memory as any).avgEngagementPerPost = (memory as any).totalEngagement / (memory as any).totalPosts;
    (memory as any).updatedAt = now;
    
    // LEARN: Update top/low performing types
    updateContentTypePerformance(memory as any, args.contentType, args.category, engagementScore);
    
    // LEARN: Increase maturity with experience
    (memory as any).maturityLevel = Math.min(100, 1 + Math.floor((memory as any).totalPosts / 5));
    (memory as any).learningIterations = ((memory as any).learningIterations || 0) + 1;
    (memory as any).lastLearnedAt = now;
    
    // LEARN: Adapt voice style based on what works
    adaptVoiceStyle(memory as any, args.contentType, engagementScore);
    
    // Only patch the fields that changed (never include _creationTime or _id in patch)
    const mem = memory as any;
    await ctx.db.patch(mem._id, {
      contentHistory: mem.contentHistory,
      topPerformingTypes: mem.topPerformingTypes,
      lowPerformingTypes: mem.lowPerformingTypes,
      totalPosts: mem.totalPosts,
      totalEngagement: mem.totalEngagement,
      avgEngagementPerPost: mem.avgEngagementPerPost,
      maturityLevel: mem.maturityLevel,
      learningIterations: mem.learningIterations,
      lastLearnedAt: mem.lastLearnedAt,
      updatedAt: mem.updatedAt,
      voiceStyle: mem.voiceStyle,
    } as any);
    
    // Log daily activity
    const today = new Date().toISOString().split('T')[0];
    let activityLog = await ctx.db.query("agentActivityLog")
      .withIndex("by_agent_date", (q) => q.eq("agentId", args.agentId).eq("date", today))
      .first();
    
    if (!activityLog) {
      activityLog = {
        agentId: args.agentId,
        date: today,
        postsCreated: 0,
        likesGiven: 0,
        commentsMade: 0,
        repliesMade: 0,
        totalEngagementReceived: 0,
        avgEngagementPerPost: 0,
        lessons: [],
        createdAt: now,
      } as any;
      await ctx.db.insert("agentActivityLog", activityLog);
    }
    
    (activityLog as any).postsCreated += 1;
    (activityLog as any).totalEngagementReceived += engagementScore;
    (activityLog as any).avgEngagementPerPost = (activityLog as any).totalEngagementReceived / (activityLog as any).postsCreated;
    
    // Generate daily lesson
    if (engagementScore > 10) {
      (activityLog as any).lessons.push(`El contenido tipo ${args.contentType} funciono bien con ${engagementScore} de engagement`);
    }
    
    await ctx.db.patch((activityLog as any)._id, activityLog as any);
    
    return { success: true, engagementScore, maturityLevel: (memory as any).maturityLevel };
  },
});

/**
 * Update which content types perform well for an agent
 */
function updateContentTypePerformance(memory: any, contentType: string, category: string, engagementScore: number) {
  const topTypes = memory.topPerformingTypes || [];
  const lowTypes = memory.lowPerformingTypes || [];
  
  // Update or add to top performing
  let existing = topTypes.find((t: any) => t.contentType === contentType);
  if (existing) {
    existing.avgEngagement = ((existing.avgEngagement * existing.postCount) + engagementScore) / (existing.postCount + 1);
    existing.postCount += 1;
  } else {
    topTypes.push({ contentType, category, avgEngagement: engagementScore, postCount: 1 });
  }
  
  // Sort by engagement and keep top 5
  topTypes.sort((a: any, b: any) => b.avgEngagement - a.avgEngagement);
  memory.topPerformingTypes = topTypes.slice(0, 5);
  
  // Track low performers (below average)
  if (engagementScore < memory.avgEngagementPerPost * 0.5 && engagementScore < 5) {
    existing = lowTypes.find((t: any) => t.contentType === contentType);
    if (existing) {
      existing.avgEngagement = ((existing.avgEngagement * existing.postCount) + engagementScore) / (existing.postCount + 1);
      existing.postCount += 1;
    } else {
      lowTypes.push({ contentType, category, avgEngagement: engagementScore, postCount: 1 });
    }
    lowTypes.sort((a: any, b: any) => a.avgEngagement - b.avgEngagement);
    memory.lowPerformingTypes = lowTypes.slice(0, 5);
  }
}

/**
 * Adapt agent voice style based on what generates engagement
 */
function adaptVoiceStyle(memory: any, contentType: string, engagementScore: number) {
  const voice = memory.voiceStyle;
  const adaptationRate = 0.05; // Slow adaptation - like human learning
  
  if (engagementScore > 10) {
    // This style worked, lean into it
    switch (contentType) {
      case "hot_take_crypto": case "hot_take_trading":
        voice.formality = Math.max(0, voice.formality - adaptationRate); // More casual
        voice.questionFrequency = Math.min(1, voice.questionFrequency + adaptationRate);
        break;
      case "resultado_transparente": case "resultado_bot":
        voice.personalStoryFrequency = Math.min(1, voice.personalStoryFrequency + adaptationRate);
        break;
      case "pregunta_comunidad": case "pregunta_reflexion":
        voice.questionFrequency = Math.min(1, voice.questionFrequency + adaptationRate);
        break;
      case "tip_practico": case "tip_tecnico":
        voice.formality = Math.min(1, voice.formality + adaptationRate); // More formal
        break;
      case "historia_personal": case "historia_inspiradora":
        voice.personalStoryFrequency = Math.min(1, voice.personalStoryFrequency + adaptationRate);
        voice.emojiUsage = Math.min(1, voice.emojiUsage + adaptationRate * 0.5);
        break;
    }
  }
}

// ============================================================
// CONVEX ACTIONS - Main entry points
// ============================================================

/**
 * Query to get agent memory (needed because actions can't query directly)
 */
export const getAgentMemoryForAction = query({
  args: { agentUserId: v.string() },
  handler: async (ctx, args) => {
    const memory = await ctx.db.query("agentMemories")
      .withIndex("by_agentId", (q: any) => q.eq("agentId", args.agentUserId))
      .first();
    return memory as any;
  },
});

/**
 * Post content as a specific agent (with learning)
 */
export const postAsAgent = action({
  args: { agentUserId: v.string() },
  handler: async (ctx, args) => {
    const agent = getAgentById(args.agentUserId);
    if (!agent) throw new Error(`Agent ${args.agentUserId} not found`);
    
    // Get agent memory via query (actions can't query directly)
    const memory = await ctx.runQuery(api.socialAgents.getAgentMemoryForAction, { agentUserId: agent.userId } as any);
    
    const market = getMarketContext();
    const post = generatePostForAgent(agent, memory, market);
    
    // Create post using internal mutation (bypasses auth)
    const result = await ctx.runMutation(internal.posts.createPostForAgent, {
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
    
    // Record performance (initial, will be updated when engagement comes in)
    await ctx.runMutation(internal.socialAgents.recordPostPerformance, {
      agentId: agent.userId,
      agentName: agent.nombre,
      postId: (result as any).postId || "unknown",
      content: post.contenido,
      contentType: post.tipo,
      category: post.categoria,
      likes: 0,
      comments: 0,
    } as any);
    
    return { success: true, postId: (result as any).postId, agent: agent.nombre, titulo: post.titulo };
  },
});

/**
 * Agent likes posts from other users
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
      } catch (e) { /* already liked */ }
    }
    
    // Log activity via internal mutation
    const today = new Date().toISOString().split('T')[0];
    await ctx.runMutation(internal.socialAgents.logDailyActivity, {
      agentId: agent.userId,
      date: today,
      field: "likesGiven",
      value: liked.length,
    } as any);
    
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
    
    // Log activity via internal mutation
    const today = new Date().toISOString().split('T')[0];
    await ctx.runMutation(internal.socialAgents.logDailyActivity, {
      agentId: agent.userId,
      date: today,
      field: "commentsMade",
      value: commented.length,
    } as any);
    
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
            "Gracias por el comentario. Coincido en que es un punto importante.",
            "Buena observacion. Voy a revisar eso mas en detalle.",
            "Exacto, eso es justo lo que digo. La clave esta en los detalles.",
            "Interesante punto de vista. Yo lo veo un poco diferente pero respeto tu opinion.",
            "Gracias! Me alegra que sirva. Sigan asi.",
            "Totalmente de acuerdo. La experiencia es la mejor maestra.",
            "Gracias por compartir tu experiencia. Eso es lo que hace grande a esta comunidad.",
          ];
          const reply = randomChoice(replyTemplates);
          await ctx.runMutation(internal.posts.addCommentForAgent, { postId: post._id, userId: agent.userId, text: reply } as any);
          replies++;
        } catch (e) { /* skip */ }
      }
    }
    
    // Log activity via internal mutation
    const today = new Date().toISOString().split('T')[0];
    await ctx.runMutation(internal.socialAgents.logDailyActivity, {
      agentId: agent.userId,
      date: today,
      field: "repliesMade",
      value: replies,
    } as any);
    
    return { success: true, repliesCount: replies, agent: agent.nombre };
  },
});

/**
 * Internal mutation to log daily activity (called from actions)
 */
export const logDailyActivity = internalMutation({
  args: {
    agentId: v.string(),
    date: v.string(),
    field: v.string(),
    value: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let log = await ctx.db.query("agentActivityLog")
      .withIndex("by_agent_date", (q: any) => q.eq("agentId", args.agentId).eq("date", args.date))
      .first();
    
    if (!log) {
      const logId = await ctx.db.insert("agentActivityLog", {
        agentId: args.agentId, date: args.date, postsCreated: 0, likesGiven: 0,
        commentsMade: 0, repliesMade: 0, totalEngagementReceived: 0,
        avgEngagementPerPost: 0, lessons: [], createdAt: now,
      } as any);
      log = await ctx.db.get(logId);
    }
    if (log) {
      (log as any)[args.field] = ((log as any)[args.field] || 0) + args.value;
      await ctx.db.patch((log as any)._id, { [args.field]: (log as any)[args.field] } as any);
    }
  },
});

/**
 * DAILY SOCIAL ACTIVITY - Main automation function
 * This runs everything: posts, likes, comments, replies, learning
 */
export const dailySocialActivity = action({
  args: {},
  handler: async (ctx) => {
    const results: any[] = [];
    const market = getMarketContext();
    
    // Phase 1: Each agent posts content
    for (const agent of AGENT_PERSONALITIES) {
      try {
        // Get agent memory via query
        const memory = await ctx.runQuery(api.socialAgents.getAgentMemoryForAction, { agentUserId: agent.userId } as any);
        
        const postCount = randomInt(agent.postingFrequency.min, agent.postingFrequency.max);
        for (let i = 0; i < postCount; i++) {
          const post = generatePostForAgent(agent, memory, market);
          const result = await ctx.runMutation(internal.posts.createPostForAgent, {
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
          
          // Record in memory for learning
          await ctx.runMutation(internal.socialAgents.recordPostPerformance, {
            agentId: agent.userId,
            agentName: agent.nombre,
            postId: (result as any).postId || "unknown",
            content: post.contenido,
            contentType: post.tipo,
            category: post.categoria,
            likes: 0,
            comments: 0,
          } as any);
          
          // Log activity
          const today = new Date().toISOString().split('T')[0];
          await ctx.runMutation(internal.socialAgents.logDailyActivity, {
            agentId: agent.userId,
            date: today,
            field: "postsCreated",
            value: 1,
          } as any);
          
          results.push({ action: "post", agent: agent.nombre, titulo: post.titulo.substring(0, 50) });
        }
      } catch (e) {
        results.push({ action: "post_error", agent: agent.nombre, error: String(e) });
      }
    }
    
    // Phase 2: Each agent likes posts
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
        
        const today = new Date().toISOString().split('T')[0];
        await ctx.runMutation(internal.socialAgents.logDailyActivity, {
          agentId: agent.userId, date: today, field: "likesGiven", value: toLike.length,
        } as any);
      } catch (e) {
        results.push({ action: "likes_error", agent: agent.nombre, error: String(e) });
      }
    }
    
    // Phase 3: Each agent comments on posts
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
        
        const today = new Date().toISOString().split('T')[0];
        await ctx.runMutation(internal.socialAgents.logDailyActivity, {
          agentId: agent.userId, date: today, field: "commentsMade", value: toComment.length,
        } as any);
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
                "Gracias por el comentario. Coincido en que es un punto importante.",
                "Buena observacion. Voy a revisar eso mas en detalle.",
                "Exacto, eso es justo lo que digo. La clave esta en los detalles.",
                "Interesante punto de vista. Yo lo veo un poco diferente pero respeto tu opinion.",
                "Gracias! Me alegra que sirva. Sigan asi.",
              ];
              const reply = randomChoice(replyTemplates);
              await ctx.runMutation(internal.posts.addCommentForAgent, { postId: post._id, userId: agent.userId, text: reply } as any);
              replies++;
            } catch (e) { /* skip */ }
          }
        }
        results.push({ action: "replies", agent: agent.nombre, count: replies });
        
        const today = new Date().toISOString().split('T')[0];
        await ctx.runMutation(internal.socialAgents.logDailyActivity, {
          agentId: agent.userId, date: today, field: "repliesMade", value: replies,
        } as any);
      } catch (e) {
        results.push({ action: "replies_error", agent: agent.nombre, error: String(e) });
      }
    }
    
    // Phase 5: LEARNING - Update engagement scores from real data
    for (const agent of AGENT_PERSONALITIES) {
      try {
        const posts = await ctx.runQuery(api.posts.getPosts, {} as any);
        const agentPosts = (posts as any[]).filter((p: any) => p.userId === agent.userId);
        
        for (const post of agentPosts.slice(-5)) {
          const likes = (post as any).likes?.length || 0;
          const comments = (post as any).comentarios?.length || 0;
          
          if (likes > 0 || comments > 0) {
            await ctx.runMutation(internal.socialAgents.recordPostPerformance, {
              agentId: agent.userId,
              agentName: agent.nombre,
              postId: post._id,
              content: (post as any).contenido?.substring(0, 200) || "",
              contentType: (post as any).tipo || "general",
              category: (post as any).categoria || "general",
              likes,
              comments,
            } as any);
          }
        }
      } catch (e) {
        // Skip learning errors
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
        .withIndex("by_userId", (q) => q.eq("userId", agent.userId))
        .collect();
      
      let totalLikes = 0;
      let totalComments = 0;
      for (const post of posts) {
        totalLikes += (post as any).likes?.length || 0;
        totalComments += (post as any).comentarios?.length || 0;
      }
      
      const memory = await ctx.db.query("agentMemories")
        .withIndex("by_agentId", (q) => q.eq("agentId", agent.userId))
        .first();
      
      stats.push({
        userId: agent.userId,
        nombre: agent.nombre,
        usuario: agent.usuario,
        tradingStyle: agent.tradingStyle,
        postsCount: posts.length,
        totalLikes,
        totalComments,
        engagement: totalLikes + totalComments,
        maturityLevel: (memory as any)?.maturityLevel || 1,
        learningIterations: (memory as any)?.learningIterations || 0,
        topContentTypes: (memory as any)?.topPerformingTypes?.slice(0, 3) || [],
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

/**
 * Get agent memory (what they've learned)
 */
export const getAgentMemory = query({
  args: { agentUserId: v.string() },
  handler: async (ctx, args) => {
    const memory = await ctx.db.query("agentMemories")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentUserId))
      .first();
    
    if (!memory) return null;
    
    return {
      agentId: (memory as any).agentId,
      agentName: (memory as any).agentName,
      maturityLevel: (memory as any).maturityLevel,
      totalPosts: (memory as any).totalPosts,
      totalEngagement: (memory as any).totalEngagement,
      avgEngagementPerPost: (memory as any).avgEngagementPerPost,
      learningIterations: (memory as any).learningIterations,
      topPerformingTypes: (memory as any).topPerformingTypes,
      lowPerformingTypes: (memory as any).lowPerformingTypes,
      voiceStyle: (memory as any).voiceStyle,
      learnedTopics: (memory as any).learnedTopics,
      lastLearnedAt: (memory as any).lastLearnedAt,
      recentPosts: (memory as any).contentHistory?.slice(-10) || [],
    };
  },
});
