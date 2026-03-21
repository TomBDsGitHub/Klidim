// study_levels.js

let studyTimerInterval;
let studyTimeLeft = 40;
let currentStudyRow = "";
let currentStudyIndex = 0;
let currentStudyLevelKeys = [];
let isStudyActive = false;
let correctCharsTotal = 0; // מונה תווים נכונים
let currentLevelPlaying = 1; // לשמירת השלב הנוכחי לטובת "נסה שוב"

const LEVEL_KEYS = {
    1: ['ח', 'כ'], 
    2: ['ל', 'ג'], 
    3: ['ך', 'ד'], 
    4: ['ף', 'ש'],
    5: ['פ', '.', ',', '0'], 
    6: ['9', 'ם', 'ץ'], 
    7: ['8', 'ן', 'ת'],
    8: ['7', 'ו', 'צ', 'מ', 'י', 'ט', '6'], 
    9: ['4', '5', 'א', 'ע', 'נ', 'ה', 'ר'],
    10: ['3', 'ק', 'ב'], 
    11: ['2', "'", 'ס'], 
    12: ['1', '/', 'ז']
};

function getAccumulatedKeys(level) {
    let keys = [' ']; 
    for (let i = 1; i <= level; i++) {
        if (LEVEL_KEYS[i]) keys = keys.concat(LEVEL_KEYS[i]);
    }
    return keys;
}

// פונקציה ראשונה - מציגה את מסך השלב עם ה-Overlay
function startStudyLevel(levelNumber) {
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

function endStudyLevel() {
    isStudyActive = false;
    clearInterval(studyTimerInterval);
    
    // הצגת תוצאות
    document.getElementById('study-game-area').classList.add('hidden');
    document.getElementById('study-results-modal').classList.remove('hidden');
    document.getElementById('correct-chars-count').innerText = correctCharsTotal;
}

// האזנה למקלדת
document.addEventListener('keydown', (e) => {
    if (isStudyActive && !document.getElementById('level-play-screen').classList.contains('hidden')) {
        if (['Shift', 'CapsLock', 'Alt', 'Control'].includes(e.key)) return;
        if (e.key === ' ') e.preventDefault();
        
        const expectedChar = currentStudyRow[currentStudyIndex];
        const spans = document.querySelectorAll('#study-text-container .study-char');
        const currentSpan = spans[currentStudyIndex];
        
        if (e.key === expectedChar) {
            currentSpan.classList.remove('current', 'error');
            currentSpan.classList.add('correct');
            
            currentStudyIndex++;
            correctCharsTotal++; // קידום המונה בגלל הצלחה
            
            if (currentStudyIndex >= currentStudyRow.length) {
                setTimeout(() => generateNewStudyRow(), 100);
            } else {
                spans[currentStudyIndex].classList.add('current');
            }
        } else {
            currentSpan.classList.add('error');
            // מונה השגיאות לא מופיע בציון הסופי אז לא הוספתי, אבל אפשר להוסיף אם תרצה
        }
    }
});