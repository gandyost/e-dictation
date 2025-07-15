// Firebase 설정 및 초기화
(function() {
    'use strict';
    
    // Firebase 초기화 함수
    function initializeFirebase() {
        // Firebase SDK가 로드되었는지 확인
        if (typeof firebase === 'undefined') {
            console.log('Firebase SDK를 기다리는 중...');
            setTimeout(initializeFirebase, 200);
            return;
        }

        // Firebase가 이미 초기화되었는지 확인
        if (firebase.apps && firebase.apps.length > 0) {
            console.log('Firebase already initialized');
            // 이미 초기화된 경우 전역 변수만 설정
            if (firebase.firestore) {
                window.db = firebase.firestore();
            }
            if (firebase.auth) {
                window.auth = firebase.auth();
            }
            return;
        }

        try {
            const config = {
                apiKey: "AIzaSyBlWpLtgheMHHShh_ZOE43PD_zhfi3i-mo",
                authDomain: "e-dictation-d679a.firebaseapp.com",
                projectId: "e-dictation-d679a",
                storageBucket: "e-dictation-d679a.firebasestorage.app",
                messagingSenderId: "585034180982",
                appId: "1:585034180982:web:f5ff6fcee0c04a6bf6b257",
                measurementId: "G-W8TB4B8VNQ"
            };

            // Firebase 초기화
            firebase.initializeApp(config);
            console.log('Firebase initialized successfully');

            // Firestore 데이터베이스 참조 설정
            if (firebase.firestore) {
                window.db = firebase.firestore();
                console.log('Firestore initialized');
            } else {
                console.warn('Firestore not available');
            }

            // Firebase Authentication 참조 설정
            if (firebase.auth) {
                window.auth = firebase.auth();
                console.log('Auth initialized');
            } else {
                console.warn('Auth not available');
            }

            console.log('Firebase services initialized');
        } catch (error) {
            console.error('Firebase 초기화 오류:', error);
        }
    }
    
    // 즉시 초기화 시도
    initializeFirebase();
})();
