import { Noticia, EventoCalendario, Operacion, Estrategia, Recurso } from './types';

export const NOTICIAS_MOCK: Noticia[] = [
  {
    id: '1',
    fuente: 'Bloomberg',
    tiempo: 'Hace 15m',
    titulo: 'FED Powell: "No hay prisa por recortar tasas"',
    resumen: 'El presidente de la Fed mantiene la cautela ante los datos de inflación persistente, enfriando las expectativas de junio. Los mercados reaccionan con volatilidad en los pares mayores.',
    sentimiento: 'bajista',
    pares: ['EURUSD', 'XAUUSD'],
    urlImagen: 'https://picsum.photos/seed/news_fed/200/200',
    url: 'https://www.bloomberg.com/markets'
  },
  {
    id: '2',
    fuente: 'ForexLive',
    tiempo: 'Hace 45m',
    titulo: 'El Yen se desploma tras la decisión del BOJ',
    resumen: 'USDJPY rompe la barrera de 155.00 mientras el Banco de Japón mantiene su política ultra laxa sin cambios significativos. Analistas sugieren una posible intervención del gobierno japonés.',
    sentimiento: 'alcista',
    pares: ['USDJPY', 'GBPJPY'],
    urlImagen: 'https://picsum.photos/seed/news_yen/200/200',
    url: 'https://www.forexlive.com/'
  },
  {
    id: '3',
    fuente: 'Reuters',
    tiempo: 'Hace 2h',
    titulo: 'Petróleo WTI supera los $80 por tensiones en Ormuz',
    resumen: 'La escalada geopolítica impulsa los precios del crudo. Inventarios de la API muestran una caída inesperada, añadiendo presión alcista al mercado energético.',
    sentimiento: 'alcista',
    pares: ['USOIL'],
    urlImagen: 'https://picsum.photos/seed/news_oil/200/200',
    url: 'https://www.reuters.com/business/energy/'
  }
];

export const EVENTOS_MOCK: EventoCalendario[] = [
  {
    id: '1',
    hora: '08:30',
    divisa: 'USD',
    impacto: 'alto',
    evento: 'Non-Farm Employment Change',
    actual: '275K',
    prevision: '200K',
    anterior: '229K',
    tendencia: 'mejor'
  },
  {
    id: '2',
    hora: '08:30',
    divisa: 'USD',
    impacto: 'alto',
    evento: 'Unemployment Rate',
    actual: '3.9%',
    prevision: '3.7%',
    anterior: '3.7%',
    tendencia: 'peor'
  },
  {
    id: '3',
    hora: '10:00',
    divisa: 'USD',
    impacto: 'medio',
    evento: 'ISM Services PMI',
    actual: '',
    prevision: '53.0',
    anterior: '53.4',
    esEnVivo: false
  },
  {
    id: '4',
    hora: '14:00',
    divisa: 'USD',
    impacto: 'alto',
    evento: 'FOMC Meeting Minutes',
    actual: '',
    prevision: '',
    anterior: '',
    esEnVivo: false
  }
];

export const OPERACIONES_MOCK: Operacion[] = [
  {
    id: 'o1',
    par: 'XAU/USD',
    tipo: 'Compra',
    entrada: 2024.50,
    salida: 2040.10,
    pnl: 1560.00,
    fecha: '12 Feb',
    estado: 'Ganada'
  }
];

export const ESTRATEGIAS_MOCK: Estrategia[] = [
    {
        id: '1',
        titulo: 'Smart Money Concepts (SMC)',
        descripcion: 'Aprende a identificar bloques de órdenes, liquidez y estructuras de mercado institucionales.',
        dificultad: 'Avanzado',
        imagenUrl: 'https://picsum.photos/seed/smc/300/200',
        lecciones: 12,
        progreso: 0
    },
    {
        id: '2',
        titulo: 'Scalping con EMAs',
        descripcion: 'Estrategia de alta frecuencia utilizando medias móviles exponenciales en 1m y 5m.',
        dificultad: 'Intermedio',
        imagenUrl: 'https://picsum.photos/seed/emas/300/200',
        lecciones: 5,
        progreso: 30
    },
    {
        id: '3',
        titulo: 'Fundamentos de Forex',
        descripcion: 'Todo lo que necesitas saber para empezar: Lotes, Pips, Sesiones y Pares.',
        dificultad: 'Principiante',
        imagenUrl: 'https://picsum.photos/seed/forex/300/200',
        lecciones: 8,
        progreso: 100
    }
];

export const RECURSOS_MOCK: Recurso[] = [
    {
        id: 'r1',
        idUsuario: 'admin',
        nombreUsuario: 'System',
        avatarUsuario: '',
        esPro: true,
        titulo: 'Position Size Calculator',
        descripcion: 'EA para MT4 que calcula lotaje automático basado en riesgo.',
        categoria: 'EA',
        plataforma: 'Metatrader 4',
        precio: 0,
        descargas: 1205,
        valoracion: 4.8,
        version: '2.1',
        tags: ['Risk', 'Utility'],
        tiempo: '2024',
        likes: [],
        seguidoresIdea: [],
        comentarios: []
    },
    {
        id: 'r2',
        idUsuario: 'u2',
        nombreUsuario: 'TraderJoe',
        avatarUsuario: '',
        esPro: false,
        titulo: 'Supply & Demand Zones',
        descripcion: 'Indicador que dibuja zonas de oferta y demanda automáticamente.',
        categoria: 'Indicador',
        plataforma: 'TradingView',
        precio: 0,
        descargas: 850,
        valoracion: 4.5,
        version: '1.0',
        tags: ['SMC', 'Zones'],
        tiempo: '2024',
        likes: [],
        seguidoresIdea: [],
        comentarios: []
    }
];