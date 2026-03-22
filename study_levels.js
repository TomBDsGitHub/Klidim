// study_levels.js

let studyTimerInterval;
let studyTimeLeft = 40;
let currentStudyRow = "";
let currentStudyIndex = 0;
let currentStudyLevelKeys = [];
let isStudyActive = false;
let correctCharsTotal = 0; // מונה תווים נכונים
let currentLevelPlaying = 1; // לשמירת השלב הנוכחי לטובת "נסה שוב"
let studyErrorsTotal = 0; // מונה טעויות

const LEVEL_KEYS = {
    1: ['ח', 'כ'], 
    2: ['ל', 'ג'], 
    3: ['ך', 'ד'], 
    4: ['ף', 'ש'],
    5: ['פ'], 
    6: ['ם', 'ץ'], 
    7: ['ן', 'ת'],
    8: ['ו', 'צ', 'מ', 'י', 'ט'], 
    9: ['א', 'ע', 'נ', 'ה', 'ר'],
    10: ['ק', 'ב'], 
    11: ['ס'], 
    12: ['ז'],
    13: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    14: ['\'', '.', ',', '/']
};

function getAccumulatedKeys(level) {
    let keys = [' ']; 
    if (level <= 12 || level === 15){
        for (let i = 1; i <= level; i++) {
            if (LEVEL_KEYS[i]) keys = keys.concat(LEVEL_KEYS[i]);
        }
    } else if (level === 13) {
        for (let i = 1; i <= 4; i++) {
            if (LEVEL_KEYS[i]) keys = keys.concat(LEVEL_KEYS[i]);
        }
        keys = keys.concat(LEVEL_KEYS[13]);
    } else if (level === 14) {
        for (let i = 1; i <= 4; i++) {
            if (LEVEL_KEYS[i]) keys = keys.concat(LEVEL_KEYS[i]);
        }
        keys = keys.concat(LEVEL_KEYS[14]);
    }
    return keys;
}

// פונקציה ראשונה - מציגה את מסך השלב עם ה-Overlay
async function startStudyLevel(levelNumber) {// בדיקת הגנה לוגית
    let unlockedLevel = 1;
    updateStudyMapUI(); // עדכון המפה לפני כל התחלה כדי לוודא שהמצב מעודכן
    const currentUser = getCurrentUser();
    if (currentUser) {
        const userData = await DB.getUserData(currentUser);
        unlockedLevel = userData.studyLevel;
    }
    
    if (levelNumber > unlockedLevel) {
        alert("השלב הזה עדיין נעול. עליך להשלים את השלבים הקודמים בהצלחה!");
        return; // עוצר את הפונקציה ולא מכניס לשלב
    }

    currentLevelPlaying = levelNumber;
    const title = document.getElementById('current-level-title');
    if (title) title.innerText = `שלב ${levelNumber}`;
    
    showScreen('level-play-screen');
    
    // איפוס ויזואלי של החלוניות
    document.getElementById('study-start-overlay').classList.remove('hidden');
    document.getElementById('study-game-area').classList.add('hidden');
    document.getElementById('study-results-modal').classList.add('hidden');
    
    // הכנת המקשים מראש
    currentStudyLevelKeys = getAccumulatedKeys(levelNumber);
    createKeyboard('study-keyboard', 'study', currentStudyLevelKeys);
}

// פונקציה שנייה - מתחילה את המשחק והטיימר בפועל
function realStartStudy() {
    document.getElementById('study-start-overlay').classList.add('hidden');
    document.getElementById('study-game-area').classList.remove('hidden');
    
    // איפוס נתונים
    studyTimeLeft = 40;
    correctCharsTotal = 0;
    studyErrorsTotal = 0;
    isStudyActive = true;
    document.getElementById('study-timer').innerText = `זמן: ${studyTimeLeft}`;
    
    generateNewStudyRow();
    
    // הפעלת הטיימר
    clearInterval(studyTimerInterval);
    studyTimerInterval = setInterval(() => {
        studyTimeLeft--;
        document.getElementById('study-timer').innerText = `זמן: ${studyTimeLeft}`;
        
        if (studyTimeLeft <= 0) {
            endStudyLevel();
        }
    }, 1000);
}

function generateNewStudyRow() {
    currentStudyRow = "";
    currentStudyIndex = 0;
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * currentStudyLevelKeys.length);
        currentStudyRow += currentStudyLevelKeys[randomIndex];
    }
    renderStudyRow();
}

function renderStudyRow() {
    const container = document.getElementById('study-text-container');
    container.innerHTML = '';
    for (let i = 0; i < currentStudyRow.length; i++) {
        const span = document.createElement('span');
        span.innerText = currentStudyRow[i] === ' ' ? '_' : currentStudyRow[i];
        span.className = 'study-char';
        if (i === 0) span.classList.add('current');
        container.appendChild(span);
    }
}

