/**
 * 학생 기능 관련 JavaScript 모듈
 * 테스트 참여, 답안 제출, 결과 확인 등의 기능 제공
 */

class StudentManager {
    constructor() {
        this.db = db; // firebase-config.js에서 초기화된 db 사용
        this.currentSession = null;
        this.testData = null;
        this.participantData = null;
    }

    // 세션 데이터 저장
    saveSession(sessionData) {
        this.currentSession = sessionData;
        sessionStorage.setItem('studentSession', JSON.stringify(sessionData));
    }

    // 세션 데이터 로드
    loadSession() {
        const sessionData = sessionStorage.getItem('studentSession');
        if (sessionData) {
            this.currentSession = JSON.parse(sessionData);
            return this.currentSession;
        }
        return null;
    }

    // 세션 정리
    clearSession() {
        this.currentSession = null;
        sessionStorage.removeItem('studentSession');
    }

    // 테스트 코드 유효성 검사
    async validateTestCode(testCode) {
        try {
            const testDoc = await this.db.collection('tests').doc(testCode).get();
            
            if (!testDoc.exists) {
                throw new Error('존재하지 않는 테스트 코드입니다.');
            }

            const testData = testDoc.data();
            
            if (testData.status !== 'active') {
                throw new Error('현재 비활성화된 테스트입니다.');
            }

            return {
                id: testDoc.id,
                ...testData
            };
        } catch (error) {
            console.error('테스트 코드 검증 오류:', error);
            throw error;
        }
    }

    // 테스트 참여
    async joinTest(testCode, studentInfo, agreement) {
        try {
            // 테스트 유효성 검사
            const testData = await this.validateTestCode(testCode);
            this.testData = testData;

            // 개인정보 동의 확인
            if (!agreement) {
                throw new Error('개인정보 수집 및 이용에 동의해야 합니다.');
            }

            // 중복 참여 확인
            const existingParticipant = await this.checkExistingParticipant(testCode, studentInfo.studentId);
            
            let participantId;
            
            if (existingParticipant) {
                // 기존 참여자 - 재접속 허용 여부 확인
                if (existingParticipant.status === 'completed' && !testData.settings?.allowRetries) {
                    throw new Error('이미 완료된 테스트입니다. 재시도가 허용되지 않습니다.');
                }
                
                participantId = existingParticipant.id;
                
                // 기존 참여자 정보 업데이트
                await this.db.collection('tests').doc(testCode).collection('participants').doc(participantId).update({
                    lastAccess: firebase.firestore.FieldValue.serverTimestamp(),
                    status: existingParticipant.status === 'completed' ? 'completed' : 'joined'
                });
            } else {
                // 새 참여자 등록
                const participantData = {
                    name: studentInfo.name,
                    studentId: studentInfo.studentId,
                    status: 'joined',
                    joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastAccess: firebase.firestore.FieldValue.serverTimestamp(),
                    progress: 0,
                    answers: [],
                    agreement: {
                        dataCollection: agreement.dataCollection,
                        dataUsage: agreement.dataUsage,
                        agreedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }
                };

                const participantRef = await this.db.collection('tests').doc(testCode).collection('participants').add(participantData);
                
                participantId = participantRef.id;
            }

            // 세션 저장
            const sessionData = {
                testCode: testCode,
                participantId: participantId,
                studentInfo: studentInfo,
                joinedAt: new Date().toISOString()
            };
            
            this.saveSession(sessionData);

            return {
                participantId: participantId,
                testData: testData,
                isReturning: !!existingParticipant
            };

        } catch (error) {
            console.error('테스트 참여 오류:', error);
            throw error;
        }
    }

