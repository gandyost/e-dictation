/**
 * Service Worker for English Dictation App
 * 오프라인 지원, 캐싱, 백그라운드 동기화
 */

const CACHE_NAME = 'dictation-app-v1.0.0';
const STATIC_CACHE = 'dictation-static-v1.0.0';
const DYNAMIC_CACHE = 'dictation-dynamic-v1.0.0';
const API_CACHE = 'dictation-api-v1.0.0';

// 캐시할 정적 리소스 (외부 CDN 제외)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/teacher.css',
    '/css/student.css',
    '/js/firebase-config.js',
    '/js/auth.js',
    '/js/test-code.js',
    '/js/teacher.js',
    '/js/student.js',
    '/js/speech.js',
    '/js/scoring.js',
    '/js/export.js',
    '/js/accessibility.js',
    '/js/performance.js',
    '/teacher/dashboard.html',
    '/teacher/create-test.html',
    '/teacher/edit-test.html',
    '/teacher/monitor.html',
    '/student/join.html',
    '/student/dictation.html',
    '/student/result.html',
    '/icons/icon-72.png',
    '/icons/icon-96.png',
    '/icons/icon-128.png',
    '/icons/icon-144.png',
    '/icons/icon-152.png',
    '/icons/icon-192.png',
    '/icons/icon-384.png',
    '/icons/icon-512.png',
    '/favicon.svg',
    '/manifest.json'
];

// API 엔드포인트 패턴
const API_PATTERNS = [
    /firestore\.googleapis\.com/,
    /identitytoolkit\.googleapis\.com/,
    /securetoken\.googleapis\.com/
];

// 설치 이벤트
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            }),
            caches.open(DYNAMIC_CACHE),
            caches.open(API_CACHE)
        ])
    );
    
    // 즉시 활성화
    self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        Promise.all([
            // 오래된 캐시 정리
            cleanupOldCaches(),
            // 모든 클라이언트 제어
            self.clients.claim()
        ])
    );
});

// 오래된 캐시 정리
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
    
    return Promise.all(
        cacheNames
            .filter(cacheName => !currentCaches.includes(cacheName))
            .map(cacheName => {
                console.log('Deleting old cache:', cacheName);
                return caches.delete(cacheName);
            })
    );
}

// 페치 이벤트
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // POST 요청은 캐시하지 않음
    if (request.method !== 'GET') {
        return;
    }
    
    // Chrome extension 요청 무시
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // 외부 CDN 요청은 CORS 문제로 인해 직접 전달
    if (isExternalCDN(url)) {
        event.respondWith(fetch(request));
        return;
    }
    
    event.respondWith(handleFetch(request));
});

// 외부 CDN 확인
function isExternalCDN(url) {
    const cdnDomains = [
        'cdn.tailwindcss.com',
        'cdnjs.cloudflare.com',
        'cdn.jsdelivr.net',
        'fonts.googleapis.com',
        'fonts.gstatic.com'
    ];
    
    return cdnDomains.some(domain => url.hostname.includes(domain));
}

// 페치 핸들러
async function handleFetch(request) {
    const url = new URL(request.url);
    
    // 정적 리소스 처리
    if (isStaticAsset(request)) {
        return handleStaticAsset(request);
    }
    
    // API 요청 처리
    if (isApiRequest(request)) {
        return handleApiRequest(request);
    }
    
    // HTML 페이지 처리
    if (request.headers.get('accept').includes('text/html')) {
        return handleHtmlRequest(request);
    }
    
    // 기타 리소스
    return handleDynamicResource(request);
}

// 정적 리소스 확인
function isStaticAsset(request) {
    const url = new URL(request.url);
    return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/);
}

// API 요청 확인
function isApiRequest(request) {
    const url = new URL(request.url);
    return API_PATTERNS.some(pattern => pattern.test(url.hostname));
}

