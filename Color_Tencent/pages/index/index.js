const Renderer = require('./render');
const Game = require('./game');
const Audio = require('./audio');
const { getThemeList } = require('./themes');

Page({
  data: {
    score: 0,
    highScore: 0,
    combo: 0,
    playTime: 0,
    isPlaying: false,
    isGameOver: false,
    isNewHighScore: false,

    difficulty: 'normal',
    theme: 'default',
    sfxEnabled: true,
    musicEnabled: true,
    vibrationEnabled: true,
    themes: []
  },

  onLoad() {
    const highScore = wx.getStorageSync('climbcolor_high_score') || 0;
    const settings = wx.getStorageSync('climbcolor_settings') || {};

    this.setData({
      highScore,
      difficulty: settings.difficulty || 'normal',
      theme: settings.theme || 'default',
      sfxEnabled: settings.sfxEnabled !== false,
      musicEnabled: settings.musicEnabled !== false,
      vibrationEnabled: settings.vibrationEnabled !== false,
      themes: getThemeList()
    });
  },

  onReady() {
    this.setupCanvas();
  },

  setupCanvas() {
    wx.createSelectorQuery()
      .select('#gameCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        this.renderer = new Renderer(canvas, ctx);
        this.renderer.updateDimensions(res[0].width, res[0].height);
        this.renderer.setTheme(this.data.theme);

        Audio.setSfxEnabled(this.data.sfxEnabled);
        Audio.setMusicEnabled(this.data.musicEnabled);

        this.game = new Game(
          this.renderer,
          (score) => {
            this.setData({ score });
          },
          (finalScore) => {
            const playTime = this.game.getPlayTime();
            const isNewHighScore = finalScore > this.data.highScore;

            if (isNewHighScore) {
              wx.setStorageSync('climbcolor_high_score', finalScore);
              this.setData({ highScore: finalScore });
            }

            this.setData({
              isGameOver: true,
              isPlaying: false,
              playTime: playTime,
              isNewHighScore: isNewHighScore
            });

            if (this.data.vibrationEnabled) {
              wx.vibrateLong();
            }
            Audio.stopBackgroundMusic();
          },
          {
            onComboChange: (combo) => this.setData({ combo })
          }
        );

        this.game.setDifficulty(this.data.difficulty);

        // Optimized render loop
        let lastTime = 0;
        const loop = (time) => {
          if (time - lastTime >= 16) {
            this.game.tick(Date.now());
            this.renderer.render({
              stack: this.game.stack,
              debris: this.game.debris,
              currentBlock: this.game.currentBlock,
              isGameOver: this.data.isGameOver,
              perfectEffect: this.game.perfectEffect,
              floatingTexts: this.game.getFloatingTexts(),
              score: this.data.score,
              combo: this.data.combo,
              isPlaying: this.data.isPlaying,
              highScore: this.data.highScore,
              playTime: this.data.playTime,
              isNewHighScore: this.data.isNewHighScore
            });
            lastTime = time;
          }
          canvas.requestAnimationFrame(loop);
        };
        canvas.requestAnimationFrame(loop);
      });
  },

  onTouchStart(e) {
    if (this.data.isGameOver || !this.data.isPlaying) {
      this.setData({
        isGameOver: false,
        isPlaying: true,
        score: 0,
        playTime: 0,
        isNewHighScore: false
      });
      this.game.setDifficulty(this.data.difficulty);
      this.game.start();
      if (this.data.musicEnabled) {
        Audio.startBackgroundMusic();
      }
      return;
    }

    this.game.placeBlock();
  },

  onShareAppMessage() {
    return {
      title: `I scored ${this.data.score} in Climb Color! Can you beat me?`,
      path: '/pages/index/index'
    };
  }
});
