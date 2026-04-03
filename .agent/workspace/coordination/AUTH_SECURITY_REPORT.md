# AUTH_SECURITY_REPORT - 2026-04-02T19:31:49.551Z

Total hallazgos: 415

## convex/achievements.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getAllAchievements | query | 60 | 🔴 Pendiente |
| getUserAchievements | query | 78 | 🔴 Pendiente |
| getAchievementProgress | query | 107 | 🔴 Pendiente |
| checkAndAwardAchievements | mutation | 190 | 🔴 Pendiente |
| getLeaderboardByAchievements | query | 339 | 🔴 Pendiente |
| getAchievementStats | query | 388 | 🔴 Pendiente |

## convex/adAuction.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getActiveAuctions | query | 4 | 🔴 Pendiente |
| getAuctionById | query | 22 | 🔴 Pendiente |
| getAuctionsBySlot | query | 39 | 🔴 Pendiente |
| getAllSlots | query | 49 | 🔴 Pendiente |
| getActiveSlots | query | 56 | 🔴 Pendiente |
| placeBid | mutation | 66 | 🔴 Pendiente |
| createCampaign | mutation | 106 | 🔴 Pendiente |
| getCampaignsByAdvertiser | query | 145 | 🔴 Pendiente |
| updateCampaign | mutation | 155 | 🔴 Pendiente |
| createSlot | mutation | 188 | 🔴 Pendiente |
| createAuction | mutation | 225 | 🔴 Pendiente |
| startAuction | mutation | 259 | 🔴 Pendiente |
| endAuction | mutation | 271 | 🔴 Pendiente |

## convex/adAuctions.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getActiveAuctions | query | 4 | 🔴 Pendiente |
| getUserBids | query | 17 | 🔴 Pendiente |
| placeBid | mutation | 29 | 🔴 Pendiente |
| closeAuction | mutation | 87 | 🔴 Pendiente |

## convex/adminFindings.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getFindings | query | 14 | 🔴 Pendiente |
| addFinding | mutation | 41 | 🔴 Pendiente |
| deleteFinding | mutation | 85 | 🔴 Pendiente |

## convex/ads.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getAds | query | 14 | 🔴 Pendiente |
| saveAd | mutation | 21 | 🔴 Pendiente |
| deleteAd | mutation | 66 | 🔴 Pendiente |
| createCommunityAd | mutation | 75 | 🔴 Pendiente |

## convex/adTargeting.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getTargetedAds | query | 133 | 🔴 Pendiente |
| getTargetingPreview | query | 238 | 🔴 Pendiente |
| updateAdImpression | mutation | 279 | 🔴 Pendiente |
| updateAdClick | mutation | 294 | 🔴 Pendiente |
| getAudienceInsights | query | 314 | 🔴 Pendiente |

## convex/aiAgent.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getPendingPosts | query | 225 | 🔴 Pendiente |
| getPublishedPosts | query | 244 | 🔴 Pendiente |
| getAIAgentConfig | query | 263 | 🔴 Pendiente |
| toggleAgentStatus | mutation | 289 | 🔴 Pendiente |
| updateSchedules | mutation | 325 | 🔴 Pendiente |
| createPendingPost | mutation | 530 | 🔴 Pendiente |
| approvePendingPost | mutation | 561 | 🔴 Pendiente |
| rejectPendingPost | mutation | 659 | 🔴 Pendiente |
| deletePendingPost | mutation | 673 | 🔴 Pendiente |
| reschedulePost | mutation | 684 | 🔴 Pendiente |
| updatePendingPost | mutation | 700 | 🔴 Pendiente |

## convex/analytics.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getUserPerformance | query | 4 | 🔴 Pendiente |
| getCommunityStats | query | 46 | 🔴 Pendiente |
| getSignalsPerformance | query | 75 | 🔴 Pendiente |
| getPlatformStats | query | 115 | 🔴 Pendiente |

