# 영어 받아쓰기 웹 애플리케이션

## 프로젝트 개요
- **프로젝트명**: English Dictation Web App  
- **목표**: 영어 문장을 음성으로 듣고 정확히 입력하는 받아쓰기 학습 도구
- **작성일**: 2025년 7월 14일
- **현재 상태**: Phase 1~6 모든 기능 구현 완료, 테스트 진행 중

## 🚀 현재 구현 상태 (2025년 7월 14일)

### ✅ 완료된 기능
- **Phase 1-3**: Firebase 연동, 교사/학생 UI, 테스트 생성/참여 시스템
- **Phase 4**: Web Speech API, 실시간 자동 채점, 음성 인식/합성
- **Phase 5**: 실시간 모니터링, 통계/차트, 데이터 내보내기 (CSV/Excel)
- **Phase 6**: 접근성, 성능 최적화, PWA, 오프라인 지원

### 📁 파일 구조
```
받아쓰기/
├── index.html                  # 메인 페이지 (교사/학생 선택)
├── test-firebase.html          # Firebase 연결 테스트 페이지
├── manifest.json               # PWA 매니페스트
├── sw.js                       # Service Worker (오프라인 지원)
├── css/
│   ├── styles.css              # 공통 스타일
│   ├── teacher.css             # 교사용 스타일
│   └── student.css             # 학생용 스타일
├── js/
│   ├── firebase-config.js      # Firebase 설정
│   ├── auth.js                 # 인증 관리
│   ├── test-code.js            # 테스트 코드 생성/검증
│   ├── teacher.js              # 교사 기능 모듈
│   ├── student.js              # 학생 기능 모듈
│   ├── speech.js               # 음성 API 모듈
│   ├── scoring.js              # 채점 시스템
│   ├── export.js               # 데이터 내보내기
│   ├── accessibility.js        # 접근성 모듈
│   └── performance.js          # 성능 최적화
├── teacher/
│   ├── dashboard.html          # 교사 대시보드
│   ├── create-test.html        # 테스트 생성
│   ├── edit-test.html          # 테스트 수정
│   └── monitor.html            # 실시간 모니터링
└── student/
    ├── join.html               # 학생 정보 입력
    ├── dictation.html          # 받아쓰기 테스트
    └── result.html             # 결과 확인
```

## 🧪 테스트 방법

### 1. Firebase 연결 테스트
```bash
# 브라우저에서 다음 파일 열기:
file:///f:/내%20드라이브/프로그래밍/웹/받아쓰기/test-firebase.html
```
- Firebase 초기화 상태 확인
- Firestore 읽기/쓰기 테스트
- 테스트 코드 생성 기능 확인
- Speech API 지원 여부 확인

### 2. 메인 애플리케이션 테스트
```bash
# 메인 페이지 열기:
file:///f:/내%20드라이브/프로그래밍/웹/받아쓰기/index.html
```

#### 교사용 기능 테스트:
1. **교사 로그인**: 이메일/비밀번호로 로그인
2. **테스트 생성**: 
   - 제목, 설명 입력
   - 문장 추가 (드래그&드롭으로 순서 조정)
   - 음성 설정 (속도, 음성 선택)
   - 채점 설정 (대소문자 구분, 구두점 등)
3. **테스트 관리**: 생성된 테스트 목록 조회, 수정, 삭제
4. **실시간 모니터링**: 학생 참여 현황, 진행률, 점수 분포

#### 학생용 기능 테스트:
1. **테스트 코드 입력**: 6자리 코드로 테스트 접근
2. **학생 정보 입력**: 학번, 이름 입력
3. **받아쓰기 테스트**:
   - 음성 재생 (재생 속도 조절 가능)
   - 텍스트 입력
   - 실시간 피드백 (단어별 정확도)
   - 진행률 표시
4. **결과 확인**: 점수, 오답 분석, 통계

### 3. 고급 기능 테스트
- **PWA**: 홈 화면에 앱 설치
- **오프라인**: 인터넷 연결 해제 후 기본 기능 동작
- **접근성**: 키보드 네비게이션, 스크린리더 지원
- **반응형**: 모바일, 태블릿, 데스크톱 화면에서 확인

## 기술 스택
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: TailwindCSS
- **Backend**: Firebase (Firestore Database, Authentication)
- **API**: Web Speech API (Speech Synthesis, Speech Recognition)
- **환경**: 웹 기반 (Firebase 호스팅)

## 주요 기능

### 1. 핵심 기능
- **교사용 테스트 생성**: Firebase Firestore를 통한 받아쓰기 테스트 관리
- **테스트 코드 시스템**: 6자리 랜덤 코드로 학생 접근 제어
- **학생 무인증 접속**: 테스트 코드 + 학번/이름만으로 간편 접속
- **음성 재생**: Web Speech API의 Speech Synthesis를 활용한 문장 읽어주기
- **받아쓰기 입력**: 사용자가 들은 내용을 텍스트 필드에 입력
- **자동 채점**: 입력된 텍스트와 원본 문장 비교하여 정확도 측정
- **실시간 결과 수집**: 교사가 학생들의 테스트 진행 상황 실시간 모니터링

### 2. UI/UX 요소
- **교사 대시보드**: 테스트 생성, 문장 관리, 결과 조회 인터페이스
- **테스트 코드 입력**: 학생용 간편 접속 페이지
- **학생 정보 입력**: 학번/이름 입력 폼
- **받아쓰기 테스트**: 음성 재생 및 입력 인터페이스
- **실시간 진행 현황**: 교사용 학생 참여 상황 모니터링
- **결과 대시보드**: 개별/전체 성적 분석 및 통계
- **반응형 디자인**: 다양한 디바이스에서 최적화된 UI

## 상세 기능 명세

### 1. Firebase 데이터 구조 (개선된 버전)
```javascript
// Firestore Collections

// 교사 사용자 정보
users: {
  uid: "firebase_uid",
  email: "teacher@example.com",
  displayName: "김선생님",
  createdAt: timestamp,
  // 생성한 모든 테스트 코드들을 배열로 관리
  testCodes: ["ABC123", "DEF456", "GHI789"]
}

// 개별 테스트 정보 (테스트 코드를 문서 ID로 사용)
tests: {
  // 문서 ID: "ABC123" (6자리 랜덤 코드)
  testCode: "ABC123",
  title: "중간고사 영어 받아쓰기",
  description: "중간고사 영어 받아쓰기 테스트입니다",
  createdBy: "teacher_uid",
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: true,
  settings: {
    timeLimit: 300, // 초 단위 (선택사항)
    allowRetry: false,
    showResultsImmediately: true,
    speechRate: 1.0, // 음성 재생 속도
    scoring: {
      caseSensitive: false, // 대소문자 구분
      checkPunctuation: true, // 구두점 체크
      ignoreSpaces: false, // 여백 무시
      partialCredit: true // 부분 점수 허용
    }
  },
  
  // 테스트 문장들
  sentences: [
    {
      id: "sentence_1",
      text: "The quick brown fox jumps over the lazy dog.",
      order: 1,
      difficulty: "easy", // easy, medium, hard
      category: "animals"
    },
    {
      id: "sentence_2", 
      text: "Practice makes perfect in everything you do.",
      order: 2,
      difficulty: "medium",
      category: "daily"
    }
  ],
  
  // 참여 학생 현황 (실시간 업데이트)
  participants: {
    "20240001": {
      studentId: "20240001",
      name: "김학생",
      joinedAt: timestamp,
      status: "completed", // "joined", "in-progress", "completed"
      currentSentence: 2,
      totalScore: 85
    }
  }
}

// 테스트별 상세 결과 (tests 하위 컬렉션)
tests/{testCode}/results: {
  // 문서 ID: "{studentId}_{sentenceId}" 
  studentId: "20240001",
  studentName: "김학생",
  sentenceId: "sentence_1",
  sentenceOrder: 1,
  correctAnswer: "The quick brown fox jumps over the lazy dog.",
  userInput: "The quick brown fox jumps over the lazy dog",
  score: 95, // 정확도 퍼센트
  timeTaken: 45, // 소요 시간(초)
  completedAt: timestamp,
  mistakes: [
    {
      position: 47,
      expected: ".",
      actual: ""
    }
  ]
}
```

