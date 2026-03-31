# PROMPTs COMPLETO PARA REPLICAR TradeShare/TradeHub

> **Fecha de creación:** 25/03/2026
> **Proyecto original:** TradePortal 2025 Platinum
> **Propósito:** Documentación para replicar la aplicación completa en otro entorno

---

## 📋 PROMPTs 1: ARQUITECTURA GENERAL Y STACK TECNOLÓGICO

```
Crea una aplicación web completa de red social para traders llamada "TradeHub" (anteriormente TradePortal) usando el siguiente stack tecnológico:

**Frontend:**
- React 19 con TypeScript
- Vite como build tool
- React Router DOM 7 para navegación
- Tailwind CSS 4 para estilos (configurado con @tailwindcss/vite)
- Lazy loading de componentes
- Diseño responsive (mobile-first)

**Backend:**
- Convex como backend-como-servicio (base de datos, funciones serverless, autenticación, WebSockets)
- Express.js para el servidor principal
- WebSockets para tiempo real

**Servicios externos:**
- Stripe para pagos
- MercadoPago para pagos en Latinoamérica
- Zenobank para pagos alternativos
- SendGrid para emails
- Google Generative AI (Gemini) para IA
- Sentry para monitoreo de errores
- Capacitor para app móvil (Android/iOS)

**Otras dependencias:**
- bcrypt para encriptación
- i18next para internacionalización
- dompurify para sanitización HTML
- axios para HTTP
- ws para WebSockets

La app debe seguir arquitectura de componentes con:
- Error Boundaries para manejo de errores
- Context API para estado global (NavigationContext, ChatBadgeProvider, ToastProvider)
- Lazy loading de vistas
- Sistema de deep linking
- SEO con react-helmet-async
- Service Workers para PWA

Estructura de carpetas:
- /src/components (componentes reutilizables)
- /src/views (páginas/vistas)
- /src/services (lógica de negocio)
- /src/utils (utilidades)
- /src/types (tipos TypeScript)
- /src/context (React contexts)
- /convex (backend Convex)
```

---

## 📋 PROMPTs 2: ESQUEMA DE BASE DE DATOS (CONVEX)

