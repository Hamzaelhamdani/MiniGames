// pages/home/home.js
const app = getApp();
const firebase = require('../../utils/firebase');

Page({
  data: {
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      bestTime: null,
      winRate: 0
    },
    showStats: false
  },
  onLoad() {
    this.loadStats();
  },
  onShow() {
    this.loadStats();
  },
  loadStats() {
    const stats = app.getStats();
    const winRate = stats.gamesPlayed > 0 ? Math.round(stats.gamesWon / stats.gamesPlayed * 100) : 0;
    this.setData({
      stats: {
        ...stats,
        winRate
      },
      showStats: stats.gamesPlayed > 0
    });
  },
  startGame() {
    // Logger le clic sur "Nouvelle Partie"
    firebase.logNewGameClick();
    
    ma.vibrateShort({
      type: 'light'
    });
    ma.navigateTo({
      url: '/pages/game/game'
    });
  },
  formatTime(seconds) {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },
  onShareAppMessage() {
    return {
      title: '♠️ Solitaire - Jeu de Cartes Classique',
      path: '/pages/home/home'
    };
  }
});