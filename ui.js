// ui.js
/// פונקציות ניהול ממשק משתמש, ניווט בין מסכים, תפריט צדדי, התחברות וכו'

let gameInterval;
let mediumInterval;
let hardInterval;
let gameActive = false;
let mediumActive = false;
let hardActive = false;
// ניהול תפריט צדדי
const hamburgerBtn = document.querySelector('.hamburger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

hamburgerBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
    overlay.classList.add('open');
});

overlay.addEventListener('click', closeMenu);
function closeMenu() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
}

function showScreen(screenId) {
    const screens = [
        'home-screen', 
        'game-screen', 
        'theory-screen', 
        'medium-screen', 
        'hard-screen', 
        'profile-screen', 
        'study-screen',
        'level-play-screen',
        'leaderboard-screen'
    ];

    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) screen.classList.add('hidden');
    });

    document.querySelector('main').classList.add('hidden');

    // הצגת המסך המבוקש
    if (screenId === 'home-screen') {
        document.querySelector('main').classList.remove('hidden');
    } else {
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.remove('hidden');
            resetScreenToInitialState(screenId);
        }
    }
    if (screenId === 'leaderboard-screen') {
        updateLeaderboards(); // טעינת הטבלאות
    }
    if (screenId === 'theory-screen') {
        createKeyboard('learning-keyboard', 'learning'); // מצב למידה
        createKeyboard('Starting-position-keyboard', 'home-row'); // מצב מיקום התחלתי
    }
    if (screenId === 'study-screen') {
        const levelContent = document.getElementById('level-content');
        //if (levelContent) levelContent.innerHTML = '';
        generateLearningMap();
        updateStudyMapUI();
    }
    //closeMenu();
    if (typeof closeMenu === 'function') closeMenu();
}

// נעדכן את פונקציית החזרה הביתה
function backToHome() {
    // 1. עצירת כל האינטרוולים (השעונים) של כל הרמות
    clearInterval(gameInterval);    // רמה קלה
    clearInterval(mediumInterval);  // רמה בינונית
    clearInterval(hardInterval);    // רמה קשה

    // 2. כיבוי מצבי "משחק פעיל"
    gameActive = false;
    mediumActive = false;
    hardActive = false;

    // 3. איפוס ה-UI של כל רמה למצב "הוראות" (לפני התחלה)
    // רמה קלה
    document.getElementById('start-overlay').classList.remove('hidden');
    document.getElementById('stats-bar').classList.add('hidden');
    document.getElementById('target-area').classList.add('hidden');
    document.getElementById('results-modal').classList.add('hidden');
    document.getElementById('keyboard-easy').innerHTML = ""; // העלמת המקלדת

    // רמה בינונית (וודא שה-IDs תואמים ל-HTML שלך)
    document.getElementById('start-overlay-medium').classList.remove('hidden');
    document.getElementById('stats-bar-medium').classList.add('hidden');
    document.getElementById('target-area-medium').classList.add('hidden');
    document.getElementById('results-modal-medium').classList.add('hidden');
    document.getElementById('keyboard-medium').innerHTML = "";

    // רמה קשה
    document.getElementById('start-overlay-hard').classList.remove('hidden');
    document.getElementById('stats-bar-hard').classList.add('hidden');
    document.getElementById('target-area-hard').classList.add('hidden');
    document.getElementById('results-modal-hard').classList.add('hidden');
    document.getElementById('keyboard-hard').innerHTML = "";

    // 4. מעבר למסך הבית
    showScreen('home-screen');
}

// פונקציית עזר לאיפוס ויזואלי של המסכים
function resetScreenToInitialState(screenId) {
    // איפוס רמה קלה
    if (screenId === 'game-screen') {
        document.getElementById('start-overlay').classList.remove('hidden');
        document.getElementById('stats-bar').classList.add('hidden');
        document.getElementById('target-area').classList.add('hidden');
    }
    // איפוס רמה בינונית
    if (screenId === 'medium-screen') {
        document.getElementById('start-overlay-medium').classList.remove('hidden');
        document.getElementById('stats-bar-medium').classList.add('hidden');
        document.getElementById('target-area-medium').classList.add('hidden');
    }
    // איפוס רמה קשה
    if (screenId === 'hard-screen') {
        document.getElementById('start-overlay-hard').classList.remove('hidden');
        document.getElementById('stats-bar-hard').classList.add('hidden');
        document.getElementById('target-area-hard').classList.add('hidden');
    }
}

