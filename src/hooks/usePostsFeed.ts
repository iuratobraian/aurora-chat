import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Publicacion, CategoriaPost } from '../types';
import { mapConvexPost } from '../utils/postMapper';
import { useInView } from 'react-intersection-observer';
import { Id } from '../../convex/_generated/dataModel';

const PAGE_SIZE = 10;

interface UsePostsFeedOptions {
  filterType?: CategoriaPost | 'Todos';
  filterTag?: string | null;
  filterFollowing?: boolean;
  userId?: string;
  followingList?: string[];
}

interface UsePostsFeedReturn {
  posts: Publicacion[];
  loading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMoreRef: ReturnType<typeof useInView>['ref'];
  resetFilters: () => void;
}

export function usePostsFeed({
  filterType = 'Todos',
  filterTag = null,
  filterFollowing = false,
  userId,
  followingList = [],
}: UsePostsFeedOptions = {}): UsePostsFeedReturn {
  const [posts, setPosts] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const { ref: loadMoreRef, inView } = useInView();

  const paginatedResult = useQuery(api.posts.getPostsPaginated, {
    numItems: PAGE_SIZE,
    cursor: cursor !== null ? cursor : undefined,
  }) as { page: any[]; continueCursor: string | null; isDone: boolean } | undefined;

  const convexPosts = paginatedResult?.page;

  const mappedPosts = useMemo(() => {
    if (!convexPosts) return [];
    return convexPosts.map(mapConvexPost);
  }, [convexPosts]);

  useEffect(() => {
    if (!paginatedResult || !convexPosts) return;
    
    if (cursor === null) {
      setPosts(mappedPosts);
    } else {
      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newPosts = mappedPosts.filter(p => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });
    }
    
    setHasMore(!paginatedResult.isDone);
    setIsLoadingMore(false);
  }, [paginatedResult, convexPosts]);

  useEffect(() => {
    if (paginatedResult !== undefined) {
      setLoading(false);
    }
  }, [paginatedResult]);

  useEffect(() => {
    if (paginatedResult && paginatedResult.continueCursor && cursor !== null) {
      setCursor(paginatedResult.continueCursor);
    }
  }, [paginatedResult?.continueCursor]);

  useEffect(() => {
    if (inView && hasMore && !isLoadingMore && paginatedResult) {
      setIsLoadingMore(true);
    }
  }, [inView, hasMore, isLoadingMore, paginatedResult]);

  useEffect(() => {
    if (isLoadingMore && paginatedResult && paginatedResult.continueCursor) {
      setCursor(paginatedResult.continueCursor);
    } else if (isLoadingMore && paginatedResult && paginatedResult.isDone) {
      setHasMore(false);
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, paginatedResult]);

  useEffect(() => {
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    setIsLoadingMore(false);
  }, [filterType, filterTag, filterFollowing]);

  const resetFilters = useCallback(() => {
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    setIsLoadingMore(false);
  }, []);

  return {
    posts,
    loading,
    isLoadingMore,
    hasMore,
    loadMoreRef,
    resetFilters,
  };
}

export function useFilteredPosts(
  posts: Publicacion[],
  filterType: CategoriaPost | 'Todos',
  filterTag: string | null,
  filterFollowing: boolean,
  followingList: string[] = []
) {
  return useMemo(() => {
    const filtered = posts.filter(p => {
      if (filterType !== 'Todos' && p.categoria !== filterType) return false;
      if (filterTag && !(p.tags?.includes(filterTag))) return false;
      if (filterFollowing && !followingList.includes(p.idUsuario)) return false;
      return true;
    });
    
    return filtered.sort((a, b) => {
      const aPin = a.esAnuncio && a.idUsuario !== 'system';
      const bPin = b.esAnuncio && b.idUsuario !== 'system';
      if (aPin && !bPin) return -1;
      if (!aPin && bPin) return 1;
      return (b.ultimaInteraccion || 0) - (a.ultimaInteraccion || 0);
    });
  }, [posts, filterType, filterTag, filterFollowing, followingList]);
}

export default usePostsFeed;
