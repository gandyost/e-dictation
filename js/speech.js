/**
 * Web Speech API 관련 JavaScript 모듈
 * 음성 합성(TTS) 및 음성 인식(STT) 기능 제공
 */

class SpeechManager {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.recognition = null;
        this.voices = [];
        this.isSupported = this.checkSupport();
        
        // 기본 설정
        this.defaultSettings = {
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            lang: 'en-US',
            voice: null
        };

        this.currentUtterance = null;
        this.isPlaying = false;
        
        // 이벤트 콜백
        this.onStart = null;
        this.onEnd = null;
        this.onError = null;
        this.onProgress = null;

        this.initializeVoices();
    }

    // Web Speech API 지원 확인
    checkSupport() {
        const support = {
            synthesis: 'speechSynthesis' in window,
            recognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
        };

        return support;
    }    // 음성 목록 초기화
    initializeVoices() {
        const loadVoices = () => {
            this.voices = this.synthesis.getVoices();
            
            // 영어 음성만 필터링
            this.englishVoices = this.voices.filter(voice => 
                voice.lang.toLowerCase().startsWith('en')
            );

            // 모바일 환경에서 음성 품질 개선을 위한 정렬
            this.englishVoices.sort((a, b) => {
                const aScore = this.getVoiceQualityScore(a);
                const bScore = this.getVoiceQualityScore(b);
                return bScore - aScore;
            });

            console.log(`영어 음성 ${this.englishVoices.length}개 로드됨:`, 
                this.englishVoices.map(v => `${v.name} (${v.lang})`));
        };

        loadVoices();
        
        // 일부 브라우저에서는 비동기적으로 로드됨
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = loadVoices;
        }
    }

    // 음성 품질 점수 계산 (모바일 최적화)
    getVoiceQualityScore(voice) {
        let score = 0;
        const name = voice.name.toLowerCase();
        const lang = voice.lang.toLowerCase();

        // 언어 우선순위
        if (lang === 'en-us') score += 100;
        else if (lang === 'en-gb') score += 90;
        else if (lang.startsWith('en')) score += 50;

        // 음성 품질 키워드
        if (name.includes('enhanced')) score += 50;
        if (name.includes('premium')) score += 45;
        if (name.includes('neural')) score += 40;
        if (name.includes('natural')) score += 35;
        if (name.includes('high quality')) score += 30;
        if (voice.default) score += 20;

        // 모바일 환경 특화
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
            // iOS Safari의 경우
            if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
                if (name.includes('samantha') || name.includes('alex')) score += 25;
            }
            // Android Chrome의 경우
            if (userAgent.includes('chrome') && userAgent.includes('android')) {
                if (name.includes('google') || name.includes('tts')) score += 25;
            }
        }

        return score;
    }

    // 음성 목록 가져오기
    getVoices() {
        return this.englishVoices || [];
    }

    // 추천 음성 가져오기
    getRecommendedVoices() {
        const recommended = this.englishVoices.filter(voice => {
            const name = voice.name.toLowerCase();
            const lang = voice.lang.toLowerCase();
            
            // 미국/영국 영어 우선, 자연스러운 음성 우선
            return (
                (lang.includes('en-us') || lang.includes('en-gb')) &&
                (name.includes('enhanced') || name.includes('premium') || name.includes('neural') || voice.default)
            );
        });

        return recommended.length > 0 ? recommended : this.englishVoices.slice(0, 3);
    }    // 텍스트 음성 합성
    speak(text, settings = {}) {
        if (!this.isSupported.synthesis) {
            throw new Error('음성 합성을 지원하지 않는 브라우저입니다.');
        }

        // 기존 음성 중지
        this.stop();

        const config = { ...this.defaultSettings, ...settings };
        
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        
        // 기본 설정 적용
        this.currentUtterance.rate = config.rate;
        this.currentUtterance.pitch = config.pitch;
        this.currentUtterance.volume = config.volume;
        this.currentUtterance.lang = config.lang;

        // 음성 선택 (모바일 환경 개선)
        if (config.voice) {
            const selectedVoice = this.voices.find(voice => 
                voice.name === config.voice || voice.voiceURI === config.voice
            );
            if (selectedVoice) {
                this.currentUtterance.voice = selectedVoice;
            }
        } else {
            // 최적 영어 음성 자동 선택
            const bestVoice = this.getBestEnglishVoice();
            if (bestVoice) {
                this.currentUtterance.voice = bestVoice;
                console.log('자동 선택된 음성:', bestVoice.name, bestVoice.lang);
            }
        }

        // 이벤트 리스너 설정
        this.currentUtterance.onstart = () => {
            this.isPlaying = true;
            if (this.onStart) this.onStart();
        };

        this.currentUtterance.onend = () => {
            this.isPlaying = false;
            this.currentUtterance = null;
            if (this.onEnd) this.onEnd();
        };

        this.currentUtterance.onerror = (event) => {
            this.isPlaying = false;
            this.currentUtterance = null;
            if (this.onError) this.onError(event);
            
            // 모바일 환경에서 오류 발생 시 폴백 처리
            if (event.error === 'synthesis-failed' || event.error === 'voice-unavailable') {
                console.warn('음성 합성 오류, 기본 설정으로 재시도:', event.error);
                setTimeout(() => {
                    this.speakWithFallback(text, config);
                }, 100);
            }
        };

        this.currentUtterance.onboundary = (event) => {
            if (this.onProgress) {
                this.onProgress({
                    charIndex: event.charIndex,
                    charLength: event.charLength || 1,
                    text: text
                });
            }
        };

        // 음성 재생 시작
        this.synthesis.speak(this.currentUtterance);
        
        return this.currentUtterance;
    }

    // 최적 영어 음성 선택
    getBestEnglishVoice() {
        if (!this.englishVoices || this.englishVoices.length === 0) {
            return null;
        }
        return this.englishVoices[0]; // 이미 품질 순으로 정렬됨
    }

    // 폴백 음성 재생
    speakWithFallback(text, config) {
        const fallbackUtterance = new SpeechSynthesisUtterance(text);
        fallbackUtterance.lang = 'en-US';
        fallbackUtterance.rate = config.rate || 1.0;
        fallbackUtterance.pitch = config.pitch || 1.0;
        fallbackUtterance.volume = config.volume || 1.0;
        // 음성은 지정하지 않고 브라우저 기본값 사용
        
        fallbackUtterance.onstart = () => {
            this.isPlaying = true;
            if (this.onStart) this.onStart();
        };

        fallbackUtterance.onend = () => {
            this.isPlaying = false;
            if (this.onEnd) this.onEnd();
        };

        fallbackUtterance.onerror = (event) => {
            this.isPlaying = false;
            console.error('폴백 음성도 실패:', event.error);
            if (this.onError) this.onError(event);
        };

        this.synthesis.speak(fallbackUtterance);
        this.currentUtterance = fallbackUtterance;
    }

    // 음성 일시정지
    pause() {
        if (this.isSupported.synthesis && this.synthesis.speaking) {
            this.synthesis.pause();
        }
    }

    // 음성 재개
    resume() {
        if (this.isSupported.synthesis && this.synthesis.paused) {
            this.synthesis.resume();
        }
    }

    // 음성 중지
    stop() {
        if (this.isSupported.synthesis) {
            this.synthesis.cancel();
            this.isPlaying = false;
            this.currentUtterance = null;
        }
    }

    // 재생 상태 확인
    isPlaying() {
        return this.isPlaying && this.synthesis.speaking;
    }

    // 일시정지 상태 확인
    isPaused() {
        return this.synthesis.paused;
    }

    // 음성 테스트
    testVoice(voiceName) {
        const testText = "This is a voice test. Hello, how are you today?";
        return this.speak(testText, { voice: voiceName });
    }

    // 문장 분석 및 최적화된 음성 설정 제안
    analyzeSentence(text) {
        const analysis = {
            length: text.length,
            wordCount: text.split(/\s+/).length,
            hasNumbers: /\d/.test(text),
            hasPunctuation: /[.,!?;:]/.test(text),
            complexity: 'medium',
            suggestedRate: 1.0,
            suggestedPause: 0
        };

        // 복잡도 판단
        if (analysis.wordCount > 15 || text.includes(',')) {
            analysis.complexity = 'high';
            analysis.suggestedRate = 0.9;
        } else if (analysis.wordCount < 8) {
            analysis.complexity = 'low';
            analysis.suggestedRate = 1.1;
        }

        // 숫자가 포함된 경우 느리게
        if (analysis.hasNumbers) {
            analysis.suggestedRate = Math.max(0.8, analysis.suggestedRate - 0.1);
        }

        // 문장 끝 일시정지 제안
        if (analysis.hasPunctuation) {
            analysis.suggestedPause = 0.5;
        }

        return analysis;
    }

    // SSML(Speech Synthesis Markup Language) 지원 확인 및 생성
    generateSSML(text, options = {}) {
        const rate = options.rate || 1.0;
        const pitch = options.pitch || 1.0;
        const volume = options.volume || 1.0;
        const lang = options.lang || 'en-US';

        // 기본 SSML 구조
        let ssml = `<speak version="1.0" xml:lang="${lang}">`;
        
        // 전체 음성 설정
        ssml += `<prosody rate="${rate}" pitch="${pitch}" volume="${volume}">`;
        
        // 텍스트 처리
        let processedText = text;
        
        // 숫자를 자연스럽게 읽도록 처리
        processedText = processedText.replace(/\b(\d+)\b/g, '<say-as interpret-as="number">$1</say-as>');
        
        // 이메일 주소 처리
        processedText = processedText.replace(/[\w.-]+@[\w.-]+\.\w+/g, 
            '<say-as interpret-as="email">$&</say-as>');
        
        // 문장 끝 일시정지 추가
        processedText = processedText.replace(/[.!?]/g, '$&<break time="0.5s"/>');
        
        ssml += processedText;
        ssml += '</prosody></speak>';
        
        return ssml;
    }

    // 음성 인식 초기화 (선택적 기능)
    initializeSpeechRecognition() {
        if (!this.isSupported.recognition) {
            console.warn('음성 인식을 지원하지 않는 브라우저입니다.');
            return null;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // 기본 설정
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        return this.recognition;
    }

    // 음성 인식 시작
    startRecognition(callback) {
        if (!this.recognition) {
            this.initializeSpeechRecognition();
        }

        if (!this.recognition) {
            throw new Error('음성 인식을 사용할 수 없습니다.');
        }

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (callback) {
                callback({
                    final: finalTranscript,
                    interim: interimTranscript,
                    confidence: event.results[0] ? event.results[0][0].confidence : 0
                });
            }
        };

        this.recognition.onerror = (event) => {
            console.error('음성 인식 오류:', event.error);
        };

        this.recognition.start();
    }

    // 음성 인식 중지
    stopRecognition() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    // 오디오 컨텍스트를 이용한 고급 음성 처리
    createAudioContext() {
        if ('AudioContext' in window || 'webkitAudioContext' in window) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            return new AudioContext();
        }
        return null;
    }

    // 음성 시각화를 위한 주파수 분석
    analyzeAudioFrequency(audioContext, source) {
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        source.connect(analyser);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const analyze = () => {
            analyser.getByteFrequencyData(dataArray);
            return dataArray;
        };
        
        return { analyser, analyze };
    }

    // 이벤트 리스너 설정
    addEventListener(event, callback) {
        switch (event) {
            case 'start':
                this.onStart = callback;
                break;
            case 'end':
                this.onEnd = callback;
                break;
            case 'error':
                this.onError = callback;
                break;
            case 'progress':
                this.onProgress = callback;
                break;
        }
    }

    // 이벤트 리스너 제거
    removeEventListener(event) {
        switch (event) {
            case 'start':
                this.onStart = null;
                break;
            case 'end':
                this.onEnd = null;
                break;
            case 'error':
                this.onError = null;
                break;
            case 'progress':
                this.onProgress = null;
                break;
        }
    }

    // 음성 설정 프리셋
    getPresets() {
        return {
            slow: { rate: 0.7, pitch: 1.0 },
            normal: { rate: 1.0, pitch: 1.0 },
            fast: { rate: 1.3, pitch: 1.0 },
            clear: { rate: 0.9, pitch: 1.1 },
            deep: { rate: 0.9, pitch: 0.8 },
            high: { rate: 1.0, pitch: 1.2 }
        };
    }

    // 프리셋 적용
    applyPreset(presetName) {
        const presets = this.getPresets();
        if (presets[presetName]) {
            this.defaultSettings = { ...this.defaultSettings, ...presets[presetName] };
        }
    }

    // 정리 함수
    cleanup() {
        this.stop();
        if (this.recognition) {
            this.stopRecognition();
        }
        this.removeEventListener('start');
        this.removeEventListener('end');
        this.removeEventListener('error');
        this.removeEventListener('progress');
    }
}

