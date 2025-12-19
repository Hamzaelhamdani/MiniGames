const SoundManager = require('./SoundManager')

class GameEngine {
    constructor(canvas, ctx, width, height) {
        this.soundManager = new SoundManager()
        this.canvas = canvas
        this.ctx = ctx
        this.width = width
        this.height = height

        this.state = 'MENU'
        this.isRunning = false

        // Physics (GRADUAL DIFFICULTY - Starts easy, gets harder)
        this.GRAVITY = 1.0  // Gentler start
        this.JUMP_FORCE = -15  // Comfortable jump
        this.SPEED = 7  // Faster start speed (was 6)
        this.GROUND_Y = height - 80

        // PROFESSIONAL GEOMETRY DASH COLOR SCHEME
        this.biomes = {
            cyberNight: {
                gradientColors: ['#040810', '#0a1525', '#102540'], // Deep professional blue
                playerColor: '#00ffff',    // Cyan - classic GD color
                obstacleColor: '#00ffea',  // Bright Cyan blocks
                accentColor: '#00ffff'
            },
            nightSky: {
                gradientColors: ['#0a0a1a', '#0f1a2e', '#162040'],
                playerColor: '#00ffff',    // Keep cyan consistent
                obstacleColor: '#ff3366',  // Pink/red obstacles
                accentColor: '#4488ff'
            },
            sunset: {
                gradientColors: ['#200a10', '#401020', '#601830'], // Deep Red/Burgundy (No purple)
                playerColor: '#00ffff',    // Cyan player
                obstacleColor: '#ffaa00',  // Gold obstacles
                accentColor: '#ffaaff'
            },
            ocean: {
                gradientColors: ['#000a14', '#001428', '#002040'],
                playerColor: '#00ffff',    // Cyan player
                obstacleColor: '#00ff88',  // Teal obstacles
                accentColor: '#0088ff'
            },
            volcano: {
                gradientColors: ['#0a0000', '#1a0808', '#2d1010'],
                playerColor: '#00ffff',    // Cyan player  
                obstacleColor: '#ff2200',  // Red obstacles
                accentColor: '#ff4400'
            }
        }

        this.currentBiome = 'cyberNight'
        this.nextBiome = null
        this.fadeProgress = 0
        this.biomeList = ['cyberNight', 'nightSky', 'sunset', 'ocean', 'volcano']

        // PROFESSIONAL PARALLAX BACKGROUND SYSTEM
        // 3 layers with seamless tiling for infinite scroll
        this.parallaxLayers = {
            far: { offset: 0, speed: 0.1 },    // Slowest - distant mountains
            mid: { offset: 0, speed: 0.25 },   // Medium - mid mountains
            near: { offset: 0, speed: 0.5 }    // Fastest - near terrain
        }

        // Generate terrain points for each layer (seamless tiling)
        this.terrainPoints = {
            far: this.generateTerrain(20, 60, 120),   // Smooth distant mountains
            mid: this.generateTerrain(15, 100, 180),  // Taller mid mountains
            near: this.generateTerrain(25, 40, 100)   // Jagged near terrain
        }

        this.stars = []
        this.initStars()

        // Player Modes - CUBE ONLY (No flying!)
        this.playerModes = ['cube']  // Only cube mode
        this.currentMode = 'cube'
        this.modeTimer = 0
        this.enableModeSwitch = false  // Disable mode switching

        // Effects
        this.shake = 0
        this.glitch = 0
        this.zoom = 1.0
        this.hyperMode = false
        this.cameraY = 0
        this.targetCameraY = 0
        this.chromaticAberration = 0

        // Entities
        this.player = this.createPlayer()
        this.obstacles = []
        this.particles = []
        this.trails = []
        this.coins = []
        this.powerUps = []
        this.checkpoints = []
        this.backgroundShapes = []

        // Power-up states
        this.shield = { active: false, timer: 0 }
        this.speedBoost = { active: false, timer: 0 }
        this.slowMotion = { active: false, timer: 0 }

        // Game stats
        this.score = 0
        this.highScore = 0
        this.frameCount = 0
        this.coinsCollected = 0
        this.scoreMultiplier = 1.0
        this.lastCheckpoint = 0
        
        // COMBO SYSTEM
        this.combo = 0
        this.maxCombo = 0
        this.comboTimer = 0
        this.comboMultiplier = 1.0

        // Robot Face
        this.faceState = 'neutral'
        this.blinkTimer = 0
        this.nextBlink = 100

        this.deathMessages = [
            "GAME OVER", "TRY AGAIN", "SO CLOSE!",
            "ALMOST!", "NICE TRY", "KEEP GOING",
            "DON'T GIVE UP", "ONE MORE!", "YOU CAN DO IT"
        ]
        this.currentDeathMsg = ""

        this.initBackgroundShapes()
        this.loop = this.loop.bind(this)
    }

    initBackgroundShapes() {
        this.backgroundShapes = []
    }

