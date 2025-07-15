/**
 * 교사 기능 관련 JavaScript 모듈
 * 테스트 관리, 생성, 수정, 모니터링 등의 기능 제공
 */

class TeacherManager {
    constructor() {
        this.db = db; // firebase-config.js에서 초기화된 db 사용
        this.auth = auth; // firebase-config.js에서 초기화된 auth 사용
        this.currentUser = null;
        this.unsubscribers = [];
    }

    // 현재 사용자 설정
    setCurrentUser(user) {
        this.currentUser = user;
    }

    // 정리 함수
    cleanup() {
        this.unsubscribers.forEach(unsubscribe => unsubscribe());
        this.unsubscribers = [];
    }

    // 교사의 모든 테스트 목록 가져오기
    async getTeacherTests() {
        if (!this.currentUser) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            const testsQuery = this.db.collection('tests')
                .where('teacherId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc');

            const snapshot = await testsQuery.get();
            const tests = [];

            snapshot.forEach(doc => {
                tests.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return tests;
        } catch (error) {
            console.error('테스트 목록 로드 오류:', error);
            throw new Error('테스트 목록을 불러오는 중 오류가 발생했습니다.');
        }
    }

    // 특정 테스트 정보 가져오기
    async getTest(testCode) {
        try {
            const testDoc = await this.db.collection('tests').doc(testCode).get();
            
            if (!testDoc.exists) {
                throw new Error('테스트를 찾을 수 없습니다.');
            }

            const testData = testDoc.data();
            
            // 권한 확인
            if (testData.teacherId !== this.currentUser?.uid) {
                throw new Error('이 테스트에 접근할 권한이 없습니다.');
            }

            return {
                id: testDoc.id,
                ...testData
            };
        } catch (error) {
            console.error('테스트 로드 오류:', error);
            throw error;
        }
    }

    // 테스트 생성
    async createTest(testData) {
        if (!this.currentUser) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            // 기본 설정 적용
            const defaultSettings = {
                speakingRate: 1.0,
                voice: 'default',
                timeLimit: 30,
                caseSensitive: false,
                strictPunctuation: false,
                allowRetries: false,
                showResults: true
            };

            const testDoc = {
                title: testData.title || '새 테스트',
                description: testData.description || '',
                sentences: testData.sentences || [],
                settings: { ...defaultSettings, ...testData.settings },
                teacherId: this.currentUser.uid,
                teacherName: this.currentUser.displayName || this.currentUser.email,
                status: 'inactive',                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                participantCount: 0
            };

            // 테스트 코드 생성 및 저장
            const { generateTestCode } = await import('./test-code.js');
            const testCode = await generateTestCode(this.db);
            
            await this.db.collection('tests').doc(testCode).set(testDoc);            // 교사 문서에 테스트 코드 추가
            const userDocRef = this.db.collection('users').doc(this.currentUser.uid);
            await userDocRef.update({
                testCodes: firebase.firestore.FieldValue.arrayUnion(testCode)
            });

            return testCode;
        } catch (error) {
            console.error('테스트 생성 오류:', error);
            throw new Error('테스트 생성 중 오류가 발생했습니다.');
        }
    }

    // 테스트 업데이트
    async updateTest(testCode, updateData) {
        if (!this.currentUser) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            // 권한 확인
            const testData = await this.getTest(testCode);
            
            const updatedData = {
                ...updateData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.db.collection('tests').doc(testCode).update(updatedData);
            
            return true;
        } catch (error) {
            console.error('테스트 업데이트 오류:', error);
            throw error;
        }
    }

