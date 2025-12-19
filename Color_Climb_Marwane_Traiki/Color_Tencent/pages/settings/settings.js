const Audio = require('../index/audio');
const { getThemeList } = require('../index/themes');

Page({
    data: {
        difficulty: 'normal',
        theme: 'default',
        sfxEnabled: true,
        musicEnabled: true,
        vibrationEnabled: true,
        themes: []
    },

    onLoad() {
        const settings = wx.getStorageSync('stack_settings') || {};

        this.setData({
            difficulty: settings.difficulty || 'normal',
            theme: settings.theme || 'default',
            sfxEnabled: settings.sfxEnabled !== false,
            musicEnabled: settings.musicEnabled !== false,
            vibrationEnabled: settings.vibrationEnabled !== false,
            themes: getThemeList()
        });
    },

    onDifficultyChange(e) {
        const difficulty = e.currentTarget.dataset.value;
        this.setData({ difficulty });
        this.saveSettings();
    },

    onThemeChange(e) {
        const theme = e.currentTarget.dataset.value;
        this.setData({ theme });
        this.saveSettings();
    },

    onSfxToggle() {
        const sfxEnabled = !this.data.sfxEnabled;
        this.setData({ sfxEnabled });
        Audio.setSfxEnabled(sfxEnabled);
        this.saveSettings();
    },

    onMusicToggle() {
        const musicEnabled = !this.data.musicEnabled;
        this.setData({ musicEnabled });
        Audio.setMusicEnabled(musicEnabled);
        this.saveSettings();
    },

    onVibrationToggle() {
        const vibrationEnabled = !this.data.vibrationEnabled;
        this.setData({ vibrationEnabled });
        if (vibrationEnabled) {
            wx.vibrateShort();
        }
        this.saveSettings();
    },

    saveSettings() {
        wx.setStorageSync('stack_settings', {
            difficulty: this.data.difficulty,
            theme: this.data.theme,
            sfxEnabled: this.data.sfxEnabled,
            musicEnabled: this.data.musicEnabled,
            vibrationEnabled: this.data.vibrationEnabled
        });
    },

    onBack() {
        wx.navigateBack();
    }
});
