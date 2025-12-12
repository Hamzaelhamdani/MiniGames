// ===========================
// GAME STATE & CONFIGURATION
// ===========================

const gameState = {
    currentPage: 'home',
    gameMode: null,        // 'ai' or 'friend'
    difficulty: null,      // 'easy', 'medium', 'hard'
    playerPaddle: null,    // 'white' or 'orange'
    isPaused: false,
    isGameOver: false,
    animationId: null
};

const config = {
    canvas: {
        width: 800,
        height: 600,
        mobileWidth: 360,
        mobileHeight: 500
    },
    paddle: {
        width: 15,
        height: 100,
        speed: 6
    },
    ball: {
        radius: 8,
        initialSpeed: 5,
        maxSpeed: 12
    },
    winScore: 5
};

// ===========================
// GAME OBJECTS
// ===========================

let canvas, ctx;
let player1, player2, ball;

// Paddle object
class Paddle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.width = config.paddle.width;
        this.height = config.paddle.height;
        this.color = color;
        this.speed = config.paddle.speed;
        this.dy = 0;
        this.score = 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Add glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }

    update() {
        this.y += this.dy;

        // Keep paddle within canvas bounds
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
        }
    }

    moveUp() {
        this.dy = -this.speed;
    }

    moveDown() {
        this.dy = this.speed;
    }

    stop() {
        this.dy = 0;
    }
}

// Ball object
class Ball {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.radius = config.ball.radius;

        // Random direction
        const angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
        const direction = Math.random() < 0.5 ? 1 : -1;
        this.dx = Math.cos(angle) * config.ball.initialSpeed * direction;
        this.dy = Math.sin(angle) * config.ball.initialSpeed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        // Wall collision (top and bottom)
        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
            this.dy = -this.dy;
        }

        // Paddle collision
        if (this.checkPaddleCollision(player1)) {
            this.dx = Math.abs(this.dx);
            this.adjustAngle(player1);
        }

        if (this.checkPaddleCollision(player2)) {
            this.dx = -Math.abs(this.dx);
            this.adjustAngle(player2);
        }

        // Score points
        if (this.x - this.radius < 0) {
            player2.score++;
            updateScoreboard();
            checkWin();
            this.reset();
        }

        if (this.x + this.radius > canvas.width) {
            player1.score++;
            updateScoreboard();
            checkWin();
            this.reset();
        }
    }

    checkPaddleCollision(paddle) {
        return (
            this.x - this.radius < paddle.x + paddle.width &&
            this.x + this.radius > paddle.x &&
            this.y > paddle.y &&
            this.y < paddle.y + paddle.height
        );
    }

    adjustAngle(paddle) {
        // Adjust ball angle based on where it hits the paddle
        const hitPos = (this.y - paddle.y) / paddle.height;
        const angle = (hitPos - 0.5) * Math.PI / 3;
        const speed = Math.min(
            Math.sqrt(this.dx * this.dx + this.dy * this.dy) * 1.05,
            config.ball.maxSpeed
        );

        this.dx = Math.cos(angle) * speed * Math.sign(this.dx);
        this.dy = Math.sin(angle) * speed;
    }
}

// ===========================
// AI LOGIC
// ===========================

function updateAI() {
    if (gameState.gameMode !== 'ai') return;

    const aiPaddle = player2;
    const targetY = ball.y - aiPaddle.height / 2;
    const diff = targetY - aiPaddle.y;

    // AI difficulty settings
    let aiSpeed = config.paddle.speed;
    let reactionThreshold = 0;

    switch (gameState.difficulty) {
        case 'easy':
            aiSpeed = config.paddle.speed * 0.5;
            reactionThreshold = 30;
            break;
        case 'medium':
            aiSpeed = config.paddle.speed * 0.7;
            reactionThreshold = 15;
            break;
        case 'hard':
            aiSpeed = config.paddle.speed * 0.95;
            reactionThreshold = 5;
            break;
    }

    // Only move if difference is significant
    if (Math.abs(diff) > reactionThreshold) {
        if (diff > 0) {
            aiPaddle.dy = aiSpeed;
        } else {
            aiPaddle.dy = -aiSpeed;
        }
    } else {
        aiPaddle.dy = 0;
    }
}

