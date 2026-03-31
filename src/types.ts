export type BadgeType = 'TopAnalyst' | 'Verified' | 'EarlyBird' | 'Whale' | 'Influencer' | 'RisingStar';

export interface Usuario {
  id: string;
  nombre: string;
  usuario: string;
  email?: string;
  password?: string;
  avatar: string;
  avatarUrl?: string;
  banner?: string;
  esPro: boolean;
  esVerificado?: boolean;
  estaAuditado?: boolean;
  nivelAuditoria?: 'basico' | 'completo' | 'ejemplo';
  rol: 'admin' | 'user' | 'ceo' | 'programador' | 'diseñador' | 'colaborador' | 'trader_inicial' | 'trader_experimentado' | 'cursante' | 'vip' | 'estudiante' | 'visitante';
  experiencia?: 'beginner' | 'intermediate' | 'advanced';
  role: number;
  xp: number;
  level: number;
  biografia?: string;
  instagram?: string;
  seguidores: string[];
  siguiendo: string[];
  aportes: number;
  accuracy: number;
  reputation: number;
  badges: BadgeType[];
  watchlist: string[];
  estadisticas: {
    tasaVictoria: number;
    factorBeneficio: number;
    pnlTotal: number;
    layoutOrder?: string[];
  };
  saldo: number;
  fechaRegistro?: string;
  diasActivos?: number;
  ultimoLogin?: string;
  watchedClasses?: string[];
  mascotas?: any[];
  medallas?: any[];
  medianas?: any[];
  progreso?: Record<string, boolean>;
  lastSeen?: number;
  isBlocked?: boolean;
  blockedIPs?: string[];
  verificationPending?: boolean;
  avatarFrame?: string;
  streakReward?: string;
  userNumber?: number;
  plan?: 'free' | 'pro' | 'elite';
  dailyFreeCoinsBalance?: number;
  lastClaimDate?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  awardedBy: string;
  date: string;
}

export interface Mediana {
  id: string;
  nombre: string;
  valor: number;
  fecha?: string;
}

export type NotificacionType = 'mention' | 'like' | 'comment' | 'follow' | 'achievement' | 'level_up' | 'system' | 'message' | 'moderation' | 'suspension' | 'streak';

export interface Notificacion {
  id: string;
  tipo: NotificacionType;
  mensaje: string;
  leida: boolean;
  tiempo: string;
  link?: string;
  avatarUrl?: string;
}

export type CategoriaRecurso = 'Idea' | 'Indicador' | 'EA' | 'Estrategia';
export type Plataforma = 'TradingView' | 'Metatrader 4' | 'Metatrader 5' | 'cTrader' | 'General';
export type CategoriaPost = 'General' | 'Idea' | 'Estrategia' | 'Recurso' | 'Ayuda' | 'Curso';

export interface Clase {
  id: string;
  titulo: string;
  videoUrl: string;
  duracion: string;
  descripcion?: string;
}

export interface Curso {
  id: string;
  titulo: string;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Esencial' | 'Pro';
  duracion: string;
  lecciones: number;
  descripcion: string;
  emoji: string;
  color: string;
  videoUrl?: string;
  completado?: number;
  instructor?: string;
  contenido?: Clase[];
}

export interface Operacion {
  id: string;
  par: string;
  tipo: 'Compra' | 'Venta';
  entrada: number;
  salida: number;
  pnl: number;
  fecha: string;
  estado: 'Ganada' | 'Perdida' | 'Abierta';
}

export interface PaperTrade {
  id: string;
  par: string;
  tipo: 'Compra' | 'Venta';
  precioEntrada: number;
  estado: string;
  pnl: number;
  fecha: string;
}

export interface Encuesta {
  pregunta: string;
  opciones: { id: string; texto: string; votos: string[] }[];
  fechaFinalizacion: string;
}

export interface Noticia {
  id: string;
  fuente: string;
  tiempo: string;
  titulo: string;
  resumen: string;
  contenidoExtenso?: string;
  sentimiento: 'alcista' | 'bajista' | 'neutral';
  pares: string[];
  urlImagen: string;
  url?: string;
}

export interface TradingPattern {
  id: string;
  symbol: string;
  patternName: string;
  confidence: number;
  type: 'Bullish' | 'Bearish' | 'Neutral';
  description: string;
  timestamp: string;
  targetPrice?: number;
  stopLoss?: number;
}

export interface EventoCalendario {
  id: string;
  hora: string;
  divisa: string;
  impacto: 'alto' | 'medio' | 'bajo';
  evento: string;
  actual?: string;
  prevision: string;
  anterior: string;
  descripcion?: string;
  tendencia?: 'mejor' | 'peor' | 'neutral';
  esEnVivo?: boolean;
}

export interface MensajeChat {
  _id?: string;
  userId: string;
  nombre: string;
  avatar: string;
  texto: string;
  imagenUrl?: string;
  isAi?: boolean;
  channelId?: string;
  createdAt: number;
}

export interface MensajeChatResult {
  success: boolean;
  reason?: string;
}

