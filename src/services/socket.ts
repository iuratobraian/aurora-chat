
import { Publicacion, Ad, Usuario } from '../types';
import logger from '../utils/logger';

type SocketEvent =
    | { type: 'init', data: { posts: Publicacion[], ads: Ad[], users: Usuario[] } }
    | { type: 'post:created', data: Publicacion }
    | { type: 'post:updated', data: Publicacion }
    | { type: 'post:deleted', data: { id: string } }
    | { type: 'ad:saved', data: Ad }
    | { type: 'ad:deleted', data: { id: string } }
    | { type: 'user:saved', data: Usuario };

type Listener = (event: SocketEvent) => void;

class SocketService {
    private listeners: Set<Listener> = new Set();

    constructor() {
        this.connect();
    }

    private connect() {
        // WebSocket disabled - Real-time sync is now handled by Convex
        logger.warn('WebSocket connection disabled. Using Convex for real-time.');
    }

    public send(type: string, data: any) {
        // No-op: handled by Convex
    }

    public subscribe(listener: Listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify(event: SocketEvent) {
        this.listeners.forEach(l => l(event));
    }
}

export const socketService = new SocketService();
