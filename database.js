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
    // --- 1. הרשמה (עם בדיקות אורך) ---
    async register(username, password) {
        // בדיקת תקינות מקומית (חוסך פנייה מיותרת לשרת)
        if (username.length < 3 || password.length < 4) {
            throw "שם משתמש לפחות 3 תווים, סיסמה לפחות 4.";
        }

        const userRef = fb.ref(fb.database, 'users/' + username);
        const snapshot = await fb.get(userRef);
        
        if (snapshot.exists()) {
            throw "שם המשתמש כבר תפוס!";
        }

        const newUser = {
            username: username,
            password: password,
            studyLevel: 1,
            studyBestScore: 0,
            studyBestAcc: 0,
            records: { easy: 0, medium: 0, hard: 0 },
            accuracy: { easy: 0, medium: 0, hard: 0 },
            gameCounts: { easy: 0, medium: 0, hard: 0 },
            studyLevelAttempts: {}
        };

        await fb.set(userRef, newUser);
        return newUser;
    },

    // --- 2. התחברות ---
    async login(username, password) {
        const userRef = fb.ref(fb.database, 'users/' + username);
        const snapshot = await fb.get(userRef);
        
        if (snapshot.exists()) {
            const user = snapshot.val();
            if (user.password === password) {
                return user;
            }
        }
        throw "שם משתמש או סיסמה שגויים.";
    },

    // --- 3. שמירת תוצאה (עם מונה משחקים) ---
    async saveGameRecord(username, mode, score, accuracy) {
        const userRef = fb.ref(fb.database, 'users/' + username);
        const snapshot = await fb.get(userRef);
        if (!snapshot.exists()) return;

        const user = snapshot.val();
        const updates = {};

        // עדכון מונה משחקים (תמיד קורה)
        const currentCounts = user.gameCounts || { easy: 0, medium: 0, hard: 0 };
        updates[`gameCounts/${mode}`] = (currentCounts[mode] || 0) + 1;

        // עדכון שיא (דיוק 80%+)
        if (accuracy >= 80) {
            const best = (user.records && user.records[mode]) || 0;
            if (score > best) {
                updates[`records/${mode}`] = score;
                updates[`accuracy/${mode}`] = accuracy;
            }
        }

        return fb.update(userRef, updates);
    },

    // --- 4. עדכון שלב לימודי (עם מונה ניסיונות) ---
    async updateStudyLevel(username, currentLevelPlaying, score, accuracy) {
        const userRef = fb.ref(fb.database, 'users/' + username);
        const snapshot = await fb.get(userRef);
        if (!snapshot.exists()) return;

        const user = snapshot.val();
        const updates = {};

        // עדכון ניסיונות לשלב
        const attempts = user.studyLevelAttempts || {};
        updates[`studyLevelAttempts/${currentLevelPlaying}`] = (attempts[currentLevelPlaying] || 0) + 1;

        // שמירת שיא לשלב הנוכחי
        if (score > (user.studyBestScore || 0)) {
            updates['studyBestScore'] = score;
            updates['studyBestAcc'] = accuracy;
        }

        // לוגיקת מעבר שלב
        if (score >= 35 && accuracy >= 80 && currentLevelPlaying === user.studyLevel) {
            updates['studyLevel'] = user.studyLevel + 1;
            updates['studyBestScore'] = 0;
            updates['studyBestAcc'] = 0;
        }

        await fb.update(userRef, updates);
        
        // החזרת הערך המעודכן
        const newSnapshot = await fb.get(userRef);
        return newSnapshot.val().studyLevel;
    },

    // --- 5. שליפת נתונים ---
    async getUserData(username) {
        const userRef = fb.ref(fb.database, 'users/' + username);
        const snapshot = await fb.get(userRef);
        return snapshot.exists() ? snapshot.val() : null;
    },

    async getAllUsers() {
        const usersRef = fb.ref(fb.database, 'users');
        const snapshot = await fb.get(usersRef);
        return snapshot.exists() ? Object.values(snapshot.val()) : [];
    }
};

// database.js - עדכון בלוק הטעינה
document.addEventListener('DOMContentLoaded', async () => {
    // נבדוק גם ב-session וגם ב-local (כדי להיות בטוחים)
    const savedUser = sessionStorage.getItem('activeUser') || localStorage.getItem('currentUser');
    
    if (savedUser) {
        setCurrentUser(savedUser); // עדכון המשתנה הפנימי ב-database.js
        
        // נחכה רגע קט שה-DOM והסקריפטים האחרים יסיימו להיטען
        setTimeout(() => {
            if (typeof finishLogin === 'function') {
                finishLogin(savedUser);
            } else if (typeof updateUIForUser === 'function') {
                updateUIForUser(savedUser);
            }
        }, 100);
    }
});