## convex/backup.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| createBackup | mutation | 26 | 🔴 Pendiente |
| restoreBackup | mutation | 88 | 🔴 Pendiente |
| getBackupHistory | query | 160 | 🔴 Pendiente |
| getBackupById | query | 186 | 🔴 Pendiente |
| getUserBackups | query | 193 | 🔴 Pendiente |
| getRecentBackups | query | 208 | 🔴 Pendiente |
| deleteOldBackups | mutation | 220 | 🔴 Pendiente |
| getSystemBackups | query | 316 | 🔴 Pendiente |
| importSystemBackup | mutation | 330 | 🔴 Pendiente |
| createPendingSync | mutation | 375 | 🔴 Pendiente |
| getPendingSync | query | 410 | 🔴 Pendiente |
| removePendingSync | mutation | 421 | 🔴 Pendiente |
| updatePendingSyncRetry | mutation | 428 | 🔴 Pendiente |

## convex/chat.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getChannels | query | 8 | 🔴 Pendiente |
| getOrCreateChannel | mutation | 16 | 🔴 Pendiente |
| createChannel | mutation | 63 | 🔴 Pendiente |
| verifyChannelPassword | query | 98 | 🔴 Pendiente |
| verifyChannelPasswordMutation | mutation | 126 | 🔴 Pendiente |
| getServerStats | query | 154 | 🔴 Pendiente |
| getMessagesByChannel | query | 192 | 🔴 Pendiente |
| getLatestMessages | query | 250 | 🔴 Pendiente |
| getTypingUsers | query | 271 | 🔴 Pendiente |
| setTyping | mutation | 290 | 🔴 Pendiente |
| getMessages | query | 320 | 🔴 Pendiente |
| sendMessage | mutation | 340 | 🔴 Pendiente |

## convex/communities.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getCommunity | query | 82 | 🔴 Pendiente |
| listPublicCommunities | query | 103 | 🔴 Pendiente |
| searchCommunities | query | 266 | 🔴 Pendiente |
| getTrendingCommunities | query | 294 | 🔴 Pendiente |
| getTopCommunitiesByMembers | query | 312 | 🔴 Pendiente |
| getTopCommunitiesByEngagement | query | 330 | 🔴 Pendiente |
| getRecommendedCommunities | query | 363 | 🔴 Pendiente |
| getRevelationCommunities | query | 379 | 🔴 Pendiente |
| getCreatorCommunities | query | 397 | 🔴 Pendiente |
| getPromotedCommunities | query | 415 | 🔴 Pendiente |
| getCommunityPosts | query | 456 | 🔴 Pendiente |
| deletePost | mutation | 594 | 🔴 Pendiente |
| pinPost | mutation | 613 | 🔴 Pendiente |
| subscribeToCommunity | mutation | 638 | 🔴 Pendiente |
| cancelSubscription | mutation | 701 | 🔴 Pendiente |
| getCommunitySubscription | query | 723 | 🔴 Pendiente |
| listCommunitiesWithSubscriptions | query | 735 | 🔴 Pendiente |
| getCommunitySubscriptions | query | 745 | 🔴 Pendiente |
| createPayout | mutation | 755 | 🔴 Pendiente |
| getCommunityPayouts | query | 781 | 🔴 Pendiente |
| getOwnerPayouts | query | 792 | 🔴 Pendiente |
| updateCommunityRevenue | mutation | 848 | 🔴 Pendiente |
| getCommunityStats | query | 864 | 🔴 Pendiente |
| getCommunityMembers | query | 897 | 🔴 Pendiente |
| removeCommunityMember | mutation | 954 | 🔴 Pendiente |
| permanentDeleteCommunity | mutation | 1084 | 🔴 Pendiente |
| getDeletedCommunities | query | 1115 | 🔴 Pendiente |
| removeMember | mutation | 1141 | 🔴 Pendiente |
| updateMemberRole | mutation | 1191 | 🔴 Pendiente |
| getCommunityPostsAdmin | query | 1226 | 🔴 Pendiente |
| hidePost | mutation | 1267 | 🔴 Pendiente |
| deletePostAdmin | mutation | 1294 | 🔴 Pendiente |
| getOwnerCommunities | query | 1321 | 🔴 Pendiente |
| getPremiumCommunities | query | 1363 | 🔴 Pendiente |
| getCommunityAccess | query | 1373 | 🔴 Pendiente |
| checkCommunityAccess | query | 1384 | 🔴 Pendiente |
| grantAccess | mutation | 1398 | 🔴 Pendiente |
| createPremiumCommunity | mutation | 1420 | 🔴 Pendiente |
| addCredits | mutation | 1464 | 🔴 Pendiente |
| useCredits | mutation | 1503 | 🔴 Pendiente |
| grantCommunityAccess | mutation | 1536 | 🔴 Pendiente |

