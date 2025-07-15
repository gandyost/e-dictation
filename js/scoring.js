/**
 * 받아쓰기 채점 시스템 JavaScript 모듈
 * 고급 채점 알고리즘 및 분석 기능 제공
 */

class ScoringEngine {
    constructor(options = {}) {
        this.options = {
            caseSensitive: false,
            strictPunctuation: false,
            allowPartialCredit: true,
            penalizeExtraWords: true,
            penalizeMissingWords: true,
            wordOrderImportance: 0.8,
            punctuationWeight: 0.1,
            spellingTolerance: 0.15,
            ...options
        };

        // 채점 가중치 설정
        this.weights = {
            exactMatch: 1.0,
            wordOrder: this.options.wordOrderImportance,
            spelling: 0.9,
            punctuation: this.options.punctuationWeight,
            grammar: 0.8
        };

        // 일반적인 줄임말 및 동의어 매핑
        this.synonyms = {
            "don't": "do not",
            "won't": "will not",
            "can't": "cannot",
            "isn't": "is not",
            "aren't": "are not",
            "wasn't": "was not",
            "weren't": "were not",
            "haven't": "have not",
            "hasn't": "has not",
            "hadn't": "had not",
            "shouldn't": "should not",
            "wouldn't": "would not",
            "couldn't": "could not",
            "mustn't": "must not",
            "needn't": "need not",
            "i'm": "i am",
            "you're": "you are",
            "he's": "he is",
            "she's": "she is",
            "it's": "it is",
            "we're": "we are",
            "they're": "they are",
            "i've": "i have",
            "you've": "you have",
            "we've": "we have",
            "they've": "they have",
            "i'll": "i will",
            "you'll": "you will",
            "he'll": "he will",
            "she'll": "she will",
            "it'll": "it will",
            "we'll": "we will",
            "they'll": "they will"
        };

        // 흔한 맞춤법 오류 패턴
        this.commonErrors = {
            "recieve": "receive",
            "seperate": "separate",
            "definately": "definitely",
            "occassion": "occasion",
            "accomodate": "accommodate",
            "occured": "occurred",
            "begining": "beginning",
            "sucessful": "successful"
        };
    }

    // 메인 채점 함수
    score(userAnswer, correctAnswer, difficulty = 'medium') {
        try {
            // 전처리
            const processedUser = this.preprocessText(userAnswer);
            const processedCorrect = this.preprocessText(correctAnswer);

            // 빈 답안 처리
            if (!processedUser.trim()) {
                return this.createScoreResult(0, false, "답안이 입력되지 않았습니다.", {
                    analysis: this.createEmptyAnalysis(correctAnswer)
                });
            }

            // 정확한 일치 확인
            if (processedUser === processedCorrect) {
                return this.createScoreResult(100, true, "완벽한 정답입니다!", {
                    analysis: this.createPerfectAnalysis(correctAnswer)
                });
            }

            // 단어 단위 분석
            const userWords = this.tokenize(processedUser);
            const correctWords = this.tokenize(processedCorrect);

            // 상세 분석 수행
            const analysis = this.performDetailedAnalysis(userWords, correctWords, userAnswer, correctAnswer);
            
            // 최종 점수 계산
            const finalScore = this.calculateFinalScore(analysis, difficulty);
            
            // 피드백 생성
            const feedback = this.generateFeedback(analysis, finalScore);

            return this.createScoreResult(finalScore, finalScore === 100, feedback, { analysis });

        } catch (error) {
            console.error('채점 오류:', error);
            return this.createScoreResult(0, false, "채점 중 오류가 발생했습니다.", {
                error: error.message
            });
        }
    }

