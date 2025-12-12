// pages/gameMode/gameMode.js
const app = getApp()

Page({
    data: {},

    onSelectAI() {
        app.globalData.gameMode = 'ai'
        wx.navigateTo({
            url: '/pages/difficulty/difficulty'
        })
    },

    onSelectFriend() {
        app.globalData.gameMode = 'friend'
        wx.navigateTo({
            url: '/pages/paddleSelect/paddleSelect'
        })
    }
})
