// pages/difficulty/difficulty.js
const app = getApp()

Page({
    data: {},

    onSelectDifficulty(e) {
        const difficulty = e.currentTarget.dataset.difficulty
        app.globalData.difficulty = difficulty
        app.globalData.playerPaddle = 'white' // Default for AI mode

        wx.navigateTo({
            url: '/pages/game/game'
        })
    }
})