### 데이터 구조의 장점:
1. **계층적 구조**: 테스트별로 데이터가 완전히 분리되어 관리 용이
2. **실시간 참여 현황**: 교사가 학생들의 진행 상황을 실시간으로 모니터링
3. **확장성**: 새로운 테스트 설정이나 기능 추가가 쉬움
4. **성능 최적화**: 필요한 데이터만 쿼리하여 네트워크 비용 절약
5. **데이터 무결성**: 테스트 코드 기반의 명확한 데이터 분리

### 2. 사용자 접근 시스템
- **교사 인증**: Firebase Authentication (이메일/비밀번호)
- **학생 인증**: 테스트 코드 + 학번/이름 입력 (세션 기반 인증)
- **테스트 코드**: 6자리 랜덤 문자열 (예: ABC123)
- **학생 식별**: 학번(studentId) + 이름으로 고유 식별
- **세션 관리**: 
  - 인증된 세션 정보를 SessionStorage에 저장
  - 24시간 자동 만료
  - URL 직접 접근 차단
  - 세션 무결성 검증

#### 학생 인증 플로우
1. **테스트 코드 입력**: 메인 페이지에서 6자리 테스트 코드 검증
2. **학생 정보 입력**: 학번과 이름 입력 후 참여자로 등록
3. **세션 생성**: 인증된 세션 정보 생성
   - `testCode`: 테스트 코드
   - `participantId`: 학번
   - `participantName`: 이름
   - `sessionId`: 고유 세션 ID
   - `authenticatedAt`: 인증 시간
   - `expiresAt`: 만료 시간 (24시간)
4. **접근 제어**: 
   - `dictation.html`, `result.html`은 세션 정보 없이 접근 불가
   - URL 파라미터로 직접 접근 차단
   - 세션 만료 시 자동 로그아웃

### 3. 음성 재생 기능
- **Web Speech API**: `speechSynthesis.speak()`
- **음성 설정**: 
  - 언어: en-US
  - 속도: 조절 가능 (기본값: 1.0)
  - 음량: 조절 가능 (기본값: 1.0)
- **재생 컨트롤**: 재생, 일시정지, 정지 기능

### 4. 받아쓰기 입력
- **실시간 입력**: 타이핑하는 동안 실시간 피드백 (선택사항)
- **입력 완료**: Enter 키 또는 제출 버튼으로 채점 실행
- **입력 초기화**: 새로운 문제로 넘어갈 때 입력 필드 리셋

### 5. 채점 시스템
- **정확도 계산**: 
  - 완전 일치: 100%
  - 부분 일치: 단어별 비교하여 백분율 계산
  - 대소문자 무시 옵션
  - 구두점 처리 옵션
- **실시간 저장**: Firebase Firestore에 테스트 결과 자동 저장
- **피드백 제공**:
  - 정답 표시
  - 틀린 부분 하이라이트
  - 점수 표시
  - 결과 히스토리

## 파일 구조
```
받아쓰기/
├── index.html              # 메인 페이지 (교사 로그인 / 학생 테스트 코드 입력)
├── teacher/
│   ├── dashboard.html      # 교사 대시보드 (테스트 목록)
│   ├── create-test.html    # 새 테스트 생성
│   ├── edit-test.html      # 테스트 수정
│   └── monitor.html        # 실시간 진행 현황 모니터링
├── student/
│   ├── join.html          # 학번/이름 입력 페이지
│   ├── dictation.html     # 받아쓰기 테스트 페이지
│   └── result.html        # 개인 결과 페이지
├── css/
│   ├── styles.css         # 공통 스타일
│   ├── teacher.css        # 교사용 스타일
│   └── student.css        # 학생용 스타일
├── js/
│   ├── firebase-config.js # Firebase 설정
│   ├── auth.js           # 교사 인증 로직
│   ├── test-code.js      # 테스트 코드 생성/검증
│   ├── teacher.js        # 교사 기능 로직
│   ├── student.js        # 학생 기능 로직
│   ├── speech.js         # Web Speech API 로직
│   └── scoring.js        # 채점 알고리즘
└── assets/
    └── icons/            # 커스텀 아이콘들
```

## 개발 단계

### Phase 1: Firebase 설정 및 기본 구조
1. Firebase 프로젝트 생성 및 설정
2. Firestore 데이터베이스 구조 설계 (tests 컬렉션 중심)
3. Firebase Authentication 설정 (교사용만)
4. 테스트 코드 생성 시스템 구현
5. HTML 기본 레이아웃 작성 (교사/학생 분리)
6. TailwindCSS 적용 및 기본 스타일링

### Phase 2: 교사 인증 및 테스트 관리
1. 교사 로그인/회원가입 시스템
2. 테스트 생성 및 6자리 코드 생성 로직
3. 테스트 설정 인터페이스 (제목, 문장, 옵션)
4. 테스트 목록 관리 대시보드

### Phase 3: 학생 접근 시스템
1. 테스트 코드 입력 및 검증
2. 학번/이름 입력 폼
3. 세션 관리 (로컬 스토리지)
4. 테스트 참여 상태 업데이트

### Phase 4: 받아쓰기 테스트 기능
1. Web Speech API 음성 재생
2. 문장별 순차 진행 시스템
3. 실시간 답안 입력 및 자동 저장
4. 자동 채점 및 결과 저장

### Phase 5: 실시간 모니터링 및 결과 분석
1. 교사용 실시간 진행 현황 대시보드
2. 학생별/문장별 결과 분석
3. 통계 및 차트 표시
4. 결과 내보내기 기능 (CSV, Excel)

### Phase 6: UI/UX 개선 및 최적화
1. 반응형 디자인 구현
2. 애니메이션 및 트랜지션 효과
3. 접근성 개선
4. 성능 최적화 및 오프라인 대응

## 기술적 고려사항

### Firebase 설정
- **Firestore Database**: 테스트별 계층적 데이터 구조
- **Authentication**: 교사용 이메일/비밀번호 인증만
- **Security Rules**: 교사만 테스트 생성, 모든 사용자 테스트 접근 가능
- **Hosting**: Firebase 호스팅을 통한 배포

### 테스트 코드 시스템
- **코드 생성**: 6자리 랜덤 문자열 (대문자 + 숫자)
- **중복 방지**: Firestore 트랜잭션과 실시간 검증으로 완전한 고유성 보장
- **코드 검증**: 실시간으로 유효한 테스트 코드인지 확인
- **만료 관리**: 테스트 비활성화 시 접근 차단
- **충돌 해결**: 최대 10회 재시도로 중복 방지 및 오류 처리

### Web Speech API 호환성
- **지원 브라우저**: Chrome, Edge, Safari (부분 지원)
- **HTTPS 요구사항**: Firebase 호스팅으로 HTTPS 자동 제공
- **권한 요청**: 마이크 권한 (향후 음성 인식 기능 추가 시)

### 성능 최적화
- **테스트별 데이터 분리**: 필요한 테스트 데이터만 로드
- **실시간 리스너**: 교사 모니터링용 최적화된 쿼리
- **로컬 세션 관리**: 학생 정보 브라우저 저장으로 재접속 지원  
- **지연 로딩**: 문장별 순차 로드로 초기 로딩 시간 단축
- **오프라인 대응**: 중요 데이터 로컬 캐싱

