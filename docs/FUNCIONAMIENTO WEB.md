# 📊 TradeShare Web Platform - Complete Feature Inventory

**Document Version:** 1.0  
**Last Updated:** 2026-03-31  
**Total Features:** 280+  
**Status:** Production Ready

---

## 📋 Executive Summary

TradeShare is a **comprehensive social trading platform** that combines:

- 🏛️ **Social Network** - Posts, comments, communities, chat
- 📈 **Trading Tools** - Signals, market data, journal, prop firms
- 🎓 **Education** - Courses, academies, certifications
- 🛍️ **Marketplace** - Products, strategies, services
- 🎮 **Gamification** - XP, levels, achievements, competitions
- 🤖 **AI Agents** - Automated content, analysis, assistance
- 📢 **Advertising** - Full ad engine with targeting
- 📸 **Instagram** - Marketing automation suite
- 💰 **Payments** - Multi-provider payment processing
- 🛠️ **Admin Tools** - Complete moderation and management

---

## 🔐 1. AUTHENTICATION & AUTHORIZATION

### 1.1 JWT Authentication System
| Feature | Description | Files |
|---------|-------------|-------|
| **Token-Based Auth** | Access tokens (1h) + Refresh tokens (7d) with automatic rotation | `convex/authJwt.ts` |
| **Session Management** | Persistent sessions with keep-alive mechanism | `src/utils/jwtSessionManager.ts`, `src/hooks/useSessionPersistence.ts` |
| **Rate Limiting** | Login/registration rate limits to prevent brute force | `convex/lib/rateLimit.ts`, `convex/authRateLimits` |
| **Role-Based Access** | 7-tier role system: FREE, PRO, ELITE, CREATOR, MOD, ADMIN, SUPERADMIN | `convex/schema.ts` (profiles.role) |

### 1.2 Authentication Methods
| Feature | Description | Files |
|---------|-------------|-------|
| **Email/Password Login** | Traditional credential-based authentication with bcrypt hashing | `convex/auth.ts`, `src/components/AuthModal.tsx` |
| **Email Verification** | Token-based email verification with expiration | `convex/emailVerification.ts`, `convex/emailVerificationTokens`, `src/views/VerifyEmailView.tsx` |
| **Password Reset** | Password recovery via time-limited email tokens | `convex/passwordResetTokens`, `src/views/ResetPasswordView.tsx` |
| **Session Persistence** | Auto-renew sessions across page reloads | `src/services/authBase.ts` |

---

## 👤 2. USER PROFILE & GAMIFICATION

### 2.1 User Profiles
| Feature | Description | Files |
|---------|-------------|-------|
| **Complete Profiles** | Avatar, banner, bio, location, social links, trading style | `convex/profiles.ts`, `src/views/PerfilView.tsx` |
| **Trading Stats** | Accuracy, win rate, PnL, reputation score, total trades | `convex/schema.ts` (estadisticas) |
| **Watchlist** | Personal asset watchlist management | `convex/profiles.ts` (watchlist field) |
| **Profile Visits** | Track and display profile visitors | `src/components/ProfileVisitModal.tsx` |
| **Verification Badges** | Email, phone, KYC, broker verification status | `convex/trader_verification.ts` |
| **Follow System** | Follow/unfollow users with follower counts | `convex/profiles.ts` (seguidores, siguiendo) |

### 2.2 Gamification System
| Feature | Description | Files |
|---------|-------------|-------|
| **XP & Levels** | Experience points with weekly/monthly tracking and level progression | `convex/gamification.ts`, `convex/lib/achievements.ts` |
| **Achievements** | 4 categories (trading, social, learning, special) with rarity tiers (bronze/silver/gold/diamond) | `convex/achievements.ts`, `convex/userAchievements` |
| **Daily Streaks** | Login streak tracking with milestone rewards | `convex/schema.ts` (streakDays, streakReward) |
| **Badges & Medals** | Collectible badges and medals display | `convex/schema.ts` (badges, medallas fields) |
| **Leaderboards** | Global rankings by XP, accuracy, reputation with virtualization | `src/views/LeaderboardView.tsx`, `convex/gamification.ts` |
| **Prize Redemption** | Credit-based prize catalog with redemption tracking | `convex/prizes.ts`, `convex/prizesCatalog`, `convex/prizeRedemptions`, `src/views/PrizeRedemptionView.tsx` |
| **Competitions** | Daily/weekly/monthly trading competitions with prize pools | `convex/competitions.ts`, `convex/competition_participants`, `src/views/CompetitionsView.tsx` |
| **Token Economy** | Daily token limits, tipping system for posts, token transactions | `convex/schema.ts` (token_balances, token_transactions, token_daily_limits) |

---

## 📱 3. SOCIAL FEATURES

### 3.1 Posts & Feed
| Feature | Description | Files |
|---------|-------------|-------|
| **Smart Feed** | ML-powered personalized feed with user behavior tracking and interest modeling | `convex/feed.ts`, `convex/mlFeed.ts`, `convex/user_behavior.ts`, `convex/user_interests.ts`, `src/hooks/usePostsFeed.ts` |
| **Post Creation** | Rich posts: text, image, poll, signal, chart types with media upload | `convex/posts.ts`, `src/components/CreatePostModal.tsx` |
| **Post Comments** | Relational comments with likes and nested reply support | `convex/comments.ts`, `convex/postComments`, `src/components/CommentSection.tsx` |
| **Post Likes** | Separate likes table for performance tracking | `convex/posts.ts`, `convex/postLikes` |
| **Post Metrics** | Views, engagement score, CTR, time spent tracking | `convex/postMetrics.ts` |
| **Post Sharing** | Shareable links with deep linking support | `src/utils/deeplink.ts`, `src/views/ShareablePostView.tsx` |
| **Saved Posts** | Bookmark/save posts for later reading | `convex/savedPosts.ts` |
| **AI Agent Posts** | AI-generated trading analysis posts | `convex/aiAgent.ts`, `src/components/PostCardAIAgent.tsx` |
| **Polls** | Community polls with voting and results display | `convex/schema.ts` (encuesta field), `convex/dailyPolls.ts` |
| **Daily Polls** | Daily market direction polls per community | `convex/dailyPolls.ts`, `src/views/comunidad/DailyPollWidget.tsx` |
| **Post Actions** | Like, comment, share, tip, report actions | `src/components/PostActions.tsx` |

