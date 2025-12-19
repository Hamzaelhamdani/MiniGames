const app = getApp()

Page({
    data: {
        score: 0,
        highScore: 0,
        gameOver: false,
        isNewHighScore: false
    },

    onLoad() {
        console.log("Game Page Loaded");
        // Load high score from storage
        const highScore = wx.getStorageSync('highScore') || 0;
        this.setData({ highScore: highScore });
    },

    onReady() {
        console.log("Game Page Ready - Initializing Canvas");
        this.initGame();
    },

    onUnload() {
        this.cancelGameLoop();
    },

    initGame() {
        const query = wx.createSelectorQuery()
        query.select('#gameCanvas')
            .fields({ node: true, size: true })
            .exec((res) => {
                console.log("Exec callback received", res);
                if (!res || !res[0] || !res[0].node) {
                    console.error("Canvas Not Found! Ensure id matches and type is 2d");
                    return;
                }
                const canvas = res[0].node
                const ctx = canvas.getContext('2d')
                console.log("Canvas Context Created", ctx);

                const dpr = wx.getSystemInfoSync().pixelRatio
                console.log("Pixel Ratio:", dpr);

                canvas.width = res[0].width * dpr
                canvas.height = res[0].height * dpr
                ctx.scale(dpr, dpr)

                this.canvas = canvas;
                this.ctx = ctx;
                this.width = res[0].width;
                this.height = res[0].height;
                console.log("Canvas Dimensions Set:", this.width, this.height);

                // Load bird image
                const birdImage = canvas.createImage();
                birdImage.src = '/images/bird.png';
                birdImage.onload = () => {
                    console.log("Bird image loaded");
                    this.birdImage = birdImage;
                    this.restartGame();
                };
                birdImage.onerror = (err) => {
                    console.error("Failed to load bird image", err);
                    // Fallback: start game without image
                    this.birdImage = null;
                    this.restartGame();
                };
            })
    },

    restartGame() {
        this.setData({ score: 0, gameOver: false });

        // Game Physics Constants
        this.gravity = 0.25;
        this.jumpStrength = -6; // Velocity when jumping
        this.pipeSpeed = 2; // Speed of pipes moving left
        this.pipeSpawnRate = 120; // Frames between pipe spawns
        this.pipeGap = 150; // Vertical gap between pipes

        // Bird Object
        this.bird = {
            x: 50,
            y: this.height / 2,
            width: 80,
            height: 60,
            velocity: 0
        };

        // Pipes Array
        this.pipes = [];
        this.frameCount = 0;

        this.isPlaying = true;
        this.gameLoop();
    },

    cancelGameLoop() {
        if (this.animationId) {
            this.canvas.cancelAnimationFrame(this.animationId);
        }
        this.isPlaying = false;
    },

    gameLoop() {
        if (!this.isPlaying) return;

        this.update();
        this.draw();

        this.animationId = this.canvas.requestAnimationFrame(() => {
            this.gameLoop();
        });
    },

    onTouchStart() {
        if (this.data.gameOver) {
            this.restartGame();
        } else {
            this.bird.velocity = this.jumpStrength;
        }
    },

    update() {
        if (this.data.gameOver) return;

        this.frameCount++;

        // Bird Physics
        this.bird.velocity += this.gravity;
        this.bird.y += this.bird.velocity;

        // Ground Collision
        if (this.bird.y + this.bird.height / 2 >= this.height) {
            this.endGame();
        }
        // Ceiling Collision
        if (this.bird.y - this.bird.height / 2 <= 0) {
            this.bird.y = this.bird.height / 2;
            this.bird.velocity = 0;
        }

        // Pipe Spawning
        if (this.frameCount % this.pipeSpawnRate === 0) {
            this.spawnPipe();
        }

        // Pipe Management
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            let pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;

            // Remove off-screen pipes
            if (pipe.x + pipe.width < 0) {
                this.pipes.splice(i, 1);
                continue;
            }

            // Score counting (when bird passes pipe) - only count top pipe to avoid double scoring
            if (!pipe.passed && pipe.type === 'top' && pipe.x + pipe.width < this.bird.x) {
                pipe.passed = true;
                this.setData({ score: this.data.score + 1 });
            }

            // Collision Detection
            if (this.checkCollision(this.bird, pipe)) {
                this.endGame();
            }
        }
    },

    spawnPipe() {
        const minHeight = 50;
        const maxPipeHeight = this.height - this.pipeGap - minHeight;
        const topHeight = Math.floor(Math.random() * (maxPipeHeight - minHeight + 1)) + minHeight;

        this.pipes.push({
            x: this.width,
            y: 0,
            width: 50,
            height: topHeight,
            type: 'top',
            passed: false
        });

        this.pipes.push({
            x: this.width,
            y: topHeight + this.pipeGap,
            width: 50,
            height: this.height - (topHeight + this.pipeGap),
            type: 'bottom',
            passed: false
        });
    },

    checkCollision(bird, pipe) {
        // Add margin to make hitbox more forgiving (smaller than visual)
        const margin = 15;
        const halfW = (bird.width / 2) - margin;
        const halfH = (bird.height / 2) - margin;
        if (
            bird.x + halfW > pipe.x &&
            bird.x - halfW < pipe.x + pipe.width &&
            bird.y + halfH > pipe.y &&
            bird.y - halfH < pipe.y + pipe.height
        ) {
            return true;
        }
        return false;
    },

    endGame() {
        // Check for new high score
        let isNewHighScore = false;
        if (this.data.score > this.data.highScore) {
            isNewHighScore = true;
            wx.setStorageSync('highScore', this.data.score);
            this.setData({
                gameOver: true,
                highScore: this.data.score,
                isNewHighScore: true
            });
        } else {
            this.setData({ gameOver: true, isNewHighScore: false });
        }
        this.isPlaying = false;
        this.draw();
    },

    draw() {
        const ctx = this.ctx;

        // Draw progressive background first
        this.drawBackground(ctx);

        // Draw game elements on top
        this.drawGameElements();
    },

    drawBackground(ctx) {
        // Smooth transition: use continuous value instead of discrete phases
        // Full cycle every 30 points, smooth interpolation
        const timeOfDay = (this.data.score % 30) / 30;

        // Sky colors for different times
        const skyColors = this.getSkyColors(timeOfDay);

        // Draw sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.height);
        skyGradient.addColorStop(0, skyColors.top);
        skyGradient.addColorStop(0.6, skyColors.middle);
        skyGradient.addColorStop(1, skyColors.bottom);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw stars at night
        if (timeOfDay > 0.6 || timeOfDay < 0.1) {
            this.drawStars(ctx, timeOfDay);
        }

        // Draw sun or moon
        this.drawCelestialBody(ctx, timeOfDay);

        // Draw clouds
        this.drawClouds(ctx, timeOfDay);

        // Draw mountains (back layer)
        this.drawMountains(ctx, '#4A5568', 0.7, 80);

        // Draw mountains (front layer)
        this.drawMountains(ctx, '#2D3748', 0.5, 60);

        // Draw river
        this.drawRiver(ctx, timeOfDay);
    },

    getSkyColors(timeOfDay) {
        // Define color stops for smooth interpolation
        const colorStops = [
            { time: 0.0, top: [10, 10, 30], middle: [26, 26, 62], bottom: [45, 27, 62] },      // Night
            { time: 0.15, top: [30, 58, 95], middle: [244, 164, 96], bottom: [255, 107, 107] }, // Sunrise
            { time: 0.3, top: [74, 144, 217], middle: [135, 206, 235], bottom: [176, 224, 230] }, // Morning
            { time: 0.5, top: [30, 144, 255], middle: [135, 206, 235], bottom: [224, 246, 255] }, // Midday
            { time: 0.65, top: [74, 44, 122], middle: [255, 127, 80], bottom: [255, 215, 0] },  // Sunset
            { time: 0.8, top: [26, 26, 62], middle: [74, 58, 110], bottom: [139, 69, 112] },    // Dusk
            { time: 1.0, top: [10, 10, 30], middle: [26, 26, 62], bottom: [45, 27, 62] }       // Night (loop)
        ];

        // Find the two color stops to interpolate between
        let startStop = colorStops[0];
        let endStop = colorStops[1];

        for (let i = 0; i < colorStops.length - 1; i++) {
            if (timeOfDay >= colorStops[i].time && timeOfDay <= colorStops[i + 1].time) {
                startStop = colorStops[i];
                endStop = colorStops[i + 1];
                break;
            }
        }

        // Calculate interpolation factor
        const range = endStop.time - startStop.time;
        const t = range > 0 ? (timeOfDay - startStop.time) / range : 0;

        // Interpolate colors
        const lerp = (a, b, t) => Math.round(a + (b - a) * t);
        const lerpColor = (c1, c2, t) => {
            return `rgb(${lerp(c1[0], c2[0], t)}, ${lerp(c1[1], c2[1], t)}, ${lerp(c1[2], c2[2], t)})`;
        };

        return {
            top: lerpColor(startStop.top, endStop.top, t),
            middle: lerpColor(startStop.middle, endStop.middle, t),
            bottom: lerpColor(startStop.bottom, endStop.bottom, t)
        };
    },

    drawCelestialBody(ctx, timeOfDay) {
        const isNight = timeOfDay > 0.65 || timeOfDay < 0.1;

        // Fixed horizontal position (right side of sky)
        const x = this.width * 0.75;

        // Fixed vertical position based on phase (no animation within phase)
        let y;
        const lowPosition = this.height * 0.45;   // Near horizon
        const highPosition = 80;                   // High in sky

        if (isNight) {
            // Moon stays high in the sky at night
            y = highPosition;
        } else if (timeOfDay < 0.2) {
            // Sunrise - sun is low
            y = lowPosition;
        } else if (timeOfDay < 0.55) {
            // Midday - sun is high
            y = highPosition;
        } else {
            // Sunset - sun is low
            y = lowPosition;
        }

        ctx.save();

        if (isNight) {
            // Draw moon
            ctx.fillStyle = '#f5f5dc';
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, Math.PI * 2);
            ctx.fill();

            // Moon craters
            ctx.fillStyle = 'rgba(200, 200, 180, 0.5)';
            ctx.beginPath();
            ctx.arc(x - 8, y - 5, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 6, y + 8, 3, 0, Math.PI * 2);
            ctx.fill();

            // Moon glow
            const moonGlow = ctx.createRadialGradient(x, y, 25, x, y, 60);
            moonGlow.addColorStop(0, 'rgba(255, 255, 220, 0.3)');
            moonGlow.addColorStop(1, 'rgba(255, 255, 220, 0)');
            ctx.fillStyle = moonGlow;
            ctx.beginPath();
            ctx.arc(x, y, 60, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw sun glow
            const sunGlow = ctx.createRadialGradient(x, y, 20, x, y, 80);
            sunGlow.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
            sunGlow.addColorStop(0.5, 'rgba(255, 150, 50, 0.3)');
            sunGlow.addColorStop(1, 'rgba(255, 100, 50, 0)');
            ctx.fillStyle = sunGlow;
            ctx.beginPath();
            ctx.arc(x, y, 80, 0, Math.PI * 2);
            ctx.fill();

            // Draw sun
            const sunGradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
            sunGradient.addColorStop(0, '#fff5e0');
            sunGradient.addColorStop(0.7, '#ffd700');
            sunGradient.addColorStop(1, '#ff8c00');
            ctx.fillStyle = sunGradient;
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    },

    drawStars(ctx, timeOfDay) {
        const starOpacity = timeOfDay > 0.65 ? Math.min((timeOfDay - 0.65) * 3, 1) : Math.max(1 - timeOfDay * 10, 0);

        ctx.fillStyle = `rgba(255, 255, 255, ${starOpacity})`;

        // Fixed star positions (seeded by simple pattern)
        const stars = [
            [0.1, 0.1], [0.25, 0.05], [0.4, 0.12], [0.6, 0.08], [0.75, 0.15], [0.9, 0.1],
            [0.15, 0.2], [0.35, 0.18], [0.55, 0.22], [0.7, 0.25], [0.85, 0.2],
            [0.05, 0.3], [0.2, 0.28], [0.45, 0.32], [0.65, 0.3], [0.8, 0.35],
            [0.12, 0.4], [0.3, 0.38], [0.5, 0.42], [0.72, 0.4], [0.92, 0.38]
        ];

        stars.forEach(([px, py]) => {
            const size = 1 + Math.random() * 1.5;
            ctx.beginPath();
            ctx.arc(this.width * px, this.height * py, size, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    drawClouds(ctx, timeOfDay) {
        const isNight = timeOfDay > 0.65 || timeOfDay < 0.1;
        const cloudColor = isNight ? 'rgba(100, 100, 120, 0.4)' : 'rgba(255, 255, 255, 0.8)';

        // Animate clouds based on frameCount
        const offset = (this.frameCount * 0.3) % this.width;

        ctx.fillStyle = cloudColor;

        // Cloud 1
        this.drawCloud(ctx, (100 - offset + this.width) % this.width, 50, 1);

        // Cloud 2
        this.drawCloud(ctx, (250 - offset * 0.7 + this.width) % this.width, 80, 0.8);

        // Cloud 3
        this.drawCloud(ctx, (180 - offset * 0.5 + this.width) % this.width, 120, 0.6);
    },

    drawCloud(ctx, x, y, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.arc(25, -5, 25, 0, Math.PI * 2);
        ctx.arc(50, 0, 20, 0, Math.PI * 2);
        ctx.arc(15, 10, 15, 0, Math.PI * 2);
        ctx.arc(35, 10, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawMountains(ctx, color, heightFactor, baseOffset) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, this.height - baseOffset);

        // Create mountain peaks
        const peaks = [
            [0.1, 0.6], [0.25, 0.8], [0.4, 0.5], [0.55, 0.9], [0.7, 0.6], [0.85, 0.75], [1.0, 0.5]
        ];

        peaks.forEach(([px, py]) => {
            ctx.lineTo(this.width * px, this.height - baseOffset - (100 * py * heightFactor));
        });

        ctx.lineTo(this.width, this.height - baseOffset);
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.closePath();
        ctx.fill();
    },

    drawRiver(ctx, timeOfDay) {
        const riverY = this.height - 40;
        const riverHeight = 40;

        // River gradient based on time
        const isNight = timeOfDay > 0.65 || timeOfDay < 0.1;
        const riverGradient = ctx.createLinearGradient(0, riverY, 0, this.height);

        if (isNight) {
            riverGradient.addColorStop(0, '#1a3a5a');
            riverGradient.addColorStop(1, '#0a2a4a');
        } else {
            riverGradient.addColorStop(0, '#4aa3df');
            riverGradient.addColorStop(1, '#2980b9');
        }

        ctx.fillStyle = riverGradient;
        ctx.fillRect(0, riverY, this.width, riverHeight);

        // Animated wave lines
        ctx.strokeStyle = isNight ? 'rgba(150, 200, 255, 0.3)' : 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;

        const waveOffset = (this.frameCount * 2) % 40;

        for (let i = -40; i < this.width + 40; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i + waveOffset, riverY + 10);
            ctx.quadraticCurveTo(i + 10 + waveOffset, riverY + 5, i + 20 + waveOffset, riverY + 10);
            ctx.quadraticCurveTo(i + 30 + waveOffset, riverY + 15, i + 40 + waveOffset, riverY + 10);
            ctx.stroke();
        }

        for (let i = -40; i < this.width + 40; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i + waveOffset * 0.8, riverY + 25);
            ctx.quadraticCurveTo(i + 12 + waveOffset * 0.8, riverY + 20, i + 25 + waveOffset * 0.8, riverY + 25);
            ctx.stroke();
        }
    },

    drawGameElements() {
        const ctx = this.ctx;

        // Draw Bird
        ctx.save();
        ctx.translate(this.bird.x, this.bird.y);
        // Rotate bird based on velocity for a more dynamic look
        const rotation = Math.min(Math.max(this.bird.velocity * 3, -30), 90) * (Math.PI / 180);
        ctx.rotate(rotation);
        if (this.birdImage) {
            ctx.drawImage(
                this.birdImage,
                -this.bird.width / 2,
                -this.bird.height / 2,
                this.bird.width,
                this.bird.height
            );
        } else {
            // Fallback: draw yellow circle if image not loaded
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, this.bird.width / 2, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.restore();

        // Draw Pipes with enhanced graphics
        this.pipes.forEach(pipe => {
            const capHeight = 20;
            const capOverhang = 6;

            // Create gradient for pipe body
            const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
            gradient.addColorStop(0, '#2E8B2E');
            gradient.addColorStop(0.3, '#5DC45D');
            gradient.addColorStop(0.5, '#7ED67E');
            gradient.addColorStop(0.7, '#5DC45D');
            gradient.addColorStop(1, '#1E6B1E');

            // Draw pipe body
            ctx.fillStyle = gradient;
            ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);

            // Pipe body border
            ctx.strokeStyle = '#145214';
            ctx.lineWidth = 2;
            ctx.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);

            // Draw pipe cap (the wider part at the opening)
            const capGradient = ctx.createLinearGradient(pipe.x - capOverhang, 0, pipe.x + pipe.width + capOverhang, 0);
            capGradient.addColorStop(0, '#2E8B2E');
            capGradient.addColorStop(0.3, '#6BD66B');
            capGradient.addColorStop(0.5, '#8FE88F');
            capGradient.addColorStop(0.7, '#6BD66B');
            capGradient.addColorStop(1, '#1E6B1E');

            ctx.fillStyle = capGradient;

            if (pipe.type === 'top') {
                // Cap at bottom of top pipe
                ctx.fillRect(pipe.x - capOverhang, pipe.height - capHeight, pipe.width + capOverhang * 2, capHeight);
                ctx.strokeRect(pipe.x - capOverhang, pipe.height - capHeight, pipe.width + capOverhang * 2, capHeight);
            } else {
                // Cap at top of bottom pipe
                ctx.fillRect(pipe.x - capOverhang, pipe.y, pipe.width + capOverhang * 2, capHeight);
                ctx.strokeRect(pipe.x - capOverhang, pipe.y, pipe.width + capOverhang * 2, capHeight);
            }

            // Add highlight line on the left side of pipe body
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(pipe.x + 5, pipe.y);
            ctx.lineTo(pipe.x + 5, pipe.y + pipe.height);
            ctx.stroke();
        });

        // Draw Score
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px Arial';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(`${this.data.score}`, this.width / 2 - 10, 50);

        // Draw High Score (smaller, top right)
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`BEST: ${this.data.highScore}`, this.width - 80, 30);
        ctx.shadowBlur = 0;

        if (this.data.gameOver) {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 40px Arial';
            ctx.shadowColor = "black";
            ctx.shadowBlur = 10;
            ctx.fillText("GAME OVER", this.width / 2 - 120, this.height / 2 - 20);

            // Show final score
            ctx.font = 'bold 24px Arial';
            ctx.fillText(`Score: ${this.data.score}`, this.width / 2 - 50, this.height / 2 + 20);

            // Show NEW BEST if achieved
            if (this.data.isNewHighScore) {
                ctx.fillStyle = '#FFD700';
                ctx.font = 'bold 20px Arial';
                ctx.fillText('NEW BEST!', this.width / 2 - 60, this.height / 2 + 50);
                ctx.fillStyle = 'white';
            }

            ctx.font = '18px Arial';
            ctx.fillText("Tap to Restart", this.width / 2 - 55, this.height / 2 + 85);
            ctx.shadowBlur = 0;
        }
    }
})
