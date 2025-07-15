// 테스트 코드 생성 및 검증 유틸리티

// 6자리 랜덤 코드 생성 함수
function generateTestCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 개선된 중복 방지 코드 생성 (Firestore 트랜잭션 사용)
async function createUniqueTestCode(teacherUid, testData) {
  console.log('테스트 코드 생성 시작:', { teacherUid, testData });
  let attempts = 0;
  const maxAttempts = 10; // 최대 10회 시도
  
  while (attempts < maxAttempts) {
    const code = generateTestCode();
    
    try {
      // Firestore 트랜잭션으로 원자적 처리
      await db.runTransaction(async (transaction) => {
        // 1. 테스트 코드 중복 검사
        const testRef = db.collection('tests').doc(code);
        const testDoc = await transaction.get(testRef);
        
        if (testDoc.exists) {
          throw new Error('CODE_EXISTS'); // 중복 코드 발견
        }
        
        // 2. 교사 문서의 testCodes 배열에도 중복 검사
        const userRef = db.collection('users').doc(teacherUid);
        const userDoc = await transaction.get(userRef);
        
        let existingCodes = [];
        if (userDoc.exists) {
          existingCodes = userDoc.data().testCodes || [];
          if (existingCodes.includes(code)) {
            throw new Error('CODE_EXISTS_IN_USER'); // 교사의 기존 코드와 중복
          }
        }
        
        // 3. 중복이 없으면 테스트 생성
        const testDataWithCode = {
          ...testData,
          testCode: code,
          createdBy: teacherUid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        transaction.set(testRef, testDataWithCode);
        
        // 4. 교사 문서의 testCodes 배열에 새 코드 추가
        if (userDoc.exists) {
          // 기존 사용자 문서가 있으면 업데이트
          console.log('기존 사용자 문서 업데이트:', teacherUid);
          transaction.update(userRef, {
            testCodes: firebase.firestore.FieldValue.arrayUnion(code)
          });
        } else {
          // 사용자 문서가 없으면 새로 생성
          console.log('새 사용자 문서 생성:', teacherUid);
          const currentUser = firebase.auth().currentUser;
          transaction.set(userRef, {
            uid: teacherUid,
            email: currentUser?.email || '',
            displayName: currentUser?.displayName || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            testCodes: [code]
          });
        }
      });
      
      // 성공적으로 생성됨
      console.log(`테스트 코드 생성 성공: ${code}`);
      return code;
      
    } catch (error) {
      attempts++;
      
      if (error.message === 'CODE_EXISTS' || error.message === 'CODE_EXISTS_IN_USER') {
        console.log(`코드 중복 발생 (${attempts}/${maxAttempts}): ${code}`);
        continue; // 새로운 코드로 재시도
      } else {
        // 다른 오류 발생
        throw error;
      }
    }
  }
  
  // 최대 시도 횟수 초과
  throw new Error(`테스트 코드 생성 실패: ${maxAttempts}회 시도 후에도 고유한 코드를 생성할 수 없습니다.`);
}

// 테스트 코드 검증 함수
async function validateTestCode(code) {
  try {
    const testDoc = await db.collection('tests').doc(code).get();
    
    if (!testDoc.exists) {
      return { valid: false, message: '존재하지 않는 테스트 코드입니다.' };
    }
    
    const testData = testDoc.data();
    
    if (!testData.isActive) {
      return { valid: false, message: '비활성화된 테스트입니다.' };
    }
    
    return { valid: true, testData: testData };
    
  } catch (error) {
    console.error('코드 검증 오류:', error);
    return { valid: false, message: '코드 검증 중 오류가 발생했습니다.' };
  }
}

// 새 테스트 생성 함수
async function createNewTest(teacherUid, testTitle, sentences, settings = {}) {
  try {
    const testData = {
      title: testTitle,
      description: settings.description || '',
      isActive: true,
      status: 'active',
      teacherId: teacherUid,
      settings: {
        timeLimit: settings.timeLimit || null,
        allowRetry: settings.allowRetry || false,
        showResultsImmediately: settings.showResultsImmediately || true,
        speechRate: settings.speechRate || 1.0,
        caseSensitive: settings.caseSensitive || false,
        strictPunctuation: settings.strictPunctuation || false,
        ...settings
      },
      sentences: sentences || [],
      participantCount: 0,
      completedCount: 0,
      averageScore: 0
    };
    
    const testCode = await createUniqueTestCode(teacherUid, testData);
    console.log(`새 테스트가 생성되었습니다. 코드: ${testCode}`);
    return testCode;
    
  } catch (error) {
    console.error('테스트 생성 오류:', error.message);
    throw error;
  }
}