    // 텍스트 전처리
    preprocessText(text) {
        let processed = text.trim();

        // 대소문자 처리
        if (!this.options.caseSensitive) {
            processed = processed.toLowerCase();
        }

        // 구두점 처리
        if (!this.options.strictPunctuation) {
            // 구두점을 공백으로 변경하고 연속된 공백 제거
            processed = processed.replace(/[.,!?;:'"()\[\]{}\-]/g, ' ');
        }

        // 연속된 공백을 하나로 통합
        processed = processed.replace(/\s+/g, ' ').trim();

        return processed;
    }

    // 텍스트 토큰화 (단어 분리)
    tokenize(text) {
        return text.split(/\s+/).filter(word => word.length > 0);
    }

    // 상세 분석 수행
    performDetailedAnalysis(userWords, correctWords, originalUser, originalCorrect) {
        const analysis = {
            userWords: userWords,
            correctWords: correctWords,
            totalWords: correctWords.length,
            userWordCount: userWords.length,
            exactMatches: 0,
            partialMatches: 0,
            missingWords: [],
            extraWords: [],
            misspelledWords: [],
            orderErrors: [],
            punctuationScore: 0,
            wordOrderScore: 0,
            spellingScore: 0,
            completenessScore: 0
        };

        // 1. 정확한 단어 매칭
        const matchResults = this.performWordMatching(userWords, correctWords);
        analysis.exactMatches = matchResults.exactMatches;
        analysis.partialMatches = matchResults.partialMatches;
        analysis.missingWords = matchResults.missingWords;
        analysis.extraWords = matchResults.extraWords;
        analysis.misspelledWords = matchResults.misspelledWords;

        // 2. 단어 순서 분석
        analysis.wordOrderScore = this.calculateWordOrderScore(userWords, correctWords);

        // 3. 철자 정확도 분석
        analysis.spellingScore = this.calculateSpellingScore(userWords, correctWords);

        // 4. 완성도 분석
        analysis.completenessScore = this.calculateCompletenessScore(userWords, correctWords);

        // 5. 구두점 분석 (필요한 경우)
        if (this.options.strictPunctuation) {
            analysis.punctuationScore = this.calculatePunctuationScore(originalUser, originalCorrect);
        }

        return analysis;
    }

    // 단어 매칭 수행
    performWordMatching(userWords, correctWords) {
        const result = {
            exactMatches: 0,
            partialMatches: 0,
            missingWords: [],
            extraWords: [],
            misspelledWords: []
        };

        const usedUserIndices = new Set();
        const usedCorrectIndices = new Set();

        // 1. 정확한 매칭
        correctWords.forEach((correctWord, correctIndex) => {
            const userIndex = userWords.findIndex((userWord, index) => 
                !usedUserIndices.has(index) && this.isExactMatch(userWord, correctWord)
            );

            if (userIndex !== -1) {
                result.exactMatches++;
                usedUserIndices.add(userIndex);
                usedCorrectIndices.add(correctIndex);
            }
        });

        // 2. 부분 매칭 (철자 오류, 동의어 등)
        correctWords.forEach((correctWord, correctIndex) => {
            if (usedCorrectIndices.has(correctIndex)) return;

            const userIndex = userWords.findIndex((userWord, index) => 
                !usedUserIndices.has(index) && this.isSimilarWord(userWord, correctWord)
            );

            if (userIndex !== -1) {
                result.partialMatches++;
                result.misspelledWords.push({
                    correct: correctWord,
                    user: userWords[userIndex],
                    similarity: this.calculateSimilarity(userWords[userIndex], correctWord)
                });
                usedUserIndices.add(userIndex);
                usedCorrectIndices.add(correctIndex);
            }
        });

        // 3. 누락된 단어 찾기
        correctWords.forEach((correctWord, index) => {
            if (!usedCorrectIndices.has(index)) {
                result.missingWords.push(correctWord);
            }
        });

        // 4. 추가된 단어 찾기
        userWords.forEach((userWord, index) => {
            if (!usedUserIndices.has(index)) {
                result.extraWords.push(userWord);
            }
        });

        return result;
    }

    // 정확한 매칭 확인
    isExactMatch(word1, word2) {
        // 기본 매칭
        if (word1 === word2) return true;

        // 동의어 및 줄임말 확인
        const expanded1 = this.expandContraction(word1);
        const expanded2 = this.expandContraction(word2);
        
        return expanded1 === expanded2;
    }

    // 유사한 단어 확인
    isSimilarWord(word1, word2) {
        if (word1 === word2) return true;

        // 동의어 확인
        if (this.expandContraction(word1) === this.expandContraction(word2)) return true;

        // 철자 유사도 확인
        const similarity = this.calculateSimilarity(word1, word2);
        return similarity >= (1 - this.options.spellingTolerance);
    }

    // 줄임말 확장
    expandContraction(word) {
        const lower = word.toLowerCase();
        return this.synonyms[lower] || word;
    }

    // 문자열 유사도 계산 (편집 거리 기반)
    calculateSimilarity(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;

        if (len1 === 0) return len2 === 0 ? 1 : 0;
        if (len2 === 0) return 0;

        const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));

        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // 삭제
                    matrix[i][j - 1] + 1,      // 삽입
                    matrix[i - 1][j - 1] + cost // 교체
                );
            }
        }

        const maxLen = Math.max(len1, len2);
        return (maxLen - matrix[len1][len2]) / maxLen;
    }

    // 단어 순서 점수 계산
    calculateWordOrderScore(userWords, correctWords) {
        if (userWords.length === 0 || correctWords.length === 0) return 0;

        let orderScore = 0;
        let matchedPairs = 0;

        for (let i = 0; i < Math.min(userWords.length, correctWords.length); i++) {
            if (this.isExactMatch(userWords[i], correctWords[i])) {
                orderScore += 1;
            } else if (this.isSimilarWord(userWords[i], correctWords[i])) {
                orderScore += 0.7;
            }
            matchedPairs++;
        }

        return matchedPairs > 0 ? (orderScore / matchedPairs) * 100 : 0;
    }

    // 철자 정확도 점수 계산
    calculateSpellingScore(userWords, correctWords) {
        if (correctWords.length === 0) return 100;

        let totalSimilarity = 0;
        let comparisons = 0;

        const maxLen = Math.max(userWords.length, correctWords.length);
        
        for (let i = 0; i < maxLen; i++) {
            const userWord = userWords[i] || '';
            const correctWord = correctWords[i] || '';
            
            if (correctWord) {
                totalSimilarity += this.calculateSimilarity(userWord, correctWord);
                comparisons++;
            }
        }

        return comparisons > 0 ? (totalSimilarity / comparisons) * 100 : 0;
    }

    // 완성도 점수 계산
    calculateCompletenessScore(userWords, correctWords) {
        if (correctWords.length === 0) return 100;

        const providedWords = Math.min(userWords.length, correctWords.length);
        return (providedWords / correctWords.length) * 100;
    }

    // 구두점 점수 계산
    calculatePunctuationScore(userText, correctText) {
        const userPunctuation = this.extractPunctuation(userText);
        const correctPunctuation = this.extractPunctuation(correctText);

        if (correctPunctuation.length === 0) return 100;

        let matches = 0;
        const maxLen = Math.max(userPunctuation.length, correctPunctuation.length);

        for (let i = 0; i < maxLen; i++) {
            if (userPunctuation[i] === correctPunctuation[i]) {
                matches++;
            }
        }

        return (matches / correctPunctuation.length) * 100;
    }

    // 구두점 추출
    extractPunctuation(text) {
        return text.match(/[.,!?;:'"()\[\]{}\-]/g) || [];
    }

    // 최종 점수 계산
    calculateFinalScore(analysis, difficulty) {
        let baseScore = 0;

        // 1. 기본 점수 (정확한 매칭 기준)
        if (analysis.totalWords > 0) {
            baseScore = (analysis.exactMatches / analysis.totalWords) * 100;
        }

        // 2. 부분 점수 추가
        if (this.options.allowPartialCredit && analysis.partialMatches > 0) {
            const partialCredit = (analysis.partialMatches / analysis.totalWords) * 50; // 부분 점수는 50%
            baseScore += partialCredit;
        }

        // 3. 단어 순서 보너스/페널티
        const orderBonus = (analysis.wordOrderScore / 100) * this.weights.wordOrder * 10;
        baseScore += orderBonus;

        // 4. 완성도 점수 반영
        const completenessWeight = 0.3;
        baseScore = baseScore * (1 - completenessWeight) + (analysis.completenessScore * completenessWeight);

        // 5. 구두점 점수 반영
        if (this.options.strictPunctuation) {
            const punctuationWeight = this.weights.punctuation;
            baseScore = baseScore * (1 - punctuationWeight) + (analysis.punctuationScore * punctuationWeight);
        }

        // 6. 추가/누락 단어 페널티
        if (this.options.penalizeExtraWords && analysis.extraWords.length > 0) {
            const extraPenalty = (analysis.extraWords.length / analysis.totalWords) * 10;
            baseScore -= extraPenalty;
        }

        if (this.options.penalizeMissingWords && analysis.missingWords.length > 0) {
            const missingPenalty = (analysis.missingWords.length / analysis.totalWords) * 15;
            baseScore -= missingPenalty;
        }

        // 7. 난이도 조정
        baseScore = this.applyDifficultyAdjustment(baseScore, difficulty);

        // 8. 점수 범위 제한 (0-100)
        return Math.max(0, Math.min(100, Math.round(baseScore)));
    }

    // 난이도 조정 적용
    applyDifficultyAdjustment(score, difficulty) {
        const adjustments = {
            'easy': 1.05,    // 5% 보너스
            'medium': 1.0,   // 조정 없음
            'hard': 0.95     // 5% 엄격
        };

        return score * (adjustments[difficulty] || 1.0);
    }

    // 피드백 생성
    generateFeedback(analysis, score) {
        const feedbacks = [];

        // 점수별 기본 피드백
        if (score === 100) {
            return "완벽한 정답입니다! 훌륭해요! 🎉";
        } else if (score >= 90) {
            feedbacks.push("거의 완벽합니다! 좋은 실력이에요! 👏");
        } else if (score >= 80) {
            feedbacks.push("잘했어요! 조금만 더 주의하면 완벽할 것 같아요.");
        } else if (score >= 70) {
            feedbacks.push("괜찮은 답안이에요. 조금 더 집중해보세요.");
        } else if (score >= 60) {
            feedbacks.push("부분적으로 맞습니다. 다시 한 번 들어보세요.");
        } else if (score >= 40) {
            feedbacks.push("일부분이 맞습니다. 문장을 천천히 다시 들어보세요.");
        } else {
            feedbacks.push("다시 시도해보세요. 집중해서 들어보세요.");
        }

        // 구체적인 문제점 피드백
        if (analysis.missingWords.length > 0) {
            feedbacks.push(`누락된 단어: ${analysis.missingWords.slice(0, 3).join(', ')}${analysis.missingWords.length > 3 ? ' 등' : ''}`);
        }

        if (analysis.misspelledWords.length > 0) {
            const topErrors = analysis.misspelledWords.slice(0, 2);
            feedbacks.push(`철자 확인: ${topErrors.map(err => `'${err.user}' → '${err.correct}'`).join(', ')}`);
        }

        if (analysis.extraWords.length > 0) {
            feedbacks.push(`불필요한 단어가 포함되었습니다: ${analysis.extraWords.slice(0, 2).join(', ')}`);
        }

        if (analysis.wordOrderScore < 70) {
            feedbacks.push("단어 순서를 확인해보세요.");
        }

        return feedbacks.join(' ');
    }

    // 점수 결과 객체 생성
    createScoreResult(score, isCorrect, feedback, additionalData = {}) {
        return {
            score: score,
            isCorrect: isCorrect,
            feedback: feedback,
            timestamp: new Date().toISOString(),
            ...additionalData
        };
    }

    // 빈 답안 분석 생성
    createEmptyAnalysis(correctAnswer) {
        const correctWords = this.tokenize(this.preprocessText(correctAnswer));
        return {
            userWords: [],
            correctWords: correctWords,
            totalWords: correctWords.length,
            userWordCount: 0,
            exactMatches: 0,
            partialMatches: 0,
            missingWords: correctWords,
            extraWords: [],
            misspelledWords: [],
            wordOrderScore: 0,
            spellingScore: 0,
            completenessScore: 0
        };
    }

    // 완벽한 답안 분석 생성
    createPerfectAnalysis(correctAnswer) {
        const correctWords = this.tokenize(this.preprocessText(correctAnswer));
        return {
            userWords: correctWords,
            correctWords: correctWords,
            totalWords: correctWords.length,
            userWordCount: correctWords.length,
            exactMatches: correctWords.length,
            partialMatches: 0,
            missingWords: [],
            extraWords: [],
            misspelledWords: [],
            wordOrderScore: 100,
            spellingScore: 100,
            completenessScore: 100
        };
    }

    // 설정 업데이트
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }

    // 채점 통계 생성
    generateStatistics(scoreResults) {
        if (!Array.isArray(scoreResults) || scoreResults.length === 0) {
            return null;
        }

        const scores = scoreResults.map(result => result.score);
        const correctCount = scoreResults.filter(result => result.isCorrect).length;

        return {
            totalQuestions: scoreResults.length,
            correctAnswers: correctCount,
            accuracy: Math.round((correctCount / scoreResults.length) * 100),
            averageScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            scoreDistribution: this.calculateScoreDistribution(scores)
        };
    }

    // 점수 분포 계산
    calculateScoreDistribution(scores) {
        const ranges = {
            '90-100': 0,
            '80-89': 0,
            '70-79': 0,
            '60-69': 0,
            '0-59': 0
        };

        scores.forEach(score => {
            if (score >= 90) ranges['90-100']++;
            else if (score >= 80) ranges['80-89']++;
            else if (score >= 70) ranges['70-79']++;
            else if (score >= 60) ranges['60-69']++;
            else ranges['0-59']++;
        });

        return ranges;
    }
}