## convex/communityMonetization.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getSubcommunityAnalytics | query | 168 | 🔴 Pendiente |
| getOwnerSubcommunitiesAnalytics | query | 198 | 🔴 Pendiente |
| getSubcommunityRevenue | query | 240 | 🔴 Pendiente |

## convex/communityPlans.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getPlanSettings | query | 82 | 🔴 Pendiente |
| canCreateSubcommunity | query | 101 | 🔴 Pendiente |
| getPlanLimits | query | 129 | 🔴 Pendiente |
| initializePlanSettings | mutation | 138 | 🔴 Pendiente |
| updatePlan | mutation | 162 | 🔴 Pendiente |
| toggleAds | mutation | 203 | 🔴 Pendiente |
| setAdFrequency | mutation | 235 | 🔴 Pendiente |
| setAllowedAdTypes | mutation | 256 | 🔴 Pendiente |

## convex/competitions.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getActiveCompetitions | query | 4 | 🔴 Pendiente |
| getUpcomingCompetitions | query | 14 | 🔴 Pendiente |
| getFeaturedCompetitions | query | 27 | 🔴 Pendiente |
| joinCompetition | mutation | 37 | 🔴 Pendiente |
| leaveCompetition | mutation | 79 | 🔴 Pendiente |
| getLeaderboard | query | 104 | 🔴 Pendiente |
| getUserParticipation | query | 118 | 🔴 Pendiente |

## convex/config.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getConfig | query | 4 | 🔴 Pendiente |
| setConfig | mutation | 14 | 🔴 Pendiente |

## convex/creatorDashboard.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getCreatorStats | query | 4 | 🔴 Pendiente |
| getTopCreators | query | 53 | 🔴 Pendiente |

## convex/dataExport.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| exportProfiles | query | 9 | 🔴 Pendiente |
| exportPosts | query | 24 | 🔴 Pendiente |
| exportComments | query | 39 | 🔴 Pendiente |
| exportCommunities | query | 61 | 🔴 Pendiente |
| exportAllData | query | 76 | 🔴 Pendiente |
| importProfiles | mutation | 120 | 🔴 Pendiente |
| importPosts | mutation | 165 | 🔴 Pendiente |
| importCommunities | mutation | 197 | 🔴 Pendiente |

## convex/files.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| generateUploadUrl | mutation | 4 | 🔴 Pendiente |
| getImageUrl | query | 10 | 🔴 Pendiente |

## convex/gamification.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| awardXP | mutation | 18 | 🔴 Pendiente |
| getUserProgress | query | 74 | 🔴 Pendiente |
| getGlobalLeaderboard | query | 132 | 🔴 Pendiente |
| getWeeklyLeaderboard | query | 154 | 🔴 Pendiente |
| getMonthlyLeaderboard | query | 180 | 🔴 Pendiente |
| getUserAchievements | query | 202 | 🔴 Pendiente |
| checkAchievements | mutation | 274 | 🔴 Pendiente |
| recordDailyLogin | mutation | 293 | 🔴 Pendiente |
| awardPostXP | mutation | 424 | 🔴 Pendiente |
| awardLikeXP | mutation | 453 | 🔴 Pendiente |
| awardCommentXP | mutation | 479 | 🔴 Pendiente |
| getLeaderboard | query | 505 | 🔴 Pendiente |

