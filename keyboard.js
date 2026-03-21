// keyboard.js

const HEBREW_LAYOUT = [
    ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
    ["", "/", "'", "ק", "ר", "א", "ט", "ו", "ן", "ם", "פ", "", "", ""],
    ["", "ש", "ד", "ג", "כ", "ע", "י", "ח", "ל", "ך", "ף", ",", "Enter"],
    ["Shift", "ז", "ס", "ב", "ה", "נ", "מ", "צ", "ת", "ץ", ".", "Shift"],
    ["Ctrl", "Fn", "Win", "Alt", " ", "Alt", "Ctrl", "", ""]
];

const FINGER_MAP = {
    // יד שמאל
    '1': 'pinky-right', 'q': 'pinky-right', '/': 'pinky-right', 'ש': 'pinky-right', 'ז': 'pinky-right', 'Tab': 'pinky-right', 'Caps': 'pinky-right',
    '2': 'ring-right', 'w': 'ring-right', "'": 'ring-right', 'ד': 'ring-right', 'ס': 'ring-right',
    '3': 'middle-right', 'e': 'middle-right', 'ק': 'middle-right', 'ג': 'middle-right', 'ב': 'middle-right',
    '4': 'index-right', '5': 'index-right', 'r': 'index-right', 'ר': 'index-right', 'א': 'index-right', 'ט': 'index-left', 'כ': 'index-right', 'ע': 'index-right', 'ה': 'index-right', 'נ': 'index-right',
    
    // יד ימין
    '6': 'index-left', '7': 'index-left', 'y': 'index-left', 'u': 'index-left', 'ו': 'index-left', 'י': 'index-left', 'ח': 'index-left', 'מ': 'index-left', 'צ': 'index-left',
    '8': 'middle-left', 'i': 'middle-left', 'ן': 'middle-left', 'ל': 'middle-left', 'ת': 'middle-left',
    '9': 'ring-left', 'o': 'ring-left', 'ם': 'ring-left', 'ך': 'ring-left', 'ץ': 'ring-left',
    '0': 'pinky-left', '-': 'pinky-left', 'פ': 'pinky-left', '=': 'pinky-left', '[': 'pinky-left', ']': 'pinky-left', 'ף': 'pinky-left', ',': 'pinky-left', '.': 'pinky-left', 'Backspace': 'pinky-left', 'Enter': 'pinky-left',
    
    // אגודלים
    ' ': 'thumb'
};

function createKeyboard(containerId, mode = 'none', activeKeysArray = []) {
    // mode יכול להיות: 'none' (רגיל), 'learning' (הכל צבוע), או 'home-row' (רק עמדת מוצא)
    const container = document.getElementById(containerId);
    if (!container) return;

    const homeRowKeys = ['ש', 'ד', 'ג', 'כ', 'ח', 'ל', 'ך', 'ף'];

    container.innerHTML = ""; // מנקה את המקלדת הקודמת אם קיימת
    const keyboardDiv = document.createElement('div');
    keyboardDiv.className = 'keyboard';

    HEBREW_LAYOUT.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        row.forEach(keyText => {
            const keyDiv = document.createElement('div');
            keyDiv.className = 'key';
            keyDiv.innerText = keyText;
            keyDiv.setAttribute('data-key', keyText);
            
            if (mode === 'learning') {
                const fingerClass = FINGER_MAP[keyText] || FINGER_MAP[keyText.toLowerCase()] || '';
                if (fingerClass) {
                    keyDiv.classList.add(fingerClass);
                }
            } else if (mode === 'home-row') {
                if (homeRowKeys.includes(keyText)) {
                    const fingerClass = FINGER_MAP[keyText] || '';
                    if (fingerClass) keyDiv.classList.add(fingerClass);
                }
            } else if (mode === 'study') {
                // צובע רק אם המקש נמצא במאגר של השלב הנוכחי
                if (activeKeysArray.includes(keyText)) {
                    const fingerClass = FINGER_MAP[keyText] || '';
                    if (fingerClass) keyDiv.classList.add(fingerClass);
                }
            }

            // עיצוב מקשים מיוחדים
            if (keyText === " ") keyDiv.classList.add('space');
            if (["Shift", "Backspace", "Enter", "Tab"].includes(keyText)) keyDiv.classList.add('wide');
            
            rowDiv.appendChild(keyDiv);
        });
        keyboardDiv.appendChild(rowDiv);
    });
    container.appendChild(keyboardDiv);
}

// פונקציה להדלקת מקש
function flashKey(containerId, keyChar, status) {
    const container = document.getElementById(containerId);
    // חיפוש המקש המתאים (טיפול ברווח בנפרד)
    const charToFind = (keyChar === " " || keyChar === "Space") ? " " : keyChar;
    const keyElement = container.querySelector(`[data-key="${charToFind}"]`);

    if (keyElement) {
        const className = status === 'correct' ? 'key-correct' : 'key-wrong';
        keyElement.classList.add(className);
        setTimeout(() => keyElement.classList.remove(className), 400);
    }
}

// הוסף את זה בתוך פונקציית createKeyboard או בסוף הקובץ
document.querySelectorAll('.finger').forEach(finger => {
    finger.addEventListener('mouseenter', () => {
        const fingerType = finger.classList[1]; // מקבל 'pinky', 'ring' וכו'
        document.querySelectorAll(`.key.${fingerType}`).forEach(key => {
            key.style.filter = "brightness(0.9)";
            key.style.transform = "scale(1.05)";
        });
    });
    
    finger.addEventListener('mouseleave', () => {
        document.querySelectorAll('.key').forEach(key => {
            key.style.filter = "";
            key.style.transform = "";
        });
    });
});