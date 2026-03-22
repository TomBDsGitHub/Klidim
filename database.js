// database.js

let currentUser = null;
let isLoginMode = true; // משתנה לניהול מצב החלונית (התחברות/הרשמה)

function getCurrentUser() {
    return currentUser;
}

function setCurrentUser(user) {
    currentUser = user;
}

function toggleLoginMode() {
    isLoginMode = !isLoginMode;
}

function getLoginMode() {
    return isLoginMode;
}

const DB = {
    // הדמיית פניות לשרת בעזרת Promise
    async register(username, password) {
        return new Promise((resolve, reject) => {
            const users = JSON.parse(localStorage.getItem('usersDB')) || {};
            if (users[username]) {
                reject("שם המשתמש כבר תפוס!");
            } else if (username.length < 3 || password.length < 4) {
                reject("שם משתמש לפחות 3 תווים, סיסמה לפחות 4.");
            } else {
                users[username] = {
                    password: password,
                    studyLevel: 1,
                    studyBestScore: 0,
                    studyBestAcc: 0,
                    records: { easy: 0, medium: 0, hard: 0 },
                    accuracy: { easy: 0, medium: 0, hard: 0 }
                };
                localStorage.setItem('usersDB', JSON.stringify(users));
                resolve(users[username]);
            }
        });
    },

    async login(username, password) {
        return new Promise((resolve, reject) => {
            const users = JSON.parse(localStorage.getItem('usersDB')) || {};
            const user = users[username];
            if (user && user.password === password) {
                resolve(user);
            } else {
                reject("שם משתמש או סיסמה שגויים.");
            }
        });
    },

    async saveGameRecord(username, mode, score, accuracy) {
        if (accuracy < 80) return; // לא שומרים אם הדיוק נמוך מ-80%

        const users = JSON.parse(localStorage.getItem('usersDB')) || {};
        if (users[username]) {
            if (score > users[username].records[mode]) {
                users[username].records[mode] = score;
                users[username].accuracy[mode] = accuracy;
                localStorage.setItem('usersDB', JSON.stringify(users));
            }
        }
    },

    async updateStudyLevel(username, currentLevelPlaying, score, accuracy) {
        const users = JSON.parse(localStorage.getItem('usersDB')) || {};
        const user = users[username];
        
        if (user) {
            // שמירת שיא לשלב הנוכחי אם הוא טוב יותר
            if (score > user.studyBestScore) {
                user.studyBestScore = score;
                user.studyBestAcc = accuracy;
            }

            // פתיחת השלב הבא אם עמדנו בתנאים
            if (score >= 35 && accuracy >= 80 && currentLevelPlaying === user.studyLevel) {
                user.studyLevel += 1;
                user.studyBestScore = 0; // איפוס השיא לשלב החדש שנפתח
                user.studyBestAcc = 0;
            }
            
            localStorage.setItem('usersDB', JSON.stringify(users));
            return user.studyLevel;
        }
    },

    async getUserData(username) {
        const users = JSON.parse(localStorage.getItem('usersDB')) || {};
        return users[username];
    }
};

// כשמטעינים את האתר, בודקים אם מישהו כבר מחובר בזיכרון של הדפדפן
document.addEventListener('DOMContentLoaded', async () => {
    const savedUser = sessionStorage.getItem('activeUser');
    if (savedUser) {
        window.currentUser = savedUser;
        
        // בדיקה אם הפונקציה קיימת לפני שמפעילים אותה
        if (typeof finishLogin === 'function') {
            finishLogin(savedUser);
        } else {
            console.warn("finishLogin לא נמצאה בטעינה, מנסה לעדכן UI ידנית");
            // גיבוי למקרה ש-ui.js עוד לא מוכן
            updateProfileUI(); 
        }
    }
});

const LETTER_LIST = [
    "א", 
    "ב", 
    "ג", 
    "ד", 
    "ה", 
    "ו", 
    "ז", 
    "ח", 
    "ט", 
    "י", 
    "כ", 
    "ל", 
    "מ", 
    "נ", 
    "ס", 
    "ע", 
    "פ", 
    "צ", 
    "ק", 
    "ר", 
    "ש", 
    "ת"
];

const WORD_LIST = [
    "שלום", 
    "בית", 
    "מקלדת", 
    "עברית"
];

const SENTENCE_LIST = [
    "הקלדה עיוורת היא מיומנות חשובה מאוד.",
    "תרגול יומיומי מוביל לתוצאות מצוינות!",
    "כל אצבע צריכה להיות במקומה הנכון.",
    "האם אתם מצליחים להקליד בלי להסתכל?",
    "שמרו על גב ישר ומרפקים צמודים לגוף."
];