### 3.2 Communities
| Feature | Description | Files |
|---------|-------------|-------|
| **Community Creation** | Create communities with monetization plans (free/starter/growth/scale/enterprise) | `convex/communities.ts`, `src/components/CreateCommunityForm.tsx` |
| **Community Types** | Public, unlisted, private visibility + free/paid access models | `convex/schema.ts` (communities) |
| **Community Monetization** | Paid subscriptions, revenue sharing, automated payouts | `convex/communityMonetization.ts`, `convex/communityPayouts` |
| **Subcommunities** | Nested communities with own chat, TV, ads, members | `convex/subcommunities.ts`, `convex/subcommunityPosts.ts`, `convex/subcommunityChat.ts`, `src/views/subcommunity/SubcommunityView.tsx` |
| **Community Members** | Role-based membership (owner/admin/moderator/member/pending) | `convex/communityMembers.ts`, `convex/subcommunityMembers.ts` |
| **Community Reviews** | Rating and review system with moderation | `convex/communityReviews.ts`, `src/components/CommunityReviews.tsx` |
| **Community TV** | YouTube live stream integration for communities | `convex/schema.ts` (enableTVShare, tvShareUrl), `src/components/community/CommunityTVSection.tsx` |
| **Community Chat** | Real-time chat with multiple channels | `convex/chat.ts`, `convex/chatChannels.ts`, `src/components/LiveChatWidget.tsx` |
| **Community Posts** | Separate posts table for community-specific content | `convex/communityPosts.ts`, `convex/subcommunityPosts.ts` |
| **Community Invites** | Email-based invitation system with token validation | `convex/subcommunityInvites.ts` |
| **Discover Communities** | Browse and join communities with search and filters | `src/views/DiscoverCommunities.tsx` |
| **Community Management** | Admin panel for community oversight | `src/components/admin/CommunityManagement.tsx` |

### 3.3 Social Interactions
| Feature | Description | Files |
|---------|-------------|-------|
| **Referral System** | Referral codes with XP rewards and revenue share tracking | `convex/referrals.ts`, `convex/referralCodes`, `src/views/ReferralView.tsx`, `src/components/ReferralPanel.tsx` |
| **Mentions** | User mentions with automatic notifications | `convex/schema.ts` (notifications.type = 'mention') |
| **Profile Cards** | Hover cards with quick profile info | `src/components/ProfileCard.tsx` |

---

## 💰 4. PAYMENTS & MONETIZATION

### 4.1 Payment Processing
| Feature | Description | Files |
|---------|-------------|-------|
| **Multi-Provider Payments** | MercadoPago, Zenobank, Stripe integration with fallback | `convex/payments.ts`, `convex/paymentOrchestrator.ts`, `convex/mercadopagoApi.ts` |
| **Payment Tracking** | Complete payment history with status tracking | `convex/schema.ts` (payments table) |
| **Checkout Success/Cancel** | Post-payment landing pages with order details | `src/views/CheckoutSuccessView.tsx`, `src/views/CheckoutCancelView.tsx` |
| **User Wallet** | Wallet balance and transaction history display | `src/components/payments/UserWallet.tsx` |
| **Withdraw System** | Withdrawal requests and approval workflow | `src/components/payments/WithdrawForm.tsx` |
| **Deposit Form** | Deposit interface with multiple methods | `src/views/payments/DepositForm.tsx` |
| **Payment Stats** | Admin payment statistics and analytics | `src/components/admin/PaymentStats.tsx` |

### 4.2 Subscriptions
| Feature | Description | Files |
|---------|-------------|-------|
| **Subscription Plans** | Tiered plans (FREE, PRO, ELITE, CREATOR) with feature gating | `convex/subscriptions.ts`, `convex/subscriptionPlans` |
| **Subscription Management** | Active subscriptions, cancellation, history | `convex/subscriptions.ts`, `convex/stripeSubscriptions`, `convex/communitySubscriptions` |
| **Community Subscriptions** | Per-community paid access with tier management | `convex/communitySubscriptions.ts`, `convex/communityAccess` |
| **Signal Subscriptions** | Signal provider subscriptions with daily/weekly/monthly limits | `convex/schema.ts` (signal_plans, signal_subscriptions) |
| **Course Access** | Course purchase and access tracking with expiration | `convex/userCourseAccess.ts`, `convex/courseAccessTypes` |

### 4.3 Creator Economy
| Feature | Description | Files |
|---------|-------------|-------|
| **Creator Profiles** | Dedicated creator profiles with stats and portfolio | `convex/creator_profiles.ts`, `src/views/CreatorView.tsx` |
| **Creator Earnings** | Multi-source earnings tracking (subs, products, signals, affiliates) | `convex/creator_earnings.ts` |
| **Creator Followers** | Follow creators separately from regular users | `convex/creator_followers.ts` |
| **Creator Dashboard** | Analytics, products, earnings management interface | `src/views/CreatorDashboard.tsx`, `convex/creatorDashboard.ts` |
| **Author Payouts** | Automated payout system for marketplace authors | `convex/author_payouts.ts` |
| **Affiliate System** | Affiliate codes, referrals, commission tracking | `convex/affiliates.ts`, `convex/affiliateReferrals` |

---

## 📈 5. TRADING FEATURES

