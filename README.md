```markdown
# Klidim (קלידים) - Touch Typing Master ⌨️

Klidim is an interactive, web-based touch typing course and practice platform tailored for the Hebrew language. It features a progressive learning map, multiple difficulty levels, and a local user management system to track personal high scores and accuracy.

## ✨ Key Features

* **Study Center (מרכז למידה):** A step-by-step learning map with 15 progressively difficult levels. 
    * *Progression Logic:* To unlock the next level, a user must achieve at least **80% accuracy** and correctly type a minimum of **35 characters** within the time limit.
* **Practice Game Modes:**
    * 🟢 **Easy (20s):** Quick-fire random letters to build muscle memory.
    * 🟡 **Medium (40s):** Full words. Typing a word flawlessly grants a "Perfect" bonus score and triggers a special visual effect.
    * 🔴 **Hard (60s):** Complete sentences requiring punctuation and high concentration.
* **Dynamic Virtual Keyboard:** An on-screen keyboard that highlights the correct finger placement for the home row. It provides real-time color-coded feedback (green for correct, red for wrong, and flash indicators).
* **User Management:** A fully functional mock backend using `localStorage` and `sessionStorage`. Users can register, log in, and save their progress, stats, and unlocked levels persistently across sessions.
* **Immersive UI:** A modern, glass-morphism interface set against an animated night sky background.

## 📁 Project Structure

The project is built using Vanilla HTML, CSS, and JavaScript. No external frameworks or build tools are required.

```text
Klidim/
├── index.html           # Main entry point, containing all UI screens and modals.
├── style.css            # Global styling, layout, glass-morphism effects, and animations.
├── keyboard.css         # Specific styling for the virtual keyboard and hand indicators.
├── database.js          # Simulated database logic (register, login, save scores/levels).
├── ui.js                # Screen navigation, menu handling, and authentication UI logic.
├── keyboard.js          # Logic for rendering the virtual keyboard and mapping physical keys to UI.
├── study_levels.js      # Logic for the 15-level learning path (timers, accuracy checks, unlocking).
├── game-easy.js         # Game loop and logic for the Easy mode.
├── game-medium.js       # Game loop and logic for the Medium mode.
├── game-hard.js         # Game loop and logic for the Hard mode.
├── LOGO.png             # Navigation logo.
├── typing_animation.gif # Homepage animation.
└── night_sky_v2.gif     # Global background animation.
```

## 🛠️ Technical Implementation Details

* **Keyboard Event Handling:** The app listens for `keydown` events, strictly preventing default behaviors for keys like `Space` to avoid page scrolling. It also includes an English language trap, alerting the user to switch their OS keyboard layout to Hebrew (Alt+Shift).
* **State Management:** Active intervals and game states are carefully managed (and cleared via `clearInterval()`) when transitioning between screens to prevent overlap or memory leaks.

## 🚀 How to Run Locally

Since this is a vanilla frontend application, you just need a basic local web server to run it properly (to avoid CORS issues with ES modules or local storage constraints). 

1. Open your terminal (e.g., WSL, PowerShell, or Command Prompt).
2. Navigate to the project directory:
   ```bash
   cd path/to/Klidim
   ```
3. Start a local HTTP server. You can easily do this using Python:
   ```bash
   python3 -m http.server 8000
   ```
4. Open your browser and navigate to: `http://localhost:8000`

## 🔮 Roadmap / Future Features
* Migration from `localStorage` to a real backend database (e.g., Node.js/Express or Firebase).
* Global leaderboards to compare scores with other typists.
* Additional localized layouts for English or numeric keypads.
```