async function printAdminStats() {
    const users = await DB.getAllUsers();
    
    let totalGames = 0;
    const levelPopularity = { easy: 0, medium: 0, hard: 0 };
    const stuckPoints = {};

    users.forEach(u => {
        if (u.gameCounts) {
            levelPopularity.easy += u.gameCounts.easy || 0;
            levelPopularity.medium += u.gameCounts.medium || 0;
            levelPopularity.hard += u.gameCounts.hard || 0;
            totalGames += (u.gameCounts.easy + u.gameCounts.medium + u.gameCounts.hard);
        }
        stuckPoints[`שלב ${u.studyLevel}`] = (stuckPoints[`שלב ${u.studyLevel}`] || 0) + 1;
    });

    console.log(`%c --- דוח סטטיסטיקה למנהל (${totalGames} משחקים) --- `, "color: white; background: #2c3e50; font-weight: bold; padding: 5px;");
    
    console.log("📊 פופולריות רמות:");
    console.table(levelPopularity); // יציג טבלה של קל/בינוני/קשה

    console.log("📍 התפלגות משתמשים לפי שלבים:");
    console.table(stuckPoints); // יציג כמה משתמשים יש בכל שלב
}

// פונקציה שתבדוק אם המשתמש הוא אתה
function showAdminButtonIfManager() {
    const managerName = "Tom"; // כאן תכתוב את שם המשתמש שלך ב-Firebase
    if (getCurrentUser() == managerName) {
        console.log("%c Admin Mode: הקלד printAdminStats() כדי לראות נתונים", "color: #2ecc71; font-weight: bold;");
        
        // אופציונלי: יצירת כפתור פיזי שמופיע רק לך במסך הפרופיל
        const adminBtn = document.createElement('button');
        adminBtn.innerText = "📊 דוח מנהל";
        adminBtn.className = "admin-only-btn"; // תוסיף לו עיצוב ב-CSS
        adminBtn.onclick = printAdminStats;
        document.getElementById('profile-screen').appendChild(adminBtn);
    }
}

showAdminButtonIfManager();

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
    // --- מילים נפוצות ובסיסיות (אצבעות הבית) ---
    "שלום", "בית", "מקלדת", "עברית", "מחשב", "מסך", "עכבר", "כפתור", "אתר", "קוד",
    "ספר", "שולחן", "כיסא", "חלון", "דלת", "קיר", "תקרה", "רצפה", "אור", "חשמל",
    
    // --- טבע וסביבה (גיוון באותיות ע, ר, ש, ל) ---
    "שמש", "ירח", "כוכב", "שמים", "ענן", "גשם", "שלג", "רוח", "סערה", "אדמה",
    "ים", "אוקיינוס", "נהר", "נחל", "אגם", "הרים", "עמק", "יער", "עץ", "פרח",
    "דשא", "חול", "סלע", "מדבר", "שדה", "צמח", "טבע", "נוף", "אוויר", "עולם",
    
    // --- בעלי חיים (גיוון באותיות ח, כ, ד, ב, פ) ---
    "כלב", "חתול", "סוס", "אריה", "פיל", "נמר", "דוב", "קוף", "ארנב", "עכבר",
    "ציפור", "יונה", "נשר", "תוכי", "דג", "כריש", "לוויתן", "נחש", "צבי", "פרה",
    
    // --- אוכל ושתייה (גיוון באותיות ט, פ, ז, ס) ---
    "לחם", "מים", "חלב", "גבינה", "ביצה", "אורז", "מרק", "סלט", "פרי", "ירק",
    "תפוח", "בננה", "ענבים", "מיץ", "קפה", "תה", "סוכר", "מלח", "פלפל", "שוקולד",
    
    // --- זמן ומושגים (גיוון באותיות ז, מ, נ, ת) ---
    "זמן", "שעה", "דקה", "שנייה", "יום", "לילה", "בוקר", "ערב", "שבוע", "חודש",
    "שנה", "תאריך", "עבר", "הווה", "עתיד", "אתמול", "היום", "מחר", "תמיד", "לפעמים",
    
    // --- גוף האדם ורגשות (גיוון באותיות א, י, ד, ג) ---
    "ראש", "עין", "אוזן", "אף", "פה", "יד", "רגל", "גב", "לב", "בטן",
    "שמחה", "עצב", "צחוק", "דמעות", "פחד", "כעס", "אהבה", "חבר", "משפחה", "אדם",
    
    // --- פעלים ותנועה (גיוון באותיות סופיות ך, ף, ץ, ן, ם) ---
    "הולך", "רץ", "קופץ", "יושב", "עומד", "כותב", "קורא", "מדבר", "שומע", "רואה",
    "חושב", "יודע", "לומד", "עושה", "נותן", "לוקח", "פותח", "סוגר", "מתחיל", "גומר",
    
    // --- תארים (גיוון באותיות צ, ק, ט) ---
    "גדול", "קטן", "חדש", "ישן", "טוב", "רע", "יפה", "מכוער", "חם", "קר",
    "מהר", "לאט", "חזק", "חלש", "קשה", "קל", "רחוק", "קרוב", "גבוה", "נמוך",
    
    // --- צבעים ---
    "לבן", "שחור", "אדום", "כחול", "ירוק", "צהוב", "כתום", "סגול", "חום", "אפור",
    
    // --- מילים ארוכות ומורכבות יותר ---
    "הזדמנות", "מצוינות", "התקדמות", "משמעות", "אחריות", "סבלנות", "יצירתיות", "טכנולוגיה", "הצלחה", "מטרה",
    "חשיבות", "יכולת", "ביטחון", "מערכת", "תוכנה", "פיתוח", "מהירות", "דיוק", "תרגול", "התמדה",
    
    // --- מקומות ומדינות ---
    "ישראל", "עיר", "כפר", "מושב", "קיבוץ", "רחוב", "שכונה", "מרכז", "חנות", "קניון",
    "בית ספר", "אוניברסיטה", "ספריה", "גינה", "פארק", "מוזיאון", "קולנוע", "תאטרון", "נמל", "שדה תעופה",
    
    // --- מילים עם אותיות נדירות (ץ, ז, ט, ס) ---
    "עציץ", "חפץ", "קיץ", "חורף", "ארץ", "זהב", "זכוכית", "זבוב", "טיסה", "טלפון",
    "טקסט", "טעות", "טיפול", "סולם", "סירה", "סיפור", "סמל", "סוף", "סבל", "סטודנט"
];

