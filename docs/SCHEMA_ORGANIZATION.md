# Schema Organization by Domain

This document describes the organization of the Convex database schema by functional domain.

## Overview

The schema is located in `convex/schema.ts` and contains 89 tables organized into the following domains:

---

## Domain 1: Users & Authentication

### Tables
- **profiles** - User profiles with authentication, stats, gamification
- **userAchievements** - Achievements unlocked by users
- **pushSubscriptions** - Web push notification subscriptions
- **user_preferences** - User theme, language, and notification preferences

### Indexes
- profiles: by_userId, by_usuario, by_email, by_userNumber
- userAchievements: by_user, by_user_achievement
- pushSubscriptions: by_user, by_endpoint
- user_preferences: by_user

---

## Domain 2: Content & Posts

### Tables
- **posts** - Main content posts with trading signals, charts, media
- **post_points** - Point rewards for posts
- **pendingPosts** - Scheduled/pending AI-generated posts

### Indexes
- posts: by_createdAt, by_userId, by_status, by_categoria, by_par, by_user_categoria, by_monthlyTokens
- post_points: by_postId, by_userId, by_post_user
- pendingPosts: by_status, by_programedAt

---

## Domain 3: Communities

### Tables
- **communities** - User-created trading communities
- **communityMembers** - Membership and roles in communities
- **communityPosts** - Posts within communities
- **communitySubscriptions** - Paid community subscriptions (MercadoPago)
- **communityPayouts** - Payouts to community owners
- **communityReviews** - Reviews and ratings for communities

### Indexes
- communities: by_slug, by_owner, by_status, by_status_visibility, by_currentMembers
- communityMembers: by_community, by_user, by_community_user
- communityPosts: by_community, by_user, by_community_created, by_user_created, by_status
- communitySubscriptions: by_community, by_user, by_community_user, by_status
- communityPayouts: by_community, by_owner, by_status, by_createdAt
- communityReviews: by_community, by_user_community

---

## Domain 4: Subcommunities

### Tables
- **subcommunities** - Premium subcommunities within communities
- **subcommunityMembers** - Members of subcommunities
- **subcommunitySubscriptions** - Paid subscriptions to subcommunities
- **subcommunityInvites** - Email invites to subcommunities

### Indexes
- subcommunities: by_community, by_slug, by_owner
- subcommunityMembers: by_subcommunity, by_user, by_subcommunity_user
- subcommunitySubscriptions: by_subcommunity, by_user, by_subcommunity_user
- subcommunityInvites: by_subcommunity, by_token, by_email

---

## Domain 5: Chat & Messaging

### Tables
- **chat** - Global and community chat messages
- **chatChannels** - Chat channels (global, community, subcommunity, direct)
- **chatTyping** - Typing indicators for real-time chat

### Indexes
- chat: by_createdAt, by_channel, by_user
- chatChannels: by_slug, by_type, by_community
- chatTyping: by_channel, by_channel_user

---

## Domain 6: Notifications

### Tables
- **notifications** - User notifications (mentions, likes, achievements, etc.)

### Indexes
- notifications: by_user, by_user_read, by_user_created

---

## Domain 7: Resources & Learning

### Tables
- **recursos** - Educational resources and downloads
- **videos** - Video content library
- **qa** - Q&A forum
- **bookLibrary** - User's personal library of strategies

### Indexes
- recursos: by_userId, by_createdAt
- videos: by_categoria, by_createdAt
- qa: by_respondida, by_createdAt
- bookLibrary: by_user, by_user_strategy

---

## Domain 8: Advertising System

### Tables
- **ad_slots** - Available ad placement slots
- **ad_auctions** - Real-time ad auctions
- **ad_bids** - Bids in ad auctions
- **ad_campaigns** - Advertising campaigns
- **ads** - Static ad content

### Indexes
- ad_slots: by_slotId, by_type, by_active, by_page
- ad_auctions: by_slot, by_status, by_startsAt
- ad_bids: by_auction, by_bidder, by_campaign
- ad_campaigns: by_advertiser, by_status

---

## Domain 9: Achievements & Gamification

### Tables
- **achievements** - Achievement definitions with requirements

### Indexes
- achievements: by_category, by_active

---

## Domain 10: Payments & Subscriptions

### Tables
- **payments** - Payment transactions (MercadoPago, Zenobank, Stripe)
- **subscriptions** - User subscription plans
- **stripeSubscriptions** - Stripe-specific subscription data

### Indexes
- payments: by_userId, by_externalReference, by_status
- subscriptions: by_userId, by_externalReference
- stripeSubscriptions: by_userId, by_subscriptionId, by_customerId

---

## Domain 11: Marketplace

### Tables
- **products** - Marketplace products (EAs, indicators, courses)
- **purchases** - Product purchase records
- **strategyPurchases** - Strategy purchase history
- **platformReviews** - Platform reviews
- **wishlists** - User wishlists

### Indexes
- products: by_author, by_category, by_createdAt, by_published, by_rating
- purchases: by_product, by_buyer, by_author, by_status
- strategyPurchases: by_user, by_strategy
- platformReviews: by_createdAt, by_user
- wishlists: by_user, by_product, by_user_product