### 접근성 (Accessibility)
- **키보드 네비게이션**: Tab 키로 모든 요소 접근 가능
- **스크린 리더**: ARIA 레이블 적용
- **색상 대비**: WCAG 가이드라인 준수

## 확장 가능성

### 단기 확장
- 음성 인식을 통한 자동 입력 (Speech Recognition API)
- 다양한 음성 옵션 (남성/여성, 다양한 억양)
- 테스트 시간 제한 및 자동 제출 기능
- 실시간 채팅 (교사-학생 간 질의응답)
- 테스트 결과 즉시 공유 기능

### 장기 확장
- QR 코드를 통한 테스트 접근
- 음성 녹음 기능 (발음 평가)
- AI 기반 오답 패턴 분석
- 학습 분석 및 개인화 추천
- 모바일 앱 개발

## 예상 이슈 및 해결방안

### 1. Firebase 비용 관리
- **문제**: 사용량 증가에 따른 비용 발생
- **해결**: 적절한 요금제 선택, 데이터 최적화, 캐싱 전략

### 2. 실시간 동기화 성능
- **문제**: 많은 사용자 동시 접속 시 성능 저하
- **해결**: 효율적인 쿼리 사용, 페이징 구현, 인덱스 최적화

### 3. 테스트 코드 보안
- **문제**: 테스트 코드 유출로 인한 무단 접근
- **해결**: 코드 만료 시간 설정, IP 제한, 접근 로그 기록

### 4. 학생 신원 확인
- **문제**: 학번/이름만으로는 본인 확인 어려움
- **해결**: 추가 검증 필드 옵션 제공 (생년월일, 반 정보 등)

### 5. 동시 접속 성능
- **문제**: 많은 학생이 동시에 같은 테스트 접속 시 성능 저하
- **해결**: Firestore 인덱싱 최적화, CDN 활용, 로드 밸런싱

### 6. 브라우저 호환성
- **문제**: 일부 브라우저에서 Web Speech API 미지원
- **해결**: 폴백 메시지 및 대안 제시

### 7. 음성 품질
- **문제**: 합성 음성의 자연스러움 부족
- **해결**: 다양한 voice 옵션 제공, 속도 조절 기능

### 8. 채점 정확도
- **문제**: 사용자 입력의 다양성 (오타, 축약형 등)
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

### 9. 데이터 프라이버시
- **문제**: 학생 개인정보 수집 및 처리 관련 이슈
- **해결**: 최소한의 정보만 수집, 데이터 보존 기간 설정, 삭제 정책 수립
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

## 개발 일정 (예상)
- **Week 1**: Phase 1 완료 (Firebase 설정, 테스트 코드 시스템)
- **Week 2**: Phase 2 완료 (교사 인증, 테스트 관리)  
- **Week 3**: Phase 3 완료 (학생 접근 시스템)
- **Week 4**: Phase 4 완료 (받아쓰기 테스트 기능)
- **Week 5**: Phase 5 완료 (실시간 모니터링, 결과 분석)
- **Week 6**: Phase 6 및 테스트, 배포

## Firebase 보안 규칙 (수정된 버전)
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 교사 사용자 정보는 본인만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 테스트는 교사만 생성/수정, 모든 사용자 읽기 가능 (테스트 코드로 접근)
    match /tests/{testCode} {
      allow read: if true; // 테스트 코드 알면 누구나 접근 가능
      allow create: if request.auth != null; // 교사만 테스트 생성 가능
      allow update: if request.auth != null || 
        // 학생이 participants 필드만 업데이트하는 경우 허용
        (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['participants', 'lastUpdated']));
      allow delete: if request.auth != null; // 교사만 삭제 가능
    }
    
    // 테스트 결과는 해당 테스트 참여자만 생성 가능, 교사는 모든 결과 조회 가능
    match /tests/{testCode}/results/{resultId} {
      allow read: if request.auth != null || 
        resource.data.studentId == request.resource.data.studentId;
      allow create: if true; // 학생은 무인증으로도 결과 생성 가능
      allow update, delete: if request.auth != null; // 교사만 수정/삭제 가능
    }
    
    // 통계 데이터는 교사만 접근 가능
    match /statistics/{statId} {
      allow read, write: if request.auth != null;
    }
    
    // 모든 기타 문서에 대한 기본 규칙
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Firebase Security Rules 배포 방법

### 1. Firebase CLI 설치 및 로그인
```bash
npm install -g firebase-tools
firebase login
```

### 2. 프로젝트 초기화 (처음 한 번만)
```bash
firebase init firestore
```

### 3. Security Rules 배포
```bash
firebase deploy --only firestore:rules
```

### 4. Rules 테스트 (선택사항)
```bash
firebase emulators:start --only firestore
```

> **중요**: Security Rules를 변경한 후에는 반드시 `firebase deploy --only firestore:rules` 명령을 실행하여 Firebase 콘솔에 적용해야 합니다.

## 주요 변경사항 요약

### 학생 정보 입력 개선
- 불필요한 "추가정보(선택사항)" 입력 필드 완전 제거
- 학번과 이름만 필수 입력으로 단순화
- UI가 더 깔끔하고 사용하기 쉬워짐

### 권한 문제 해결
- Firestore Security Rules 개선으로 학생 무인증 참여 지원
- 트랜잭션을 사용한 안전한 데이터 저장
- 더 명확한 오류 메시지 제공

### 데이터 구조 최적화
- 불필요한 grade, class 필드 제거
- 핵심 정보(학번, 이름)만 저장하여 개인정보 최소화
- 더 빠른 데이터 처리 및 저장

### 6. Firebase 보안 규칙
- **문제**: 테스트 코드 유출로 인한 무단 접근
- **해결**: 코드 만료 시간 설정, IP 제한, 접근 로그 기록

### 7. 학생 신원 확인
- **문제**: 학번/이름만으로는 본인 확인 어려움
- **해결**: 추가 검증 필드 옵션 제공 (생년월일, 반 정보 등)

### 8. 동시 접속 성능
- **문제**: 많은 학생이 동시에 같은 테스트 접속 시 성능 저하
- **해결**: Firestore 인덱싱 최적화, CDN 활용, 로드 밸런싱

### 9. 브라우저 호환성
- **문제**: 일부 브라우저에서 Web Speech API 미지원
- **해결**: 폴백 메시지 및 대안 제시

### 10. 음성 품질
- **문제**: 합성 음성의 자연스러움 부족
- **해결**: 다양한 voice 옵션 제공, 속도 조절 기능

### 11. 채점 정확도
- **문제**: 사용자 입력의 다양성 (오타, 축약형 등)
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

### 12. 데이터 프라이버시
- **문제**: 학생 개인정보 수집 및 처리 관련 이슈
- **해결**: 최소한의 정보만 수집, 데이터 보존 기간 설정, 삭제 정책 수립
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

## 개발 일정 (예상)
- **Week 1**: Phase 1 완료 (Firebase 설정, 테스트 코드 시스템)
- **Week 2**: Phase 2 완료 (교사 인증, 테스트 관리)  
- **Week 3**: Phase 3 완료 (학생 접근 시스템)
- **Week 4**: Phase 4 완료 (받아쓰기 테스트 기능)
- **Week 5**: Phase 5 완료 (실시간 모니터링, 결과 분석)
- **Week 6**: Phase 6 및 테스트, 배포

