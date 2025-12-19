document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const newGameBtn = document.getElementById('new-game-btn');
    const checkBtn = document.getElementById('check-btn');
    const messageElement = document.getElementById('message');

    let solutionBoard = [];
    let currentBoard = [];
    let difficulty = 'easy';
    let timerInterval;
    let startTime;
    let isGameActive = false;

    // Pre-defined Puzzles
    // 0 represents empty cell

    const easyPuzzles = [
        {
            original: [
                5, 3, 0, 0, 7, 0, 0, 0, 0,
                6, 0, 0, 1, 9, 5, 0, 0, 0,
                0, 9, 8, 0, 0, 0, 0, 6, 0,
                8, 0, 0, 0, 6, 0, 0, 0, 3,
                4, 0, 0, 8, 0, 3, 0, 0, 1,
                7, 0, 0, 0, 2, 0, 0, 0, 6,
                0, 6, 0, 0, 0, 0, 2, 8, 0,
                0, 0, 0, 4, 1, 9, 0, 0, 5,
                0, 0, 0, 0, 8, 0, 0, 7, 9
            ],
            solution: [
                5, 3, 4, 6, 7, 8, 9, 1, 2,
                6, 7, 2, 1, 9, 5, 3, 4, 8,
                1, 9, 8, 3, 4, 2, 5, 6, 7,
                8, 5, 9, 7, 6, 1, 4, 2, 3,
                4, 2, 6, 8, 5, 3, 7, 9, 1,
                7, 1, 3, 9, 2, 4, 8, 5, 6,
                9, 6, 1, 5, 3, 7, 2, 8, 4,
                2, 8, 7, 4, 1, 9, 6, 3, 5,
                3, 4, 5, 2, 8, 6, 1, 7, 9
            ]
        },
        {
            original: [
                0, 0, 0, 2, 6, 0, 7, 0, 1,
                6, 8, 0, 0, 7, 0, 0, 9, 0,
                1, 9, 0, 0, 0, 4, 5, 0, 0,
                8, 2, 0, 1, 0, 0, 0, 4, 0,
                0, 0, 4, 6, 0, 2, 9, 0, 0,
                0, 5, 0, 0, 0, 3, 0, 2, 8,
                0, 0, 9, 3, 0, 0, 0, 7, 4,
                0, 4, 0, 0, 5, 0, 0, 3, 6,
                7, 0, 3, 0, 1, 8, 0, 0, 0
            ],
            solution: [
                4, 3, 5, 2, 6, 9, 7, 8, 1,
                6, 8, 2, 5, 7, 1, 4, 9, 3,
                1, 9, 7, 8, 3, 4, 5, 6, 2,
                8, 2, 6, 1, 9, 5, 3, 4, 7,
                3, 7, 4, 6, 8, 2, 9, 1, 5,
                9, 5, 1, 7, 4, 3, 6, 2, 8,
                5, 1, 9, 3, 2, 6, 8, 7, 4,
                2, 4, 8, 9, 5, 7, 1, 3, 6,
                7, 6, 3, 4, 1, 8, 2, 5, 9
            ]
        }
    ];

    const mediumPuzzles = [
        {
            original: [
                0, 0, 0, 6, 0, 0, 4, 0, 0,
                7, 0, 0, 0, 0, 3, 6, 0, 0,
                0, 0, 0, 0, 9, 1, 0, 8, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 5, 0, 1, 8, 0, 0, 0, 3,
                0, 0, 0, 3, 0, 6, 0, 4, 5,
                0, 4, 0, 2, 0, 0, 0, 6, 0,
                9, 0, 3, 0, 0, 0, 0, 0, 0,
                0, 2, 0, 0, 0, 0, 1, 0, 0
            ],
            solution: [
                5, 8, 1, 6, 7, 2, 4, 3, 9,
                7, 9, 2, 8, 4, 3, 6, 5, 1,
                3, 6, 4, 5, 9, 1, 7, 8, 2,
                4, 3, 8, 9, 5, 7, 2, 1, 6,
                2, 5, 6, 1, 8, 4, 9, 7, 3,
                1, 7, 9, 3, 2, 6, 8, 4, 5,
                8, 4, 5, 2, 1, 9, 3, 6, 7,
                9, 1, 3, 7, 6, 5, 8, 2, 4,
                6, 2, 7, 4, 3, 8, 1, 9, 5
            ]
        },
        {
            original: [
                0, 0, 0, 6, 0, 0, 4, 0, 0,
                7, 0, 0, 0, 0, 3, 6, 0, 0,
                0, 0, 0, 0, 9, 1, 0, 8, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 5, 0, 1, 8, 0, 0, 0, 3,
                0, 0, 0, 3, 0, 6, 0, 4, 5,
                0, 4, 0, 2, 0, 0, 0, 6, 0,
                9, 0, 3, 0, 0, 0, 0, 0, 0,
                0, 2, 0, 0, 0, 0, 1, 0, 0
            ],
            solution: [
                5, 8, 1, 6, 7, 2, 4, 3, 9,
                7, 9, 2, 8, 4, 3, 6, 5, 1,
                3, 6, 4, 5, 9, 1, 7, 8, 2,
                4, 3, 8, 9, 5, 7, 2, 1, 6,
                2, 5, 6, 1, 8, 4, 9, 7, 3,
                1, 7, 9, 3, 2, 6, 8, 4, 5,
                8, 4, 5, 2, 1, 9, 3, 6, 7,
                9, 1, 3, 7, 6, 5, 8, 2, 4,
                6, 2, 7, 4, 3, 8, 1, 9, 5
            ]
        }
    ];


    const hardPuzzles = [
        {
            original: [
                5, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 1, 0, 5, 0, 0, 0,
                0, 9, 0, 0, 4, 0, 0, 0, 0,
                8, 0, 0, 0, 6, 0, 0, 0, 3,
                4, 0, 0, 8, 0, 3, 0, 0, 1,
                7, 0, 0, 0, 2, 0, 0, 0, 6,
                0, 6, 0, 0, 0, 0, 2, 8, 0,
                0, 0, 0, 4, 1, 0, 0, 0, 5,
                0, 0, 0, 0, 8, 0, 0, 7, 9
            ],
            solution: [
                5, 3, 4, 6, 7, 8, 9, 1, 2,
                6, 7, 2, 1, 9, 5, 3, 4, 8,
                1, 9, 8, 3, 4, 2, 5, 6, 7,
                8, 5, 9, 7, 6, 1, 4, 2, 3,
                4, 2, 6, 8, 5, 3, 7, 9, 1,
                7, 1, 3, 9, 2, 4, 8, 5, 6,
                9, 6, 1, 5, 3, 7, 2, 8, 4,
                2, 8, 7, 4, 1, 9, 6, 3, 5,
                3, 4, 5, 2, 8, 6, 1, 7, 9
            ]
        },
        {
            original: [
                5, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 1, 0, 5, 0, 0, 0,
                0, 9, 0, 0, 4, 0, 0, 0, 0,
                8, 0, 0, 0, 6, 0, 0, 0, 3,
                4, 0, 0, 8, 0, 3, 0, 0, 1,
                7, 0, 0, 0, 2, 0, 0, 0, 6,
                0, 6, 0, 0, 0, 0, 2, 8, 0,
                0, 0, 0, 4, 1, 0, 0, 0, 5,
                0, 0, 0, 0, 8, 0, 0, 7, 9
            ],
            solution: [
                5, 3, 4, 6, 7, 8, 9, 1, 2,
                6, 7, 2, 1, 9, 5, 3, 4, 8,
                1, 9, 8, 3, 4, 2, 5, 6, 7,
                8, 5, 9, 7, 6, 1, 4, 2, 3,
                4, 2, 6, 8, 5, 3, 7, 9, 1,
                7, 1, 3, 9, 2, 4, 8, 5, 6,
                9, 6, 1, 5, 3, 7, 2, 8, 4,
                2, 8, 7, 4, 1, 9, 6, 3, 5,
                3, 4, 5, 2, 8, 6, 1, 7, 9
            ]
        }
    ];


    // Initialize the game
    init();

    function init() {
        const startScreen = document.getElementById('start-screen');
        const gameScreen = document.getElementById('game-screen');
        const startBtn = document.getElementById('start-btn');
        const diffOptions = document.querySelectorAll('.diff-option');

        // Difficulty selection on Start Screen
        diffOptions.forEach(opt => {
            opt.addEventListener('click', (e) => {
                diffOptions.forEach(o => o.classList.remove('selected'));
                e.target.classList.add('selected');
                difficulty = e.target.dataset.diff;
            });
        });

        // Start Button Click
        startBtn.addEventListener('click', () => {
            // Hide Start Screen, Show Game Screen
            startScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');

            // Start the game
            startGame(difficulty);
        });

        // "New Game" button: Go back to Start Screen
        newGameBtn.addEventListener('click', () => {
            stopTimer();
            isGameActive = false;
            gameScreen.classList.add('hidden');
            startScreen.classList.remove('hidden');
        });

        // "Check Solution" -> Reveal
        checkBtn.addEventListener('click', revealSolution);

        createGrid();
    }

    function createGrid() {
        boardElement.innerHTML = '';
        for (let i = 0; i < 81; i++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'cell';
            input.min = 1;
            input.max = 9;
            input.dataset.index = i;

            // Input validation and real-time checking
            input.addEventListener('input', (e) => {
                const val = e.target.value;
                if (val.length > 1) {
                    e.target.value = val.slice(-1);
                }

                const currentVal = parseInt(e.target.value);
                const idx = parseInt(e.target.dataset.index);

                // Clear styles first
                e.target.classList.remove('correct', 'incorrect');

                if (!currentVal) {
                    return; // Empty
                }

                // Check against solution
                if (currentVal === solutionBoard[idx]) {
                    // Correct - requirement: remove incorrect class (done by clear above)
                } else {
                    // Incorrect
                    e.target.classList.add('incorrect');
                }

                checkIfWon();
            });

            boardElement.appendChild(input);
        }
    }

    function startGame(diff) {
        messageElement.textContent = '';
        messageElement.style.color = 'inherit';

        stopTimer();
        startTimer();
        isGameActive = true;

        // Select puzzle based on difficulty
        let puzzleSet;
        if (diff === 'easy') puzzleSet = easyPuzzles;
        else if (diff === 'medium') puzzleSet = mediumPuzzles;
        else puzzleSet = hardPuzzles;

        // Randomly random puzzle
        const randomIdx = Math.floor(Math.random() * puzzleSet.length);
        const puzzle = puzzleSet[randomIdx];

        solutionBoard = [...puzzle.solution];
        currentBoard = [...puzzle.original];

        renderBoard(currentBoard);
    }

    function renderBoard(board) {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const val = board[index];
            cell.value = val !== 0 ? val : '';
            cell.classList.remove('correct', 'incorrect', 'fixed');
            cell.disabled = false;
            cell.readOnly = false;

            if (val !== 0) {
                cell.classList.add('fixed');
                cell.readOnly = true;
            }
        });
    }

    function revealSolution() {
        const cells = document.querySelectorAll('.cell');

        cells.forEach((cell, index) => {
            // Fill with correct value
            cell.value = solutionBoard[index];

            // Clear status classes
            cell.classList.remove('correct', 'incorrect');

            // Optional: Mark as fixed or just leave as is?
            // "every cell in the board is filled... any incorrect or status classes are cleared"
            // Let's make them fixed effectively to stop the game interactions?
            cell.readOnly = true;
        });

        stopTimer();
        isGameActive = false;
        showMessage('Solution revealed.', '#636e72');
    }

    function showMessage(text, color) {
        messageElement.textContent = text;
        messageElement.style.color = color;
    }

    // --- Timer Logic ---

    function startTimer() {
        const timerEl = document.getElementById('timer');
        startTime = Date.now();
        timerEl.textContent = "00:00";

        timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            timerEl.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function checkIfWon() {
        const cells = document.querySelectorAll('.cell');
        let filledCount = 0;
        let isCorrect = true;

        for (let i = 0; i < 81; i++) {
            const val = parseInt(cells[i].value) || 0;
            if (val !== 0) filledCount++;
            if (val !== 0 && val !== solutionBoard[i]) isCorrect = false;
        }

        if (filledCount === 81 && isCorrect && isGameActive) {
            isGameActive = false;
            stopTimer();
            showMessage('Congratulations! You solved it!', '#00b894');
        }
    }
});
