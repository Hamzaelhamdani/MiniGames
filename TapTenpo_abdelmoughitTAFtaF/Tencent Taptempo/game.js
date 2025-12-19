// Game Configuration
const levels = [
    { duration: 60, text: "The quick brown fox jumps over the lazy dog. Only speed reveals true focus. Keep typing and do not stop until you finish the level." },
    { duration: 55, text: "Speed is the essence of war. Take advantage of your enemy's unpreparedness; travel by unexpected routes and strike him where he has taken no precautions." },
    { duration: 50, text: "To create something exceptional, your mindset must be relentlessly focused on the smallest detail. Every keystroke matters in the grand scheme of things." },
    { duration: 45, text: "Focus is not just about what you do, but what you choose not to do. Ignore distractions and let your fingers dance across the keyboard with precision." },
    { duration: 40, text: "In the middle of difficulty lies opportunity. Do not let the ticking clock intimidate you. It is merely a measure of your potential waiting to be unleashed." },
    { duration: 35, text: "Success is the sum of small efforts, repeated day in and day out. Type faster, typo harder, but never give up on the rhythm of the game." },
    { duration: 30, text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. As with all matters of the heart, you'll know." },
    { duration: 25, text: "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma – which is living with the results of other people's thinking." },
    { duration: 20, text: "Stay hungry, stay foolish. Push beyond your limits. The timer is ticking faster now. Can you keep up with the tempo of your own ambition?" },
    { duration: 15, text: "Final Level. Maximum Speed. This is the ultimate test of your focus and dexterity. Unleash everything you have and cross the finish line!" }
];

let currentLevelIndex = 0;
let timeLeft = 0;
let timerInterval = null;
let isPlaying = false;
let timerStarted = false;

// DOM Elements
const currentLevelEl = document.getElementById('current-level');
const timerEl = document.getElementById('timer');
const targetTextEl = document.getElementById('target-text');
const inputBox = document.getElementById('input-box');

// Initialize Game
function initGame() {
    currentLevelIndex = 0;
    startLevel(currentLevelIndex);

    inputBox.addEventListener('input', handleInput);
    // Prevent pasting to ensure typing
    inputBox.addEventListener('paste', (e) => e.preventDefault());
}


function startLevel(index) {
    if (index >= levels.length) {
        gameWon();
        return;
    }

    const level = levels[index];
    currentLevelEl.textContent = index + 1;
    timeLeft = level.duration;
    timerStarted = false; // Reset start flag
    updateTimerDisplay();

    // Setup Text
    targetTextEl.innerHTML = '';
    level.text.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        span.classList.add('char');
        targetTextEl.appendChild(span);
    });

    inputBox.value = '';
    inputBox.focus();

    isPlaying = true;
    clearInterval(timerInterval); // Ensure no timer is running
}

function startTimer() {
    if (!timerStarted) {
        timerStarted = true;
        timerInterval = setInterval(updateTimer, 1000);
    }
}

function updateTimer() {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
        gameOver();
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerEl.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    if (timeLeft <= 10) {
        timerEl.style.color = 'red';
    } else {
        timerEl.style.color = '#FF7900';
    }
}

function handleInput() {
    if (!isPlaying) return;

    // Start timer on first input
    if (!timerStarted && inputBox.value.length > 0) {
        startTimer();
    }

    const inputVal = inputBox.value;
    const targetText = levels[currentLevelIndex].text;
    const charSpans = targetTextEl.querySelectorAll('.char');

    // Check each character
    let allCorrectSoFar = true;
    charSpans.forEach((span, index) => {
        const char = inputVal[index];
        if (char == null) {
            span.classList.remove('correct', 'incorrect');
            allCorrectSoFar = false;
        } else if (char === span.textContent) {
            span.classList.add('correct');
            span.classList.remove('incorrect');
        } else {
            span.classList.add('incorrect');
            span.classList.remove('correct');
            allCorrectSoFar = false;
        }
    });

    // Check Level Completion
    if (inputVal === targetText) {
        clearInterval(timerInterval);
        isPlaying = false; // Stop input interaction
        inputBox.blur(); // Remove focus

        // Success reset retries for next level
        retryCount = 0;
        showLevelComplete();
    }
}

let retryCount = 0;
const MAX_RETRIES = 3;

function showLevelComplete() {
    const section = document.getElementById('level-complete-section');
    section.style.display = 'flex';
    section.scrollIntoView({ behavior: 'smooth' });
}

function showLevelFailed(accuracy) {
    const section = document.getElementById('level-failed-section');
    document.getElementById('failed-accuracy').textContent = Math.floor(accuracy) + '%';
    section.style.display = 'flex';
    section.scrollIntoView({ behavior: 'smooth' });

    // Update button text if last retry
    const retryBtn = document.getElementById('retry-btn');
    if (retryCount >= MAX_RETRIES - 1) { // 3rd attempt is index 2, if we failed 2 times, this is the 3rd fail. Wait. MAX_RETRIES is 3. 
        // Logic: if retryCount reaches 3 failures, next click is restart.
        // Actually, let's track failures.
        // If user fails 3 times, they restart.
    }

    // Simply:
    if (retryCount >= MAX_RETRIES - 1) {
        retryBtn.textContent = 'Restart Game';
    } else {
        retryBtn.textContent = `Retry! (${MAX_RETRIES - 1 - retryCount} left)`;
    }
    // Correction: User requested "in three times he should restart". 
    // Meaning 3 fails -> Restart.
    // Let's stick to simple "Retry!" and handle logic in click.
    if (retryCount >= MAX_RETRIES - 1) {
        retryBtn.textContent = 'Restart Game';
    } else {
        retryBtn.textContent = 'Retry!';
    }
}

document.getElementById('next-level-btn').addEventListener('click', () => {
    currentLevelIndex++;
    document.getElementById('level-complete-section').style.display = 'none';
    startLevel(currentLevelIndex);
});

document.getElementById('retry-btn').addEventListener('click', () => {
    document.getElementById('level-failed-section').style.display = 'none';

    if (retryCount >= MAX_RETRIES - 1) {
        // Reset to Level 1
        currentLevelIndex = 0;
        retryCount = 0;
        startLevel(currentLevelIndex);
    } else {
        // Retry current level
        retryCount++;
        startLevel(currentLevelIndex);
    }
});

function gameOver() {
    clearInterval(timerInterval);
    isPlaying = false;
    inputBox.blur();

    // Calculate Accuracy
    const inputVal = inputBox.value;
    const targetText = levels[currentLevelIndex].text;
    let correctChars = 0;

    for (let i = 0; i < inputVal.length; i++) {
        if (i < targetText.length && inputVal[i] === targetText[i]) {
            correctChars++;
        }
    }

    let accuracy = 0;
    if (targetText.length > 0) {
        accuracy = (correctChars / targetText.length) * 100;
    }

    showLevelFailed(accuracy);
}

function gameWon() {
    clearInterval(timerInterval);
    isPlaying = false;
    // Redirect to congratulations page with transition
    if (typeof transitionTo === 'function') {
        transitionTo('congratulations.html');
    } else {
        window.location.href = 'congratulations.html';
    }
}

// Start immediately
initGame();
