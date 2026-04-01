export interface ChatMessage {
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

export interface Channel {
  _id: string;
  name: string;
  slug: string;
  type: 'global' | 'community' | 'direct';
}

export interface User {
  id: string;
  nombre: string;
  avatar: string;
}