### 5.1 Signal System
| Feature | Description | Files |
|---------|-------------|-------|
| **Signal Lifecycle** | Complete state machine: draft→pending_review→active→in_profit/loss→closed | `convex/signals.ts`, `convex/signalsLifecycle.ts`, `docs/features/SIGNAL_LIFECYCLE.md` |
| **Signal Types** | Forex, crypto, indices, commodities, stocks, binary, options | `convex/schema.ts` (signals.type) |
| **Signal Priority** | VIP, premium, standard, free access tiers | `convex/schema.ts` (signals.priority) |
| **Signal Performance** | Win rate, PnL, pips tracking per signal provider | `convex/signal_performance.ts`, `convex/signalStatistics` |
| **Signal Notifications** | Push, email, Telegram, SMS, WhatsApp alerts for new signals | `convex/signal_notifications.ts`, `convex/schema.ts` (signal_notification_prefs) |
| **Signal Providers** | Verified provider system with ratings and reviews | `convex/signal_providers.ts` |
| **Hybrid Signals** | Community signals (public + premium) with access control | `convex/schema.ts` (communitySignals) |
| **User Signal Actions** | Track user trades executed from signals | `convex/schema.ts` (signal_subscribers_actions) |
| **Signal Management** | Admin panel for signal oversight | `src/components/admin/SignalManagement.tsx` |

### 5.2 Market Data
| Feature | Description | Files |
|---------|-------------|-------|
| **Economic Calendar** | Multi-source economic events with impact levels | `convex/economic_calendar.ts`, `src/components/calendar/*` |
| **Market News** | AI-curated news with sentiment analysis from multiple sources | `convex/news.ts`, `convex/market_news.ts`, `src/views/NewsView.tsx`, `src/components/news/NewsCard.tsx` |
| **News Sources** | RSS, API, webhook integrations with scheduling | `convex/news_sources.ts` |
| **Market Ticker** | Real-time price ticker widget with multiple symbols | `src/components/MarketTickerWidget.tsx`, `src/components/Ticker.tsx` |
| **TradingView Widget** | Advanced charting integration | `src/components/TradingViewWidget.tsx`, `src/views/GraficoView.tsx` |
| **Market Data Service** | Visibility-aware polling with deduplication | `src/services/marketDataService.ts` |

### 5.3 Trading Tools
| Feature | Description | Files |
|---------|-------------|-------|
| **Trading Journal (Bitácora)** | Personal trading log with emotions, screenshots, analytics | `convex/bitacora.ts`, `src/views/BitacoraView.tsx`, `src/services/bitacoraService.ts` |
| **Psychotrading** | Psychology-focused trading insights with shorts player | `src/views/PsicotradingView.tsx`, `src/components/psychotrading/PsychotradingShortsPlayer.tsx` |
| **Prop Firms** | Proprietary trading firm directory with filters | `convex/prop_firms.ts`, `src/views/PropFirmsView.tsx` |
| **Broker Integration** | Exness broker partnership with account linking | `src/services/exness.ts`, `src/views/ExnessView.tsx`, `src/components/BrokerConnect.tsx` |
| **Trading Copilot** | AI-powered trading assistance | `src/views/TradingCopilotView.tsx` |

---

## 🛍️ 6. MARKETPLACE

### 6.1 Products & Services
| Feature | Description | Files |
|---------|-------------|-------|
| **Product Marketplace** | EA, indicators, templates, courses, signals, VPS, tools | `convex/products.ts`, `convex/purchases.ts`, `src/views/MarketplaceView.tsx`, `src/views/ProductView.tsx` |
| **Product Reviews** | Verified purchase reviews with ratings and helpfulness | `convex/productReviews.ts`, `src/components/ProductReviewForm.tsx`, `src/components/ProductReviewList.tsx` |
| **Product Wishlist** | Save products for later purchase | `convex/schema.ts` (wishlists) |
| **Strategies Library** | Buyable/sellable trading strategies | `convex/strategies.ts`, `convex/strategyPurchases.ts`, `convex/bookLibrary.ts` |
| **Expert Advisors** | Dedicated EA marketplace section | `src/views/ExpertAdvisorsView.tsx` |
| **Marketplace Analytics** | Seller analytics dashboard with revenue, sales, conversion metrics | `convex/marketplaceAnalytics.ts`, `src/components/marketplace/MarketplaceAnalyticsDashboard.tsx` |

---

## 🎓 7. EDUCATION (ACADEMY)

### 7.1 Academy System
| Feature | Description | Files |
|---------|-------------|-------|
| **Community Academies** | Per-community academy creation with courses | `convex/schema.ts` (communityAcademies), `src/views/academy/CommunityAcademyView.tsx` |
| **Course Creation** | Multi-level courses (beginner/intermediate/advanced) with classes | `convex/communityCourses.ts`, `convex/classes.ts`, `src/views/academy/CreatorAcademyDashboard.tsx` |
| **Course Player** | Video/text/PDF classes with progress tracking and completion | `src/views/academy/CoursePlayerView.tsx` |
| **Course Access Types** | 3-tier access: free, rental (time-limited), lifetime | `convex/courseAccessTypes.ts`, `convex/userCourseAccess.ts` |
| **Progress Tracking** | Class completion tracking with certificates | `convex/userCourseProgress.ts` |
| **Q&A System** | Student questions with admin/creator answers | `convex/qa.ts`, `src/views/AcademiaView.tsx` |
| **Courses View** | General courses browsing and enrollment | `src/views/CursosView.tsx` |

---

## 📢 8. ADVERTISING ENGINE

### 8.1 Ad System
| Feature | Description | Files |
|---------|-------------|-------|
| **Ad Auction System** | Real-time bidding for ad slots with smart allocation | `convex/adAuction.ts`, `convex/ad_auctions.ts`, `convex/ad_bids.ts`, `convex/ad_slots.ts` |
| **Ad Campaigns** | Campaign management with budget, targeting, scheduling | `convex/ad_campaigns.ts`, `convex/ads.ts` |
| **Ad Variants** | Dynamic ad generation per user profile with A/B testing | `convex/ad_variants.ts`, `convex/adVariantGenerator.ts`, `convex/adVariantOptimizer.ts`, `convex/adVariantSelector.ts` |
| **Ad Targeting** | Interest, country, subscription tier, behavior targeting | `convex/adTargeting.ts`, `convex/user_ad_profiles.ts` |
| **Ad Tracking** | Impressions, clicks, conversions with analytics | `convex/ad_events.ts`, `convex/adTracking.ts` |
| **Ad Intelligence** | AI-powered ad optimization and performance prediction | `convex/adIntelligence.ts` |
| **Rotating Banners** | Feed, sidebar, discover ad placements with rotation | `src/components/ads/*`, `src/views/comunidad/SidebarAdSection.tsx`, `src/views/comunidad/VerticalAdBanner.tsx` |
| **Ad Management UI** | Admin ad management interface with campaign oversight | `src/components/admin/AdManagement.tsx` |