## convex/gaming.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| createGameSession | mutation | 4 | 🔴 Pendiente |
| completeGameSession | mutation | 26 | 🔴 Pendiente |
| getUserGameSessions | query | 75 | 🔴 Pendiente |
| getGameStats | query | 86 | 🔴 Pendiente |
| getLeaderboard | query | 120 | 🔴 Pendiente |
| getAllGamesStats | query | 161 | 🔴 Pendiente |
| recordGamePlayed | mutation | 194 | 🔴 Pendiente |

## convex/importSnapshot.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| importProfile | mutation | 4 | 🔴 Pendiente |
| importPost | mutation | 108 | 🔴 Pendiente |
| importAd | mutation | 156 | 🔴 Pendiente |
| importNotification | mutation | 179 | 🔴 Pendiente |
| importChat | mutation | 201 | 🔴 Pendiente |
| importQA | mutation | 224 | 🔴 Pendiente |
| importVideo | mutation | 244 | 🔴 Pendiente |
| importGlobalConfig | mutation | 266 | 🔴 Pendiente |

## convex/instagram/accounts.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getByInstagramId | query | 6 | 🔴 Pendiente |
| getById | query | 16 | 🔴 Pendiente |
| updateStats | mutation | 23 | 🔴 Pendiente |
| getInstagramAuthUrl | query | 47 | 🔴 Pendiente |
| checkConfig | query | 59 | 🔴 Pendiente |
| connectInstagramAccount | mutation | 154 | 🔴 Pendiente |
| disconnectInstagramAccount | mutation | 219 | 🔴 Pendiente |
| getUserInstagramAccounts | query | 238 | 🔴 Pendiente |
| getAllConnectedAccounts | query | 264 | 🔴 Pendiente |
| getInstagramStats | query | 292 | 🔴 Pendiente |
| updateAccountSettings | mutation | 315 | 🔴 Pendiente |
| deleteInstagramAccount | mutation | 385 | 🔴 Pendiente |

## convex/instagram/analytics.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getAccountAnalytics | query | 6 | 🔴 Pendiente |
| getWeeklyReport | query | 58 | 🔴 Pendiente |
| getByAccountAndDate | query | 205 | 🔴 Pendiente |
| createAnalytics | mutation | 222 | 🔴 Pendiente |
| updateAnalytics | mutation | 265 | 🔴 Pendiente |
| exportReport | query | 295 | 🔴 Pendiente |
| getTopPosts | query | 422 | 🔴 Pendiente |
| getPerformanceMetrics | query | 458 | 🔴 Pendiente |

## convex/instagram/analyticsOps.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getByAccountAndDate | query | 5 | 🔴 Pendiente |
| createAnalyticsRecord | mutation | 22 | 🔴 Pendiente |
| updateAnalyticsRecord | mutation | 65 | 🔴 Pendiente |

## convex/instagram/autoReply.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getAutoReplyRules | query | 6 | 🔴 Pendiente |
| getActiveRules | query | 25 | 🔴 Pendiente |
| createAutoReplyRule | mutation | 38 | 🔴 Pendiente |
| updateAutoReplyRule | mutation | 98 | 🔴 Pendiente |
| deleteAutoReplyRule | mutation | 159 | 🔴 Pendiente |
| toggleRuleStatus | mutation | 177 | 🔴 Pendiente |
| incrementRuleStats | mutation | 272 | 🔴 Pendiente |
| getRuleStats | query | 289 | 🔴 Pendiente |