const SENTENCE_LIST = [
    // --- משפטים נקיים לזרימה ומהירות (ללא פיסוק) ---
    "הקלדה עיוורת היא כלי מצוין לחיים",
    "האצבעות שלי זזות מהר על המקשים",
    "אני לומד להקליד בלי להסתכל על הלוח",
    "חשוב לשמור על גב ישר בזמן העבודה",
    "הצלחה מגיעה למי שמתרגל בכל יום",
    "מקלדת טובה עוזרת לכתוב מהר יותר",
    "השמש זורחת מעל העיר הגדולה",
    "ילדים משחקים בכדור בגן השעשועים",
    "אני רוצה להיות הכי מהיר בכיתה",
    "מחשב חזק מאפשר פיתוח תוכנה מהיר",
    "מים קרים הם הפתרון הכי טוב לחום",
    "החתול ישן על הכיסא בחדר העבודה",
    "ללמוד שפה חדשה זה תמיד רעיון טוב",
    "הדרך הביתה עוברת דרך השדה הירוק",
    "מוזיקה שקטה עוזרת לי להתרכז במשימה",
    "ספר מרתק יכול לשנות את המחשבה",
    "טיול בטבע נותן כוח להמשך השבוע",
    "אוכל טעים עושה את כולם שמחים",
    "קפיצה למים ביום חם זה תענוג",
    "השמיים כחולים והעננים לבנים מאוד",
    "מיץ תפוזים טרי זה פשוט מעולה",
    "רכיבה על אופניים היא ספורט בריא",
    "אני כותב קוד בתוך סביבת עבודה",
    "המסך שלי מציג תמונות יפות מאוד",
    "שולחן עץ כבד עומד במרכז החדר",
    "מכתב ישן נמצא בתוך המגירה",
    "הזמן עובר מהר כשנהנים מהעבודה",
    "אור חזק נכנס דרך החלון הפתוח",
    "עבודה קשה מובילה לתוצאות טובות",
    "חבר טוב תמיד יודע להקשיב",

    // --- משפטים עם פסיק (,) ונקודה (.) באמצע ---
    "שלום, בואו נתחיל את התרגול עכשיו.",
    "הנה פסיק, ופה יש נקודה. הכל זורם.",
    "לאט, בזהירות, צעד אחר צעד למעלה.",
    "אחד, שתיים, שלוש. בדיקה של המקשים.",
    "בית, ספר, עבודה. סדר יום עמוס.",
    "מים, לחם, גבינה. ארוחה טובה ופשוטה.",
    "עצור, תחשוב, תמשיך. הדיוק הוא המפתח.",
    "הכל טוב, הכל נעים. המשחק רק מתחיל.",
    "מהר, חזק, רחוק. המילים עפות על המסך.",
    "שחור, לבן, אפור. צבעי המקלדת שלי.",
    "קפה, תה, סוכר. רגע של הפסקה נעימה.",
    "חתול, כלב, סוס. בעלי חיים בגינה.",
    "עץ, פרח, דשא. הטבע מסביבנו פורח.",
    "ים, חול, שמיים. חופשה בקיץ החם.",
    "רוח, גשם, ענן. החורף כבר כאן אצלנו.",

    // --- משפטים נקיים נוספים ---
    "השמיים בלילה מלאים בכוכבים נוצצים",
    "ספינה גדולה מפליגה בלב האוקיינוס",
    "פרחים אדומים צומחים ליד השביל",
    "מורה טוב יודע להסביר בסבלנות",
    "הצבע הסגול הוא הצבע האהוב עלי",
    "ריצת בוקר נותנת המון אנרגיה",
    "אני אוהב לאכול פירות בקיץ",
    "המקלדת שלי משמיעה צליל נעים",
    "תמיד כדאי לבדוק את העבודה שוב",
    "חלום ישן יכול להפוך למציאות",
    "המדבר שקט מאוד בשעות הלילה",
    "יער עבות נמצא מעבר להרים",
    "גשר ארוך מחבר בין שני חלקי העיר",
    "תחנת רכבת עמוסה באנשים בבוקר",
    "שוקולד מריר הוא הקינוח הכי טעים",
    "סרט פעולה מעניין בטלוויזיה עכשיו",
    "אני לומד לתכנת בשפת פייתון",
    "הכלב שלי אוהב לרוץ אחרי כדור",
    "גינה קטנה עם הרבה צמחי תבלין",
    "ארוחת ערב משפחתית זה זמן איכות",

    // --- משפטים עם גרש (') וסלאש (/) ---
    "האות 'ל' נמצאת ליד האות 'ך' פה",
    "המילה 'שלום' והמילה 'בית' בטקסט",
    "לחץ על 'א' ואז על 'ב' לפי הסדר",
    "הסימן 'סלאש' נמצא למטה ליד הדיוק",
    "זה 'קל' וזה 'כיף' וזה פשוט מאוד",
    "התאריך הוא 01/01 שנה חדשה הגיעה",
    "בחרו כן/לא והמשיכו לשלב הבא מיד",
    "היחס הוא 1/2 חצי מהעבודה מאחור",
    "זכר/נקבה הכל רשום בטופס הירוק",
    "לחץ על קונטרול/אלט לשנוי הגדרות",
    "היום/מחר זה לא משנה העיקר לתרגל",
    "קריאה/כתיבה הן מיומנויות חשובות",
    "מהירות/דיוק מה חשוב לכם עכשיו",
    "שחור/לבן בחרו את העיצוב שלכם",
    "יום/לילה המקלדת תמיד מוכנה",

    // --- משפטים נקיים לסיום (בניית ביטחון) ---
    "כל יום אני משתפר עוד קצת",
    "הידיים שלי כבר לא מתעייפות מהר",
    "זה מדהים להקליד בלי להסתכל למטה",
    "אני מרגיש כמו מקצוען על המקלדת",
    "עוד מעט אסיים את כל הקורס הזה",
    "התרגול הזה באמת עוזר לי מאוד",
    "אני יכול לכתוב הודעות מהר מאוד",
    "המחשב שלי הוא החבר הכי טוב שלי",
    "אני אוהב לראות את המילים על המסך",
    "הקלדה עיוורת היא כוח אמיתי בידיים",
    "ישיבה נכונה מונעת כאבי גב מיותרים",
    "האצבעות זוכרות איפה כל מקש נמצא",
    "כיף לראות את אחוז הדיוק עולה",
    "אני מתאמן כדי להצליח בעבודה שלי",
    "שקט בחדר עוזר לי להתרכז בתרגול",
    "המסך מציג את ההתקדמות שלי בגאווה",
    "עוד שלב אחד וסיימתי את הרמה הקשה",
    "מיומנות הקלדה חוסכת המון זמן יקר",
    "אני מקליד בשביל הכיף וההנאה שלי"
];