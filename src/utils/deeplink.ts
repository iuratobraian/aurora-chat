export interface DeepLink {
  section?: string;
  action?: string;
  id?: string;
  params?: Record<string, string>;
}

const ROUTE_MAP: Record<string, string> = {
  // Main sections
  'comunidad': 'comunidad',
  'grafico': 'grafico',
  'exness': 'exness',
  'cursos': 'cursos',
  'psicotrading': 'psicotrading',
  'bitacora': 'bitacora',
  'perfil': 'perfil',
  'config': 'configuracion',
  'academia': 'academia',
  'admin': 'admin',
  'pricing': 'pricing',
  'creator': 'creator',
  'dashboard': 'creator-dashboard',
  'leaderboard': 'leaderboard',
  'discover': 'discover',
  'marketplace': 'marketplace',
  'referrals': 'referrals',
  'propfirms': 'propfirms',
  'signals': 'signals',
  'juegos': 'juegos',
  'saboteador': 'saboteador',
  'marketing': 'marketing',
  
  // Entity routes (when used as section)
  'u': 'u',
  'user': 'u',
  'p': 'p',
  'post': 'p',
  'c': 'c',
  'community': 'c',
  's': 's',
  'signal': 'signal',
  'course': 'course',
  'subcommunity': 'subcommunity',
  'checkout': 'checkout',
};

export const URL_PATTERNS = {
  // User profiles: /u/username
  user: (username: string) => `/u/${username}`,
  userById: (userId: string) => `/u/id/${userId}`,
  
  // Posts: /p/postId
  post: (postId: string) => `/p/${postId}`,
  
  // Communities: /c/community-slug
  community: (slug: string) => `/c/${slug}`,
  
  // Subcommunities: /c/community-slug/s/subcommunity-slug
  subcommunity: (parentSlug: string, subSlug: string) => `/c/${parentSlug}/s/${subSlug}`,
  
  // Signals: /signal/signalId
  signal: (signalId: string) => `/signal/${signalId}`,
  
  // Courses: /course/courseId
  course: (courseId: string) => `/course/${courseId}`,
  
  // Creator pages: /creator/username
  creator: (username: string) => `/creator/${username}`,
  
  // Checkout
  checkoutSuccess: (sessionId: string) => `/checkout/success?session_id=${sessionId}`,
  checkoutCancel: (plan?: string) => `/checkout/cancel${plan ? `?plan=${plan}` : ''}`,
  
  // Main sections
  home: () => '/',
  comunidad: () => '/comunidad',
  discover: () => '/discover',
  signals: () => '/signals',
  pricing: () => '/pricing',
  courses: () => '/cursos',
  leaderboard: () => '/leaderboard',
  marketplace: () => '/marketplace',
} as const;

export function parseDeepLink(url: string): DeepLink | null {
  try {
    const urlObj = new URL(url, window.location.origin);
    const pathname = urlObj.pathname;
    const hash = urlObj.hash.replace('#', '');
    const tab = urlObj.searchParams.get('tab');
    const action = urlObj.searchParams.get('action');
    const id = urlObj.searchParams.get('id');
    
    // Check for entity-based URLs first
    // /u/username or /u/id/userId
    const userMatch = pathname.match(/^\/u\/(?:id\/)?([^/]+)$/);
    if (userMatch) {
      return {
        section: 'u',
        id: userMatch[1],
        params: Object.fromEntries(urlObj.searchParams.entries()),
      };
    }
    
    // /p/postId
    const postMatch = pathname.match(/^\/p\/([^/]+)$/);
    if (postMatch) {
      return {
        section: 'p',
        id: postMatch[1],
        params: Object.fromEntries(urlObj.searchParams.entries()),
      };
    }
    
    // /c/communitySlug or /c/communitySlug/s/subcommunitySlug
    const communityMatch = pathname.match(/^\/c\/([^/]+)(?:\/s\/([^/]+))?$/);
    if (communityMatch) {
      return {
        section: communityMatch[2] ? 'subcommunity' : 'c',
        id: communityMatch[1],
        action: communityMatch[2] || undefined,
        params: Object.fromEntries(urlObj.searchParams.entries()),
      };
    }
    
    // /signal/signalId
    const signalMatch = pathname.match(/^\/signal\/([^/]+)$/);
    if (signalMatch) {
      return {
        section: 'signal',
        id: signalMatch[1],
        params: Object.fromEntries(urlObj.searchParams.entries()),
      };
    }
    
    // /course/courseId
    const courseMatch = pathname.match(/^\/course\/([^/]+)$/);
    if (courseMatch) {
      return {
        section: 'course',
        id: courseMatch[1],
        params: Object.fromEntries(urlObj.searchParams.entries()),
      };
    }
    
    // /creator/username
    const creatorMatch = pathname.match(/^\/creator\/([^/]+)$/);
    if (creatorMatch) {
      return {
        section: 'creator',
        id: creatorMatch[1],
        params: Object.fromEntries(urlObj.searchParams.entries()),
      };
    }
    
    // /checkout/success or /checkout/cancel
    const checkoutMatch = pathname.match(/^\/checkout\/(success|cancel)$/);
    if (checkoutMatch) {
      return {
        section: 'checkout',
        action: checkoutMatch[1],
        params: Object.fromEntries(urlObj.searchParams.entries()),
      };
    }
    
    // Fallback to hash/tab-based routing
    const section = hash || tab;
    if (!section) return null;
    
    const normalizedSection = ROUTE_MAP[section.toLowerCase()] || section;
    
    return {
      section: normalizedSection,
      action: action || undefined,
      id: id || undefined,
      params: Object.fromEntries(urlObj.searchParams.entries()),
    };
  } catch {
    return null;
  }
}