    // 기존 참여자 확인
    async checkExistingParticipant(testCode, studentId) {
        try {
            const participantsRef = this.db.collection('tests').doc(testCode).collection('participants');
            const snapshot = await participantsRef.where('studentId', '==', studentId).get();

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return {
                    id: doc.id,
                    ...doc.data()
                };
            }

            return null;
        } catch (error) {
            console.error('기존 참여자 확인 오류:', error);
            return null;
        }
    }

    // 테스트 데이터 로드
    async loadTestData() {
        if (!this.currentSession) {
            throw new Error('세션이 없습니다.');
        }

        try {
            const testDoc = await this.db.collection('tests').doc(this.currentSession.testCode).get();
            
            if (!testDoc.exists) {
                throw new Error('테스트를 찾을 수 없습니다.');
            }

            this.testData = {
                id: testDoc.id,
                ...testDoc.data()
            };

            return this.testData;
        } catch (error) {
            console.error('테스트 데이터 로드 오류:', error);
            throw error;
        }
    }

    // 참여자 데이터 로드
    async loadParticipantData() {
        if (!this.currentSession) {
            throw new Error('세션이 없습니다.');
        }

        try {
            const participantDoc = await this.db.collection('tests').doc(this.currentSession.testCode).collection('participants').doc(this.currentSession.participantId).get();
            
            if (!participantDoc.exists) {
                throw new Error('참여자 정보를 찾을 수 없습니다.');
            }

            this.participantData = {
                id: participantDoc.id,
                ...participantDoc.data()
            };

            return this.participantData;
        } catch (error) {
            console.error('참여자 데이터 로드 오류:', error);
            throw error;
        }
    }

    // 테스트 시작
    async startTest() {
        if (!this.currentSession) {
            throw new Error('세션이 없습니다.');
        }

        try {
            await updateDoc(
                doc(this.db, 'tests', this.currentSession.testCode, 'participants', this.currentSession.participantId),
                {
                    status: 'in-progress',
                    startedAt: serverTimestamp(),
                    lastAccess: serverTimestamp()
                }
            );

            return true;
        } catch (error) {
            console.error('테스트 시작 오류:', error);
            throw error;
        }
    }

    // 답안 저장
    async saveAnswer(questionIndex, answerData) {
        if (!this.currentSession) {
            throw new Error('세션이 없습니다.');
        }

        try {
            // 현재 참여자 데이터 로드
            await this.loadParticipantData();
            
            // 답안 배열 업데이트
            const answers = this.participantData.answers || [];
            answers[questionIndex] = {
                ...answerData,
                questionIndex: questionIndex,
                submittedAt: serverTimestamp()
            };

            // 진행률 계산
            const progress = Math.round((answers.filter(a => a).length / this.testData.sentences.length) * 100);

            await updateDoc(
                doc(this.db, 'tests', this.currentSession.testCode, 'participants', this.currentSession.participantId),
                {
                    answers: answers,
                    progress: progress,
                    lastUpdated: serverTimestamp(),
                    lastAccess: serverTimestamp()
                }
            );

            return true;
        } catch (error) {
            console.error('답안 저장 오류:', error);
            throw error;
        }
    }

    // 진행 상황 저장
    async saveProgress(answers) {
        if (!this.currentSession) {
            throw new Error('세션이 없습니다.');
        }

        try {
            const progress = Math.round((answers.length / this.testData.sentences.length) * 100);

            await updateDoc(
                doc(this.db, 'tests', this.currentSession.testCode, 'participants', this.currentSession.participantId),
                {
                    answers: answers,
                    progress: progress,
                    lastUpdated: serverTimestamp(),
                    lastAccess: serverTimestamp()
                }
            );

            return true;
        } catch (error) {
            console.error('진행 상황 저장 오류:', error);
            throw error;
        }
    }

    // 테스트 완료 및 제출
    async submitTest(answers, isForced = false) {
        if (!this.currentSession) {
            throw new Error('세션이 없습니다.');
        }

        try {
            // 최종 점수 계산
            const { finalScore, correctCount } = this.calculateFinalScore(answers);
            
            // 소요 시간 계산 (분 단위)
            const duration = this.calculateTestDuration();

            const updateData = {
                status: 'completed',
                answers: answers,
                finalScore: finalScore,
                correctAnswers: correctCount,
                completedAt: serverTimestamp(),
                duration: duration,
                isForced: isForced,
                lastAccess: serverTimestamp()
            };

            await updateDoc(
                doc(this.db, 'tests', this.currentSession.testCode, 'participants', this.currentSession.participantId),
                updateData
            );

            return {
                finalScore: finalScore,
                correctCount: correctCount,
                duration: duration
            };
        } catch (error) {
            console.error('테스트 제출 오류:', error);
            throw error;
        }
    }

    // 최종 점수 계산
    calculateFinalScore(answers) {
        if (!answers || answers.length === 0) {
            return { finalScore: 0, correctCount: 0 };
        }

        let totalScore = 0;
        let correctCount = 0;

        answers.forEach(answer => {
            if (answer) {
                totalScore += answer.score || 0;
                if (answer.isCorrect) {
                    correctCount++;
                }
            }
        });

        const finalScore = Math.round(totalScore / this.testData.sentences.length);
        
        return { finalScore, correctCount };
    }

    // 테스트 소요 시간 계산
    calculateTestDuration() {
        if (!this.participantData?.startedAt) {
            return 0;
        }

        const startTime = this.participantData.startedAt.toDate();
        const endTime = new Date();
        const durationMs = endTime - startTime;
        
        return Math.round(durationMs / 60000); // 분 단위
    }

    // 답안 채점
    scoreAnswer(userAnswer, correctAnswer, settings = {}) {
        // 기본 설정
        const caseSensitive = settings.caseSensitive || false;
        const strictPunctuation = settings.strictPunctuation || false;
        
        let processedUser = userAnswer.trim();
        let processedCorrect = correctAnswer.trim();
        
        // 대소문자 처리
        if (!caseSensitive) {
            processedUser = processedUser.toLowerCase();
            processedCorrect = processedCorrect.toLowerCase();
        }
        
        // 구두점 처리
        if (!strictPunctuation) {
            const punctuationRegex = /[.,!?;:'"()\-\s]+/g;
            processedUser = processedUser.replace(punctuationRegex, ' ').replace(/\s+/g, ' ').trim();
            processedCorrect = processedCorrect.replace(punctuationRegex, ' ').replace(/\s+/g, ' ').trim();
        }
        
        // 정확한 일치 확인
        if (processedUser === processedCorrect) {
            return {
                score: 100,
                isCorrect: true,
                feedback: '정답입니다!'
            };
        }
        
        // 부분 점수 계산 (단어 단위)
        const userWords = processedUser.split(/\s+/);
        const correctWords = processedCorrect.split(/\s+/);
        
        let correctWordCount = 0;
        const maxLength = Math.max(userWords.length, correctWords.length);
        
        // 단어별 매칭
        const matchDetails = [];
        for (let i = 0; i < correctWords.length; i++) {
            const correctWord = correctWords[i];
            const userWord = userWords[i] || '';
            
            if (correctWord === userWord) {
                correctWordCount++;
                matchDetails.push({ word: correctWord, status: 'correct' });
            } else {
                matchDetails.push({ word: correctWord, userWord: userWord, status: 'incorrect' });
            }
        }
        
        const score = Math.round((correctWordCount / correctWords.length) * 100);
        
        return {
            score: Math.max(0, score),
            isCorrect: score === 100,
            feedback: this.generateFeedback(score, matchDetails),
            details: matchDetails
        };
    }

    // 피드백 생성
    generateFeedback(score, matchDetails) {
        if (score === 100) return '정답입니다!';
        if (score >= 80) return '거의 정답입니다. 작은 차이가 있습니다.';
        if (score >= 60) return '부분적으로 맞습니다. 다시 한 번 확인해보세요.';
        if (score >= 40) return '일부분이 맞습니다. 문장을 다시 들어보세요.';
        return '다시 시도해보세요.';
    }

    // 상세 결과 분석
    analyzeResults() {
        if (!this.participantData?.answers) {
            return null;
        }

        const analysis = {
            overview: {
                totalQuestions: this.testData.sentences.length,
                answeredQuestions: this.participantData.answers.filter(a => a).length,
                correctAnswers: this.participantData.correctAnswers || 0,
                finalScore: this.participantData.finalScore || 0,
                duration: this.participantData.duration || 0
            },
            difficultyAnalysis: {},
            weakAreas: [],
            strengths: []
        };

        // 난이도별 분석
        this.testData.sentences.forEach((sentence, index) => {
            const difficulty = sentence.difficulty || 'medium';
            if (!analysis.difficultyAnalysis[difficulty]) {
                analysis.difficultyAnalysis[difficulty] = {
                    total: 0,
                    correct: 0,
                    averageScore: 0,
                    totalScore: 0
                };
            }

            analysis.difficultyAnalysis[difficulty].total++;
            
            const answer = this.participantData.answers[index];
            if (answer) {
                if (answer.isCorrect) {
                    analysis.difficultyAnalysis[difficulty].correct++;
                }
                analysis.difficultyAnalysis[difficulty].totalScore += answer.score || 0;
            }
        });

        // 평균 계산
        Object.keys(analysis.difficultyAnalysis).forEach(difficulty => {
            const data = analysis.difficultyAnalysis[difficulty];
            data.accuracy = Math.round((data.correct / data.total) * 100);
            data.averageScore = Math.round(data.totalScore / data.total);
        });

        // 약점/강점 분석
        Object.entries(analysis.difficultyAnalysis).forEach(([difficulty, data]) => {
            if (data.accuracy < 70) {
                analysis.weakAreas.push({
                    area: `${this.getDifficultyText(difficulty)} 난이도`,
                    accuracy: data.accuracy,
                    suggestion: `${this.getDifficultyText(difficulty)} 난이도 문제를 더 연습해보세요.`
                });
            } else if (data.accuracy >= 90) {
                analysis.strengths.push({
                    area: `${this.getDifficultyText(difficulty)} 난이도`,
                    accuracy: data.accuracy
                });
            }
        });

        return analysis;
    }

    // 결과 내보내기 데이터 생성
    generateResultExport() {
        if (!this.participantData) {
            return null;
        }

        const exportData = {
            studentInfo: {
                name: this.participantData.name,
                studentId: this.participantData.studentId
            },
            testInfo: {
                title: this.testData.title,
                testCode: this.currentSession.testCode,
                completedAt: this.participantData.completedAt?.toDate()?.toISOString()
            },
            results: {
                finalScore: this.participantData.finalScore,
                correctAnswers: this.participantData.correctAnswers,
                totalQuestions: this.testData.sentences.length,
                duration: this.participantData.duration
            },
            detailedAnswers: this.participantData.answers?.map((answer, index) => ({
                questionNumber: index + 1,
                question: this.testData.sentences[index]?.text,
                userAnswer: answer?.userAnswer,
                isCorrect: answer?.isCorrect,
                score: answer?.score,
                playCount: answer?.playCount
            })) || []
        };

        return exportData;
    }

    // 재시도 가능 여부 확인
    canRetry() {
        return this.testData?.settings?.allowRetries === true;
    }

    // 테스트 재시작
    async retryTest() {
        if (!this.canRetry()) {
            throw new Error('재시도가 허용되지 않습니다.');
        }

        try {
            await updateDoc(
                doc(this.db, 'tests', this.currentSession.testCode, 'participants', this.currentSession.participantId),
                {
                    status: 'joined',
                    answers: [],
                    progress: 0,
                    finalScore: null,
                    correctAnswers: null,
                    startedAt: null,
                    completedAt: null,
                    duration: null,
                    retryAt: serverTimestamp(),
                    lastAccess: serverTimestamp()
                }
            );

            return true;
        } catch (error) {
            console.error('테스트 재시작 오류:', error);
            throw error;
        }
    }

    // 유틸리티 함수들
    getDifficultyText(difficulty) {
        const map = { easy: '쉬움', medium: '보통', hard: '어려움' };
        return map[difficulty] || '보통';
    }

    formatTime(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('ko-KR');
    }

    // 로컬 스토리지에 임시 답안 저장 (오프라인 대비)
    saveTemporaryAnswer(questionIndex, answerData) {
        const tempData = JSON.parse(localStorage.getItem('tempAnswers') || '{}');
        if (!tempData[this.currentSession.testCode]) {
            tempData[this.currentSession.testCode] = {};
        }
        tempData[this.currentSession.testCode][questionIndex] = answerData;
        localStorage.setItem('tempAnswers', JSON.stringify(tempData));
    }

    // 임시 답안 로드
    loadTemporaryAnswers() {
        const tempData = JSON.parse(localStorage.getItem('tempAnswers') || '{}');
        return tempData[this.currentSession?.testCode] || {};
    }

    // 임시 답안 정리
    clearTemporaryAnswers() {
        const tempData = JSON.parse(localStorage.getItem('tempAnswers') || '{}');
        if (tempData[this.currentSession?.testCode]) {
            delete tempData[this.currentSession.testCode];
            localStorage.setItem('tempAnswers', JSON.stringify(tempData));
        }
    }
}