---

## 📸 9. INSTAGRAM INTEGRATION

### 9.1 Instagram Marketing Suite
| Feature | Description | Files |
|---------|-------------|-------|
| **Account Connection** | OAuth Instagram business account linking with multi-account support | `convex/instagram/accounts.ts`, `src/components/instagram/InstagramConnect.tsx` |
| **Post Scheduling** | Schedule posts with timezone support and queue management | `convex/instagram/scheduler.ts`, `convex/instagram_scheduled_posts.ts`, `src/components/instagram/InstagramQueue.tsx` |
| **Auto-Reply** | AI-powered comment/DM auto-replies with custom rules | `convex/instagram/autoReply.ts`, `convex/instagram_auto_reply_rules.ts`, `src/components/instagram/InstagramAutoReply.tsx` |
| **Media Library** | Instagram media management with filtering | `convex/instagram/posts.ts`, `src/components/instagram/InstagramMediaLibrary.tsx` |
| **Post Editor** | Instagram post composer with AI caption generation | `src/components/instagram/InstagramPostEditor.tsx` |
| **Analytics** | Follower growth, engagement rates, top posts analysis | `convex/instagram/analytics.ts`, `convex/instagram/analyticsOps.ts`, `src/components/instagram/InstagramAnalytics.tsx` |
| **Inbox** | DM and comment inbox with unified view | `convex/instagram/messages.ts`, `src/components/instagram/InstagramInbox.tsx` |
| **Content Templates** | Reusable post templates for consistent branding | `convex/instagram/templates.ts`, `convex/instagram_content_templates.ts` |
| **AI Queue** | AI processing queue for captions, hashtags, replies | `convex/instagram_ai_queue.ts` |
| **Admin Management** | Admin panel for connected Instagram accounts | `src/components/admin/InstagramConnectedAccounts.tsx` |

---

## 🤖 10. AI AGENTS

### 10.1 AI Features
| Feature | Description | Files |
|---------|-------------|-------|
| **AI Agent Feed** | AI-generated trading analysis posts | `convex/aiAgent.ts`, `src/components/AIAgentFeed.tsx` |
| **AI Pattern Scanner** | Technical analysis pattern detection (head & shoulders, triangles, etc.) | `src/components/AIPatternScanner.tsx`, `src/services/aiPatternDetection.ts` |
| **Voice Agent** | Voice-activated AI assistant with speech recognition | `src/components/agents/VoiceAgent.tsx` |
| **Risk Assistant** | AI risk analysis and position sizing assistant | `src/components/agents/RiskAssistant.tsx` |
| **Course Assistant** | AI course guidance and recommendations | `src/components/agents/CourseAssistant.tsx` |
| **Creator Assistant** | AI help for creators with content suggestions | `src/components/agents/CreatorAssistant.tsx`, `src/components/agents/CreatorAssistantChat.tsx` |
| **Expert Consultant** | AI expert advisor for trading questions | `src/components/agents/ExpertConsultant.tsx` |
| **Kimi Chat** | Kimi K2.5 AI chat integration | `src/components/agents/KimiChat.tsx`, `scripts/aurora-kimi-agent.mjs` |
| **News Agent** | AI-curated news feed with summarization | `src/services/agents/newsAgentService.ts`, `src/components/agents/NewsFeed.tsx` |
| **LangGraph Agent** | Advanced agent orchestration with LangGraph | `src/hooks/useLangGraphAgent.tsx`, `src/services/agents/langgraph/*` |
| **Agent Orchestration** | Multi-agent coordination and task distribution | `src/hooks/useAgentOrchestration.tsx`, `src/services/agents/agentOrchestrator.ts` |
| **Search Agent** | AI-powered semantic search | `src/hooks/useSearchAgent.tsx`, `src/services/agents/subAgentManager.ts` |

---

## 🔔 11. NOTIFICATIONS

### 11.1 Notification System
| Feature | Description | Files |
|---------|-------------|-------|
| **Push Notifications** | Web push with subscription management and delivery tracking | `convex/push.ts`, `convex/pushSubscriptions`, `convex/pushActions.ts`, `src/hooks/usePushNotifications.ts` |
| **Email Notifications** | Email notification system with templates | `convex/emailNotifications.ts` |
| **WhatsApp Notifications** | WhatsApp integration for alerts with cron scheduling | `convex/whatsappNotifications.ts`, `convex/whatsappCron.ts`, `src/components/admin/WhatsAppNotificationPanel.tsx` |
| **In-App Notifications** | Real-time notification center with read/unread status | `convex/notifications.ts`, `src/components/Notifications.tsx`, `src/services/notifications/notificationService.ts` |
| **Notification Preferences** | Per-user notification settings by type and channel | `convex/userPreferences.ts`, `src/components/PushPreferences.tsx`, `src/components/SignalNotificationPrefs.tsx` |

---

## 🎮 12. GAMING & APPS

### 12.1 Gaming Features
| Feature | Description | Files |
|---------|-------------|-------|
| **Apps System** | Pluggable app architecture for extensibility | `convex/apps.ts` |
| **Game Sessions** | Game play tracking with XP rewards | `convex/gameSessions.ts`, `convex/gameStats.ts` |
| **Gaming Room** | Gaming hub interface | `src/components/GamingRoom.tsx`, `src/views/JuegosView.tsx` |
| **Saboteador Invisible** | Custom social deduction game implementation | `src/views/SaboteadorInvisibleView.tsx` |

---

## 🛠️ 13. ADMIN & MODERATION

