# 🚨 REPORTE DE AUDITORÍA GALÁCTICA (CÓDIGO HUÉRFANO/DESCONECTADO)

**Resumen:**
- Funciones de Backend Evaluadas: 615
- Funciones en Uso (Conectadas): 356
- **Funciones Huérfanas (Por Reactivar): 259**

--- 

### 📝 FUNCIONES PARA INYECTAR COMO TAREAS

#### 📁 Módulo: `convex/adAuction.ts`
- `getAuctionById` (query)
- `getAuctionsBySlot` (query)
- `getAllSlots` (query)
- `getCampaignsByAdvertiser` (query)
- `updateCampaign` (mutation)
- `createSlot` (mutation)
- `createAuction` (mutation)
- `startAuction` (mutation)
- `endAuction` (mutation)

#### 📁 Módulo: `convex/adAuctions.ts`
- `getUserBids` (query)
- `closeAuction` (mutation)

#### 📁 Módulo: `convex/adminFindings.ts`
- `deleteFinding` (mutation)
- `getFindingStats` (query)

#### 📁 Módulo: `convex/ads.ts`
- `createCommunityAd` (mutation)
- `getCommunityAds` (query)
- `deactivateExpiredAds` (mutation)

#### 📁 Módulo: `convex/adTargeting.ts`
- `getTargetedAds` (query)
- `getTargetingPreview` (query)
- `updateAdImpression` (mutation)
- `updateAdClick` (mutation)
- `getAudienceInsights` (query)

#### 📁 Módulo: `convex/aiAgent.ts`
- `createPendingPost` (mutation)
- `publishScheduledPosts` (action)
- `generateMarketPost` (action)
- `generateForexAnalysis` (action)
- `generateEducationalPost` (action)

#### 📁 Módulo: `convex/analytics.ts`
- `getUserPerformance` (query)
- `getSignalsPerformance` (query)
- `getPlatformStats` (query)
- `getAccountAnalytics` (query)
- `syncAnalytics` (action)
- `getByAccountAndDate` (query)
- `createAnalytics` (mutation)
- `updateAnalytics` (mutation)
- `exportReport` (query)

#### 📁 Módulo: `convex/auth.ts`
- `validateToken` (query)

#### 📁 Módulo: `convex/backup.ts`
- `getUserBackups` (query)
- `getRecentBackups` (query)
- `deleteOldBackups` (mutation)
- `getPendingSync` (query)
- `removePendingSync` (mutation)
- `updatePendingSyncRetry` (mutation)
- `clearAllPendingSync` (mutation)

#### 📁 Módulo: `convex/chat.ts`
- `createChannel` (mutation)
- `verifyChannelPassword` (query)
- `verifyChannelPasswordMutation` (mutation)
- `getServerStats` (query)
- `getLatestMessages` (query)

#### 📁 Módulo: `convex/communities.ts`
- `leaveCommunity` (mutation)
- `subscribeToCommunity` (mutation)
- `cancelSubscription` (mutation)
- `getCommunitySubscription` (query)
- `listCommunitiesWithSubscriptions` (query)
- `getCommunitySubscriptions` (query)
- `createPayout` (mutation)
- `getCommunityPayouts` (query)
- `getOwnerPayouts` (query)
- `processPayouts` (action)
- `updateCommunityRevenue` (mutation)
- `getPremiumCommunities` (query)
- `getCommunityAccess` (query)
- `checkCommunityAccess` (query)
- `grantAccess` (mutation)
- `createPremiumCommunity` (mutation)
- `addCredits` (mutation)
- `useCredits` (mutation)
- `grantCommunityAccess` (mutation)

#### 📁 Módulo: `convex/communityMonetization.ts`
- `setSubcommunityPricing` (mutation)
- `cancelSubcommunitySubscription` (mutation)
- `getSubcommunityAnalytics` (query)
- `getOwnerSubcommunitiesAnalytics` (query)
- `getSubcommunityRevenue` (query)

#### 📁 Módulo: `convex/communityPlans.ts`
- `getPlanLimits` (query)
- `initializePlanSettings` (mutation)
- `updatePlan` (mutation)

#### 📁 Módulo: `convex/creatorDashboard.ts`
- `getTopCreators` (query)

#### 📁 Módulo: `convex/dailyPolls.ts`
- `votePoll` (mutation)
- `getTodayPoll` (query)

#### 📁 Módulo: `convex/gamification.ts`
- `recordDailyLogin` (mutation)
- `awardPostXP` (mutation)
- `awardLikeXP` (mutation)
- `awardCommentXP` (mutation)

