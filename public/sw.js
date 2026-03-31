const CACHE_NAME = 'tradehub-v7';
const STATIC_CACHE = 'tradehub-static-v7';
const DYNAMIC_CACHE = 'tradehub-dynamic-v7';
const IMAGE_CACHE = 'tradehub-images-v7';

const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json'
];

const MAX_DYNAMIC_ITEMS = 100;
const MAX_IMAGE_ITEMS = 50;

const NOTIFICATION_CLICK_ENDPOINT = '/api/notification-click';

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
            .then(() => {
                if ('periodicSync' in self.registration) {
                    return self.registration.periodicSync.register('check-updates', {
                        minInterval: 60 * 60 * 1000,
                        minImmediateInterval: 15 * 60 * 1000
                    });
                }
            })
            .catch(err => console.log('[SW] Periodic sync registration skipped:', err))
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then((keys) => {
                return Promise.all(
                    keys
                        .filter((key) => 
                            key !== CACHE_NAME && 
                            key !== STATIC_CACHE && 
                            key !== DYNAMIC_CACHE && 
                            key !== IMAGE_CACHE
                        )
                        .map((key) => caches.delete(key))
                );
            })
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    if (e.request.method !== 'GET') return;

    if (url.origin.includes('convex.cloud') || 
        url.origin.includes('supabase.co') || 
        url.pathname.includes('/api/') ||
        url.pathname.includes('/auth/')) {
        return;
    }

    if (isStaticAsset(url)) {
        e.respondWith(cacheFirst(e.request, STATIC_CACHE));
        return;
    }

    if (isImage(e.request)) {
        e.respondWith(cacheFirst(e.request, IMAGE_CACHE, MAX_IMAGE_ITEMS));
        return;
    }

    if (url.href.includes('api.dicebear.com') || 
        url.href.includes('picsum.photos') ||
        url.href.includes('unsplash.com')) {
        e.respondWith(cacheFirst(e.request, IMAGE_CACHE, MAX_IMAGE_ITEMS));
        return;
    }

    if (url.href.startsWith('https://fonts.googleapis.com') || 
        url.href.startsWith('https://fonts.gstatic.com')) {
        e.respondWith(cacheFirst(e.request, STATIC_CACHE));
        return;
    }

    if (url.origin === location.origin && e.request.mode === 'navigate') {
        e.respondWith(networkFirst(e.request));
        return;
    }

    e.respondWith(networkFirst(e.request));
});

function isStaticAsset(url) {
    return url.pathname.match(/\.(js|css|woff2?|ttf|eot|svg|ico|png|jpg|jpeg|gif|webp|avif)$/);
}

function isImage(request) {
    return request.destination === 'image';
}

async function cacheFirst(request, cacheName, maxItems) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            
            if (maxItems) {
                const keys = await cache.keys();
                if (keys.length >= maxItems) {
                    await cache.delete(keys[0]);
                }
            }
            
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Cache first failed:', error);
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            
            const keys = await cache.keys();
            if (keys.length > MAX_DYNAMIC_ITEMS) {
                cache.delete(keys[0]);
            }
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        if (request.mode === 'navigate') {
            return caches.match('/');
        }
        
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

self.addEventListener('push', (e) => {
    if (!e.data) return;

    let data;
    try {
        data = e.data.json();
    } catch {
        data = {
            title: 'TradeHub',
            body: e.data.text(),
            url: '/'
        };
    }

    const options = {
        body: data.body || '',
        icon: data.icon || '/icons/icon-192.png',
        badge: data.badge || '/icons/badge-72.png',
        tag: data.tag || 'tradehub-notification',
        data: {
            url: data.url || '/',
            date: Date.now(),
            notificationId: data.notificationId,
            type: data.type
        },
        vibrate: [100, 50, 100],
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        renotify: true,
        actions: [
            {
                action: 'open',
                title: 'Ver'
            },
            {
                action: 'mark_read',
                title: 'Marcar leído'
            },
            {
                action: 'dismiss',
                title: 'Cerrar'
            }
        ]
    };

    e.waitUntil(
        self.registration.showNotification(data.title || 'TradeHub', options)
    );
});