### 13.1 Admin Panel
| Feature | Description | Files |
|---------|-------------|-------|
| **Admin Dashboard** | Comprehensive admin control panel with platform analytics | `src/views/AdminView.tsx`, `src/components/admin/AdminDashboard.tsx`, `src/components/admin/AdminPanelDashboard.tsx` |
| **User Management** | User administration with search, ban, role changes | `src/components/admin/UserManagement.tsx` |
| **Post Management** | Post moderation, pin, delete, feature | `src/components/admin/PostManagement.tsx` |
| **Community Management** | Community oversight and approval | `src/components/admin/CommunityManagement.tsx` |
| **Product Management** | Marketplace product moderation | `src/components/admin/ProductManagement.tsx` |
| **Signal Management** | Signal oversight and approval | `src/components/admin/SignalManagement.tsx` |
| **Payment Management** | Payment tracking and statistics | `src/components/admin/PaymentManagementTable.tsx`, `src/components/admin/PaymentStats.tsx`, `src/views/admin/AdminPaymentsView.tsx`, `src/views/admin/MercadoPagoAdminPanel.tsx` |
| **Reward Management** | Prize and reward administration | `src/components/admin/RewardManagement.tsx` |
| **Prop Firm Management** | Prop firm directory administration | `src/components/admin/PropFirmManagement.tsx` |
| **Poll Management** | Community poll administration | `src/components/admin/PollManagement.tsx` |
| **Ad Management** | Ad campaign oversight | `src/components/admin/AdManagement.tsx` |
| **Instagram Management** | Connected Instagram accounts | `src/components/admin/InstagramConnectedAccounts.tsx` |
| **App Management** | App administration | `src/components/admin/AppManagement.tsx` |

### 13.2 Moderation Tools
| Feature | Description | Files |
|---------|-------------|-------|
| **Moderation Panel** | Content moderation tools with queue | `src/components/admin/ModerationPanel.tsx`, `convex/moderation.ts`, `convex/moderationConfig.ts`, `convex/moderationLogs.ts` |
| **Spam Reports** | User-reported spam with severity levels | `convex/spamReports.ts` |
| **Blocked Words** | Configurable word filtering | `convex/moderationConfig.ts` (blockedWords) |
| **Moderation Logs** | Audit trail for moderation actions | `convex/moderationLogs.ts` |
| **Admin Findings** | AI-detected issues tracking | `convex/adminFindings.ts` |

### 13.3 System Monitoring
| Feature | Description | Files |
|---------|-------------|-------|
| **System Errors** | Error tracking with severity levels | `convex/systemErrors.ts` |
| **Audit Logs** | Comprehensive action logging | `convex/auditLogs.ts`, `convex/auditUtils.ts` |
| **Pending Operations** | Offline operation queue | `convex/pendingOperations.ts` |
| **Data Export** | User data export (GDPR compliance) | `convex/dataExport.ts`, `src/components/ExportDataPanel.tsx` |
| **Backup Panel** | Data backup and restore | `convex/backup.ts`, `convex/backupInternal.ts`, `src/components/admin/BackupPanel.tsx` |
| **Trash Panel** | Soft-delete recovery | `src/components/admin/TrashPanel.tsx` |
| **Settings Panel** | Platform-wide configuration | `src/components/admin/SettingsPanel.tsx`, `convex/platformConfig.ts` |
| **CSP Whitelist** | Content Security Policy management | `src/components/admin/CSPWhitelistPanel.tsx` |
| **Knowledge Panel** | Admin knowledge base | `src/components/admin/KnowledgePanel.tsx` |
| **Aurora Support** | AI support integration | `src/components/admin/AuroraSupportSection.tsx` |
| **Gaming Stats** | Gaming analytics | `src/components/admin/GamingStatsPanel.tsx` |
| **Marketing Pro Dashboard** | Marketing analytics | `src/components/admin/MarketingProDashboard.tsx` |
| **TradeHub Dashboard** | Platform analytics | `src/components/admin/TradeHubDashboard.tsx`, `src/components/admin/TradeHubAdminPanel.tsx` |
| **Agent Prompt Generator** | AI prompt engineering tool | `src/components/admin/AgentPromptGenerator.tsx` |
| **AI Agent Section** | AI agent configuration | `src/components/admin/AIAgentSection.tsx`, `src/components/admin/AIRoomSection.tsx` |

---

## 📊 14. ANALYTICS

### 14.1 Analytics Features
| Feature | Description | Files |
|---------|-------------|-------|
| **User Analytics** | User behavior tracking and segmentation | `convex/analytics.ts`, `convex/user_behavior.ts` |
| **Post Analytics** | Post performance metrics (views, engagement, CTR) | `convex/postMetrics.ts`, `convex/stats.ts` |
| **Community Analytics** | Community growth and engagement metrics | `convex/analytics.ts` |
| **Creator Analytics** | Creator earnings and follower statistics | `convex/creatorDashboard.ts` |
| **Marketplace Analytics** | Sales and revenue analytics | `convex/marketplaceAnalytics.ts` |
| **Instagram Analytics** | Instagram account performance | `convex/instagram/analytics.ts` |
| **Signal Analytics** | Signal performance tracking | `convex/signal_performance.ts`, `convex/signalStatistics` |

---

## ⚙️ 15. SYSTEM & INFRASTRUCTURE