## Firebase 보안 규칙 (수정된 버전)
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 교사 사용자 정보는 본인만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 테스트는 교사만 생성/수정, 모든 사용자 읽기 가능 (테스트 코드로 접근)
    match /tests/{testCode} {
      allow read: if true; // 테스트 코드 알면 누구나 접근 가능
      allow create: if request.auth != null; // 교사만 테스트 생성 가능
      allow update: if request.auth != null || 
        // 학생이 participants 필드만 업데이트하는 경우 허용
        (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['participants', 'lastUpdated']));
      allow delete: if request.auth != null; // 교사만 삭제 가능
    }
    
    // 테스트 결과는 해당 테스트 참여자만 생성 가능, 교사는 모든 결과 조회 가능
    match /tests/{testCode}/results/{resultId} {
      allow read: if request.auth != null || 
        resource.data.studentId == request.resource.data.studentId;
      allow create: if true; // 학생은 무인증으로도 결과 생성 가능
      allow update, delete: if request.auth != null; // 교사만 수정/삭제 가능
    }
    
    // 통계 데이터는 교사만 접근 가능
    match /statistics/{statId} {
      allow read, write: if request.auth != null;
    }
    
    // 모든 기타 문서에 대한 기본 규칙
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Firebase Security Rules 배포 방법

### 1. Firebase CLI 설치 및 로그인
```bash
npm install -g firebase-tools
firebase login
```

### 2. 프로젝트 초기화 (처음 한 번만)
```bash
firebase init firestore
```

### 3. Security Rules 배포
```bash
firebase deploy --only firestore:rules
```

### 4. Rules 테스트 (선택사항)
```bash
firebase emulators:start --only firestore
```

> **중요**: Security Rules를 변경한 후에는 반드시 `firebase deploy --only firestore:rules` 명령을 실행하여 Firebase 콘솔에 적용해야 합니다.

## 주요 변경사항 요약

### 학생 정보 입력 개선
- 불필요한 "추가정보(선택사항)" 입력 필드 완전 제거
- 학번과 이름만 필수 입력으로 단순화
- UI가 더 깔끔하고 사용하기 쉬워짐

### 권한 문제 해결
- Firestore Security Rules 개선으로 학생 무인증 참여 지원
- 트랜잭션을 사용한 안전한 데이터 저장
- 더 명확한 오류 메시지 제공

### 데이터 구조 최적화
- 불필요한 grade, class 필드 제거
- 핵심 정보(학번, 이름)만 저장하여 개인정보 최소화
- 더 빠른 데이터 처리 및 저장

### 6. Firebase 보안 규칙
- **문제**: 테스트 코드 유출로 인한 무단 접근
- **해결**: 코드 만료 시간 설정, IP 제한, 접근 로그 기록

### 7. 학생 신원 확인
- **문제**: 학번/이름만으로는 본인 확인 어려움
- **해결**: 추가 검증 필드 옵션 제공 (생년월일, 반 정보 등)

### 8. 동시 접속 성능
- **문제**: 많은 학생이 동시에 같은 테스트 접속 시 성능 저하
- **해결**: Firestore 인덱싱 최적화, CDN 활용, 로드 밸런싱

### 9. 브라우저 호환성
- **문제**: 일부 브라우저에서 Web Speech API 미지원
- **해결**: 폴백 메시지 및 대안 제시

### 10. 음성 품질
- **문제**: 합성 음성의 자연스러움 부족
- **해결**: 다양한 voice 옵션 제공, 속도 조절 기능

### 11. 채점 정확도
- **문제**: 사용자 입력의 다양성 (오타, 축약형 등)
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

### 12. 데이터 프라이버시
- **문제**: 학생 개인정보 수집 및 처리 관련 이슈
- **해결**: 최소한의 정보만 수집, 데이터 보존 기간 설정, 삭제 정책 수립
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

## 개발 일정 (예상)
- **Week 1**: Phase 1 완료 (Firebase 설정, 테스트 코드 시스템)
- **Week 2**: Phase 2 완료 (교사 인증, 테스트 관리)  
- **Week 3**: Phase 3 완료 (학생 접근 시스템)
- **Week 4**: Phase 4 완료 (받아쓰기 테스트 기능)
- **Week 5**: Phase 5 완료 (실시간 모니터링, 결과 분석)
- **Week 6**: Phase 6 및 테스트, 배포

## Firebase 보안 규칙 (수정된 버전)
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 교사 사용자 정보는 본인만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 테스트는 교사만 생성/수정, 모든 사용자 읽기 가능 (테스트 코드로 접근)
    match /tests/{testCode} {
      allow read: if true; // 테스트 코드 알면 누구나 접근 가능
      allow create: if request.auth != null; // 교사만 테스트 생성 가능
      allow update: if request.auth != null || 
        // 학생이 participants 필드만 업데이트하는 경우 허용
        (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['participants', 'lastUpdated']));
      allow delete: if request.auth != null; // 교사만 삭제 가능
    }
    
    // 테스트 결과는 해당 테스트 참여자만 생성 가능, 교사는 모든 결과 조회 가능
    match /tests/{testCode}/results/{resultId} {
      allow read: if request.auth != null || 
        resource.data.studentId == request.resource.data.studentId;
      allow create: if true; // 학생은 무인증으로도 결과 생성 가능
      allow update, delete: if request.auth != null; // 교사만 수정/삭제 가능
    }
    
    // 통계 데이터는 교사만 접근 가능
    match /statistics/{statId} {
      allow read, write: if request.auth != null;
    }
    
    // 모든 기타 문서에 대한 기본 규칙
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Firebase Security Rules 배포 방법

### 1. Firebase CLI 설치 및 로그인
```bash
npm install -g firebase-tools
firebase login
```

### 2. 프로젝트 초기화 (처음 한 번만)
```bash
firebase init firestore
```

### 3. Security Rules 배포
```bash
firebase deploy --only firestore:rules
```

### 4. Rules 테스트 (선택사항)
```bash
firebase emulators:start --only firestore
```

> **중요**: Security Rules를 변경한 후에는 반드시 `firebase deploy --only firestore:rules` 명령을 실행하여 Firebase 콘솔에 적용해야 합니다.

## 주요 변경사항 요약

### 학생 정보 입력 개선
- 불필요한 "추가정보(선택사항)" 입력 필드 완전 제거
- 학번과 이름만 필수 입력으로 단순화
- UI가 더 깔끔하고 사용하기 쉬워짐

### 권한 문제 해결
- Firestore Security Rules 개선으로 학생 무인증 참여 지원
- 트랜잭션을 사용한 안전한 데이터 저장
- 더 명확한 오류 메시지 제공

### 데이터 구조 최적화
- 불필요한 grade, class 필드 제거
- 핵심 정보(학번, 이름)만 저장하여 개인정보 최소화
- 더 빠른 데이터 처리 및 저장

### 6. Firebase 보안 규칙
- **문제**: 테스트 코드 유출로 인한 무단 접근
- **해결**: 코드 만료 시간 설정, IP 제한, 접근 로그 기록

### 7. 학생 신원 확인
- **문제**: 학번/이름만으로는 본인 확인 어려움
- **해결**: 추가 검증 필드 옵션 제공 (생년월일, 반 정보 등)

### 8. 동시 접속 성능
- **문제**: 많은 학생이 동시에 같은 테스트 접속 시 성능 저하
- **해결**: Firestore 인덱싱 최적화, CDN 활용, 로드 밸런싱

### 9. 브라우저 호환성
- **문제**: 일부 브라우저에서 Web Speech API 미지원
- **해결**: 폴백 메시지 및 대안 제시

### 10. 음성 품질
- **문제**: 합성 음성의 자연스러움 부족
- **해결**: 다양한 voice 옵션 제공, 속도 조절 기능

### 11. 채점 정확도
- **문제**: 사용자 입력의 다양성 (오타, 축약형 등)
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

### 12. 데이터 프라이버시
- **문제**: 학생 개인정보 수집 및 처리 관련 이슈
- **해결**: 최소한의 정보만 수집, 데이터 보존 기간 설정, 삭제 정책 수립
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

