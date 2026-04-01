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

// API key is now passed from server-side, not exposed in client bundle
const SEARCH_QUERIES = [
  'psicotrading trading psychology',
  'trading mindset discipline',
  'emociones trading forex',
  'psychology of successful traders',
  'trading fear greed control',
  'trader mental health stress',
  'market psychology trading patterns',
  'trading journal emotional control',
];

const MIN_VIEWS = 10000;
const MIN_LIKES = 500;
const MIN_DURATION_SECONDS = 300;

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

function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function extractThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

async function fetchYouTubeVideos(query: string, apiKey: string, maxResults: number = 10): Promise<YouTubeSearchResult[]> {
  if (!apiKey) return [];

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('key', apiKey);
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
}

async function fetchVideoDetails(videoIds: string[], apiKey: string): Promise<YouTubeVideoDetail[]> {
  if (!apiKey || videoIds.length === 0) return [];

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.searchParams.set('key', apiKey);
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
}

function filterHighQualityVideos(videos: YouTubeVideoDetail[]): YouTubeVideoDetail[] {
  return videos.filter(video => {
    const viewCount = parseInt(video.statistics?.viewCount || '0');
    const likeCount = parseInt(video.statistics?.likeCount || '0');
    const duration = parseDuration(video.contentDetails?.duration || 'PT0S');

    return (
      viewCount >= MIN_VIEWS &&
      likeCount >= MIN_LIKES &&
      duration >= MIN_DURATION_SECONDS
    );
  });
}

function convertToRecurso(video: YouTubeVideoDetail, categoria: 'Psicotrading' | 'Libros' | 'Podcast' | 'Audiolibros' = 'Psicotrading'): RecursoEducativo {
  const videoId = video.id;
  const duration = parseDuration(video.contentDetails?.duration || 'PT0S');

  return {
    id: `yt_${videoId}`,
    tipo: 'video',
    titulo: video.snippet.title.replace(/[^a-zA-Z0-9\s\p{P}]/gu, ''),
    autor: video.snippet.channelTitle,
    descripcion: video.snippet.description.substring(0, 300),
    thumbnail: video.snippet.thumbnails?.high?.url || 
                video.snippet.thumbnails?.medium?.url || 
                extractThumbnail(videoId),
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    duracion: formatDuration(duration),
    categoria,
  };
}

export async function extractAllPsychotradingContent(apiKey: string): Promise<RecursoEducativo[]> {
  const allVideos: Map<string, YouTubeVideoDetail> = new Map();

  console.log('🔍 Starting YouTube extraction for psicotrading content...');

  for (const query of SEARCH_QUERIES) {
    console.log(`📺 Searching: "${query}"`);
    const searchResults = await fetchYouTubeVideos(query, apiKey, 10);
    
    if (searchResults.length === 0) continue;

    const videoIds = searchResults
      .map(r => r.id.videoId)
      .filter(id => !allVideos.has(id));

    if (videoIds.length === 0) continue;

    const details = await fetchVideoDetails(videoIds, apiKey);
    
    for (const video of details) {
      allVideos.set(video.id, video);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const filteredVideos = filterHighQualityVideos(Array.from(allVideos.values()));

  const recursos = filteredVideos.map(v => convertToRecurso(v));

  console.log(`✅ Extracted ${recursos.length} high-quality psicotrading videos`);

  return recursos;
}

export default {
  SEARCH_QUERIES,
  MIN_VIEWS,
  MIN_LIKES,
  MIN_DURATION_SECONDS,
  parseDuration,
  formatDuration,
  extractThumbnail,
  extractAllPsychotradingContent,
};

// Named export for backward compatibility
export const YouTubePsychotradingExtractor = {
  SEARCH_QUERIES,
  MIN_VIEWS,
  MIN_LIKES,
  MIN_DURATION_SECONDS,
  parseDuration,
  formatDuration,
  extractThumbnail,
  extractAllPsychotradingContent,
};