// ===========================
// KEYBOARD CONTROLS
// ===========================

const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (gameState.gameMode === 'friend') {
        // Player 1 (White paddle - left side)
        if (e.key === 'w' || e.key === 'W') player1.moveUp();
        if (e.key === 's' || e.key === 'S') player1.moveDown();

        // Player 2 (Orange paddle - right side)
        if (e.key === 'ArrowUp') player2.moveUp();
        if (e.key === 'ArrowDown') player2.moveDown();
    } else if (gameState.gameMode === 'ai') {
        // Player controls their chosen paddle
        if (gameState.playerPaddle === 'white') {
            if (e.key === 'w' || e.key === 'W') player1.moveUp();
            if (e.key === 's' || e.key === 'S') player1.moveDown();
        } else {
            if (e.key === 'ArrowUp') player2.moveUp();
            if (e.key === 'ArrowDown') player2.moveDown();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;

    if (gameState.gameMode === 'friend') {
        if (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') {
            player1.stop();
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            player2.stop();
        }
    } else if (gameState.gameMode === 'ai') {
        if (gameState.playerPaddle === 'white') {
            if (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') {
                player1.stop();
            }
        } else {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                player2.stop();
            }
        }
    }
});

// ===========================
// GAME LOOP
// ===========================

function gameLoop() {
    if (gameState.isPaused || gameState.isGameOver) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Update AI
    if (gameState.gameMode === 'ai') {
        updateAI();
    }

    // Update game objects
    player1.update();
    player2.update();
    ball.update();

    // Draw game objects
    player1.draw();
    player2.draw();
    ball.draw();

    gameState.animationId = requestAnimationFrame(gameLoop);
}

// ===========================
// GAME MANAGEMENT
// ===========================

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Responsive canvas sizing
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        canvas.width = Math.min(config.canvas.mobileWidth, window.innerWidth - 40);
        canvas.height = config.canvas.mobileHeight;
    } else {
        canvas.width = config.canvas.width;
        canvas.height = config.canvas.height;
    }

    // Show/hide touch controls
    const touchControls = document.getElementById('touchControls');
    if (isMobile) {
        touchControls.style.display = 'flex';
        setupTouchControls();
    } else {
        touchControls.style.display = 'none';
    }

    // Initialize paddles based on game mode
    if (gameState.gameMode === 'ai') {
        // In AI mode, player chooses their paddle
        if (gameState.playerPaddle === 'white') {
            player1 = new Paddle(30, canvas.height / 2 - config.paddle.height / 2, '#ffffff');
            player2 = new Paddle(canvas.width - 30 - config.paddle.width, canvas.height / 2 - config.paddle.height / 2, '#ff6b35');
        } else {
            player1 = new Paddle(30, canvas.height / 2 - config.paddle.height / 2, '#ff6b35');
            player2 = new Paddle(canvas.width - 30 - config.paddle.width, canvas.height / 2 - config.paddle.height / 2, '#ffffff');
        }
    } else {
        // In friend mode, white is always left, orange is always right
        player1 = new Paddle(30, canvas.height / 2 - config.paddle.height / 2, '#ffffff');
        player2 = new Paddle(canvas.width - 30 - config.paddle.width, canvas.height / 2 - config.paddle.height / 2, '#ff6b35');
    }

    ball = new Ball();

    updateScoreboard();
    updatePlayerLabels();

    gameState.isPaused = false;
    gameState.isGameOver = false;

    gameLoop();
}

function updateScoreboard() {
    document.getElementById('player1Score').textContent = player1.score;
    document.getElementById('player2Score').textContent = player2.score;
}

function updatePlayerLabels() {
    const player1Label = document.getElementById('player1Label');
    const player2Label = document.getElementById('player2Label');

    if (gameState.gameMode === 'ai') {
        if (gameState.playerPaddle === 'white') {
            player1Label.textContent = 'You';
            player2Label.textContent = 'AI';
        } else {
            player1Label.textContent = 'AI';
            player2Label.textContent = 'You';
        }
    } else {
        player1Label.textContent = 'Player 1';
        player2Label.textContent = 'Player 2';
    }
}

