const HEBREW_LAYOUT = [
    ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
    ["", "/", "'", "ק", "ר", "א", "ט", "ו", "ן", "ם", "פ", "", "", ""],
    ["", "ש", "ד", "ג", "כ", "ע", "י", "ח", "ל", "ך", "ף", ",", "Enter"],
    ["Shift", "ז", "ס", "ב", "ה", "נ", "מ", "צ", "ת", "ץ", ".", "Shift"],
    ["Ctrl", "Fn", "Win", "Alt", " ", "Alt", "Ctrl", "", ""]
];

function createKeyboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
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