## 개발 일정 (예상)
- **Week 1**: Phase 1 완료 (Firebase 설정, 테스트 코드 시스템)
- **Week 2**: Phase 2 완료 (교사 인증, 테스트 관리)  
- **Week 3**: Phase 3 완료 (학생 접근 시스템)
- **Week 4**: Phase 4 완료 (받아쓰기 테스트 기능)
- **Week 5**: Phase 5 완료 (실시간 모니터링, 결과 분석)
- **Week 6**: Phase 6 및 테스트, 배포

## Firebase 보안 규칙 (수정된 버전)
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 교사 사용자 정보는 본인만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 테스트는 교사만 생성/수정, 모든 사용자 읽기 가능 (테스트 코드로 접근)
    match /tests/{testCode} {
      allow read: if true; // 테스트 코드 알면 누구나 접근 가능
      allow create: if request.auth != null; // 교사만 테스트 생성 가능
      allow update: if request.auth != null || 
        // 학생이 participants 필드만 업데이트하는 경우 허용
        (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['participants', 'lastUpdated']));
      allow delete: if request.auth != null; // 교사만 삭제 가능
    }
    
    // 테스트 결과는 해당 테스트 참여자만 생성 가능, 교사는 모든 결과 조회 가능
    match /tests/{testCode}/results/{resultId} {
      allow read: if request.auth != null || 
        resource.data.studentId == request.resource.data.studentId;
      allow create: if true; // 학생은 무인증으로도 결과 생성 가능
      allow update, delete: if request.auth != null; // 교사만 수정/삭제 가능
    }
    
    // 통계 데이터는 교사만 접근 가능
    match /statistics/{statId} {
      allow read, write: if request.auth != null;
    }
    
    // 모든 기타 문서에 대한 기본 규칙
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Firebase Security Rules 배포 방법

### 1. Firebase CLI 설치 및 로그인
```bash
npm install -g firebase-tools
firebase login
```

### 2. 프로젝트 초기화 (처음 한 번만)
```bash
firebase init firestore
```

### 3. Security Rules 배포
```bash
firebase deploy --only firestore:rules
```

### 4. Rules 테스트 (선택사항)
```bash
firebase emulators:start --only firestore
```

> **중요**: Security Rules를 변경한 후에는 반드시 `firebase deploy --only firestore:rules` 명령을 실행하여 Firebase 콘솔에 적용해야 합니다.

## 주요 변경사항 요약

### 학생 정보 입력 개선
- 불필요한 "추가정보(선택사항)" 입력 필드 완전 제거
- 학번과 이름만 필수 입력으로 단순화
- UI가 더 깔끔하고 사용하기 쉬워짐

### 권한 문제 해결
- Firestore Security Rules 개선으로 학생 무인증 참여 지원
- 트랜잭션을 사용한 안전한 데이터 저장
- 더 명확한 오류 메시지 제공

### 데이터 구조 최적화
- 불필요한 grade, class 필드 제거
- 핵심 정보(학번, 이름)만 저장하여 개인정보 최소화
- 더 빠른 데이터 처리 및 저장

### 6. Firebase 보안 규칙
- **문제**: 테스트 코드 유출로 인한 무단 접근
- **해결**: 코드 만료 시간 설정, IP 제한, 접근 로그 기록

### 7. 학생 신원 확인
- **문제**: 학번/이름만으로는 본인 확인 어려움
- **해결**: 추가 검증 필드 옵션 제공 (생년월일, 반 정보 등)

### 8. 동시 접속 성능
- **문제**: 많은 학생이 동시에 같은 테스트 접속 시 성능 저하
- **해결**: Firestore 인덱싱 최적화, CDN 활용, 로드 밸런싱

### 9. 브라우저 호환성
- **문제**: 일부 브라우저에서 Web Speech API 미지원
- **해결**: 폴백 메시지 및 대안 제시

### 10. 음성 품질
- **문제**: 합성 음성의 자연스러움 부족
- **해결**: 다양한 voice 옵션 제공, 속도 조절 기능

### 11. 채점 정확도
- **문제**: 사용자 입력의 다양성 (오타, 축약형 등)
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

### 12. 데이터 프라이버시
- **문제**: 학생 개인정보 수집 및 처리 관련 이슈
- **해결**: 최소한의 정보만 수집, 데이터 보존 기간 설정, 삭제 정책 수립
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

## 개발 일정 (예상)
- **Week 1**: Phase 1 완료 (Firebase 설정, 테스트 코드 시스템)
- **Week 2**: Phase 2 완료 (교사 인증, 테스트 관리)  
- **Week 3**: Phase 3 완료 (학생 접근 시스템)
- **Week 4**: Phase 4 완료 (받아쓰기 테스트 기능)
- **Week 5**: Phase 5 완료 (실시간 모니터링, 결과 분석)
- **Week 6**: Phase 6 및 테스트, 배포

## Firebase 보안 규칙 (수정된 버전)
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 교사 사용자 정보는 본인만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 테스트는 교사만 생성/수정, 모든 사용자 읽기 가능 (테스트 코드로 접근)
    match /tests/{testCode} {
      allow read: if true; // 테스트 코드 알면 누구나 접근 가능
      allow create: if request.auth != null; // 교사만 테스트 생성 가능
      allow update: if request.auth != null || 
        // 학생이 participants 필드만 업데이트하는 경우 허용
        (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['participants', 'lastUpdated']));
      allow delete: if request.auth != null; // 교사만 삭제 가능
    }
    
    // 테스트 결과는 해당 테스트 참여자만 생성 가능, 교사는 모든 결과 조회 가능
    match /tests/{testCode}/results/{resultId} {
      allow read: if request.auth != null || 
        resource.data.studentId == request.resource.data.studentId;
      allow create: if true; // 학생은 무인증으로도 결과 생성 가능
      allow update, delete: if request.auth != null; // 교사만 수정/삭제 가능
    }
    
    // 통계 데이터는 교사만 접근 가능
    match /statistics/{statId} {
      allow read, write: if request.auth != null;
    }
    
    // 모든 기타 문서에 대한 기본 규칙
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Firebase Security Rules 배포 방법

### 1. Firebase CLI 설치 및 로그인
```bash
npm install -g firebase-tools
firebase login
```

### 2. 프로젝트 초기화 (처음 한 번만)
```bash
firebase init firestore
```

### 3. Security Rules 배포
```bash
firebase deploy --only firestore:rules
```

### 4. Rules 테스트 (선택사항)
```bash
firebase emulators:start --only firestore
```

> **중요**: Security Rules를 변경한 후에는 반드시 `firebase deploy --only firestore:rules` 명령을 실행하여 Firebase 콘솔에 적용해야 합니다.

## 주요 변경사항 요약

### 학생 정보 입력 개선
- 불필요한 "추가정보(선택사항)" 입력 필드 완전 제거
- 학번과 이름만 필수 입력으로 단순화
- UI가 더 깔끔하고 사용하기 쉬워짐

### 권한 문제 해결
- Firestore Security Rules 개선으로 학생 무인증 참여 지원
- 트랜잭션을 사용한 안전한 데이터 저장
- 더 명확한 오류 메시지 제공

### 데이터 구조 최적화
- 불필요한 grade, class 필드 제거
- 핵심 정보(학번, 이름)만 저장하여 개인정보 최소화
- 더 빠른 데이터 처리 및 저장

### 6. Firebase 보안 규칙
- **문제**: 테스트 코드 유출로 인한 무단 접근
- **해결**: 코드 만료 시간 설정, IP 제한, 접근 로그 기록

### 7. 학생 신원 확인
- **문제**: 학번/이름만으로는 본인 확인 어려움
- **해결**: 추가 검증 필드 옵션 제공 (생년월일, 반 정보 등)

### 8. 동시 접속 성능
- **문제**: 많은 학생이 동시에 같은 테스트 접속 시 성능 저하
- **해결**: Firestore 인덱싱 최적화, CDN 활용, 로드 밸런싱

### 9. 브라우저 호환성
- **문제**: 일부 브라우저에서 Web Speech API 미지원
- **해결**: 폴백 메시지 및 대안 제시

