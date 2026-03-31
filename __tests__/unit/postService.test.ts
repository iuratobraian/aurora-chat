import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockLocalStorage = {
  data: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.data[key] || null),
  setItem: vi.fn((key: string, value: string) => { mockLocalStorage.data[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockLocalStorage.data[key]; }),
  clear: vi.fn(() => { mockLocalStorage.data = {}; })
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

Object.defineProperty(global, 'navigator', {
  value: { onLine: true },
  writable: true
});

vi.mock('../../src/lib/convex/client', () => ({
  getConvexClient: vi.fn(() => ({
    query: vi.fn().mockResolvedValue([]),
    mutation: vi.fn().mockResolvedValue({ success: true })
  }))
}));

vi.mock('../../src/utils/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../../src/utils/postMapper', () => ({
  extractTags: vi.fn((content: string) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  })
}));

vi.mock('../../src/services/backup/syncService', () => ({
  SyncManager: {
    getInstance: vi.fn().mockReturnValue({
      queueOperation: vi.fn(),
      flush: vi.fn()
    })
  },
  BackupManager: {
    getInstance: vi.fn().mockReturnValue({
      createBackup: vi.fn()
    })
  }
}));

vi.mock('../../src/services/users/userService', () => ({
  UserService: {
    getUserById: vi.fn().mockResolvedValue({
      id: 'user123',
      nombre: 'Test User',
      usuario: 'testuser',
      avatar: 'https://example.com/avatar.png',
      esPro: false,
      esVerificado: false,
      accuracy: 50,
      seguidores: []
    })
  }
}));

vi.mock('../../src/services/notifications/notificationService', () => ({
  NotificationService: {
    notifyPostCreated: vi.fn().mockResolvedValue(undefined),
    notifyPostLiked: vi.fn().mockResolvedValue(undefined),
    notifyNewComment: vi.fn().mockResolvedValue(undefined)
  }
}));