### 15.1 Core Systems
| Feature | Description | Files |
|---------|-------------|-------|
| **Smart Feed Algorithm** | ML-powered feed ranking with user behavior modeling | `convex/feed.ts`, `convex/mlFeed.ts` |
| **Circuit Breakers** | External service fault tolerance with fallbacks | `src/lib/circuitBreaker.ts`, `src/lib/externalServices.ts`, `docs/adr/002-circuit-breakers.md` |
| **Rate Limiting** | API rate limiting on sensitive operations | `convex/lib/rateLimit.ts` |
| **CSP Hardening** | Content Security Policy with nonce-based approach | `docs/adr/003-csp-nonce.md`, `docs/adr/004-csp-hardening.md` |
| **Error Handling** | Resilient error system with boundaries | `docs/features/RESILIENT_ERROR_HANDLING.md`, `src/components/ErrorBoundary.tsx`, `src/components/GlobalErrorHandler.tsx`, `src/components/SectionErrorBoundary.tsx` |
| **Cache System** | Feed cache with intelligent invalidation | `convex/schema.ts` (feedCache) |
| **Scheduler/Cron Jobs** | Background job scheduling for news, WhatsApp, cleanup | `convex/scheduler.ts`, `convex/crons.ts`, `convex/newsScheduler.ts` |
| **Webhooks** | Webhook event system for external integrations | `convex/webhooks.ts` |
| **Files Storage** | File upload/download with multiple providers | `convex/files.ts`, `src/services/storage.ts`, `src/services/imageUpload.ts`, `src/services/postimg.ts` |
| **Logger** | Centralized logging system | `convex/logger.ts` |
| **Config System** | Platform-wide configuration | `convex/config.ts`, `convex/platformConfig.ts`, `convex/global_config.ts` |
| **Emergency Tools** | Emergency shutdown/maintenance mode | `convex/emergency.ts` |
| **Safeguards** | Migration and operation safeguards | `convex/safeguards.ts`, `convex/migrationCounters` |
| **Pending Notifications** | Notification queue for retry logic | `convex/pendingNotifications.ts` |

### 15.2 User Preferences
| Feature | Description | Files |
|---------|-------------|-------|
| **Theme System** | Dark/light/system themes with persistence | `convex/userPreferences.ts`, `src/hooks/useTheme.ts`, `src/components/ThemeSelector.tsx`, `src/components/AppearancePanel.tsx` |
| **Language** | Multi-language support (ES/EN/PT) | `convex/userPreferences.ts`, `src/hooks/useTranslation.ts`, `src/components/LanguageSelector.tsx` |
| **Accessibility** | Font size, reduced motion, high contrast | `convex/userPreferences.ts` |
| **Notification Settings** | Granular notification controls by type | `convex/userPreferences.ts` (notificationPreferences) |
| **Quiet Hours** | Do-not-disturb scheduling | `convex/userPreferences.ts` (quietHours) |

---

## 🧭 16. NAVIGATION & UX

### 16.1 Navigation
| Feature | Description | Files |
|---------|-------------|-------|
| **Main Navigation** | Top navigation bar with responsive design | `src/components/Navigation.tsx` |
| **Floating Actions Menu** | Mobile-friendly floating action menu | `src/components/FloatingActionsMenu.tsx`, `src/components/FloatingActionsBar.tsx` |
| **Floating Bar** | Bottom action bar for quick access | `src/components/FloatingBar.tsx` |
| **Deep Linking** | Shareable links with state preservation | `src/utils/deeplink.ts` |
| **Onboarding Flow** | First-time user onboarding with experience selector | `src/components/OnboardingFlow.tsx`, `src/components/onboarding/ExperienceSelector.tsx` |

### 16.2 UI Components (25+)
| Component | Purpose |
|-----------|---------|
| `PostCard` | Rich post display with actions |
| `Avatar` | User avatar with online status |
| `Leaderboard` | Rankings display with virtualization |
| `ReviewStars` | Rating display component |
| `MarketTickerWidget` | Real-time price ticker |
| `AdBanner` | Ad display with rotation |
| `AdPopupModal` | Interstitial ad modal |
| `Skeletons` | Loading state placeholders |
| `ToastNotifications` | In-app toast notifications |
| `FeedbackModal` | User feedback collection |
| `MusicPlayer` | Background music player |
| `AmbientBackground` | Dynamic animated backgrounds |
| `SEO` | Meta tags and SEO management |
| `CacheBadge` | Cache status indicator |
| `SyncStatus` | Data sync status indicator |
| `OfflineBanner` | Offline mode indicator |
| `DataSourceStatus` | External data health indicator |
| `ClearCacheTool` | Manual cache clearing tool |
| `ImageLazyLoad` | Optimized image loading |
| `VideoProtection` | Video DRM/protection |
| `VerifiedTrader` | Verification badge display |
| `ElectricLoader` | Custom loading animation |
| `AuroraIdeaHub` | Feature suggestions interface |
| `ThemeSelector` | Theme switching UI |
| `LanguageSelector` | Language selection UI |

---

## 📦 17. HOOKS & SERVICES

### 17.1 Custom Hooks (29 total)

| Hook | Purpose |
|------|---------|
| `useAgentOrchestration` | Multi-agent coordination |
| `useAIAssistant` | AI assistant interactions |
| `useAppEventListeners` | Global event handling |
| `useCommunitySupport` | Community data access |
| `useDataSourceStatus` | External service health monitoring |
| `useEngagementTracker` | User engagement tracking |
| `useFeedEvents` | Feed update events |
| `useFeedWithAds` | Ad injection into feed |
| `useHabitTracker` | Habit tracking |
| `useLangGraphAgent` | LangGraph AI agent |
| `useMarketData` | Market data fetching with visibility-aware polling |
| `useMemoizedCallbacks` | Performance optimization |
| `useModal` | Modal state management |
| `useNews` | News fetching |
| `useOfflineStatus` | Offline detection |
| `useOnboardingAssistant` | Onboarding guidance |
| `usePayment` | Payment processing |
| `usePollingCoordinator` | Polling management with visibility detection |
| `usePostFilters` | Post filtering |
| `usePostsFeed` | Feed consumption |
| `usePushNotifications` | Push notification handling |
| `useResilientData` | Fault-tolerant data fetching |
| `useSearchAgent` | AI-powered semantic search |
| `useSessionPersistence` | Session management |
| `useSignalWebSocket` | Real-time signal updates |
| `useTheme` | Theme switching |
| `useTranslation` | i18n translations |
| `useUserSignals` | User signal management |
| `useVisibilityAwarePolling` | Polling that pauses when tab hidden |

### 17.2 Services (27 total)