## convex/instagram/messages.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getThreads | query | 6 | 🔴 Pendiente |
| getThreadMessages | query | 53 | 🔴 Pendiente |
| markThreadAsRead | mutation | 73 | 🔴 Pendiente |
| saveSentMessage | mutation | 153 | 🔴 Pendiente |
| getUnreadCount | query | 183 | 🔴 Pendiente |
| saveComment | mutation | 273 | 🔴 Pendiente |
| saveMention | mutation | 310 | 🔴 Pendiente |

## convex/instagram/posts.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getPostsToPublish | query | 5 | 🔴 Pendiente |
| getPostById | query | 22 | 🔴 Pendiente |
| updateAISuggestions | mutation | 29 | 🔴 Pendiente |
| getScheduledPosts | query | 44 | 🔴 Pendiente |
| getUpcomingPosts | query | 79 | 🔴 Pendiente |
| createScheduledPost | mutation | 100 | 🔴 Pendiente |
| updateScheduledPost | mutation | 144 | 🔴 Pendiente |
| deleteScheduledPost | mutation | 183 | 🔴 Pendiente |
| publishPostNow | mutation | 205 | 🔴 Pendiente |
| markPostPublished | mutation | 245 | 🔴 Pendiente |
| markPostFailed | mutation | 270 | 🔴 Pendiente |
| duplicatePost | mutation | 286 | 🔴 Pendiente |
| getPostsByDate | query | 324 | 🔴 Pendiente |
| getPostStats | query | 342 | 🔴 Pendiente |

## convex/instagram/templates.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getUserTemplates | query | 5 | 🔴 Pendiente |
| getTemplateById | query | 18 | 🔴 Pendiente |
| createTemplate | mutation | 26 | 🔴 Pendiente |
| updateTemplate | mutation | 62 | 🔴 Pendiente |
| deleteTemplate | mutation | 101 | 🔴 Pendiente |
| useTemplate | mutation | 119 | 🔴 Pendiente |
| getPopularTemplates | query | 155 | 🔴 Pendiente |
| duplicateTemplate | mutation | 169 | 🔴 Pendiente |

## convex/market/economicCalendar.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| isAdminUser | query | 6 | 🔴 Pendiente |
| getEventsByDate | query | 17 | 🔴 Pendiente |
| getEventsByDateRange | query | 29 | 🔴 Pendiente |
| getUpcomingHighImpact | query | 48 | 🔴 Pendiente |
| getEventsByCountry | query | 68 | 🔴 Pendiente |
| getEventDetails | query | 93 | 🔴 Pendiente |
| syncEvent | mutation | 228 | 🔴 Pendiente |
| getCalendarStats | query | 395 | 🔴 Pendiente |

## convex/market/marketNews.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getNewsByCategory | query | 6 | 🔴 Pendiente |
| getTrendingNews | query | 30 | 🔴 Pendiente |
| getRecentNews | query | 45 | 🔴 Pendiente |
| getAINews | query | 62 | 🔴 Pendiente |
| getNewsByPair | query | 76 | 🔴 Pendiente |
| getNewsById | query | 94 | 🔴 Pendiente |
| searchNews | query | 101 | 🔴 Pendiente |
| syncNewsArticle | mutation | 219 | 🔴 Pendiente |
| likeNews | mutation | 324 | 🔴 Pendiente |
| getNewsSentiment | query | 350 | 🔴 Pendiente |
| getActiveSources | query | 381 | 🔴 Pendiente |
| addNewsSource | mutation | 393 | 🔴 Pendiente |
| createAINews | mutation | 508 | 🔴 Pendiente |

## convex/mercadopagoApi.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| createPaymentPreference | mutation | 76 | 🔴 Pendiente |
| processPaymentWebhook | mutation | 219 | 🔴 Pendiente |