#### 📁 Módulo: `convex/gaming.ts`
- `getUserGameSessions` (query)

#### 📁 Módulo: `convex/importSnapshot.ts`
- `importAd` (mutation)
- `importNotification` (mutation)
- `importChat` (mutation)
- `importQA` (mutation)
- `importVideo` (mutation)
- `importGlobalConfig` (mutation)

#### 📁 Módulo: `convex/accounts.ts`
- `getByInstagramId` (query)
- `getByIdInternal` (query)
- `checkConfig` (query)
- `deleteInstagramAccount` (mutation)

#### 📁 Módulo: `convex/analyticsOps.ts`
- `getByAccountAndDate` (query)
- `createAnalyticsRecord` (mutation)
- `updateAnalyticsRecord` (mutation)

#### 📁 Módulo: `convex/autoReply.ts`
- `updateAutoReplyRule` (mutation)
- `processIncomingMessage` (action)
- `incrementRuleStats` (mutation)
- `getRuleStats` (query)

#### 📁 Módulo: `convex/messages.ts`
- `getThreadMessages` (query)
- `markThreadAsRead` (mutation)
- `saveSentMessage` (mutation)
- `processWebhook` (action)
- `saveComment` (mutation)
- `saveMention` (mutation)

#### 📁 Módulo: `convex/posts.ts`
- `getPostsToPublish` (query)
- `getPostById` (query)
- `updateAISuggestions` (mutation)
- `getUpcomingPosts` (query)
- `updateScheduledPost` (mutation)
- `markPostPublished` (mutation)
- `markPostFailed` (mutation)
- `duplicatePost` (mutation)
- `getPostsByDate` (query)
- `getPostsByUser` (query)
- `cancelPendingPost` (mutation)
- `givePostPoints` (mutation)
- `getPostPointsGiven` (query)
- `getPostTotalPoints` (query)
- `getTopPointsPosts` (query)

#### 📁 Módulo: `convex/scheduler.ts`
- `publishScheduledPosts` (action)
- `generateAISuggestions` (action)
- `syncAccountStats` (action)

#### 📁 Módulo: `convex/templates.ts`
- `getUserTemplates` (query)
- `getTemplateById` (query)
- `createTemplate` (mutation)
- `updateTemplate` (mutation)
- `deleteTemplate` (mutation)
- `useTemplate` (mutation)
- `getPopularTemplates` (query)
- `duplicateTemplate` (mutation)

#### 📁 Módulo: `convex/economicCalendar.ts`
- `isAdminUser` (query)
- `getEventsByDateRange` (query)
- `getUpcomingHighImpact` (query)
- `getEventsByCountry` (query)
- `getEventDetails` (query)
- `syncFromMyFXBook` (action)

#### 📁 Módulo: `convex/marketNews.ts`
- `syncNewsArticle` (mutation)
- `likeNews` (mutation)
- `getActiveSources` (query)
- `addNewsSource` (mutation)
- `createAINews` (mutation)

#### 📁 Módulo: `convex/mercadopagoApi.ts`
- `processPaymentWebhook` (mutation)

#### 📁 Módulo: `convex/moderation.ts`
- `reportContent` (mutation)
- `updateBlockedWords` (mutation)
- `updateWhitelist` (mutation)
- `getModerationConfig` (query)
- `addToWhitelist` (mutation)
- `removeFromWhitelist` (mutation)
- `unsuspendUser` (mutation)
- `getSuspendedUsers` (query)
- `getReportsByReason` (query)
- `getTopSpamReasons` (query)

#### 📁 Módulo: `convex/notifications.ts`
- `getNotificationsSince` (query)
- `getUnreadCountSince` (query)

#### 📁 Módulo: `convex/paymentOrchestrator.ts`
- `getUserPayments` (query)
- `getPaymentById` (query)
- `updateUserRole` (mutation)
- `manualApprovePayment` (mutation)

#### 📁 Módulo: `convex/payments.ts`
- `createCustomerPortal` (mutation)
- `getPrices` (query)
- `getUserSubscriptionDetails` (query)
- `verifyCheckoutSession` (mutation)
- `cancelSubscription` (mutation)
- `reactivateSubscription` (mutation)

#### 📁 Módulo: `convex/pendingOperations.ts`
- `markOperationProcessing` (mutation)
- `markOperationCompleted` (mutation)
- `markOperationFailed` (mutation)
- `cleanupExpiredOperations` (mutation)

#### 📁 Módulo: `convex/platformConfig.ts`
- `deleteConfig` (mutation)

