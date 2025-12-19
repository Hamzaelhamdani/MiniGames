// index.js
Page({
  data: {
    showDifficultyModal: false,
    difficulty: 'easy',
    series: 1,
    // Default Best of 1
    gameType: 'robot'
  },
  onRobotBtn() {
    this.setData({
      showDifficultyModal: true,
      gameType: 'robot'
    });
  },
  onFriendBtn() {
    this.setData({
      showDifficultyModal: true,
      gameType: 'friend'
    });
  },
  closeModal() {
    this.setData({
      showDifficultyModal: false
    });
  },
  setDifficulty(e) {
    this.setData({
      difficulty: e.currentTarget.dataset.level
    });
  },
  setSeries(e) {
    this.setData({
      series: e.currentTarget.dataset.count
    });
  },
  handleStartGame() {
    const {
      difficulty,
      series,
      gameType
    } = this.data;
    this.closeModal();
    if (gameType === 'robot') {
      ma.navigateTo({
        url: `/pages/game/game?type=robot&difficulty=${difficulty}&series=${series}`
      });
    } else {
      ma.navigateTo({
        url: `/pages/game/game?type=friend&series=${series}`
      });
    }
  },
  startGame(e) {
    const type = e.currentTarget.dataset.type;
    // Direct link only used for Friend mode now: Default to 3 rounds
    if (type === 'friend') {
      this.onFriendBtn();
    }
  }
});