```
Define el esquema completo de Convex para TradeHub con las siguientes tablas:

**USUARIOS Y AUTENTICACIÓN:**
1. profiles: id, userId, nombre, usuario, avatar, banner, esPro, esVerificado, rol, role (0-6: FREE, PRO, ELITE, CREATOR, MOD, ADMIN, SUPERADMIN), xp, level, email, password, biografia, instagram, seguidores[], siguiendo[], aportes, accuracy, reputation, badges[], estadisticas, saldo, watchlist[], watchedClasses[], Medellas[], progreso, fechaRegistro, diasActivos, ultimoLogin, status, referredBy, streakDays, isBlocked, avatarFrame, streakReward, weeklyXP, monthlyXP, userNumber, phone, whatsappOptIn

2. pushSubscriptions: userId, endpoint, keys{p256dh, auth}, createdAt, updatedAt

3. user_preferences: userId, theme(dark/light/system), accentColor, fontSize, reducedMotion, highContrast, language(es/en/pt), pushEnabled, emailEnabled, notificationPreferences{}, quietHours{}, createdAt, updatedAt

**CONTENIDO Y PUBLICACIONES:**
4. posts: id, userId, titulo, par, tipo, contenido, categoria, esAnuncio, datosGrafico[], tradingViewUrl, imagenUrl, zonaOperativa, likes[], comentarios[], tags[], reputationSnapshot, badgesSnapshot, ratings[], encuesta{}, compartidos, comentariosCerrados, isAiAgent, isSignal, signalDetails{}, sentiment, subcommunityId, createdAt, ultimaInteraccion, status, avatarFrame, puntos, tokenTipsReceived, tokenTipsCount, monthlyTokenTips, monthKey, isTopMonthly

5. post_points: postId, userId, points, givenAt

6. communityPosts: communityId, userId, titulo, contenido, imagenUrl, tipo(text/image/link/poll/signal), likes[], commentsCount, isPinned, isLocked, tags[], createdAt, updatedAt, status

7. recursos: userId, titulo, descripcion, categoria, plataforma, precio, descargas, valoracion, version, tags[], likes[], comentarios[], archivoUrl, tradingViewUrl, createdAt

8. videos: tipo(video/pdf), titulo, autor, descripcion, thumbnail, embedUrl, duracion, categoria, createdAt

**COMUNIDADES:**
9. communities: ownerId, name, slug, description, visibility(public/unlisted/private), accessType(free/paid), priceMonthly, maxMembers, currentMembers, plan(free/starter/growth/scale/enterprise), stripeAccountId, totalRevenue, status, createdAt, coverImage, isPromoted, promotionPlan, promotionEndDate

10. communityMembers: communityId, userId, role(owner/admin/moderator/member/pending), subscriptionStatus, joinedAt

11. subcommunities: parentId, ownerId, name, slug, description, type(general/support/help/group), visibility, coverImage, plan, accessType, priceMonthly, adsEnabled, adFrequency, allowedAdTypes[], tvEnabled, tvStreamUrl, tvIsLive, maxMembers, currentMembers, status, createdAt

12. subcommunityMembers: subcommunityId, userId, role, joinedAt

13. subcommunitySubscriptions: subcommunityId, userId, status, MercadoPagoSubscriptionId, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt

14. communitySubscriptions: communityId, userId, plan, status, MercadoPagoSubscriptionId, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt

15. communityPlanSettings: communityId, plan, maxSubcommunities, maxMembersPerSub, adsAllowed, canDisableAds, defaultAdFrequency, tvAllowed, tvMaxViewers, chatAllowed, analyticsEnabled, customBranding, updatedAt

16. communityReviews: communityId, userId, rating, comment, createdAt

**PRODUCTOS Y MARKETPLACE:**
17. products: authorId, authorName, authorAvatar, title, description, longDescription, category(ea/indicator/template/course/signal/vps/tool), attributes{platform, pairs[], timeframe[], riskLevel, level, duration, format[], frequency, specs}, price, currency(USD/EUR/XP), images[], demoFile, mainFile, fileName, rating, ratingCount, salesCount, views, tags[], isPublished, isFeatured, isDeleted, reviews[], mql5Id, mql5Url, createdAt, updatedAt

18. purchases: productId, authorId, buyerId, amount, currency, platformFee, authorEarnings, MercadoPagoPaymentId, MercadoPagoPreferenceId, status, downloadCount, lastDownloadAt, createdAt, completedAt

19. wishlists: userId, productId, createdAt

20. strategies: id, authorId, title, description, content, price, currency(USD/XP), category, tags[], imageUrl, fileUrl, downloads, rating, ratingCount, isPublished, createdAt, updatedAt

21. bookLibrary: userId, strategyId, title, fileUrl, coverUrl, authorName, addedAt

22. strategyPurchases: userId, strategyId, purchasedAt, amountPaid, currency

**SEÑALES DE TRADING:**
23. signals: signalId, providerId, type(forex/crypto/indices/commodities/stocks/binary/options), priority(vip/premium/standard/free), pair, pairCategory, direction(buy/sell), entryPrice, entryRangeMin, entryRangeMax, entryType(instant/limit/stop/range), stopLoss, stopLossPips, stopLossPipsPercentage, takeProfits[{level, price, percentage, reached, reachedAt}], timeframe, sentiment, analysis, reason, status(draft/scheduled/active/partially_hit/hit/canceled/expired), scheduledFor, sentAt, expiresAt, closedAt, totalSubscribersNotified, subscribersActed, subscribersWon, subscribersLost, tags[], createdAt, updatedAt

24. signal_plans: name, slug, signalsPerDay, signalsPerWeek, signalsPerMonth, signalTypes[], hasVIPSignals, hasEntryConfirmation, hasExitTiming, hasRiskAnalysis, hasTradeManagement, hasDailyReport, priceMonthly, priceYearly, currency, subscriberCount, avgRating, isActive, isFeatured, createdAt, updatedAt

25. signal_subscriptions: userId, planId, MercadoPagoSubscriptionId, status, currentPeriodStart, currentPeriodEnd, signalsReceivedToday, signalsReceivedThisWeek, signalsReceivedThisMonth, lastSignalReceivedAt, dailyLimitReachedAt, isTrial, trialEndsAt, totalSignalsReceived, winRate, createdAt, updatedAt

26. signal_providers: userId, isVerified, verificationLevel(basic/intermediate/advanced/institutional), totalSignalsSent, totalSignalsActive, avgWinRate, totalPipsGenerated, subscribersCount, avgRating, totalRatings, earningsThisMonth, totalEarnings, pendingPayout, signalsPerDayLimit, signalsPerWeekLimit, isActive, isSuspended, suspensionReason, createdAt, updatedAt

27. signal_subscribers_actions: signalId, userId, action(viewed/opened_trade/closed_profit/closed_loss/ignored), tradeOpened, entryPriceUsed, exitPriceUsed, result(profit/loss/breakeven/pending), pipsGained, percentageGained, platform, createdAt, updatedAt

28. signal_notification_prefs: userId, enabled, signalTypes[], minProviderRating, minWinRate, notifyOnNew, notifyOnResult, notifyOnUpdate, quietHoursStart, quietHoursEnd, createdAt, updatedAt

29. signal_performance: providerId, period(daily/weekly/monthly), periodStart, periodEnd, signalsSent, signalsWon, signalsLost, signalsPending, totalPipsWon, totalPipsLost, netPips, winRate, byPair, byType, createdAt

**PAGOS Y SUSCRIPCIONES:**
30. payments: userId, provider(mercadopago/zenobank/stripe), amount, currency, status, externalReference, description, metadata, createdAt, updatedAt

31. subscriptions: userId, provider, plan, status, externalReference, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt

32. stripeSubscriptions: userId, subscriptionId, customerId, priceId, plan, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt, metadata

33. communityPayouts: communityId, ownerId, amount, currency, status, MercadoPagoPaymentId, description, periodStart, periodEnd, createdAt, processedAt

34. author_payouts: authorId, amount, platformFee, netAmount, MercadoPagoPaymentId, MercadoPagoRecipientId, status, salesIncluded[], salesAmount, period, paidAt, createdAt, notes

**CREATORS:**
35. creator_profiles: userId, displayName, tagline, bio, coverImage, avatarImage, socialLinks{youtube, twitter, instagram, telegram, discord, website}, expertise[], languages[], MercadoPagoEmail, totalEarnings, totalSales, totalFollowers, totalViews, isVerified, isActive, createdAt, updatedAt

36. creator_earnings: creatorId, source(marketplace/community/tips/affiliate/other), sourceId, amount, platformFee, netAmount, status, payoutId, createdAt, updatedAt

37. creator_followers: creatorId, followerId, createdAt

38. creator_activities: creatorId, type, title, description, referenceId, referenceType, createdAt

**AFILIADOS:**
39. affiliates: userId, code, totalReferrals, totalEarnings, pendingEarnings, paidEarnings, commissionRate, isActive, createdAt, updatedAt

40. affiliateReferrals: affiliateId, affiliateUserId, referredUserId, referralCode, transactionId, transactionAmount, commissionAmount, status, createdAt

41. referrals: referrerId, referredId, referralCode, status, rewardType(xp/subscription_days/badge/cash), referrerReward, referredReward, referrerClaimed, referredClaimed, claimedAt, createdAt, completedAt

42. referralCodes: userId, code, uses, maxUses, rewardXp, rewardDays, isActive, createdAt, expiresAt

**CHAT Y MENSAJES:**
43. chat: userId, nombre, avatar, texto, imagenUrl, isAi, flagged, flaggedWords[], channelId, createdAt

44. chatChannels: name, slug, type(global/community/direct/subcommunity), communityId, participants[], createdBy, createdAt

45. chatTyping: channelId, userId, nombre, expiresAt

**NOTIFICACIONES:**
46. notifications: userId, type(mention/like/comment/follow/achievement/level_up/system/message/moderation/suspension/streak/puntos), title, body, data, read, link, avatarUrl, createdAt

47. pendingNotifications: type, phoneNumber, userId, userName, data, status, createdAt, sentAt, errorAt

**COMPETICIONES:**
48. competitions: title, slug, description, type(daily/weekly/monthly/special), status(upcoming/active/ended), startsAt, endsAt, createdAt, maxParticipants, currentParticipants, entryRequirement{}, rules[], prizes[], createdBy, isFeatured, coverImage

49. competition_participants: competitionId, userId, username, avatar, score, metrics, joinedAt, lastUpdated

**MARKET DATA:**
50. economic_calendar: eventId, source(investing/myfxbook/forexfactory), datetime, timezone, date, time, country, countryCode, currency, event, eventSlug, impact(high/medium/low), actual, forecast, previous, revised, isLive, sentiment(better/worse/neutral), createdAt, updatedAt

51. market_news: title, summary, content, source, sourceUrl, sourceLogo, category(forex/crypto/commodities/indices/stocks/general), sentiment, relatedPairs[], relatedAssets[], imageUrl, author{id, name, avatar, isVerified}, isAIGenerated, publishedAt, views, likes[], tags[], createdAt

52. news_sources: name, url, type(rss/api/webhook), feedUrl, apiKey, isActive, lastFetched, fetchInterval, priority, categories[], createdAt, updatedAt

**PUBLICIDAD:**
53. ads: titulo, descripcion, imagenUrl, videoUrl, link, sector, activo, subtitle, extra, contenido

54. ad_slots: slotId, name, type(banner/sidebar/feed/popup), size{width, height}, positions[], page, floorPrice, currency, isActive, createdAt

55. ad_auctions: auctionId, slotId, auctionType(cpc/cpm/fixed), currentBid, currency, startsAt, endsAt, maxDuration, targeting{}, status, winnerId, winnerBid, createdAt

56. ad_bids: auctionId, bidderId, campaignId, amount, bidType, createdAt

57. ad_campaigns: advertiserId, name, status, ads[{adId, title, description, imageUrl, link, ctaText}], budget, budgetType(daily/total), spent, targeting, impressions, clicks, ctr, createdAt, updatedAt

**INSTAGRAM INTEGRATION:**
58. instagram_accounts: userId, instagramId, username, accessToken, encryptedRefreshToken, tokenExpiresAt, isBusiness, isConnected, followers, permissions[], autoPostEnabled, defaultHashtags[], watermarkEnabled, watermarkPosition, aiAutoReply, aiReplyLanguage, aiReplyDelay, totalPosts, totalReplies, profilePicture, biography, website, createdAt, updatedAt

59. instagram_scheduled_posts: userId, accountId, caption, hashtags[], imageUrl, videoUrl, carouselUrls[], scheduledFor, timezone, status, aiEnhanced, aiSuggestions, instagramPostId, publishedAt, errorMessage, campaignId, repeatEnabled, repeatInterval, engagementPrediction, likes, comments, reach, createdAt, updatedAt

60. instagram_content_templates: userId, name, description, template, variables[{name, type, defaultValue}], defaultHashtags[], defaultImage, aiPrompt, useCount, lastUsedAt, createdAt, updatedAt

61. instagram_auto_reply_rules: userId, accountId, triggerType(keyword/pattern/sender/always), triggerValue, responseType(text/template/ai_generated), responseText, templateId, aiPrompt, aiModel, delayMinutes, activeHours{}, onlyNewFollowers, excludeKeywords[], triggerCount, replyCount, isActive, priority, createdAt, updatedAt

62. instagram_analytics: accountId, date, periodStart, periodEnd, followersCount, followersDelta, postsCount, storiesCount, reelsCount, totalLikes, totalComments, totalSaves, totalShares, totalReach, totalImpressions, avgLikesPerPost, avgCommentsPerPost, engagementRate, topPosts[], createdAt

63. instagram_ai_queue: userId, accountId, requestType, prompt, context, aiProvider(openai/anthropic/google/meta), aiModel, status, result, error, startedAt, completedAt, retryCount, createdAt

64. instagram_messages: accountId, messageId, senderId, senderUsername, recipientId, messageType(text/image/video/audio/story_mention/comment), text, mediaUrl, isRead, isFromBusiness, wasAutoReplied, autoReplyRuleId, aiGeneratedResponse, createdAt

**GAMIFICACIÓN:**
65. achievements: id, name, description, icon, category(trading/social/learning/special), points, requirement, rarity(common/rare/epic/legendary), isActive, createdAt

66. userAchievements: userId, achievementId, unlockedAt, notifiedAt

67. gamification: (configuración de gamificación)

**PROPFIRMS:**
68. prop_firms: name, description, logoUrl, coverUrl, affiliateLink, isActive, order, characteristics[], createdAt

**TRADER VERIFICATION:**
69. trader_verification: userId, level(none/basic/intermediate/advanced/institutional), emailVerified, phoneVerified, kycStatus(none/pending/approved/rejected), kycDocuments[{type, uploadedAt, status, rejectionReason}], brokerConnected, brokerName, brokerAccountId, tradingVerified, verifiedStats{totalTrades, winRate, avgRiskReward, sharpeRatio, maxDrawdown, verifiedAt, periodStart, periodEnd}, companyVerified, companyName, companyDocument, regulatoryLicenses[], createdAt, updatedAt

**APP GAMES:**
70. apps: appId, name, description, icon, category(game/tool/utility), visibility, status, config, createdAt

71. gameSessions: userId, appId, gameMode, status, startTime, endTime, score, xpEarned, completed

72. gameStats: appId, totalPlays, playerCount, lastPlayed

**SISTEMA:**
73. global_config: key, value

74. rateLimits: key, userId, action, count, resetAt

75. auditLogs: userId, action, details, ip, userAgent, targetId, targetType, previousValue, newValue, timestamp

76. backups: itemId, itemType, operation, previousData, newData, diff, userId, createdAt, restored

77. pendingSync: operation, itemType, itemId, data, timestamp, retries, lastError

78. pendingPosts: titulo, contenido, fuente, categoria, par, imagenUrl, sentiment, programedAt, createdAt, status

79. pendingOperations: operationType, payload, targetId, userId, status, retryCount, maxRetries, lastError, createdAt, processedAt, expiresAt

80. aiAgentConfig: key, enabled, schedules[{period, hours[], enabled}], createdAt, updatedAt

81. moderationConfig: key, type(blockedWords/whitelist/settings), value, updatedAt

82. moderationLogs: moderatorId, action, contentType, contentId, reason, previousStatus, newStatus, createdAt

83. spamReports: userId, reason, content, contentType, contentId, createdAt, status, reporterId, moderatorId, action, notes, severity, resolvedAt

84. systemErrors: errorMessage, errorStack, componentStack, userId, userEmail, userName, pageUrl, userAgent, severity, status, reviewedBy, reviewedAt, notes, createdAt

**TOKEN SYSTEM:**
85. token_balances: userId, balance, totalEarned, totalSpent, dailyLimit, updatedAt

86. token_transactions: userId, targetUserId, targetPostId, amount, type(earned/spent/bonus/refund), reason, createdAt

87. token_daily_limits: userId, date, tokensSent, updatedAt

**QA:**
88. qa: userId, pregunta, respuesta, respondida, isAnonymous, createdAt, respondidaAt
```