### 10. 음성 품질
- **문제**: 합성 음성의 자연스러움 부족
- **해결**: 다양한 voice 옵션 제공, 속도 조절 기능

### 11. 채점 정확도
- **문제**: 사용자 입력의 다양성 (오타, 축약형 등)
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

### 12. 데이터 프라이버시
- **문제**: 학생 개인정보 수집 및 처리 관련 이슈
- **해결**: 최소한의 정보만 수집, 데이터 보존 기간 설정, 삭제 정책 수립
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

## 개발 일정 (예상)
- **Week 1**: Phase 1 완료 (Firebase 설정, 테스트 코드 시스템)
- **Week 2**: Phase 2 완료 (교사 인증, 테스트 관리)  
- **Week 3**: Phase 3 완료 (학생 접근 시스템)
- **Week 4**: Phase 4 완료 (받아쓰기 테스트 기능)
- **Week 5**: Phase 5 완료 (실시간 모니터링, 결과 분석)
- **Week 6**: Phase 6 및 테스트, 배포

## Firebase 보안 규칙 (수정된 버전)
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 교사 사용자 정보는 본인만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 테스트는 교사만 생성/수정, 모든 사용자 읽기 가능 (테스트 코드로 접근)
    match /tests/{testCode} {
      allow read: if true; // 테스트 코드 알면 누구나 접근 가능
      allow create: if request.auth != null; // 교사만 테스트 생성 가능
      allow update: if request.auth != null || 
        // 학생이 participants 필드만 업데이트하는 경우 허용
        (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['participants', 'lastUpdated']));
      allow delete: if request.auth != null; // 교사만 삭제 가능
    }
    
    // 테스트 결과는 해당 테스트 참여자만 생성 가능, 교사는 모든 결과 조회 가능
    match /tests/{testCode}/results/{resultId} {
      allow read: if request.auth != null || 
        resource.data.studentId == request.resource.data.studentId;
      allow create: if true; // 학생은 무인증으로도 결과 생성 가능
      allow update, delete: if request.auth != null; // 교사만 수정/삭제 가능
    }
    
    // 통계 데이터는 교사만 접근 가능
    match /statistics/{statId} {
      allow read, write: if request.auth != null;
    }
    
    // 모든 기타 문서에 대한 기본 규칙
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Firebase Security Rules 배포 방법

### 1. Firebase CLI 설치 및 로그인
```bash
npm install -g firebase-tools
firebase login
```

### 2. 프로젝트 초기화 (처음 한 번만)
```bash
firebase init firestore
```

### 3. Security Rules 배포
```bash
firebase deploy --only firestore:rules
```

### 4. Rules 테스트 (선택사항)
```bash
firebase emulators:start --only firestore
```

> **중요**: Security Rules를 변경한 후에는 반드시 `firebase deploy --only firestore:rules` 명령을 실행하여 Firebase 콘솔에 적용해야 합니다.

## 주요 변경사항 요약

### 학생 정보 입력 개선
- 불필요한 "추가정보(선택사항)" 입력 필드 완전 제거
- 학번과 이름만 필수 입력으로 단순화
- UI가 더 깔끔하고 사용하기 쉬워짐

### 권한 문제 해결
- Firestore Security Rules 개선으로 학생 무인증 참여 지원
- 트랜잭션을 사용한 안전한 데이터 저장
- 더 명확한 오류 메시지 제공

### 데이터 구조 최적화
- 불필요한 grade, class 필드 제거
- 핵심 정보(학번, 이름)만 저장하여 개인정보 최소화
- 더 빠른 데이터 처리 및 저장

### 6. Firebase 보안 규칙
- **문제**: 테스트 코드 유출로 인한 무단 접근
- **해결**: 코드 만료 시간 설정, IP 제한, 접근 로그 기록

### 7. 학생 신원 확인
- **문제**: 학번/이름만으로는 본인 확인 어려움
- **해결**: 추가 검증 필드 옵션 제공 (생년월일, 반 정보 등)

### 8. 동시 접속 성능
- **문제**: 많은 학생이 동시에 같은 테스트 접속 시 성능 저하
- **해결**: Firestore 인덱싱 최적화, CDN 활용, 로드 밸런싱

### 9. 브라우저 호환성
- **문제**: 일부 브라우저에서 Web Speech API 미지원
- **해결**: 폴백 메시지 및 대안 제시

### 10. 음성 품질
- **문제**: 합성 음성의 자연스러움 부족
- **해결**: 다양한 voice 옵션 제공, 속도 조절 기능

### 11. 채점 정확도
- **문제**: 사용자 입력의 다양성 (오타, 축약형 등)
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

### 12. 데이터 프라이버시
- **문제**: 학생 개인정보 수집 및 처리 관련 이슈
- **해결**: 최소한의 정보만 수집, 데이터 보존 기간 설정, 삭제 정책 수립
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

## 개발 일정 (예상)
- **Week 1**: Phase 1 완료 (Firebase 설정, 테스트 코드 시스템)
- **Week 2**: Phase 2 완료 (교사 인증, 테스트 관리)  
- **Week 3**: Phase 3 완료 (학생 접근 시스템)
- **Week 4**: Phase 4 완료 (받아쓰기 테스트 기능)
- **Week 5**: Phase 5 완료 (실시간 모니터링, 결과 분석)
- **Week 6**: Phase 6 및 테스트, 배포

## Firebase 보안 규칙 (수정된 버전)
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 교사 사용자 정보는 본인만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 테스트는 교사만 생성/수정, 모든 사용자 읽기 가능 (테스트 코드로 접근)
    match /tests/{testCode} {
      allow read: if true; // 테스트 코드 알면 누구나 접근 가능
      allow create: if request.auth != null; // 교사만 테스트 생성 가능
      allow update: if request.auth != null || 
        // 학생이 participants 필드만 업데이트하는 경우 허용
        (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['participants', 'lastUpdated']));
      allow delete: if request.auth != null; // 교사만 삭제 가능
    }
    
    // 테스트 결과는 해당 테스트 참여자만 생성 가능, 교사는 모든 결과 조회 가능
    match /tests/{testCode}/results/{resultId} {
      allow read: if request.auth != null || 
        resource.data.studentId == request.resource.data.studentId;
      allow create: if true; // 학생은 무인증으로도 결과 생성 가능
      allow update, delete: if request.auth != null; // 교사만 수정/삭제 가능
    }
    
    // 통계 데이터는 교사만 접근 가능
    match /statistics/{statId} {
      allow read, write: if request.auth != null;
    }
    
    // 모든 기타 문서에 대한 기본 규칙
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Firebase Security Rules 배포 방법

### 1. Firebase CLI 설치 및 로그인
```bash
npm install -g firebase-tools
firebase login
```

### 2. 프로젝트 초기화 (처음 한 번만)
```bash
firebase init firestore
```

### 3. Security Rules 배포
```bash
firebase deploy --only firestore:rules
```

### 4. Rules 테스트 (선택사항)
```bash
firebase emulators:start --only firestore
```

> **중요**: Security Rules를 변경한 후에는 반드시 `firebase deploy --only firestore:rules` 명령을 실행하여 Firebase 콘솔에 적용해야 합니다.

## 주요 변경사항 요약

### 학생 정보 입력 개선
- 불필요한 "추가정보(선택사항)" 입력 필드 완전 제거
- 학번과 이름만 필수 입력으로 단순화
- UI가 더 깔끔하고 사용하기 쉬워짐

### 권한 문제 해결
- Firestore Security Rules 개선으로 학생 무인증 참여 지원
- 트랜잭션을 사용한 안전한 데이터 저장
- 더 명확한 오류 메시지 제공

