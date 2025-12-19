// index.js

// Pre-defined Puzzles Data
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
  },
  {
    original: [
      0, 2, 0, 6, 0, 8, 0, 0, 0,
      5, 8, 0, 0, 0, 9, 7, 0, 0,
      0, 0, 0, 0, 4, 0, 0, 0, 0,
      3, 7, 0, 0, 0, 0, 5, 0, 0,
      6, 0, 0, 0, 0, 0, 0, 0, 4,
      0, 0, 8, 0, 0, 0, 0, 1, 3,
      0, 0, 0, 0, 2, 0, 0, 0, 0,
      0, 0, 9, 8, 0, 0, 0, 3, 6,
      0, 0, 0, 3, 0, 6, 0, 9, 0
    ],
    solution: [
      1, 2, 3, 6, 7, 8, 9, 4, 5,
      5, 8, 4, 2, 3, 9, 7, 6, 1,
      9, 6, 7, 1, 4, 5, 3, 2, 8,
      3, 7, 2, 4, 6, 1, 5, 8, 9,
      6, 9, 1, 5, 8, 3, 2, 7, 4,
      4, 5, 8, 7, 9, 2, 6, 1, 3,
      8, 3, 6, 9, 2, 4, 1, 5, 7,
      2, 1, 9, 8, 5, 7, 4, 3, 6,
      7, 4, 5, 3, 1, 6, 8, 9, 2
    ]
  },
  {
    original: [
      0, 0, 0, 0, 0, 0, 2, 0, 0,
      0, 8, 0, 0, 0, 7, 0, 9, 0,
      6, 0, 2, 0, 0, 0, 5, 0, 0,
      0, 7, 0, 0, 6, 0, 0, 0, 0,
      0, 0, 0, 9, 0, 1, 0, 0, 0,
      0, 0, 0, 0, 2, 0, 0, 4, 0,
      0, 0, 5, 0, 0, 0, 6, 0, 3,
      0, 9, 0, 4, 0, 0, 0, 7, 0,
      0, 0, 6, 0, 0, 0, 0, 0, 0
    ],
    solution: [
      9, 5, 7, 6, 1, 3, 2, 8, 4,
      4, 8, 3, 2, 5, 7, 1, 9, 6,
      6, 1, 2, 8, 4, 9, 5, 3, 7,
      1, 7, 8, 3, 6, 4, 9, 5, 2,
      5, 2, 4, 9, 7, 1, 3, 6, 8,
      3, 6, 9, 5, 2, 8, 7, 4, 1,
      8, 4, 5, 7, 9, 2, 6, 1, 3,
      2, 9, 1, 4, 3, 6, 8, 7, 5,
      7, 3, 6, 1, 8, 5, 4, 2, 9
    ]
  },
  {
    original: [
      0, 0, 4, 0, 5, 0, 0, 0, 0,
      9, 0, 0, 7, 3, 4, 6, 0, 0,
      0, 0, 3, 0, 2, 1, 0, 4, 9,
      0, 3, 5, 0, 9, 0, 4, 8, 0,
      0, 9, 0, 0, 0, 0, 0, 3, 0,
      0, 7, 6, 0, 1, 0, 9, 2, 0,
      3, 1, 0, 9, 7, 0, 2, 0, 0,
      0, 0, 9, 1, 8, 2, 0, 0, 3,
      0, 0, 0, 0, 6, 0, 1, 0, 0
    ],
    solution: [
      1, 6, 4, 8, 5, 9, 3, 7, 2,
      9, 2, 8, 7, 3, 4, 6, 1, 5,
      7, 5, 3, 6, 2, 1, 8, 4, 9,
      2, 3, 5, 4, 9, 7, 4, 8, 6,
      4, 9, 1, 2, 8, 6, 5, 3, 7,
      8, 7, 6, 5, 1, 3, 9, 2, 4,
      3, 1, 8, 9, 7, 5, 2, 6, 4,
      6, 4, 9, 1, 8, 2, 7, 5, 3,
      5, 8, 2, 3, 6, 4, 1, 9, 7
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
      0, 0, 0, 0, 0, 0, 6, 8, 0,
      0, 0, 0, 0, 7, 3, 0, 0, 9,
      3, 0, 9, 0, 0, 0, 0, 4, 5,
      4, 9, 0, 0, 0, 0, 0, 0, 0,
      8, 0, 3, 0, 5, 0, 9, 0, 2,
      0, 0, 0, 0, 0, 0, 0, 3, 8,
      9, 4, 0, 0, 0, 0, 7, 0, 1,
      6, 0, 0, 7, 4, 0, 0, 0, 0,
      0, 2, 8, 0, 0, 0, 0, 0, 0
    ],
    solution: [
      1, 7, 4, 5, 9, 2, 6, 8, 3,
      2, 5, 6, 4, 7, 3, 1, 2, 9,
      3, 8, 9, 1, 6, 8, 2, 4, 5,
      4, 9, 1, 3, 8, 6, 5, 7, 4,
      8, 6, 3, 4, 5, 7, 9, 1, 2,
      5, 1, 2, 9, 1, 4, 4, 3, 8,
      9, 4, 5, 8, 2, 3, 7, 6, 1,
      6, 3, 1, 7, 4, 9, 8, 5, 4,
      7, 2, 8, 6, 3, 5, 3, 9, 6
    ]
  },
  {
    original: [
      2, 0, 0, 3, 0, 0, 0, 0, 0,
      8, 0, 4, 0, 6, 2, 0, 0, 3,
      0, 1, 3, 8, 0, 0, 2, 0, 0,
      0, 0, 0, 0, 2, 0, 3, 9, 0,
      5, 0, 7, 0, 0, 0, 6, 0, 2,
      0, 3, 2, 0, 0, 6, 0, 0, 0,
      0, 0, 1, 0, 0, 7, 4, 3, 0,
      3, 0, 0, 6, 4, 0, 1, 0, 7,
      0, 0, 0, 0, 0, 3, 0, 0, 6
    ],
    solution: [
      2, 6, 9, 3, 7, 1, 5, 4, 8,
      8, 7, 4, 5, 6, 2, 9, 1, 3,
      4, 1, 3, 8, 9, 4, 2, 6, 5,
      6, 4, 8, 1, 2, 5, 3, 9, 4,
      5, 9, 7, 4, 3, 8, 6, 8, 2,
      1, 3, 2, 9, 8, 6, 7, 5, 4,
      9, 8, 1, 2, 5, 7, 4, 3, 9,
      3, 2, 5, 6, 4, 9, 1, 8, 7,
      7, 4, 6, 8, 1, 3, 8, 2, 6
    ]
  },
  {
    original: [
      0, 0, 5, 3, 0, 0, 0, 0, 0,
      8, 0, 0, 0, 0, 0, 0, 2, 0,
      0, 7, 0, 0, 1, 0, 5, 0, 0,
      4, 0, 0, 0, 0, 5, 3, 0, 0,
      0, 1, 0, 0, 7, 0, 0, 0, 6,
      0, 0, 3, 2, 0, 0, 0, 8, 0,
      0, 6, 0, 5, 0, 0, 0, 0, 9,
      0, 0, 4, 0, 0, 0, 0, 3, 0,
      0, 0, 0, 0, 0, 9, 7, 0, 0
    ],
    solution: [
      1, 4, 5, 3, 2, 7, 6, 9, 8,
      8, 3, 9, 6, 5, 4, 1, 2, 7,
      6, 7, 2, 9, 1, 8, 5, 4, 3,
      4, 9, 6, 1, 8, 5, 3, 7, 2,
      2, 1, 8, 4, 7, 3, 9, 5, 6,
      7, 5, 3, 2, 9, 6, 4, 8, 1,
      3, 6, 7, 5, 4, 2, 8, 1, 9,
      9, 8, 4, 7, 6, 1, 2, 3, 5,
      5, 2, 1, 8, 3, 9, 7, 6, 4
    ]
  },
  {
    original: [
      0, 2, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 6, 0, 0, 0, 0, 3,
      0, 7, 4, 0, 8, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 3, 0, 0, 2,
      0, 8, 0, 0, 4, 0, 0, 1, 0,
      6, 0, 0, 5, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1, 0, 7, 8, 0,
      5, 0, 0, 0, 0, 9, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 4, 0
    ],
    solution: [
      1, 2, 6, 4, 3, 7, 9, 5, 8,
      8, 9, 5, 6, 2, 1, 4, 7, 3,
      3, 7, 4, 9, 8, 5, 1, 2, 6,
      4, 5, 7, 1, 9, 3, 8, 6, 2,
      9, 8, 3, 2, 4, 6, 5, 1, 7,
      6, 1, 2, 5, 7, 8, 3, 9, 4,
      2, 6, 9, 3, 1, 4, 7, 8, 5,
      5, 4, 8, 7, 6, 9, 2, 3, 1,
      7, 3, 1, 8, 5, 2, 6, 4, 9
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
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 3, 0, 8, 5,
      0, 0, 1, 0, 2, 0, 0, 0, 0,
      0, 0, 0, 5, 0, 7, 0, 0, 0,
      0, 0, 4, 0, 0, 0, 1, 0, 0,
      0, 9, 0, 0, 0, 0, 0, 0, 0,
      5, 0, 0, 0, 0, 0, 0, 7, 3,
      0, 0, 2, 0, 1, 0, 0, 0, 0,
      0, 0, 0, 0, 4, 0, 0, 0, 9
    ],
    solution: [
      9, 8, 7, 6, 5, 4, 3, 2, 1,
      2, 4, 6, 1, 7, 3, 9, 8, 5,
      3, 5, 1, 9, 2, 8, 7, 4, 6,
      1, 2, 8, 5, 3, 7, 6, 9, 4,
      6, 3, 4, 8, 9, 2, 1, 5, 7,
      7, 9, 5, 4, 6, 1, 8, 3, 2,
      5, 1, 9, 2, 8, 6, 4, 7, 3,
      4, 7, 2, 3, 1, 9, 5, 6, 8,
      8, 6, 3, 7, 4, 5, 2, 1, 9
    ]
  },
  {
    original: [
      8, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 3, 6, 0, 0, 0, 0, 0,
      0, 7, 0, 0, 9, 0, 2, 0, 0,
      0, 5, 0, 0, 0, 7, 0, 0, 0,
      0, 0, 0, 0, 4, 5, 7, 0, 0,
      0, 0, 0, 1, 0, 0, 0, 3, 0,
      0, 0, 1, 0, 0, 0, 0, 6, 8,
      0, 0, 8, 5, 0, 0, 0, 1, 0,
      0, 9, 0, 0, 0, 0, 4, 0, 0
    ],
    solution: [
      8, 1, 2, 7, 5, 3, 6, 4, 9,
      9, 4, 3, 6, 8, 2, 1, 7, 5,
      6, 7, 5, 4, 9, 1, 2, 8, 3,
      1, 5, 4, 2, 3, 7, 8, 9, 6,
      3, 6, 9, 8, 4, 5, 7, 2, 1,
      2, 8, 7, 1, 6, 9, 5, 3, 4,
      5, 2, 1, 9, 7, 4, 3, 6, 8,
      4, 3, 8, 5, 2, 6, 9, 1, 7,
      7, 9, 6, 3, 1, 8, 4, 5, 2
    ]
  },
  {
    original: [
      0, 0, 0, 0, 0, 0, 0, 1, 2,
      0, 0, 0, 0, 3, 5, 0, 0, 0,
      0, 0, 0, 6, 0, 0, 0, 7, 0,
      7, 0, 0, 0, 0, 0, 3, 0, 0,
      0, 0, 0, 4, 0, 0, 8, 0, 0,
      1, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 1, 2, 0, 0, 0, 0,
      0, 8, 0, 0, 0, 0, 0, 4, 0,
      0, 5, 0, 0, 0, 0, 6, 0, 0
    ],
    solution: [
      6, 7, 3, 8, 9, 4, 5, 1, 2,
      9, 1, 2, 7, 3, 5, 4, 8, 6,
      8, 4, 5, 6, 1, 2, 9, 7, 3,
      7, 9, 8, 2, 6, 1, 3, 5, 4,
      5, 2, 6, 4, 7, 3, 8, 9, 1,
      1, 3, 4, 5, 8, 9, 2, 6, 7,
      4, 6, 9, 1, 2, 7, 7, 3, 8,
      2, 8, 1, 3, 5, 6, 7, 4, 9,
      3, 5, 7, 9, 4, 8, 6, 2, 1
    ]
  },
  {
    original: [
      0, 0, 5, 0, 0, 0, 0, 0, 6,
      0, 7, 0, 0, 0, 9, 0, 2, 0,
      0, 0, 0, 5, 0, 0, 1, 0, 7,
      8, 0, 4, 1, 5, 0, 0, 0, 0,
      0, 0, 0, 8, 0, 3, 0, 0, 0,
      0, 0, 0, 0, 9, 4, 6, 0, 8,
      1, 0, 7, 0, 0, 5, 0, 0, 0,
      0, 8, 0, 3, 0, 0, 0, 6, 0,
      6, 0, 0, 0, 0, 0, 8, 0, 0
    ],
    solution: [
      4, 9, 5, 2, 1, 7, 3, 8, 6,
      3, 7, 1, 4, 6, 9, 5, 2, 8,
      2, 6, 8, 5, 3, 8, 1, 4, 7,
      8, 3, 4, 1, 5, 6, 7, 9, 2,
      9, 5, 6, 8, 7, 3, 2, 1, 4,
      7, 1, 2, 9, 9, 4, 6, 5, 8,
      1, 4, 7, 6, 8, 5, 9, 3, 2,
      5, 8, 9, 3, 2, 1, 4, 6, 7,
      6, 2, 3, 7, 4, 9, 8, 7, 5
    ]
  }
];

