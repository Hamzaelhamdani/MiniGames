// pages/paddleSelect/paddleSelect.js
const app = getApp()

Page({
    data: {},

    onSelectPaddle(e) {
        const paddle = e.currentTarget.dataset.paddle
        app.globalData.playerPaddle = paddle

        wx.navigateTo({
            url: '/pages/game/game'
        })
    }
})