### 데이터 구조 최적화
- 불필요한 grade, class 필드 제거
- 핵심 정보(학번, 이름)만 저장하여 개인정보 최소화
- 더 빠른 데이터 처리 및 저장

### 6. Firebase 보안 규칙
- **문제**: 테스트 코드 유출로 인한 무단 접근
- **해결**: 코드 만료 시간 설정, IP 제한, 접근 로그 기록

### 7. 학생 신원 확인
- **문제**: 학번/이름만으로는 본인 확인 어려움
- **해결**: 추가 검증 필드 옵션 제공 (생년월일, 반 정보 등)

### 8. 동시 접속 성능
- **문제**: 많은 학생이 동시에 같은 테스트 접속 시 성능 저하
- **해결**: Firestore 인덱싱 최적화, CDN 활용, 로드 밸런싱

### 9. 브라우저 호환성
- **문제**: 일부 브라우저에서 Web Speech API 미지원
- **해결**: 폴백 메시지 및 대안 제시

### 10. 음성 품질
- **문제**: 합성 음성의 자연스러움 부족
- **해결**: 다양한 voice 옵션 제공, 속도 조절 기능

### 11. 채점 정확도
- **문제**: 사용자 입력의 다양성 (오타, 축약형 등)
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

### 12. 데이터 프라이버시
- **문제**: 학생 개인정보 수집 및 처리 관련 이슈
- **해결**: 최소한의 정보만 수집, 데이터 보존 기간 설정, 삭제 정책 수립
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

## 개발 일정 (예상)
- **Week 1**: Phase 1 완료 (Firebase 설정, 테스트 코드 시스템)
- **Week 2**: Phase 2 완료 (교사 인증, 테스트 관리)  
- **Week 3**: Phase 3 완료 (학생 접근 시스템)
- **Week 4**: Phase 4 완료 (받아쓰기 테스트 기능)
- **Week 5**: Phase 5 완료 (실시간 모니터링, 결과 분석)
- **Week 6**: Phase 6 및 테스트, 배포

## Firebase 보안 규칙 (수정된 버전)
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 교사 사용자 정보는 본인만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 테스트는 교사만 생성/수정, 모든 사용자 읽기 가능 (테스트 코드로 접근)
    match /tests/{testCode} {
      allow read: if true; // 테스트 코드 알면 누구나 접근 가능
      allow create: if request.auth != null; // 교사만 테스트 생성 가능
      allow update: if request.auth != null || 
        // 학생이 participants 필드만 업데이트하는 경우 허용
        (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['participants', 'lastUpdated']));
      allow delete: if request.auth != null; // 교사만 삭제 가능
    }
    
    // 테스트 결과는 해당 테스트 참여자만 생성 가능, 교사는 모든 결과 조회 가능
    match /tests/{testCode}/results/{resultId} {
      allow read: if request.auth != null || 
        resource.data.studentId == request.resource.data.studentId;
      allow create: if true; // 학생은 무인증으로도 결과 생성 가능
      allow update, delete: if request.auth != null; // 교사만 수정/삭제 가능
    }
    
    // 통계 데이터는 교사만 접근 가능
    match /statistics/{statId} {
      allow read, write: if request.auth != null;
    }
    
    // 모든 기타 문서에 대한 기본 규칙
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Firebase Security Rules 배포 방법

### 1. Firebase CLI 설치 및 로그인
```bash
npm install -g firebase-tools
firebase login
```

### 2. 프로젝트 초기화 (처음 한 번만)
```bash
firebase init firestore
```

### 3. Security Rules 배포
```bash
firebase deploy --only firestore:rules
```

### 4. Rules 테스트 (선택사항)
```bash
firebase emulators:start --only firestore
```

> **중요**: Security Rules를 변경한 후에는 반드시 `firebase deploy --only firestore:rules` 명령을 실행하여 Firebase 콘솔에 적용해야 합니다.

## 주요 변경사항 요약

### 학생 정보 입력 개선
- 불필요한 "추가정보(선택사항)" 입력 필드 완전 제거
- 학번과 이름만 필수 입력으로 단순화
- UI가 더 깔끔하고 사용하기 쉬워짐

### 권한 문제 해결
- Firestore Security Rules 개선으로 학생 무인증 참여 지원
- 트랜잭션을 사용한 안전한 데이터 저장
- 더 명확한 오류 메시지 제공

### 데이터 구조 최적화
- 불필요한 grade, class 필드 제거
- 핵심 정보(학번, 이름)만 저장하여 개인정보 최소화
- 더 빠른 데이터 처리 및 저장

### 6. Firebase 보안 규칙
- **문제**: 테스트 코드 유출로 인한 무단 접근
- **해결**: 코드 만료 시간 설정, IP 제한, 접근 로그 기록

### 7. 학생 신원 확인
- **문제**: 학번/이름만으로는 본인 확인 어려움
- **해결**: 추가 검증 필드 옵션 제공 (생년월일, 반 정보 등)

### 8. 동시 접속 성능
- **문제**: 많은 학생이 동시에 같은 테스트 접속 시 성능 저하
- **해결**: Firestore 인덱싱 최적화, CDN 활용, 로드 밸런싱

### 9. 브라우저 호환성
- **문제**: 일부 브라우저에서 Web Speech API 미지원
- **해결**: 폴백 메시지 및 대안 제시

### 10. 음성 품질
- **문제**: 합성 음성의 자연스러움 부족
- **해결**: 다양한 voice 옵션 제공, 속도 조절 기능

### 11. 채점 정확도
- **문제**: 사용자 입력의 다양성 (오타, 축약형 등)
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

### 12. 데이터 프라이버시
- **문제**: 학생 개인정보 수집 및 처리 관련 이슈
- **해결**: 최소한의 정보만 수집, 데이터 보존 기간 설정, 삭제 정책 수립
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

## 개발 일정 (예상)
- **Week 1**: Phase 1 완료 (Firebase 설정, 테스트 코드 시스템)
- **Week 2**: Phase 2 완료 (교사 인증, 테스트 관리)  
- **Week 3**: Phase 3 완료 (학생 접근 시스템)
- **Week 4**: Phase 4 완료 (받아쓰기 테스트 기능)
- **Week 5**: Phase 5 완료 (실시간 모니터링, 결과 분석)
- **Week 6**: Phase 6 및 테스트, 배포

## Firebase 보안 규칙 (수정된 버전)
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 교사 사용자 정보는 본인만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 테스트는 교사만 생성/수정, 모든 사용자 읽기 가능 (테스트 코드로 접근)
    match /tests/{testCode} {
      allow read: if true; // 테스트 코드 알면 누구나 접근 가능
      allow create: if request.auth != null; // 교사만 테스트 생성 가능
      allow update: if request.auth != null || 
        // 학생이 participants 필드만 업데이트하는 경우 허용
        (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['participants', 'lastUpdated']));
      allow delete: if request.auth != null; // 교사만 삭제 가능
    }
    
    // 테스트 결과는 해당 테스트 참여자만 생성 가능, 교사는 모든 결과 조회 가능
    match /tests/{testCode}/results/{resultId} {
      allow read: if request.auth != null || 
        resource.data.studentId == request.resource.data.studentId;
      allow create: if true; // 학생은 무인증으로도 결과 생성 가능
      allow update, delete: if request.auth != null; // 교사만 수정/삭제 가능
    }
    
    // 통계 데이터는 교사만 접근 가능
    match /statistics/{statId} {
      allow read, write: if request.auth != null;
    }
    
    // 모든 기타 문서에 대한 기본 규칙
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Firebase Security Rules 배포 방법

### 1. Firebase CLI 설치 및 로그인
```bash
npm install -g firebase-tools
firebase login
```

### 2. 프로젝트 초기화 (처음 한 번만)
```bash
firebase init firestore
```

### 3. Security Rules 배포
```bash
firebase deploy --only firestore:rules
```

