interface RecursoEducativo {
  id: string;
  tipo: 'video' | 'pdf';
  titulo: string;
  autor: string;
  descripcion: string;
  thumbnail: string;
  embedUrl: string;
  duracion: string;
  categoria: 'Libros' | 'Podcast' | 'Psicotrading' | 'Audiolibros';
}

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';

interface YouTubeSearchResult {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    thumbnails: { medium: { url: string }; high: { url: string } };
    publishedAt: string;
  };
}

interface YouTubeVideoDetail {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    thumbnails: { medium: { url: string }; high: { url: string } };
    publishedAt: string;
  };
  contentDetails: { duration: string };
  statistics: { viewCount: string; likeCount: string };
}

export const YouTubePsychotradingExtractor = {
  SEARCH_QUERIES: [
    'psicotrading trading psychology',
    'trading mindset discipline',
    'emociones trading forex',
    'psychology of successful traders',
    'trading fear greed control',
    'trader mental health stress',
    'market psychology trading patterns',
    'trading journal emotional control',
  ],

  MIN_VIEWS: 10000,
  MIN_LIKES: 500,
  MIN_DURATION_SECONDS: 300,

  parseDuration: (isoDuration: string): number => {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
  },

  formatDuration: (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  },

  extractThumbnail: (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  },

  fetchYouTubeVideos: async (query: string, maxResults: number = 10): Promise<YouTubeSearchResult[]> => {
    if (!YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured');
      return [];
    }

    try {
      const url = new URL('https://www.googleapis.com/youtube/v3/search');
      url.searchParams.set('key', YOUTUBE_API_KEY);
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('q', query);
      url.searchParams.set('type', 'video');
      url.searchParams.set('maxResults', maxResults.toString());
      url.searchParams.set('order', 'relevance');
      url.searchParams.set('videoDuration', 'medium');
      url.searchParams.set('relevanceLanguage', 'es');

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error(`YouTube search failed for "${query}":`, error);
      return [];
    }
  },

  fetchVideoDetails: async (videoIds: string[]): Promise<YouTubeVideoDetail[]> => {
    if (!YOUTUBE_API_KEY || videoIds.length === 0) return [];

    try {
      const url = new URL('https://www.googleapis.com/youtube/v3/videos');
      url.searchParams.set('key', YOUTUBE_API_KEY);
      url.searchParams.set('part', 'snippet,contentDetails,statistics');
      url.searchParams.set('id', videoIds.join(','));

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('YouTube video details fetch failed:', error);
      return [];
    }
  },

  filterHighQualityVideos: (videos: YouTubeVideoDetail[]): YouTubeVideoDetail[] => {
    return videos.filter(video => {
      const viewCount = parseInt(video.statistics?.viewCount || '0');
      const likeCount = parseInt(video.statistics?.likeCount || '0');
      const duration = YouTubePsychotradingExtractor.parseDuration(
        video.contentDetails?.duration || 'PT0S'
      );

      return (
        viewCount >= YouTubePsychotradingExtractor.MIN_VIEWS &&
        likeCount >= YouTubePsychotradingExtractor.MIN_LIKES &&
        duration >= YouTubePsychotradingExtractor.MIN_DURATION_SECONDS
      );
    });
  },

  convertToRecurso: (
    video: YouTubeVideoDetail,
    categoria: 'Psicotrading' | 'Libros' | 'Podcast' | 'Audiolibros' = 'Psicotrading'
  ): RecursoEducativo => {
    const videoId = video.id;
    const duration = YouTubePsychotradingExtractor.parseDuration(
      video.contentDetails?.duration || 'PT0S'
    );

    return {
      id: `yt_${videoId}`,
      tipo: 'video',
      titulo: video.snippet.title.replace(/[^a-zA-Z0-9\s\p{P}]/gu, ''),
      autor: video.snippet.channelTitle,
      descripcion: video.snippet.description.substring(0, 300),
      thumbnail: video.snippet.thumbnails?.high?.url || 
                  video.snippet.thumbnails?.medium?.url || 
                  YouTubePsychotradingExtractor.extractThumbnail(videoId),
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      duracion: YouTubePsychotradingExtractor.formatDuration(duration),
      categoria,
    };
  },

  extractAllPsychotradingContent: async (): Promise<RecursoEducativo[]> => {
    const allVideos: Map<string, YouTubeVideoDetail> = new Map();

    console.log('🔍 Starting YouTube extraction for psicotrading content...');

    for (const query of YouTubePsychotradingExtractor.SEARCH_QUERIES) {
      console.log(`📺 Searching: "${query}"`);
      const searchResults = await YouTubePsychotradingExtractor.fetchYouTubeVideos(query, 10);
      
      if (searchResults.length === 0) continue;

      const videoIds = searchResults
        .map(r => r.id.videoId)
        .filter(id => !allVideos.has(id));

      if (videoIds.length === 0) continue;

      const details = await YouTubePsychotradingExtractor.fetchVideoDetails(videoIds);
      
      for (const video of details) {
        allVideos.set(video.id, video);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const filteredVideos = YouTubePsychotradingExtractor.filterHighQualityVideos(
      Array.from(allVideos.values())
    );

    const recursos = filteredVideos.map(v => 
      YouTubePsychotradingExtractor.convertToRecurso(v)
    );

    console.log(`✅ Extracted ${recursos.length} high-quality psicotrading videos`);

    return recursos;
  },

  syncWithStorage: async (): Promise<{ added: number; skipped: number }> => {
    const { StorageService } = await import('../storage');
    
    const extractedVideos = await YouTubePsychotradingExtractor.extractAllPsychotradingContent();
    const existingVideos = await StorageService.getVideos();
    const existingIds = new Set(existingVideos.map(v => v.id));

    const newVideos = extractedVideos.filter(v => !existingIds.has(v.id));

    if (newVideos.length === 0) {
      return { added: 0, skipped: extractedVideos.length };
    }

    let added = 0;
    let skipped = existingVideos.length;

    for (const video of newVideos) {
      await StorageService.saveVideo(video);
      added++;
    }

    return { added, skipped };
  },
};

export default YouTubePsychotradingExtractor;
