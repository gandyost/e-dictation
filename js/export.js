/**
 * 데이터 내보내기 유틸리티
 * CSV, Excel, PDF 형식으로 테스트 결과 내보내기
 */

class DataExporter {
    constructor() {
        this.testData = null;
        this.participantsData = null;
        this.resultsData = null;
    }

    // 데이터 설정
    setData(testData, participantsData, resultsData) {
        this.testData = testData;
        this.participantsData = participantsData;
        this.resultsData = resultsData;
    }

    // CSV 형식으로 내보내기
    exportToCSV(format = 'summary') {
        let csvContent = '';
        let filename = '';

        switch (format) {
            case 'summary':
                csvContent = this.generateSummaryCSV();
                filename = `test_summary_${this.testData.testCode}_${this.getCurrentDateString()}.csv`;
                break;
            case 'detailed':
                csvContent = this.generateDetailedCSV();
                filename = `test_detailed_${this.testData.testCode}_${this.getCurrentDateString()}.csv`;
                break;
            case 'participants':
                csvContent = this.generateParticipantsCSV();
                filename = `participants_${this.testData.testCode}_${this.getCurrentDateString()}.csv`;
                break;
            default:
                throw new Error('지원되지 않는 내보내기 형식입니다.');
        }

        this.downloadCSV(csvContent, filename);
    }

    // 요약 CSV 생성
    generateSummaryCSV() {
        const headers = [
            '학번', '이름', '총점', '정답수', '총문항수', '정답률(%)', 
            '소요시간(분)', '평균응답시간(초)', '상태', '참여시간', '완료시간'
        ];

        let csvContent = '\uFEFF' + headers.join(',') + '\n'; // UTF-8 BOM 추가

        Object.entries(this.participantsData).forEach(([participantId, participant]) => {
            const results = this.getParticipantResults(participantId);
            const stats = this.calculateParticipantStats(results);

            const row = [
                this.escapeCSVField(participant.studentId || ''),
                this.escapeCSVField(participant.name || ''),
                stats.totalScore.toFixed(1),
                stats.correctAnswers,
                stats.totalQuestions,
                stats.accuracyRate.toFixed(1),
                stats.totalTimeMinutes.toFixed(1),
                stats.averageTimePerQuestion.toFixed(1),
                this.getStatusText(participant.status),
                this.formatDateTime(participant.joinedAt),
                this.formatDateTime(participant.completedAt)
            ];

            csvContent += row.join(',') + '\n';
        });

        return csvContent;
    }

    // 상세 CSV 생성
    generateDetailedCSV() {
        const headers = [
            '학번', '이름', '문제번호', '문제내용', '정답', '학생답안', 
            '점수', '정답여부', '응답시간(초)', '재생횟수', '난이도', '카테고리'
        ];

        let csvContent = '\uFEFF' + headers.join(',') + '\n';

        Object.entries(this.participantsData).forEach(([participantId, participant]) => {
            const results = this.getParticipantResults(participantId);

            results.forEach((result, index) => {
                const sentence = this.testData.sentences.find(s => s.id === result.sentenceId);
                
                const row = [
                    this.escapeCSVField(participant.studentId || ''),
                    this.escapeCSVField(participant.name || ''),
                    result.sentenceOrder || (index + 1),
                    this.escapeCSVField(sentence ? sentence.text : ''),
                    this.escapeCSVField(result.correctAnswer || ''),
                    this.escapeCSVField(result.userInput || ''),
                    result.score || 0,
                    result.score === 100 ? '정답' : '오답',
                    result.timeTaken || 0,
                    result.playCount || 0,
                    sentence ? sentence.difficulty : '',
                    sentence ? sentence.category : ''
                ];

                csvContent += row.join(',') + '\n';
            });
        });

        return csvContent;
    }

    // 참여자 CSV 생성
    generateParticipantsCSV() {
        const headers = [
            '학번', '이름', '상태', '진행률(%)', '현재문제', '총점', 
            '참여시간', '시작시간', '완료시간', '소요시간(분)'
        ];

        let csvContent = '\uFEFF' + headers.join(',') + '\n';

        Object.entries(this.participantsData).forEach(([participantId, participant]) => {
            const progress = this.calculateProgress(participantId);
            const duration = this.calculateDuration(participant);

            const row = [
                this.escapeCSVField(participant.studentId || ''),
                this.escapeCSVField(participant.name || ''),
                this.getStatusText(participant.status),
                progress.percentage.toFixed(1),
                progress.currentQuestion,
                participant.totalScore || 0,
                this.formatDateTime(participant.joinedAt),
                this.formatDateTime(participant.startedAt),
                this.formatDateTime(participant.completedAt),
                duration.toFixed(1)
            ];

            csvContent += row.join(',') + '\n';
        });

        return csvContent;
    }