self.addEventListener('notificationclick', (e) => {
    e.notification.close();

    if (e.action === 'dismiss') return;

    const urlToOpen = e.notification.data?.url || '/';

    e.waitUntil(
        (async () => {
            if (e.action === 'mark_read' && e.notification.data?.notificationId) {
                try {
                    await fetch(NOTIFICATION_CLICK_ENDPOINT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            notificationId: e.notification.data.notificationId,
                            action: 'mark_read',
                            timestamp: Date.now()
                        })
                    });
                } catch (err) {
                    console.error('Failed to mark notification as read:', err);
                }
            }

            if (e.notification.data?.notificationId && e.action !== 'mark_read') {
                try {
                    await fetch(NOTIFICATION_CLICK_ENDPOINT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            notificationId: e.notification.data.notificationId,
                            action: e.action || 'click',
                            timestamp: Date.now()
                        })
                    });
                } catch (err) {
                    console.error('Failed to track notification click:', err);
                }
            }

            const clientList = await clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            });

            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    await client.focus();
                    if (client.navigate) {
                        await client.navigate(urlToOpen);
                    }
                    return;
                }
            }

            if (clients.openWindow) {
                await clients.openWindow(urlToOpen);
            }
        })()
    );
});

self.addEventListener('notificationclose', (e) => {
    console.log('[SW] Notification closed:', e.notification.tag);
    
    if (e.notification.data?.notificationId) {
        fetch(NOTIFICATION_CLICK_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                notificationId: e.notification.data.notificationId,
                action: 'dismiss',
                timestamp: Date.now()
            })
        }).catch(err => console.error('Failed to track notification dismiss:', err));
    }
});

self.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (e.data && e.data.type === 'GET_SUBSCRIPTION') {
        e.waitUntil(
            self.registration.pushManager.getSubscription()
                .then(sub => {
                    e.source.postMessage({
                        type: 'SUBSCRIPTION',
                        subscription: sub
                    });
                })
                .catch(err => {
                    e.source.postMessage({
                        type: 'SUBSCRIPTION_ERROR',
                        error: err.message
                    });
                })
        );
    }
    
    if (e.data && e.data.type === 'SET_BADGE') {
        const badgeCount = e.data.count || 0;
        if (navigator.setAppBadge) {
            navigator.setAppBadge(badgeCount);
        }
    }

    if (e.data && e.data.type === 'GET_VERSION') {
        e.source.postMessage({ 
            type: 'VERSION',
            version: CACHE_NAME 
        });
    }
    
    if (e.data && e.data.type === 'CLEAR_CACHE') {
        e.waitUntil(
            caches.keys()
                .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
                .then(() => {
                    e.source.postMessage({ success: true });
                })
        );
    }

    if (e.data && e.data.type === 'CACHE_URLS') {
        e.waitUntil(
            caches.open(DYNAMIC_CACHE)
                .then((cache) => cache.addAll(e.data.urls))
                .then(() => {
                    e.source.postMessage({ success: true });
                })
        );
    }
});

self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    console.log('[SW] Background sync triggered');
    
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        
        const urlsToSync = [
            '/api/notifications/unread',
            '/api/user/preferences',
        ];
        
        const results = await Promise.allSettled(
            urlsToSync.map(url => fetch(url, { 
                credentials: 'include',
                headers: { 'Cache-Control': 'no-cache' }
            }))
        );
        
        let syncedCount = 0;
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value.ok) {
                const data = await result.value.json();
                const cachedUrl = result.value.url;
                await cache.put(cachedUrl, new Response(JSON.stringify(data), {
                    headers: { 'Content-Type': 'application/json' }
                }));
                syncedCount++;
            }
        }
        
        console.log(`[SW] Sync completed: ${syncedCount}/${urlsToSync.length} items`);
        return { success: true, synced: syncedCount };
    } catch (error) {
        console.error('[SW] Sync failed:', error);
        return { success: false, error: error.message };
    }
}

self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-updates') {
        event.waitUntil(checkForUpdates());
    }
});

async function checkForUpdates() {
    console.log('[SW] Checking for app updates');
    
    try {
        const staticCache = await caches.open(STATIC_CACHE);
        
        const assets = [
            '/',
            '/manifest.json',
            '/index.html'
        ];
        
        for (const asset of assets) {
            try {
                const response = await fetch(asset, { cache: 'reload' });
                if (response.ok) {
                    await staticCache.put(asset, response);
                }
            } catch (err) {
                console.log(`[SW] Failed to update asset: ${asset}`, err);
            }
        }
        
        const keys = await staticCache.keys();
        console.log(`[SW] Static cache updated with ${keys.length} items`);
        
        if (self.registration.sync) {
            await self.registration.sync.register('sync-data');
            console.log('[SW] Registered background sync');
        }
        
        return { success: true };
    } catch (error) {
        console.error('[SW] Update check failed:', error);
        return { success: false, error: error.message };
    }
}

console.log('[SW] TradeHub Service Worker loaded - v7');