---

## 📋 PROMPTs 3: VISTAS Y COMPONENTES PRINCIPALES

```
Crea las siguientes vistas/pages para TradeHub en React:

**VISTAS PRINCIPALES:**
1. ComunidadView - Feed principal de la comunidad con posts, encuestas, señales
2. GraficoView - Charts de TradingView integrados
3. CursosView - Cursos educativos de trading
4. PsicotradingView - Herramientas de psicot trading (solo usuarios registrados)
5. BitacoraView - Diario de trading personal (solo usuarios registrados)
6. PerfilView - Perfil de usuario con tabs: Posts, Biblioteca, Compras, Comunidades, Configuración, Medallas
7. ConfiguracionView - Configuración de cuenta
8. AcademiaView - Academia de aprendizaje
9. LegalView - Políticas y términos
10. AdminView - Panel de administración (solo admins)
11. ExnessView - Información de broker Exness
12. PricingView - Planes de suscripción (FREE, PRO, ELITE)
13. CreatorView - Perfil de creator
14. CreatorDashboard - Dashboard para creators
15. LeaderboardView - Ranking de usuarios
16. DiscoverCommunities - Descubrir comunidades
17. MarketplaceView - Marketplace de productos
18. ReferralView - Sistema de referidos
19. PropFirmsView - Firms de prop trading
20. SignalsView - Señales de trading
21. ProductView - Vista de producto individual
22. ExpertAdvisorsView - EAs y robots de trading
23. SubcommunityView - Subcomunidades dentro de comunidades
24. CommunityDetailView - Detalle de una comunidad
25. JuegosView - Juegos integrados
26. SaboteadorInvisibleView - Juego "Saboteador Invisible"
27. MarketingView - Herramientas de marketing
28. NewsView - Noticias de mercado
29. CommunityCreatorSuite - Suite de creación de comunidades
30. AdAuctionView - Subasta de publicidad
31. CalendarioView - Calendario económico
32. InstagramMarketingView - Integración con Instagram
33. CompetitionsView - Competiciones

**COMPONENTES CLAVE:**
- Navigation - Barra de navegación principal
- AuthModal - Modal de login/register
- ProfileVisitModal - Modal para visitar perfiles
- FloatingBar - Barra flotante para acciones rápidas
- FloatingActionsMenu - Menú de acciones flotante
- LiveChatWidget - Chat en vivo
- MusicPlayer - Reproductor de música
- CommunityFeed - Feed de comunidad
- PostDetailModal - Detalle de post
- CreatePostModal - Crear post
- DailyPollWidget - Encuesta diaria
- LiveTVSection - TV en vivo
- SidebarCommunitiesSection - Sidebar de comunidades
- LeaderboardSection - Sección de ranking
- FilterButton - Botón de filtros
- PostCard - Tarjeta de post
- SignalCardMini - Tarjeta mini de señal
- ProfileHeader - Header de perfil
- ProfileTabs - Tabs de perfil
- CommunityHeader - Header de comunidad
- CommunityCard - Tarjeta de comunidad
- SubcommunityCard - Tarjeta de subcomunidad
- ProductCard - Tarjeta de producto
- StrategyCard - Tarjeta de estrategia
- Modals - Varios modales
- AuroraIdeaHub - Centro de ideas de IA
- FeedbackModal - Modal de feedback
- CoursePromoPopup - Popup de promoción de cursos
- OnboardingFlow - Flujo de onboarding
- ToastProvider - Proveedor de notificaciones toast
- ChatBadgeProvider - Badge de chat
- SEO - Meta tags
- ErrorBoundary - Manejo de errores
- GlobalErrorHandler - Manejo global de errores
- MobileInstallPrompt - Prompt de instalación móvil
- OfflineIndicator - Indicador offline
- ElectricLoader - Loader animado
- CommunityAdminPanel - Panel de admin de comunidad
- LiveSidebarWidgets - Widgets de sidebar
- VerticalAdBanner - Banner de publicidad vertical
- PartnerCard - Tarjeta de socio
- CommunitySpotlight - Spotlight de comunidad
- CreateSubcommunityModal - Modal de crear subcomunidad
- DailyPollModal - Modal de encuesta diaria
- DailyPollResults - Resultados de encuesta
- PostDetailModal - Modal de detalle de post
```

