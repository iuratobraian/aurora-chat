/**
 * Image Optimizer - Progressive loading and caching for images
 * 
 * Provides utilities for:
 * - Progressive image loading with blur placeholders
 * - Image URL optimization for different screen densities
 * - Intersection observer-based lazy loading
 * - Cache management for loaded images
 */

interface ImageLoadOptions {
  /** Blur hash or placeholder color */
  placeholder?: string;
  /** Enable lazy loading via IntersectionObserver */
  lazy?: boolean;
  /** Root margin for lazy loading (e.g., '200px') */
  rootMargin?: string;
  /** Image quality for external sources */
  quality?: number;
}

const DEFAULT_OPTIONS: ImageLoadOptions = {
  placeholder: '#1a1a2e',
  lazy: true,
  rootMargin: '200px',
  quality: 80,
};

// Track loaded images to avoid re-loading
const loadedImages = new Set<string>();

/**
 * Optimize image URL for external providers
 */
export function optimizeImageUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  const { width, height, quality = 80 } = options;

  // Unsplash optimization
  if (url.includes('unsplash.com')) {
    const params = new URLSearchParams();
    if (width) params.set('w', String(width));
    if (height) params.set('h', String(height));
    params.set('q', String(quality));
    params.set('fit', 'crop');

    const baseUrl = url.split('?')[0];
    return `${baseUrl}?${params.toString()}`;
  }

  // DiceBear optimization
  if (url.includes('dicebear.com')) {
    const size = width || 192;
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?size=${size}`;
  }

  // Picsum optimization
  if (url.includes('picsum.photos')) {
    if (width && height) {
      return `https://picsum.photos/${width}/${height}`;
    }
    if (width) {
      return `https://picsum.photos/${width}`;
    }
  }

  return url;
}

/**
 * Create a blur-up placeholder for progressive loading
 */
export function createBlurPlaceholder(color: string = '#1a1a2e'): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Check if image is already loaded
 */
export function isImageLoaded(src: string): boolean {
  return loadedImages.has(src);
}

/**
 * Mark image as loaded
 */
export function markImageLoaded(src: string): void {
  loadedImages.add(src);
}

/**
 * Preload critical images
 */
export function preloadImages(urls: string[]): void {
  if (typeof window === 'undefined') return;

  for (const url of urls) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  }
}

/**
 * Create intersection observer for lazy loading images
 */
export function createImageObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: { rootMargin?: string }
): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          callback(entry);
        }
      }
    },
    {
      rootMargin: options?.rootMargin ?? DEFAULT_OPTIONS.rootMargin,
      threshold: 0.01,
    }
  );
}

/**
 * Get optimal image dimensions based on device pixel ratio
 */
export function getOptimalImageSize(baseWidth: number): number {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  return Math.ceil(baseWidth * dpr);
}

/**
 * Clear loaded images cache (useful for memory management)
 */
export function clearImageCache(): void {
  loadedImages.clear();
}