## convex/notifications.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getNotifications | query | 7 | 🔴 Pendiente |
| getNotificationsSince | query | 25 | 🔴 Pendiente |
| getUnreadCount | query | 41 | 🔴 Pendiente |
| getUnreadCountSince | query | 53 | 🔴 Pendiente |
| createNotification | mutation | 73 | 🔴 Pendiente |
| markAsRead | mutation | 122 | 🔴 Pendiente |
| markAllAsRead | mutation | 142 | 🔴 Pendiente |
| deleteNotification | mutation | 159 | 🔴 Pendiente |
| deleteOldNotifications | mutation | 176 | 🔴 Pendiente |

## convex/paymentOrchestrator.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| createZenobankPayment | mutation | 159 | 🔴 Pendiente |
| updateStatus | mutation | 238 | 🔴 Pendiente |
| updateUserRole | mutation | 260 | 🔴 Pendiente |
| manualApprovePayment | mutation | 284 | 🔴 Pendiente |

## convex/payments.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| verifyCheckoutSession | mutation | 266 | 🔴 Pendiente |

## convex/pendingOperations.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| queueOperation | mutation | 7 | 🔴 Pendiente |
| getPendingOperations | query | 40 | 🔴 Pendiente |
| getAllPendingOperations | query | 57 | 🔴 Pendiente |
| getPendingStats | query | 83 | 🔴 Pendiente |
| markOperationProcessing | mutation | 117 | 🔴 Pendiente |
| markOperationCompleted | mutation | 126 | 🔴 Pendiente |
| markOperationFailed | mutation | 136 | 🔴 Pendiente |
| retryOperation | mutation | 166 | 🔴 Pendiente |
| deleteOperation | mutation | 177 | 🔴 Pendiente |
| cleanupExpiredOperations | mutation | 185 | 🔴 Pendiente |
| retryAllPending | mutation | 206 | 🔴 Pendiente |

## convex/platformConfig.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getConfig | query | 14 | 🔴 Pendiente |
| deleteConfig | mutation | 72 | 🔴 Pendiente |

## convex/posts.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getPosts | query | 35 | 🔴 Pendiente |
| getPostsPaginated | query | 112 | 🔴 Pendiente |
| getPostTotalPoints | query | 1366 | 🔴 Pendiente |
| getTopPointsPosts | query | 1377 | 🔴 Pendiente |

## convex/products.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getProducts | query | 5 | 🔴 Pendiente |
| getFeaturedProducts | query | 27 | 🔴 Pendiente |
| getProductById | query | 43 | 🔴 Pendiente |
| searchProducts | query | 87 | 🔴 Pendiente |
| getTopProducts | query | 118 | 🔴 Pendiente |
| getProductsByCategory | query | 142 | 🔴 Pendiente |

## convex/profiles.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getProfile | query | 8 | 🔴 Pendiente |
| getProfileByUsuario | query | 21 | 🔴 Pendiente |
| getProfileByEmail | query | 34 | 🔴 Pendiente |
| validateLogin | query | 61 | 🔴 Pendiente |
| getAllProfiles | query | 100 | 🔴 Pendiente |
| registerWithReferral | mutation | 291 | 🔴 Pendiente |
| recordLogin | mutation | 601 | 🔴 Pendiente |
| addXp | mutation | 697 | 🔴 Pendiente |
| restoreProfile | mutation | 827 | 🔴 Pendiente |
| getDeletedProfiles | query | 891 | 🔴 Pendiente |
| getAuditLogs | query | 918 | 🔴 Pendiente |
| addBalance | mutation | 942 | 🔴 Pendiente |
| recalculateAccuracy | mutation | 971 | 🔴 Pendiente |

## convex/qa.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getQuestions | query | 5 | 🔴 Pendiente |
| askQuestion | mutation | 21 | 🔴 Pendiente |
| answerQuestion | mutation | 39 | 🔴 Pendiente |
| deleteQuestion | mutation | 54 | 🔴 Pendiente |