    initStars() {
        // Simple subtle stars for background
        this.stars = []
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * (this.GROUND_Y - 50),
                size: 1 + Math.random() * 2,
                speed: 0.1 + Math.random() * 0.2,
                alpha: 0.3 + Math.random() * 0.5
            })
        }
    }

    generateTerrain(segments, minHeight, maxHeight) {
        // Generate seamlessly tileable TECH SKYLINE (City/Base style)
        // Instead of jagged rocks, we create buildings/structures
        const points = []
        let currentX = 0
        const totalWidth = this.width // One screen width
        
        // Ensure we start at ground level for seamless tiling
        points.push({ x: 0, y: 0 })

        while (currentX < totalWidth) {
            // Random building properties
            const buildingWidth = 30 + Math.random() * 50
            const buildingHeight = minHeight + Math.random() * (maxHeight - minHeight)
            const gap = 10 + Math.random() * 20

            // Don't exceed total width
            if (currentX + buildingWidth + gap > totalWidth) {
                // Fill the rest with a final building or gap
                const remaining = totalWidth - currentX
                if (remaining > 20) {
                    points.push({ x: currentX, y: 0 }) // Gap start
                    points.push({ x: currentX, y: buildingHeight }) // Wall up
                    points.push({ x: totalWidth, y: buildingHeight }) // Roof to end
                    points.push({ x: totalWidth, y: 0 }) // Wall down
                } else {
                    points.push({ x: totalWidth, y: 0 })
                }
                break
            }

            // Building Points (Step pattern)
            points.push({ x: currentX, y: 0 }) // Start at bottom
            points.push({ x: currentX, y: buildingHeight }) // Vertical Wall UP
            points.push({ x: currentX + buildingWidth, y: buildingHeight }) // Roof
            points.push({ x: currentX + buildingWidth, y: 0 }) // Vertical Wall DOWN
            
            currentX += buildingWidth + gap
        }

        return points
    }

    createPlayer() {
        return {
            x: 80,
            y: this.GROUND_Y,
            width: 40,
            height: 40,
            dy: 0,
            isGrounded: false,
            rotation: 0,
            waveOffset: 0,
            ballRotation: 0
        }
    }

    start() {
        if (this.isRunning) return
        this.isRunning = true
        this.canvas.requestAnimationFrame(this.loop)
    }

    // Safe biome getter with fallback
    getBiome() {
        return this.biomes[this.currentBiome] || this.biomes['nightSky'] || {
            gradientColors: ['#1a1a2e', '#16213e', '#0f3460'],
            playerColor: '#00d4ff',
            obstacleColor: '#ff3366',
            accentColor: '#00d4ff'
        }
    }

    stop() {
        this.isRunning = false
    }

    reset() {
        this.player = this.createPlayer()
        this.player.y = this.GROUND_Y - 40
        this.obstacles = []
        this.particles = []
        this.trails = []
        this.coins = []
        this.powerUps = []
        this.checkpoints = []
        this.score = 0
        this.frameCount = 0
        this.SPEED = 7  // Start faster
        this.GRAVITY = 1.0  // Reset gravity too
        this.state = 'PLAYING'
        this.hyperMode = false
        this.zoom = 1.0
        this.glitch = 0
        this.currentBiome = 'cyberNight'
        this.nextBiome = null
        this.fadeProgress = 0
        this.currentMode = 'cube'
        this.modeTimer = 0
        this.coinsCollected = 0
        this.scoreMultiplier = 1.0
        this.lastCheckpoint = 0
        this.shield = { active: false, timer: 0 }
        this.speedBoost = { active: false, timer: 0 }
        this.cameraY = 0
        this.targetCameraY = 0
        this.chromaticAberration = 0
    }

    handleInput(isPressed) {
        if (!isPressed) return
        if (this.state === 'MENU') {
            this.reset()
        } else if (this.state === 'PLAYING') {
            this.handleModeInput()
        } else if (this.state === 'GAMEOVER') {
            if (this.deathTimer > 30) this.reset()
        }
    }

    handleModeInput() {
        switch (this.currentMode) {
            case 'cube':
                if (this.player.isGrounded) {
                    this.player.dy = this.JUMP_FORCE
                    this.player.isGrounded = false
                    this.addMuzzleFlash()
                    this.shake = 4
                    this.faceState = 'jump'
                    this.soundManager.playJump()
                    
                    // Jump Dust Particles
                    for(let i=0; i<8; i++) {
                         this.particles.push({
                            x: this.player.x + this.player.width/2,
                            y: this.player.y + this.player.height,
                            vx: (Math.random() - 0.5) * 6,
                            vy: (Math.random() * 2),
                            life: 0.6,
                            color: '#ffffff',
                            size: Math.random() * 4 + 2
                        })
                    }
                }
                break
            case 'ship':
                this.player.dy = this.JUMP_FORCE * 0.6 // Constant upward thrust
                break
            case 'wave':
                this.player.waveOffset = this.player.waveOffset === 1 ? -1 : 1 // Toggle direction
                break
            case 'ball':
                if (this.player.isGrounded) {
                    this.player.dy = this.JUMP_FORCE * 0.8
                    this.player.isGrounded = false
                }
                break
        }
    }

    update() {
        this.hue = (this.frameCount * 0.5) % 360
        
        // Update Combo System
        this.updateCombo()

        // Dynamic Camera Zoom based on speed/action
        if (this.speedBoost.active) {
            this.zoom = 0.95 // Zoom out for speed
        } else if (this.slowMotion.active) {
            this.zoom = 1.05 // Zoom in for focus
        } else if (this.combo > 5) {
            // Slight zoom in on high combo
            this.zoom = 1.0 + Math.sin(this.frameCount * 0.1) * 0.02
        } else {
            // Return to normal
            this.zoom = this.zoom * 0.9 + 1.0 * 0.1
        }

        // Update face state
        if (this.state === 'PLAYING') {
            if (this.player.isGrounded && this.currentMode === 'cube') {
                this.faceState = 'neutral'
                this.blinkTimer++
                if (this.blinkTimer > this.nextBlink) {
                    this.faceState = 'blink'
                    if (this.blinkTimer > this.nextBlink + 10) {
                        this.blinkTimer = 0
                        this.nextBlink = 100 + Math.random() * 200
                    }
                }
            } else {
                this.faceState = 'jump'
            }
        } else if (this.state === 'GAMEOVER') {
            this.faceState = 'dead'
        }

        // Hyper mode at 100 points
        if (this.score >= 100 && !this.hyperMode) {
            this.hyperMode = true
            this.shake = 20
        }

        // Biome transitions based on score
        if (this.state === 'PLAYING') {
            let targetBiome = 'cyberNight'
            if (this.score >= 120) targetBiome = 'volcano'
            else if (this.score >= 80) targetBiome = 'ocean'
            else if (this.score >= 50) targetBiome = 'sunset'
            else if (this.score >= 25) targetBiome = 'nightSky'

            if (targetBiome !== this.currentBiome && !this.nextBiome) {
                this.nextBiome = targetBiome
                this.fadeProgress = 0
            }
        }

        // Fade progress for biome transitions
        if (this.nextBiome) {
            this.fadeProgress += 0.015
            if (this.fadeProgress >= 1.0) {
                this.currentBiome = this.nextBiome
                this.nextBiome = null
                this.fadeProgress = 0
            }
        }

        // Mode switching DISABLED - Cube only!
        // No mode switching for cleaner, more focused gameplay

        // Power-up timers
        if (this.shield.active) {
            this.shield.timer--
            if (this.shield.timer <= 0) this.shield.active = false
        }
        if (this.speedBoost.active) {
            this.speedBoost.timer--
            if (this.speedBoost.timer <= 0) this.speedBoost.active = false
        }
        if (this.slowMotion.active) {
            this.slowMotion.timer--
            if (this.slowMotion.timer <= 0) this.slowMotion.active = false
        }

        // Visual effects
        if (this.hyperMode) {
            this.zoom = 1.0 + Math.sin(this.frameCount * 0.05) * 0.02
            if (this.frameCount % 20 === 0) this.glitch = 5
            else this.glitch = 0
        } else {
            this.zoom = 1.0
            this.glitch = 0
        }

        if (this.shake > 0) this.shake *= 0.85
        if (this.chromaticAberration > 0) this.chromaticAberration *= 0.9

        // Camera smoothing
        this.cameraY += (this.targetCameraY - this.cameraY) * 0.1

        if (this.state === 'PLAYING') this.updateGame()
        else if (this.state === 'GAMEOVER') {
            this.updateParticles()
            this.deathTimer++
        }

        this.draw()
    }

    updateGame() {
        this.frameCount++

        // Progressive difficulty (GRADUAL - Gets harder step by step)
        // Speed increases every 600 frames (about 10 seconds)
        if (this.frameCount % 600 === 0 && this.SPEED < 14) {
            this.SPEED += 0.3
            // Also increase gravity gradually for more challenge
            if (this.GRAVITY < 1.5) this.GRAVITY += 0.05
        }

        // Update background shapes - DISABLED for clean look
        // No parallax shapes

        // Player physics based on mode
        switch (this.currentMode) {
            case 'cube':
                this.updateCubePhysics()
                break
            case 'ship':
                this.updateShipPhysics()
                break
            case 'wave':
                this.updateWavePhysics()
                break
            case 'ball':
                this.updateBallPhysics()
                break
        }

        // Trail effect
        if (this.frameCount % 2 === 0) {
            const biome = this.getBiome()
            this.trails.push({
                x: this.player.x,
                y: this.player.y,
                rotation: this.player.rotation,
                color: biome.playerColor,
                life: 8,
                mode: this.currentMode
            })
        }
        this.trails.forEach(t => t.life--)
        this.trails = this.trails.filter(t => t.life > 0)

        // Spawn obstacles (GRADUAL - Starts sparse, gets tighter)
        // Base rate starts high (easy) and decreases over time
        const difficultyFactor = Math.min(this.score / 100, 1) // 0 to 1 over 100 points
        const baseRate = 120 - difficultyFactor * 60 // 120 → 60 as you progress
        const spawnRate = this.slowMotion.active ? 150 : Math.max(50, Math.floor(baseRate))

        if (this.frameCount % spawnRate === 0 && this.frameCount > 60) {
            const lastObs = this.obstacles[this.obstacles.length - 1]
            // Spacing starts wide, gets tighter
            const minSpacing = 300 - difficultyFactor * 120 // 300 → 180 as you progress
            if (!lastObs || (this.width - lastObs.x > minSpacing)) {
                this.spawnObstacle()
            }
        }

        // Spawn coins
        if (this.frameCount % 120 === 0 && Math.random() > 0.4) {
            this.spawnCoin()
        }

        // Spawn power-ups
        if (this.frameCount % 300 === 0 && Math.random() > 0.7) {
            this.spawnPowerUp()
        }

        // Spawn checkpoints every 25 points
        const checkpointScore = Math.floor(this.score / 25) * 25
        if (checkpointScore > this.lastCheckpoint && checkpointScore > 0) {
            this.lastCheckpoint = checkpointScore
            this.spawnCheckpoint()
        }

        // Update obstacles
        this.obstacles.forEach(obs => {
            obs.x -= this.SPEED * (this.speedBoost.active ? 1.5 : 1) * (this.slowMotion.active ? 0.5 : 1)
            if (obs.x + obs.width < -100) obs.markedForDeletion = true

            // Falling Spike Logic
            if (obs.type === 'falling_spike') {
                if (obs.state === 'warning') {
                    obs.warningTimer--
                    // Play warning sound once
                    if (obs.warningTimer === 40) { // Just after spawn (starts at 45)
                        this.soundManager.playWarning()
                    }
                    if (obs.warningTimer <= 0) {
                        obs.state = 'falling'
                    }
                } else if (obs.state === 'falling') {
                    obs.fallSpeed += (obs.gravity || 0.5) // Gravity
                    if (obs.fallSpeed > obs.maxFallSpeed) obs.fallSpeed = obs.maxFallSpeed
                    obs.y += obs.fallSpeed
                    
                    // Stop when hitting ground
                    if (obs.y + obs.height >= this.GROUND_Y) {
                        obs.y = this.GROUND_Y - obs.height
                        obs.state = 'active' // Landed
                        // Landing effect
                        this.shake = 5
                        // Landing particles
                        const biome = this.getBiome()
                        for (let i = 0; i < 5; i++) {
                            this.particles.push({
                                x: obs.x + obs.width/2,
                                y: this.GROUND_Y,
                                vx: (Math.random() - 0.5) * 8,
                                vy: (Math.random() - 0.5) * 5,
                                life: 0.5,
                                color: biome.obstacleColor
                            })
                        }
                    }
                }
            }

            // Collision detection
            if (!this.shield.active) {
                // Jump Pad Logic (Safe Obstacle)
                if (obs.type === 'jump_pad') {
                    const padRect = {
                        x: obs.x, y: obs.y, width: obs.width, height: obs.height
                    }
                    if (this.player.x + 10 < padRect.x + padRect.width &&
                        this.player.x + this.player.width - 10 > padRect.x &&
                        this.player.y + this.player.height >= padRect.y) {
                            
                        // Activate Jump Pad
                        this.player.dy = this.JUMP_FORCE * 1.6
                        this.player.isGrounded = false
                        this.soundManager.playJump()
                        this.shake = 5
                        
                        // Visuals
                        for(let i=0; i<8; i++) {
                                this.particles.push({
                                x: obs.x + obs.width/2,
                                y: obs.y,
                                vx: (Math.random() - 0.5) * 10,
                                vy: (Math.random() - 1) * 10,
                                life: 0.8,
                                color: '#ffff00'
                            })
                        }
                        
                        this.particles.push({
                            x: this.player.x,
                            y: this.player.y - 60,
                            vx: 0,
                            vy: -1,
                            life: 1.0,
                            type: 'text',
                            text: "BOOST!",
                            color: '#ffff00',
                            size: 20
                        })
                    }
                    return // Skip death check
                }

                let collision = false
                const pPad = 8 // Player padding
                const playerRect = {
                    x: this.player.x + pPad,
                    y: this.player.y + pPad,
                    width: this.player.width - pPad * 2,
                    height: this.player.height - pPad * 2
                }

                if (obs.type === 'spike' || obs.type === 'falling_spike') {
                    // TRIANGLE COLLISION (Approximate)
                    // Check bounding box first
                    if (playerRect.x < obs.x + obs.width &&
                        playerRect.x + playerRect.width > obs.x &&
                        playerRect.y < obs.y + obs.height &&
                        playerRect.y + playerRect.height > obs.y) {
                            
                        // More precise check: Distance to spike center
                        if (obs.type === 'falling_spike' && obs.state === 'warning') {
                            collision = false // Safe during warning
                        } else {
                            // Simple distance check to center of spike
                            const spikeCenter = obs.x + obs.width / 2
                            const distX = Math.abs((playerRect.x + playerRect.width/2) - spikeCenter)
                            const distY = Math.abs((playerRect.y + playerRect.height/2) - (obs.y + obs.height/2))
                            
                            // Hitbox is slightly smaller than full triangle
                            if (distX < obs.width/2.5 && distY < obs.height/1.5) {
                                collision = true
                            }
                        }
                    }
                } else if (obs.type !== 'jump_pad' && obs.type !== 'floating_platform') {
                    // BLOCK COLLISION (Rectangle)
                    const oPad = 6
                    if (playerRect.x < obs.x + obs.width - oPad &&
                        playerRect.x + playerRect.width > obs.x + oPad &&
                        playerRect.y < obs.y + obs.height - oPad &&
                        playerRect.y + playerRect.height > obs.y + oPad) {
                        collision = true
                    }
                }

                if (collision) {
                    this.triggerDeath()
                }
            }
        })
        this.obstacles = this.obstacles.filter(obs => !obs.markedForDeletion)

        // Update coins
        this.coins.forEach(coin => {
            coin.x -= this.SPEED * (this.speedBoost.active ? 1.5 : 1)
            coin.rotation += 5
            if (coin.x + coin.size < -50) coin.markedForDeletion = true

            // Collection detection
            const dist = Math.hypot(
                this.player.x + this.player.width / 2 - (coin.x + coin.size / 2),
                this.player.y + this.player.height / 2 - (coin.y + coin.size / 2)
            )
            if (dist < 35) {
                coin.markedForDeletion = true
                this.collectCoin()
            }
        })
        this.coins = this.coins.filter(c => !c.markedForDeletion)

        // Update power-ups
        this.powerUps.forEach(pw => {
            pw.x -= this.SPEED * (this.speedBoost.active ? 1.5 : 1)
            pw.rotation += 3
            if (pw.x + pw.size < -50) pw.markedForDeletion = true

            // Collection detection
            const dist = Math.hypot(
                this.player.x + this.player.width / 2 - (pw.x + pw.size / 2),
                this.player.y + this.player.height / 2 - (pw.y + pw.size / 2)
            )
            if (dist < 40) {
                pw.markedForDeletion = true
                this.activatePowerUp(pw.type)
            }
        })
        this.powerUps = this.powerUps.filter(p => !p.markedForDeletion)

        // Update checkpoints
        this.checkpoints.forEach(cp => {
            cp.x -= this.SPEED
            if (cp.x < -50) cp.markedForDeletion = true
        })
        this.checkpoints = this.checkpoints.filter(c => !c.markedForDeletion)

        this.updateParticles()

        // Score calculation with multiplier
        this.score = Math.floor((this.frameCount / 5) * this.scoreMultiplier)
    }

    updateCubePhysics() {
        this.player.dy += this.GRAVITY
        this.player.y += this.player.dy

        let grounded = false

        // Check Ground
        if (this.player.y > this.GROUND_Y - this.player.height) {
            this.player.y = this.GROUND_Y - this.player.height
            this.player.dy = 0
            grounded = true
        }

        // Check Floating Platforms
        if (!grounded && this.player.dy >= 0) {
            this.obstacles.forEach(obs => {
                if (obs.type === 'floating_platform') {
                    // Horizontal overlap check
                    if (this.player.x + this.player.width > obs.x &&
                        this.player.x < obs.x + obs.width) {
                        
                        const feetY = this.player.y + this.player.height
                        // Check if feet are near the top of the platform
                        // Allow a bit of tolerance for high speeds
                        if (feetY >= obs.y && feetY <= obs.y + this.player.dy + 10) {
                            this.player.y = obs.y - this.player.height
                            this.player.dy = 0
                            grounded = true
                        }
                    }
                }
            })
        }

        this.player.isGrounded = grounded

        if (grounded) {
            const nearest90 = Math.round(this.player.rotation / 90) * 90
            this.player.rotation += (nearest90 - this.player.rotation) * 0.25
        } else {
            this.player.rotation += 7
        }
    }

    updateShipPhysics() {
        // Ship mode: free flight with gravity
        this.player.dy += this.GRAVITY * 0.5
        this.player.y += this.player.dy

        // Clamp to screen
        if (this.player.y < 50) {
            this.player.y = 50
            this.player.dy = 0
        }
        if (this.player.y > this.GROUND_Y - this.player.height) {
            this.player.y = this.GROUND_Y - this.player.height
            this.player.dy = 0
        }

        // Rotate based on velocity
        this.player.rotation = this.player.dy * 2
    }

    updateWavePhysics() {
        // Wave mode: serpentine movement
        this.player.y += this.player.waveOffset * 4

        // Bounce off boundaries
        if (this.player.y < 50) {
            this.player.y = 50
            this.player.waveOffset = 1
        }
        if (this.player.y > this.GROUND_Y - this.player.height) {
            this.player.y = this.GROUND_Y - this.player.height
            this.player.waveOffset = -1
        }

        this.player.rotation = Math.sin(this.frameCount * 0.2) * 20
    }

    updateBallPhysics() {
        // Ball mode: rolling physics
        this.player.dy += this.GRAVITY
        this.player.y += this.player.dy

        if (this.player.y > this.GROUND_Y - this.player.height) {
            this.player.y = this.GROUND_Y - this.player.height
            this.player.dy = 0
            this.player.isGrounded = true
        } else {
            this.player.isGrounded = false
        }

        // Continuous rotation
        this.player.ballRotation += this.SPEED * 2
    }

    spawnFloatingPlatform() {
        // Spawn a floating platform
        // Height: ~60-90px above ground (reachable by jump)
        const platformHeight = 90
        const platformWidth = 120 // Slightly wider for easier landing
        
        // 1. Create the floating platform
        this.obstacles.push({
            x: this.width,
            y: this.GROUND_Y - platformHeight,
            width: platformWidth,
            height: 20,
            type: 'floating_platform',
            markedForDeletion: false
        })

        // 2. STRATEGY: Add a hazard underneath to FORCE the player up
        // Only do this 70% of the time so sometimes it's just a free path
        if (Math.random() < 0.7) {
            this.obstacles.push({
                x: this.width + 20, // Centered under platform
                y: this.GROUND_Y - 40,
                width: 80, // Slightly narrower than platform
                height: 40,
                type: 'spike', // Deadly spike below!
                markedForDeletion: false
            })
        }

        // 3. REWARD: Add a coin on top
        this.coins.push({
            x: this.width + platformWidth / 2 - 12,
            y: this.GROUND_Y - platformHeight - 40,
            size: 25,
            rotation: 0,
            markedForDeletion: false
        })
    }

    spawnObstacle() {
        // GRID-BASED PATTERN SYSTEM
        
        const patternType = Math.random()
        const score = this.score
        
        // Define difficulty tiers
        const isEasy = score < 20
        const isMedium = score >= 20 && score < 50
        const isHard = score >= 50

        // FALLING SPIKES (Only in Medium/Hard, ensuring fairness)
        // Check if there's enough space for a falling spike to be fair
        if ((isMedium || isHard) && Math.random() < 0.25) {
            this.spawnFallingSpike()
            return
        }

        if (isHard && patternType > 0.8) {
            this.spawnTripleSpike()
        } else if (isMedium && patternType > 0.7) {
            this.spawnDoubleSpike()
        } else if (isMedium && patternType > 0.5) {
            if (Math.random() > 0.6) this.spawnJumpPad()
            else if (Math.random() > 0.5) this.spawnFloatingPlatform()
            else this.spawnPlatform()
        } else if (patternType > 0.3) {
            // Chance to spawn floating platform in other cases too
            if (Math.random() > 0.7) this.spawnFloatingPlatform()
            else this.spawnMediumBlock()
        } else if (patternType > 0.15) {
            this.spawnSingleSpike()
        } else {
            // Even in simple blocks, add a chance for floating platform
            if (Math.random() > 0.8) this.spawnFloatingPlatform()
            else this.spawnSmallBlock()
        }
    }

    spawnFallingSpike() {
        // Falling spike from ceiling with warning
        // Calculate physics to land exactly in front of player
        const spikeHeight = 50
        const startY = 50
        const fallDistance = this.GROUND_Y - startY - spikeHeight
        
        // Snappier gravity for better feel
        const gravity = 1.0 
        const warningTime = 45 
        
        // Calculate fall time: t = sqrt(2d/g)
        const fallTime = Math.sqrt((2 * fallDistance) / gravity)
        
        // Total time until landing (warning + fall)
        const totalTime = warningTime + fallTime
        
        // Calculate where to spawn so it lands in front of player
        // Distance traveled by world (player is static X)
        const travelDist = totalTime * this.SPEED
        
        // Target: Land 250px in front of player (visible reaction zone)
        const landingX = this.player.x + 250
        const spawnX = landingX + travelDist
        
        this.obstacles.push({
            x: spawnX,
            y: startY, 
            width: 40,
            height: spikeHeight,
            type: 'falling_spike',
            state: 'warning', 
            warningTimer: warningTime,
            fallSpeed: 0,
            maxFallSpeed: 15,
            gravity: gravity,
            markedForDeletion: false
        })
    }

    spawnJumpPad() {
        this.obstacles.push({
            x: this.width,
            y: this.GROUND_Y - 10,
            width: 40,
            height: 10,
            type: 'jump_pad',
            markedForDeletion: false
        })
    }

    spawnSingleSpike() {
        this.obstacles.push({
            x: this.width,
            y: this.GROUND_Y - 40,
            width: 40,
            height: 40,
            type: 'spike',
            markedForDeletion: false
        })
    }

    spawnDoubleSpike() {
        this.obstacles.push({
            x: this.width,
            y: this.GROUND_Y - 40,
            width: 80,
            height: 40,
            type: 'spike',
            markedForDeletion: false
        })
    }

    spawnTripleSpike() {
        this.obstacles.push({
            x: this.width,
            y: this.GROUND_Y - 40,
            width: 120,
            height: 40,
            type: 'spike',
            markedForDeletion: false
        })
    }

    spawnLargeBlock() {
        // Replaces Triple Spikes -> Single large rectangular block
        // Width 120 (3 units), Height 40
        this.obstacles.push({
            x: this.width,
            y: this.GROUND_Y - 40,
            width: 120,
            height: 40,
            type: 'block',
            markedForDeletion: false
        })
    }

    spawnPillar() {
        // Fixed height (2 blocks high)
        this.obstacles.push({
            x: this.width,
            y: this.GROUND_Y - 80,
            width: 40,
            height: 80,
            type: 'block',
            markedForDeletion: false
        })
    }

    spawnPlatform() {
        // Fixed width (3 blocks long)
        this.obstacles.push({
            x: this.width,
            y: this.GROUND_Y - 40,
            width: 120, // Exactly 3 blocks
            height: 40,
            type: 'block',
            markedForDeletion: false
        })
    }

    spawnMediumBlock() {
        // Replaces Double Spikes -> Single medium rectangular block
        // Width 80 (2 units), Height 40
        this.obstacles.push({
            x: this.width,
            y: this.GROUND_Y - 40,
            width: 80,
            height: 40,
            type: 'block',
            markedForDeletion: false
        })
    }

    spawnSmallBlock() {
        // Replaces Single Spike -> Single small rectangular block
        // Width 40 (1 unit), Height 40
        this.obstacles.push({
            x: this.width,
            y: this.GROUND_Y - 40,
            width: 40,
            height: 40,
            type: 'block',
            markedForDeletion: false
        })
    }

    spawnStaircase() {
        // Removed: replaced by pattern logic
    }

    spawnCoin() {
        // Prevent overlapping with obstacles
        // Check if the last obstacle is too close to the spawn point (right edge)
        const lastObs = this.obstacles[this.obstacles.length - 1]
        if (lastObs && (lastObs.x + lastObs.width > this.width - 100)) return

        // Spawn within jump height (max ~112px) so player can always reach it
        this.coins.push({
            x: this.width,
            y: this.GROUND_Y - 40 - Math.random() * 60, // 40-100px above ground
            size: 25,
            rotation: 0,
            markedForDeletion: false
        })
    }

    spawnPowerUp() {
        // Prevent overlapping with obstacles
        // Check if the last obstacle is too close to the spawn point (right edge)
        const lastObs = this.obstacles[this.obstacles.length - 1]
        if (lastObs && (lastObs.x + lastObs.width > this.width - 100)) return

        // ONLY SHIELD (Removed speedBoost/energy icon)
        const type = 'shield'

        // Spawn within jump height
        this.powerUps.push({
            x: this.width,
            y: this.GROUND_Y - 40 - Math.random() * 60, // 40-100px above ground
            size: 30,
            type: type,
            rotation: 0,
            markedForDeletion: false
        })
    }

    spawnCheckpoint() {
        this.checkpoints.push({
            x: this.width,
            y: 0,
            width: 5,
            height: this.height,
            markedForDeletion: false
        })
    }

    collectCoin() {
        this.coinsCollected++
        
        // COMBO: Add combo on coin collect
        this.addCombo(1)
        
        // Use combo multiplier for score
        this.scoreMultiplier = 1.0 + (this.coinsCollected * 0.1) + (this.comboMultiplier - 1.0)
        
        this.shake = 2
        this.soundManager.playCoin()

        // Coin particles
        const biome = this.getBiome()
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color: '#ffaa00'
            })
        }
        
        // Floating Text
        this.particles.push({
            x: this.player.x,
            y: this.player.y - 40,
            vx: 0,
            vy: -1,
            life: 1.0,
            type: 'text',
            text: "+100",
            color: '#ffaa00',
            size: 20
        })
    }

    activatePowerUp(type) {
        this.shake = 8
        this.soundManager.playCoin()
        switch (type) {
            case 'shield':
                this.shield.active = true
                this.shield.timer = 300 // 5 seconds at 60fps
                break
            case 'speedBoost':
                this.speedBoost.active = true
                this.speedBoost.timer = 180 // 3 seconds
                break
        }

        // Power-up particles
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 1.2,
                color: type === 'shield' ? '#00ffff' : type === 'speedBoost' ? '#ffff00' : '#ff00ff'
            })
        }
    }

    updateParticles() {
        this.particles.forEach(p => {
            p.x += p.vx
            p.y += p.vy
            p.life -= 0.04
            p.vy += 0.25
            
            // Combo text specific physics
            if (p.type === 'text') {
                p.y -= 1 // Float up
                p.vy = 0 // No gravity
                p.life -= 0.01 // Last longer
            }
        })
        this.particles = this.particles.filter(p => p.life > 0)
    }

    addCombo(count = 1) {
        this.combo += count
        if (this.combo > this.maxCombo) this.maxCombo = this.combo
        
        // Reset combo timer
        this.comboTimer = 180 // 3 seconds to keep combo
        
        // Update multiplier
        this.comboMultiplier = 1.0 + Math.min(this.combo * 0.1, 4.0) // Max 5x multiplier
        
        // Visual feedback
        if (this.combo > 1) {
            this.particles.push({
                x: this.player.x,
                y: this.player.y - 40,
                vx: 0,
                vy: -1,
                life: 1.0,
                type: 'text',
                text: `${this.combo}x COMBO!`,
                color: '#ffff00',
                size: 20 + Math.min(this.combo, 20)
            })
            
            // Camera zoom punch
            this.zoom = 1.05
            setTimeout(() => this.zoom = 1.0, 100)
        }
    }

    updateCombo() {
        if (this.combo > 0) {
            this.comboTimer--
            if (this.comboTimer <= 0) {
                // Combo Lost Effect
                if (this.combo > 5) {
                    this.particles.push({
                        x: this.player.x,
                        y: this.player.y - 40,
                        vx: 0,
                        vy: -0.5,
                        life: 1.5,
                        type: 'text',
                        text: "COMBO LOST",
                        color: '#ff0000',
                        size: 20
                    })
                }
                
                this.combo = 0
                this.comboMultiplier = 1.0
            }
        }
    }

    addMuzzleFlash() {
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height,
                vx: (Math.random() - 0.5) * 12,
                vy: Math.random() * -4,
                life: 1.0,
                color: '#fff'
            })
        }
    }

    triggerDeath() {
        this.state = 'GAMEOVER'
        this.player.isDead = true
        this.deathTimer = 0
        this.shake = 35
        this.chromaticAberration = 10
        this.soundManager.playDeath()

        const biome = this.getBiome()

        // Massive explosion
        for (let i = 0; i < 80; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                vx: (Math.random() - 0.5) * 25,
                vy: (Math.random() - 0.5) * 25,
                life: 1.0 + Math.random() * 0.5,
                color: i % 3 === 0 ? biome.playerColor : i % 3 === 1 ? biome.obstacleColor : biome.accentColor
            })
        }

        this.currentDeathMsg = this.deathMessages[Math.floor(Math.random() * this.deathMessages.length)]
        if (this.score > this.highScore) {
            this.highScore = this.score
        }
    }

    draw() {
        this.ctx.save()

        // Apply zoom
        if (this.zoom !== 1.0) {
            this.ctx.translate(this.width / 2, this.height / 2)
            this.ctx.scale(this.zoom, this.zoom)
            this.ctx.translate(-this.width / 2, -this.height / 2)
        }

        // Apply shake and glitch
        if (this.shake > 0.5 || this.glitch > 0) {
            let dx = (Math.random() - 0.5) * (this.shake + this.glitch)
            let dy = (Math.random() - 0.5) * (this.shake + this.glitch)
            this.ctx.translate(dx, dy)
        }

        // Apply camera Y offset
        this.ctx.translate(0, -this.cameraY)

        // Draw current biome gradient
        this.ctx.globalAlpha = 1.0
        this.drawGradientBackground(this.currentBiome)

        // Draw next biome (fade in)
        if (this.nextBiome) {
            this.ctx.globalAlpha = this.fadeProgress
            this.drawGradientBackground(this.nextBiome)
            this.ctx.globalAlpha = 1.0
        }

        // Draw background shapes (parallax)
        this.drawBackgroundShapes()

        // Ground gradient
        const grad = this.ctx.createLinearGradient(0, this.GROUND_Y - 50, 0, this.GROUND_Y)
        grad.addColorStop(0, 'rgba(10,10,16,0)')
        grad.addColorStop(1, '#050505') // Darker tech black
        this.ctx.fillStyle = grad
        this.ctx.fillRect(0, this.GROUND_Y - 50, this.width, 50)

        // TECH GRID FLOOR
        // Base floor
        this.ctx.fillStyle = '#020205'
        this.ctx.fillRect(0, this.GROUND_Y, this.width, this.height - this.GROUND_Y)

        // Grid Lines
        this.ctx.save()
        this.ctx.beginPath()
        // Clip to floor area
        this.ctx.rect(0, this.GROUND_Y, this.width, this.height - this.GROUND_Y)
        this.ctx.clip()

        const biome = this.getBiome()
        this.ctx.strokeStyle = biome.playerColor || '#00ffff'
        this.ctx.globalAlpha = 0.3
        this.ctx.lineWidth = 2

        // 1. Perspective Horizontal Lines (getting closer to horizon)
        // y positions relative to bottom
        const floorH = this.height - this.GROUND_Y
        const horizon = this.GROUND_Y
        
        // Draw lines at increasing densities
        const vLines = [0.1, 0.25, 0.45, 0.7, 1.0] // percentages of floor height from horizon
        
        vLines.forEach(p => {
            const y = horizon + (p * floorH)
            this.ctx.beginPath()
            this.ctx.moveTo(0, y)
            this.ctx.lineTo(this.width, y)
            this.ctx.stroke()
        })

        // 2. Scrolling Vertical Lines
        const gridSize = 60
        // Calculate offset based on distance traveled (score/speed)
        // We use a running offset
        const scrollOffset = (this.frameCount * this.SPEED) % gridSize
        
        for (let x = -scrollOffset; x < this.width; x += gridSize) {
            // Draw vertical line
            this.ctx.beginPath()
            this.ctx.moveTo(x, horizon)
            this.ctx.lineTo(x - 40, this.height) // Slight slant for speed effect
            this.ctx.stroke()
        }
        
        this.ctx.restore()

        // Neon horizon line (Main ground line)
        this.ctx.strokeStyle = biome.playerColor || '#00ffff'
        this.ctx.lineWidth = 3
        this.ctx.shadowBlur = 15
        this.ctx.shadowColor = biome.playerColor || '#00ffff'
        this.ctx.beginPath()
        this.ctx.moveTo(0, this.GROUND_Y)
        this.ctx.lineTo(this.width, this.GROUND_Y)
        this.ctx.stroke()

        this.drawCheckpoints()
        this.drawObstacles()
        this.drawCoins()
        this.drawPowerUps()

        if (this.state !== 'GAMEOVER') {
            this.ctx.shadowBlur = 0

            // Draw trails
            this.trails.forEach(t => {
                this.ctx.save()
                this.ctx.translate(t.x + 20, t.y + 20)
                this.ctx.rotate(t.rotation * Math.PI / 180)
                this.ctx.globalAlpha = t.life * 0.08
                this.ctx.fillStyle = t.color
                this.ctx.fillRect(-20, -20, 40, 40)
                this.ctx.restore()
            })

            // Draw player based on mode
            this.ctx.globalAlpha = 1
            this.drawPlayer()
        }

        // Draw particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life
            this.ctx.fillStyle = p.color
            
            if (p.type === 'text') {
                this.ctx.shadowBlur = 0
                this.ctx.font = `bold ${p.size || 20}px Arial`
                this.ctx.textAlign = 'center'
                this.ctx.fillText(p.text, p.x, p.y)
            } else {
                this.ctx.shadowBlur = 5
                this.ctx.shadowColor = p.color
                this.ctx.fillRect(p.x, p.y, 5, 5)
            }
        })

        this.ctx.translate(0, this.cameraY) // Reset camera translation for UI

        this.drawPostProcessing()
        this.ctx.globalAlpha = 1.0
        this.ctx.shadowBlur = 0
        this.drawUI()
        this.ctx.restore()
    }

    drawGradientBackground(biomeName) {
        const biome = this.biomes[biomeName] || this.biomes['nightSky']
        if (!biome) return

        const grad = this.ctx.createLinearGradient(0, 0, 0, this.height)

        grad.addColorStop(0, biome.gradientColors[0])
        grad.addColorStop(0.5, biome.gradientColors[1])
        grad.addColorStop(1, biome.gradientColors[2])

        this.ctx.fillStyle = grad
        this.ctx.fillRect(0, 0, this.width, this.height)
    }

    drawBackgroundShapes() {
        // PROFESSIONAL PARALLAX LAYERS with seamless tiling
        this.updateParallaxOffsets()
        this.drawParallaxLayers()
        this.drawStars()
    }

    updateParallaxOffsets() {
        // Update offset for seamless scrolling
        if (!this.parallaxLayers) return

        this.parallaxLayers.far.offset += this.SPEED * this.parallaxLayers.far.speed
        this.parallaxLayers.mid.offset += this.SPEED * this.parallaxLayers.mid.speed
        this.parallaxLayers.near.offset += this.SPEED * this.parallaxLayers.near.speed

        // Reset offset when it exceeds width (seamless tiling)
        if (this.parallaxLayers.far.offset >= this.width) this.parallaxLayers.far.offset = 0
        if (this.parallaxLayers.mid.offset >= this.width) this.parallaxLayers.mid.offset = 0
        if (this.parallaxLayers.near.offset >= this.width) this.parallaxLayers.near.offset = 0
    }

    drawParallaxLayers() {
        if (!this.terrainPoints) return

        const biome = this.getBiome()

        // Get biome base color and create darker variants for layers
        const baseColor = biome.gradientColors[2] // Darkest gradient color
        const farColor = this.darkenColor(baseColor, 60)
        const midColor = this.darkenColor(baseColor, 45)
        const nearColor = this.darkenColor(baseColor, 30)

        // Layer 1: FAR (slowest, most transparent)
        this.drawTerrainLayer(
            this.terrainPoints.far,
            this.parallaxLayers.far.offset,
            this.GROUND_Y - 80,
            farColor,
            0.4
        )

        // Layer 2: MID (medium speed, medium transparency)
        this.drawTerrainLayer(
            this.terrainPoints.mid,
            this.parallaxLayers.mid.offset,
            this.GROUND_Y - 40,
            midColor,
            0.6
        )

        // Layer 3: NEAR (fastest, most opaque)
        this.drawTerrainLayer(
            this.terrainPoints.near,
            this.parallaxLayers.near.offset,
            this.GROUND_Y,
            nearColor,
            0.9
        )
    }

    drawTerrainLayer(points, offset, baseY, color, alpha) {
        if (!points || points.length === 0) return

        this.ctx.globalAlpha = alpha
        this.ctx.fillStyle = color

        // Draw terrain twice for seamless tiling
        for (let tile = 0; tile < 2; tile++) {
            const tileOffset = -offset + tile * this.width

            this.ctx.beginPath()
            this.ctx.moveTo(tileOffset, baseY)

            // Draw terrain curve
            for (let i = 0; i < points.length; i++) {
                const x = tileOffset + points[i].x
                const y = baseY - points[i].y

                if (i === 0) {
                    this.ctx.lineTo(x, y)
                } else {
                    // Sharp straight lines for geometric look
                    this.ctx.lineTo(x, y)
                }
            }

            // Close the path
            this.ctx.lineTo(tileOffset + this.width, baseY)
            this.ctx.lineTo(tileOffset, baseY)
            this.ctx.closePath()
            this.ctx.fill()
        }

        this.ctx.globalAlpha = 1
    }

    drawStars() {
        if (!this.stars || this.stars.length === 0) return

        const biome = this.getBiome()

        this.stars.forEach(star => {
            // Update position
            star.x -= this.SPEED * star.speed
            if (star.x < -10) {
                star.x = this.width + 10
                star.y = Math.random() * (this.GROUND_Y - 50)
            }

            // Draw star
            this.ctx.beginPath()
            this.ctx.fillStyle = biome.accentColor || '#ffffff'
            this.ctx.globalAlpha = star.alpha * 0.5
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
            this.ctx.fill()
        })

        this.ctx.globalAlpha = 1
    }

    drawPlayer() {
        const biome = this.getBiome()

        this.ctx.save()
        this.ctx.translate(this.player.x + 20, this.player.y + 20)

        switch (this.currentMode) {
            case 'cube':
                this.ctx.rotate(this.player.rotation * Math.PI / 180)
                this.drawCubePlayer(biome)
                break
            case 'ship':
                this.ctx.rotate(this.player.rotation * Math.PI / 180)
                this.drawShipPlayer(biome)
                break
            case 'wave':
                this.ctx.rotate(this.player.rotation * Math.PI / 180)
                this.drawWavePlayer(biome)
                break
            case 'ball':
                this.ctx.rotate(this.player.ballRotation * Math.PI / 180)
                this.drawBallPlayer(biome)
                break
        }

        this.ctx.restore()

        // Shield effect
        if (this.shield.active) {
            this.ctx.save()
            this.ctx.translate(this.player.x + 20, this.player.y + 20)
            this.ctx.strokeStyle = biome.playerColor
            this.ctx.lineWidth = 3
            this.ctx.shadowBlur = 15
            this.ctx.shadowColor = biome.playerColor
            this.ctx.globalAlpha = 0.5 + Math.sin(this.frameCount * 0.2) * 0.3
            this.ctx.beginPath()
            this.ctx.arc(0, 0, 35, 0, Math.PI * 2)
            this.ctx.stroke()
            this.ctx.restore()
        }
    }

    drawCubePlayer(biome) {
        // Outer glow
        this.ctx.fillStyle = biome.playerColor
        this.ctx.shadowBlur = 20
        this.ctx.shadowColor = biome.playerColor
        this.ctx.fillRect(-20, -20, 40, 40)

        // Inner dark square
        this.ctx.fillStyle = '#111'
        this.ctx.shadowBlur = 0
        this.ctx.fillRect(-15, -15, 30, 30)

        // Face
        this.ctx.fillStyle = biome.playerColor
        if (this.faceState === 'blink') {
            this.ctx.fillRect(-10, -2, 20, 4)
        } else if (this.faceState === 'jump') {
            this.ctx.fillRect(-10, -6, 8, 8)
            this.ctx.fillRect(2, -6, 8, 8)
            this.ctx.fillRect(-5, 5, 10, 5)
        } else {
            this.ctx.fillRect(-10, -4, 8, 8)
            this.ctx.fillRect(2, -4, 8, 8)
            this.ctx.fillRect(-6, 6, 12, 2)
        }
    }

    drawShipPlayer(biome) {
        // Ship body (triangle)
        this.ctx.fillStyle = biome.playerColor
        this.ctx.shadowBlur = 20
        this.ctx.shadowColor = biome.playerColor
        this.ctx.beginPath()
        this.ctx.moveTo(20, 0)
        this.ctx.lineTo(-15, -15)
        this.ctx.lineTo(-15, 15)
        this.ctx.closePath()
        this.ctx.fill()

        // Inner detail
        this.ctx.fillStyle = '#111'
        this.ctx.shadowBlur = 0
        this.ctx.beginPath()
        this.ctx.moveTo(10, 0)
        this.ctx.lineTo(-8, -8)
        this.ctx.lineTo(-8, 8)
        this.ctx.closePath()
        this.ctx.fill()

        // Thruster flame
        if (this.frameCount % 4 < 2) {
            this.ctx.fillStyle = '#ff6600'
            this.ctx.shadowBlur = 10
            this.ctx.shadowColor = '#ff6600'
            this.ctx.beginPath()
            this.ctx.moveTo(-15, -5)
            this.ctx.lineTo(-25, 0)
            this.ctx.lineTo(-15, 5)
            this.ctx.fill()
        }
    }

    drawWavePlayer(biome) {
        // Wave shape (diamond)
        this.ctx.fillStyle = biome.playerColor
        this.ctx.shadowBlur = 20
        this.ctx.shadowColor = biome.playerColor
        this.ctx.beginPath()
        this.ctx.moveTo(15, 0)
        this.ctx.lineTo(0, -15)
        this.ctx.lineTo(-15, 0)
        this.ctx.lineTo(0, 15)
        this.ctx.closePath()
        this.ctx.fill()

        // Inner detail
        this.ctx.fillStyle = '#111'
        this.ctx.shadowBlur = 0
        this.ctx.beginPath()
        this.ctx.moveTo(8, 0)
        this.ctx.lineTo(0, -8)
        this.ctx.lineTo(-8, 0)
        this.ctx.lineTo(0, 8)
        this.ctx.closePath()
        this.ctx.fill()
    }

    drawBallPlayer(biome) {
        // Ball (circle)
        this.ctx.fillStyle = biome.playerColor
        this.ctx.shadowBlur = 20
        this.ctx.shadowColor = biome.playerColor
        this.ctx.beginPath()
        this.ctx.arc(0, 0, 20, 0, Math.PI * 2)
        this.ctx.fill()

        // Inner circle
        this.ctx.fillStyle = '#111'
        this.ctx.shadowBlur = 0
        this.ctx.beginPath()
        this.ctx.arc(0, 0, 15, 0, Math.PI * 2)
        this.ctx.fill()

        // Stripes
        this.ctx.strokeStyle = biome.playerColor
        this.ctx.lineWidth = 3
        this.ctx.beginPath()
        this.ctx.moveTo(-15, 0)
        this.ctx.lineTo(15, 0)
        this.ctx.stroke()
    }

    drawObstacles() {
        const biome = this.getBiome()
        const pulseGlow = 10 + Math.sin(this.frameCount * 0.2) * 5

        this.obstacles.forEach(obs => {
            const color = biome.obstacleColor
            
            // PRO VECTOR STYLE - High Contrast, Clean Lines
            this.ctx.save()
            this.ctx.shadowBlur = pulseGlow
            this.ctx.shadowColor = color
            
            if (obs.type === 'falling_spike') {
                // FALLING SPIKE RENDERING
                const warningColor = '#ff0000'
                
                if (obs.state === 'warning') {
                    // Warning Indicator
                    const flash = Math.floor(this.frameCount / 5) % 2 === 0
                    if (flash) {
                        this.ctx.globalAlpha = 0.7
                        this.ctx.fillStyle = warningColor
                        
                        // Ceiling indicator
                        this.ctx.beginPath()
                        this.ctx.arc(obs.x + obs.width/2, 30, 10, 0, Math.PI * 2)
                        this.ctx.fill()
                        
                        // Ground indicator
                        this.ctx.fillRect(obs.x, this.GROUND_Y - 5, obs.width, 5)
                        
                        this.ctx.font = "bold 20px Arial"
                        this.ctx.textAlign = "center"
                        this.ctx.fillStyle = "#ffffff"
                        this.ctx.fillText("!", obs.x + obs.width/2, 35)
                        
                        this.ctx.globalAlpha = 1.0
                    }
                } else {
                    // Falling/Active Spike
                    this.ctx.fillStyle = color
                    this.ctx.strokeStyle = '#050505'
                    this.ctx.lineWidth = 2
                    
                    // Draw spike pointing DOWN
                    this.ctx.beginPath()
                    this.ctx.moveTo(obs.x, obs.y)
                    this.ctx.lineTo(obs.x + obs.width, obs.y)
                    this.ctx.lineTo(obs.x + obs.width/2, obs.y + obs.height)
                    this.ctx.closePath()
                    this.ctx.fill()
                    this.ctx.stroke()
                    
                    // Trail effect
                    if (obs.state === 'falling') {
                        this.ctx.globalAlpha = 0.3
                        this.ctx.fillStyle = color
                        this.ctx.beginPath()
                        this.ctx.moveTo(obs.x, obs.y - obs.fallSpeed * 2)
                        this.ctx.lineTo(obs.x + obs.width, obs.y - obs.fallSpeed * 2)
                        this.ctx.lineTo(obs.x + obs.width/2, obs.y + obs.height - obs.fallSpeed * 2)
                        this.ctx.fill()
                        this.ctx.globalAlpha = 1.0
                    }
                }
            } else if (obs.type === 'floating_platform') {
                // Floating Platform Rendering
                this.ctx.fillStyle = biome.obstacleColor
                this.ctx.shadowBlur = 15
                this.ctx.shadowColor = biome.obstacleColor
                
                // Main body
                this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height)
                
                // Top Highlight (Safety indicator)
                this.ctx.fillStyle = '#ffffff'
                this.ctx.shadowBlur = 5
                this.ctx.fillRect(obs.x, obs.y, obs.width, 4)
                
                // Bottom detail (tech lines)
                this.ctx.fillStyle = biome.accentColor
                this.ctx.fillRect(obs.x + 10, obs.y + 12, obs.width - 20, 4)
            } else if (obs.type === 'spike') {
                // SPIKE RENDERING
                this.ctx.fillStyle = color
                this.ctx.strokeStyle = '#050505'
                this.ctx.lineWidth = 2
                
                const spikeWidth = 40
                const spikeCount = obs.width / spikeWidth
                
                for (let i = 0; i < spikeCount; i++) {
                    const spikeX = obs.x + i * spikeWidth
                    this.ctx.beginPath()
                    this.ctx.moveTo(spikeX + spikeWidth/2, obs.y)
                    this.ctx.lineTo(spikeX, obs.y + obs.height)
                    this.ctx.lineTo(spikeX + spikeWidth, obs.y + obs.height)
                    this.ctx.closePath()
                    this.ctx.fill()
                    this.ctx.stroke()
                    
                    this.ctx.fillStyle = '#ffffff'
                    this.ctx.globalAlpha = 0.3
                    this.ctx.beginPath()
                    this.ctx.moveTo(spikeX + spikeWidth/2 - 5, obs.y + 5)
                    this.ctx.lineTo(spikeX + 10, obs.y + obs.height - 5)
                    this.ctx.lineTo(spikeX + spikeWidth/2, obs.y + 5)
                    this.ctx.closePath()
                    this.ctx.fill()
                    this.ctx.globalAlpha = 1.0
                    this.ctx.fillStyle = color
                }
            } else if (obs.type === 'jump_pad') {
                // JUMP PAD RENDERING
                this.ctx.fillStyle = '#ffff00' // Yellow
                this.ctx.shadowBlur = 15
                this.ctx.shadowColor = '#ffff00'
                
                // Base
                this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height)
                
                // Pulsing energy rings
                this.ctx.strokeStyle = '#ffffff'
                this.ctx.lineWidth = 2
                this.ctx.beginPath()
                const pulse = Math.sin(this.frameCount * 0.5) * 5
                // Draw arc slightly above
                this.ctx.arc(obs.x + obs.width/2, obs.y, 10 + pulse, Math.PI, 0)
                this.ctx.stroke()
                
                // Up Arrows
                this.ctx.fillStyle = '#000000'
                this.ctx.beginPath()
                this.ctx.moveTo(obs.x + obs.width/2, obs.y + 2)
                this.ctx.lineTo(obs.x + obs.width/2 - 5, obs.y + 8)
                this.ctx.lineTo(obs.x + obs.width/2 + 5, obs.y + 8)
                this.ctx.fill()
            } else {
                // BLOCK RENDERING
                this.ctx.fillStyle = '#050505'
                this.ctx.strokeStyle = color
                this.ctx.lineWidth = 2.5

                this.ctx.beginPath()
                this.ctx.rect(obs.x, obs.y, obs.width, obs.height)
                this.ctx.fill()
                this.ctx.stroke()

                this.ctx.beginPath()
                const cornerSize = 8
                this.ctx.moveTo(obs.x, obs.y + cornerSize)
                this.ctx.lineTo(obs.x + cornerSize, obs.y + cornerSize)
                this.ctx.lineTo(obs.x + cornerSize, obs.y)
                this.ctx.moveTo(obs.x + obs.width, obs.y + obs.height - cornerSize)
                this.ctx.lineTo(obs.x + obs.width - cornerSize, obs.y + obs.height - cornerSize)
                this.ctx.lineTo(obs.x + obs.width - cornerSize, obs.y + obs.height)
                
                this.ctx.fillStyle = color
                this.ctx.fill()
                
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
                this.ctx.fillRect(obs.x + 10, obs.y + 10, obs.width - 20, obs.height - 20)
                
                this.ctx.fillStyle = '#ffffff'
                this.ctx.shadowColor = '#ffffff'
                this.ctx.fillRect(obs.x + obs.width/2 - 2, obs.y + obs.height/2 - 2, 4, 4)
            }
            
            this.ctx.restore()
        })

        this.ctx.shadowBlur = 0
    }

    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16)
        const amt = Math.round(2.55 * percent)
        const R = Math.min((num >> 16) + amt, 255)
        const G = Math.min((num >> 8 & 0x00FF) + amt, 255)
        const B = Math.min((num & 0x0000FF) + amt, 255)
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
    }

    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16)
        const amt = Math.round(2.55 * percent)
        const R = Math.max((num >> 16) - amt, 0)
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0)
        const B = Math.max((num & 0x0000FF) - amt, 0)
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
    }

    drawCoins() {
        this.ctx.shadowBlur = 15

        this.coins.forEach(coin => {
            this.ctx.save()
            this.ctx.translate(coin.x + coin.size / 2, coin.y + coin.size / 2)
            this.ctx.rotate(coin.rotation * Math.PI / 180)

            this.ctx.fillStyle = '#ffaa00'
            this.ctx.shadowColor = '#ffaa00'
            this.ctx.beginPath()
            this.ctx.arc(0, 0, coin.size / 2, 0, Math.PI * 2)
            this.ctx.fill()

            this.ctx.fillStyle = '#ff6600'
            this.ctx.shadowBlur = 0
            this.ctx.beginPath()
            this.ctx.arc(0, 0, coin.size / 3, 0, Math.PI * 2)
            this.ctx.fill()

            this.ctx.restore()
        })

        this.ctx.shadowBlur = 0
    }

    drawPowerUps() {
        this.ctx.shadowBlur = 15

        this.powerUps.forEach(pw => {
            this.ctx.save()
            this.ctx.translate(pw.x + pw.size / 2, pw.y + pw.size / 2)
            this.ctx.rotate(pw.rotation * Math.PI / 180)

            let color = '#ffffff'
            if (pw.type === 'shield') color = '#00ffff'
            else if (pw.type === 'speedBoost') color = '#ffff00'

            this.ctx.strokeStyle = color
            this.ctx.lineWidth = 3
            this.ctx.shadowColor = color
            this.ctx.fillStyle = 'rgba(0,0,0,0.5)'

            this.ctx.beginPath()
            this.ctx.arc(0, 0, pw.size / 2, 0, Math.PI * 2)
            this.ctx.fill()
            this.ctx.stroke()

            // Icon based on type
            this.ctx.shadowBlur = 0
            this.ctx.fillStyle = color
            if (pw.type === 'shield') {
                // Shield icon
                this.ctx.beginPath()
                this.ctx.moveTo(0, -10)
                this.ctx.lineTo(8, -5)
                this.ctx.lineTo(8, 5)
                this.ctx.lineTo(0, 10)
                this.ctx.lineTo(-8, 5)
                this.ctx.lineTo(-8, -5)
                this.ctx.closePath()
                this.ctx.fill()
            } else if (pw.type === 'speedBoost') {
                // Lightning bolt
                this.ctx.beginPath()
                this.ctx.moveTo(-3, -10)
                this.ctx.lineTo(5, 0)
                this.ctx.lineTo(0, 0)
                this.ctx.lineTo(3, 10)
                this.ctx.lineTo(-5, 0)
                this.ctx.lineTo(0, 0)
                this.ctx.closePath()
                this.ctx.fill()
            } else {
                // Clock icon
                this.ctx.beginPath()
                this.ctx.arc(0, 0, 7, 0, Math.PI * 2)
                this.ctx.stroke()
                this.ctx.fillRect(-1, -5, 2, 5)
                this.ctx.fillRect(-1, -1, 4, 2)
            }

            this.ctx.restore()
        })

        this.ctx.shadowBlur = 0
    }

    drawCheckpoints() {
        // Checkpoints are now invisible - no green lines!
        // They still work for gameplay, just not visually intrusive
    }

    drawPostProcessing() {
        // Vignette + pulse
        const pulse = (Math.sin(this.frameCount * 0.1) + 1) * 0.5
        const grad = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, this.height * 0.4,
            this.width / 2, this.height / 2, this.height
        )
        grad.addColorStop(0, 'rgba(0,0,0,0)')
        grad.addColorStop(1, `rgba(0, 0, 0, ${0.3 + pulse * 0.3})`)
        this.ctx.fillStyle = grad
        this.ctx.fillRect(0, 0, this.width, this.height)

        // Speed Lines (Anime style)
        if (this.SPEED > 9 || this.speedBoost.active) {
            this.ctx.save()
            this.ctx.strokeStyle = '#ffffff'
            this.ctx.lineWidth = 2
            this.ctx.globalAlpha = this.speedBoost.active ? 0.5 : 0.2
            
            const count = this.speedBoost.active ? 8 : 4
            for(let i=0; i<count; i++) {
                 // Lines moving left
                 const speed = this.SPEED * 3
                 const offset = (this.frameCount * speed + i * 200) % (this.width + 200)
                 const x = this.width + 100 - offset
                 const y = (i * (this.height / count)) + (Math.sin(this.frameCount * 0.1) * 20)
                 const len = 100 + (i * 20)
                 
                 this.ctx.beginPath()
                 this.ctx.moveTo(x, y)
                 this.ctx.lineTo(x - len, y)
                 this.ctx.stroke()
            }
            this.ctx.restore()
        }

        // Scanlines
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
        for (let i = 0; i < this.height; i += 4) {
            this.ctx.fillRect(0, i, this.width, 1)
        }

        // Chromatic aberration on death
        if (this.chromaticAberration > 0.5) {
            this.ctx.fillStyle = `rgba(255, 0, 0, ${this.chromaticAberration * 0.05})`
            this.ctx.fillRect(-this.chromaticAberration, 0, this.width, this.height)
            this.ctx.fillStyle = `rgba(0, 255, 255, ${this.chromaticAberration * 0.05})`
            this.ctx.fillRect(this.chromaticAberration, 0, this.width, this.height)
        }
    }

    getResponsiveFont(percent) {
        const size = Math.floor(this.width * (percent / 100))
        return `${size}px "Segoe UI", sans-serif` // Use modern font
    }

    drawUI() {
        const biome = this.getBiome()
        this.ctx.textAlign = 'center'

        if (this.state === 'MENU') {
            this.ctx.save()
            if (Math.random() > 0.95) this.ctx.translate((Math.random() - 0.5) * 5, 0)
            this.drawMenu(biome)
        } else if (this.state === 'PLAYING') {
            this.drawPlayingUI(biome)
        } else if (this.state === 'GAMEOVER') {
            this.drawGameOver(biome)
        }
    }

    drawMenu(biome) {
        // Dark overlay
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)'
        this.ctx.fillRect(0, 0, this.width, this.height)

        const cx = this.width / 2
        const cy = this.height / 2

        // Title
        this.ctx.save()
        this.ctx.textAlign = 'center'
        // Reduced size (was 12) for better fit on small screens
        this.ctx.font = `900 ${this.getResponsiveFont(9).split(' ')[0]} sans-serif`

        // Neon Glow effect
        this.ctx.shadowBlur = 20 + Math.sin(this.frameCount * 0.1) * 10
        this.ctx.shadowColor = '#00ffff'
        this.ctx.fillStyle = '#fff'
        this.ctx.fillText("DASH", cx, cy - this.height * 0.15)

        this.ctx.shadowColor = '#0088ff' // Blue instead of purple
        this.ctx.fillText("GEOMETRIQUE", cx, cy - this.height * 0.05)
        this.ctx.restore()

        // Start Button
        const pulse = 1 + Math.sin(this.frameCount * 0.1) * 0.05
        this.ctx.save()
        this.ctx.translate(cx, cy + this.height * 0.15)
        this.ctx.scale(pulse, pulse)

        this.ctx.font = `bold ${this.getResponsiveFont(6).split(' ')[0]} sans-serif`
        this.ctx.fillStyle = '#ffffff'
        this.ctx.shadowColor = '#00ff44'
        this.ctx.shadowBlur = 15
        this.ctx.fillText("TAP TO START", 0, 0)
        this.ctx.restore()

        // High score
        if (this.highScore > 0) {
            this.ctx.font = `bold ${this.getResponsiveFont(4).split(' ')[0]} sans-serif`
            this.ctx.fillStyle = biome.accentColor
            this.ctx.shadowBlur = 0
            this.ctx.fillText(`BEST: ${this.highScore}`, cx, cy + this.height * 0.25)
        }

        this.ctx.shadowBlur = 0
    }

    drawPlayingUI(biome) {
        const cx = this.width / 2

        // Score (Large & Transparent)
        this.ctx.textAlign = 'center'
        this.ctx.font = `italic 900 ${this.getResponsiveFont(10).split(' ')[0]} sans-serif`
        this.ctx.fillStyle = 'rgba(255,255,255,0.3)'
        this.ctx.fillText(this.score, cx, this.height * 0.2)

        // Mode Indicator
        this.ctx.font = `bold ${this.getResponsiveFont(3).split(' ')[0]} sans-serif`
        this.ctx.fillStyle = biome.playerColor
        this.ctx.shadowBlur = 10
        this.ctx.shadowColor = biome.playerColor
        this.ctx.fillText(`MODE: ${this.currentMode.toUpperCase()}`, cx, this.height * 0.08)

        // Multiplier
        if (this.scoreMultiplier > 1.0) {
            this.ctx.font = `bold ${this.getResponsiveFont(3.5).split(' ')[0]} sans-serif`
            this.ctx.fillStyle = '#ffaa00'
            this.ctx.shadowColor = '#ffaa00'
            this.ctx.fillText(`x${this.scoreMultiplier.toFixed(1)}`, cx, this.height * 0.28)
        }

        // Left-aligned Powerups
        this.ctx.textAlign = 'left'
        this.ctx.font = `bold ${this.getResponsiveFont(2.5).split(' ')[0]} sans-serif`
        let yOffset = this.height * 0.08
        const xOffset = this.width * 0.03

        if (this.shield.active) {
            this.ctx.fillStyle = '#00ffff'
            this.ctx.shadowColor = '#00ffff'
            this.ctx.fillText(`SHIELD: ${Math.ceil(this.shield.timer / 60)}`, xOffset, yOffset)
            yOffset += this.height * 0.05
        }
        if (this.speedBoost.active) {
            this.ctx.fillStyle = '#ffff00'
            this.ctx.shadowColor = '#ffff00'
            this.ctx.fillText(`SPEED: ${Math.ceil(this.speedBoost.timer / 60)}`, xOffset, yOffset)
            yOffset += this.height * 0.05
        }

        // Coins
        this.ctx.fillStyle = '#ffaa00'
        this.ctx.shadowColor = '#ffaa00'
        this.ctx.fillText(`🪙 ${this.coinsCollected}`, xOffset, yOffset)

        this.ctx.textAlign = 'center'
        this.ctx.shadowBlur = 0

        // Hyper Mode Warning
        if (this.hyperMode) {
            this.ctx.font = `bold ${this.getResponsiveFont(4).split(' ')[0]} sans-serif`
            this.ctx.fillStyle = '#ff0000'
            this.ctx.shadowBlur = 15
            this.ctx.shadowColor = '#ff0000'
            this.ctx.fillText("⚡ HYPER MODE ⚡", cx, this.height - 30)
        }
    }

    drawGameOver(biome) {
        const cx = this.width / 2
        const cy = this.height / 2

        // Dark Overlay
        this.ctx.fillStyle = 'rgba(0,0,0,0.85)'
        this.ctx.fillRect(0, 0, this.width, this.height)

        // "CRASHED" Text with Glitch offset
        this.ctx.save()
        this.ctx.textAlign = 'center'
        const fontSize = this.getResponsiveFont(12).split(' ')[0]
        this.ctx.font = `900 ${fontSize} sans-serif`

        // Red offset
        this.ctx.fillStyle = 'rgba(255,0,0,0.5)'
        this.ctx.fillText("CRASHED", cx - 4, cy - this.height * 0.15)

        // Cyan offset
        this.ctx.fillStyle = 'rgba(0,255,255,0.5)'
        this.ctx.fillText("CRASHED", cx + 4, cy - this.height * 0.15)

        // Main white text
        this.ctx.fillStyle = '#ffffff'
        this.ctx.shadowColor = '#ff0000'
        this.ctx.shadowBlur = 30
        this.ctx.fillText("CRASHED", cx, cy - this.height * 0.15)
        this.ctx.restore()

        // Death Message
        this.ctx.font = `bold ${this.getResponsiveFont(4).split(' ')[0]} sans-serif`
        this.ctx.fillStyle = biome.obstacleColor
        this.ctx.shadowBlur = 10
        this.ctx.fillText(this.currentDeathMsg, cx, cy)

        // Final Score
        this.ctx.fillStyle = '#fff'
        this.ctx.shadowBlur = 0
        this.ctx.font = `bold ${this.getResponsiveFont(6).split(' ')[0]} sans-serif`
        this.ctx.fillText(`SCORE: ${this.score}`, cx, cy + this.height * 0.1)

        // High Score Notification
        if (this.score > this.highScore - 1) {
            const pulse = 1 + Math.sin(this.frameCount * 0.2) * 0.1
            this.ctx.save()
            this.ctx.translate(cx, cy + this.height * 0.2)
            this.ctx.scale(pulse, pulse)
            this.ctx.fillStyle = '#ffff00'
            this.ctx.shadowColor = '#ffff00'
            this.ctx.shadowBlur = 20
            this.ctx.font = `bold ${this.getResponsiveFont(4).split(' ')[0]} sans-serif`
            this.ctx.fillText("🏆 NEW RECORD! 🏆", 0, 0)
            this.ctx.restore()
        }

        // Retry Prompt
        this.ctx.font = `${this.getResponsiveFont(3.5).split(' ')[0]} sans-serif`
        this.ctx.fillStyle = 'rgba(255,255,255,0.6)'
        this.ctx.fillText("Tap to Retry", cx, cy + this.height * 0.3)
    }

    loop() {
        if (!this.isRunning) return
        this.update()
        this.canvas.requestAnimationFrame(this.loop)
    }
}

module.exports = GameEngine
