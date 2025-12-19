// pages/game/game.js
Page({
    data: {
        board: ['', '', '', '', '', '', '', '', ''],
        currentPlayer: 'X',
        gameActive: true,
        isRobotMode: false,
        gameMode: '',
        difficulty: 'easy',

        // Series State
        playerScore: 0,
        cpuScore: 0,
        maxRounds: 1,
        roundsPlayed: 0,

        // Custom Modal State
        gameOverModalVisible: false,
        gameOverWinner: '',
        gameOverMessage: '',
        gameOverSubtext: '',
        isSeriesOver: false,

        // Visuals
        winningLineType: '' // 'row-0', 'col-1', 'diag-0', etc.
    },

    onLoad(options) {
        const isRobot = options.type === 'robot';
        const series = parseInt(options.series) || 1;
        const difficulty = options.difficulty || 'easy';

        this.setData({
            isRobotMode: isRobot,
            gameMode: options.type,
            difficulty: difficulty,
            maxRounds: series,
            roundsPlayed: 0
        });

        this.startNewRound(true);
    },

    startNewRound(isFirst = false) {
        if (!isFirst && this.data.roundsPlayed >= this.data.maxRounds) return;

        const isRobot = this.data.isRobotMode;
        let startPlayer = 'X';

        if (isRobot) {
            if (Math.random() > 0.5) {
                startPlayer = 'O';
            }
        }

        this.setData({
            board: ['', '', '', '', '', '', '', '', ''],
            currentPlayer: startPlayer,
            gameActive: true,
            gameOverModalVisible: false,
            isSeriesOver: false,
            winningLineType: '' // Reset line
        });

        if (isRobot && startPlayer === 'O') {
            setTimeout(() => this.robotMove(), 1000);
        }
    },

    tapCell(e) {
        const index = e.currentTarget.dataset.index;
        const { board, gameActive, currentPlayer, isRobotMode } = this.data;

        if (board[index] !== '' || !gameActive) return;
        if (isRobotMode && currentPlayer === 'O') return;

        this.makeMove(index, currentPlayer);

        if (this.checkGameStatus()) return;

        if (isRobotMode && this.data.gameActive) {
            setTimeout(() => {
                this.robotMove();
            }, 500);
        }
    },

    makeMove(index, player) {
        const startBoard = this.data.board;
        startBoard[index] = player;

        this.setData({
            board: startBoard,
            currentPlayer: player === 'X' ? 'O' : 'X'
        });
    },

    robotMove() {
        const { board, difficulty, gameActive } = this.data;
        if (!gameActive) return;

        let probability = 0.3;
        if (difficulty === 'medium') probability = 0.5;
        if (difficulty === 'hard') probability = 0.8;

        let moveIndex = -1;
        const shouldPlaySmart = Math.random() < probability;

        if (shouldPlaySmart) {
            moveIndex = this.getBestMove(board);
        }

        if (!shouldPlaySmart || moveIndex === -1) {
            moveIndex = this.getRandomMove(board);
        }

        if (moveIndex !== -1) {
            this.makeMove(moveIndex, 'O');
            this.checkGameStatus();
        }
    },

    getRandomMove(board) {
        const emptyIndices = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
        if (emptyIndices.length === 0) return -1;
        return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    },

    getBestMove(board) {
        // Optimization
        const emptyIndices = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
        if (emptyIndices.length === 9) return 4;
        if (emptyIndices.length === 8 && board[4] === '') return 4;

        let bestScore = -Infinity;
        let move = -1;

        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = this.minimax(board, 0, false);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    },

    minimax(board, depth, isMaximizing) {
        const check = this.checkWin(board); // Returns obj or null
        const winner = check ? check.winner : null;

        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return depth - 10;
        if (!board.includes('')) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    },

    checkWin(board) {
        const winningConditions = [
            { idx: [0, 1, 2], type: 'row-0' },
            { idx: [3, 4, 5], type: 'row-1' },
            { idx: [6, 7, 8], type: 'row-2' },
            { idx: [0, 3, 6], type: 'col-0' },
            { idx: [1, 4, 7], type: 'col-1' },
            { idx: [2, 5, 8], type: 'col-2' },
            { idx: [0, 4, 8], type: 'diag-0' },
            { idx: [2, 4, 6], type: 'diag-1' }
        ];

        for (const condition of winningConditions) {
            const [a, b, c] = condition.idx;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { winner: board[a], type: condition.type };
            }
        }
        return null;
    },

    checkGameStatus() {
        const { board } = this.data;
        const winResult = this.checkWin(board);

        if (winResult) {
            const { winner, type } = winResult;
            this.setData({
                gameActive: false,
                winningLineType: type
            });

            // Slight delay before showing modal so user sees the line
            setTimeout(() => {
                this.handleRoundEnd(winner);
            }, 1000);
            return true;
        }

        if (!board.includes('')) {
            this.setData({ gameActive: false });
            this.handleRoundEnd('DRAW');
            return true;
        }

        return false;
    },

    handleRoundEnd(winner) {
        let { playerScore, cpuScore, maxRounds, roundsPlayed, isRobotMode } = this.data;
        let message = '';
        let subtext = '';
        let isSeriesOver = false;

        roundsPlayed++;

        if (winner === 'X') playerScore++;
        if (winner === 'O') cpuScore++;

        this.setData({ playerScore, cpuScore, roundsPlayed });

        if (roundsPlayed >= maxRounds) {
            isSeriesOver = true;
            if (playerScore > cpuScore) {
                message = isRobotMode ? 'SERIES WON!' : 'X WINS SERIES!';
            } else if (cpuScore > playerScore) {
                message = isRobotMode ? 'CPU WON SERIES' : 'O WINS SERIES!';
            } else {
                message = 'SERIES DRAW';
            }
            subtext = `Final Score: ${playerScore} - ${cpuScore}`;
        } else {
            if (winner === 'DRAW') {
                message = 'DRAW';
            } else {
                message = `${winner} takes point!`;
            }
            subtext = `Score: ${playerScore} - ${cpuScore} | Left: ${maxRounds - roundsPlayed}`;
        }

        this.setData({
            gameOverModalVisible: true,
            gameOverWinner: winner,
            gameOverMessage: message,
            gameOverSubtext: subtext,
            isSeriesOver: isSeriesOver
        });
    },

    handleNextAction() {
        if (this.data.isSeriesOver) {
            this.setData({
                playerScore: 0,
                cpuScore: 0,
                roundsPlayed: 0
            });
            this.startNewRound(true);
        } else {
            this.startNewRound(false);
        }
    },

    restartGame() {
        this.setData({
            board: ['', '', '', '', '', '', '', '', ''],
            currentPlayer: 'X',
            gameActive: true
        });
    },

    goHome() {
        wx.navigateBack();
    }
})