    // Excel 형식으로 내보내기 (간단한 HTML 테이블 형식)
    exportToExcel(format = 'summary') {
        let htmlContent = '';
        let filename = '';

        switch (format) {
            case 'summary':
                htmlContent = this.generateSummaryHTML();
                filename = `test_summary_${this.testData.testCode}_${this.getCurrentDateString()}.xls`;
                break;
            case 'detailed':
                htmlContent = this.generateDetailedHTML();
                filename = `test_detailed_${this.testData.testCode}_${this.getCurrentDateString()}.xls`;
                break;
            default:
                throw new Error('지원되지 않는 내보내기 형식입니다.');
        }

        this.downloadHTML(htmlContent, filename);
    }

    // 요약 HTML 테이블 생성
    generateSummaryHTML() {
        let html = `
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .number { text-align: right; }
                </style>
            </head>
            <body>
                <h2>${this.testData.title} - 결과 요약</h2>
                <p>테스트 코드: ${this.testData.testCode}</p>
                <p>생성일: ${this.formatDateTime(this.testData.createdAt)}</p>
                <p>내보내기 일시: ${this.formatDateTime(new Date())}</p>
                
                <table>
                    <thead>
                        <tr>
                            <th>학번</th>
                            <th>이름</th>
                            <th>총점</th>
                            <th>정답수</th>
                            <th>총문항수</th>
                            <th>정답률(%)</th>
                            <th>소요시간(분)</th>
                            <th>상태</th>
                            <th>완료시간</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        Object.entries(this.participantsData).forEach(([participantId, participant]) => {
            const results = this.getParticipantResults(participantId);
            const stats = this.calculateParticipantStats(results);

            html += `
                <tr>
                    <td>${participant.studentId || ''}</td>
                    <td>${participant.name || ''}</td>
                    <td class="number">${stats.totalScore.toFixed(1)}</td>
                    <td class="number">${stats.correctAnswers}</td>
                    <td class="number">${stats.totalQuestions}</td>
                    <td class="number">${stats.accuracyRate.toFixed(1)}%</td>
                    <td class="number">${stats.totalTimeMinutes.toFixed(1)}</td>
                    <td>${this.getStatusText(participant.status)}</td>
                    <td>${this.formatDateTime(participant.completedAt)}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        return html;
    }

