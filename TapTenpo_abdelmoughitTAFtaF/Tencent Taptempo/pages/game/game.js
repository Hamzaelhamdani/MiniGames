// pages/game/game.js
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

const MAX_RETRIES = 3;

Page({
    data: {
        currentLevelIndex: 0,
        timerText: '01:00',
        targetTextChars: [],
        inputValue: '',
        isLevelComplete: false,
        isLevelFailed: false,
        accuracy: 100,
        retryCount: 0,
        failedAccuracy: 0,
        showRestart: false,
        timerColor: '#FF7900'
    },

    timerInterval: null,
    timeLeft: 0,
    timerStarted: false,
    isPlaying: false,

    onLoad() {
        this.initGame();
    },

    onUnload() {
        this.stopTimer();
    },

    initGame() {
        this.setData({
            currentLevelIndex: 0,
            retryCount: 0
        });
        this.startLevel(0);
    },

    startLevel(index) {
        if (index >= levels.length) {
            this.gameWon();
            return;
        }

        const level = levels[index];
        const chars = level.text.split('').map(char => ({
            char: char,
            status: ''
        }));

        this.timeLeft = level.duration;
        this.timerStarted = false;
        this.isPlaying = true;

        this.setData({
            currentLevelIndex: index,
            targetTextChars: chars,
            inputValue: '',
            isLevelComplete: false,
            isLevelFailed: false,
            timerText: this.formatTime(this.timeLeft),
            timerColor: '#FF7900'
        });

        this.stopTimer();
    },

    handleInput(e) {
        if (!this.isPlaying) return;

        const inputVal = e.detail.value;

        if (!this.timerStarted && inputVal.length > 0) {
            this.startTimer();
        }

        const currentLevelText = levels[this.data.currentLevelIndex].text;

        const updatedChars = this.data.targetTextChars.map((item, index) => {
            const inputChar = inputVal[index];
            if (inputChar == null) {
                return { ...item, status: '' };
            } else if (inputChar === item.char) {
                return { ...item, status: 'correct' };
            } else {
                return { ...item, status: 'incorrect' };
            }
        });

        this.setData({
            inputValue: inputVal,
            targetTextChars: updatedChars
        });

        if (inputVal === currentLevelText) {
            this.levelCompleted();
        }
    },

    startTimer() {
        if (!this.timerStarted) {
            this.timerStarted = true;
            this.timerInterval = setInterval(() => {
                this.updateTimer();
            }, 1000);
        }
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    updateTimer() {
        this.timeLeft--;

        const isUrgent = this.timeLeft <= 10;
        this.setData({
            timerText: this.formatTime(this.timeLeft),
            timerColor: isUrgent ? 'red' : '#FF7900'
        });

        if (this.timeLeft <= 0) {
            this.gameOver();
        }
    },

    formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
    },

    levelCompleted() {
        this.stopTimer();
        this.isPlaying = false;
        this.setData({
            isLevelComplete: true,
            retryCount: 0
        });
    },

    gameOver() {
        this.stopTimer();
        this.isPlaying = false;

        const inputVal = this.data.inputValue;
        const targetText = levels[this.data.currentLevelIndex].text;
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

        const isLastRetry = this.data.retryCount >= MAX_RETRIES - 1;

        this.setData({
            isLevelFailed: true,
            failedAccuracy: Math.floor(accuracy),
            showRestart: isLastRetry
        });
    },

    onNextLevel() {
        const nextIndex = this.data.currentLevelIndex + 1;
        this.startLevel(nextIndex);
    },

    onRetry() {
        if (this.data.retryCount >= MAX_RETRIES - 1) {
            this.onRestartGame();
        } else {
            const newRetryCount = this.data.retryCount + 1;
            this.setData({ retryCount: newRetryCount });
            this.startLevel(this.data.currentLevelIndex);
        }
    },

    onRestartGame() {
        this.initGame();
    },

    gameWon() {
        this.stopTimer();
        wx.navigateTo({
            url: '/pages/congratulations/congratulations'
        });
    }
});
