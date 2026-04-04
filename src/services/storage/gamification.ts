import { api } from "../../../convex/_generated/api";
import logger from '../../../lib/utils/logger';
import { convex } from './sync';

export const getUserProgress = async (userId: string): Promise<any> => {
    if (!userId || userId === 'guest') return null;
    try {
        return await convex.query(api.gamification.getUserProgress, { userId });
    } catch (err) {
        logger.error("Get User Progress Error:", err);
        return null;
    }
};

export const getGlobalLeaderboard = async (limit?: number): Promise<any[]> => {
    try {
        return await convex.query(api.gamification.getLeaderboard, { limit });
    } catch (err) {
        logger.error("Get Leaderboard Error:", err);
        return [];
    }
};

export const getUserAchievements = async (userId: string): Promise<any[]> => {
    if (!userId || userId === 'guest') return [];
    try {
        return await convex.query(api.gamification.getUserAchievements, { userId });
    } catch (err) {
        logger.error("Get User Achievements Error:", err);
        return [];
    }
};

export const checkAchievements = async (userId: string): Promise<any[]> => {
    if (!userId || userId === 'guest') return [];
    try {
        return await convex.mutation(api.gamification.checkAchievements, { userId });
    } catch (err) {
        logger.error("Check Achievements Error:", err);
        return [];
    }
};

export const awardXP = async (userId: string, amount: number, reason: string): Promise<any> => {
    if (!userId || userId === 'guest') return null;
    try {
        return await convex.mutation(api.gamification.awardXP, { userId, amount, reason } as any);
    } catch (err) {
        logger.error("Award XP Error:", err);
        return null;
    }
};

export const getAchievementProgress = async (userId: string): Promise<any[]> => {
    if (!userId || userId === 'guest') return [];
    try {
        return await convex.query(api.achievements.getAchievementProgress, { userId });
    } catch (err) {
        logger.error("Get Achievement Progress Error:", err);
        return [];
    }
};

export const getAllAchievements = async (): Promise<any[]> => {
    try {
        return await convex.query(api.achievements.getAllAchievements, {});
    } catch (err) {
        logger.error("Get All Achievements Error:", err);
        return [];
    }
};

export const getAchievementStats = async (userId: string): Promise<any> => {
    if (!userId || userId === 'guest') return null;
    try {
        return await convex.query(api.achievements.getAchievementStats, { userId });
    } catch (err) {
        logger.error("Get Achievement Stats Error:", err);
        return null;
    }
};

export const getAchievementLeaderboard = async (limit?: number): Promise<any[]> => {
    try {
        return await convex.query(api.achievements.getLeaderboardByAchievements, { limit });
    } catch (err) {
        logger.error("Get Achievement Leaderboard Error:", err);
        return [];
    }
};

export const triggerAchievementCheck = async (userId: string, action: string, metadata?: any): Promise<any> => {
    if (!userId || userId === 'guest') return null;
    try {
        return await convex.mutation(api.achievements.checkAndAwardAchievements, { userId, action, metadata } as any);
    } catch (err) {
        logger.error("Trigger Achievement Check Error:", err);
        return null;
    }
};

export const recordDailyLogin = async (userId: string): Promise<any> => {
    if (!userId || userId === 'guest') return null;
    try {
        return await convex.mutation(api.gamification.recordDailyLogin, { userId });
    } catch (err) {
        logger.error("Record Daily Login Error:", err);
        return null;
    }
};

export const awardPostXP = async (userId: string, reason: string = 'post_created'): Promise<any> => {
    if (!userId || userId === 'guest') return null;
    try {
        return await convex.mutation(api.gamification.awardPostXP, { userId, reason } as any);
    } catch (err) {
        logger.error("Award Post XP Error:", err);
        return null;
    }
};

export const awardLikeXP = async (userId: string): Promise<any> => {
    if (!userId || userId === 'guest') return null;
    try {
        return await convex.mutation(api.gamification.awardLikeXP, { userId } as any);
    } catch (err) {
        logger.error("Award Like XP Error:", err);
        return null;
    }
};

export const awardCommentXP = async (userId: string): Promise<any> => {
    if (!userId || userId === 'guest') return null;
    try {
        return await convex.mutation(api.gamification.awardCommentXP, { userId } as any);
    } catch (err) {
        logger.error("Award Comment XP Error:", err);
        return null;
    }
};