| Service | Purpose |
|---------|---------|
| `aiService` | AI API integration |
| `aiPatternDetection` | Technical analysis pattern detection |
| `authService` | Authentication operations |
| `authBase` | Base auth utilities |
| `backup/*` | Backup operations |
| `bitacoraService` | Trading journal operations |
| `distribution/*` | Content distribution |
| `exness` | Broker integration |
| `feedback` | User feedback collection |
| `feed/*` | Feed operations |
| `imageUpload` | Image upload utilities |
| `marketDataService` | Market data fetching |
| `newsService` | News aggregation |
| `notificationService` | Notifications |
| `paymentService` | Payment processing |
| `postService` | Post operations |
| `postimg` | Image hosting |
| `ranking/*` | Leaderboard/ranking operations |
| `sanitize` | Input sanitization |
| `storage` | Local storage wrapper |
| `user/*` | User operations |
| `youtube` | YouTube integration |
| `agents/*` | Agent orchestration |
| `analytics/*` | Analytics tracking |

---

## 📝 18. VIEWS (55 total)

| Category | Views |
|----------|-------|
| **Main** | ComunidadView, DashboardView, PerfilView, ConfiguracionView |
| **Academy** | AcademiaView, CursosView, CommunityAcademyView, CoursePlayerView, CreatorAcademyDashboard |
| **Communities** | ComunidadView, CommunityDetailView, DiscoverCommunities, SubcommunityView, CommunityCreatorSuite |
| **Marketplace** | MarketplaceView, ProductView, ExpertAdvisorsView |
| **Payments** | PaymentsView, PricingView, CheckoutSuccessView, CheckoutCancelView, DepositForm |
| **Signals** | SignalsView |
| **Admin** | AdminView, AdminPaymentsView, MercadoPagoAdminPanel |
| **Creator** | CreatorView, CreatorDashboard |
| **Social** | ReferralView, LeaderboardView, PrizeRedemptionView, CompetitionsView |
| **Trading** | GraficoView, BitacoraView, PsicotradingView, ExnessView, PropFirmsView |
| **Content** | NewsView, NewsHubView, PremiumObservatoryView, MarketingView, InstagramMarketingView |
| **Settings** | ConfiguracionView, LegalView, VerifyEmailView, ResetPasswordView |
| **Gaming** | JuegosView, SaboteadorInvisibleView |
| **Admin Tools** | AdAuctionView, AnalyticsDashboard, CalendarioView, BitacoraView, ShareablePostView, TradingCopilotView |
| **Special** | MorningBriefingCard, DailyCoachCard |

---

## 🗂️ 19. CONVEX BACKEND

### 19.1 Database Tables (50+)

**Core Tables:**
- profiles, posts, comments, communities, communityMembers, subcommunities
- products, purchases, payments, subscriptions, signals, notifications
- achievements, gamification, ads, campaigns, ad_events
- instagram_accounts, instagram_posts, instagram_scheduled_posts
- courses, classes, userCourseAccess, userCourseProgress
- competitions, prizes, prizeRedemptions, referrals, affiliates
- chat, chatChannels, chatMessages
- backups, auditLogs, systemErrors, moderationLogs

**Specialized Tables:**
- signal_performance, signal_providers, signal_notifications
- communityMonetization, communityPayouts, communityReviews
- productReviews, wishlists, strategies, bookLibrary
- creator_profiles, creator_earnings, creator_followers
- ad_auctions, ad_bids, ad_slots, ad_variants, adTargeting
- user_ad_profiles, user_behavior, user_interests
- mlFeed, feedCache, userCourseAccessTypes
- trader_verification, prop_firms, exness_accounts
- dailyPolls, pollVotes, economic_calendar
- news, news_sources, market_news
- bitacora, psychotrading_insights
- prizes_catalog, redemptions
- affiliates, affiliateReferrals, commission_tracking
- whatsapp_messages, whatsapp_templates
- push_subscriptions, push_actions
- emailNotifications, emailTemplates
- platformConfig, global_config, feature_flags
- spamReports, moderationConfig, adminFindings
- pendingOperations, pendingNotifications
- dataExports, backup_history
- gameSessions, gameStats, apps
- referrals, referralCodes
- token_balances, token_transactions, token_daily_limits
- badges, medallas, streak_rewards
- watchlists, profile_visits
- subcommunityInvites, subcommunityMembers
- communityPosts, subcommunityPosts
- communitySubscriptions, communityAccess
- signal_subscriptions, signal_plans, signal_subscribers_actions
- author_payouts, creator_payouts
- marketplaceAnalytics, product_analytics
- instagram_auto_reply_rules, instagram_content_templates
- instagram_ai_queue, instagram_analytics
- adIntelligence, adVariantOptimizer
- LangGraph agents, agent orchestration
- And 20+ more supporting tables

### 19.2 Backend Files (98 total)

**Categories:**
- **Auth:** auth.ts, authJwt.ts, authRateLimits, emailVerification, passwordResetTokens
- **Users:** profiles.ts, userPreferences.ts, userAchievements.ts, userBehavior.ts
- **Social:** posts.ts, comments.ts, feed.ts, mlFeed.ts, postMetrics.ts, postLikes.ts, savedPosts.ts
- **Communities:** communities.ts, communityMembers.ts, communityPosts.ts, communityMonetization.ts, communityPayouts.ts, communityReviews.ts, subcommunities.ts, subcommunityPosts.ts, subcommunityChat.ts
- **Payments:** payments.ts, paymentOrchestrator.ts, mercadopagoApi.ts, subscriptions.ts, subscriptionPlans.ts
- **Signals:** signals.ts, signalsLifecycle.ts, signal_performance.ts, signal_providers.ts, signal_notifications.ts
- **Marketplace:** products.ts, purchases.ts, productReviews.ts, strategies.ts, bookLibrary.ts, marketplaceAnalytics.ts
- **Education:** communityCourses.ts, classes.ts, userCourseAccess.ts, userCourseProgress.ts, communityAcademies.ts
- **Gamification:** gamification.ts, achievements.ts, competitions.ts, prizes.ts, prizeRedemptions.ts
- **Ads:** ads.ts, adAuction.ts, ad_campaigns.ts, ad_bids.ts, ad_slots.ts, ad_variants.ts, adTargeting.ts, ad_events.ts, adIntelligence.ts
- **Instagram:** 15+ files for accounts, posts, scheduler, autoReply, analytics, messages, templates
- **AI:** aiAgent.ts, aiService actions
- **Notifications:** notifications.ts, push.ts, pushSubscriptions.ts, pushActions.ts, emailNotifications.ts, whatsappNotifications.ts
- **Analytics:** analytics.ts, stats.ts, user_behavior.ts, user_interests.ts
- **Admin:** moderation.ts, moderationConfig.ts, moderationLogs.ts, spamReports.ts, adminFindings.ts
- **System:** config.ts, platformConfig.ts, emergency.ts, safeguards.ts, logger.ts, webhooks.ts, scheduler.ts, crons.ts
- **Infrastructure:** backup.ts, backupInternal.ts, auditLogs.ts, systemErrors.ts, pendingOperations.ts, dataExport.ts, files.ts
- **Trading:** bitacora.ts, prop_firms.ts, economic_calendar.ts, news.ts, news_sources.ts, market_news.ts
- **Gaming:** apps.ts, gameSessions.ts, gameStats.ts
- **Utilities:** rateLimit.ts, spamReports.ts, referrals.ts, affiliates.ts, chat.ts, qa.ts

