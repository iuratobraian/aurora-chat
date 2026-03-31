import { useCallback, useMemo } from 'react';
import { Publicacion, Usuario, Comentario } from '../types';

export interface PostHandlers {
  onLike: (post: Publicacion) => void;
  onUnlike: (post: Publicacion) => void;
  onFollow: (authorId: string) => void;
  onUnfollow: (authorId: string) => void;
  onVisitProfile: (userId: string) => void;
  onShare: (post: Publicacion) => void;
  onBookmark: (post: Publicacion) => void;
  onComment: (postId: string) => void;
}

export interface UsePostCallbacksReturn {
  handleLike: (post: Publicacion) => void;
  handleUnlike: (post: Publicacion) => void;
  handleFollow: (authorId: string) => void;
  handleUnfollow: (authorId: string) => void;
  handleVisitProfile: (userId: string) => void;
  handleShare: (post: Publicacion) => void;
  handleBookmark: (post: Publicacion) => void;
  handleComment: (postId: string) => void;
}

export function usePostCallbacks(handlers: PostHandlers): UsePostCallbacksReturn {
  const handleLike = useCallback(
    (post: Publicacion) => handlers.onLike(post),
    [handlers.onLike]
  );

  const handleUnlike = useCallback(
    (post: Publicacion) => handlers.onUnlike(post),
    [handlers.onUnlike]
  );

  const handleFollow = useCallback(
    (authorId: string) => handlers.onFollow(authorId),
    [handlers.onFollow]
  );

  const handleUnfollow = useCallback(
    (authorId: string) => handlers.onUnfollow(authorId),
    [handlers.onUnfollow]
  );

  const handleVisitProfile = useCallback(
    (userId: string) => handlers.onVisitProfile(userId),
    [handlers.onVisitProfile]
  );

  const handleShare = useCallback(
    (post: Publicacion) => handlers.onShare(post),
    [handlers.onShare]
  );

  const handleBookmark = useCallback(
    (post: Publicacion) => handlers.onBookmark(post),
    [handlers.onBookmark]
  );

  const handleComment = useCallback(
    (postId: string) => handlers.onComment(postId),
    [handlers.onComment]
  );

  return useMemo(
    () => ({
      handleLike,
      handleUnlike,
      handleFollow,
      handleUnfollow,
      handleVisitProfile,
      handleShare,
      handleBookmark,
      handleComment,
    }),
    [
      handleLike,
      handleUnlike,
      handleFollow,
      handleUnfollow,
      handleVisitProfile,
      handleShare,
      handleBookmark,
      handleComment,
    ]
  );
}

export interface CommentHandlers {
  onLike: (comment: Comentario) => void;
  onReply: (comment: Comentario) => void;
  onDelete: (comment: Comentario) => void;
}

export interface UseCommentCallbacksReturn {
  handleCommentLike: (comment: Comentario) => void;
  handleCommentReply: (comment: Comentario) => void;
  handleCommentDelete: (comment: Comentario) => void;
}

export function useCommentCallbacks(handlers: CommentHandlers): UseCommentCallbacksReturn {
  const handleCommentLike = useCallback(
    (comment: Comentario) => handlers.onLike(comment),
    [handlers.onLike]
  );

  const handleCommentReply = useCallback(
    (comment: Comentario) => handlers.onReply(comment),
    [handlers.onReply]
  );

  const handleCommentDelete = useCallback(
    (comment: Comentario) => handlers.onDelete(comment),
    [handlers.onDelete]
  );

  return useMemo(
    () => ({
      handleCommentLike,
      handleCommentReply,
      handleCommentDelete,
    }),
    [handleCommentLike, handleCommentReply, handleCommentDelete]
  );
}

export interface FeedHandlers {
  onRefresh: () => void;
  onLoadMore: () => void;
  onFilterChange: (filter: string) => void;
  onSearch: (query: string) => void;
}

export interface UseFeedCallbacksReturn {
  handleRefresh: () => void;
  handleLoadMore: () => void;
  handleFilterChange: (filter: string) => void;
  handleSearch: (query: string) => void;
}

export function useFeedCallbacks(handlers: FeedHandlers): UseFeedCallbacksReturn {
  const handleRefresh = useCallback(() => handlers.onRefresh(), [handlers.onRefresh]);
  const handleLoadMore = useCallback(() => handlers.onLoadMore(), [handlers.onLoadMore]);
  const handleFilterChange = useCallback(
    (filter: string) => handlers.onFilterChange(filter),
    [handlers.onFilterChange]
  );
  const handleSearch = useCallback(
    (query: string) => handlers.onSearch(query),
    [handlers.onSearch]
  );

  return useMemo(
    () => ({
      handleRefresh,
      handleLoadMore,
      handleFilterChange,
      handleSearch,
    }),
    [handleRefresh, handleLoadMore, handleFilterChange, handleSearch]
  );
}

export default usePostCallbacks;