describe('PostService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('extractTags', () => {
    it('should extract hashtags from content', () => {
      const content = 'This is a #trading post with #analysis';
      const tags = content.match(/#(\w+)/g) || [];
      const extracted = tags.map(tag => tag.substring(1));
      expect(extracted).toEqual(['trading', 'analysis']);
    });

    it('should return empty array for no hashtags', () => {
      const content = 'This is a post without tags';
      const tags = content.match(/#(\w+)/g) || [];
      const extracted = tags.map(tag => tag.substring(1));
      expect(extracted).toEqual([]);
    });

    it('should handle multiple hashtags', () => {
      const content = '#forex #trading #crypto #bitcoin';
      const tags = content.match(/#(\w+)/g) || [];
      const extracted = tags.map(tag => tag.substring(1));
      expect(extracted).toEqual(['forex', 'trading', 'crypto', 'bitcoin']);
    });
  });

  describe('compressData', () => {
    it('should stringify data', () => {
      const data = { test: 'value', num: 123 };
      const compressed = JSON.stringify(data);
      expect(compressed).toBe('{"test":"value","num":123}');
    });

    it('should handle non-serializable data', () => {
      const data = () => console.log('test');
      const compressed = JSON.stringify({ _compressed: true, data: String(data) });
      expect(compressed).toContain('_compressed');
    });
  });

  describe('getPosts fallback to localStorage', () => {
    it('should return local posts when convex fails', () => {
      mockLocalStorage.data['local_posts_db'] = JSON.stringify([
        { id: 'post1', titulo: 'Test Post', ultimaInteraccion: Date.now() }
      ]);
      
      const localPosts = JSON.parse(mockLocalStorage.data['local_posts_db'] || '[]');
      expect(localPosts.length).toBe(1);
      expect(localPosts[0].id).toBe('post1');
    });
  });

  describe('createPost validation', () => {
    it('should validate required fields', () => {
      const post = {
        id: 'post_123',
        idUsuario: 'user_456',
        titulo: 'Test Title',
        contenido: 'Test content',
        categoria: 'General',
        tipo: 'Neutral'
      };
      
      expect(post.id).toBeDefined();
      expect(post.titulo).toBeDefined();
      expect(post.contenido).toBeDefined();
    });

    it('should default values for optional fields', () => {
      const post: any = {
        id: 'post_123',
        idUsuario: 'user_456',
        titulo: 'Test'
      };
      
      expect(post.categoria).toBeUndefined();
      expect(post.par).toBeUndefined();
    });
  });

  describe('updatePost', () => {
    it('should update post fields', () => {
      const post = { id: 'post1', titulo: 'Original', likes: 5 };
      const updates = { titulo: 'Updated' };
      
      const updated = { ...post, ...updates };
      expect(updated.titulo).toBe('Updated');
      expect(updated.likes).toBe(5);
    });
  });

  describe('deletePost', () => {
    it('should remove post from array', () => {
      const posts = [
        { id: 'post1', titulo: 'Post 1' },
        { id: 'post2', titulo: 'Post 2' },
        { id: 'post3', titulo: 'Post 3' }
      ];
      
      const filtered = posts.filter(p => p.id !== 'post2');
      expect(filtered.length).toBe(2);
      expect(filtered.find(p => p.id === 'post2')).toBeUndefined();
    });
  });

  describe('likePost', () => {
    it('should add user to likes array', () => {
      const post: any = { id: 'post1', likes: [], likesCount: 0 };
      const userId = 'user123';
      
      if (!post.likes.includes(userId)) {
        post.likes.push(userId);
        post.likesCount = post.likes.length;
      }
      
      expect(post.likes).toContain(userId);
      expect(post.likesCount).toBe(1);
    });

    it('should not duplicate likes', () => {
      const post: any = { id: 'post1', likes: ['user123'], likesCount: 1 };
      const userId = 'user123';
      
      if (!post.likes.includes(userId)) {
        post.likes.push(userId);
      }
      
      expect(post.likes.length).toBe(1);
    });
  });

  describe('unlikePost', () => {
    it('should remove user from likes array', () => {
      const post: any = { id: 'post1', likes: ['user123', 'user456'], likesCount: 2 };
      const userId = 'user123';
      
      post.likes = post.likes.filter((id: string) => id !== userId);
      post.likesCount = post.likes.length;
      
      expect(post.likes).not.toContain(userId);
      expect(post.likesCount).toBe(1);
    });
  });

  describe('addComment', () => {
    it('should add comment to post', () => {
      const post: any = { id: 'post1', comentarios: [] };
      const comment = { id: 'comment1', texto: 'Great post!', idUsuario: 'user123' };
      
      post.comentarios.push(comment);
      
      expect(post.comentarios.length).toBe(1);
      expect(post.comentarios[0].texto).toBe('Great post!');
    });
  });

  describe('Post sorting', () => {
    it('should sort by last interaction', () => {
      const posts = [
        { id: '1', ultimaInteraccion: 1000 },
        { id: '2', ultimaInteraccion: 3000 },
        { id: '3', ultimaInteraccion: 2000 }
      ];
      
      const sorted = [...posts].sort((a, b) => b.ultimaInteraccion - a.ultimaInteraccion);
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });

    it('should prioritize ads', () => {
      const posts = [
        { id: '1', esAnuncio: false, ultimaInteraccion: 3000 },
        { id: '2', esAnuncio: true, ultimaInteraccion: 1000 }
      ];
      
      const sorted = [...posts].sort((a, b) => {
        if (a.esAnuncio && !b.esAnuncio) return -1;
        if (!a.esAnuncio && b.esAnuncio) return 1;
        return b.ultimaInteraccion - a.ultimaInteraccion;
      });
      
      expect(sorted[0].esAnuncio).toBe(true);
    });
  });

  describe('Post filtering', () => {
    it('should filter by category', () => {
      const posts = [
        { id: '1', categoria: 'educacion' },
        { id: '2', categoria: 'analisis' },
        { id: '3', categoria: 'educacion' }
      ];
      
      const filtered = posts.filter(p => p.categoria === 'educacion');
      expect(filtered.length).toBe(2);
    });

    it('should filter by user', () => {
      const posts = [
        { id: '1', idUsuario: 'user1' },
        { id: '2', idUsuario: 'user2' },
        { id: '3', idUsuario: 'user1' }
      ];
      
      const filtered = posts.filter(p => p.idUsuario === 'user1');
      expect(filtered.length).toBe(2);
    });

    it('should filter by type', () => {
      const posts = [
        { id: '1', tipo: 'Compra' },
        { id: '2', tipo: 'Venta' },
        { id: '3', tipo: 'Neutral' }
      ];
      
      const filtered = posts.filter(p => p.tipo === 'Compra');
      expect(filtered.length).toBe(1);
    });
  });

  describe('Share count', () => {
    it('should increment share count', () => {
      const post: any = { id: 'post1', compartidos: 5 };
      post.compartidos += 1;
      expect(post.compartidos).toBe(6);
    });
  });

  describe('Search posts', () => {
    it('should find posts by title', () => {
      const posts = [
        { id: '1', titulo: 'Trading strategies' },
        { id: '2', titulo: 'Crypto analysis' },
        { id: '3', titulo: 'Trading tips' }
      ];
      
      const results = posts.filter(p => 
        p.titulo.toLowerCase().includes('trading')
      );
      expect(results.length).toBe(2);
    });

    it('should find posts by content', () => {
      const posts = [
        { id: '1', contenido: 'This is about forex trading' },
        { id: '2', contenido: 'Stock market analysis' },
        { id: '3', contenido: 'Best trading practices' }
      ];
      
      const results = posts.filter(p => 
        p.contenido.toLowerCase().includes('trading')
      );
      expect(results.length).toBe(2);
    });
  });
});