    // 테스트 삭제
    async deleteTest(testCode) {
        if (!this.currentUser) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            // 권한 확인
            await this.getTest(testCode);

            // 참여자 데이터도 함께 삭제
            const participantsQuery = query(
                collection(this.db, 'tests', testCode, 'participants')
            );
            const participantsSnapshot = await getDocs(participantsQuery);
              const deletePromises = [];
            participantsSnapshot.forEach(doc => {
                deletePromises.push(doc.ref.delete());
            });
            
            // 병렬 삭제
            await Promise.all(deletePromises);
            
            // 테스트 문서 삭제
            await this.db.collection('tests').doc(testCode).delete();

            // 교사 문서에서 테스트 코드 제거
            const userDocRef = this.db.collection('users').doc(this.currentUser.uid);
            await userDocRef.update({
                testCodes: firebase.firestore.FieldValue.arrayRemove(testCode)
            });

            return true;
        } catch (error) {
            console.error('테스트 삭제 오류:', error);
            throw error;
        }
    }

    // 테스트 상태 토글 (활성/비활성)
    async toggleTestStatus(testCode) {
        try {
            const testData = await this.getTest(testCode);
            const newStatus = testData.status === 'active' ? 'inactive' : 'active';
            
            await this.updateTest(testCode, { status: newStatus });
            
            return newStatus;
        } catch (error) {
            console.error('테스트 상태 변경 오류:', error);
            throw error;
        }
    }

    // 테스트 참여자 목록 가져오기
    async getParticipants(testCode) {
        try {
            // 권한 확인
            await this.getTest(testCode);

            const participantsQuery = query(
                collection(this.db, 'tests', testCode, 'participants'),
                orderBy('joinedAt', 'desc')
            );

            const snapshot = await getDocs(participantsQuery);
            const participants = [];

            snapshot.forEach(doc => {
                participants.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return participants;
        } catch (error) {
            console.error('참여자 목록 로드 오류:', error);
            throw error;
        }
    }

    // 실시간 참여자 모니터링 시작
    startParticipantMonitoring(testCode, callback) {
        try {
            const participantsQuery = query(
                collection(this.db, 'tests', testCode, 'participants'),
                orderBy('joinedAt', 'desc')
            );

            const unsubscribe = onSnapshot(participantsQuery, (snapshot) => {
                const participants = [];
                snapshot.forEach(doc => {
                    participants.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                callback(participants);
            }, (error) => {
                console.error('실시간 모니터링 오류:', error);
                callback(null, error);
            });

            this.unsubscribers.push(unsubscribe);
            return unsubscribe;
        } catch (error) {
            console.error('모니터링 시작 오류:', error);
            throw error;
        }
    }

    // 테스트 통계 계산
    calculateTestStatistics(participants) {
        const stats = {
            total: participants.length,
            joined: 0,
            inProgress: 0,
            completed: 0,
            averageScore: 0,
            completionRate: 0
        };

        let totalScore = 0;
        let completedCount = 0;

        participants.forEach(participant => {
            switch (participant.status) {
                case 'joined':
                    stats.joined++;
                    break;
                case 'in-progress':
                    stats.inProgress++;
                    break;
                case 'completed':
                    stats.completed++;
                    completedCount++;
                    if (participant.finalScore !== undefined) {
                        totalScore += participant.finalScore;
                    }
                    break;
            }
        });

        if (completedCount > 0) {
            stats.averageScore = Math.round(totalScore / completedCount);
        }

        if (stats.total > 0) {
            stats.completionRate = Math.round((stats.completed / stats.total) * 100);
        }

        return stats;
    }

    // 테스트 결과 내보내기 데이터 생성
    generateExportData(testData, participants) {
        const exportData = {
            testInfo: {
                title: testData.title,
                description: testData.description,
                createdAt: testData.createdAt,
                totalQuestions: testData.sentences?.length || 0
            },
            summary: this.calculateTestStatistics(participants),
            participants: participants.map(participant => ({
                name: participant.name,
                studentId: participant.studentId,
                status: participant.status,
                joinedAt: participant.joinedAt,
                startedAt: participant.startedAt,
                completedAt: participant.completedAt,
                finalScore: participant.finalScore,
                correctAnswers: participant.correctAnswers,
                duration: participant.duration,
                progress: participant.progress || 0,
                answers: participant.answers || []
            }))
        };

        return exportData;
    }

    // CSV 형식으로 결과 내보내기
    exportToCSV(testData, participants) {
        const headers = [
            '이름', '학번', '상태', '최종점수', '정답수', '진행률(%)', 
            '참여시간', '시작시간', '완료시간', '소요시간(분)'
        ];

        const rows = participants.map(participant => {
            const joinTime = participant.joinedAt?.toDate()?.toLocaleString('ko-KR') || '';
            const startTime = participant.startedAt?.toDate()?.toLocaleString('ko-KR') || '';
            const completeTime = participant.completedAt?.toDate()?.toLocaleString('ko-KR') || '';
            const duration = participant.duration || 0;

            return [
                participant.name || '',
                participant.studentId || '',
                this.getStatusText(participant.status),
                participant.finalScore !== undefined ? participant.finalScore + '%' : '',
                participant.correctAnswers || 0,
                participant.progress || 0,
                joinTime,
                startTime,
                completeTime,
                duration
            ];
        });

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // 상태 텍스트 변환
    getStatusText(status) {
        const statusMap = {
            'joined': '참여',
            'in-progress': '진행 중',
            'completed': '완료'
        };
        return statusMap[status] || '알 수 없음';
    }

    // 테스트 복제
    async duplicateTest(testCode, newTitle) {
        try {
            const originalTest = await this.getTest(testCode);
            
            // 새 테스트 데이터 준비
            const newTestData = {
                title: newTitle || `${originalTest.title} (복사본)`,
                description: originalTest.description,
                sentences: [...originalTest.sentences],
                settings: { ...originalTest.settings }
            };

            // 새 테스트 생성
            const newTestCode = await this.createTest(newTestData);
            
            return newTestCode;
        } catch (error) {
            console.error('테스트 복제 오류:', error);
            throw error;
        }
    }

    // 대량 참여자 추가 (CSV 파일에서)
    async addParticipantsFromCSV(testCode, csvData) {
        try {
            const lines = csvData.split('\n');
            const participants = [];

            // 첫 번째 줄은 헤더로 가정하고 건너뜀
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const [studentId, name] = line.split(',').map(field => field.trim().replace(/"/g, ''));
                
                if (studentId && name) {
                    participants.push({
                        studentId: studentId,
                        name: name,
                        status: 'joined',
                        joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        progress: 0
                    });
                }
            }            // Firestore에 추가
            const batch = this.db.batch();
            participants.forEach(participant => {
                const participantRef = this.db.collection('tests').doc(testCode).collection('participants').doc();
                batch.set(participantRef, participant);
            });

            await batch.commit();
            
            return participants.length;
        } catch (error) {
            console.error('대량 참여자 추가 오류:', error);
            throw error;
        }
    }

    // 테스트 미리보기 데이터 생성
    generatePreviewData(testData) {
        const preview = {
            basicInfo: {
                title: testData.title || '제목 없음',
                description: testData.description || '설명 없음',
                questionCount: testData.sentences?.length || 0,
                timeLimit: testData.settings?.timeLimit || 30,
                status: testData.status || 'inactive'
            },
            settings: {
                speakingRate: testData.settings?.speakingRate || 1.0,
                voice: testData.settings?.voice || 'default',
                caseSensitive: testData.settings?.caseSensitive || false,
                strictPunctuation: testData.settings?.strictPunctuation || false,
                allowRetries: testData.settings?.allowRetries || false,
                showResults: testData.settings?.showResults !== false
            },
            sentences: testData.sentences?.map((sentence, index) => ({
                number: index + 1,
                text: sentence.text,
                difficulty: sentence.difficulty || 'medium',
                difficultyText: this.getDifficultyText(sentence.difficulty)
            })) || []
        };

        return preview;
    }

    // 난이도 텍스트 변환
    getDifficultyText(difficulty) {
        const map = { easy: '쉬움', medium: '보통', hard: '어려움' };
        return map[difficulty] || '보통';
    }

    // 테스트 검색
    async searchTests(searchTerm) {
        if (!this.currentUser) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            const tests = await this.getTeacherTests();
            
            if (!searchTerm) return tests;

            const filtered = tests.filter(test => 
                test.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                test.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                test.id?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            return filtered;
        } catch (error) {
            console.error('테스트 검색 오류:', error);
            throw error;
        }
    }

    // 테스트 분석 데이터 생성
    generateAnalyticsData(testData, participants) {
        const analytics = {
            overview: this.calculateTestStatistics(participants),
            difficultyAnalysis: this.analyzeDifficultyPerformance(testData, participants),
            timeAnalysis: this.analyzeTimeSpent(participants),
            questionAnalysis: this.analyzeQuestionPerformance(testData, participants)
        };

        return analytics;
    }

    // 난이도별 성능 분석
    analyzeDifficultyPerformance(testData, participants) {
        const difficultyStats = {};

        testData.sentences?.forEach((sentence, index) => {
            const difficulty = sentence.difficulty || 'medium';
            if (!difficultyStats[difficulty]) {
                difficultyStats[difficulty] = {
                    total: 0,
                    correct: 0,
                    totalScore: 0,
                    questions: []
                };
            }

            difficultyStats[difficulty].total++;
            difficultyStats[difficulty].questions.push(index);

            participants.forEach(participant => {
                const answer = participant.answers?.[index];
                if (answer) {
                    if (answer.isCorrect) {
                        difficultyStats[difficulty].correct++;
                    }
                    difficultyStats[difficulty].totalScore += answer.score || 0;
                }
            });
        });

        // 통계 계산
        Object.keys(difficultyStats).forEach(difficulty => {
            const stats = difficultyStats[difficulty];
            const totalAttempts = participants.length * stats.total;
            
            stats.accuracy = totalAttempts > 0 ? Math.round((stats.correct / totalAttempts) * 100) : 0;
            stats.averageScore = totalAttempts > 0 ? Math.round(stats.totalScore / totalAttempts) : 0;
        });

        return difficultyStats;
    }

    // 시간 분석
    analyzeTimeSpent(participants) {
        const completedParticipants = participants.filter(p => p.status === 'completed' && p.duration);
        
        if (completedParticipants.length === 0) {
            return { average: 0, min: 0, max: 0, distribution: {} };
        }

        const durations = completedParticipants.map(p => p.duration);
        
        const analysis = {
            average: Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length),
            min: Math.min(...durations),
            max: Math.max(...durations),
            distribution: {}
        };

        // 시간 분포 계산 (5분 단위)
        durations.forEach(duration => {
            const range = Math.floor(duration / 5) * 5;
            const key = `${range}-${range + 4}분`;
            analysis.distribution[key] = (analysis.distribution[key] || 0) + 1;
        });

        return analysis;
    }

    // 문제별 성능 분석
    analyzeQuestionPerformance(testData, participants) {
        const questionStats = [];

        testData.sentences?.forEach((sentence, index) => {
            const stats = {
                questionNumber: index + 1,
                text: sentence.text,
                difficulty: sentence.difficulty || 'medium',
                totalAttempts: 0,
                correctAnswers: 0,
                averageScore: 0,
                averagePlayCount: 0
            };

            let totalScore = 0;
            let totalPlayCount = 0;

            participants.forEach(participant => {
                const answer = participant.answers?.[index];
                if (answer) {
                    stats.totalAttempts++;
                    if (answer.isCorrect) {
                        stats.correctAnswers++;
                    }
                    totalScore += answer.score || 0;
                    totalPlayCount += answer.playCount || 0;
                }
            });

            if (stats.totalAttempts > 0) {
                stats.accuracy = Math.round((stats.correctAnswers / stats.totalAttempts) * 100);
                stats.averageScore = Math.round(totalScore / stats.totalAttempts);
                stats.averagePlayCount = Math.round((totalPlayCount / stats.totalAttempts) * 10) / 10;
            }

            questionStats.push(stats);
        });

        return questionStats;
    }
}

// 유틸리티 함수들
const TeacherUtils = {
    // 시간 포맷팅
    formatTime(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('ko-KR');
    },

    // 파일 다운로드
    downloadFile(content, filename, contentType = 'text/plain') {
        const blob = new Blob([content], { type: contentType });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    },

    // 알림 표시
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    },

    // 로딩 상태 관리
    setLoadingState(elementId, isLoading) {
        const element = document.getElementById(elementId);
        if (element) {
            if (isLoading) {
                element.disabled = true;
                element.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>처리 중...';
            } else {
                element.disabled = false;
                // 원래 텍스트 복원 (data-original-text 속성 사용)
                const originalText = element.dataset.originalText;
                if (originalText) {
                    element.innerHTML = originalText;
                }
            }
        }
    }
};

// TeacherManager를 전역으로 노출
window.TeacherManager = TeacherManager;
