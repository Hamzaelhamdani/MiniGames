// utils/firebase.js - Firebase Analytics Integration

class FirebaseAnalytics {
  constructor() {
    this.initialized = false;
    this.config = {
      apiKey: "YOUR_API_KEY",
      projectId: "YOUR_PROJECT_ID",
      appId: "YOUR_APP_ID"
    };
    this.sessionStartTime = null;
    this.gameStartTime = null;
  }

  // Initialiser Firebase
  init(config) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.initialized = true;
    this.sessionStartTime = Date.now();
    this.logEvent('app_open', {
      timestamp: new Date().toISOString()
    });
    console.log('Firebase Analytics initialized');
  }

  // Logger un événement
  logEvent(eventName, params = {}) {
    if (!this.initialized) {
      console.warn('Firebase not initialized. Call init() first.');
      return;
    }

    const event = {
      event_name: eventName,
      timestamp: Date.now(),
      params: {
        ...params,
        platform: 'macle',
        app_version: '1.0.0'
      }
    };

    // Stocker l'événement localement
    this.storeEvent(event);

    // Envoyer à Firebase (si connexion disponible)
    this.sendToFirebase(event);

    console.log('📊 Firebase Event:', eventName, params);
  }

  // Stocker l'événement localement
  storeEvent(event) {
    try {
      let events = ma.getStorageSync('firebase_events') || [];
      events.push(event);
      
      // Limiter à 100 événements
      if (events.length > 100) {
        events = events.slice(-100);
      }
      
      ma.setStorageSync('firebase_events', events);
    } catch (e) {
      console.error('Error storing event:', e);
    }
  }

  // Envoyer à Firebase
  sendToFirebase(event) {
    // Utiliser le Measurement Protocol de Google Analytics 4
    const measurementId = this.config.measurementId || 'G-ST8Z4KVLER';
    const apiSecret = this.config.apiSecret || '8PhQ6PohQ5OXLPwy3Yfr1g';
    const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
    
    ma.request({
      url: endpoint,
      method: 'POST',
      data: {
        client_id: this.getClientId(),
        events: [{
          name: event.event_name,
          params: event.params
        }]
      },
      success: (res) => {
        console.log('✅ Event sent to Firebase:', event.event_name);
      },
      fail: (err) => {
        console.error('❌ Failed to send event:', err);
      }
    });
  }

  // Obtenir un ID client unique
  getClientId() {
    let clientId = ma.getStorageSync('firebase_client_id');
    if (!clientId) {
      clientId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      ma.setStorageSync('firebase_client_id', clientId);
    }
    return clientId;
  }

  // Logger le début d'une partie
  logGameStart() {
    this.gameStartTime = Date.now();
    this.logEvent('game_start', {
      timestamp: new Date().toISOString()
    });
  }

  // Logger la fin d'une partie
  logGameEnd(won, moves, time) {
    const duration = this.gameStartTime ? Math.floor((Date.now() - this.gameStartTime) / 1000) : time;
    
    this.logEvent('game_end', {
      won: won,
      moves: moves,
      time: time,
      duration_seconds: duration,
      timestamp: new Date().toISOString()
    });

    this.gameStartTime = null;
  }

  // Logger le clic sur le bouton "Nouvelle Partie"
  logNewGameClick() {
    this.logEvent('new_game_click', {
      timestamp: new Date().toISOString()
    });
  }

  // Logger le temps de session
  logSessionDuration() {
    if (this.sessionStartTime) {
      const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      this.logEvent('session_duration', {
        duration_seconds: duration,
        duration_minutes: Math.floor(duration / 60),
        timestamp: new Date().toISOString()
      });
    }
  }

  // Logger une action utilisateur
  logUserAction(action, params = {}) {
    this.logEvent('user_action', {
      action: action,
      ...params,
      timestamp: new Date().toISOString()
    });
  }

  // Obtenir les statistiques stockées localement
  getStoredEvents() {
    return ma.getStorageSync('firebase_events') || [];
  }

  // Nettoyer les événements stockés
  clearStoredEvents() {
    ma.setStorageSync('firebase_events', []);
  }
}

// Créer une instance singleton
const analytics = new FirebaseAnalytics();

module.exports = {
  analytics,
  init: (config) => analytics.init(config),
  logEvent: (name, params) => analytics.logEvent(name, params),
  logGameStart: () => analytics.logGameStart(),
  logGameEnd: (won, moves, time) => analytics.logGameEnd(won, moves, time),
  logNewGameClick: () => analytics.logNewGameClick(),
  logSessionDuration: () => analytics.logSessionDuration(),
  logUserAction: (action, params) => analytics.logUserAction(action, params)
};