// 정적 리소스 처리 (Cache First)
async function handleStaticAsset(request) {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('Static asset fetch failed:', error);
        
        // 캐시에서 다시 시도
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 오프라인 폴백
        if (request.url.includes('.css')) {
            return new Response('/* Offline fallback CSS */', {
                headers: { 'Content-Type': 'text/css' }
            });
        }
        
        if (request.url.includes('.js')) {
            return new Response('console.log("Offline fallback JS");', {
                headers: { 'Content-Type': 'application/javascript' }
            });
        }
        
        if (request.url.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)) {
            // 기본 이미지 폴백 (1x1 투명 픽셀)
            return new Response(
                new Uint8Array([
                    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
                    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
                    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
                    0x08, 0x04, 0x00, 0x00, 0x00, 0xB5, 0x1C, 0x0C,
                    0x02, 0x00, 0x00, 0x00, 0x0B, 0x49, 0x44, 0x41,
                    0x54, 0x08, 0x99, 0x01, 0x00, 0x00, 0x00, 0x00,
                    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                    0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
                ]),
                { headers: { 'Content-Type': 'image/png' } }
            );
        }
        
        throw error;
        
        if (request.url.includes('.js')) {
            return new Response('// Offline fallback JS', {
                headers: { 'Content-Type': 'application/javascript' }
            });
        }
        
        throw error;
    }
}

