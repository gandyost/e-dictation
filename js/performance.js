/**
 * 성능 최적화 및 로딩 개선 모듈
 * 지연 로딩, 캐싱, 네트워크 최적화 등
 */

class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.imageObserver = null;
        this.connectionType = this.getConnectionType();
        this.isOnline = navigator.onLine;
        
        this.initialize();
    }

    // 초기화
    initialize() {
        this.setupLazyLoading();
        this.setupServiceWorker();
        this.optimizeFirestore();
        this.setupNetworkOptimization();
        this.implementCaching();
        this.setupPerformanceMonitoring();
        this.optimizeImages();
        this.setupOfflineSupport();
    }

    // 지연 로딩 설정
    setupLazyLoading() {
        // 이미지 지연 로딩
        this.imageObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.imageObserver.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '50px' }
        );

        // 이미지 요소 관찰
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.imageObserver.observe(img);
        });

        // 컴포넌트 지연 로딩
        this.setupComponentLazyLoading();
    }

    // 이미지 로딩
    loadImage(img) {
        const src = img.dataset.src;
        if (src) {
            img.src = src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        }
    }

    // 컴포넌트 지연 로딩
    setupComponentLazyLoading() {
        const componentObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadComponent(entry.target);
                        componentObserver.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '100px' }
        );

        document.querySelectorAll('[data-lazy-component]').forEach(element => {
            componentObserver.observe(element);
        });
    }

    // 컴포넌트 로딩
    async loadComponent(element) {
        const componentName = element.dataset.lazyComponent;
        
        try {
            element.innerHTML = '<div class="loading-spinner">로딩 중...</div>';
            
            // 동적 모듈 로딩
            const module = await import(`../components/${componentName}.js`);
            const Component = module.default;
            
            const instance = new Component(element);
            await instance.render();
            
        } catch (error) {
            console.error(`컴포넌트 로딩 실패: ${componentName}`, error);
            element.innerHTML = '<div class="error">컴포넌트를 로드할 수 없습니다.</div>';
        }
    }

    // Service Worker 설정
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker 등록 성공:', registration);
                
                // 업데이트 확인
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
                
            } catch (error) {
                console.error('Service Worker 등록 실패:', error);
            }
        }
    }

    // 업데이트 알림 표시
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span>새로운 업데이트가 있습니다.</span>
                <button onclick="location.reload()" class="btn-primary">새로고침</button>
                <button onclick="this.parentElement.parentElement.remove()" class="btn-secondary">나중에</button>
            </div>
        `;
        document.body.appendChild(notification);
    }

    // Firestore 최적화
    optimizeFirestore() {
        // 쿼리 최적화
        this.enableFirestorePersistence();
        this.setupQueryBatching();
        this.implementRealtimeOptimization();
    }    // Firestore 오프라인 지속성 활성화
    async enableFirestorePersistence() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                // 새로운 API 사용 (enablePersistence 대신)
                await firebase.firestore().enablePersistence({
                    synchronizeTabs: false // multiTab 지원은 별도로 처리
                });
                console.log('Firestore 오프라인 지속성 활성화됨');
            }
        } catch (error) {
            if (error.code === 'failed-precondition') {
                console.warn('Firestore persistence는 한 번만 활성화 가능합니다.');
            } else if (error.code === 'unimplemented') {
                console.warn('브라우저가 Firestore persistence를 지원하지 않습니다.');
            } else {
                console.warn('Firestore 지속성 활성화 실패:', error);
            }
        }
    }

    // 쿼리 배칭
    setupQueryBatching() {
        this.queryQueue = [];
        this.batchTimeout = null;

        window.addEventListener('beforeunload', () => {
            this.flushQueryBatch();
        });
    }

    // 배치된 쿼리 실행
    flushQueryBatch() {
        if (this.queryQueue.length > 0) {
            // Firebase batch 작업 실행
            const batch = firebase.firestore().batch();
            this.queryQueue.forEach(query => {
                batch.set(query.ref, query.data);
            });
            
            batch.commit().catch(error => {
                console.error('배치 쿼리 실행 실패:', error);
            });
            
            this.queryQueue = [];
        }
    }

    // 실시간 최적화
    implementRealtimeOptimization() {
        // 연결 상태에 따른 실시간 리스너 조절
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.resumeRealtimeListeners();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.pauseRealtimeListeners();
        });
    }

    // 실시간 리스너 재개
    resumeRealtimeListeners() {
        // 실시간 리스너 재활성화
        console.log('실시간 리스너 재개');
    }

    // 실시간 리스너 일시정지
    pauseRealtimeListeners() {
        // 실시간 리스너 일시정지하여 배터리 절약
        console.log('실시간 리스너 일시정지');
    }

    // 네트워크 최적화
    setupNetworkOptimization() {
        // 연결 타입 감지
        this.adaptToConnectionType();
        
        // 네트워크 변경 감지
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.connectionType = this.getConnectionType();
                this.adaptToConnectionType();
            });
        }
    }

    // 연결 타입 가져오기
    getConnectionType() {
        if ('connection' in navigator) {
            return navigator.connection.effectiveType || 'unknown';
        }
        return 'unknown';
    }

    // 연결 타입에 따른 적응
    adaptToConnectionType() {
        const lowBandwidth = ['slow-2g', '2g'].includes(this.connectionType);
        
        if (lowBandwidth) {
            // 저대역폭 모드 활성화
            this.enableLowBandwidthMode();
        } else {
            // 일반 모드
            this.enableNormalMode();
        }
    }

    // 저대역폭 모드
    enableLowBandwidthMode() {
        document.documentElement.classList.add('low-bandwidth');
        
        // 이미지 품질 저하
        document.querySelectorAll('img').forEach(img => {
            if (img.dataset.lowres) {
                img.src = img.dataset.lowres;
            }
        });
        
        // 애니메이션 비활성화
        document.documentElement.classList.add('reduce-motion');
        
        console.log('저대역폭 모드 활성화');
    }

    // 일반 모드
    enableNormalMode() {
        document.documentElement.classList.remove('low-bandwidth', 'reduce-motion');
        console.log('일반 모드 활성화');
    }

    // 캐싱 구현
    implementCaching() {
        // 메모리 캐시
        this.setupMemoryCache();
        
        // 로컬 스토리지 캐시
        this.setupLocalStorageCache();
        
        // IndexedDB 캐시 (대용량 데이터)
        this.setupIndexedDBCache();
    }

    // 메모리 캐시 설정
    setupMemoryCache() {
        this.cache = new Map();
        
        // 캐시 크기 제한 (100개 항목)
        this.maxCacheSize = 100;
        
        // LRU 캐시 구현
        this.cacheAccessOrder = [];
    }

    // 캐시에 데이터 저장
    setCache(key, data, expiry = 300000) { // 기본 5분
        if (this.cache.size >= this.maxCacheSize) {
            // 가장 오래된 항목 제거
            const oldestKey = this.cacheAccessOrder.shift();
            this.cache.delete(oldestKey);
        }
        
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiry
        });
        
        // 접근 순서 업데이트
        this.updateAccessOrder(key);
    }

    // 캐시에서 데이터 가져오기
    getCache(key) {
        const cached = this.cache.get(key);
        
        if (!cached) return null;
        
        // 만료 확인
        if (Date.now() - cached.timestamp > cached.expiry) {
            this.cache.delete(key);
            this.removeFromAccessOrder(key);
            return null;
        }
        
        // 접근 순서 업데이트
        this.updateAccessOrder(key);
        
        return cached.data;
    }

    // 접근 순서 업데이트
    updateAccessOrder(key) {
        this.removeFromAccessOrder(key);
        this.cacheAccessOrder.push(key);
    }

    // 접근 순서에서 제거
    removeFromAccessOrder(key) {
        const index = this.cacheAccessOrder.indexOf(key);
        if (index > -1) {
            this.cacheAccessOrder.splice(index, 1);
        }
    }

    // 로컬 스토리지 캐시
    setupLocalStorageCache() {
        this.localStoragePrefix = 'dictation_cache_';
    }

    // 로컬 스토리지에 저장
    setLocalStorage(key, data, expiry = 86400000) { // 기본 24시간
        try {
            const cacheData = {
                data,
                timestamp: Date.now(),
                expiry
            };
            
            localStorage.setItem(
                this.localStoragePrefix + key,
                JSON.stringify(cacheData)
            );
        } catch (error) {
            console.warn('로컬 스토리지 저장 실패:', error);
        }
    }

    // 로컬 스토리지에서 가져오기
    getLocalStorage(key) {
        try {
            const cached = localStorage.getItem(this.localStoragePrefix + key);
            
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            
            // 만료 확인
            if (Date.now() - cacheData.timestamp > cacheData.expiry) {
                localStorage.removeItem(this.localStoragePrefix + key);
                return null;
            }
            
            return cacheData.data;
        } catch (error) {
            console.warn('로컬 스토리지 읽기 실패:', error);
            return null;
        }
    }

    // IndexedDB 캐시 설정
    async setupIndexedDBCache() {
        try {
            this.db = await this.openIndexedDB();
        } catch (error) {
            console.warn('IndexedDB 초기화 실패:', error);
        }
    }

    // IndexedDB 열기
    openIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('DictationCache', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains('cache')) {
                    const store = db.createObjectStore('cache', { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp');
                }
            };
        });
    }

    // 성능 모니터링
    setupPerformanceMonitoring() {
        // 페이지 로드 성능
        window.addEventListener('load', () => {
            this.measurePageLoad();
        });

        // 사용자 상호작용 성능
        this.setupInteractionMonitoring();
        
        // 메모리 사용량 모니터링
        this.setupMemoryMonitoring();
    }

    // 페이지 로드 성능 측정
    measurePageLoad() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            
            const metrics = {
                dns: navigation.domainLookupEnd - navigation.domainLookupStart,
                connection: navigation.connectEnd - navigation.connectStart,
                request: navigation.responseStart - navigation.requestStart,
                response: navigation.responseEnd - navigation.responseStart,
                domLoading: navigation.domContentLoadedEventStart - navigation.navigationStart,
                domReady: navigation.domContentLoadedEventEnd - navigation.navigationStart,
                pageLoad: navigation.loadEventEnd - navigation.navigationStart
            };
            
            console.log('페이지 로드 성능:', metrics);
            
            // 성능 데이터 전송 (옵션)
            this.sendPerformanceData(metrics);
        }
    }

    // 상호작용 모니터링
    setupInteractionMonitoring() {
        // 클릭 응답 시간
        document.addEventListener('click', (e) => {
            const startTime = performance.now();
            
            requestAnimationFrame(() => {
                const responseTime = performance.now() - startTime;
                if (responseTime > 100) { // 100ms 이상이면 느림
                    console.warn('느린 클릭 응답:', responseTime, e.target);
                }
            });
        });
        
        // 입력 지연 측정
        document.addEventListener('input', this.debounce((e) => {
            this.measureInputLag(e);
        }, 100));
    }

    // 입력 지연 측정
    measureInputLag(event) {
        const inputTime = event.timeStamp;
        const currentTime = performance.now();
        const lag = currentTime - inputTime;
        
        if (lag > 50) { // 50ms 이상이면 지연
            console.warn('입력 지연 감지:', lag, event.target);
        }
    }

    // 메모리 모니터링
    setupMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usage = {
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit
                };
                
                // 메모리 사용률이 80% 이상이면 경고
                const usagePercent = (usage.used / usage.limit) * 100;
                if (usagePercent > 80) {
                    console.warn('높은 메모리 사용률:', usagePercent.toFixed(2) + '%');
                    this.optimizeMemoryUsage();
                }
            }, 30000); // 30초마다 확인
        }
    }

    // 메모리 사용량 최적화
    optimizeMemoryUsage() {
        // 캐시 정리
        this.clearExpiredCache();
        
        // 이벤트 리스너 정리
        this.cleanupEventListeners();
        
        // 가비지 컬렉션 힌트
        if ('gc' in window) {
            window.gc();
        }
    }

    // 만료된 캐시 정리
    clearExpiredCache() {
        const now = Date.now();
        
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > value.expiry) {
                this.cache.delete(key);
                this.removeFromAccessOrder(key);
            }
        }
    }

    // 이벤트 리스너 정리
    cleanupEventListeners() {
        // 사용하지 않는 이벤트 리스너 제거
        // 구체적인 구현은 애플리케이션에 따라 다름
    }

    // 이미지 최적화
    optimizeImages() {
        // WebP 지원 확인
        this.checkWebPSupport();
        
        // 반응형 이미지 설정
        this.setupResponsiveImages();
        
        // 이미지 압축
        this.compressImages();
    }

    // WebP 지원 확인
    checkWebPSupport() {
        const webpSupported = document.createElement('canvas')
            .toDataURL('image/webp')
            .startsWith('data:image/webp');
            
        if (webpSupported) {
            document.documentElement.classList.add('webp-supported');
        }
    }

    // 반응형 이미지 설정
    setupResponsiveImages() {
        document.querySelectorAll('img[data-responsive]').forEach(img => {
            const sizes = img.dataset.responsive.split(',');
            const srcset = sizes.map(size => {
                const width = parseInt(size);
                return `${img.src.replace(/\.(jpg|png)$/, `_${width}w.$1`)} ${width}w`;
            }).join(', ');
            
            img.srcset = srcset;
            img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw';
        });
    }

    // 이미지 압축 및 최적화
    compressImages() {
        try {
            // 모든 이미지 요소 찾기
            const images = document.querySelectorAll('img');
            
            images.forEach(img => {
                // 이미지 로드 완료 후 처리
                if (img.complete) {
                    this.optimizeImage(img);
                } else {
                    img.addEventListener('load', () => {
                        this.optimizeImage(img);
                    });
                }
            });
        } catch (error) {
            console.warn('이미지 압축 중 오류:', error);
        }
    }

    // 개별 이미지 최적화
    optimizeImage(img) {
        try {
            // 너무 큰 이미지인 경우에만 처리
            if (img.naturalWidth > 1920 || img.naturalHeight > 1080) {
                // Canvas를 사용하여 이미지 리사이징
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 최대 크기 설정
                const maxWidth = 1920;
                const maxHeight = 1080;
                
                let { width, height } = img;
                
                // 비율 유지하면서 크기 조정
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // 이미지 그리기
                ctx.drawImage(img, 0, 0, width, height);
                
                // 압축된 이미지로 교체 (WebP 지원 시 WebP로, 아니면 JPEG로)
                const format = document.documentElement.classList.contains('webp-supported') ? 'image/webp' : 'image/jpeg';
                const quality = 0.8; // 80% 품질
                
                const compressedDataUrl = canvas.toDataURL(format, quality);
                img.src = compressedDataUrl;
                
                console.log(`이미지 최적화 완료: ${img.src.substring(0, 50)}...`);
            }
        } catch (error) {
            console.warn('개별 이미지 최적화 오류:', error);
        }
    }

    // 오프라인 지원
    setupOfflineSupport() {
        // 오프라인 상태 감지
        window.addEventListener('offline', () => {
            this.showOfflineNotification();
        });

        window.addEventListener('online', () => {
            this.hideOfflineNotification();
            this.syncOfflineData();
        });        // 오프라인 데이터 저장
        this.setupOfflineStorage();
    }

    // 오프라인 데이터 저장 설정
    setupOfflineStorage() {
        try {
            // IndexedDB를 사용한 오프라인 데이터 저장
            this.offlineStorageDB = null;
            this.initOfflineDB();
            
            // 오프라인 데이터 큐
            this.offlineDataQueue = [];
            
            // 페이지 언로드 시 대기 중인 데이터 저장
            window.addEventListener('beforeunload', () => {
                this.saveQueuedOfflineData();
            });
            
        } catch (error) {
            console.warn('오프라인 저장소 설정 실패:', error);
        }
    }

    // 오프라인 DB 초기화
    async initOfflineDB() {
        try {
            const request = indexedDB.open('OfflineStorage', 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains('offlineData')) {
                    const store = db.createObjectStore('offlineData', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('timestamp', 'timestamp');
                    store.createIndex('type', 'type');
                }
            };
            
            request.onsuccess = (event) => {
                this.offlineStorageDB = event.target.result;
            };
            
            request.onerror = (error) => {
                console.error('오프라인 DB 초기화 실패:', error);
            };
            
        } catch (error) {
            console.error('IndexedDB 지원하지 않음:', error);
        }
    }

    // 오프라인 데이터 저장
    saveOfflineData(type, data) {
        if (!this.offlineStorageDB) {
            // DB가 준비되지 않았으면 큐에 추가
            this.offlineDataQueue.push({ type, data, timestamp: Date.now() });
            return;
        }

        const transaction = this.offlineStorageDB.transaction(['offlineData'], 'readwrite');
        const store = transaction.objectStore('offlineData');
        
        const item = {
            type,
            data,
            timestamp: Date.now()
        };
        
        store.add(item);
    }

    // 큐에 있는 오프라인 데이터 저장
    saveQueuedOfflineData() {
        if (this.offlineDataQueue.length > 0 && this.offlineStorageDB) {
            const transaction = this.offlineStorageDB.transaction(['offlineData'], 'readwrite');
            const store = transaction.objectStore('offlineData');
            
            this.offlineDataQueue.forEach(item => {
                store.add(item);
            });
            
            this.offlineDataQueue = [];
        }
    }

    // 오프라인 데이터 가져오기
    getOfflineData() {
        return new Promise((resolve, reject) => {
            if (!this.offlineStorageDB) {
                resolve([]);
                return;
            }

            const transaction = this.offlineStorageDB.transaction(['offlineData'], 'readonly');
            const store = transaction.objectStore('offlineData');
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result || []);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // 오프라인 데이터 삭제
    removeOfflineData(id) {
        if (!this.offlineStorageDB) return;

        const transaction = this.offlineStorageDB.transaction(['offlineData'], 'readwrite');
        const store = transaction.objectStore('offlineData');
        store.delete(id);
    }

    // 데이터 동기화
    async syncDataItem(item) {
        // 실제 서버와 동기화하는 로직 구현
        // 여기서는 예시로 fetch를 사용
        try {
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item)
            });
            
            if (!response.ok) {
                throw new Error(`동기화 실패: ${response.status}`);
            }
            
            return response.json();
        } catch (error) {
            console.error('데이터 동기화 오류:', error);
            throw error;
        }
    }

    // 오프라인 알림 표시
    showOfflineNotification() {
        const notification = document.createElement('div');
        notification.id = 'offline-notification';
        notification.className = 'offline-notification';
        notification.innerHTML = `
            <div class="offline-content">
                <i class="fas fa-wifi-slash"></i>
                <span>오프라인 상태입니다. 일부 기능이 제한될 수 있습니다.</span>
            </div>
        `;
        document.body.appendChild(notification);
    }

    // 오프라인 알림 숨기기
    hideOfflineNotification() {
        const notification = document.getElementById('offline-notification');
        if (notification) {
            notification.remove();
        }
    }

    // 오프라인 데이터 동기화
    async syncOfflineData() {
        const offlineData = this.getOfflineData();
        
        for (const item of offlineData) {
            try {
                await this.syncDataItem(item);
                this.removeOfflineData(item.id);
            } catch (error) {
                console.error('오프라인 데이터 동기화 실패:', error);
            }
        }
    }

    // 유틸리티 메서드
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    }

    // 성능 데이터 전송
    sendPerformanceData(metrics) {
        // 성능 데이터를 분석 서비스로 전송
        // 실제 구현에서는 Google Analytics, Sentry 등 사용
        console.log('성능 메트릭 전송:', metrics);
    }
}