---

## 📋 PROMPTs 4: DISEÑO Y ESTILOS

```
Implementa el sistema de diseño de TradeHub con Tailwind CSS:

**PALETA DE COLORES:**
- Primary: #3b82f6 (Azul)
- Signal Green: #10b981 (Verde para señales positive)
- Signal Red: #ef4444 (Rojo para señales negative)
- Card Dark: #1a1a2e
- Background: #0f1115
- Surface: #16161e
- Border: rgba(255, 255, 255, 0.1)
- Text Primary: #ffffff
- Text Secondary: #9ca3af
- Text Muted: #6b7280
- Accent Gold: #f59e0b (para logros Elite)
- Accent Purple: #8b5cf6 (para PRO)

**COMPONENTES BASE:**
- glass: backdrop-blur-xl + border-white/10
- card: rounded-2xl + bg-card-dark
- button: rounded-xl + bg-gradient + shadow
- input: bg-white/5 + border-white/10 + rounded-xl

**EFECTOS VISUALES:**
- Ambient background con orbes animados
- Animaciones fade-in y slide-in
- Gradientes sutiles en headers
- Bordes translúcidos
- Sombras con glow (shadow-primary/20)
- Skeleton loaders

**TIPOGRAFÍA:**
- Font principal: sistema (Inter como fallback)
- Headings: font-black, uppercase, tracking-widest
- Body: font-bold para énfasis
- Material Symbols para iconos

**RESPONSIVE:**
- Mobile-first (breakpoints: sm, md, lg, xl, 2xl)
- Navegación bottom en mobile
- Sidebar collapsible en desktop
- Grid layouts adaptativos

**FUNCIONES UTILITARIAS DE TAILWIND:**
- animated components con animate-in
- selection:bg-primary para selección
- backdrop-blur para overlays
- gradient text para títulos
- hover:scale para interacciones
```

