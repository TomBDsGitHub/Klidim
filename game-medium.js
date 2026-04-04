// game-medium.js

let currentWord = "";
let charIndex = 0;
let mediumScore = 0;
let mediumTimeLeft = 40;
let mediumErrors = 0;
let wordHasError = false; // למעקב אחרי בונוס מילה מושלמת

function startMediumGame() {
    // עצירת אינטרוול קודם ליתר ביטחון
    clearInterval(mediumInterval); 

    document.getElementById('start-overlay-medium').classList.add('hidden');
    document.getElementById('stats-bar-medium').classList.remove('hidden');
    document.getElementById('target-area-medium').classList.remove('hidden');
    document.getElementById('results-modal-medium').classList.add('hidden');
    
    mediumScore = 0;
    mediumErrors = 0;
    mediumTimeLeft = 40;
    mediumActive = true;
    
    createKeyboard('keyboard-medium');
    updateMediumStats();
    nextWord();
    
    mediumInterval = setInterval(() => {
        mediumTimeLeft--;
        document.getElementById('timer-medium').innerText = mediumTimeLeft;
        if (mediumTimeLeft <= 0) endMediumGame();
    }, 1000);
}

function nextWord() {
    const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
    currentWord = WORD_LIST[randomIndex];
    charIndex = 0;
    wordHasError = false;
    
    const display = document.getElementById('word-display');
    display.innerHTML = ""; // מנקים את המילה הקודמת
    
    // יוצרים אלמנט לכל אות
    for (let char of currentWord) {
        const span = document.createElement('span');
        span.innerText = char;
        span.className = "letter";
        display.appendChild(span);
    }
}

window.addEventListener('keydown', (e) => {
    // בדיקה אם המקש הוא רווח ואם אנחנו בתוך משחק פעיל
    if (e.code === "Space") {
        e.preventDefault(); // זה השורה שמונעת את הקפיצה למטה!
    }
    if (!mediumActive) return;
    if (e.key.length > 1) return;

    // בדיקת שפה
    if (isEnglish(e.key)) {
        document.getElementById('language-alert').classList.remove('hidden');
        return;
    }

    const letters = document.querySelectorAll('#word-display .letter');
    const expectedChar = currentWord[charIndex];

    if (e.key === expectedChar) {
        letters[charIndex].classList.add('correct');
        mediumScore++;
        flashKey('keyboard-medium', e.key, 'correct');
    } else {
        letters[charIndex].classList.add('wrong');
        wordHasError = true;
        mediumErrors++;
        flashKey('keyboard-medium', e.key, 'wrong');
        flashKey('keyboard-medium', currentWord[charIndex], 'correct');
        // לפי האפיון שלך: שגיאה מוסיפה נקודה למונה השגיאות (כאן נקרא לו ניקוד לצורך הפשטות)
    }

    charIndex++;

    // בדיקה אם סיימנו את המילה
    if (charIndex === currentWord.length) {
        if (!wordHasError) {
            mediumScore += currentWord.length; // בונוס מילה מושלמת
            showBonusEffect(); // הפעלת האפקט המגניב
        }
        
        // מעבר למילה הבאה אחרי דיליי קטן כדי שהמשתמש יראה את האות האחרונה הופכת לירוקה
        setTimeout(nextWord, 200);
    }

    updateMediumStats();
});

// פונקציה לאפקט הבונוס ליד הניקוד
function showBonusEffect() {
    const scoreBox = document.getElementById('score-medium').parentElement;
    
    // יצירת אלמנט של כוכב או סימן אחר
    const bonusSign = document.createElement('span');
    bonusSign.innerText = " ✨ PERFECT!";
    bonusSign.style.color = "#ffcc00";
    bonusSign.style.fontWeight = "bold";
    bonusSign.style.position = "absolute";
    bonusSign.style.animation = "bounce 1s ease"; // הנפשה
    
    scoreBox.appendChild(bonusSign);
    
    // מחיקת הסימן אחרי חצי שנייה
    setTimeout(() => {
        bonusSign.remove();
    }, 1000);
}

function updateMediumStats() {
    document.getElementById('score-medium').innerText = mediumScore;
}

async function endMediumGame() {
    mediumActive = false;
    clearInterval(mediumInterval);

    // שמירה במסד הנתונים ורענון האזור האישי
    const accuracy = mediumScore > 0 ? (mediumScore / (mediumScore + mediumErrors)) * 100 : 0;
    const currentUser = getCurrentUser();
    if (currentUser) {
        await DB.saveGameRecord(currentUser, 'medium', mediumScore, accuracy);
        updateProfileUI(); // מעדכן את האזור האישי מאחורי הקלעים
    }

    document.getElementById('final-stats-medium').innerHTML = `<p>ניקוד סופי: ${mediumScore}</p>`;
    document.getElementById('results-modal-medium').classList.remove('hidden');
}


function exitGameMedium() {
    // עצירת הטיימר של הרמה הבינונית
    clearInterval(mediumInterval);
    mediumActive = false;

    // איפוס ויזואלי של המסך (שבפעם הבאה יראו שוב את ההסבר)
    document.getElementById('start-overlay-medium').classList.remove('hidden');
    document.getElementById('stats-bar-medium').classList.add('hidden');
    document.getElementById('target-area-medium').classList.add('hidden');
    document.getElementById('results-modal-medium').classList.add('hidden');

    // חזרה למסך הבית
    showScreen('home-screen');
}

function resetMediumGame() {
    // 1. הסתרת המודאל של התוצאות
    document.getElementById('results-modal-medium').classList.add('hidden');
    
    // 2. קריאה לפונקציית ההתחלה שכבר כתבנו
    startMediumGame();
}