// 고급 채점 분석기
class AdvancedScorer extends ScoringEngine {
    constructor(options = {}) {
        super(options);
        
        // 고급 옵션
        this.advancedOptions = {
            useAI: false,
            contextAware: true,
            semanticAnalysis: false,
            ...options.advanced
        };
    }

    // 문맥 인식 채점
    scoreWithContext(userAnswer, correctAnswer, context = {}) {
        const basicResult = this.score(userAnswer, correctAnswer, context.difficulty);
        
        if (this.advancedOptions.contextAware) {
            // 문맥 정보를 활용한 추가 분석
            const contextBonus = this.calculateContextBonus(userAnswer, correctAnswer, context);
            basicResult.score = Math.min(100, basicResult.score + contextBonus);
            
            if (contextBonus > 0) {
                basicResult.feedback += ` (문맥 보너스: +${contextBonus}점)`;
            }
        }
        
        return basicResult;
    }

    // 문맥 보너스 계산
    calculateContextBonus(userAnswer, correctAnswer, context) {
        let bonus = 0;
        
        // 이전 문제들의 성과를 고려
        if (context.previousScores && context.previousScores.length > 0) {
            const recentAverage = context.previousScores.slice(-3).reduce((sum, score) => sum + score, 0) / Math.min(3, context.previousScores.length);
            if (recentAverage < 60) {
                bonus += 2; // 어려움을 겪고 있는 학생에게 보너스
            }
        }
        
        // 문제 순서 고려 (후반부 문제일수록 약간의 보너스)
        if (context.questionIndex && context.totalQuestions) {
            const progress = context.questionIndex / context.totalQuestions;
            if (progress > 0.7) {
                bonus += 1;
            }
        }
        
        return bonus;
    }

