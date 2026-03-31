import { extractYoutubeId } from '../../utils/youtube';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export interface YouTubeTranscript {
  videoId: string;
  title: string;
  language: string;
  transcripts: TranscriptSegment[];
  duration: number;
}

export interface TranscriptSegment {
  start: number;
  duration: number;
  text: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
}

export async function getYouTubeVideoInfo(videoUrl: string): Promise<YouTubeVideo | null> {
  const videoId = extractYoutubeId(videoUrl);
  if (!videoId || !YOUTUBE_API_KEY) return null;

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) return null;
    
    const item = data.items[0];
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnails: {
        default: item.snippet.thumbnails.default?.url || '',
        medium: item.snippet.thumbnails.medium?.url || '',
        high: item.snippet.thumbnails.high?.url || '',
      },
    };
  } catch (error) {
    console.error('Error fetching YouTube video info:', error);
    return null;
  }
}

export async function getYouTubeTranscript(videoUrl: string, language: string = 'es'): Promise<YouTubeTranscript | null> {
  const videoId = extractYoutubeId(videoUrl);
  if (!videoId) return null;

  try {
    const videoInfo = await getYouTubeVideoInfo(videoUrl);
    if (!videoInfo) return null;

    const response = await fetch(`/api/youtube/transcript?videoId=${videoId}&language=${language}`);
    if (!response.ok) {
      console.error('Failed to fetch transcript from API');
      return null;
    }

    const data = await response.json();
    
    return {
      videoId,
      title: videoInfo.title,
      language,
      transcripts: data.transcripts || [],
      duration: data.duration || 0,
    };
  } catch (error) {
    console.error('Error fetching YouTube transcript:', error);
    return null;
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export async function searchYouTubeVideos(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY || !query) return [];

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();

    if (!data.items) return [];

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnails: {
        default: item.snippet.thumbnails.default?.url || '',
        medium: item.snippet.thumbnails.medium?.url || '',
        high: item.snippet.thumbnails.high?.url || '',
      },
    }));
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    return [];
  }
}