---

## 📋 PROMPTs 5: SERVICIOS Y LÓGICA DE NEGOCIO

```
Implementa los siguientes servicios en /src/services:

1. **storage.ts** - Servicio de almacenamiento local:
   - getSesion() / setSesion() - Manejo de sesión de usuario
   - captureReferralFromUrl() - Capturar referidos de URL
   - trackActiveDay() - Tracking de días activos
   - hasCompletedOnboarding() - Estado de onboarding

2. **paymentOrchestrator.ts** - Orquestador de pagos:
   - Integración con Stripe, MercadoPago, Zenobank
   - createPayment() - Crear pago
   - createSubscription() - Crear suscripción
   - processWebhook() - Procesar webhooks
   - handlePaymentSuccess/Failure

3. **chat.ts** - Servicio de chat:
   - Conexión WebSocket
   - Envío/recepción de mensajes
   - Channels por comunidad
   - Typing indicators
   - Notificaciones

4. **marketDataService.ts** - Datos de mercado:
   - Precios de cryptomonedas (Binance API)
   - Calendario económico
   - Noticias de mercado

5. **newsService.ts** - Servicio de noticias:
   - Fetch de noticias
   - Categorización
   - AI summarization

6. **imageUpload.ts** - Subida de imágenes:
   - Cloudinary integration
   - Compresión
   - Optimización

7. **emailService.ts** - Envío de emails:
   - SendGrid integration
   - Templates de email
   - Notificaciones

8. **socket.ts** - WebSocket manager:
   - Conexión a Convex realtime
   - Reconnection logic
   - Event handling

9. **aiPatternDetection.ts** - IA para detección de patrones:
   - Google Gemini integration
   - Análisis de gráficos
   - Recomendaciones

10. **supabase.ts** - Backup/supabase (legacy)
11. **postimg.ts** - Image hosting
12. **feedback.ts** - Sistema de feedback
13. **sanitize.ts** - Sanitización HTML
14. **exness.ts** - Integración Exness
15. **dbCleanup.ts** - Limpieza de base de datos
```