export interface ConvexPost {
  _id: string;
  _creationTime: number;
  userId: string;
  titulo?: string;
  par?: string;
  tipo?: string;
  contenido: string;
  categoria: string;
  esAnuncio: boolean;
  datosGrafico?: number[];
  tradingViewUrl?: string;
  imagenUrl?: string;
  zonaOperativa?: unknown;
  likes: string[];
  comentarios: unknown[];
  tags?: string[];
  reputationSnapshot?: number;
  badgesSnapshot?: string[];
  ratings?: unknown[];
  encuesta?: unknown[];
  compartidos: number;
  comentariosCerrados?: boolean;
  isAiAgent?: boolean;
  sentiment?: string;
  createdAt: number;
  ultimaInteraccion: number;
  status?: string;
}

export type AdSector = 'sidebar' | 'feed' | 'dashboard' | 'banner' | 'cursos' | 'noticias' | 'post' | 'bitacora' | 'signals' | 'profile' | 'home' | 'community';

export interface Ad {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  videoUrl?: string;
  link: string;
  sector: AdSector;
  activo: boolean;
  subtitle?: string;
  extra?: string;
  contenido?: string;
  hasButton?: boolean;
  isInternal?: boolean;
}

export interface Herramienta {
  id: string;
  nombre: string;
  descripcion: string;
  logo: string;
  categoria: string;
  link: string;
  color: string;
  beneficio: string;
  tag: string;
  icon: string;
  activo: boolean;
}

export interface AssetsConfig {
  id: string;
  key: "grafico_assets";
  assets: AssetItem[];
}

export interface AssetItem {
  symbol: string;
  name: string;
  category: 'Forex' | 'Indices' | 'Crypto' | 'Commodities';
  exchange: string;
}

export interface BrokerConnection {
  id: string;
  broker: 'exness' | 'binance' | 'bybit' | 'coinbase' | 'kraken' | 'other';
  accountId: string;
  apiKey?: string;
  connected: boolean;
  lastSync?: number;
}

export interface BrokerCredentials {
  broker: string;
  apiKey: string;
  apiSecret?: string;
  accountId: string;
}

export interface Comentario {
  id: string;
  idUsuario: string;
  userId?: string;
  nombreUsuario: string;
  avatarUsuario: string;
  texto: string;
  tiempo: string;
  likes: string[];
  imagenUrl?: string;
  respuestas?: Comentario[];
}

export interface Estrategia {
  id: string;
  titulo: string;
  descripcion: string;
  dificultad: 'Principiante' | 'Intermedio' | 'Avanzado';
  imagenUrl: string;
  lecciones: number;
  progreso?: number;
  contenidoDetallado?: string;
}

export interface MarketplaceEstrategia {
  id: string;
  authorId: string;
  title: string;
  description: string;
  content: unknown;
  price: number;
  currency: 'USD' | 'XP';
  category: string;
  tags: string[];
  imageUrl?: string;
  downloads: number;
  rating: number;
  ratingCount?: number;
  isPublished: boolean;
  createdAt: number;
  updatedAt: number;
  author?: {
    userId: string;
    nombre: string;
    usuario: string;
    avatar?: string;
    level?: number;
  };
}

export interface Recurso {
  id: string;
  idUsuario: string;
  nombreUsuario: string;
  avatarUsuario: string;
  esPro: boolean;
  titulo: string;
  descripcion: string;
  categoria: CategoriaRecurso;
  plataforma: Plataforma;
  precio: number;
  descargas: number;
  valoracion: number;
  version: string;
  tags: string[];
  tiempo: string;
  likes: string[];
  seguidoresIdea: string[];
  comentarios: Comentario[];
  archivoUrl?: string;
  tradingViewUrl?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificacionType;
  title: string;
  body: string;
  data?: unknown;
  read: boolean;
  link?: string;
  avatarUrl?: string;
  createdAt: number;
}

export interface LiveStatus {
  isLive: boolean;
  url: string;
  lastUpdated: string;
}

export interface Publicacion {
  id: string;
  idUsuario: string;
  nombreUsuario: string;
  usuarioManejo: string;
  avatarUsuario: string;
  esPro: boolean;
  esVerificado?: boolean;
  esAnuncio?: boolean;
  categoria: CategoriaPost;
  rango?: 'Novato' | 'Analista' | 'Master';
  accuracyUser?: number;
  authorFollowers?: number;
  titulo?: string;
  par: string;
  tipo: 'Compra' | 'Venta' | 'Neutral';
  contenido: string;
  datosGrafico: number[];
  tiempo: string;
  ultimaInteraccion: number;
  likes: string[];
  seguidoresPost: string[];
  comentarios: Comentario[];
  compartidos: number;
  comentariosCerrados?: boolean;
  tradingViewUrl?: string;
  imagenUrl?: string;
  videoUrl?: string;
  tags?: string[];
  reputationSnapshot?: number;
  badgesSnapshot?: BadgeType[];
  downloads?: number;
  ratings?: { userId: string; score: number }[];
  isAiAgent?: boolean;
  isSignal?: boolean;
  signalDetails?: {
    entryPrice: string;
    stopLoss: string;
    takeProfits: string[];
    direction: 'buy' | 'sell';
  };
  fuente?: string;
  sentiment?: string;
  status?: 'active' | 'trash';
  zonaOperativa?: {
    inicio?: string;
    fin?: string;
  };
  avatarFrame?: string;
  puntos?: number;
  tokenTipsReceived?: number;
  tokenTipsCount?: number;
  userPuntosGiven?: number; // Puntos que el usuario actual ya dio a este post
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // user IDs
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  expiresAt?: number;
  active: boolean;
  createdAt: number;
  createdBy?: string;
}
