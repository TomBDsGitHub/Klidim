// game-hard.js

let currentSentence = "";
let hardCharIndex = 0;
let hardErrors = 0;
let hardSuccesses = 0;
let hardTimeLeft = 60;

function startHardGame() {
    // 1. עצירה וניקוי מוחלט של אינטרוולים קודמים
    clearInterval(hardInterval);
    hardActive = false;
    
    // 2. איפוס משתנים
    hardErrors = 0;
    hardSuccesses = 0;
    hardCharIndex = 0;
    hardTimeLeft = 60;

    createKeyboard('keyboard-hard');
    // 3. עדכון תצוגה (הסתרת מודאלים קודמים)
    document.getElementById('start-overlay-hard').classList.add('hidden');
    document.getElementById('results-modal-hard').classList.add('hidden');
    document.getElementById('stats-bar-hard').classList.remove('hidden');
    document.getElementById('target-area-hard').classList.remove('hidden');

    // 4. איפוס טקסט הסטטיסטיקה
    document.getElementById('chars-count-hard').innerText = "0";
    document.getElementById('accuracy-hard').innerText = "100";
    document.getElementById('timer-hard').innerText = hardTimeLeft;
    
    nextSentence();

    hardActive = true;
    
    // 5. התחלת הטיימר
    hardInterval = setInterval(() => {
        hardTimeLeft--;
        
        // עדכון התצוגה
        document.getElementById('timer-hard').innerText = hardTimeLeft;
        
        // בדיקה אם הזמן נגמר
        if (hardTimeLeft <= 0) {
            clearInterval(hardInterval); // עצירת הלופ!
            hardTimeLeft = 0; 
            document.getElementById('timer-hard').innerText = "0";
            endHardGame(); // קריאה לפונקציית הסיום
        }
    }, 1000);
}

function nextSentence() {
    const randomIndex = Math.floor(Math.random() * SENTENCE_LIST.length);
    currentSentence = SENTENCE_LIST[randomIndex];
    hardCharIndex = 0;
    
    const display = document.getElementById('sentence-display');
    display.innerHTML = ""; 
    
    for (let i = 0; i < currentSentence.length; i++) {
        const span = document.createElement('span');
        span.innerText = currentSentence[i];
        span.className = "letter";
        if (currentSentence[i] === " ") span.classList.add("space");
        if (i === 0) span.classList.add("active"); // סימון האות הראשונה
        display.appendChild(span);
    }
}

window.addEventListener('keydown', (e) => {
    // אם המשחק לא פעיל או שהלחיצה היא מקש מערכת (כמו Alt/Shift)
    if (!hardActive) return;
    if (e.key.length > 1 && e.key !== " ") return;

    const letters = document.querySelectorAll('#sentence-display .letter');
    if (!letters || letters.length === 0) return;

    const expectedChar = currentSentence[hardCharIndex];
    
    if (e.key === expectedChar) {
        letters[hardCharIndex].classList.add('correct');
        hardSuccesses++;
        flashKey('keyboard-hard', e.key, 'correct');
    } else {
        letters[hardCharIndex].classList.add('wrong');
        hardErrors++;
        flashKey('keyboard-hard', e.key, 'wrong');
        flashKey('keyboard-hard', currentSentence[hardCharIndex], 'correct');
    }

    letters[hardCharIndex].classList.remove('active');
    hardCharIndex++;

    if (hardCharIndex < currentSentence.length) {
        letters[hardCharIndex].classList.add('active');
    } else {
        // סיום משפט - עובר למשפט הבא
        setTimeout(nextSentence, 300);
    }

    updateHardStats();
});

function updateHardStats() {
    // עדכון מונה התווים בזמן אמת
    document.getElementById('chars-count-hard').innerText = hardSuccesses;

    // חישוב דיוק
    const total = hardSuccesses + hardErrors;
    const acc = total > 0 ? Math.round((hardSuccesses / total) * 100) : 100;
    document.getElementById('accuracy-hard').innerText = acc;
}

function exitGameHard() {
    clearInterval(hardInterval);
    hardActive = false; // מכבה את המשחק כדי שהמאזין למקלדת יפסיק לעבוד
    
    // החזרת ה-Overlay למצב מוכן לפעם הבאה
    document.getElementById('start-overlay-hard').classList.remove('hidden');
    document.getElementById('stats-bar-hard').classList.add('hidden');
    document.getElementById('target-area-hard').classList.add('hidden');
    
    showScreen('home-screen');
}

function resetHardGame() {
    startHardGame();
}

// function exitGameHard() {
//     clearInterval(hardInterval);
//     hardActive = false;
//     showScreen('home-screen');
// }

function endHardGame() {
    hardActive = false; // חשוב מאוד! עוצר את הקלט מהמקלדת
    clearInterval(hardInterval); // ליתר ביטחון
    
    const total = hardSuccesses + hardErrors;
    const acc = total > 0 ? Math.round((hardSuccesses / total) * 100) : 0;
    
    document.getElementById('final-stats-hard').innerHTML = `
        <p>דיוק: ${acc}%</p>
        <p>תווים שהוקלדו: ${hardSuccesses}</p>
        <p>טעויות: ${hardErrors}</p>
    `;
    document.getElementById('results-modal-hard').classList.remove('hidden');
}