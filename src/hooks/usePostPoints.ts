import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function usePostPoints() {
  const givePoints = useMutation(api.posts.givePoints);
  const givePointsInternal = useMutation(api.posts.givePointsInternal);
  
  const givePointsToPost = async (postId: string, points: number = 10, userId?: string) => {
    try {
      await givePoints({ 
        postId, 
        points,
        userId: userId || 'unknown'
      });
      return { success: true };
    } catch (error) {
      console.error('Error giving points:', error);
      return { success: false, error: String(error) };
    }
  };

  const givePointsInternalToPost = async (postId: string, userId: string, points: number = 10) => {
    try {
      await givePointsInternal({ postId, userId, points });
      return { success: true };
    } catch (error) {
      console.error('Error giving points internally:', error);
      return { success: false, error: String(error) };
    }
  };

  return {
    givePointsToPost,
    givePointsInternalToPost,
  };
}