function checkWin() {
    if (player1.score >= config.winScore) {
        endGame('Player 1 Wins!');
    } else if (player2.score >= config.winScore) {
        endGame('Player 2 Wins!');
    }
}

function endGame(message) {
    gameState.isGameOver = true;
    cancelAnimationFrame(gameState.animationId);

    document.getElementById('gameOverTitle').textContent = 'GAME OVER';
    document.getElementById('gameOverMessage').textContent = message;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function resetGame() {
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
    }

    player1.score = 0;
    player2.score = 0;
    updateScoreboard();

    ball.reset();

    gameState.isPaused = false;
    gameState.isGameOver = false;

    document.getElementById('gameOverScreen').classList.add('hidden');

    gameLoop();
}

// ===========================
// NAVIGATION
// ===========================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    gameState.currentPage = pageId;
}

// ===========================
// EVENT LISTENERS
// ===========================

// Home Page
document.getElementById('startGameBtn').addEventListener('click', () => {
    showPage('gameModePage');
});

document.getElementById('settingsBtn').addEventListener('click', () => {
    alert('Settings coming soon!');
});

// Game Mode Selection
document.getElementById('vsAiBtn').addEventListener('click', () => {
    gameState.gameMode = 'ai';
    showPage('difficultyPage');
});

document.getElementById('vsFriendBtn').addEventListener('click', () => {
    gameState.gameMode = 'friend';
    showPage('paddleSelectionPage');
});

// Difficulty Selection
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const difficulty = e.currentTarget.dataset.difficulty;
        gameState.difficulty = difficulty;

        // For AI mode, automatically assign white paddle to player
        gameState.playerPaddle = 'white';

        showPage('gamePage');
        initGame();
    });
});

// Paddle Selection
document.querySelectorAll('.paddle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const paddle = e.currentTarget.dataset.paddle;
        gameState.playerPaddle = paddle;

        showPage('gamePage');
        initGame();
    });
});

// Game Controls
document.getElementById('pauseBtn').addEventListener('click', () => {
    gameState.isPaused = !gameState.isPaused;
    document.getElementById('pauseBtn').textContent = gameState.isPaused ? 'Resume' : 'Pause';

    if (!gameState.isPaused) {
        gameLoop();
    }
});

document.getElementById('restartBtn').addEventListener('click', () => {
    resetGame();
});

document.getElementById('homeBtn').addEventListener('click', () => {
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
    }
    showPage('homePage');
});

// Game Over Screen
document.getElementById('playAgainBtn').addEventListener('click', () => {
    resetGame();
});

document.getElementById('backHomeBtn').addEventListener('click', () => {
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
    }
    showPage('homePage');
});

// ===========================
// TOUCH CONTROLS
// ===========================

function setupTouchControls() {
    const touchUpLeft = document.getElementById('touchUpLeft');
    const touchDownLeft = document.getElementById('touchDownLeft');
    const touchUpRight = document.getElementById('touchUpRight');
    const touchDownRight = document.getElementById('touchDownRight');

    // Left paddle controls
    touchUpLeft.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.gameMode === 'friend' || gameState.playerPaddle === 'white') {
            player1.moveUp();
        }
    });

    touchUpLeft.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (gameState.gameMode === 'friend' || gameState.playerPaddle === 'white') {
            player1.stop();
        }
    });

    touchDownLeft.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.gameMode === 'friend' || gameState.playerPaddle === 'white') {
            player1.moveDown();
        }
    });

    touchDownLeft.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (gameState.gameMode === 'friend' || gameState.playerPaddle === 'white') {
            player1.stop();
        }
    });

    // Right paddle controls
    touchUpRight.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.gameMode === 'friend' || gameState.playerPaddle === 'orange') {
            player2.moveUp();
        }
    });

    touchUpRight.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (gameState.gameMode === 'friend' || gameState.playerPaddle === 'orange') {
            player2.stop();
        }
    });

    touchDownRight.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.gameMode === 'friend' || gameState.playerPaddle === 'orange') {
            player2.moveDown();
        }
    });

    touchDownRight.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (gameState.gameMode === 'friend' || gameState.playerPaddle === 'orange') {
            player2.stop();
        }
    });
}

// ===========================
// INITIALIZATION
// ===========================

console.log('🏓 Pong Game Loaded! Ready to play!');