## convex/recursos.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getRecursos | query | 6 | 🔴 Pendiente |
| getRecursosByUser | query | 14 | 🔴 Pendiente |

## convex/referrals.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getReferralStats | query | 361 | 🔴 Pendiente |
| recordReferralPurchase | mutation | 480 | 🔴 Pendiente |

## convex/reviews.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getCommunityReviews | query | 36 | 🔴 Pendiente |
| getCommunityRating | query | 59 | 🔴 Pendiente |
| getPlatformReviews | query | 134 | 🔴 Pendiente |

## convex/rewards.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getRewardsCatalog | query | 4 | 🔴 Pendiente |
| getUserRewards | query | 12 | 🔴 Pendiente |
| redeemReward | mutation | 24 | 🔴 Pendiente |
| activateReward | mutation | 72 | 🔴 Pendiente |

## convex/savedPosts.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getSavedPosts | query | 4 | 🔴 Pendiente |
| hasSavedPost | query | 15 | 🔴 Pendiente |
| savePost | mutation | 28 | 🔴 Pendiente |
| unsavePost | mutation | 48 | 🔴 Pendiente |

## convex/signalNotifications.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getUsersEligibleForSignalNotification | query | 132 | 🔴 Pendiente |
| shouldNotifyUser | query | 166 | 🔴 Pendiente |
| recordSignalNotification | mutation | 198 | 🔴 Pendiente |
| getSignalNotificationStats | query | 260 | 🔴 Pendiente |
| getProviderById | query | 417 | 🔴 Pendiente |

## convex/signals.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getSignalPlans | query | 6 | 🔴 Pendiente |
| getFeaturedPlans | query | 16 | 🔴 Pendiente |
| getPlanBySlug | query | 29 | 🔴 Pendiente |
| getActiveSignals | query | 40 | 🔴 Pendiente |
| getSignalsByType | query | 64 | 🔴 Pendiente |
| getSignalsByPair | query | 82 | 🔴 Pendiente |
| getSignalById | query | 92 | 🔴 Pendiente |
| getSignalProviders | query | 127 | 🔴 Pendiente |
| getTopProviders | query | 140 | 🔴 Pendiente |
| getProviderByUserId | query | 157 | 🔴 Pendiente |
| getSignalStats | query | 500 | 🔴 Pendiente |
| getProviderStats | query | 527 | 🔴 Pendiente |
| getSignalHistory | query | 609 | 🔴 Pendiente |

## convex/strategies.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getPublishedStrategies | query | 10 | 🔴 Pendiente |
| getStrategyById | query | 111 | 🔴 Pendiente |
| getStrategyByIdWithAccess | query | 145 | 🔴 Pendiente |
| getUserStrategies | query | 209 | 🔴 Pendiente |
| searchStrategies | query | 230 | 🔴 Pendiente |
| getTopStrategies | query | 278 | 🔴 Pendiente |
| getSellerLeaderboard | query | 326 | 🔴 Pendiente |
| createStrategy | mutation | 391 | 🔴 Pendiente |
| updateStrategy | mutation | 433 | 🔴 Pendiente |
| deleteStrategy | mutation | 470 | 🔴 Pendiente |
| publishStrategy | mutation | 493 | 🔴 Pendiente |
| purchaseStrategy | mutation | 520 | 🔴 Pendiente |
| rateStrategy | mutation | 623 | 🔴 Pendiente |
| getUserPurchases | query | 664 | 🔴 Pendiente |
| hasUserPurchased | query | 686 | 🔴 Pendiente |
| getUserBookLibrary | query | 701 | 🔴 Pendiente |
| addToBookLibrary | mutation | 713 | 🔴 Pendiente |
| removeFromBookLibrary | mutation | 748 | 🔴 Pendiente |