function showLoginModal() {
    document.getElementById('login-modal').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
}

function logout() {
    setCurrentUser(null);
    sessionStorage.removeItem('activeUser');
    localStorage.removeItem('currentUser');
    
    // במקום רענון דף, אפשר פשוט לעדכן UI (אבל רענון זה הכי בטוח למניעת שאריות מידע)
    location.reload(); 
}

function updateUIForUser(username) {
    // 1. כפתורי התחברות (אלה שצריכים להיעלם כשיש משתמש)
    const loginElements = [
        document.getElementById('sidebar-login-btn'),
        document.getElementById('main-login-btn')
    ];

    // 2. כפתורי אזור אישי (אלה שצריכים להופיע כשיש משתמש)
    const profileElements = [
        document.getElementById('sidebar-profile-btn'),
        document.getElementById('main-profile-btn')
    ];

    const welcomeMsg = document.querySelector('#welcome-message p');
    const profileName = document.getElementById('profile-username');

    if (username) {
        // מצב מחובר
        loginElements.forEach(el => el && el.classList.add('hidden'));
        profileElements.forEach(el => el && el.classList.remove('hidden'));
        
        if (welcomeMsg) welcomeMsg.innerText = `שלום, ${username}! מוכן ללמוד?`;
        if (profileName) profileName.innerText = `שלום, ${username}`;
    } else {
        // מצב אורח
        loginElements.forEach(el => el && el.classList.remove('hidden'));
        profileElements.forEach(el => el && el.classList.add('hidden'));
        
        if (welcomeMsg) welcomeMsg.innerText = `שלום, אורח`;
        if (profileName) profileName.innerText = `שלום, אורח`;
    }
}

// בדיקה אם יש משתמש מחובר כשהדף עולה
window.addEventListener('load', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        updateUIForUser(savedUser);
    }
});

function generateLearningMap() {
    const container = document.getElementById('learning-circle');
    if (!container) return;

    container.innerHTML = '';
    const totalLevels = 15;
    const radius = 180; // המרחק מהמרכז בפיקסלים
    const centerX = 225; // מרכז המיכל (450/2)
    const centerY = 225;

    for (let i = 1; i <= totalLevels; i++) {
        const btn = document.createElement('button');
        btn.className = 'step-node';
        btn.innerText = i;
        btn.onclick = () => startStudyLevel(i);

        // חישוב זווית: מחלקים 360 מעלות ב-15 שלבים
        // פחות 90 מעלות כדי להתחיל מהשעה 12 (למעלה)
        const angle = ((i - 1) / totalLevels) * 2 * Math.PI - Math.PI / 2;
        
        // חישוב מיקום X ו-Y בעזרת סינוס וקוסינוס
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;

        container.appendChild(btn);
    }
}

function closeLanguageAlert() {
    document.getElementById('language-alert').classList.add('hidden');
}

function isEnglish(key) {
    return /^[a-zA-Z]$/.test(key);
}

function toggleAuthMode() {
    toggleLoginMode();
    isLoginMode = getLoginMode();
    document.getElementById('auth-title').innerText = isLoginMode ? "התחברות למערכת" : "הרשמה למערכת";
    document.getElementById('auth-submit-btn').innerText = isLoginMode ? "התחבר" : "צור משתמש";
    document.getElementById('auth-toggle-btn').innerText = isLoginMode ? "אין משתמש? הירשם כאן" : "יש לך משתמש? התחבר";
    document.getElementById('auth-error-msg').innerText = "";
}

