import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Publicacion } from '../types';
import { mapConvexPost } from '../utils/postMapper';
import { useInView } from 'react-intersection-observer';

const PAGE_SIZE = 10;
const AD_INTERVAL = 5;
const MAX_FEED_ITEMS = 200; // Memory optimization: limit feed to 200 items

interface AdItem {
  _id: string;
  isAd: true;
  campaign: any;
  variant?: any;
}

type FeedItem = Publicacion | AdItem;

interface UseFeedWithAdsOptions {
  userId?: string;
  enabled?: boolean;
  query?: any;
  args?: Record<string, any>;
  skipAds?: boolean;
}

interface UseFeedWithAdsReturn {
  items: FeedItem[];
  loading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMoreRef: (node?: Element | null) => void;
  recordAdImpression: (campaignId: string) => void;
  recordAdClick: (campaignId: string) => void;
  refetch: () => void;
}

// Memoized ad item factory to prevent recreation
const createAdItem = (adData: { campaign: any; variant: any }): AdItem => ({
  _id: `ad_${adData.campaign._id}`,
  isAd: true,
  campaign: adData.campaign,
  variant: adData.variant,
});

// Memoized posts mapper
const mapPosts = (page: any[]): Publicacion[] => page.map(mapConvexPost);

// Optimized ad injection with minimal allocations
const injectAds = (posts: Publicacion[], adItem: AdItem): FeedItem[] => {
  if (posts.length === 0) return [];
  
  const result: FeedItem[] = [];
  for (let i = 0; i < posts.length; i++) {
    result.push(posts[i]);
    if ((i + 1) % AD_INTERVAL === 0) {
      result.push(adItem);
    }
  }
  return result;
};

export function useFeedWithAds({
  userId,
  enabled = true,
  query = api.posts.getPostsPaginated,
  args = {},
  skipAds = false,
}: UseFeedWithAdsOptions = {}): UseFeedWithAdsReturn {
  // Stabilize state initial values
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Refs for tracking without re-renders
  const seenIdsRef = useRef<Set<string>>(new Set());
  const prevCursorRef = useRef<string | null>(null);
  const isInitialMountRef = useRef(true);
  const itemsRef = useRef<FeedItem[]>([]);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  // Single query for posts
  const paginatedResult = useQuery(query, {
    numItems: PAGE_SIZE,
    cursor: cursor || undefined,
    ...args,
  }) as { page: any[]; continueCursor: string | null; isDone: boolean } | undefined;

  // Single query for ad (only when needed)
  const adData = useQuery(
    api.adIntelligence.getAdForFeed,
    enabled && userId && !skipAds ? { userId } : 'skip'
  ) as { campaign: any; variant: any } | null | undefined;

  // Mutations
  const recordImpression = useMutation(api.adTracking.recordAdImpression);
  const recordClick = useMutation(api.adTracking.recordAdClick);

  // Memoized mapped posts - only recalculates when page data changes
  const mappedPosts = useMemo(() => {
    if (!paginatedResult?.page) return [];
    return mapPosts(paginatedResult.page);
  }, [paginatedResult?.page]);

  // Memoized ad item - stable reference
  const adItem = useMemo(() => {
    if (!enabled || !adData?.campaign || skipAds) return null;
    return createAdItem(adData);
  }, [enabled, skipAds, adData?.campaign._id, adData?.variant]);

  // Final items with ads - memoized
  const itemsWithAds = useMemo(() => {
    if (!adItem) return mappedPosts;
    return injectAds(mappedPosts, adItem);
  }, [mappedPosts, adItem]);

  // Optimized effect - only update on meaningful changes
  useEffect(() => {
    if (paginatedResult === undefined) return;

    const isDone = paginatedResult.isDone;
    const continueCursor = paginatedResult.continueCursor;

    if (isInitialMountRef.current && cursor === null) {
      const limited = itemsWithAds.slice(-MAX_FEED_ITEMS);
      setItems(limited);
      itemsRef.current = limited;
      setLoading(false);
      seenIdsRef.current = new Set(limited.map(p => 'id' in p ? p.id : p._id));
      isInitialMountRef.current = false;
      prevCursorRef.current = null;
      return;
    }

    if (cursor !== null && cursor !== prevCursorRef.current) {
      const newItems = itemsWithAds.filter(p => {
        const id = 'id' in p ? p.id : p._id;
        return !seenIdsRef.current.has(id);
      });

      if (newItems.length === 0) return;

      newItems.forEach(p => seenIdsRef.current.add('id' in p ? p.id : p._id));
      
      const updated = [...itemsRef.current, ...newItems].slice(-MAX_FEED_ITEMS);
      itemsRef.current = updated;
      setItems(updated);
      setIsLoadingMore(false);
      prevCursorRef.current = cursor;
    }

    setHasMore(!isDone && !!continueCursor);
  }, [paginatedResult, cursor, itemsWithAds]);

  // Load more trigger - simplified
  useEffect(() => {
    if (!inView || !hasMore || isLoadingMore) return;
    if (!paginatedResult || paginatedResult.isDone || !paginatedResult.continueCursor) return;
    
    setIsLoadingMore(true);
    setCursor(paginatedResult.continueCursor);
  }, [inView, hasMore, isLoadingMore, paginatedResult?.isDone, paginatedResult?.continueCursor]);

  // Refetch - stable callback
  const refetch = useCallback(() => {
    setCursor(null);
    setLoading(true);
    setItems([]);
    itemsRef.current = [];
    seenIdsRef.current = new Set();
    prevCursorRef.current = null;
    isInitialMountRef.current = true;
  }, []);

  // Track impression - debounced
  const recordAdImpression = useCallback(async (campaignId: string) => {
    if (!userId) return;
    try {
      await recordImpression({ campaignId, userId, impressionType: 'view' });
    } catch (error) {
      console.error('[useFeedWithAds] Impression tracking failed:', error);
    }
  }, [userId, recordImpression]);

  // Track click - stable
  const recordAdClick = useCallback(async (campaignId: string) => {
    if (!userId) return;
    try {
      await recordClick({ campaignId, userId });
    } catch (error) {
      console.error('[useFeedWithAds] Click tracking failed:', error);
    }
  }, [userId, recordClick]);

  return {
    items,
    loading,
    isLoadingMore,
    hasMore,
    loadMoreRef,
    recordAdImpression,
    recordAdClick,
    refetch,
  };
}