async function endStudyLevel() {
    isStudyActive = false;
    clearInterval(studyTimerInterval);
    
    // חישוב דיוק
    const totalAttempts = correctCharsTotal + studyErrorsTotal;
    let accuracy = 0;
    if (totalAttempts > 0) {
        accuracy = Math.round((correctCharsTotal / totalAttempts) * 100);
    }
    
    // ניהול תוצאה ושמירה (רק אם מחובר)
    let nextLevelUnlocked = false;
    const currentUser = getCurrentUser();
    if (currentUser) {
        const previousLevel = (await DB.getUserData(currentUser)).studyLevel;
        const updatedLevel = await DB.updateStudyLevel(currentUser, currentLevelPlaying, correctCharsTotal, accuracy);
        if (updatedLevel > previousLevel) {
            nextLevelUnlocked = true;
        }
        updateProfileUI(); // עדכון האזור האישי בזמן אמת
    }

    // הצגת תוצאות
    document.getElementById('study-game-area').classList.add('hidden');
    document.getElementById('study-results-modal').classList.remove('hidden');
    
    let resultHTML = `<p>הקלדת <span style="font-weight:bold; color:#28a745;">${correctCharsTotal}</span> תווים נכונים.</p>`;
    resultHTML += `<p>רמת דיוק: <span style="font-weight:bold; color:${accuracy >= 80 ? '#28a745' : '#e74c3c'};">${accuracy}%</span></p>`;
    
    if (correctCharsTotal >= 35 && accuracy >= 80) {
        if (nextLevelUnlocked) {
             resultHTML += `<p style="color: #8e44ad; font-weight: bold;">🎉 פתחת את שלב ${currentLevelPlaying + 1}!</p>`;
        } else {
             resultHTML += `<p style="color: #2980b9;">מעולה! עמדת ביעדי השלב.</p>`;
        }
    } else {
        resultHTML += `<p style="color: #e74c3c;">כדי לעבור שלב עליך להגיע ל-35 תווים ו-80% דיוק.</p>`;
    }
    
    document.getElementById('study-final-stats').innerHTML = resultHTML;
}

// האזנה למקלדת
document.addEventListener('keydown', (e) => {
    if (isStudyActive && !document.getElementById('level-play-screen').classList.contains('hidden')) {

        // בדיקת שפה
        if (isEnglish(e.key)) {
            document.getElementById('language-alert').classList.remove('hidden');
            return;
        }

        if (['Shift', 'CapsLock', 'Alt', 'Control'].includes(e.key)) return;
        if (e.key === ' ') e.preventDefault();
        
        const expectedChar = currentStudyRow[currentStudyIndex];
        const spans = document.querySelectorAll('#study-text-container .study-char');
        const currentSpan = spans[currentStudyIndex];
        
        // מציאת המקש הפיזי במקלדת הווירטואלית
        const visualKey = document.querySelector(`#study-keyboard [data-key="${e.key}"]`);
        
        // --- פונקציית עזר פנימית לניקוי כל המקשים האדומים ---
        const clearRedKeys = () => {
            const redKeys = document.querySelectorAll('.key-error-hold');
            redKeys.forEach(k => k.classList.remove('key-error-hold'));
        };

        if (e.key === expectedChar) {
            // -- הצלחה --

            // קודם כל מנקים את כל האדומים שהיו (אם היו)
            clearRedKeys();

            currentSpan.classList.remove('current', 'error');
            currentSpan.classList.add('correct');
            
            // הדגשה ירוקה רגעית במקלדת
            if (visualKey) {
                visualKey.classList.add('key-success-flash');
                setTimeout(() => visualKey.classList.remove('key-success-flash'), 200);
            }
            
            currentStudyIndex++;
            correctCharsTotal++; // קידום המונה בגלל הצלחה
            
            if (currentStudyIndex >= currentStudyRow.length) {
                setTimeout(() => generateNewStudyRow(), 100);
            } else {
                spans[currentStudyIndex].classList.add('current');
            }
        } else {
            // -- טעות --

            // מנקים את האדום הקודם כדי שרק המקש הנוכחי יהיה אדום
            studyErrorsTotal++;
            clearRedKeys();

            currentSpan.classList.add('error');
            // הדגשה אדומה קבועה עד לתיקון
            if (visualKey) {
                visualKey.classList.add('key-error-hold');
            }
        }
    }
});

async function updateStudyMapUI() {
    let unlockedLevel = 1; // ברירת מחדל לאורח
    
    // משיכת השלב הפתוח של המשתמש המחובר
    const currentUser = getCurrentUser();
    if (currentUser) {
        const userData = await DB.getUserData(currentUser);
        unlockedLevel = userData.studyLevel;
    }

    // ושהם מסודרים מהראשון (שלב 1) עד האחרון
    const levelButtons = document.querySelectorAll('.learning-circle'); 
    
    levelButtons.forEach((btn, index) => {
        const levelNum = index + 1;
        
        if (levelNum <= unlockedLevel) {
            // השלב פתוח
            btn.classList.remove('locked-level');
            btn.disabled = false;
        } else {
            // השלב נעול
            btn.classList.add('locked-level');
            btn.disabled = true; // מונע לחיצה ב-HTML
        }
    });
}