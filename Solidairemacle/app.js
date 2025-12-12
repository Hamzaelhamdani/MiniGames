// app.js - Solitaire Offline
const firebase = require('./utils/firebase');

App({
  onLaunch() {
    // Initialize Firebase Analytics
    firebase.init({
      apiKey: "AIzaSyCFuYazsVatYK6DOCxGINa9DZNfg59gjx0",
      projectId: "miniapptest-6eec4",
      appId: "1:233960176208:web:516cc47f3a42e818bbef55",
      measurementId: "G-ST8Z4KVLER",
      apiSecret: "8PhQ6PohQ5OXLPwy3Yfr1g"
    });

    // Initialize game stats
    const stats = ma.getStorageSync('solitaireStats');
    if (!stats) {
      ma.setStorageSync('solitaireStats', {
        gamesPlayed: 0,
        gamesWon: 0,
        bestTime: null,
        totalTime: 0
      });
    }
    console.log('♠️ Solitaire - Jeu de Cartes Offline');
  },
  onHide() {
    // Logger la durée de session quand l'app est mise en arrière-plan
    firebase.logSessionDuration();
  },
  globalData: {
    appName: 'Solitaire',
    version: '1.0.0'
  },
  // Update stats after game
  updateStats(won, time) {
    const stats = ma.getStorageSync('solitaireStats') || {
      gamesPlayed: 0,
      gamesWon: 0,
      bestTime: null,
      totalTime: 0
    };
    stats.gamesPlayed += 1;
    stats.totalTime += time;
    if (won) {
      stats.gamesWon += 1;
      if (!stats.bestTime || time < stats.bestTime) {
        stats.bestTime = time;
      }
    }
    ma.setStorageSync('solitaireStats', stats);
    return stats;
  },
  getStats() {
    return ma.getStorageSync('solitaireStats') || {
      gamesPlayed: 0,
      gamesWon: 0,
      bestTime: null,
      totalTime: 0
    };
  }
});