---

## 📋 PROMPTs 6: FUNCIONALIDADES PRINCIPALES

```
Implementa estas funcionalidades completas:

**AUTENTICACIÓN:**
- Login con email/password
- Registro con email
- OAuth (Google)
- JWT tokens
- Sesiones persistentes
- Recuperación de contraseña
- Verificación de email
- WhatsApp opt-in

**SISTEMA DE POSTS:**
- Crear posts (texto, imagen, link, encuesta, señal)
- Likes y comentarios
- Compartir posts
- Reportar spam
- Moderación de contenido
- AI-generated posts (Agente IA)
- Sistema de puntos (token tips)
- Posts destacados monthly

**COMUNIDADES:**
- Crear comunidades (planes: free/starter/growth/scale/enterprise)
- Subcomunidades dentro de comunidades
- Membresías (free/paid)
- Chat por comunidad
- TV en vivo por comunidad
- Encuestas diarias
- Leaderboards
- Reseñas
- Pagos a owners (MercadoPago)

**MARKETPLACE:**
- Productos (EA, indicadores, templates, cursos, señales, VPS, herramientas)
- Reviews y ratings
- Carrito de compras
- Wishlists
- Descargas
- Creadores (profiles, followers, earnings)
- Payouts a autores

**SEÑALES DE TRADING:**
- Planes de señales (VIP, Premium, Standard, Free)
- Suscripciones a señales
- Notificaciones (push, email, WhatsApp)
- Tracking de resultados
- Proveedores verificados
- Performance stats

**SISTEMA DE AFILIADOS:**
- Códigos de referido
- Comisiones
- Tracking de referidos
- Rewards (XP, badges, suscripción)

**COMPETICIONES:**
- Competiciones diarias/semanales/mensuales
- Métricas (accuracy, posts, engagement, profit, winrate)
- Premios (XP, meses gratis, badges, cash)
- Leaderboards

**GAMIFICACIÓN:**
- XP y niveles
- Logros/medallas
- Badges
- Streaks diarios
- Ranks (FREE, PRO, ELITE, CREATOR, MOD, ADMIN)

**CHAT EN VIVO:**
- Canales globales y por comunidad
- Mensajes en tiempo real
- Typing indicators
- AI bot responses
- Moderación

**INTEGRACIÓN INSTAGRAM:**
- Conectar cuenta Instagram
- Programar posts
- AI caption/hashtag generator
- Auto-reply con IA
- Analytics
- Plantillas de contenido

**PUBLICIDAD:**
- Slots de anuncios
- Subastas (CPC, CPM, fixed)
- Targeting
- Campañas
- Analytics

**PROP FIRMS:**
- Lista de prop firms
- Affiliate links
- Información de cada firm

**JUEGOS:**
- Apps/juegos integrados
- Game sessions
- Stats
- Ejemplo: Saboteador Invisible

**TRADER VERIFICATION:**
- Levels (none/basic/intermediate/advanced/institutional)
- KYC
- Connected brokers
- Trading stats verificados

**CALENDARIO ECONÓMICO:**
- Eventos económicos
- Impacto (high/medium/low)
- Sentimiento
- Fechas específicas

**ADMINISTRACIÓN:**
- Panel de admin
- Moderación de contenido
- Gestión de usuarios
- Configuración global
- Logs de auditoría
- Error tracking (Sentry)
```

