/**
 * 접근성 향상 및 사용성 개선 JavaScript 모듈
 * WCAG 2.1 가이드라인 준수 및 키보드 네비게이션 지원
 */

class AccessibilityManager {
    constructor() {
        this.focusableElements = null;
        this.currentFocusIndex = 0;
        this.isKeyboardNavigation = false;
        this.announcements = [];
        
        this.initialize();
    }

    // 초기화
    initialize() {
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
        this.setupSkipLinks();
        this.enhanceFormAccessibility();
        this.addMotionPreferenceSupport();
        this.setupHighContrastSupport();
    }

    // 키보드 네비게이션 설정
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            this.isKeyboardNavigation = true;
            this.handleKeyboardNavigation(e);
        });

        document.addEventListener('mousedown', () => {
            this.isKeyboardNavigation = false;
        });

        // Tab 키 네비게이션 개선
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.updateFocusableElements();
                this.highlightFocusableArea();
            }
        });
    }

    // 키보드 네비게이션 핸들러
    handleKeyboardNavigation(e) {
        switch (e.key) {
            case 'F6':
                e.preventDefault();
                this.focusNextLandmark();
                break;
            case 'Escape':
                this.handleEscape();
                break;
            case 'Enter':
            case ' ':
                if (e.target.getAttribute('role') === 'button') {
                    e.preventDefault();
                    e.target.click();
                }
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                if (e.target.getAttribute('role') === 'listbox' || 
                    e.target.closest('[role="listbox"]')) {
                    e.preventDefault();
                    this.navigateListbox(e);
                }
                break;
        }
    }

    // 포커스 가능한 요소 업데이트
    updateFocusableElements() {
        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[role="button"]:not([disabled])',
            '[role="link"]'
        ].join(', ');

        this.focusableElements = Array.from(
            document.querySelectorAll(focusableSelectors)
        ).filter(element => {
            return this.isElementVisible(element) && !this.isElementInert(element);
        });
    }

    // 요소 가시성 확인
    isElementVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
    }

    // 요소 비활성 상태 확인
    isElementInert(element) {
        return element.hasAttribute('inert') || 
               element.closest('[inert]') !== null;
    }

    // 다음 랜드마크로 포커스 이동
    focusNextLandmark() {
        const landmarks = document.querySelectorAll(
            'main, [role="main"], nav, [role="navigation"], ' +
            'header, [role="banner"], footer, [role="contentinfo"], ' +
            'section, [role="region"], aside, [role="complementary"]'
        );

        if (landmarks.length === 0) return;

        const currentIndex = Array.from(landmarks).findIndex(
            landmark => landmark.contains(document.activeElement)
        );

        const nextIndex = (currentIndex + 1) % landmarks.length;
        const nextLandmark = landmarks[nextIndex];

        this.focusElement(nextLandmark);
        this.announceToScreenReader(`${this.getLandmarkLabel(nextLandmark)}로 이동했습니다.`);
    }

    // 랜드마크 레이블 가져오기
    getLandmarkLabel(element) {
        const labelMap = {
            'main': '메인 콘텐츠',
            'nav': '네비게이션',
            'header': '헤더',
            'footer': '푸터',
            'section': '섹션',
            'aside': '사이드바'
        };

        const role = element.getAttribute('role') || element.tagName.toLowerCase();
        return labelMap[role] || '영역';
    }

    // Escape 키 핸들러
    handleEscape() {
        // 모달 닫기
        const openModal = document.querySelector('.modal[style*="flex"]');
        if (openModal) {
            const closeButton = openModal.querySelector('.modal-close, [data-dismiss="modal"]');
            if (closeButton) {
                closeButton.click();
            }
            return;
        }

        // 드롭다운 닫기
        const openDropdown = document.querySelector('.dropdown.open');
        if (openDropdown) {
            openDropdown.classList.remove('open');
            return;
        }

        // 검색 필드 초기화
        const searchInput = document.querySelector('input[type="search"]:focus');
        if (searchInput && searchInput.value) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            return;
        }
    }

    // 리스트박스 네비게이션
    navigateListbox(e) {
        const listbox = e.target.closest('[role="listbox"]');
        const options = listbox.querySelectorAll('[role="option"]');
        const currentIndex = Array.from(options).findIndex(
            option => option === document.activeElement
        );

        let nextIndex;
        if (e.key === 'ArrowDown') {
            nextIndex = Math.min(currentIndex + 1, options.length - 1);
        } else {
            nextIndex = Math.max(currentIndex - 1, 0);
        }

        this.focusElement(options[nextIndex]);
    }

    // 스크린 리더 지원 설정
    setupScreenReaderSupport() {
        // 라이브 리전 생성
        this.createLiveRegion();
        
        // 동적 콘텐츠 변경 시 알림
        this.observeContentChanges();
        
        // 폼 오류 알림
        this.enhanceFormErrorMessages();
    }

    // 라이브 리전 생성
    createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);

        const assertiveRegion = document.createElement('div');
        assertiveRegion.setAttribute('aria-live', 'assertive');
        assertiveRegion.setAttribute('aria-atomic', 'true');
        assertiveRegion.className = 'sr-only';
        assertiveRegion.id = 'assertive-live-region';
        document.body.appendChild(assertiveRegion);
    }

    // 스크린 리더에 메시지 알림
    announceToScreenReader(message, priority = 'polite') {
        const regionId = priority === 'assertive' ? 'assertive-live-region' : 'live-region';
        const liveRegion = document.getElementById(regionId);
        
        if (liveRegion) {
            liveRegion.textContent = message;
            
            // 메시지 기록
            this.announcements.push({
                message,
                timestamp: new Date(),
                priority
            });
            
            // 메시지 자동 지우기
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    // 콘텐츠 변경 감지
    observeContentChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    this.handleContentChange(mutation);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 콘텐츠 변경 핸들러
    handleContentChange(mutation) {
        // 새로운 알림 메시지
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.classList.contains('alert') || 
                    node.getAttribute('role') === 'alert') {
                    this.announceToScreenReader(
                        node.textContent, 
                        node.classList.contains('alert-error') ? 'assertive' : 'polite'
                    );
                }
            }
        });
    }

    // 포커스 관리
    setupFocusManagement() {
        // 모달 열릴 때 포커스 트랩
        document.addEventListener('modalOpen', (e) => {
            this.trapFocus(e.detail.modal);
        });

        // 포커스 표시 개선
        this.enhanceFocusIndicators();
    }

    // 포커스 트랩
    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // 첫 번째 요소에 포커스
        firstElement.focus();

        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        modal.addEventListener('keydown', handleTabKey);

        // 모달 닫힐 때 이벤트 리스너 제거
        const originalTrigger = document.activeElement;
        modal.addEventListener('modalClose', () => {
            modal.removeEventListener('keydown', handleTabKey);
            if (originalTrigger) {
                originalTrigger.focus();
            }
        });
    }

    // 포커스 표시 개선
    enhanceFocusIndicators() {
        document.addEventListener('focusin', (e) => {
            if (this.isKeyboardNavigation) {
                e.target.classList.add('keyboard-focus');
            }
        });

        document.addEventListener('focusout', (e) => {
            e.target.classList.remove('keyboard-focus');
        });
    }

    // 스킵 링크 설정
    setupSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = '메인 콘텐츠로 건너뛰기';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: white;
            padding: 8px;
            text-decoration: none;
            z-index: 1000;
            transition: top 0.3s;
        `;

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // 폼 접근성 향상
    enhanceFormAccessibility() {
        // 필수 필드 표시
        document.querySelectorAll('input[required], textarea[required], select[required]').forEach(field => {
            if (!field.getAttribute('aria-label') && !field.getAttribute('aria-labelledby')) {
                const label = document.querySelector(`label[for="${field.id}"]`);
                if (label && !label.textContent.includes('*')) {
                    label.innerHTML += ' <span aria-label="필수">*</span>';
                }
            }
        });

        // 오류 메시지 연결
        this.linkErrorMessages();

        // 실시간 검증 피드백
        this.setupLiveValidation();
    }

    // 오류 메시지 연결
    linkErrorMessages() {
        document.querySelectorAll('.error-message').forEach(errorElement => {
            const fieldId = errorElement.getAttribute('data-field');
            const field = document.getElementById(fieldId);
            
            if (field) {
                const errorId = `${fieldId}-error`;
                errorElement.id = errorId;
                field.setAttribute('aria-describedby', errorId);
                field.setAttribute('aria-invalid', 'true');
            }
        });
    }

    // 실시간 검증 설정
    setupLiveValidation() {
        document.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });

            field.addEventListener('input', () => {
                if (field.getAttribute('aria-invalid') === 'true') {
                    this.validateField(field);
                }
            });
        });
    }

    // 필드 검증
    validateField(field) {
        const isValid = field.checkValidity();
        field.setAttribute('aria-invalid', !isValid);

        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) {
            if (!isValid) {
                errorElement.textContent = field.validationMessage;
                this.announceToScreenReader(`${field.name || field.id}: ${field.validationMessage}`, 'assertive');
            } else {
                errorElement.textContent = '';
            }
        }
    }

    // 폼 오류 메시지 향상
    enhanceFormErrorMessages() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const invalidFields = form.querySelectorAll(':invalid');
            
            if (invalidFields.length > 0) {
                e.preventDefault();
                
                const firstInvalidField = invalidFields[0];
                firstInvalidField.focus();
                
                const errorCount = invalidFields.length;
                this.announceToScreenReader(
                    `폼에 ${errorCount}개의 오류가 있습니다. 첫 번째 오류 필드로 이동했습니다.`,
                    'assertive'
                );
            }
        });
    }

    // 움직임 선호도 지원
    addMotionPreferenceSupport() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.documentElement.classList.add('reduce-motion');
        }

        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.classList.add('reduce-motion');
            } else {
                document.documentElement.classList.remove('reduce-motion');
            }
        });
    }

    // 고대비 모드 지원
    setupHighContrastSupport() {
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
        
        if (prefersHighContrast.matches) {
            document.documentElement.classList.add('high-contrast');
        }

        prefersHighContrast.addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.classList.add('high-contrast');
            } else {
                document.documentElement.classList.remove('high-contrast');
            }
        });
    }

    // 요소에 포커스 설정
    focusElement(element) {
        if (element) {
            element.focus();
            
            // 스크롤 위치 조정
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    // 포커스 가능한 영역 하이라이트
    highlightFocusableArea() {
        if (!this.isKeyboardNavigation) return;

        document.querySelectorAll('.focus-highlight').forEach(el => {
            el.classList.remove('focus-highlight');
        });

        const activeElement = document.activeElement;
        if (activeElement && activeElement !== document.body) {
            activeElement.classList.add('focus-highlight');
        }
    }

    // 접근성 단축키 도움말 표시
    showAccessibilityHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'modal';
        helpModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>접근성 단축키 도움말</h3>
                    <button class="modal-close" aria-label="닫기">&times;</button>
                </div>
                <div class="modal-body">
                    <h4>키보드 단축키</h4>
                    <ul>
                        <li><kbd>Tab</kbd> / <kbd>Shift + Tab</kbd>: 다음/이전 요소로 이동</li>
                        <li><kbd>F6</kbd>: 다음 랜드마크로 이동</li>
                        <li><kbd>Escape</kbd>: 모달 닫기 또는 취소</li>
                        <li><kbd>Enter</kbd> / <kbd>Space</kbd>: 버튼 활성화</li>
                        <li><kbd>↑</kbd> / <kbd>↓</kbd>: 목록 탐색</li>
                    </ul>
                    <h4>스크린 리더 지원</h4>
                    <p>이 사이트는 NVDA, JAWS, VoiceOver와 같은 스크린 리더를 지원합니다.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="this.closest('.modal').style.display='none'">확인</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpModal);
        helpModal.style.display = 'flex';
        
        // 포커스 트랩 적용
        this.trapFocus(helpModal);
    }

    // 접근성 검사 도구
    runAccessibilityAudit() {
        const issues = [];

        // 이미지 alt 속성 검사
        document.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('alt')) {
                issues.push({
                    element: img,
                    issue: 'Image missing alt attribute',
                    severity: 'error'
                });
            }
        });

        // 폼 레이블 검사
        document.querySelectorAll('input, textarea, select').forEach(field => {
            if (!field.hasAttribute('aria-label') && 
                !field.hasAttribute('aria-labelledby') &&
                !document.querySelector(`label[for="${field.id}"]`)) {
                issues.push({
                    element: field,
                    issue: 'Form field missing label',
                    severity: 'error'
                });
            }
        });

        // 색상 대비 검사 (간단한 버전)
        this.checkColorContrast(issues);

        return issues;
    }

    // 색상 대비 검사 (기본적인 구현)
    checkColorContrast(issues) {
        // 실제 구현에서는 더 정교한 색상 대비 계산이 필요합니다
        document.querySelectorAll('*').forEach(element => {
            const style = window.getComputedStyle(element);
            const backgroundColor = style.backgroundColor;
            const color = style.color;
            
            // RGB 값이 모두 같거나 비슷한 경우 (간단한 검사)
            if (backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                backgroundColor === color) {
                issues.push({
                    element: element,
                    issue: 'Insufficient color contrast',
                    severity: 'warning'
                });
            }
        });
    }
}

// CSS 스타일 추가
const accessibilityStyles = `
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    .keyboard-focus {
        outline: 3px solid #005fcc !important;
        outline-offset: 2px !important;
    }

    .focus-highlight {
        box-shadow: 0 0 0 3px rgba(0, 95, 204, 0.5) !important;
    }

    .reduce-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }

    .high-contrast {
        filter: contrast(150%);
    }

    .high-contrast button,
    .high-contrast input,
    .high-contrast select,
    .high-contrast textarea {
        border: 2px solid #000 !important;
    }

    /* 스킵 링크 스타일 */
    .skip-link:focus {
        position: fixed !important;
        top: 6px !important;
        left: 6px !important;
        background: #000 !important;
        color: white !important;
        padding: 8px 16px !important;
        text-decoration: none !important;
        z-index: 10000 !important;
        border-radius: 4px !important;
        font-weight: bold !important;
    }

    /* 키보드 네비게이션 향상 */
    button:focus,
    input:focus,
    select:focus,
    textarea:focus,
    a:focus {
        outline: 2px solid #005fcc;
        outline-offset: 2px;
    }

    /* 비활성화된 요소 */
    [disabled],
    [aria-disabled="true"] {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* 라이브 리전 */
    [aria-live] {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    }

    /* 모바일 접근성 개선 */
    @media (max-width: 768px) {
        button, 
        [role="button"],
        a {
            min-height: 44px;
            min-width: 44px;
        }
        
        input,
        select,
        textarea {
            min-height: 44px;
            font-size: 16px; /* iOS 줌 방지 */
        }
    }
`;

// 스타일 주입
if (!document.getElementById('accessibility-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'accessibility-styles';
    styleSheet.textContent = accessibilityStyles;
    document.head.appendChild(styleSheet);
}
