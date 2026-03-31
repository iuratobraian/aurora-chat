import { create } from 'zustand';

export type DataSource = 'convex' | 'localStorage' | 'offline';

interface DataSourceState {
  posts: DataSource;
  users: DataSource;
  notifications: DataSource;
  ads: DataSource;
  syncStatus: 'synced' | 'pending' | 'error';
  lastError: string | null;
  setSource: (domain: 'posts' | 'users' | 'notifications' | 'ads', source: DataSource) => void;
  setSyncStatus: (status: 'synced' | 'pending' | 'error') => void;
  setError: (error: string | null) => void;
  isDegraded: () => boolean;
}

export const useDataSourceStore = create<DataSourceState>((set, get) => ({
  posts: 'convex',
  users: 'convex',
  notifications: 'convex',
  ads: 'convex',
  syncStatus: 'synced',
  lastError: null,

  setSource: (domain, source) => set({ [domain]: source }),

  setSyncStatus: (status) => set({ syncStatus: status }),

  setError: (error) => set({ lastError: error, syncStatus: error ? 'error' : get().syncStatus }),

  isDegraded: () => {
    const state = get();
    return (
      state.posts === 'localStorage' ||
      state.users === 'localStorage' ||
      state.notifications === 'localStorage' ||
      state.ads === 'localStorage' ||
      state.syncStatus === 'error'
    );
  },
}));

export const DEGRADATION_MESSAGES = {
  posts: '⚠️ Feed en modo local. Los cambios se sincronizarán cuando el servidor esté disponible.',
  users: '⚠️ Datos de usuario en modo local.',
  notifications: '⚠️ Notificaciones en modo local.',
  ads: '⚠️ Anuncios en modo local.',
  sync: '⚠️ Error de sincronización. Verificando conexión...',
  offline: '🌐 Sin conexión a internet. Trabajando en modo offline.',
};

export const isAcceptableLocalStorage = (key: string): boolean => {
  const acceptableKeys = [
    'tradehub_language',
    'theme',
    'tradehub_theme',
    'tradehub_dock_position',
    'tradehub_font_size',
    'tradehub_animations_enabled',
    'tradehub_reduced_motion',
    'tradehub_notifications_enabled',
    'tradehub_sound_enabled',
    'tradehub_compact_mode',
    'tradehub_sidebar_collapsed',
    'tradehub_last_visited',
    'onboarding_completed',
    'convex_deployment_url',
  ];

  const isCache = key.startsWith('cache_') || key.startsWith('tmp_');
  const isAcceptable = acceptableKeys.some(k => key.includes(k));

  return isCache || isAcceptable;
};

export const getLocalStorageUsage = (): { count: number; keys: string[]; acceptableKeys: string[]; problematicKeys: string[] } => {
  const keys = Object.keys(localStorage);
  const acceptableKeys = keys.filter(isAcceptableLocalStorage);
  const problematicKeys = keys.filter(k => !isAcceptableLocalStorage(k));

  return {
    count: keys.length,
    keys,
    acceptableKeys,
    problematicKeys,
  };
};
