/**
 * Audio System - Using WeChat InnerAudioContext for consistent playback
 */

class AudioManager {
  constructor() {
    this.bgm = null;
    this.sfxEnabled = true;
    this.musicEnabled = true;

    // Pre-create contexts for low latency
    this.sounds = {
      stack: this._createContext('audio/stack.mp3'),
      perfect: this._createContext('audio/perfect.mp3'),
      lose: this._createContext('audio/lose.mp3')
    };
  }

  init() {
    if (this.bgm) return; // Prevent multiple initializations

    this.bgm = wx.createInnerAudioContext();
    this.bgm.src = 'audio/bgm.mp3';
    this.bgm.loop = true;
    this.bgm.autoplay = false;
  }

  _createContext(src) {
    const ctx = wx.createInnerAudioContext();
    ctx.src = src;
    return ctx;
  }

  setSfxEnabled(enabled) {
    this.sfxEnabled = enabled;
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
  }

  _playSound(name) {
    try {
      if (!this.sfxEnabled || !this.sounds || !this.sounds[name]) return;

      // Defensive check for audio context state
      const ctx = this.sounds[name];
      if (typeof ctx.stop === 'function') {
        ctx.stop();
      }
      if (typeof ctx.play === 'function') {
        ctx.play();
      }
    } catch (err) {
      console.error('Audio playback error:', err);
    }
  }

  // Block placement tap sound
  playTap() {
    this._playSound('stack');
  }

  // Perfect placement
  playPerfect() {
    this._playSound('perfect');
  }

  // Combo sound
  playCombo(level) {
    // Re-use perfect sound for combos
    this._playSound('perfect');
  }

  // Game over
  playGameOver() {
    this._playSound('lose');
  }

  // Power-up activation
  playPowerUp() {
    this._playSound('perfect');
  }

  // Achievement unlock
  playAchievement() {
    this._playSound('perfect');
  }

  // Menu navigation
  playMenuTap() {
    this._playSound('stack');
  }

  // Background music
  startBackgroundMusic() {
    try {
      if (!this.bgm) this.init();
      if (this.musicEnabled && this.bgm && typeof this.bgm.play === 'function') {
        this.bgm.play();
      }
    } catch (err) {
      console.error('BGM start error:', err);
    }
  }

  stopBackgroundMusic() {
    try {
      if (this.bgm && typeof this.bgm.stop === 'function') {
        this.bgm.stop();
      }
    } catch (err) {
      console.error('BGM stop error:', err);
    }
  }
}

module.exports = new AudioManager();