// 유틸리티 클래스: 발음 도우미
class PronunciationHelper {
    constructor() {
        // 발음이 어려운 단어들과 발음 팁
        this.difficultWords = {
            // 예시 데이터
            'colonel': 'kernel',
            'wednesday': 'wensday',
            'february': 'febyuary',
            'pronunciation': 'pro-nun-see-ay-shun'
        };
    }

    // 발음 안내 제공
    getPronunciationGuide(word) {
        const lowerWord = word.toLowerCase();
        if (this.difficultWords[lowerWord]) {
            return {
                word: word,
                phonetic: this.difficultWords[lowerWord],
                hasTip: true
            };
        }
        return { word: word, hasTip: false };
    }

    // 음성학적 분해
    breakdownWord(word) {
        // 간단한 음절 분리 알고리즘
        const vowels = 'aeiouAEIOU';
        const syllables = [];
        let currentSyllable = '';
        
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            currentSyllable += char;
            
            if (vowels.includes(char) && i < word.length - 1) {
                if (!vowels.includes(word[i + 1])) {
                    syllables.push(currentSyllable);
                    currentSyllable = '';
                }
            }
        }
        
        if (currentSyllable) {
            syllables.push(currentSyllable);
        }
        
        return syllables;
    }
}

// 유틸리티 함수들
const SpeechUtils = {
    // 음성 품질 테스트
    testVoiceQuality(speechManager, voiceName) {
        return new Promise((resolve) => {
            const testSentences = [
                "Hello, this is a voice quality test.",
                "The quick brown fox jumps over the lazy dog.",
                "How are you doing today? I hope you're having a great time."
            ];
            
            let completed = 0;
            const results = [];
            
            testSentences.forEach((sentence, index) => {
                speechManager.speak(sentence, { voice: voiceName });
                
                speechManager.addEventListener('end', () => {
                    completed++;
                    results.push({
                        sentence: sentence,
                        completed: true
                    });
                    
                    if (completed === testSentences.length) {
                        resolve({
                            voice: voiceName,
                            testResults: results,
                            quality: 'good' // 실제로는 더 복잡한 평가 로직 필요
                        });
                    }
                });
            });
        });
    },

    // 최적 음성 속도 계산
    calculateOptimalRate(text, difficulty = 'medium') {
        const baseRate = 1.0;
        const wordCount = text.split(/\s+/).length;
        const avgWordLength = text.replace(/\s+/g, '').length / wordCount;
        
        let rate = baseRate;
        
        // 문장 길이에 따른 조정
        if (wordCount > 15) rate *= 0.9;
        if (wordCount < 8) rate *= 1.1;
        
        // 평균 단어 길이에 따른 조정
        if (avgWordLength > 6) rate *= 0.95;
        if (avgWordLength < 4) rate *= 1.05;
        
        // 난이도에 따른 조정
        switch (difficulty) {
            case 'easy':
                rate *= 1.1;
                break;
            case 'hard':
                rate *= 0.85;
                break;
        }
        
        return Math.max(0.5, Math.min(2.0, rate));
    },

    // 텍스트 전처리
    preprocessText(text) {
        return text
            .replace(/\s+/g, ' ') // 연속된 공백 제거
            .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // 문장 사이 공백 확보
            .trim();
    },    // 브라우저별 음성 호환성 확인
    checkBrowserCompatibility() {
        const userAgent = navigator.userAgent;
        const compatibility = {
            browser: 'unknown',
            isMobile: false,
            synthesisSupport: 'speechSynthesis' in window,
            recognitionSupport: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
            qualityRating: 'medium',
            recommendations: []
        };
        
        // 모바일 환경 감지
        compatibility.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        if (userAgent.includes('Chrome')) {
            compatibility.browser = 'Chrome';
            compatibility.qualityRating = 'high';
            if (compatibility.isMobile && userAgent.includes('Android')) {
                compatibility.recommendations.push('Google TTS 엔진 사용 권장');
            }
        } else if (userAgent.includes('Firefox')) {
            compatibility.browser = 'Firefox';
            compatibility.qualityRating = 'medium';
            compatibility.recommendations.push('음성 품질이 제한적일 수 있습니다');
        } else if (userAgent.includes('Safari')) {
            compatibility.browser = 'Safari';
            compatibility.qualityRating = 'medium';
            if (compatibility.isMobile) {
                compatibility.recommendations.push('iOS 설정에서 영어 음성 활성화 확인');
                compatibility.recommendations.push('Siri 음성을 영어로 설정하면 품질이 향상됩니다');
            }
        } else if (userAgent.includes('Edge')) {
            compatibility.browser = 'Edge';
            compatibility.qualityRating = 'high';
        }

        // 모바일 특화 권장사항
        if (compatibility.isMobile) {
            compatibility.recommendations.push('음성 재생 전 사용자 상호작용이 필요할 수 있습니다');
            compatibility.recommendations.push('헤드폰 사용 시 음질이 개선됩니다');
        }
        
        return compatibility;
    },

    // 오류 처리 도우미
    handleSpeechError(error) {
        const errorMessages = {
            'network': '네트워크 연결을 확인해주세요.',
            'not-allowed': '마이크 권한이 필요합니다.',
            'service-not-allowed': '음성 서비스를 사용할 수 없습니다.',
            'bad-grammar': '인식 문법에 오류가 있습니다.',
            'language-not-supported': '지원하지 않는 언어입니다.',
            'no-speech': '음성이 감지되지 않았습니다.',
            'audio-capture': '오디오 캡처 오류가 발생했습니다.',
            'synthesis-failed': '음성 합성에 실패했습니다.'
        };
        
        return errorMessages[error] || '알 수 없는 오류가 발생했습니다.';
    }
};

// 전역으로 노출
window.SpeechManager = SpeechManager;
window.PronunciationHelper = PronunciationHelper;
window.SpeechUtils = SpeechUtils;
