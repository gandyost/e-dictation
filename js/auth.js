// 교사 인증 관련 로직

// 교사 로그인
async function teacherLogin(email, password) {
    showLoading();
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('교사 로그인 성공:', user.email, user.displayName);
        
        // 사용자 정보 확인 및 생성 (displayName이 없을 수도 있으므로 기본값 제공)
        await ensureUserDocument(user.uid, user.email, user.displayName || '선생님');
        
        console.log('사용자 문서 확인/생성 완료');
        
        // 교사 대시보드로 이동
        window.location.href = 'teacher/dashboard.html';
        
    } catch (error) {
        console.error('로그인 오류:', error);
        alert(getErrorMessage(error.code));
    } finally {
        hideLoading();
    }
}

// 교사 회원가입
async function teacherSignup(email, password, displayName) {
    showLoading();
    try {
        console.log('교사 회원가입 시작:', email, displayName);
        
        // Firebase Auth 계정 생성
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('Firebase Auth 계정 생성 완료:', user.uid);
        
        // 사용자 프로필 업데이트
        await user.updateProfile({
            displayName: displayName
        });
        
        console.log('사용자 프로필 업데이트 완료');
        
        // Firestore에 사용자 문서 생성 (가장 중요한 부분)
        await ensureUserDocument(user.uid, email, displayName);
        
        console.log('교사 회원가입 성공:', email, displayName);
        alert(`${displayName} 선생님, 회원가입이 완료되었습니다! 로그인해주세요.`);
        
        // 로그인 화면으로 돌아가기
        hideTeacherSignupModal();
        showTeacherLogin();
        
    } catch (error) {
        console.error('회원가입 오류:', error);
        // 더 구체적인 에러 메시지
        if (error.code) {
            alert(getErrorMessage(error.code));
        } else {
            alert('회원가입 중 오류가 발생했습니다: ' + error.message);
        }
    } finally {
        hideLoading();
    }
}

// 사용자 문서 확인 및 생성
async function ensureUserDocument(uid, email, displayName) {
    try {
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            console.log('새 사용자 문서 생성 중...', uid, displayName);
            await userRef.set({
                uid: uid,
                email: email,
                displayName: displayName || '선생님',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                testCodes: []
            });
            console.log('사용자 문서 생성 완료:', uid, displayName);
        } else {
            console.log('기존 사용자 문서 업데이트...', uid, displayName);
            // 기존 사용자는 displayName만 업데이트 (빈 값이 아닌 경우)
            if (displayName && displayName.trim() !== '') {
                await userRef.update({
                    displayName: displayName
                });
                console.log('사용자 displayName 업데이트 완료:', uid, displayName);
            }
        }
    } catch (error) {
        console.error('사용자 문서 생성/업데이트 오류:', error);
        throw error;
    }
}

// 학생 테스트 코드 검증 및 입장
async function studentJoinTest(testCode) {
    showLoading();
    try {
        // 테스트 코드 검증
        const validation = await validateTestCode(testCode);
        
        if (!validation.valid) {
            alert(validation.message);
            return;
        }
        
        // 세션 스토리지에 테스트 정보 저장
        sessionStorage.setItem('currentTestCode', testCode);
        sessionStorage.setItem('testData', JSON.stringify(validation.testData));
        
        console.log('테스트 코드 검증 성공:', testCode);
        
        // 학생 정보 입력 페이지로 이동
        window.location.href = `student/join.html?code=${testCode}`;
        
    } catch (error) {
        console.error('테스트 입장 오류:', error);
        alert('테스트 입장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        hideLoading();
    }
}

// 로그아웃
async function logout() {
    try {
        await auth.signOut();
        console.log('로그아웃 성공');
        window.location.href = '../index.html';
    } catch (error) {
        console.error('로그아웃 오류:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
    }
}

// 인증 상태 변화 감지
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('사용자 로그인됨:', user.email);
        // 현재 페이지가 메인 페이지인 경우 대시보드로 리다이렉트
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            window.location.href = 'teacher/dashboard.html';
        }
    } else {
        console.log('사용자 로그아웃됨');
        // 교사 페이지에 있는 경우 메인 페이지로 리다이렉트
        if (window.location.pathname.includes('teacher/')) {
            window.location.href = '../index.html';
        }
    }
});

// 오류 메시지 변환
function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/user-not-found':
            return '등록되지 않은 이메일입니다.';
        case 'auth/wrong-password':
            return '비밀번호가 올바르지 않습니다.';
        case 'auth/email-already-in-use':
            return '이미 사용 중인 이메일입니다.';
        case 'auth/weak-password':
            return '비밀번호는 6자리 이상이어야 합니다.';
        case 'auth/invalid-email':
            return '유효하지 않은 이메일 형식입니다.';
        case 'auth/too-many-requests':
            return '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
        default:
            return '오류가 발생했습니다. 다시 시도해주세요.';
    }
}

// 교사 회원가입 모달 표시
function showTeacherSignup() {
    hideTeacherModal();
    
    // 회원가입 모달 HTML 동적 생성
    const signupModal = `
        <div id="teacherSignupModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                <div class="text-center mb-6">
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">교사 회원가입</h3>
                    <p class="text-gray-600">새 계정을 만들어 테스트를 관리하세요</p>
                </div>
                
                <form id="teacherSignupForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">이름</label>
                        <input 
                            type="text" 
                            id="teacherDisplayName"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="김선생"
                            required
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                        <input 
                            type="email" 
                            id="teacherSignupEmail"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="teacher@example.com"
                            required
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                        <input 
                            type="password" 
                            id="teacherSignupPassword"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            minlength="6"
                            required
                        >
                        <p class="text-xs text-gray-500 mt-1">6자리 이상 입력해주세요</p>
                    </div>
                    <div class="flex space-x-3">
                        <button 
                            type="submit"
                            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            회원가입
                        </button>
                        <button 
                            type="button"
                            onclick="hideTeacherSignupModal(); showTeacherLogin();"
                            class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                        >
                            로그인으로
                        </button>
                    </div>
                </form>
                
                <button 
                    onclick="hideTeacherSignupModal()"
                    class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', signupModal);
    
    // 회원가입 폼 이벤트 리스너
    document.getElementById('teacherSignupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const displayName = document.getElementById('teacherDisplayName').value;
        const email = document.getElementById('teacherSignupEmail').value;
        const password = document.getElementById('teacherSignupPassword').value;
        
        await teacherSignup(email, password, displayName);
    });
}

// 교사 회원가입 모달 숨기기
function hideTeacherSignupModal() {
    const modal = document.getElementById('teacherSignupModal');
    if (modal) {
        modal.remove();
    }
}

// 폼 이벤트 리스너 등록 (페이지 로드 후)
document.addEventListener('DOMContentLoaded', function() {
    // 교사 로그인 폼
    const teacherLoginForm = document.getElementById('teacherLoginForm');
    if (teacherLoginForm) {
        teacherLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('teacherEmail').value;
            const password = document.getElementById('teacherPassword').value;
            
            await teacherLogin(email, password);
        });
    }
    
    // 학생 테스트 코드 입력 폼
    const studentJoinForm = document.getElementById('studentJoinForm');
    if (studentJoinForm) {
        studentJoinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const testCode = document.getElementById('testCode').value.trim().toUpperCase();
            
            if (testCode.length !== 6) {
                alert('테스트 코드는 6자리여야 합니다.');
                return;
            }
            
            await studentJoinTest(testCode);
        });
    }
});