---

## 📋 20. FEATURE SUMMARY

### 20.1 Feature Categories

| Category | Features | Status |
|----------|----------|--------|
| Authentication | 7 | ✅ Complete |
| User Profile | 6 | ✅ Complete |
| Gamification | 8 | ✅ Complete |
| Social/Posts | 12 | ✅ Complete |
| Communities | 12 | ✅ Complete |
| Payments | 10 | ✅ Complete |
| Subscriptions | 5 | ✅ Complete |
| Creator Economy | 6 | ✅ Complete |
| Signals | 9 | ✅ Complete |
| Market Data | 6 | ✅ Complete |
| Trading Tools | 5 | ✅ Complete |
| Marketplace | 6 | ✅ Complete |
| Education | 7 | ✅ Complete |
| Advertising | 8 | ✅ Complete |
| Instagram | 10 | ✅ Complete |
| AI Agents | 11 | ✅ Complete |
| Notifications | 5 | ✅ Complete |
| Gaming | 4 | ✅ Complete |
| Admin Panel | 22 | ✅ Complete |
| Moderation | 5 | ✅ Complete |
| System | 16 | ✅ Complete |
| Analytics | 7 | ✅ Complete |
| UX/Navigation | 27 | ✅ Complete |
| Hooks | 29 | ✅ Complete |
| Services | 27 | ✅ Complete |
| Views | 55 | ✅ Complete |
| Convex Backend | 98 files | ✅ Complete |
| Database Tables | 50+ | ✅ Complete |

### 20.2 Total Count

| Metric | Count |
|--------|-------|
| **Total Features** | **280+** |
| **Views** | 55 |
| **Components** | 100+ |
| **Hooks** | 29 |
| **Services** | 27 |
| **Convex Files** | 98 |
| **Database Tables** | 50+ |
| **Admin Tools** | 22 |
| **AI Agents** | 11 |
| **Payment Providers** | 3 |
| **Notification Channels** | 4 |
| **Social Features** | 24 |
| **Trading Features** | 20 |
| **Education Features** | 7 |
| **Gamification Features** | 8 |

---

## 🎯 PLATFORM CAPABILITIES

### What TradeShare Can Do:

✅ **Social Trading Network** - Full-featured social platform for traders  
✅ **Signal Marketplace** - Buy/sell trading signals with lifecycle management  
✅ **Education Platform** - Courses, academies, certifications  
✅ **Digital Marketplace** - EA, indicators, strategies, tools  
✅ **Community Building** - Public/private communities with monetization  
✅ **Content Creation** - Posts, polls, charts, AI-generated content  
✅ **Live Chat** - Real-time chat with channels  
✅ **Gamification** - XP, levels, achievements, competitions, prizes  
✅ **Advertising** - Full ad engine with targeting and auctions  
✅ **Instagram Marketing** - Complete Instagram automation suite  
✅ **AI Agents** - Multiple AI agents for content, analysis, assistance  
✅ **Multi-Provider Payments** - MercadoPago, Stripe, Zenobank  
✅ **Analytics** - Comprehensive analytics across all domains  
✅ **Admin Tools** - Complete moderation and management suite  
✅ **Notifications** - Push, email, WhatsApp, in-app  
✅ **Trading Tools** - Journal, psychotrading, prop firms, broker integration  
✅ **Market Data** - Economic calendar, news, tickers, charts  
✅ **Creator Economy** - Earnings tracking, payouts, affiliates  
✅ **Mobile-Ready** - PWA with offline support  
✅ **SEO Optimized** - Meta tags, deep linking, shareable content  

---

## 🚀 TECHNICAL HIGHLIGHTS

- **Convex Backend** - Serverless backend with real-time subscriptions
- **ML-Powered Feed** - Smart feed algorithm with user behavior modeling
- **Circuit Breakers** - Fault-tolerant external service integration
- **Rate Limiting** - Protection against abuse
- **CSP Hardening** - Security-first content policy
- **Error Resilience** - Comprehensive error boundaries and handling
- **Cache System** - Intelligent caching with invalidation
- **Scheduled Jobs** - Background processing for news, notifications, cleanup
- **Webhooks** - External integration support
- **Multi-Provider Storage** - Flexible file storage
- **Audit Logging** - Complete action tracking
- **GDPR Compliance** - Data export functionality
- **Emergency Tools** - Shutdown/maintenance capabilities
- **Visibility-Aware Polling** - Optimized polling that pauses when tab hidden
- **Request Deduplication** - Prevents duplicate API calls
- **Virtualization** - Efficient rendering of long lists
- **Lazy Loading** - Code splitting and image optimization
- **Theme System** - Dark/light mode with persistence
- **Multi-Language** - ES/EN/PT support
- **Accessibility** - Font size, reduced motion, high contrast

---

**Document End**

*This inventory represents the complete feature set of TradeShare as of 2026-03-31. All features listed are production-ready and operational.*