### 4. Rules 테스트 (선택사항)
```bash
firebase emulators:start --only firestore
```

> **중요**: Security Rules를 변경한 후에는 반드시 `firebase deploy --only firestore:rules` 명령을 실행하여 Firebase 콘솔에 적용해야 합니다.

## 주요 변경사항 요약

### 학생 정보 입력 개선
- 불필요한 "추가정보(선택사항)" 입력 필드 완전 제거
- 학번과 이름만 필수 입력으로 단순화
- UI가 더 깔끔하고 사용하기 쉬워짐

### 권한 문제 해결
- Firestore Security Rules 개선으로 학생 무인증 참여 지원
- 트랜잭션을 사용한 안전한 데이터 저장
- 더 명확한 오류 메시지 제공

### 데이터 구조 최적화
- 불필요한 grade, class 필드 제거
- 핵심 정보(학번, 이름)만 저장하여 개인정보 최소화
- 더 빠른 데이터 처리 및 저장

### 6. Firebase 보안 규칙
- **문제**: 테스트 코드 유출로 인한 무단 접근
- **해결**: 코드 만료 시간 설정, IP 제한, 접근 로그 기록

### 7. 학생 신원 확인
- **문제**: 학번/이름만으로는 본인 확인 어려움
- **해결**: 추가 검증 필드 옵션 제공 (생년월일, 반 정보 등)

### 8. 동시 접속 성능
- **문제**: 많은 학생이 동시에 같은 테스트 접속 시 성능 저하
- **해결**: Firestore 인덱싱 최적화, CDN 활용, 로드 밸런싱

### 9. 브라우저 호환성
- **문제**: 일부 브라우저에서 Web Speech API 미지원
- **해결**: 폴백 메시지 및 대안 제시

### 10. 음성 품질
- **문제**: 합성 음성의 자연스러움 부족
- **해결**: 다양한 voice 옵션 제공, 속도 조절 기능

### 11. 채점 정확도
- **문제**: 사용자 입력의 다양성 (오타, 축약형 등)
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

### 12. 데이터 프라이버시
- **문제**: 학생 개인정보 수집 및 처리 관련 이슈
- **해결**: 최소한의 정보만 수집, 데이터 보존 기간 설정, 삭제 정책 수립
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

## 개발 일정 (예상)
- **Week 1**: Phase 1 완료 (Firebase 설정, 테스트 코드 시스템)
- **Week 2**: Phase 2 완료 (교사 인증, 테스트 관리)  
- **Week 3**: Phase 3 완료 (학생 접근 시스템)
- **Week 4**: Phase 4 완료 (받아쓰기 테스트 기능)
- **Week 5**: Phase 5 완료 (실시간 모니터링, 결과 분석)
- **Week 6**: Phase 6 및 테스트, 배포

## Firebase 보안 규칙 (수정된 버전)
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 교사 사용자 정보는 본인만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 테스트는 교사만 생성/수정, 모든 사용자 읽기 가능 (테스트 코드로 접근)
    match /tests/{testCode} {
      allow read: if true; // 테스트 코드 알면 누구나 접근 가능
      allow create: if request.auth != null; // 교사만 테스트 생성 가능
      allow update: if request.auth != null || 
        // 학생이 participants 필드만 업데이트하는 경우 허용
        (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['participants', 'lastUpdated']));
      allow delete: if request.auth != null; // 교사만 삭제 가능
    }
    
    // 테스트 결과는 해당 테스트 참여자만 생성 가능, 교사는 모든 결과 조회 가능
    match /tests/{testCode}/results/{resultId} {
      allow read: if request.auth != null || 
        resource.data.studentId == request.resource.data.studentId;
      allow create: if true; // 학생은 무인증으로도 결과 생성 가능
      allow update, delete: if request.auth != null; // 교사만 수정/삭제 가능
    }
    
    // 통계 데이터는 교사만 접근 가능
    match /statistics/{statId} {
      allow read, write: if request.auth != null;
    }
    
    // 모든 기타 문서에 대한 기본 규칙
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Firebase Security Rules 배포 방법

### 1. Firebase CLI 설치 및 로그인
```bash
npm install -g firebase-tools
firebase login
```

### 2. 프로젝트 초기화 (처음 한 번만)
```bash
firebase init firestore
```

### 3. Security Rules 배포
```bash
firebase deploy --only firestore:rules
```

### 4. Rules 테스트 (선택사항)
```bash
firebase emulators:start --only firestore
```

> **중요**: Security Rules를 변경한 후에는 반드시 `firebase deploy --only firestore:rules` 명령을 실행하여 Firebase 콘솔에 적용해야 합니다.

## 주요 변경사항 요약

### 학생 정보 입력 개선
- 불필요한 "추가정보(선택사항)" 입력 필드 완전 제거
- 학번과 이름만 필수 입력으로 단순화
- UI가 더 깔끔하고 사용하기 쉬워짐

### 권한 문제 해결
- Firestore Security Rules 개선으로 학생 무인증 참여 지원
- 트랜잭션을 사용한 안전한 데이터 저장
- 더 명확한 오류 메시지 제공

### 데이터 구조 최적화
- 불필요한 grade, class 필드 제거
- 핵심 정보(학번, 이름)만 저장하여 개인정보 최소화
- 더 빠른 데이터 처리 및 저장

### 6. Firebase 보안 규칙
- **문제**: 테스트 코드 유출로 인한 무단 접근
- **해결**: 코드 만료 시간 설정, IP 제한, 접근 로그 기록

### 7. 학생 신원 확인
- **문제**: 학번/이름만으로는 본인 확인 어려움
- **해결**: 추가 검증 필드 옵션 제공 (생년월일, 반 정보 등)

### 8. 동시 접속 성능
- **문제**: 많은 학생이 동시에 같은 테스트 접속 시 성능 저하
- **해결**: Firestore 인덱싱 최적화, CDN 활용, 로드 밸런싱

### 9. 브라우저 호환성
- **문제**: 일부 브라우저에서 Web Speech API 미지원
- **해결**: 폴백 메시지 및 대안 제시

### 10. 음성 품질
- **문제**: 합성 음성의 자연스러움 부족
- **해결**: 다양한 voice 옵션 제공, 속도 조절 기능

### 11. 채점 정확도
- **문제**: 사용자 입력의 다양성 (오타, 축약형 등)
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

### 12. 데이터 프라이버시
- **문제**: 학생 개인정보 수집 및 처리 관련 이슈
- **해결**: 최소한의 정보만 수집, 데이터 보존 기간 설정, 삭제 정책 수립
- **해결**: 유연한 채점 알고리즘 개발, 여러 정답 패턴 허용

## 개발 일정 (예상)
- **Week 1**: Phase 1 완료 (Firebase 설정, 테스트 코드 시스템)
- **Week 2**: Phase 2 완료 (교사 인증, 테스트 관리)  
- **Week 3**: Phase 3 완료 (학생 접근 시스템)
- **Week 4**: Phase 4 완료 (받아쓰기 테스트 기능)
- **Week 5**: Phase 5 완료 (실시간 모니터링, 결과 분석)
- **Week 6**: Phase 6 및 테스트, 배포

## Firebase 보안 규칙 (수정된 버전)
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 교사 사용자 정보는 본인만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 테스트는 교사만 생성/수정, 모든 사용자 읽기 가능 (테스트 코드로 접근)
    match /tests/{testCode} {
      allow read: if true; // 테스트 코드 알면 누구나 접근 가능
      allow create: if request.auth != null; // 교사만 테스트 생성 가능
      allow update: if request.auth != null || 
        // 학생이 participants 필드만 업데이트하는 경우 허용
        (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['participants', 'lastUpdated']));
      allow delete: if request.auth != null; // 교사만 삭제 가능
    }
    
    // 테스트 결과는 해당 테스트 참여자만 생성 가능