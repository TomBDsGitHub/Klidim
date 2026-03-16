let currentLetter = "";
let successes = 0;
let errors = 0;
let timeLeft = 20;
let gameActive = false;
let timerInterval;

// פונקציה לבחירת אות אקראית - השארתי רק גרסה אחת תקינה!
function nextLetter() {
    // אנחנו מוודאים שאנחנו משתמשים ב-LETTER_LIST שמגיע מ-database.js
    if (typeof LETTER_LIST !== 'undefined' && LETTER_LIST.length > 0) {
        const randomIndex = Math.floor(Math.random() * LETTER_LIST.length);
        currentLetter = LETTER_LIST[randomIndex];
        document.getElementById('target-letter').innerText = currentLetter;
    } else {
        console.error("שגיאה: LETTER_LIST לא נמצא! וודא ש-database.js נטען לפני הקובץ הזה.");
        document.getElementById('target-letter').innerText = "!";
    }
}

function goToLevel(level) {
    if (level === 'easy') {
        document.querySelector('main').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
    }
}

function startGame() {
    // מסתירים את ההסבר ומראים את המשחק
    document.getElementById('start-overlay').classList.add('hidden');
    document.getElementById('stats-bar').classList.remove('hidden');
    document.getElementById('target-area').classList.remove('hidden');
    
    successes = 0;
    errors = 0;
    timeLeft = 20;
    gameActive = true;
    
    createKeyboard('keyboard-easy');
    updateStats();
    nextLetter(); // עכשיו זה לא יקרוס, אז הקוד ימשיך לטיימר
    
    // מנקים אינטרוול קודם אם היה כזה (ליתר ביטחון)
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function updateStats() {
    document.getElementById('success-count').innerText = successes;
    document.getElementById('error-count').innerText = errors;
}

// מאזין להקלדה
window.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    
    // בדיקה אם המקש שנלחץ הוא אכן האות המבוקשת
    if (e.key === currentLetter) {
        successes++;
        flashKey('keyboard-easy', e.key, 'correct');
    } else {
        errors++;
        flashKey('keyboard-easy', e.key, 'wrong');
        flashKey('keyboard-easy', currentLetter, 'correct'); // ידליק בירוק את המקש הנכון
    }
    updateStats();
    nextLetter();
});

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    
    const accuracy = Math.round((successes / (successes + errors)) * 100) || 0;
    document.getElementById('final-stats').innerHTML = `
        <p>הצלחות: ${successes}</p>
        <p>שגיאות: ${errors}</p>
        <p>דיוק: ${accuracy}%</p>
    `;
    document.getElementById('results-modal').classList.remove('hidden');
}

function resetGame() {
    document.getElementById('results-modal').classList.add('hidden');
    startGame();
}

function exitGame() {
    clearInterval(timerInterval);
    gameActive = false;
    
    // איפוס ויזואלי של המסכים
    document.getElementById('start-overlay').classList.remove('hidden');
    document.getElementById('stats-bar').classList.add('hidden');
    document.getElementById('target-area').classList.add('hidden');
    document.getElementById('results-modal').classList.add('hidden');

    showScreen('home-screen');
}