async function submitAuth() {
    const userVal = document.getElementById('username-input').value.trim();
    const passVal = document.getElementById('password-input').value.trim();
    const errorMsg = document.getElementById('auth-error-msg');
    
    if(!userVal || !passVal) {
        errorMsg.innerText = "נא להזין שם משתמש וסיסמה.";
        return;
    }

    try {
        if (getLoginMode()) {
            await DB.login(userVal, passVal);
            finishLogin(userVal);
        } else {
            await DB.register(userVal, passVal);
            finishLogin(userVal); // התחברות אוטומטית אחרי הרשמה
        }
    } catch (err) {
        errorMsg.innerText = err;
    }
}

// ui.js - עדכון פונקציית סיום ההתחברות
function finishLogin(username) {
    setCurrentUser(username); // קריאה לפונקציה מ-database.js
    
    // שמירה עקבית בשני המקומות כדי למנוע באגים של "חצי מחובר"
    sessionStorage.setItem('activeUser', username);
    localStorage.setItem('currentUser', username); 

    closeLoginModal();
    
    // עדכון אלמנטים במסך
    const welcomeArea = document.getElementById('welcome-message');
    if (welcomeArea) welcomeArea.innerHTML = `<p>שלום ${username}!</p>`;
    
    const profileName = document.getElementById('profile-username');
    if (profileName) profileName.innerText = `שלום, ${username}`;

    // עדכון כפתורי תפריט
    updateUIForUser(username);
    
    // טעינת נתוני פרופיל מה-Firebase
    updateProfileUI();
}

async function updateProfileUI() {
    const currentUser = getCurrentUser();
    if(!currentUser) return;
    const data = await DB.getUserData(currentUser);
    
    document.getElementById('profile-study-level').innerText = data.studyLevel;
    document.getElementById('profile-study-score').innerText = data.studyBestScore;
    document.getElementById('profile-study-acc').innerText = data.studyBestAcc;
    
    document.getElementById('record-easy').innerText = data.records.easy;
    document.getElementById('acc-easy').innerText = data.accuracy.easy;
    document.getElementById('record-medium').innerText = data.records.medium;
    document.getElementById('acc-medium').innerText = data.accuracy.medium;
    document.getElementById('record-hard').innerText = data.records.hard;
    document.getElementById('acc-hard').innerText = data.accuracy.hard;
}

async function updateLeaderboards() {
    try {
        // שלב 1: קבלת כל המשתמשים מהדאטה-בייס
        const allUsers = await DB.getAllUsers(); 
        
        // הגנה: מוודאים שזה מערך. אם זה אובייקט (כמו ב-LocalStorage), נהפוך אותו למערך
        const usersArray = Array.isArray(allUsers) ? allUsers : Object.values(allUsers);
        
        const levels = ['easy', 'medium', 'hard'];
        
        levels.forEach(level => {
            const listElement = document.getElementById(`leaderboard-${level}`);
            if (!listElement) return; // הגנה למקרה שהאלמנט חסר ב-HTML

            // שלב 2: סינון ומיון
            const topUsers = usersArray
                .filter(user => user && user.records && user.records[level] > 0) // רק מי שיש לו שיא חיובי
                .sort((a, b) => b.records[level] - a.records[level])    // מיון מהגבוה לנמוך
                .slice(0, 5); // 5 הראשונים
                
            listElement.innerHTML = ''; // ניקוי הרשימה
            
            if (topUsers.length === 0) {
                listElement.innerHTML = '<li>אין נתונים עדיין</li>';
                return;
            }

            // שלב 3: בניית ה-HTML של הרשימה
            topUsers.forEach((user, index) => {
                const li = document.createElement('li');
                li.className = 'leaderboard-item';
                
                if (user.username === getCurrentUser()) {
                    li.classList.add('is-current-user');
                }

                li.innerHTML = `
                    <span class="rank">${index + 1}.</span>
                    <span class="name">${user.username}</span>
                    <span class="score">${user.records[level]}</span>
                `;
                listElement.appendChild(li);
            });
        });
    } catch (error) {
        console.error("שגיאה בטעינת טבלת מובילים:", error);
        // נציג הודעת שגיאה במסך במקום שייתקע על "טוען"
        ['easy', 'medium', 'hard'].forEach(level => {
            const listElement = document.getElementById(`leaderboard-${level}`);
            if (listElement) listElement.innerHTML = '<li style="color:red;">שגיאה בטעינה</li>';
        });
    }
}