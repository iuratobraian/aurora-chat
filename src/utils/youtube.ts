export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  try {
    const patterns = [
      /(?:v=|vi\/|v\/|live\/|embed\/|\.be\/)([^#&?]{10,})/,
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  } catch {
    return null;
  }
}
