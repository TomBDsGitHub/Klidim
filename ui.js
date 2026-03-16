// ui.js
/// פונקציות ניהול ממשק משתמש, ניווט בין מסכים, תפריט צדדי, התחברות וכו'

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
    const screens = ['home-screen', 'game-screen', 'theory-screen', 'medium-screen', 'hard-screen', 'profile-screen'];

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
            
            // --- תוספת לתיקון הבאג ---
            // אם נכנסנו למסך משחק, נוודא שה-Overlay (ההסבר) מופיע והמשחק מוסתר
            resetScreenToInitialState(screenId);
        }
    }
    closeMenu();
}

// נעדכן את פונקציית החזרה הביתה
function backToHome() {
    showScreen('home-screen');
}

// פונקציית עזר לאיפוס ויזואלי של המסכים
function resetScreenToInitialState(screenId) {
    if (screenId === 'hard-screen') {
        document.getElementById('start-overlay-hard').classList.remove('hidden');
        document.getElementById('stats-bar-hard').classList.add('hidden');
        document.getElementById('target-area-hard').classList.add('hidden');
        document.getElementById('results-modal-hard').classList.add('hidden');
    }
    // אפשר להוסיף כאן באותו אופן עבור game-screen ו-medium-screen
}

function showLoginModal() {
    document.getElementById('login-modal').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
}

function login() {
    const username = document.getElementById('username-input').value;
    if (username.trim() === "") {
        alert("נא להזין שם משתמש");
        return;
    }

    // שמירה ב-LocalStorage
    localStorage.setItem('currentUser', username);
    updateUIForUser(username);
    closeLoginModal();
}

function logout() {
    localStorage.removeItem('currentUser');
    updateUIForUser(null);
    showScreen('home-screen');
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
        
        if (welcomeMsg) welcomeMsg.innerText = `שלום, ${username}! מוכן להתאמן?`;
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