export function buildDeepLink(section: string, options?: { action?: string; id?: string; params?: Record<string, string> }): string {
  const base = window.location.origin;
  
  // Handle new URL patterns
  if (section === 'u' && options?.id) {
    return `${base}/u/${options.id}`;
  }
  if (section === 'p' && options?.id) {
    return `${base}/p/${options.id}`;
  }
  if (section === 'c' && options?.id) {
    return `${base}/c/${options.id}`;
  }
  if (section === 'subcommunity' && options?.id && options?.action) {
    return `${base}/c/${options.id}/s/${options.action}`;
  }
  if (section === 'signal' && options?.id) {
    return `${base}/signal/${options.id}`;
  }
  if (section === 'course' && options?.id) {
    return `${base}/course/${options.id}`;
  }
  if (section === 'creator' && options?.id) {
    return `${base}/creator/${options.id}`;
  }
  if (section === 'checkout') {
    const params = new URLSearchParams();
    if (options?.id) params.set('session_id', options.id);
    if (options?.action) params.set('plan', options.action);
    return `${base}/checkout/${options?.action || 'cancel'}${params.toString() ? '?' + params.toString() : ''}`;
  }
  
  // Fallback to hash-based routing
  const normalizedSection = Object.entries(ROUTE_MAP).find(([k]) => k === section)?.[1] || section;
  
  const params = new URLSearchParams();
  if (options?.action) params.set('action', options.action);
  if (options?.id) params.set('id', options.id);
  if (options?.params) {
    Object.entries(options.params).forEach(([k, v]) => params.set(k, v));
  }
  
  const queryString = params.toString();
  return `${base}/#${normalizedSection}${queryString ? '?' + queryString : ''}`;
}

export function getShareableLink(section: string, id?: string, action?: string): string {
  return buildDeepLink(section, { id, action });
}

export function initDeepLinking(onNavigate: (section: string, options?: DeepLink) => void): () => void {
  const handleLink = (e?: PopStateEvent) => {
    const deepLink = parseDeepLink(window.location.href);
    if (deepLink?.section) {
      onNavigate(deepLink.section, deepLink);
    }
  };
  
  window.addEventListener('popstate', handleLink);
  handleLink();
  
  const unsubscribe = () => {
    window.removeEventListener('popstate', handleLink);
  };
  
  return unsubscribe;
}

export function navigateToSection(section: string, options?: { action?: string; id?: string; replace?: boolean }): void {
  const url = buildDeepLink(section, options);
  
  if (options?.replace) {
    window.history.replaceState(null, '', url);
  } else {
    window.history.pushState(null, '', url);
  }
  
  window.dispatchEvent(new CustomEvent('deep-link-navigate', {
    detail: { section, options }
  }));
}

export function initNavigationListener(callback: (section: string, options?: DeepLink) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<{ section: string; options?: DeepLink }>;
    callback(customEvent.detail.section, customEvent.detail.options);
  };
  
  window.addEventListener('deep-link-navigate', handler);
  
  return () => {
    window.removeEventListener('deep-link-navigate', handler);
  };
}