    // PDF 내보내기 (html2canvas + jsPDF 사용)
    async exportToPDF(element, filename) {
        try {
            // html2canvas가 로드되어 있는지 확인
            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvas 라이브러리가 필요합니다.');
            }

            // jsPDF 동적 로드
            if (typeof window.jspdf === 'undefined') {
                await this.loadJsPDF();
            }

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new window.jspdf.jsPDF();
            
            const imgWidth = 190;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 10;

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(filename || `test_result_${this.getCurrentDateString()}.pdf`);
        } catch (error) {
            console.error('PDF 내보내기 오류:', error);
            throw error;
        }
    }

    // 통계 데이터 생성
    generateStatistics() {
        const stats = {
            overview: {
                totalParticipants: Object.keys(this.participantsData).length,
                completedParticipants: 0,
                inProgressParticipants: 0,
                averageScore: 0,
                averageCompletionTime: 0
            },
            scoreDistribution: {
                excellent: 0, // 90-100%
                good: 0,      // 80-89%
                fair: 0,      // 70-79%
                poor: 0       // 0-69%
            },
            difficultyAnalysis: {},
            questionAnalysis: []
        };

        let totalScore = 0;
        let totalTime = 0;
        let completedCount = 0;

        // 참여자별 통계 계산
        Object.entries(this.participantsData).forEach(([participantId, participant]) => {
            if (participant.status === 'completed') {
                stats.overview.completedParticipants++;
                completedCount++;

                const participantStats = this.calculateParticipantStats(
                    this.getParticipantResults(participantId)
                );

                totalScore += participantStats.totalScore;
                totalTime += participantStats.totalTimeMinutes;

                // 점수 분포
                if (participantStats.totalScore >= 90) stats.scoreDistribution.excellent++;
                else if (participantStats.totalScore >= 80) stats.scoreDistribution.good++;
                else if (participantStats.totalScore >= 70) stats.scoreDistribution.fair++;
                else stats.scoreDistribution.poor++;

            } else if (participant.status === 'in-progress') {
                stats.overview.inProgressParticipants++;
            }
        });

        // 평균 계산
        if (completedCount > 0) {
            stats.overview.averageScore = totalScore / completedCount;
            stats.overview.averageCompletionTime = totalTime / completedCount;
        }

        // 난이도별 분석
        stats.difficultyAnalysis = this.analyzeDifficultyPerformance();

        // 문제별 분석
        stats.questionAnalysis = this.analyzeQuestionPerformance();

        return stats;
    }

    // 유틸리티 메서드들
    escapeCSVField(field) {
        if (field === null || field === undefined) return '';
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    formatDateTime(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('ko-KR');
    }

    getCurrentDateString() {
        const now = new Date();
        return now.toISOString().split('T')[0].replace(/-/g, '');
    }

    getStatusText(status) {
        const statusMap = {
            'joined': '참여',
            'in-progress': '진행중',
            'completed': '완료',
            'abandoned': '중단'
        };
        return statusMap[status] || status;
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    downloadHTML(content, filename) {
        const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async loadJsPDF() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // 데이터 분석 메서드들
    getParticipantResults(participantId) {
        return this.resultsData.filter(result => result.studentId === participantId);
    }

    calculateParticipantStats(results) {
        const stats = {
            totalScore: 0,
            correctAnswers: 0,
            totalQuestions: results.length,
            accuracyRate: 0,
            totalTimeMinutes: 0,
            averageTimePerQuestion: 0
        };

        if (results.length === 0) return stats;

        let totalTime = 0;
        results.forEach(result => {
            stats.totalScore += result.score || 0;
            if (result.score === 100) stats.correctAnswers++;
            totalTime += result.timeTaken || 0;
        });

        stats.totalScore = stats.totalScore / results.length;
        stats.accuracyRate = (stats.correctAnswers / results.length) * 100;
        stats.totalTimeMinutes = totalTime / 60;
        stats.averageTimePerQuestion = totalTime / results.length;

        return stats;
    }

    calculateProgress(participantId) {
        const participant = this.participantsData[participantId];
        const results = this.getParticipantResults(participantId);
        const totalQuestions = this.testData.sentences.length;

        return {
            percentage: (results.length / totalQuestions) * 100,
            currentQuestion: results.length + 1,
            totalQuestions: totalQuestions
        };
    }

    calculateDuration(participant) {
        if (!participant.startedAt || !participant.completedAt) return 0;
        
        const start = participant.startedAt.toDate ? participant.startedAt.toDate() : new Date(participant.startedAt);
        const end = participant.completedAt.toDate ? participant.completedAt.toDate() : new Date(participant.completedAt);
        
        return (end - start) / (1000 * 60); // 분 단위
    }

    analyzeDifficultyPerformance() {
        const analysis = {};
        
        this.testData.sentences.forEach(sentence => {
            if (!analysis[sentence.difficulty]) {
                analysis[sentence.difficulty] = {
                    totalQuestions: 0,
                    totalScore: 0,
                    totalAnswers: 0,
                    averageScore: 0
                };
            }
            
            analysis[sentence.difficulty].totalQuestions++;
            
            const questionResults = this.resultsData.filter(result => result.sentenceId === sentence.id);
            questionResults.forEach(result => {
                analysis[sentence.difficulty].totalScore += result.score || 0;
                analysis[sentence.difficulty].totalAnswers++;
            });
        });

        // 평균 점수 계산
        Object.keys(analysis).forEach(difficulty => {
            const data = analysis[difficulty];
            if (data.totalAnswers > 0) {
                data.averageScore = data.totalScore / data.totalAnswers;
            }
        });

        return analysis;
    }

    analyzeQuestionPerformance() {
        const analysis = [];

        this.testData.sentences.forEach((sentence, index) => {
            const questionResults = this.resultsData.filter(result => result.sentenceId === sentence.id);
            
            let totalScore = 0;
            let correctAnswers = 0;
            let totalTime = 0;

            questionResults.forEach(result => {
                totalScore += result.score || 0;
                if (result.score === 100) correctAnswers++;
                totalTime += result.timeTaken || 0;
            });

            const questionAnalysis = {
                questionNumber: index + 1,
                sentenceText: sentence.text,
                difficulty: sentence.difficulty,
                category: sentence.category,
                totalAnswers: questionResults.length,
                correctAnswers: correctAnswers,
                averageScore: questionResults.length > 0 ? totalScore / questionResults.length : 0,
                accuracyRate: questionResults.length > 0 ? (correctAnswers / questionResults.length) * 100 : 0,
                averageTime: questionResults.length > 0 ? totalTime / questionResults.length : 0
            };

            analysis.push(questionAnalysis);
        });

        return analysis;
    }
}
