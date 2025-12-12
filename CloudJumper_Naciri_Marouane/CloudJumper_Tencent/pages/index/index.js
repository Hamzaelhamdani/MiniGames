Page({
  data: {
    highScore: 0
  },

  onLoad() {
    this.loadHighScore();
  },

  onShow() {
    // Refresh high score when returning from game
    this.loadHighScore();
  },

  loadHighScore() {
    const highScore = wx.getStorageSync('highScore') || 0;
    this.setData({ highScore: highScore });
  },

  onStartGame() {
    console.log("Start Game Clicked");
    wx.navigateTo({
      url: '/pages/game/game'
    });
  }
})
