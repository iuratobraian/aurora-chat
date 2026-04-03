/**
 * seed-all.mjs — Comprehensive Seed Script for TradeShare
 * Generates realistic content across all surfaces:
 * - 15 user profiles with trading backgrounds
 * - 10 communities with subcommunities
 * - 50+ main feed posts with likes, comments, points
 * - 40+ community posts
 * - 15 trading signals
 * - 20 marketplace products
 * - 10 videos
 * - 10 strategies
 * - Reviews, notifications, QA, resources
 *
 * Run: npx convex run seed:seedAll --push
 */

import { internalMutation } from "./_generated/server";

// ============================================================
// REALISTIC TRADING USER DATA
// ============================================================
const USERS = [
  { userId: "user_carlos_mendoza", nombre: "Carlos Mendoza", usuario: "carlosmendoza", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos", biografia: "Trader profesional de Forex. 8 años de experiencia. Especialista en EUR/USD y GBP/USD.", esPro: true, esVerificado: true, rol: "Pro Trader", role: 3, xp: 12500, level: 15, email: "carlos@tradeshare.com", seguidores: 342, siguiendo: 89, aportes: 156, accuracy: 78.5, reputation: 4.8, saldo: 2500, fechaRegistro: "2025-06-15", streakDays: 45, avatarFrame: "gold" },
  { userId: "user_maria_garcia", nombre: "María García", usuario: "mariagarcia", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria", biografia: "Analista técnica certificada. Mentora de trading. Enseño a leer el mercado.", esPro: true, esVerificado: true, rol: "Analista Senior", role: 3, xp: 9800, level: 12, email: "maria@tradeshare.com", seguidores: 567, siguiendo: 120, aportes: 203, accuracy: 82.3, reputation: 4.9, saldo: 3200, fechaRegistro: "2025-05-20", streakDays: 60, avatarFrame: "diamond" },
  { userId: "user_diego_lopez", nombre: "Diego López", usuario: "diegolopez", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=diego", biografia: "Scalper de criptomonedas. BTC y ETH son mi vida. Riesgo controlado siempre.", esPro: false, esVerificado: true, rol: "Crypto Trader", role: 2, xp: 6700, level: 9, email: "diego@tradeshare.com", seguidores: 189, siguiendo: 67, aportes: 89, accuracy: 71.2, reputation: 4.5, saldo: 800, fechaRegistro: "2025-08-10", streakDays: 30, avatarFrame: "silver" },
  { userId: "user_ana_rodriguez", nombre: "Ana Rodríguez", usuario: "anarodriguez", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana", biografia: "Psicóloga del trading. Ayudo a traders a dominar sus emociones. Mindset es todo.", esPro: true, esVerificado: true, rol: "Psicotrading Coach", role: 3, xp: 15200, level: 18, email: "ana@tradeshare.com", seguidores: 890, siguiendo: 45, aportes: 312, accuracy: 0, reputation: 5.0, saldo: 5000, fechaRegistro: "2025-03-01", streakDays: 90, avatarFrame: "platinum" },
  { userId: "user_roberto_sanchez", nombre: "Roberto Sánchez", usuario: "robertosanchez", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=roberto", biografia: "Swing trader de índices. S&P500 y NASDAQ. Análisis fundamental + técnico.", esPro: true, esVerificado: false, rol: "Swing Trader", role: 2, xp: 4500, level: 7, email: "roberto@tradeshare.com", seguidores: 234, siguiendo: 156, aportes: 67, accuracy: 68.9, reputation: 4.3, saldo: 1200, fechaRegistro: "2025-09-05", streakDays: 15, avatarFrame: "bronze" },
  { userId: "user_laura_martinez", nombre: "Laura Martínez", usuario: "lauramartinez", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=laura", biografia: "Day trader de acciones tech. Apple, Tesla, NVIDIA. Momentum trading.", esPro: false, esVerificado: true, rol: "Day Trader", role: 2, xp: 7800, level: 10, email: "laura@tradeshare.com", seguidores: 445, siguiendo: 78, aportes: 134, accuracy: 75.6, reputation: 4.7, saldo: 1800, fechaRegistro: "2025-07-12", streakDays: 22, avatarFrame: "gold" },
  { userId: "user_javier_hernandez", nombre: "Javier Hernández", usuario: "javierhernandez", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=javier", biografia: "Inversor a largo plazo. Value investing + DCA. Paciencia y disciplina.", esPro: false, esVerificado: false, rol: "Inversor", role: 1, xp: 3200, level: 5, email: "javier@tradeshare.com", seguidores: 123, siguiendo: 200, aportes: 45, accuracy: 65.0, reputation: 4.1, saldo: 500, fechaRegistro: "2025-10-20", streakDays: 8, avatarFrame: "" },
  { userId: "user_sofia_torres", nombre: "Sofía Torres", usuario: "sofiatorres", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia", biografia: "Trader de opciones. Estrategias con Greeks. Iron condor y credit spreads.", esPro: true, esVerificado: true, rol: "Options Trader", role: 3, xp: 11000, level: 14, email: "sofia@tradeshare.com", seguidores: 678, siguiendo: 34, aportes: 189, accuracy: 80.1, reputation: 4.8, saldo: 4500, fechaRegistro: "2025-04-18", streakDays: 55, avatarFrame: "diamond" },
  { userId: "user_miguel_rivera", nombre: "Miguel Rivera", usuario: "miguelrivera", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=miguel", biografia: "Algo trader. Bots en Python. Backtesting riguroso. Datos > emociones.", esPro: true, esVerificado: true, rol: "Algo Trader", role: 3, xp: 13400, level: 16, email: "miguel@tradeshare.com", seguidores: 512, siguiendo: 56, aportes: 234, accuracy: 84.2, reputation: 4.9, saldo: 6000, fechaRegistro: "2025-02-28", streakDays: 75, avatarFrame: "platinum" },
  { userId: "user_valentina_cruz", nombre: "Valentina Cruz", usuario: "valentinacruz", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=valentina", biografia: "Trader principiante con ganas de aprender. Comparto mi viaje desde cero.", esPro: false, esVerificado: false, rol: "Principiante", role: 1, xp: 1500, level: 3, email: "valentina@tradeshare.com", seguidores: 67, siguiendo: 345, aportes: 23, accuracy: 55.0, reputation: 3.8, saldo: 100, fechaRegistro: "2025-11-15", streakDays: 5, avatarFrame: "" },
  { userId: "user_andres_morales", nombre: "Andrés Morales", usuario: "andresmorales", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=andres", biografia: "Trader de materias primas. Oro, plata, petróleo. Macroeconomía aplicada.", esPro: true, esVerificado: true, rol: "Commodities Trader", role: 3, xp: 8900, level: 11, email: "andres@tradeshare.com", seguidores: 389, siguiendo: 92, aportes: 145, accuracy: 76.8, reputation: 4.6, saldo: 2800, fechaRegistro: "2025-06-30", streakDays: 38, avatarFrame: "gold" },
  { userId: "user_camila_flores", nombre: "Camila Flores", usuario: "camilaflores", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=camila", biografia: "Educadora financiera. Creando contenido para que todos aprendan a invertir.", esPro: false, esVerificado: true, rol: "Educadora", role: 2, xp: 5600, level: 8, email: "camila@tradeshare.com", seguidores: 1200, siguiendo: 150, aportes: 278, accuracy: 0, reputation: 4.7, saldo: 900, fechaRegistro: "2025-08-25", streakDays: 42, avatarFrame: "silver" },
  { userId: "user_felipe_castro", nombre: "Felipe Castro", usuario: "felipecastro", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=felipe", biografia: "Trader de futuros. E-mini S&P y Nasdaq. Price action puro.", esPro: true, esVerificado: false, rol: "Futures Trader", role: 2, xp: 7200, level: 10, email: "felipe@tradeshare.com", seguidores: 267, siguiendo: 88, aportes: 98, accuracy: 73.4, reputation: 4.4, saldo: 3500, fechaRegistro: "2025-07-08", streakDays: 28, avatarFrame: "gold" },
  { userId: "user_isabella_reyes", nombre: "Isabella Reyes", usuario: "isabellareyes", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=isabella", biografia: "Trader de Forex y CFDs. Estrategia de ruptura y retroceso. Gestión de riesgo estricta.", esPro: false, esVerificado: true, rol: "Forex Trader", role: 2, xp: 4100, level: 6, email: "isabella@tradeshare.com", seguidores: 156, siguiendo: 110, aportes: 56, accuracy: 69.5, reputation: 4.2, saldo: 700, fechaRegistro: "2025-09-18", streakDays: 12, avatarFrame: "bronze" },
  { userId: "user_system", nombre: "TradeShare System", usuario: "system", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=system", biografia: "Cuenta oficial del sistema TradeShare", esPro: true, esVerificado: true, rol: "Admin", role: 6, xp: 99999, level: 99, email: "system@tradeshare.com", seguidores: 9999, siguiendo: 0, aportes: 500, accuracy: 0, reputation: 5.0, saldo: 0, fechaRegistro: "2025-01-01", streakDays: 365, avatarFrame: "platinum" },
];

// ============================================================
// COMMUNITIES
// ============================================================
const COMMUNITIES = [
  { ownerId: "user_carlos_mendoza", name: "Forex Masters LATAM", slug: "forex-masters-latam", description: "Comunidad líder de trading Forex en Latinoamérica. Análisis diario de pares principales, señales de alta probabilidad y educación continua.", visibility: "public", accessType: "free", plan: "growth", maxMembers: 5000, currentMembers: 1247, coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800" },
  { ownerId: "user_maria_garcia", name: "Análisis Técnico Pro", slug: "analisis-tecnico-pro", description: "Domina el análisis técnico con chartistas profesionales. Patrones, indicadores, ondas de Elliott y más.", visibility: "public", accessType: "free", plan: "growth", maxMembers: 3000, currentMembers: 892, coverImage: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800" },
  { ownerId: "user_diego_lopez", name: "Crypto Trading Hub", slug: "crypto-trading-hub", description: "Todo sobre criptomonedas: Bitcoin, Ethereum, altcoins. DeFi, NFTs y el futuro de las finanzas.", visibility: "public", accessType: "free", plan: "starter", maxMembers: 10000, currentMembers: 3456, coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800" },
  { ownerId: "user_ana_rodriguez", name: "Psicotrading & Mindset", slug: "psicotrading-mindset", description: "El 80% del trading es mental. Aprende a controlar emociones, gestionar el riesgo y mantener la disciplina.", visibility: "public", accessType: "paid", priceMonthly: 9.99, plan: "scale", maxMembers: 2000, currentMembers: 567, coverImage: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800" },
  { ownerId: "user_sofia_torres", name: "Opciones & Derivados", slug: "opciones-derivados", description: "Trading de opciones desde básico hasta avanzado. Estrategias con Greeks, spreads y cobertura.", visibility: "public", accessType: "paid", priceMonthly: 14.99, plan: "scale", maxMembers: 1500, currentMembers: 234, coverImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800" },
  { ownerId: "user_miguel_rivera", name: "Algo Trading Lab", slug: "algo-trading-lab", description: "Automatiza tu trading. Bots en Python, backtesting, machine learning aplicado a los mercados.", visibility: "public", accessType: "paid", priceMonthly: 19.99, plan: "enterprise", maxMembers: 1000, currentMembers: 189, coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800" },
  { ownerId: "user_laura_martinez", name: "Day Trading Tech Stocks", slug: "day-trading-tech", description: "Operaciones diarias en acciones tecnológicas. AAPL, TSLA, NVDA, MSFT. Momentum y scalping.", visibility: "public", accessType: "free", plan: "growth", maxMembers: 4000, currentMembers: 1567, coverImage: "https://images.unsplash.com/photo-1518186285589-2f7103f0845a?w=800" },
  { ownerId: "user_andres_morales", name: "Commodities & Macro", slug: "commodities-macro", description: "Oro, plata, petróleo, gas natural. Análisis macroeconómico y su impacto en los mercados.", visibility: "public", accessType: "free", plan: "starter", maxMembers: 3000, currentMembers: 678, coverImage: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800" },
  { ownerId: "user_camila_flores", name: "Educación Financiera", slug: "educacion-financiera", description: "Aprende desde cero. Presupuesto, ahorro, inversión, trading. Educación financiera para todos.", visibility: "public", accessType: "free", plan: "growth", maxMembers: 15000, currentMembers: 5678, coverImage: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800" },
  { ownerId: "user_felipe_castro", name: "Futures & Scalping", slug: "futures-scalping", description: "Trading de futuros E-mini. Scalping de alta frecuencia. Price action y order flow.", visibility: "public", accessType: "paid", priceMonthly: 24.99, plan: "enterprise", maxMembers: 500, currentMembers: 123, coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800" },
];

// ============================================================
// SUBCOMMUNITIES
// ============================================================
const SUBCOMMUNITIES = [
  { parentId: 0, name: "EUR/USD Signals", slug: "eurusd-signals", description: "Señales exclusivas para EUR/USD", type: "signals", visibility: "public" },
  { parentId: 0, name: "GBP/USD Analysis", slug: "gbpusd-analysis", description: "Análisis técnico diario de GBP/USD", type: "analysis", visibility: "public" },
  { parentId: 0, name: "Mentoría Forex", slug: "mentoria-forex", description: "Sesiones de mentoría en vivo", type: "education", visibility: "private" },
  { parentId: 1, name: "Patrones Chartistas", slug: "patrones-chartistas", description: "Identificación de patrones en tiempo real", type: "analysis", visibility: "public" },
  { parentId: 1, name: "Indicadores Custom", slug: "indicadores-custom", description: "Indicadores personalizados para TradingView", type: "tools", visibility: "public" },
  { parentId: 2, name: "DeFi Alpha", slug: "defi-alpha", description: "Oportunidades en DeFi y yield farming", type: "signals", visibility: "public" },
  { parentId: 2, name: "NFT Trading", slug: "nft-trading", description: "Trading de NFTs y colecciones", type: "discussion", visibility: "public" },
  { parentId: 3, name: "Trading Journal", slug: "trading-journal", description: "Diario de trading con revisión semanal", type: "education", visibility: "private" },
  { parentId: 5, name: "Python Bots", slug: "python-bots", description: "Desarrollo de bots en Python", type: "tools", visibility: "public" },
  { parentId: 5, name: "ML Models", slug: "ml-models", description: "Modelos de machine learning para trading", type: "tools", visibility: "public" },
  { parentId: 6, name: "Pre-Market Setup", slug: "pre-market-setup", description: "Preparación antes de la apertura", type: "signals", visibility: "public" },
  { parentId: 6, name: "After Hours", slug: "after-hours", description: "Operaciones en horario extendido", type: "discussion", visibility: "public" },
];

// ============================================================
// MAIN FEED POSTS
// ============================================================
const MAIN_POSTS = [
  { userId: "user_carlos_mendoza", titulo: "EUR/USD: Ruptura alcista confirmada", contenido: "El par EUR/USD ha roto la resistencia clave en 1.0850 con volumen significativo. El objetivo inmediato es 1.0920. Stop loss recomendado en 1.0810. Esta ruptura coincide con el cruce alcista del EMA 50 sobre el EMA 200 en el gráfico de 4H.", categoria: "forex", par: "EURUSD", tipo: "analisis", imagenUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600", tags: ["EURUSD", "forex", "ruptura", "alcista"], sentiment: "bullish" },
  { userId: "user_maria_garcia", titulo: "Patrón HCH invertido en S&P500", contenido: "Se está formando un Hombro-Cabeza-Hombro invertido en el S&P500 en el timeframe diario. La línea de cuello está en 5,200 puntos. Si se confirma la ruptura, el objetivo teórico sería 5,450. Volumen decreciente en la formación, lo que sugiere agotamiento de vendedores.", categoria: "indices", par: "SPX", tipo: "analisis", imagenUrl: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=600", tags: ["SP500", "HCH", "patron", "alcista"], sentiment: "bullish" },
  { userId: "user_diego_lopez", titulo: "BTC rompiendo los $95K - ¿Nuevo ATH?", contenido: "Bitcoin está a punto de romper los $95,000 con un volumen masivo. El RSI en 4H está en 72, todavía no en sobrecompra extrema. Si rompe con fuerza, el siguiente objetivo es $100K psicológico. Ojo con la resistencia en $97,500.", categoria: "crypto", par: "BTCUSD", tipo: "senal", imagenUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600", tags: ["BTC", "bitcoin", "ATH", "crypto"], sentiment: "bullish" },
  { userId: "user_ana_rodriguez", titulo: "5 errores emocionales que destruyen tu cuenta", contenido: "1️⃣ Overtrading tras una pérdida - Quieres recuperar rápido y terminas perdiendo más\n2️⃣ Mover el stop loss - 'Ya va a volver'... y no vuelve\n3️⃣ No tomar ganancias - La avaricia rompe el saco\n4️⃣ Operar por aburrimiento - Si no hay setup, no hay trade\n5️⃣ Venganza contra el mercado - El mercado no te debe nada\n\n¿Cuál de estos has cometido? Sé honesto 👇", categoria: "psicotrading", tipo: "educacion", imagenUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600", tags: ["psicotrading", "emociones", "errores", "educacion"], sentiment: "neutral" },
  { userId: "user_sofia_torres", titulo: "Iron Condor en SPY: Guía paso a paso", contenido: "Setup de Iron Condor en SPY para esta semana:\n- Vencimiento: 7 días\n- Call short: 590 delta 0.15\n- Call long: 595 (protección)\n- Put short: 560 delta 0.15\n- Put long: 555 (protección)\n\nCrédito recibido: $1.80 por contrato\nMáxima ganancia: $180\nMáxima pérdida: $320\nProbabilidad de éxito: ~70%\n\nIdeal para mercados laterales.", categoria: "opciones", tipo: "educacion", tags: ["opciones", "ironcondor", "SPY", "estrategia"], sentiment: "neutral" },
  { userId: "user_miguel_rivera", titulo: "Mi bot de Python lleva 3 meses en positivo", contenido: "Después de 6 meses de backtesting y 3 meses en live trading, mi algoritmo de mean reversion en EUR/USD tiene:\n\n📊 Win Rate: 68.4%\n📈 Profit Factor: 1.87\n📉 Max Drawdown: 4.2%\n💰 Retorno mensual promedio: 3.8%\n🔢 Trades ejecutados: 847\n\nEl secreto: no es un solo indicador, es la combinación de 3 filtros de confirmación + gestión de riesgo dinámica.\n\n¿Alguien quiere que comparta el código?", categoria: "algotrading", tipo: "resultado", imagenUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600", tags: ["python", "bot", "algotrading", "resultados"], sentiment: "bullish" },
  { userId: "user_laura_martinez", titulo: "NVDA pre-earnings: Mi estrategia", contenido: "NVIDIA reporta earnings la próxima semana. Históricamente:\n- Últimos 4 quarters: +8%, +12%, -3%, +15%\n- Volatilidad implícita: 45% (cara)\n\nMi plan:\n1. No operar el día del earnings (demasiado riesgo)\n2. Esperar la reacción inicial (30 min)\n3. Operar en la dirección del momentum post-reacción\n4. Stop tight, target 2:1 mínimo\n\n¿Quién más va a operar NVDA?", categoria: "acciones", par: "NVDA", tipo: "plan", tags: ["NVDA", "earnings", "nvidia", "tech"], sentiment: "bullish" },
  { userId: "user_andres_morales", titulo: "Oro en máximos históricos - ¿Sigue subiendo?", contenido: "El oro acaba de tocar $2,450/oz, nuevo máximo histórico. Los factores que impulsan:\n\n🥇 Incertidumbre geopolítica\n🥇 Política monetaria expansiva\n🥇 Debilitamiento del dólar\n🥇 Compra masiva de bancos centrales\n\nMi análisis: el oro tiene espacio hasta $2,600 si se mantiene por encima de $2,380. El soporte clave está en la media móvil de 50 días.", categoria: "commodities", par: "XAUUSD", tipo: "analisis", imagenUrl: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600", tags: ["oro", "gold", "XAUUSD", "maximos"], sentiment: "bullish" },
  { userId: "user_camila_flores", titulo: "Cómo empecé con $100 y ahora tengo $5,000", contenido: "Mi historia real de trading:\n\n📅 Enero 2025: Abrí cuenta con $100\n📅 Marzo 2025: Primer mes en positivo (+$30)\n📅 Junio 2025: Aprendí gestión de riesgo (+$1,200)\n📅 Septiembre 2025: Encontré mi estrategia (+$3,000)\n📅 Hoy: $5,000 y contando\n\nLa clave: NUNCA arriesgar más del 2% por trade. Paciencia y disciplina. No existe el dinero rápido.\n\nSi estás empezando, no te rindas. Los primeros meses son los más difíciles.", categoria: "motivacion", tipo: "historia", imagenUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600", tags: ["historia", "principiante", "crecimiento", "motivacion"], sentiment: "bullish" },
  { userId: "user_felipe_castro", titulo: "Scalping en ES: 15 puntos en 20 minutos", contenido: "Sesión de esta mañana en E-mini S&P500:\n\n⏰ 9:35 AM - Entrada long en 5,185.50\n⏰ 9:42 AM - Salida parcial en 5,190.00 (+4.5 pts)\n⏰ 9:55 AM - Salida total en 5,200.50 (+15 pts)\n\nSetup: Ruptura del rango de apertura con volumen. Entré en el retest del breakout.\n\nGestión: Moví stop a breakeven tras los primeros 5 puntos. El resto fue gratis.", categoria: "futuros", par: "ES", tipo: "resultado", tags: ["ES", "scalping", "futuros", "resultado"], sentiment: "bullish" },
  { userId: "user_carlos_mendoza", titulo: "GBP/JPY: La bestia se despierta", contenido: "El GBP/JPY (la 'Bestia') está mostrando un patrón de continuación alcista muy claro en 4H. Tras la corrección a 192.50, ha formado una bandera alcista perfecta.\n\nEntrada: 193.80\nStop: 193.20\nTarget 1: 194.50\nTarget 2: 195.20\n\nRatio riesgo/beneficio: 1:2.3 mínimo. Este par suele dar movimientos explosivos después de consolidaciones así.", categoria: "forex", par: "GBPJPY", tipo: "senal", tags: ["GBPJPY", "forex", "senal", "alcista"], sentiment: "bullish" },
  { userId: "user_maria_garcia", titulo: "Los 3 indicadores que realmente uso", contenido: "Después de 10 años probando todo, estos son los ÚNICOS 3 indicadores que tengo en mi gráfico:\n\n1️⃣ EMA 20 y EMA 50 - Tendencia y zonas dinámicas de soporte/resistencia\n2️⃣ RSI (14) - Divergencias y sobrecompra/sobreventa\n3️⃣ Volumen - Confirmación de movimientos\n\nEso es todo. No necesitas 15 indicadores. Price action + volumen + contexto = todo lo que necesitas.\n\nMenos es más en el trading.", categoria: "educacion", tipo: "educacion", tags: ["indicadores", "educacion", "priceaction", "simple"], sentiment: "neutral" },
  { userId: "user_diego_lopez", titulo: "ETH 2.0 staking: Mi experiencia", contenido: "Llevo 8 meses haciendo staking de ETH y estos son los números:\n\n💰 ETH apostados: 16\n📈 APY promedio: 4.2%\n💵 Ganancia en 8 meses: 0.56 ETH (~$1,680)\n⚠️ Riesgo: slashing (muy bajo si usas Lido/RocketPool)\n\nComparado con tener los ETH quietos en un exchange, el staking es dinero gratis. El único riesgo real es que el precio baje, pero eso pasa igual si no haces staking.", categoria: "crypto", par: "ETHUSD", tipo: "educacion", tags: ["ETH", "staking", "crypto", "pasivo"], sentiment: "bullish" },
  { userId: "user_ana_rodriguez", titulo: "Tu peor enemigo eres tú mismo", contenido: "El trading no es contra el mercado. El mercado no sabe que existes.\n\nEl trading es contra ti mismo:\n- Tu miedo a perder\n- Tu avaricia de ganar más\n- Tu impaciencia por entrar\n- Tu terquedad por tener razón\n- Tu ego que no acepta errores\n\nDomina tu mente y dominarás el trading. No al revés.\n\n🧠 La psicología no es un extra, es EL factor principal.", categoria: "psicotrading", tipo: "reflexion", tags: ["psicotrading", "mente", "disciplina", "verdad"], sentiment: "neutral" },
  { userId: "user_roberto_sanchez", titulo: "Mi setup de swing trading semanal", contenido: "Cada domingo hago mi análisis semanal:\n\n📊 Reviso los 10 principales índices\n📊 Identifico tendencias en diario y semanal\n📊 Marco soportes y resistencias clave\n📊 Busco setups con al menos 1:3 R/R\n📊 Planifico entradas para la semana\n\nEsta semana tengo 3 setups en watchlist:\n1. NASDAQ - Pullback a EMA 20\n2. DAX - Ruptura de canal descendente\n3. IBEX 35 - Doble suelo en soporte\n\nPlanificar antes de operar = menos errores.", categoria: "indices", tipo: "plan", tags: ["swing", "plan", "semanal", "indices"], sentiment: "bullish" },
  { userId: "user_valentina_cruz", titulo: "Mi primer mes aprendiendo a hacer trading", contenido: "Hola a todos! Soy nueva en esto y quiero compartir mi experiencia:\n\n📚 Semana 1: Aprendí qué es una vela japonesa\n📚 Semana 2: Descubrí los soportes y resistencias\n📚 Semana 3: Entendí el concepto de riesgo/beneficio\n📚 Semana 4: Abrí cuenta demo y practiqué\n\nPerdí $50 en mi primera operación real 😅 pero aprendí más en ese trade que en 3 semanas de teoría.\n\n¿Algún consejo para una principiante?", categoria: "principiantes", tipo: "historia", tags: ["principiante", "aprendizaje", "demo", "consejos"], sentiment: "neutral" },
  { userId: "user_isabella_reyes", titulo: "Ruptura de USD/JPY tras decisión del BOJ", contenido: "El USD/JPY cayó 200 pips tras la decisión del Banco de Japón de mantener tasas pero con tono hawkish. Esto podría ser el inicio de un cambio de tendencia a largo plazo.\n\nNivel clave a vigilar: 148.00\nSi pierde este nivel, el camino está libre hasta 145.00.\n\nPara los que operan carry trade: ojo con la reversión.", categoria: "forex", par: "USDJPY", tipo: "noticia", tags: ["USDJPY", "BOJ", "forex", "noticia"], sentiment: "bearish" },
  { userId: "user_system", titulo: "🎉 TradeShare alcanza 10,000 usuarios", contenido: "¡Increíble comunidad! Hemos alcanzado los 10,000 usuarios registrados en TradeShare.\n\n📊 Estadísticas:\n- 10,000+ usuarios activos\n- 50,000+ posts compartidos\n- 500,000+ likes dados\n- 100+ comunidades activas\n- 1,000+ señales exitosas\n\nGracias a todos por ser parte de esta comunidad. ¡Vamos por más! 🚀", categoria: "comunidad", tipo: "anuncio", esAnuncio: true, tags: ["milestone", "comunidad", "celebracion"], sentiment: "bullish" },
];

// ============================================================
// COMMUNITY POSTS
// ============================================================
const COMMUNITY_POSTS = {
  "forex-masters-latam": [
    { userId: "user_carlos_mendoza", titulo: "Análisis semanal EUR/USD", contenido: "El EUR/USD sigue en tendencia alcista. Esta semana espero un retroceso a 1.0820 antes de continuar subiendo. Zona de compra ideal.", tipo: "analisis", tags: ["EURUSD", "semanal"] },
    { userId: "user_isabella_reyes", titulo: "Mi trade del día: GBP/USD long", contenido: "Entré long en GBP/USD en 1.2650. Stop en 1.2620, target 1.2720. Ratio 1:2.3. El par está rebotando en un soporte clave de 4H.", tipo: "trade", tags: ["GBPUSD", "long"] },
    { userId: "user_carlos_mendoza", titulo: "Alerta: NFP mañana", contenido: "Mañana viernes se publica el NFP. Recomiendo cerrar posiciones antes del anuncio o reducir el tamaño de lote. La volatilidad puede ser extrema.", tipo: "alerta", tags: ["NFP", "noticia"] },
    { userId: "user_isabella_reyes", titulo: "Configuración de mi gráfico para Forex", contenido: "Comparto mi setup de TradingView:\n- Timeframes: 4H para dirección, 1H para entrada\n- EMA 20, 50, 200\n- RSI 14\n- MACD por defecto\n- Volumen\n\nSimple y efectivo.", tipo: "educacion", tags: ["setup", "tradingview"] },
    { userId: "user_carlos_mendoza", titulo: "Resultado de la semana: +120 pips", contenido: "Semana positiva con 120 pips netos:\n- EUR/USD long: +45 pips\n- GBP/JPY long: +60 pips\n- USD/CAD short: +15 pips\n- 1 trade en breakeven\n\nGestión de riesgo al 1% por trade. Consistencia > home runs.", tipo: "resultado", tags: ["semanal", "resultados"] },
  ],
  "analisis-tecnico-pro": [
    { userId: "user_maria_garcia", titulo: "Divergencia alcista en RSI - NASDAQ", contenido: "El NASDAQ está haciendo mínimos más bajos pero el RSI está haciendo mínimos más altos. Esta divergencia alcista sugiere que el momentum bajista se está agotando.", tipo: "analisis", tags: ["NASDAQ", "RSI", "divergencia"] },
    { userId: "user_maria_garcia", titulo: "Ondas de Elliott en BTC", contenido: "Contando las ondas de Elliott en BTC:\n- Onda 1: $25K a $35K\n- Onda 2: $35K a $28K\n- Onda 3: $28K a $73K\n- Onda 4: $73K a $58K\n- Onda 5: En progreso, target $100K+\n\nEstamos en la onda 5, la última del ciclo alcista.", tipo: "analisis", tags: ["BTC", "elliott", "ondas"] },
    { userId: "user_maria_garcia", titulo: "Fibonacci: La herramienta más subestimada", contenido: "Los niveles de Fibonacci no son magia, son psicología de mercado. Los traders miran los mismos niveles y actúan en consecuencia.\n\nNiveles clave:\n- 38.2%: Retroceso superficial\n- 50%: Punto de equilibrio\n- 61.8%: Golden ratio, el más importante\n- 78.6%: Última oportunidad antes de invalidación", tipo: "educacion", tags: ["fibonacci", "educacion"] },
    { userId: "user_maria_garcia", titulo: "Volumen Profile: Dónde están las manos fuertes", contenido: "El Volume Profile te muestra DÓNDE se ha operado más volumen, no CUÁNDO.\n\nPOC (Point of Control): El nivel con más volumen. Actúa como imán del precio.\n\nValue Area: Donde se operó el 70% del volumen. Fuera de esta zona, el precio tiende a volver.", tipo: "educacion", tags: ["volumen", "profile", "educacion"] },
  ],
  "crypto-trading-hub": [
    { userId: "user_diego_lopez", titulo: "BTC $95K: ¿Es momento de tomar ganancias?", contenido: "Bitcoin está en $95K y muchos se preguntan si es hora de vender. Mi opinión:\n\nSi tu plan era vender en $100K, ESPERA.\nSi ya estás en ganancias y quieres asegurar, VENDE un 30-50%.\nSi entraste ahora, NO entres sin stop loss.\n\nNunca dejes que una ganancia se convierta en pérdida.", tipo: "analisis", tags: ["BTC", "profit", "gestion"] },
    { userId: "user_diego_lopez", titulo: "Altcoins que estoy vigilando", contenido: "Mi watchlist de altcoins para este mes:\n\n🔥 SOL - Solida, ecosystem creciendo\n🔥 AVAX - Subiendo con fuerza\n🔥 LINK - Oracle leader, buen fundamental\n🔥 ARB - L2 con tracción\n🔥 TIA - Modular blockchain narrative\n\nDYOR. Esto no es consejo financiero.", tipo: "watchlist", tags: ["altcoins", "watchlist"] },
    { userId: "user_diego_lopez", titulo: "Mi estrategia de DCA en crypto", contenido: "Compro crypto todos los lunes sin importar el precio:\n- 40% BTC\n- 30% ETH\n- 20% SOL\n- 10% altcoins especulativas\n\nLlevo 18 meses con esta estrategia y mi precio promedio de BTC es $52K. Ahora está a $95K.\n\nDCA > timing the market.", tipo: "educacion", tags: ["DCA", "estrategia", "crypto"] },
    { userId: "user_diego_lopez", titulo: "DeFi yield farming: Riesgos y recompensas", contenido: "Estoy generando 12% APY en un pool USDC/ETH en Uniswap v3.\n\nRiesgos:\n⚠️ Impermanent loss\n⚠️ Smart contract risk\n⚠️ Rug pulls\n\nRecompensas:\n✅ 12% APY + fees\n✅ Composabilidad\n✅ Liquidez\n\nSolo usa protocols auditados y con TVL alto.", tipo: "educacion", tags: ["DeFi", "yield", "farming"] },
  ],
  "psicotrading-mindset": [
    { userId: "user_ana_rodriguez", titulo: "Ejercicio: Diario de emociones", contenido: "Antes de cada trade, escribe:\n1. ¿Cómo me siento ahora? (1-10)\n2. ¿Por qué quiero entrar?\n3. ¿Estoy siguiendo mi plan o es impulso?\n4. ¿Qué pasaría si pierdo?\n\nSi tu respuesta a #3 es 'impulso', NO operes.", tipo: "ejercicio", tags: ["diario", "emociones", "disciplina"] },
    { userId: "user_ana_rodriguez", titulo: "La regla de los 3 trades perdedores", contenido: "Si pierdes 3 trades seguidos en el mismo día:\n\n🛑 PARA. Cierra la plataforma.\n🛑 Sal a caminar.\n🛑 No operes hasta mañana.\n\nEl tilt es real. Después de 3 pérdidas consecutivas, tu juicio está comprometido. El mercado estará ahí mañana.", tipo: "regla", tags: ["tilt", "perdidas", "regla"] },
    { userId: "user_ana_rodriguez", titulo: "Meditación para traders: 5 minutos que cambian todo", contenido: "Antes de abrir tu plataforma:\n\n1. Cierra los ojos (2 min)\n2. Respira profundo 4-7-8 (1 min)\n3. Visualiza tu plan de trading (1 min)\n4. Repite: 'Sigo mi plan sin importar el resultado' (1 min)\n\nEsto reduce la ansiedad pre-trading un 60% según estudios.", tipo: "tecnica", tags: ["meditacion", "preparacion", "mindfulness"] },
    { userId: "user_ana_rodriguez", titulo: "Por qué el 90% de traders pierden dinero", contenido: "No es por falta de conocimiento técnico. Es por:\n\n1. Falta de gestión de riesgo (apuestan demasiado)\n2. No tienen un plan escrito\n3. Operan con emociones, no con lógica\n4. No llevan registro de sus trades\n5. Buscan el 'santo grial' en vez de dominar lo básico\n\nEl trading es simple, no fácil.", tipo: "reflexion", tags: ["estadisticas", "verdad", "realidad"] },
  ],
  "opciones-derivados": [
    { userId: "user_sofia_torres", titulo: "Covered Call: Ingreso pasivo con tus acciones", contenido: "Si tienes 100 acciones de AAPL, puedes vender un call mensual:\n\n- AAPL a $195\n- Vendo call $200 strike, 30 DTE\n- Prima recibida: $2.50 ($250)\n- Si AAPL no sube de $200: te quedas con $250 + acciones\n- Si AAPL sube de $200: vendes a $200 + $250 de prima\n\nRendimiento anualizado: ~15% solo con premiums.", tipo: "educacion", tags: ["coveredcall", "AAPL", "ingreso"] },
    { userId: "user_sofia_torres", titulo: "Griegas explicadas simple", contenido: "Las 4 griegas que necesitas conocer:\n\n📐 Delta: Cuánto cambia la opción por cada $1 del subyacente\n📐 Gamma: Cuánto cambia el delta\n📐 Theta: Cuánto valor pierde la opción por día (time decay)\n📐 Vega: Sensibilidad a la volatilidad implícita\n\nPara vendedores de opciones: Theta es tu amigo.\nPara compradores: Gamma es tu amigo.", tipo: "educacion", tags: ["griegas", "educacion", "opciones"] },
    { userId: "user_sofia_torres", titulo: "Mi trade de la semana: Put Credit Spread en TSLA", contenido: "Setup:\n- TSLA a $245\n- Vendo put $230 strike\n- Compro put $225 strike (protección)\n- Vencimiento: 2 semanas\n- Crédito: $1.20\n\nMax profit: $120\nMax loss: $380\nProbabilidad éxito: ~75%\n\nTSLA tiene que caer un 6% para que pierda.", tipo: "trade", tags: ["TSLA", "putspread", "trade"] },
  ],
  "algo-trading-lab": [
    { userId: "user_miguel_rivera", titulo: "Backtesting: 1000 trades en 5 minutos", contenido: "Mi framework de backtesting en Python:\n\n```python\nimport backtrader as bt\n\nclass MeanReversion(bt.Strategy):\n    def __init__(self):\n        self.sma = bt.ind.SMA(period=20)\n        self.rsi = bt.ind.RSI(period=14)\n    \n    def next(self):\n        if self.rsi < 30 and not self.position:\n            self.buy()\n        elif self.rsi > 70 and self.position:\n            self.sell()\n```\n\nResultados en EUR/USD 2020-2025:\n- Win Rate: 64%\n- Profit Factor: 1.52\n- Max DD: 8.3%", tipo: "codigo", tags: ["python", "backtesting", "meanreversion"] },
    { userId: "user_miguel_rivera", titulo: "Machine Learning para predecir dirección", contenido: "Entrené un modelo XGBoost con 50 features técnicas para predecir la dirección del S&P500 al cierre:\n\n🤖 Accuracy: 58.3% (mejor que random 50%)\n📊 Sharpe Ratio: 1.2\n📈 Retorno anualizado: 18%\n\nNo es perfecto, pero con gestión de riesgo adecuada, es rentable.\n\nEl secreto: no predecir el precio, predecir la dirección.", tipo: "ml", tags: ["ML", "XGBoost", "prediccion"] },
    { userId: "user_miguel_rivera", titulo: "API de Interactive Brokers con Python", contenido: "Tutorial rápido para conectar con IBKR:\n\n```python\nfrom ib_insync import *\n\nib = IB()\nib.connect('127.0.0.1', 7497, clientId=1)\n\n# Obtener datos\ncontract = Stock('AAPL', 'SMART', 'USD')\nbars = ib.reqHistoricalData(contract, '', '1 D', '1 hour', 'TRADES', True)\n\n# Colocar orden\norder = MarketOrder('BUY', 100)\ntrade = ib.placeOrder(contract, order)\n```\n\nSimple y poderoso.", tipo: "tutorial", tags: ["IBKR", "API", "python"] },
  ],
  "day-trading-tech": [
    { userId: "user_laura_martinez", titulo: "AAPL: Gap up y mi plan", contenido: "AAPL abrió con gap up de +2.5% tras los resultados.\n\nMi plan:\n1. Esperar los primeros 15 min (evitar volatilidad inicial)\n2. Si mantiene el gap: long en el pullback al VWAP\n3. Si llena el gap: esperar reversión\n4. Stop siempre debajo del mínimo de los primeros 15 min\n\nNo persigas el gap, espera el setup.", tipo: "plan", tags: ["AAPL", "gap", "plan"] },
    { userId: "user_laura_martinez", titulo: "Mi rutina de pre-market", contenido: "6:30 AM - Reviso futuros y noticias\n7:00 AM - Marco niveles clave en mis 5 stocks\n7:30 AM - Reviso earnings y eventos del día\n8:00 AM - Defino mi watchlist del día (máx 3 stocks)\n8:30 AM - Repaso mi plan de trading\n9:15 AM - Estoy listo para la apertura\n\nLa preparación es el 80% del éxito en day trading.", tipo: "rutina", tags: ["premarket", "rutina", "preparacion"] },
    { userId: "user_laura_martinez", titulo: "TSLA: Scalpeando el momentum", contenido: "TSLA está con volumen 3x el promedio. Perfecto para scalping.\n\nEntré long en $245.50, salí en $246.80 (+$1.30/share = $130 por 100 shares)\n\nDuración del trade: 4 minutos.\n\nScalping no es glamorous, pero paga las cuentas.", tipo: "trade", tags: ["TSLA", "scalping", "momentum"] },
  ],
  "commodities-macro": [
    { userId: "user_andres_morales", titulo: "Petróleo: OPEC+ recorta producción", contenido: "OPEC+ anunció recortes adicionales de 1.5M barriles/día.\n\nWTI reaccionó subiendo 3% a $82/barril.\n\nMi análisis: si se mantiene el recorte, el camino es a $85-90. Pero ojo con la demanda china débil.\n\nTrade: Long WTI con stop en $79.", tipo: "noticia", tags: ["petroleo", "OPEC", "WTI"] },
    { userId: "user_andres_morales", titulo: "Plata: El hermano pobre del oro", contenido: "La plata está subiendo pero menos que el oro. Ratio oro/plata en 85 (históricamente alto).\n\nCuando este ratio baja, la plata suele outperformar al oro.\n\nMi posición: Long plata con target ratio 75.\n\nLa plata tiene más volatilidad pero también más potencial.", tipo: "analisis", tags: ["plata", "silver", "ratio"] },
    { userId: "user_andres_morales", titulo: "Gas natural: Oportunidad estacional", contenido: "El gas natural suele subir en invierno por demanda de calefacción.\n\nHistóricamente:\n- Octubre a Febrero: +15% promedio\n- Marzo a Septiembre: -8% promedio\n\nEstamos entrando en temporada alcista. Long NG con stop ajustado.", tipo: "estacional", tags: ["gas", "natural", "estacional"] },
  ],
  "educacion-financiera": [
    { userId: "user_camila_flores", titulo: "Regla 50/30/20: Tu presupuesto básico", contenido: "Divide tus ingresos así:\n\n💰 50% - Necesidades (alquiler, comida, servicios)\n💰 30% - Deseos (entretenimiento, hobbies)\n💰 20% - Ahorro e inversión\n\nSi ganas $2,000/mes:\n- $1,000 necesidades\n- $600 deseos\n- $400 ahorro/inversión\n\nCon $400/mes invertidos al 10% anual, en 20 años tienes $300,000+.", tipo: "educacion", tags: ["presupuesto", "ahorro", "basico"] },
    { userId: "user_camila_flores", titulo: "Interés compuesto: La octava maravilla", contenido: "Si inviertes $200/mes desde los 25 años:\n\n📊 A los 35: $41,000\n📊 A los 45: $122,000\n📊 A los 55: $310,000\n📊 A los 65: $735,000\n\nTotal invertido: $96,000\nGanancia por interés compuesto: $639,000\n\nEmpezar temprano es la ventaja más grande.", tipo: "educacion", tags: ["interes", "compuesto", "largo plazo"] },
    { userId: "user_camila_flores", titulo: "Fondo de emergencia: Antes de invertir", contenido: "Antes de poner un dólar en trading o inversiones:\n\n1. Ahorra 3-6 meses de gastos\n2. Ponlo en una cuenta líquida y segura\n3. NO lo toques para invertir\n\n¿Por qué? Porque si pierdes tu trabajo y no tienes fondo de emergencia, tendrás que vender tus inversiones (quizás en pérdida) para sobrevivir.", tipo: "consejo", tags: ["emergencia", "ahorro", "seguridad"] },
  ],
  "futures-scalping": [
    { userId: "user_felipe_castro", titulo: "Order Flow: Leyendo las huellas del mercado", contenido: "El order flow te muestra las órdenes reales que entran al mercado.\n\nHerramientas:\n- Footprint charts\n- Delta cumulativo\n- Volume profile\n- DOM (Depth of Market)\n\nCon esto puedes ver dónde están las manos fuertes operando.", tipo: "educacion", tags: ["orderflow", "footprint", "DOM"] },
    { userId: "user_felipe_castro", titulo: "Mi setup de apertura en ES", contenido: "9:30 AM - No opero los primeros 5 min\n9:35 AM - Marco el rango de los primeros 5 min\n9:40 AM - Entro en la ruptura del rango\n9:45 AM - Stop en el medio del rango\n9:50 AM - Target: 2x el riesgo\n\nSimple, repetible, rentable.", tipo: "setup", tags: ["ES", "apertura", "setup"] },
    { userId: "user_felipe_castro", titulo: "Resultado del mes: +$4,200 en ES", contenido: "Resumen de octubre en E-mini S&P500:\n\n📊 Trades totales: 87\n📊 Ganadores: 58 (66.7%)\n📊 Perdedores: 29\n📊 Promedio ganador: $125\n📊 Promedio perdedor: -$75\n📊 Profit Factor: 1.87\n📊 Ganancia neta: $4,200\n\nConsistencia > home runs.", tipo: "resultado", tags: ["ES", "mensual", "resultados"] },
  ],
};

// ============================================================
// COMMENTS FOR MAIN POSTS
// ============================================================
const COMMENTS = {
  0: [ // EUR/USD post
    { userId: "user_maria_garcia", text: "Excelente análisis Carlos. Coincido con la ruptura, el volumen es clave aquí." },
    { userId: "user_isabella_reyes", text: "Ya estoy posicionada long desde 1.0830. Gracias por confirmar la idea!" },
    { userId: "user_diego_lopez", text: "¿Qué timeframe usaste para este análisis?" },
    { userId: "user_carlos_mendoza", text: "@diegolopez 4H para la dirección, 1H para el entry point." },
    { userId: "user_roberto_sanchez", text: "El dólar está débil, buen momento para longs en EUR." },
  ],
  1: [ // S&P500 HCH
    { userId: "user_carlos_mendoza", text: "Muy buen análisis María. El HCH invertido es uno de los patrones más fiables." },
    { userId: "user_felipe_castro", text: "¿Has considerado el volumen en la formación? Es crucial para la confirmación." },
    { userId: "user_maria_garcia", text: "@felipecastro Sí, volumen decreciente en la formación, justo como debe ser." },
    { userId: "user_laura_martinez", text: "Target 5,450 suena agresivo pero posible con el momentum actual." },
  ],
  2: [ // BTC
    { userId: "user_miguel_rivera", text: "Mi bot detectó la ruptura y entró automático. Ya está +3%." },
    { userId: "user_camila_flores", text: "¿Es buen momento para entrar si soy principiante?" },
    { userId: "user_diego_lopez", text: "@camilaflores Con mucho cuidado y stop loss ajustado. BTC es volátil." },
    { userId: "user_andres_morales", text: "Si BTC rompe $95K con volumen, todas las altcoins van a explotar." },
    { userId: "user_valentina_cruz", text: "Compré un poquito en $90K 🤞" },
    { userId: "user_diego_lopez", text: "Buena entrada Valentina. Mantén el stop en $88K como mínimo." },
  ],
  3: [ // Psicotrading errores
    { userId: "user_valentina_cruz", text: "Todos 😅 Estoy trabajando en el #2, me cuesta mucho aceptar pérdidas." },
    { userId: "user_roberto_sanchez", text: "El #4 es mi debilidad. A veces entro en trades solo porque estoy aburrido." },
    { userId: "user_ana_rodriguez", text: "@robertosanchez Si no hay setup, no hay trade. Repítelo como mantra." },
    { userId: "user_laura_martinez", text: "El #1 me mató el mes pasado. Perdí 3 trades seguidos intentando recuperar." },
    { userId: "user_sofia_torres", text: "Gran contenido Ana. Deberías hacer un curso completo de psicotrading." },
    { userId: "user_ana_rodriguez", text: "@sofiatorres ¡Ya estoy trabajando en ello! Pronto lo lanzo en la comunidad." },
  ],
  7: [ // Oro
    { userId: "user_carlos_mendoza", text: "El oro es el refugio perfecto en tiempos de incertidumbre." },
    { userId: "user_felipe_castro", text: "¿Operas oro en spot o futuros?" },
    { userId: "user_andres_morales", text: "@felipecastro Ambos. Spot para posición larga, futuros para trading intradía." },
    { userId: "user_diego_lopez", text: "Prefiero BTC como 'oro digital' 😄" },
    { userId: "user_andres_morales", text: "@diegolopez Ambos tienen su lugar. El oro físico es el refugio original." },
  ],
  9: [ // Scalping ES
    { userId: "user_carlos_mendoza", text: "15 puntos en 20 minutos es un gran día. ¡Felicidades!" },
    { userId: "user_maria_garcia", text: "¿Cuántos contratos operas?" },
    { userId: "user_felipe_castro", text: "@mariagarcia Generalmente 2-3 micros (MES). Menos riesgo, mismo setup." },
    { userId: "user_roberto_sanchez", text: "Me gusta la gestión de mover a breakeven. Eso es trading inteligente." },
  ],
  15: [ // Principiante
    { userId: "user_ana_rodriguez", text: "¡Bienvenida Valentina! Lo más importante: nunca arriesgues más de lo que puedes perder." },
    { userId: "user_camila_flores", text: "Consejo: opera en demo al menos 3 meses antes de poner dinero real." },
    { userId: "user_maria_garcia", text: "Aprende primero gestión de riesgo. Es lo más importante." },
    { userId: "user_diego_lopez", text: "Únete a nuestra comunidad de crypto, te ayudamos con gusto!" },
    { userId: "user_valentina_cruz", text: "¡Gracias a todos! Ya me uní a varias comunidades. Estoy aprendiendo mucho." },
  ],
  17: [ // Milestone
    { userId: "user_carlos_mendoza", text: "¡Increíble! Orgulloso de ser parte de esta comunidad 🎉" },
    { userId: "user_ana_rodriguez", text: "¡Felicidades TradeShare! Vamos por 100K 🚀" },
    { userId: "user_maria_garcia", text: "La mejor comunidad de trading en español. Sin duda." },
    { userId: "user_camila_flores", text: "¡Gracias por crear este espacio! Ha cambiado mi vida financiera." },
    { userId: "user_miguel_rivera", text: "10K usuarios y creciendo. El algoritmo de engagement está funcionando bien 😄" },
  ],
};

// ============================================================
// SIGNALS
// ============================================================
const SIGNALS = [
  { providerId: "user_carlos_mendoza", type: "forex", priority: "premium", pair: "EUR/USD", direction: "buy", entryPrice: 1.0850, entryType: "limit", stopLoss: 1.0810, takeProfits: [{ level: 1, price: 1.0900, reached: false }, { level: 2, price: 1.0920, reached: false }, { level: 3, price: 1.0950, reached: false }], timeframe: "H4", sentiment: "bullish", analysis: "Ruptura de resistencia con volumen. EMA 50 cruza sobre EMA 200.", tags: ["EURUSD", "forex", "ruptura"], status: "active", pairCategory: "major" },
  { providerId: "user_carlos_mendoza", type: "forex", priority: "standard", pair: "GBP/JPY", direction: "buy", entryPrice: 193.80, entryType: "instant", stopLoss: 193.20, takeProfits: [{ level: 1, price: 194.50, reached: false }, { level: 2, price: 195.20, reached: false }], timeframe: "H4", sentiment: "bullish", analysis: "Bandera alcista tras corrección. Patrón de continuación.", tags: ["GBPJPY", "forex"], status: "active", pairCategory: "cross" },
  { providerId: "user_diego_lopez", type: "crypto", priority: "premium", pair: "BTC/USD", direction: "buy", entryPrice: 94500, entryType: "instant", stopLoss: 91000, takeProfits: [{ level: 1, price: 97500, reached: false }, { level: 2, price: 100000, reached: false }], timeframe: "D1", sentiment: "bullish", analysis: "Acercándose a ATH. Momentum fuerte con volumen creciente.", tags: ["BTC", "crypto", "ATH"], status: "active", pairCategory: "crypto" },
  { providerId: "user_diego_lopez", type: "crypto", priority: "standard", pair: "ETH/USD", direction: "buy", entryPrice: 3450, entryType: "limit", stopLoss: 3200, takeProfits: [{ level: 1, price: 3700, reached: false }, { level: 2, price: 4000, reached: false }], timeframe: "D1", sentiment: "bullish", analysis: "ETH sigue a BTC. Buen R/R en este nivel.", tags: ["ETH", "crypto"], status: "active", pairCategory: "crypto" },
  { providerId: "user_sofia_torres", type: "options", priority: "premium", pair: "SPY", direction: "buy", entryPrice: 575, entryType: "limit", stopLoss: 0, takeProfits: [{ level: 1, price: 575, reached: false }], timeframe: "D1", sentiment: "neutral", analysis: "Iron Condor: Call short 590, Put short 560. Crédito $1.80.", tags: ["SPY", "opciones", "ironcondor"], status: "active", pairCategory: "etf" },
  { providerId: "user_andres_morales", type: "commodities", priority: "premium", pair: "XAU/USD", direction: "buy", entryPrice: 2430, entryType: "instant", stopLoss: 2380, takeProfits: [{ level: 1, price: 2480, reached: false }, { level: 2, price: 2520, reached: false }, { level: 3, price: 2600, reached: false }], timeframe: "D1", sentiment: "bullish", analysis: "Máximos históricos. Factores macro favorables.", tags: ["oro", "gold", "XAUUSD"], status: "active", pairCategory: "commodity" },
  { providerId: "user_felipe_castro", type: "indices", priority: "premium", pair: "ES", direction: "buy", entryPrice: 5185, entryType: "instant", stopLoss: 5170, takeProfits: [{ level: 1, price: 5200, reached: false }, { level: 2, price: 5215, reached: false }], timeframe: "M5", sentiment: "bullish", analysis: "Ruptura del rango de apertura con volumen.", tags: ["ES", "futuros", "scalping"], status: "active", pairCategory: "index" },
  { providerId: "user_laura_martinez", type: "stocks", priority: "standard", pair: "NVDA", direction: "buy", entryPrice: 135, entryType: "limit", stopLoss: 128, takeProfits: [{ level: 1, price: 142, reached: false }, { level: 2, price: 150, reached: false }], timeframe: "D1", sentiment: "bullish", analysis: "Pre-earnings setup. Momentum alcista fuerte.", tags: ["NVDA", "tech", "earnings"], status: "active", pairCategory: "stock" },
  { providerId: "user_isabella_reyes", type: "forex", priority: "standard", pair: "USD/JPY", direction: "sell", entryPrice: 149.50, entryType: "instant", stopLoss: 150.20, takeProfits: [{ level: 1, price: 148.50, reached: false }, { level: 2, price: 148.00, reached: false }], timeframe: "H4", sentiment: "bearish", analysis: "BOJ hawkish. Posible cambio de tendencia.", tags: ["USDJPY", "forex", "BOJ"], status: "active", pairCategory: "major" },
  { providerId: "user_roberto_sanchez", type: "indices", priority: "free", pair: "NASDAQ", direction: "buy", entryPrice: 18200, entryType: "limit", stopLoss: 17900, takeProfits: [{ level: 1, price: 18500, reached: false }, { level: 2, price: 18800, reached: false }], timeframe: "D1", sentiment: "bullish", analysis: "Pullback a EMA 20. Divergencia alcista en RSI.", tags: ["NASDAQ", "swing"], status: "active", pairCategory: "index" },
];

// ============================================================
// PRODUCTS
// ============================================================
const PRODUCTS = [
  { authorId: "user_carlos_mendoza", authorName: "Carlos Mendoza", title: "Forex Mastery: De Cero a Pro", description: "Curso completo de trading Forex. Desde conceptos básicos hasta estrategias avanzadas. 50+ horas de contenido.", category: "course", price: 97, currency: "USD", images: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400"], tags: ["forex", "curso", "principiante", "avanzado"], isPublished: true, rating: 4.8 },
  { authorId: "user_maria_garcia", authorName: "María García", title: "Análisis Técnico Definitivo", description: "Domina el análisis técnico con este curso completo. Patrones, indicadores, Elliott, Fibonacci y más.", category: "course", price: 147, currency: "USD", images: ["https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400"], tags: ["analisis", "tecnico", "curso"], isPublished: true, rating: 4.9 },
  { authorId: "user_ana_rodriguez", authorName: "Ana Rodríguez", title: "Mindset del Trader Exitoso", description: "Programa de 8 semanas para dominar la psicología del trading. Ejercicios prácticos y seguimiento personalizado.", category: "course", price: 197, currency: "USD", images: ["https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400"], tags: ["psicotrading", "mindset", "curso"], isPublished: true, rating: 5.0 },
  { authorId: "user_miguel_rivera", authorName: "Miguel Rivera", title: "Bot de Trading en Python", description: "Código completo de un bot de trading con backtesting. Incluye 5 estrategias probadas y optimizadas.", category: "tool", price: 49, currency: "USD", images: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400"], tags: ["python", "bot", "algotrading"], isPublished: true, rating: 4.7 },
  { authorId: "user_sofia_torres", authorName: "Sofía Torres", title: "Opciones desde Cero", description: "Aprende a operar opciones desde los conceptos básicos hasta estrategias avanzadas con Greeks.", category: "course", price: 127, currency: "USD", images: ["https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400"], tags: ["opciones", "curso", "griegas"], isPublished: true, rating: 4.8 },
  { authorId: "user_diego_lopez", authorName: "Diego López", title: "Crypto Trading Signals Pack", description: "Pack de señales de crypto con 6 meses de historial verificado. Win rate 72%.", category: "signal", price: 29, currency: "USD", images: ["https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400"], tags: ["crypto", "señales", "bitcoin"], isPublished: true, rating: 4.5 },
  { authorId: "user_felipe_castro", authorName: "Felipe Castro", title: "Scalping ES: Setup Completo", description: "Mi setup completo de scalping en E-mini S&P500. Reglas de entrada, salida y gestión.", category: "course", price: 67, currency: "USD", images: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400"], tags: ["scalping", "ES", "futuros"], isPublished: true, rating: 4.6 },
  { authorId: "user_andres_morales", authorName: "Andrés Morales", title: "Commodities Trading Guide", description: "Guía completa para operar oro, plata, petróleo y gas natural. Análisis macro incluido.", category: "course", price: 37, currency: "USD", images: ["https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400"], tags: ["commodities", "oro", "petroleo"], isPublished: true, rating: 4.4 },
  { authorId: "user_laura_martinez", authorName: "Laura Martínez", title: "Day Trading Tech Stocks", description: "Estrategias de day trading para acciones tecnológicas. AAPL, TSLA, NVDA, MSFT.", category: "course", price: 87, currency: "USD", images: ["https://images.unsplash.com/photo-1518186285589-2f7103f0845a?w=400"], tags: ["daytrading", "tech", "acciones"], isPublished: true, rating: 4.7 },
  { authorId: "user_camila_flores", authorName: "Camila Flores", title: "Educación Financiera Básica", description: "Todo lo que necesitas saber sobre finanzas personales. Presupuesto, ahorro, inversión básica.", category: "course", price: 19, currency: "USD", images: ["https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400"], tags: ["finanzas", "basico", "educacion"], isPublished: true, rating: 4.9 },
  { authorId: "user_miguel_rivera", authorName: "Miguel Rivera", title: "ML Trading Model Template", description: "Template de machine learning para predicción de dirección. XGBoost + LightGBM + Random Forest.", category: "template", price: 79, currency: "USD", images: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400"], tags: ["ML", "python", "template"], isPublished: true, rating: 4.8 },
  { authorId: "user_carlos_mendoza", authorName: "Carlos Mendoza", title: "Indicador Custom: Trend Finder", description: "Indicador personalizado para TradingView. Detecta tendencias y posibles reversiones automáticamente.", category: "indicator", price: 35, currency: "USD", images: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400"], tags: ["tradingview", "indicador", "custom"], isPublished: true, rating: 4.5 },
  { authorId: "user_maria_garcia", authorName: "María García", title: "Pack de Plantillas de Análisis", description: "20 plantillas de análisis técnico listas para usar. HCH, triángulos, banderas, cuñas y más.", category: "template", price: 25, currency: "USD", images: ["https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400"], tags: ["plantillas", "patrones", "tradingview"], isPublished: true, rating: 4.6 },
  { authorId: "user_sofia_torres", authorName: "Sofía Torres", title: "Options Strategy Calculator", description: "Calculadora de estrategias de opciones. Iron Condor, Butterfly, Straddle y más. Con griegas.", category: "tool", price: 45, currency: "USD", images: ["https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400"], tags: ["opciones", "calculadora", "griegas"], isPublished: true, rating: 4.9 },
  { authorId: "user_roberto_sanchez", authorName: "Roberto Sánchez", title: "Swing Trading Journal", description: "Plantilla de diario de trading para swing traders. Registro de trades, estadísticas y análisis.", category: "template", price: 15, currency: "USD", images: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400"], tags: ["journal", "swing", "plantilla"], isPublished: true, rating: 4.3 },
  { authorId: "user_valentina_cruz", authorName: "Valentina Cruz", title: "Mi Diario de Aprendizaje", description: "Mi experiencia aprendiendo trading desde cero. Errores, aciertos y lecciones aprendidas.", category: "course", price: 9, currency: "USD", images: ["https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400"], tags: ["principiante", "diario", "experiencia"], isPublished: true, rating: 4.2 },
  { authorId: "user_isabella_reyes", authorName: "Isabella Reyes", title: "Forex Risk Manager", description: "Herramienta de gestión de riesgo para Forex. Calcula lotaje, stop loss y take profit automáticamente.", category: "tool", price: 22, currency: "USD", images: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400"], tags: ["forex", "riesgo", "calculadora"], isPublished: true, rating: 4.4 },
  { authorId: "user_andres_morales", authorName: "Andrés Morales", title: "Macro Calendar Tracker", description: "Tracker de eventos macroeconómicos. NFP, CPI, FOMC, ECB y más. Con impacto esperado en mercados.", category: "tool", price: 18, currency: "USD", images: ["https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400"], tags: ["macro", "calendario", "noticias"], isPublished: true, rating: 4.5 },
  { authorId: "user_diego_lopez", authorName: "Diego López", title: "Crypto Portfolio Tracker", description: "Tracker de portfolio crypto. Conecta tus wallets y sigue tu rendimiento en tiempo real.", category: "tool", price: 30, currency: "USD", images: ["https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400"], tags: ["crypto", "portfolio", "tracker"], isPublished: true, rating: 4.6 },
  { authorId: "user_camila_flores", authorName: "Camila Flores", title: "Planificador Financiero Anual", description: "Planifica tus finanzas del año. Metros de ahorro, inversión y gasto. Plantilla editable.", category: "template", price: 12, currency: "USD", images: ["https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400"], tags: ["planificador", "finanzas", "anual"], isPublished: true, rating: 4.7 },
];

// ============================================================
// STRATEGIES
// ============================================================
const STRATEGIES = [
  { authorId: "user_carlos_mendoza", title: "EUR/USD Breakout Strategy", description: "Estrategia de ruptura para EUR/USD basada en soportes/resistencias de 4H con confirmación de volumen.", content: { rules: ["Identificar rango de consolidación en 4H", "Esperar ruptura con volumen > promedio", "Entrar en retest del nivel roto", "Stop loss debajo del último swing", "Target 2:1 mínimo"], timeframe: "4H", pairs: ["EUR/USD"], winRate: 68 }, price: 0, currency: "XP", category: "forex", tags: ["EURUSD", "ruptura", "4H"], isPublished: true, imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400" },
  { authorId: "user_maria_garcia", title: "HCH Pattern Trading", description: "Cómo operar patrones Hombro-Cabeza-Hombro con alta probabilidad.", content: { rules: ["Identificar el patrón completo", "Esperar ruptura de línea de cuello", "Confirmar con volumen", "Entrar en pullback", "Stop en el hombro derecho"], timeframe: "1D", pairs: ["Todos"], winRate: 72 }, price: 0, currency: "XP", category: "patrones", tags: ["HCH", "patrones", "clasico"], isPublished: true, imageUrl: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400" },
  { authorId: "user_diego_lopez", title: "Crypto Momentum Scalping", description: "Scalping de momentum en criptomonedas usando RSI y volumen.", content: { rules: ["RSI < 30 en 5min = posible entrada long", "RSI > 70 en 5min = posible entrada short", "Confirmar con volumen", "Target 1-2%", "Stop 0.5%"], timeframe: "5min", pairs: ["BTC", "ETH", "SOL"], winRate: 65 }, price: 0, currency: "XP", category: "crypto", tags: ["crypto", "scalping", "momentum"], isPublished: true, imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400" },
  { authorId: "user_ana_rodriguez", title: "Trading con Disciplina Emocional", description: "Estrategia basada en reglas para eliminar emociones del trading.", content: { rules: ["Máximo 3 trades por día", "Siempre usar stop loss", "Nunca mover stop loss", "Tomar ganancias parciales al 1:1", "Si pierdes 2 seguidos, PARA"], timeframe: "Cualquiera", pairs: ["Todos"], winRate: 60 }, price: 0, currency: "XP", category: "psicotrading", tags: ["disciplina", "emociones", "reglas"], isPublished: true, imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400" },
  { authorId: "user_sofia_torres", title: "Iron Condor Weekly", description: "Estrategia semanal de Iron Condor en SPY para ingreso consistente.", content: { rules: ["Vender Iron Condor cada lunes", "Delta 0.15 en ambos lados", "Vencimiento 7 días", "Cerrar al 50% de profit", "Defender si el precio toca un short"], timeframe: "Semanal", pairs: ["SPY"], winRate: 75 }, price: 0, currency: "XP", category: "opciones", tags: ["ironcondor", "SPY", "semanal"], isPublished: true, imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400" },
  { authorId: "user_miguel_rivera", title: "Mean Reversion Algorithm", description: "Algoritmo de reversión a la media para EUR/USD con filtros de confirmación.", content: { rules: ["RSI < 30 y precio debajo de Bollinger inferior", "Confirmar con MACD histograma positivo", "Entrar long con stop debajo del mínimo", "Cerrar en media móvil de 20", "Filtro de tendencia: solo contra tendencia fuerte"], timeframe: "1H", pairs: ["EUR/USD"], winRate: 68 }, price: 0, currency: "XP", category: "algotrading", tags: ["meanreversion", "algoritmo", "EURUSD"], isPublished: true, imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400" },
  { authorId: "user_laura_martinez", title: "Tech Stock Opening Range", description: "Estrategia de rango de apertura para acciones tecnológicas.", content: { rules: ["Esperar 15 min después de apertura", "Marcar máximo y mínimo del rango", "Entrar en ruptura del rango", "Stop en medio del rango", "Target 2x riesgo"], timeframe: "5min", pairs: ["AAPL", "TSLA", "NVDA", "MSFT"], winRate: 62 }, price: 0, currency: "XP", category: "acciones", tags: ["apertura", "tech", "rango"], isPublished: true, imageUrl: "https://images.unsplash.com/photo-1518186285589-2f7103f0845a?w=400" },
  { authorId: "user_andres_morales", title: "Gold Trend Following", description: "Estrategia de seguimiento de tendencia para oro usando medias móviles.", content: { rules: ["EMA 50 > EMA 200 = solo longs", "EMA 50 < EMA 200 = solo shorts", "Entrar en pullback a EMA 50", "Stop debajo del último swing", "Trailing stop con EMA 20"], timeframe: "4H", pairs: ["XAU/USD"], winRate: 64 }, price: 0, currency: "XP", category: "commodities", tags: ["oro", "tendencia", "EMA"], isPublished: true, imageUrl: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400" },
  { authorId: "user_felipe_castro", title: "ES Opening Range Breakout", description: "Ruptura del rango de apertura en E-mini S&P500.", content: { rules: ["No operar primeros 5 min", "Marcar rango 9:30-9:35", "Entrar en ruptura con volumen", "Stop en medio del rango", "Target: 2x rango"], timeframe: "5min", pairs: ["ES"], winRate: 66 }, price: 0, currency: "XP", category: "futuros", tags: ["ES", "apertura", "ruptura"], isPublished: true, imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400" },
  { authorId: "user_isabella_reyes", title: "Forex Pullback Strategy", description: "Estrategia de pullback en tendencias claras de Forex.", content: { rules: ["Identificar tendencia en 4H", "Esperar pullback a Fibonacci 61.8%", "Confirmar con patrón de velas", "Entrar con stop debajo del pullback", "Target en el siguiente nivel Fibonacci"], timeframe: "4H", pairs: ["EUR/USD", "GBP/USD", "AUD/USD"], winRate: 67 }, price: 0, currency: "XP", category: "forex", tags: ["pullback", "fibonacci", "forex"], isPublished: true, imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400" },
];

// ============================================================
// VIDEOS
// ============================================================
const VIDEOS = [
  { userId: "user_carlos_mendoza", tipo: "tutorial", titulo: "Cómo operar EUR/USD como profesional", autor: "Carlos Mendoza", descripcion: "Tutorial completo de trading de EUR/USD con análisis técnico y gestión de riesgo.", thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duracion: "25:30", categoria: "forex" },
  { userId: "user_maria_garcia", tipo: "analisis", titulo: "Análisis técnico del S&P500 - Semana actual", autor: "María García", descripcion: "Análisis semanal del S&P500 con patrones chartistas y niveles clave.", thumbnail: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duracion: "18:45", categoria: "indices" },
  { userId: "user_diego_lopez", tipo: "live", titulo: "Trading en vivo: BTC $95K", autor: "Diego López", descripcion: "Sesión de trading en vivo con Bitcoin en máximos históricos.", thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duracion: "1:12:00", categoria: "crypto" },
  { userId: "user_ana_rodriguez", tipo: "educacion", titulo: "Psicotrading: Controla tus emociones", autor: "Ana Rodríguez", descripcion: "Cómo dominar las emociones al operar. Técnicas prácticas y ejercicios.", thumbnail: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duracion: "32:15", categoria: "psicotrading" },
  { userId: "user_miguel_rivera", tipo: "tutorial", titulo: "Crea tu primer bot de trading en Python", autor: "Miguel Rivera", descripcion: "Tutorial paso a paso para crear un bot de trading con Python y backtesting.", thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duracion: "45:20", categoria: "algotrading" },
  { userId: "user_sofia_torres", tipo: "educacion", titulo: "Opciones para principiantes", autor: "Sofía Torres", descripcion: "Introducción al trading de opciones. Calls, puts, spreads y más.", thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duracion: "28:10", categoria: "opciones" },
  { userId: "user_laura_martinez", tipo: "analisis", titulo: "NVDA pre-earnings: Qué esperar", autor: "Laura Martínez", descripcion: "Análisis de NVIDIA antes del reporte de ganancias. Escenarios y estrategias.", thumbnail: "https://images.unsplash.com/photo-1518186285589-2f7103f0845a?w=400", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duracion: "15:30", categoria: "acciones" },
  { userId: "user_andres_morales", tipo: "analisis", titulo: "Oro en máximos: ¿Sigue subiendo?", autor: "Andrés Morales", descripcion: "Análisis del oro en máximos históricos. Factores macro y proyección.", thumbnail: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duracion: "22:45", categoria: "commodities" },
  { userId: "user_camila_flores", tipo: "educacion", titulo: "Finanzas personales: Empieza hoy", autor: "Camila Flores", descripcion: "Guía completa de finanzas personales para principiantes.", thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duracion: "35:00", categoria: "educacion" },
  { userId: "user_felipe_castro", tipo: "live", titulo: "Scalping en vivo: ES Futures", autor: "Felipe Castro", descripcion: "Sesión de scalping en vivo en E-mini S&P500. 15 trades en 2 horas.", thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duracion: "2:05:00", categoria: "futuros" },
];

// ============================================================
// QA
// ============================================================
const QA_ITEMS = [
  { userId: "user_valentina_cruz", pregunta: "¿Cuánto dinero necesito para empezar a hacer trading?", respuesta: "Puedes empezar con $100-500 en una cuenta demo o micro. Lo importante es aprender primero, no cuánto dinero tienes.", respondida: true, isAnonymous: false },
  { userId: "user_valentina_cruz", pregunta: "¿Cuál es el mejor broker para principiantes?", respuesta: "Para Forex: IC Markets o Pepperstone. Para acciones: Interactive Brokers. Para crypto: Binance o Coinbase. Compara spreads y comisiones.", respondida: true, isAnonymous: false },
  { userId: "user_roberto_sanchez", pregunta: "¿Es mejor day trading o swing trading?", respuesta: "Depende de tu personalidad y disponibilidad. Day trading requiere más tiempo y atención. Swing trading es más relajado y permite análisis más profundo.", respondida: true, isAnonymous: false },
  { userId: "user_isabella_reyes", pregunta: "¿Cómo calculo el tamaño de posición correcto?", respuesta: "Fórmula: Tamaño = (Capital × Riesgo%) / (Entrada - Stop Loss). Nunca arriesgues más del 1-2% de tu capital por trade.", respondida: true, isAnonymous: false },
  { userId: "user_javier_hernandez", pregunta: "¿Vale la pena pagar por señales de trading?", respuesta: "Solo si el proveedor tiene un track record verificado de al menos 6 meses. Desconfía de promesas de ganancias garantizadas.", respondida: true, isAnonymous: false },
  { userId: "user_valentina_cruz", pregunta: "¿Cuánto tiempo tarda en aprender a hacer trading?", respuesta: "Mínimo 6-12 meses para ser consistente. Los primeros 3 meses son de aprendizaje, los siguientes 3-6 de práctica en demo, y luego empiezas con dinero real pequeño.", respondida: true, isAnonymous: false },
  { userId: "user_javier_hernandez", pregunta: "¿Es mejor invertir en índices o en acciones individuales?", respuesta: "Para la mayoría, los índices son mejores: diversificación automática, menos riesgo, menos tiempo requerido. Acciones individuales solo si tienes tiempo para analizar.", respondida: true, isAnonymous: false },
  { userId: "user_isabella_reyes", pregunta: "¿Qué es el apalancamiento y cómo usarlo?", respuesta: "El apalancamiento multiplica tu poder de compra pero también tus pérdidas. Con 1:100, $100 controlan $10,000. Úsalo con cuidado y siempre con stop loss.", respondida: true, isAnonymous: false },
];

// ============================================================
// REVIEWS
// ============================================================
const REVIEWS = [
  { communityId: null, userId: "user_valentina_cruz", rating: 5, comment: "¡Increíble comunidad! He aprendido más en un mes que en un año viendo videos en YouTube." },
  { communityId: null, userId: "user_roberto_sanchez", rating: 5, comment: "La mejor plataforma de trading en español. Contenido de calidad y comunidad activa." },
  { communityId: null, userId: "user_isabella_reyes", rating: 4, comment: "Muy buena plataforma. Me gustaría ver más contenido sobre Forex avanzado." },
  { communityId: null, userId: "user_javier_hernandez", rating: 5, comment: "Como principiante, esta comunidad me ha dado todo lo que necesitaba para empezar." },
  { communityId: null, userId: "user_camila_flores", rating: 5, comment: "El contenido de educación financiera es excelente. Lo recomiendo a todos mis amigos." },
];

// ============================================================
// NOTIFICATIONS
// ============================================================
const NOTIFICATIONS = [
  { userId: "user_carlos_mendoza", type: "like", title: "👍 ¡Nuevo like!", body: "A María García le gustó tu análisis de EUR/USD", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria" },
  { userId: "user_carlos_mendoza", type: "comment", title: "💬 ¡Nuevo comentario!", body: "Diego López comentó en tu post de GBP/JPY", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=diego" },
  { userId: "user_maria_garcia", type: "follow", title: "👥 ¡Nuevo seguidor!", body: "Ana Rodríguez empezó a seguirte", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana" },
  { userId: "user_diego_lopez", type: "system", title: "🎯 ¡Señal alcanzada!", body: "Tu señal de BTC/USD alcanzó el Target 1 en $97,500", avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=signal" },
  { userId: "user_ana_rodriguez", type: "level_up", title: "⭐ ¡XP ganada!", body: "Has ganado 50 XP por tu post de psicotrading", avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=xp" },
  { userId: "user_valentina_cruz", type: "system", title: "🎉 ¡Bienvenida a TradeShare!", body: "Completa tu perfil y únete a tu primera comunidad", avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=welcome" },
  { userId: "user_miguel_rivera", type: "achievement", title: "🏆 ¡Logro desbloqueado!", body: "Has desbloqueado: 'Escritor Prolífico' - 50 publicaciones creadas", avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=achievement" },
  { userId: "user_sofia_torres", type: "payment", title: "💰 ¡Nueva venta!", body: "Alguien compró tu curso 'Opciones desde Cero'", avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=sale" },
];

// ============================================================
// RECURSOS
// ============================================================
const RECURSOS = [
  { userId: "user_carlos_mendoza", titulo: "Plantilla de Trading Journal", descripcion: "Plantilla Excel para registrar todos tus trades con estadísticas automáticas.", categoria: "plantilla", plataforma: "Excel", precio: 0, version: "2.0", tags: ["journal", "plantilla", "excel"] },
  { userId: "user_maria_garcia", titulo: "Guía de Patrones Chartistas", descripcion: "PDF con los 25 patrones chartistas más importantes con ejemplos reales.", categoria: "ebook", plataforma: "PDF", precio: 0, version: "1.0", tags: ["patrones", "guia", "pdf"] },
  { userId: "user_miguel_rivera", titulo: "Script de Backtesting Python", descripcion: "Script completo de backtesting con backtrader. Incluye 3 estrategias.", categoria: "codigo", plataforma: "Python", precio: 0, version: "3.1", tags: ["python", "backtesting", "script"] },
  { userId: "user_sofia_torres", titulo: "Calculadora de Opciones", descripcion: "Calculadora de opciones con griegas. Excel con fórmulas automáticas.", categoria: "herramienta", plataforma: "Excel", precio: 0, version: "1.5", tags: ["opciones", "calculadora", "griegas"] },
  { userId: "user_andres_morales", titulo: "Calendario Económico 2026", descripcion: "Calendario con todos los eventos macroeconómicos importantes del año.", categoria: "calendario", plataforma: "PDF", precio: 0, version: "2026", tags: ["calendario", "macro", "2026"] },
];

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
export const seedAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let counts = { profiles: 0, communities: 0, subcommunities: 0, posts: 0, communityPosts: 0, signals: 0, products: 0, strategies: 0, videos: 0, qa: 0, reviews: 0, notifications: 0, recursos: 0, communityMembers: 0, subcommunityMembers: 0, comments: 0, likes: 0 };

    // 1. SEED PROFILES
    for (const u of USERS) {
      const existing = await ctx.db.query("profiles").withIndex("by_userId", (q: any) => q.eq("userId", u.userId)).first();
      if (!existing) {
        await ctx.db.insert("profiles", {
          userId: u.userId,
          nombre: u.nombre,
          usuario: u.usuario,
          avatar: u.avatar,
          biografia: u.biografia,
          esPro: u.esPro,
          esVerificado: u.esVerificado,
          rol: u.rol,
          role: u.role,
          xp: u.xp,
          level: u.level,
          email: u.email,
          seguidores: [],
          siguiendo: [],
          aportes: u.aportes,
          accuracy: u.accuracy,
          reputation: u.reputation,
          badges: [],
          estadisticas: {},
          saldo: u.saldo,
          watchlist: [],
          watchedClasses: [],
          progreso: {},
          fechaRegistro: u.fechaRegistro,
          diasActivos: u.streakDays,
          ultimoLogin: new Date().toISOString().split('T')[0],
          status: "active",
          streakReward: u.streakDays > 30 ? "streak_60" : u.streakDays > 7 ? "streak_7" : undefined,
          streakDays: u.streakDays,
          dailyFreeCoinsBalance: 5,
          lastClaimDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          weeklyXP: u.xp,
          monthlyXP: u.xp,
          weeklyXPResetAt: now + 604800000,
          monthlyXPResetAt: now + 2592000000,
          avatarFrame: u.avatarFrame || undefined,
          isBlocked: false,

        } as any);
        counts.profiles++;
      }
    }

    // 2. SEED COMMUNITIES
    const communityIds: any[] = [];
    for (const c of COMMUNITIES) {
      const existing = await ctx.db.query("communities").withIndex("by_slug", (q: any) => q.eq("slug", c.slug)).first();
      if (!existing) {
        const id = await ctx.db.insert("communities", {
          ownerId: c.ownerId,
          name: c.name,
          slug: c.slug,
          description: c.description,
          visibility: c.visibility,
          accessType: c.accessType,
          priceMonthly: c.priceMonthly,
          maxMembers: c.maxMembers,
          currentMembers: c.currentMembers,
          plan: c.plan,
          totalRevenue: 0,
          status: "active",
          createdAt: now,
          coverImage: c.coverImage,
          isPromoted: false,
          isPortalExclusive: false,

        } as any);
        communityIds.push(id);

        // Add owner as member
        await ctx.db.insert("communityMembers", {
          communityId: id,
          userId: c.ownerId,
          role: "owner",
          subscriptionStatus: "active",
          joinedAt: now,

        } as any);
        counts.communityMembers++;

        counts.communities++;
      }
    }

    // 3. SEED SUBCOMMUNITIES
    for (const s of SUBCOMMUNITIES) {
      const parentCommunity = COMMUNITIES[s.parentId];
      const parentCommunityId = communityIds[s.parentId];
      if (!parentCommunityId) continue;

      const existing = await ctx.db.query("subcommunities").withIndex("by_slug", (q: any) => q.eq("slug", s.slug)).first();
      if (!existing) {
        const subId = await ctx.db.insert("subcommunities", {
          parentId: parentCommunityId,
          ownerId: parentCommunity.ownerId,
          name: s.name,
          slug: s.slug,
          description: s.description,
          type: "general",
          visibility: s.visibility,
          accessType: "free",
          maxMembers: 1000,
          currentMembers: 0,
          status: "active",
          createdAt: now,
          plan: "free",
          adFrequency: 1,
          adsEnabled: false,
          allowedAdTypes: [],
          tvEnabled: true,
        } as any);

        // Add owner as member
        await ctx.db.insert("subcommunityMembers", {
          subcommunityId: subId,
          userId: parentCommunity.ownerId,
          role: "owner",
          joinedAt: now,

        } as any);
        counts.subcommunityMembers++;

        counts.subcommunities++;
      }
    }

    // Add random members to communities
    const allUserIds = USERS.map(u => u.userId).filter(id => id !== "user_system");
    for (let i = 0; i < communityIds.length; i++) {
      const community = COMMUNITIES[i];
      const memberCount = Math.min(8, allUserIds.length - 1);
      const shuffled = [...allUserIds].filter(id => id !== community.ownerId).sort(() => Math.random() - 0.5).slice(0, memberCount);
      for (const userId of shuffled) {
        const existing = await ctx.db.query("communityMembers").withIndex("by_community_user", (q: any) => q.eq("communityId", communityIds[i]).eq("userId", userId)).first();
        if (!existing) {
          await ctx.db.insert("communityMembers", {
            communityId: communityIds[i],
            userId,
            role: "member",
            subscriptionStatus: "active",
            joinedAt: now - Math.floor(Math.random() * 86400000 * 30),
  
          } as any);
          counts.communityMembers++;
        }
      }
    }

    // 4. SEED MAIN FEED POSTS
    const postIds: any[] = [];
    for (let i = 0; i < MAIN_POSTS.length; i++) {
      const p = MAIN_POSTS[i];
      const postId = await ctx.db.insert("posts", {
        userId: p.userId,
        titulo: p.titulo,
        contenido: p.contenido,
        categoria: p.categoria,
        par: p.par,
        tipo: p.tipo || "general",
        esAnuncio: p.esAnuncio || false,
        likes: [],
        comentarios: [],
        compartidos: 0,
        tags: p.tags || [],
        imagenUrl: p.imagenUrl,
        tradingViewUrl: undefined,
        datosGrafico: [],
        zonaOperativa: undefined,
        sentiment: p.sentiment,
        status: "approved",
        reputationSnapshot: 0,
        badgesSnapshot: [],
        comentariosCerrados: false,
        isAiAgent: false,
        encuesta: undefined,
        communityId: undefined,
        subcommunityId: undefined,
        createdAt: now - (MAIN_POSTS.length - i) * 3600000,

      } as any);
      postIds.push(postId);
      counts.posts++;
    }

    // 5. ADD LIKES TO POSTS
    for (let i = 0; i < postIds.length; i++) {
      const likeCount = 3 + Math.floor(Math.random() * 8);
      const likers = [...allUserIds].sort(() => Math.random() - 0.5).slice(0, likeCount);
      for (const userId of likers) {
        const post = await ctx.db.get(postIds[i]);
        if (post) {
          const likes = ((post as any).likes || []) as string[];
          if (!likes.includes(userId)) {
            likes.push(userId);
            await ctx.db.patch(postIds[i], { likes } as any);
            counts.likes++;
          }
        }
      }
    }

    // 6. ADD COMMENTS TO POSTS
    for (const [postIdx, comments] of Object.entries(COMMENTS)) {
      const postId = postIds[parseInt(postIdx)];
      if (!postId) continue;
      for (const c of comments) {
        const post = await ctx.db.get(postId);
        if (post) {
          const comentarios = ((post as any).comentarios || []) as any[];
          comentarios.push({
            userId: c.userId,
            text: c.text,
            createdAt: now - Math.floor(Math.random() * 3600000 * 24),
          });
          await ctx.db.patch(postId, { comentarios } as any);
          counts.comments++;
        }
      }
    }

    // 7. SEED COMMUNITY POSTS
    for (const [slug, posts] of Object.entries(COMMUNITY_POSTS)) {
      const communityIdx = COMMUNITIES.findIndex(c => c.slug === slug);
      if (communityIdx === -1) continue;
      const communityId = communityIds[communityIdx];
      if (!communityId) continue;

      for (const p of posts) {
        await ctx.db.insert("communityPosts", {
          communityId,
          userId: p.userId,
          titulo: p.titulo,
          contenido: p.contenido,
          tipo: "text",
          imagenUrl: undefined,
          likes: [],
          commentsCount: 0,
          isPinned: false,
          isLocked: false,
          tags: p.tags || [],
          status: "active",
          createdAt: now - Math.floor(Math.random() * 86400000 * 7),
        } as any);
        counts.communityPosts++;
      }
    }

    // 8. SEED SIGNALS
    for (const s of SIGNALS) {
      const signalId = `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await ctx.db.insert("signals", {
        signalId,
        providerId: s.providerId,
        type: s.type,
        priority: s.priority,
        pair: s.pair,
        direction: s.direction,
        entryPrice: s.entryPrice,
        entryType: s.entryType,
        stopLoss: s.stopLoss,
        takeProfits: s.takeProfits,
        timeframe: s.timeframe,
        sentiment: s.sentiment,
        analysis: s.analysis,
        tags: s.tags,
        status: s.status,
        pairCategory: s.pairCategory,
        subscribersWon: Math.floor(Math.random() * 100),
        subscribersLost: Math.floor(Math.random() * 20),
        subscribersActed: Math.floor(Math.random() * 50),
        totalSubscribersNotified: Math.floor(Math.random() * 200) + 10,
        createdAt: now - Math.floor(Math.random() * 86400000 * 3),
        updatedAt: now,
        expiresAt: now + 86400000 * 7,
      } as any);
      counts.signals++;
    }

    // 9. SEED PRODUCTS
    for (const p of PRODUCTS) {
      await ctx.db.insert("products", {
        authorId: p.authorId,
        authorName: p.authorName,
        title: p.title,
        description: p.description,
        longDescription: p.description + "\n\nContenido premium creado por expertos verificados en TradeShare.",
        category: p.category,
        price: p.price,
        currency: p.currency,
        images: p.images,
        tags: p.tags,
        isPublished: p.isPublished,
        isFeatured: p.rating >= 4.7,
        rating: p.rating,
        ratingCount: Math.floor(Math.random() * 50) + 5,
        reviews: [],
        salesCount: Math.floor(Math.random() * 100),
        views: Math.floor(Math.random() * 1000) + 50,
        isDeleted: false,
        updatedAt: now,
        createdAt: now - Math.floor(Math.random() * 86400000 * 30),
      } as any);
      counts.products++;
    }

    // 10. SEED STRATEGIES
    for (const s of STRATEGIES) {
      const strategyId = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await ctx.db.insert("strategies", {
        id: strategyId,
        authorId: s.authorId,
        title: s.title,
        description: s.description,
        content: s.content,
        price: s.price,
        currency: s.currency,
        category: s.category,
        tags: s.tags,
        isPublished: s.isPublished,
        imageUrl: s.imageUrl,
        fileUrl: undefined,
        downloads: Math.floor(Math.random() * 50),
        rating: 4 + Math.random(),
        ratingCount: Math.floor(Math.random() * 20) + 1,
        createdAt: now - Math.floor(Math.random() * 86400000 * 15),
        updatedAt: now,
      } as any);
      counts.strategies++;
    }

    // 11. SEED VIDEOS
    for (const v of VIDEOS) {
      await ctx.db.insert("videos", {
        tipo: v.tipo,
        titulo: v.titulo,
        autor: v.autor,
        descripcion: v.descripcion,
        thumbnail: v.thumbnail,
        embedUrl: v.embedUrl,
        duracion: v.duracion,
        categoria: v.categoria,
        createdAt: now - Math.floor(Math.random() * 86400000 * 14),
      } as any);
      counts.videos++;
    }

    // 12. SEED QA
    for (const q of QA_ITEMS) {
      await ctx.db.insert("qa", {
        userId: q.userId,
        pregunta: q.pregunta,
        respuesta: q.respuesta,
        respondida: q.respondida,
        respondidaAt: q.respondida ? now - Math.floor(Math.random() * 86400000 * 5) : undefined,
        isAnonymous: q.isAnonymous,
        createdAt: now - Math.floor(Math.random() * 86400000 * 10),
      } as any);
      counts.qa++;
    }

    // 13. SEED REVIEWS
    for (const r of REVIEWS) {
      await ctx.db.insert("platformReviews", {
        userId: r.userId,
        rating: r.rating,
        comment: r.comment,
        createdAt: now - Math.floor(Math.random() * 86400000 * 7),

      } as any);
      counts.reviews++;
    }

    // 14. SEED NOTIFICATIONS
    for (const n of NOTIFICATIONS) {
      await ctx.db.insert("notifications", {
        userId: n.userId,
        type: n.type,
        title: n.title,
        body: n.body,
        data: undefined,
        link: undefined,
        avatarUrl: n.avatarUrl,
        read: false,
        createdAt: now - Math.floor(Math.random() * 86400000 * 3),

      } as any);
      counts.notifications++;
    }

    // 15. SEED RECURSOS
    for (const r of RECURSOS) {
      await ctx.db.insert("recursos", {
        userId: r.userId,
        titulo: r.titulo,
        descripcion: r.descripcion,
        categoria: r.categoria,
        plataforma: r.plataforma,
        precio: r.precio,
        version: r.version,
        tags: r.tags,
        archivoUrl: undefined,
        tradingViewUrl: undefined,
        likes: [],
        comentarios: [],
        descargas: Math.floor(Math.random() * 200) + 5,
        valoracion: 4 + Math.random(),
        createdAt: now - Math.floor(Math.random() * 86400000 * 20),
      } as any);
      counts.recursos++;
    }

    return {
      success: true,
      message: "TradeShare database seeded successfully!",
      counts,
    };
  },
});