Page({
  data: {
    currentScreen: 'splash', // 'splash', 'start', or 'game'
    difficulty: 'easy',
    timer: '00:00',
    board: [],
    solutionBoard: [],
    messageText: '',
    messageColor: '#636e72',
    isGameActive: false
  },

  timerInterval: null,
  startTime: 0,

  onLoad() {
    // Show splash for 2 seconds, then go to start screen
    setTimeout(() => {
      this.setData({ currentScreen: 'start' });
    }, 2000);
  },

  onTapDifficulty(e) {
    const diff = e.currentTarget.dataset.diff;
    this.setData({ difficulty: diff });
  },

  onTapStart() {
    this.setData({
      currentScreen: 'game'
    });
    this.startGame();
  },

  onTapNewGame() {
    this.stopTimer();
    this.setData({
      currentScreen: 'start',
      isGameActive: false
    });
  },

  startGame() {
    this.setData({
      messageText: '',
      isGameActive: true
    });

    this.stopTimer();
    this.startTimer();

    // Select puzzle
    let puzzleSet;
    const diff = this.data.difficulty;
    if (diff === 'easy') puzzleSet = easyPuzzles;
    else if (diff === 'medium') puzzleSet = mediumPuzzles;
    else puzzleSet = hardPuzzles;

    const randomIdx = Math.floor(Math.random() * puzzleSet.length);
    const puzzle = puzzleSet[randomIdx] || easyPuzzles[0];

    const solution = [...puzzle.solution];
    const original = [...puzzle.original];

    // Build board object with 3x3 block border flags
    const board = original.map((val, idx) => {
      const col = idx % 9;
      const row = Math.floor(idx / 9);
      return {
        value: val,
        fixed: val !== 0,
        incorrect: false,
        correct: false,
        // Add thicker borders for 3x3 blocks (after columns 2, 5 and rows 2, 5)
        borderRight: col === 2 || col === 5,
        borderBottom: row === 2 || row === 5
      };
    });

    this.setData({
      board,
      solutionBoard: solution
    });
  },

  onInputCell(e) {
    const idx = e.currentTarget.dataset.index;
    let val = e.detail.value;

    // Handle empty or invalid input
    if (val === '') val = 0;
    else val = parseInt(val);

    // If it's a multi-character string (paste/fast type), take last char
    if (val > 9) val = parseInt(val.toString().slice(-1));
    if (isNaN(val)) val = 0;

    // Update board state
    const board = this.data.board;
    board[idx].value = val;
    board[idx].incorrect = false;
    board[idx].correct = false; // Reset status

    if (val !== 0) {
      if (val !== this.data.solutionBoard[idx]) {
        board[idx].incorrect = true;
      }
    }

    // Force update to reflect cleaned value if needed
    this.setData({ [`board[${idx}]`]: board[idx] });

    this.checkIfWon();
  },

  onTapReveal() {
    const board = this.data.board.map((cell, idx) => ({
      ...cell,
      value: this.data.solutionBoard[idx],
      incorrect: false,
      correct: false,
      fixed: true // Lock board
    }));

    this.setData({ board });
    this.stopTimer();
    this.setData({
      isGameActive: false,
      messageText: 'Solution revealed.',
      messageColor: '#636e72'
    });
  },

  startTimer() {
    this.startTime = Date.now();
    this.setData({ timer: '00:00' });

    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const seconds = (elapsed % 60).toString().padStart(2, '0');
      this.setData({ timer: `${minutes}:${seconds}` });
    }, 1000);
  },

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  checkIfWon() {
    if (!this.data.isGameActive) return;

    let filledCount = 0;
    let isCorrect = true;
    const { board, solutionBoard } = this.data;

    for (let i = 0; i < 81; i++) {
      const val = board[i].value;
      if (val !== 0) filledCount++;
      if (val !== 0 && val !== solutionBoard[i]) isCorrect = false;
    }

    if (filledCount === 81 && isCorrect) {
      this.stopTimer();
      this.setData({
        isGameActive: false,
        currentScreen: 'win'
      });
    }
  }
});