---

## 📋 PROMPTs 7: CONFIGURACIÓN DEL PROYECTO

```
Configura el proyecto completo:

**package.json - Dependencias:**
- react, react-dom ^19.2.4
- react-router-dom 7.13.0
- convex 1.32.0
- vite 6.2.0
- tailwindcss 4.2.1
- @tailwindcss/vite 4.2.1
- typescript ~5.8.2
- axios ^1.13.6
- bcrypt ^6.0.0
- stripe ^20.4.1
- mercadopago ^2.12.0
- @sendgrid/mail ^8.1.6
- @google/genai ^1.42.0
- @sentry/react ^10.45.0
- i18next ^25.8.19
- react-i18next ^16.5.8
- dompurify ^3.3.3
- express ^5.2.1
- ws ^8.19.0
- web-push ^3.6.7

**vite.config.ts:**
- Port 3000
- Alias @ para imports
- Tailwind plugin
- Sentry plugin
- Code splitting (vendor-react, vendor-convex, vendor-utils)
- CSP headers
- Security headers

**tsconfig.json:**
- ES Modules
- JSX preserve
- Paths aliases

**.env.example:**
- CONVEX_DEPLOYMENT
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- MERCADOPAGO_ACCESS_TOKEN
- ZENOBANK_API_KEY
- SENDGRID_API_KEY
- GOOGLE_AI_API_KEY
- SENTRY_ORG
- SENTRY_PROJECT
- SENTRY_AUTH_TOKEN

**GitHub Actions (CI/CD):**
- Test workflow
- Backup workflow
- Release gate workflow

**Scripts npm:**
- dev: tsx watch server.ts
- build: vite build
- lint: tsc --noEmit
- test: vitest
- test:run: vitest run
```

---

## 📊 RESUMEN EJECUTIVO

### Tech Stack
| Capa | Tecnología |
|------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Backend | Convex (DB, Auth, Serverless, WebSockets) |
| Server | Express.js |
| Pagos | Stripe, MercadoPago, Zenobank |
| IA | Google Gemini |
| Email | SendGrid |
| Errors | Sentry |
| Mobile | Capacitor |

### Tablas de Base de Datos
- **88 tablas** en Convex cubriendo: usuarios, posts, comunidades, marketplace, señales, pagos, chat, notificaciones, competencias, publicidad, Instagram, gamificación, prop firms, verificación de traders, juegos, sistema

### Vistas/Pages
- **33 vistas principales** + **50+ componentes reutilizables**

### Funcionalidades Clave
- Autenticación completa
- Sistema de posts con IA
- Comunidades con subcomunidades
- Marketplace de productos
- Señales de trading
- Sistema de referidos
- Competiciones
- Gamificación (XP, logros, badges)
- Chat en tiempo real
- Instagram marketing
- Publicidad con subastas
- Juegos integrados
- Trader verification
- Calendario económico
- Panel de administración

---

*Documento generado para revisión del equipo - TradeHub Replicación*