    // 의미적 유사도 분석 (기본 구현)
    analyzeSemanticSimilarity(userAnswer, correctAnswer) {
        // 실제 구현에서는 더 정교한 자연어 처리 라이브러리 사용
        const userWords = this.tokenize(this.preprocessText(userAnswer));
        const correctWords = this.tokenize(this.preprocessText(correctAnswer));
        
        // 단어 집합의 교집합 비율로 간단한 의미적 유사도 계산
        const userSet = new Set(userWords);
        const correctSet = new Set(correctWords);
        const intersection = new Set([...userSet].filter(word => correctSet.has(word)));
        
        const union = new Set([...userSet, ...correctSet]);
        
        return union.size > 0 ? intersection.size / union.size : 0;
    }
}

// 유틸리티 함수들
const ScoringUtils = {
    // 채점 결과 비교
    compareScoreResults(result1, result2) {
        return {
            scoreDifference: result2.score - result1.score,
            accuracyChange: result2.isCorrect !== result1.isCorrect,
            improvement: result2.score > result1.score
        };
    },

    // 채점 히스토리 분석
    analyzeScoreHistory(scoreHistory) {
        if (!Array.isArray(scoreHistory) || scoreHistory.length === 0) {
            return null;
        }

        const scores = scoreHistory.map(result => result.score);
        const trend = this.calculateTrend(scores);
        
        return {
            averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
            trend: trend,
            consistency: this.calculateConsistency(scores),
            improvement: scores[scores.length - 1] - scores[0],
            streaks: this.findStreaks(scoreHistory)
        };
    },

    // 점수 트렌드 계산
    calculateTrend(scores) {
        if (scores.length < 2) return 'insufficient_data';
        
        const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
        const secondHalf = scores.slice(Math.floor(scores.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
        
        const difference = secondAvg - firstAvg;
        
        if (difference > 5) return 'improving';
        if (difference < -5) return 'declining';
        return 'stable';
    },

    // 일관성 계산
    calculateConsistency(scores) {
        if (scores.length < 2) return 100;
        
        const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        const standardDeviation = Math.sqrt(variance);
        
        // 표준편차가 낮을수록 일관성이 높음
        return Math.max(0, 100 - standardDeviation * 2);
    },

    // 연속 성공/실패 찾기
    findStreaks(scoreHistory) {
        const streaks = { correct: 0, incorrect: 0, currentCorrect: 0, currentIncorrect: 0 };
        let maxCorrectStreak = 0;
        let maxIncorrectStreak = 0;
        let currentCorrectStreak = 0;
        let currentIncorrectStreak = 0;

        scoreHistory.forEach(result => {
            if (result.isCorrect) {
                currentCorrectStreak++;
                currentIncorrectStreak = 0;
                maxCorrectStreak = Math.max(maxCorrectStreak, currentCorrectStreak);
            } else {
                currentIncorrectStreak++;
                currentCorrectStreak = 0;
                maxIncorrectStreak = Math.max(maxIncorrectStreak, currentIncorrectStreak);
            }
        });

        return {
            maxCorrectStreak,
            maxIncorrectStreak,
            currentCorrectStreak,
            currentIncorrectStreak
        };
    },

    // 채점 설정 최적화 제안
    suggestOptimalSettings(scoreHistory, userProfile = {}) {
        const suggestions = [];
        
        if (scoreHistory.length > 0) {
            const avgScore = scoreHistory.reduce((sum, result) => sum + result.score, 0) / scoreHistory.length;
            
            if (avgScore < 60) {
                suggestions.push({
                    setting: 'allowPartialCredit',
                    value: true,
                    reason: '부분 점수를 허용하여 학습 동기를 유지하세요.'
                });
                
                suggestions.push({
                    setting: 'spellingTolerance',
                    value: 0.2,
                    reason: '철자 허용 범위를 넓혀보세요.'
                });
            }
            
            if (avgScore > 85) {
                suggestions.push({
                    setting: 'strictPunctuation',
                    value: true,
                    reason: '구두점을 엄격하게 채점하여 도전도를 높이세요.'
                });
            }
        }
        
        return suggestions;
    },

    // 성능 지표 계산
    calculatePerformanceMetrics(scoreResults, timeSpent = []) {
        const metrics = {
            accuracy: 0,
            efficiency: 0,
            consistency: 0,
            improvement: 0
        };

        if (scoreResults.length === 0) return metrics;

        const scores = scoreResults.map(result => result.score);
        const correctCount = scoreResults.filter(result => result.isCorrect).length;

        // 정확도
        metrics.accuracy = (correctCount / scoreResults.length) * 100;

        // 효율성 (점수 대비 시간)
        if (timeSpent.length === scores.length) {
            const avgTime = timeSpent.reduce((sum, time) => sum + time, 0) / timeSpent.length;
            const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            metrics.efficiency = avgScore / Math.max(1, avgTime / 60); // 분당 점수
        }

        // 일관성
        metrics.consistency = this.calculateConsistency(scores);

        // 개선도
        if (scores.length >= 2) {
            metrics.improvement = scores[scores.length - 1] - scores[0];
        }

        return metrics;
    }
};

// 전역으로 노출
window.ScoringEngine = ScoringEngine;
window.AdvancedScorer = AdvancedScorer;
window.ScoringUtils = ScoringUtils;