#### 📁 Módulo: `convex/products.ts`
- `getProductById` (query)
- `getProductsByAuthor` (query)
- `searchProducts` (query)
- `getTopProducts` (query)
- `getProductsByCategory` (query)
- `createProduct` (mutation)
- `rateProduct` (mutation)
- `getUserWishlist` (query)

#### 📁 Módulo: `convex/profiles.ts`
- `getNextUserNumber` (query)
- `registerWithReferral` (mutation)
- `addXp` (mutation)
- `getAuditLogs` (query)
- `addBalance` (mutation)
- `recalculateAccuracy` (mutation)

#### 📁 Módulo: `convex/push.ts`
- `getAllPushSubscriptions` (query)
- `deleteInvalidSubscription` (mutation)

#### 📁 Módulo: `convex/pushActions.ts`
- `generateVapidKeys` (action)

#### 📁 Módulo: `convex/recursos.ts`
- `getRecursos` (query)
- `getRecursosByUser` (query)
- `createRecurso` (mutation)
- `updateRecurso` (mutation)
- `deleteRecurso` (mutation)

#### 📁 Módulo: `convex/referrals.ts`
- `getReferralCode` (query)
- `updateReferralCode` (mutation)
- `getReferralsByUser` (query)
- `getTopReferrers` (query)
- `recordReferralPurchase` (mutation)
- `getReferralPurchaseStats` (query)

#### 📁 Módulo: `convex/reviews.ts`
- `createPlatformReview` (mutation)
- `getPlatformReviews` (query)
- `getPlatformRating` (query)
- `getUserPlatformReview` (query)
- `deletePlatformReview` (mutation)

#### 📁 Módulo: `convex/rewards.ts`
- `activateReward` (mutation)

#### 📁 Módulo: `convex/savedPosts.ts`
- `hasSavedPost` (query)

#### 📁 Módulo: `convex/signalNotifications.ts`
- `getUsersEligibleForSignalNotification` (query)
- `shouldNotifyUser` (query)
- `recordSignalNotification` (mutation)
- `getSignalNotificationHistory` (query)
- `markSignalNotificationOpened` (mutation)
- `notifySubscribersOfNewSignal` (action)
- `notifySubscribersOfSignalUpdate` (action)
- `getProviderById` (query)
- `getAllUsersWithSignalPrefs` (query)

#### 📁 Módulo: `convex/signals.ts`
- `getFeaturedPlans` (query)
- `getPlanBySlug` (query)
- `getSignalsByType` (query)
- `getSignalsByPair` (query)
- `getSignalById` (query)
- `getUserSubscriptions` (query)
- `cancelSubscription` (mutation)
- `getProviderStats` (query)
- `becomeProvider` (mutation)

#### 📁 Módulo: `convex/socialAgents.ts`
- `getAgentMemoryForAction` (query)
- `postAsAgent` (action)
- `agentLikePosts` (action)
- `agentCommentPosts` (action)
- `agentReplyToComments` (action)
- `dailySocialActivity` (action)
- `getAgentStats` (query)
- `getAgentPersonalities` (query)
- `getAgentMemory` (query)

#### 📁 Módulo: `convex/strategies.ts`
- `updateStrategy` (mutation)
- `hasUserPurchased` (query)
- `removeFromBookLibrary` (mutation)

#### 📁 Módulo: `convex/subcommunities.ts`
- `getSubcommunitiesByType` (query)
- `getSubcommunityById` (query)
- `getSubcommunityMembers` (query)
- `leaveSubcommunity` (mutation)
- `changeMemberRole` (mutation)
- `cancelSubcommunitySubscription` (mutation)

#### 📁 Módulo: `convex/subcommunityInvites.ts`
- `createInvite` (mutation)
- `getPendingInvites` (query)
- `acceptInvite` (mutation)
- `declineInvite` (mutation)

#### 📁 Módulo: `convex/subscriptions.ts`
- `getActivePlans` (query)
- `getPlanById` (query)
- `getCurrentSubscription` (query)
- `cancelSubscription` (mutation)
- `getUserSubscriptionHistory` (query)

#### 📁 Módulo: `convex/systemErrors.ts`
- `getUnreviewedErrors` (query)
- `getErrorStats` (query)
- `markErrorReviewed` (mutation)
- `resolveError` (mutation)

#### 📁 Módulo: `convex/traderVerification.ts`
- `updateVerificationLevel` (mutation)

#### 📁 Módulo: `convex/userPreferences.ts`
- `updateLanguage` (mutation)

#### 📁 Módulo: `convex/webhooks.ts`
- `handleWebhook` (action)
- `createWebhookEndpoint` (action)