// API 요청 처리 (Network First)
async function handleApiRequest(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // 성공적인 API 응답 캐시 (GET 요청만)
            if (request.method === 'GET') {
                const cache = await caches.open(API_CACHE);
                cache.put(request, networkResponse.clone());
            }
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        
        // 네트워크 실패 시 캐시에서 반환
        const cache = await caches.open(API_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            // 캐시된 데이터임을 표시
            const response = cachedResponse.clone();
            response.headers.set('X-Cached', 'true');
            return response;
        }
        
        // 오프라인 API 응답
        return new Response(JSON.stringify({
            error: 'offline',
            message: '오프라인 상태입니다. 네트워크 연결을 확인해주세요.'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// HTML 페이지 처리 (Network First with Cache Fallback)
async function handleHtmlRequest(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('Network failed for HTML, trying cache:', error);
        
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 오프라인 페이지 폴백
        return createOfflinePage();
    }
}

// 동적 리소스 처리
async function handleDynamicResource(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            
            // 캐시 크기 제한 (100개 항목)
            await limitCacheSize(cache, 100);
            
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// 캐시 크기 제한
async function limitCacheSize(cache, maxSize) {
    const keys = await cache.keys();
    
    if (keys.length >= maxSize) {
        // 가장 오래된 항목 삭제
        const oldestKeys = keys.slice(0, keys.length - maxSize + 1);
        await Promise.all(oldestKeys.map(key => cache.delete(key)));
    }
}

// 오프라인 페이지 생성
function createOfflinePage() {
    const offlineHtml = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>오프라인 - 영어 받아쓰기</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                .offline-container {
                    text-align: center;
                    padding: 2rem;
                    max-width: 500px;
                }
                .offline-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    opacity: 0.8;
                }
                h1 {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                    font-weight: 600;
                }
                p {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                    opacity: 0.9;
                }
                .retry-button {
                    background: rgba(255, 255, 255, 0.2);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 0.75rem 2rem;
                    border-radius: 50px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }
                .retry-button:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                }
                .features {
                    margin-top: 2rem;
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                }
                .features h3 {
                    margin-bottom: 1rem;
                    font-size: 1.2rem;
                }
                .features ul {
                    list-style: none;
                    padding: 0;
                    text-align: left;
                }
                .features li {
                    padding: 0.5rem 0;
                    opacity: 0.8;
                }
                .features li:before {
                    content: "✓ ";
                    margin-right: 0.5rem;
                    color: #4ade80;
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <div class="offline-icon">📡</div>
                <h1>오프라인 상태</h1>
                <p>
                    인터넷 연결이 없습니다.<br>
                    네트워크 연결을 확인하고 다시 시도해주세요.
                </p>
                
                <button class="retry-button" onclick="window.location.reload()">
                    다시 시도
                </button>
                
                <div class="features">
                    <h3>오프라인에서도 가능한 기능</h3>
                    <ul>
                        <li>이전에 캐시된 테스트 데이터 확인</li>
                        <li>오프라인 모드에서 테스트 연습</li>
                        <li>저장된 결과 조회</li>
                        <li>앱 설정 변경</li>
                    </ul>
                </div>
            </div>
            
            <script>
                // 온라인 상태 복구 감지
                window.addEventListener('online', () => {
                    window.location.reload();
                });
                
                // 주기적으로 연결 확인
                setInterval(() => {
                    if (navigator.onLine) {
                        fetch('/', { method: 'HEAD', mode: 'no-cors' })
                            .then(() => window.location.reload())
                            .catch(() => {});
                    }
                }, 5000);
            </script>
        </body>
        </html>
    `;
    
    return new Response(offlineHtml, {
        headers: { 'Content-Type': 'text/html' }
    });
}

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'sync-test-results') {
        event.waitUntil(syncTestResults());
    } else if (event.tag === 'sync-offline-data') {
        event.waitUntil(syncOfflineData());
    }
});

// 테스트 결과 동기화
async function syncTestResults() {
    try {
        console.log('Syncing test results...');
        
        // IndexedDB에서 오프라인 데이터 가져오기
        const offlineData = await getOfflineTestResults();
        
        for (const result of offlineData) {
            try {
                await uploadTestResult(result);
                await removeOfflineTestResult(result.id);
                console.log('Test result synced:', result.id);
            } catch (error) {
                console.error('Failed to sync test result:', result.id, error);
            }
        }
        
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// 오프라인 데이터 동기화
async function syncOfflineData() {
    try {
        console.log('Syncing offline data...');
        
        // 구현: 오프라인에서 수집된 모든 데이터 동기화
        
    } catch (error) {
        console.error('Offline data sync failed:', error);
    }
}

// 푸시 알림
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        image: data.image,
        tag: data.tag || 'general',
        data: data.data,
        actions: data.actions || [],
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        vibrate: data.vibrate || [200, 100, 200]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const action = event.action;
    const data = event.notification.data;
    
    event.waitUntil(
        handleNotificationClick(action, data)
    );
});

// 알림 클릭 핸들러
async function handleNotificationClick(action, data) {
    const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    });
    
    let targetUrl = '/';
    
    if (action === 'view-test') {
        targetUrl = `/teacher/monitor.html?testCode=${data.testCode}`;
    } else if (action === 'join-test') {
        targetUrl = `/student/join.html?testCode=${data.testCode}`;
    } else if (data && data.url) {
        targetUrl = data.url;
    }
    
    // 기존 창이 있으면 포커스, 없으면 새 창 열기
    const existingClient = clients.find(client => 
        client.url.includes(targetUrl.split('?')[0])
    );
    
    if (existingClient) {
        await existingClient.focus();
        if (targetUrl !== '/') {
            existingClient.navigate(targetUrl);
        }
    } else {
        await self.clients.openWindow(targetUrl);
    }
}

// 메시지 처리
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_URLS':
            event.waitUntil(cacheUrls(payload.urls));
            break;
            
        case 'CLEAR_CACHE':
            event.waitUntil(clearCache(payload.cacheName));
            break;
            
        case 'GET_CACHE_SIZE':
            event.waitUntil(getCacheSize().then(size => {
                event.ports[0].postMessage({ size });
            }));
            break;
    }
});

// URL 캐시
async function cacheUrls(urls) {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.addAll(urls);
}

// 캐시 정리
async function clearCache(cacheName) {
    if (cacheName) {
        await caches.delete(cacheName);
    } else {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
}

// 캐시 크기 계산
async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const key of keys) {
            const response = await cache.match(key);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }
    
    return totalSize;
}

// IndexedDB 유틸리티 함수들
async function getOfflineTestResults() {
    // 구현: IndexedDB에서 오프라인 테스트 결과 가져오기
    return [];
}

async function uploadTestResult(result) {
    // 구현: 테스트 결과를 서버에 업로드
}

async function removeOfflineTestResult(id) {
    // 구현: IndexedDB에서 동기화된 결과 제거
}

// 버전 정보
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME,
            caches: [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE]
        });
    }
});

console.log('Service Worker loaded:', CACHE_NAME);