## convex/subcommunities.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getSubcommunities | query | 8 | 🔴 Pendiente |
| getSubcommunitiesByType | query | 22 | 🔴 Pendiente |
| getSubcommunity | query | 48 | 🔴 Pendiente |
| getSubcommunityById | query | 72 | 🔴 Pendiente |
| getUserSubcommunities | query | 87 | 🔴 Pendiente |
| getSubcommunityMembers | query | 106 | 🔴 Pendiente |
| checkAccess | query | 136 | 🔴 Pendiente |
| getSubcommunityPosts | query | 179 | 🔴 Pendiente |
| updateSubcommunity | mutation | 330 | 🔴 Pendiente |
| deleteSubcommunity | mutation | 383 | 🔴 Pendiente |
| joinSubcommunity | mutation | 400 | 🔴 Pendiente |
| leaveSubcommunity | mutation | 462 | 🔴 Pendiente |
| changeMemberRole | mutation | 491 | 🔴 Pendiente |
| removeMember | mutation | 530 | 🔴 Pendiente |
| checkSubscription | query | 579 | 🔴 Pendiente |
| subscribeToSubcommunity | mutation | 606 | 🔴 Pendiente |
| cancelSubcommunitySubscription | mutation | 673 | 🔴 Pendiente |

## convex/subcommunityChat.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getChannel | query | 6 | 🔴 Pendiente |
| getMessages | query | 18 | 🔴 Pendiente |
| sendMessage | mutation | 70 | 🔴 Pendiente |
| deleteMessage | mutation | 109 | 🔴 Pendiente |

## convex/subcommunityInvites.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| createInvite | mutation | 4 | 🔴 Pendiente |
| getPendingInvites | query | 67 | 🔴 Pendiente |
| acceptInvite | mutation | 97 | 🔴 Pendiente |
| declineInvite | mutation | 156 | 🔴 Pendiente |

## convex/subcommunityTV.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getTVStatus | query | 6 | 🔴 Pendiente |
| startStream | mutation | 23 | 🔴 Pendiente |
| stopStream | mutation | 58 | 🔴 Pendiente |
| updateStreamUrl | mutation | 89 | 🔴 Pendiente |

## convex/subscriptions.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getActivePlans | query | 4 | 🔴 Pendiente |
| getPlanById | query | 15 | 🔴 Pendiente |
| getCurrentSubscription | query | 22 | 🔴 Pendiente |
| createSubscription | mutation | 35 | 🔴 Pendiente |
| cancelSubscription | mutation | 75 | 🔴 Pendiente |
| getUserSubscriptionHistory | query | 98 | 🔴 Pendiente |

## convex/traderVerification.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| startVerification | mutation | 58 | 🔴 Pendiente |
| uploadKYCDocument | mutation | 99 | 🔴 Pendiente |
| connectBroker | mutation | 148 | 🔴 Pendiente |
| disconnectBroker | mutation | 190 | 🔴 Pendiente |
| updateVerificationLevel | mutation | 215 | 🔴 Pendiente |
| listAllVerifications | query | 246 | 🔴 Pendiente |
| updateVerificationStatus | mutation | 269 | 🔴 Pendiente |

## convex/userPreferences.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getPreferences | query | 4 | 🔴 Pendiente |
| updateTheme | mutation | 48 | 🔴 Pendiente |
| updateLanguage | mutation | 109 | 🔴 Pendiente |
| updateNotifications | mutation | 164 | 🔴 Pendiente |

## convex/whatsappCron.ts
| Función | Tipo | Línea | Estado |
|---------|------|-------|--------|
| getPendingNotifications | query | 238 | 🔴 Pendiente |
| getSentNotifications | query | 248 | 🔴 Pendiente |
| getFailedNotifications | query | 258 | 🔴 Pendiente |
| getNotificationStats | query | 268 | 🔴 Pendiente |
| getAllNotifications | query | 279 | 🔴 Pendiente |
| deleteNotification | mutation | 288 | 🔴 Pendiente |