// 유틸리티 함수들
const StudentUtils = {
    // 입력 유효성 검사
    validateStudentInfo(studentInfo) {
        const errors = [];
        
        if (!studentInfo.name || studentInfo.name.trim().length < 2) {
            errors.push('이름은 2글자 이상 입력해주세요.');
        }
        
        if (!studentInfo.studentId || studentInfo.studentId.trim().length < 3) {
            errors.push('학번은 3자리 이상 입력해주세요.');
        }
        
        return errors;
    },

    // 테스트 코드 포맷팅
    formatTestCode(code) {
        return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    },

    // 진행률 계산
    calculateProgress(current, total) {
        if (total === 0) return 0;
        return Math.round((current / total) * 100);
    },

    // 시간 포맷팅 (MM:SS)
    formatTimeMMSS(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // 점수 색상 반환
    getScoreColor(score) {
        if (score >= 90) return 'text-green-600';
        if (score >= 80) return 'text-blue-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    },

    // 로컬 알림 표시
    showNotification(message, type = 'info') {
        // 브라우저 알림 API 사용
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('영어 받아쓰기', {
                body: message,
                icon: '/favicon.ico'
            });
        }
        
        // 페이지 내 알림도 표시
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        document.body.appendChild(alertDiv);
          setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
};

// StudentManager를 전역으로 노출
window.StudentManager = StudentManager;