---

## Domain 12: Creator Economy

### Tables
- **creator_profiles** - Creator profile data
- **creator_earnings** - Creator earnings and payouts
- **creator_followers** - Followers of creators
- **creator_activities** - Recent creator activity

### Indexes
- creator_profiles: by_user
- creatorEarnings: by_creator, by_status
- creatorFollowers: by_creator, by_user, by_creator_user
- creatorActivities: by_creator, by_createdAt

---

## Domain 13: Trading Signals

### Tables
- **signals** - Trading signals from providers
- **signal_plans** - Subscription plans for signal providers
- **signal_subscriptions** - User subscriptions to signals
- **signal_subscribers_actions** - Actions taken by signal subscribers
- **signal_providers** - Signal provider profiles
- **signal_notifications** - Signal-related notifications
- **signal_notification_prefs** - User notification preferences
- **signal_performance** - Provider performance metrics

### Indexes
- signals: by_provider, by_par, by_status, by_createdAt
- signalPlans: by_provider, by_active
- signalSubscriptions: by_user, by_signal, by_user_signal
- signalSubscribersActions: by_signal, by_user, by_createdAt
- signalProviders: by_user, by_verified
- signalNotifications: by_user, by_signal
- signalNotificationPrefs: by_user
- signalPerformance: by_provider, by_period

---

## Domain 14: Competitions

### Tables
- **competitions** - Trading competitions
- **competition_participants** - Competition entries

### Indexes
- competitions: by_status, by_type, by_dates
- competitionParticipants: by_competition, by_user, by_competition_score

---

## Domain 15: Trader Verification

### Tables
- **trader_verification** - Broker account verification

### Indexes
- traderVerification: by_user, by_level

---

## Domain 16: Instagram Integration

### Tables
- **instagram_accounts** - Connected Instagram accounts
- **instagram_scheduled_posts** - Scheduled posts
- **instagram_content_templates** - Content templates
- **instagram_auto_reply_rules** - Auto-reply rules
- **instagram_analytics** - Account analytics
- **instagram_ai_queue** - AI generation queue
- **instagram_messages** - Direct messages

### Indexes
- instagramAccounts: by_user, by_profile
- instagramScheduledPosts: by_user, by_status, by_scheduled
- instagramContentTemplates: by_user, by_category
- instagramAutoReplyRules: by_user, by_account
- instagramAnalytics: by_account, by_recorded
- instagramAiQueue: by_user, by_status
- instagramMessages: by_account, by_user, by_created

---

## Domain 17: Prop Firms

### Tables
- **prop_firms** - Prop firm partnerships

### Indexes
- propFirms: by_active

---

## Domain 18: Referrals & Affiliates

### Tables
- **referrals** - User referral records
- **referralCodes** - Referral codes
- **affiliates** - Affiliate program data
- **affiliateReferrals** - Affiliate referral tracking

### Indexes
- referrals: by_referrer, by_referred
- referralCodes: by_user, by_code
- affiliates: by_userId, by_code
- affiliateReferrals: by_affiliateId, by_referredUserId, by_status

---

## Domain 19: System & Infrastructure

### Tables
- **global_config** - Global configuration keys
- **rateLimits** - Rate limiting data
- **backups** - Data backup records
- **pendingSync** - Pending sync operations
- **aiAgentConfig** - AI agent configuration
- **spamReports** - Spam reports
- **moderationConfig** - Moderation settings
- **moderationLogs** - Moderation action logs
- **auditLogs** - System audit logs
- **systemErrors** - Error tracking
- **pendingOperations** - Pending system operations

### Indexes
- globalConfig: by_key
- rateLimits: by_key, by_user
- backups: by_item, by_user, by_createdAt
- pendingSync: by_timestamp
- aiAgentConfig: by_key
- spamReports: by_status, by_contentId, by_user, by_reporterId, by_createdAt
- moderationConfig: by_key
- moderationLogs: by_moderator, by_createdAt
- auditLogs: by_user, by_action, by_timestamp, by_user_action, by_target
- systemErrors: by_code, by_severity, by_resolved, by_createdAt
- pendingOperations: by_type, by_createdAt

---

## Domain 20: Token Economy

### Tables
- **token_balances** - User token balances
- **token_transactions** - Token transaction history
- **token_daily_limits** - Daily earning/spending limits

### Indexes
- tokenBalances: by_user
- tokenTransactions: by_user, by_type, by_createdAt
- tokenDailyLimits: by_user_date

---

## Domain 21: Static Content

### Tables
- **ads** - Static advertisement content
- **economic_calendar** - Economic calendar events (aliased to instagram_analytics)
- **market_news** - Market news (aliased to instagram_messages)

---

## Notes

- The schema uses `v.any()` sparingly for flexible JSON data (estadisticas, signalDetails, etc.)
- All tables include `_id` and `_creationTime` fields automatically
- Indexes are designed for common query patterns
- Foreign key references use `v.id("tableName")` for type safety
