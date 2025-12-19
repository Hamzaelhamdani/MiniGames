// pages/game/game.js - ULTRA SIMPLE VERSION
Page({
    data: { s1: 0, s2: 0 },

    onLoad() {
        const ctx = wx.createCanvasContext('pongCanvas', this)
        const info = wx.getSystemInfoSync()
        const W = info.windowWidth
        const H = info.windowHeight - 50

        let p1 = { x: 20, y: H / 2 - 40, w: 12, h: 80 }
        let p2 = { x: W - 32, y: H / 2 - 40, w: 12, h: 80 }
        let ball = { x: W / 2, y: H / 2, dx: 5, dy: 4, r: 8 }

        const draw = () => {
            // Background
            ctx.setFillStyle('#0a4a0a')
            ctx.fillRect(0, 0, W, H)

            // Line
            ctx.setStrokeStyle('#fff')
            ctx.setLineWidth(2)
            ctx.beginPath()
            ctx.moveTo(W / 2, 0)
            ctx.lineTo(W / 2, H)
            ctx.stroke()

            // Scores
            ctx.setFillStyle('#fff')
            ctx.setFont('60px Arial')
            ctx.setTextAlign('center')
            ctx.fillText(this.data.s1 + '', W / 4, 80)
            ctx.setFillStyle('#ff6b35')
            ctx.fillText(this.data.s2 + '', W * 3 / 4, 80)

            // Paddles
            ctx.setFillStyle('#fff')
            ctx.fillRect(p1.x, p1.y, p1.w, p1.h)
            ctx.setFillStyle('#ff6b35')
            ctx.fillRect(p2.x, p2.y, p2.w, p2.h)

            // Ball
            ctx.setFillStyle('#fff')
            ctx.beginPath()
            ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
            ctx.fill()

            ctx.draw()
        }

        const update = () => {
            ball.x += ball.dx
            ball.y += ball.dy

            if (ball.y < ball.r || ball.y > H - ball.r) ball.dy = -ball.dy

            if ((ball.x < p1.x + p1.w && ball.y > p1.y && ball.y < p1.y + p1.h) ||
                (ball.x > p2.x && ball.y > p2.y && ball.y < p2.y + p2.h)) {
                ball.dx = -ball.dx
            }

            if (ball.x < 0) {
                this.setData({ s2: this.data.s2 + 1 })
                ball.x = W / 2
                ball.y = H / 2
            }
            if (ball.x > W) {
                this.setData({ s1: this.data.s1 + 1 })
                ball.x = W / 2
                ball.y = H / 2
            }

            draw()
            requestAnimationFrame(update)
        }

        this.onTouchMove = (e) => {
            const t = e.touches[0]
            if (t.x < W / 2) p1.y = t.y - 40
            else p2.y = t.y - 40
        }

        setTimeout(update, 100)
    },

    onRestart() {
        this.setData({ s1: 0, s2: 0 })
    },

    onHome() {
        wx.navigateBack()
    }
})
