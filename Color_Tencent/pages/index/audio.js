/**
 * Audio System - Web Audio API Sound Generator
 * No external audio files required
 */

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.sfxVolume = 0.5;
    this.musicVolume = 0.3;
    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.musicOscillators = [];
    this.musicPlaying = false;
  }

  init() {
    if (this.audioContext) return;
    try {
      this.audioContext = wx.createWebAudioContext();
    } catch (e) {
      console.warn('Web Audio not supported');
    }
  }

  setVolume(sfx, music) {
    this.sfxVolume = sfx;
    this.musicVolume = music;
  }

  setSfxEnabled(enabled) {
    this.sfxEnabled = enabled;
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    }
  }

  // Play a simple tone
  playTone(frequency, duration, type = 'sine', volume = 1) {
    if (!this.audioContext || !this.sfxEnabled) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(this.sfxVolume * volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  // Block placement tap sound
  playTap() {
    this.playTone(300, 0.08, 'square', 0.4);
    setTimeout(() => this.playTone(400, 0.05, 'square', 0.3), 20);
  }

  // Perfect placement ascending chime
  playPerfect() {
    const notes = [523, 659, 784]; // C5, E5, G5
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.6), i * 60);
    });
  }

  // Combo sound - escalates with level
  playCombo(level) {
    const baseFreq = 400 + (level * 50);
    this.playTone(baseFreq, 0.1, 'triangle', 0.5);
    setTimeout(() => this.playTone(baseFreq * 1.25, 0.1, 'triangle', 0.5), 50);
    if (level >= 3) {
      setTimeout(() => this.playTone(baseFreq * 1.5, 0.15, 'triangle', 0.6), 100);
    }
  }

  // Game over descending tone
  playGameOver() {
    const notes = [400, 350, 300, 250];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sawtooth', 0.4), i * 100);
    });
  }

  // Power-up activation
  playPowerUp() {
    const notes = [392, 494, 587, 784]; // G4, B4, D5, G5
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.1, 'sine', 0.5), i * 40);
    });
  }

  // Achievement unlock
  playAchievement() {
    const melody = [523, 659, 784, 1047]; // C5, E5, G5, C6
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.6), i * 100);
    });
  }

  // Menu navigation
  playMenuTap() {
    this.playTone(500, 0.05, 'sine', 0.3);
  }

  // Background music - ambient pad
  startBackgroundMusic() {
    if (!this.audioContext || !this.musicEnabled || this.musicPlaying) return;

    this.musicPlaying = true;
    this._playMusicLoop();
  }

  _playMusicLoop() {
    if (!this.musicPlaying || !this.musicEnabled) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Create ambient pad chord
    const frequencies = [130.81, 164.81, 196.00, 261.63]; // C3, E3, G3, C4

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const vol = this.musicVolume * 0.15;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.5);
      gain.gain.setValueAtTime(vol, now + 3.5);
      gain.gain.linearRampToValueAtTime(0, now + 4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 4);

      this.musicOscillators.push(osc);
    });

    // Loop
    this.musicTimeout = setTimeout(() => this._playMusicLoop(), 3800);
  }

  stopBackgroundMusic() {
    this.musicPlaying = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
    }
    this.musicOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    this.musicOscillators = [];
  }
}

module.exports = new AudioManager();
