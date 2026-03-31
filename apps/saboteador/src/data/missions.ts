import type { Mission } from '../types';

export const missionsData: Mission[] = [
  {
    id: 1,
    type: 'choose',
    title: 'Afore o Casino',
    description: '¿Qué prefieres: seguridad financiera o riesgo con grandes ganancias?',
    data: { options: ['Afore (Seguro)', 'Casino (Arriesgado)'] },
    sabotageVotes: 0,
    teamSize: 3,
  },
  {
    id: 2,
    type: 'choose',
    title: 'Verde o Rojo',
    description: 'El mercado está indeciso. ¿Qué color ves?',
    data: { options: ['Verde (Subida)', 'Rojo (Bajada)'] },
    sabotageVotes: 0,
    teamSize: 3,
  },
  {
    id: 3,
    type: 'choose',
    title: '1-100',
    description: 'Adivina el número secreto del grupo. La persona más cercana gana.',
    data: { type: 'number', answer: 42 },
    sabotageVotes: 0,
    teamSize: 3,
  },
  {
    id: 4,
    type: 'choose',
    title: 'Favorito del Grupo',
    description: '¿Quién es tu compañero favorito en este momento?',
    data: {},
    sabotageVotes: 0,
    teamSize: 3,
  },
  {
    id: 5,
    type: 'choose',
    title: 'Menos Confiable',
    description: '¿A quién no信任ías con tu dinero?',
    data: {},
    sabotageVotes: 0,
    teamSize: 3,
  },
  {
    id: 6,
    type: 'dilemma',
    title: 'El Dilema del Prisionero',
    description: '¿Traicionas al grupo por seguridad individual o cooperas?',
    data: {},
    sabotageVotes: 0,
    teamSize: 3,
  },
  {
    id: 7,
    type: 'decrypt',
    title: 'Código Secreto',
    description: 'Memoriza estos 4 dígitos: 7-2-9-4',
    data: { code: [7, 2, 9, 4] },
    sabotageVotes: 0,
    teamSize: 3,
  },
  {
    id: 8,
    type: 'intruder',
    title: 'El Intruso',
    description: '¿Cuál palabra no encaja?',
    data: {
      words: ['Bitcoin', 'Ethereum', 'Dogecoin', 'Peso'],
      intruder: 'Peso',
    },
    sabotageVotes: 0,
    teamSize: 3,
  },
  {
    id: 9,
    type: 'sequence',
    title: 'Secuencia de Colores',
    description: 'Observa la secuencia: Rojo → Azul → Verde → Rojo',
    data: { sequence: ['rojo', 'azul', 'verde', 'rojo'] },
    sabotageVotes: 0,
    teamSize: 3,
  },
  {
    id: 10,
    type: 'choose',
    title: 'Bono o Castigo',
    description: '¿Inviertes en el bien común o buscas tu beneficio?',
    data: { options: ['Bono (Grupo)', 'Castigo (Personal)'] },
    sabotageVotes: 0,
    teamSize: 3,
  },
  {
    id: 11,
    type: 'choose',
    title: 'Puerta Izquierda o Derecha',
    description: 'Dos caminos. Elige sabiamente.',
    data: { options: ['Izquierda', 'Derecha'] },
    sabotageVotes: 0,
    teamSize: 3,
  },
  {
    id: 12,
    type: 'choose',
    title: 'Cara o Cruz',
    description: 'La suerte decide. ¿Apuestas a cara o cruz?',
    data: { options: ['Cara', 'Cruz'] },
    sabotageVotes: 0,
    teamSize: 3,
  },
  {
    id: 13,
    type: 'react',
    title: 'Quién No Está',
    description: 'Memoriza los nombres de tus compañeros. Luego adivina quién falta.',
    data: { count: 3 },
    sabotageVotes: 0,
    teamSize: 3,
  },
  {
    id: 14,
    type: 'decrypt',
    title: 'Código Morse',
    description: '¿Cuál es el mensaje oculto?',
    data: { pattern: '短的长的短短' },
    sabotageVotes: 0,
    teamSize: 3,
  },
  {
    id: 15,
    type: 'decide',
    title: 'Reparto del Tesoro',
    description: 'El grupo tiene 100 monedas. ¿Cómo las repartimos?',
    data: { total: 100 },
    sabotageVotes: 0,
    teamSize: 3,
  },
];

export function getRandomMission(excludeIds: number[] = []): Mission {
  const available = missionsData.filter(m => !excludeIds.includes(m.id));
  return available[Math.floor(Math.random() * available.length)];
}

export function getMissionById(id: number): Mission | undefined {
  return missionsData.find(m => m.id === id);
}

export default missionsData;
