// pages/home/home.js
Page({
  data: {},

  onStartGame() {
    wx.navigateTo({
      url: '/pages/game/game'
    })
  },

  onSettings() {
    wx.showToast({
      title: 'Settings coming soon!',
      icon: 'none'
    })
  }
})
