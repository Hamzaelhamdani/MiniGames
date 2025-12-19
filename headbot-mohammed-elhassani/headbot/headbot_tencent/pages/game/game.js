const GameEngine = require('../../utils/GameEngine.js')

Page({
    data: {},
    onLoad() {
        this.initGame()
    },
    initGame() {
        wx.createSelectorQuery()
            .select('#gameCanvas')
            .fields({ node: true, size: true })
            .exec((res) => {
                const canvas = res[0].node
                const width = res[0].width
                const height = res[0].height

                // Handle high DPI screens
                const dpr = wx.getSystemInfoSync().pixelRatio
                canvas.width = width * dpr
                canvas.height = height * dpr

                const ctx = canvas.getContext('2d')
                ctx.scale(dpr, dpr)

                this.gameEngine = new GameEngine(canvas, ctx, width, height)
                this.gameEngine.start()
            })
    },
    onTouchStart() {
        if (this.gameEngine) {
            this.gameEngine.handleInput(true)
        }
    },
    onTouchEnd() {
        if (this.gameEngine) {
            this.gameEngine.handleInput(false)
        }
    },
    onUnload() {
        if (this.gameEngine) {
            this.gameEngine.stop()
        }
    }
})
