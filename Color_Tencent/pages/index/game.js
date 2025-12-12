/**
 * Game Logic - With Falling Animation Physics
 */

const Audio = require('./audio');

const DIFFICULTY = {
    easy: { speedMultiplier: 0.85, tolerance: 0.6 },
    normal: { speedMultiplier: 1.15, tolerance: 0.4 },
    hard: { speedMultiplier: 1.5, tolerance: 0.3 }
};

class Game {
    constructor(renderer, onScoreChange, onGameOver, callbacks = {}) {
        this.renderer = renderer;
        this.onScoreChange = onScoreChange;
        this.onGameOver = onGameOver;
        this.onComboChange = callbacks.onComboChange || (() => { });

        this.stack = [];
        this.debris = [];
        this.currentBlock = null;

        this.score = 0;
        this.combo = 0;
        this.isPlaying = false;
        this.baseSize = 6;
        this.speed = 0.2;
        this.direction = 1;
        this.difficulty = 'normal';

        this.startTime = 0;
        this.endTime = 0;
        this.lastTime = 0;
        this.perfectEffect = null;
        this.floatingTexts = [];
    }

    setDifficulty(level) {
        this.difficulty = level;
    }

    start() {
        this.isPlaying = true;
        this.score = 0;
        this.combo = 0;
        this.stack = [];
        this.debris = [];
        this.speed = 0.18;
        this.perfectEffect = null;
        this.floatingTexts = [];
        this.startTime = Date.now();
        this.endTime = 0;

        Audio.init();

        this.stack.push({
            x: 0, y: 0, z: 0,
            w: this.baseSize, d: this.baseSize,
            color: this.renderer.generateColor(0)
        });

        this.spawnBlock();
        this.onScoreChange(0);
        this.onComboChange(0);
    }

    spawnBlock() {
        const prevBlock = this.stack[this.stack.length - 1];
        const newIndex = this.stack.length;

        this.currentBlock = {
            x: prevBlock.x,
            y: prevBlock.y,
            z: prevBlock.z + 1,
            w: prevBlock.w,
            d: prevBlock.d,
            color: this.renderer.generateColor(newIndex)
        };

        const distance = 12;
        if (newIndex % 2 === 1) {
            this.currentBlock.x = -distance;
            this.moveAxis = 'x';
        } else {
            this.currentBlock.y = -distance;
            this.moveAxis = 'y';
        }

        this.direction = 1;

        const diffSettings = DIFFICULTY[this.difficulty];
        const baseSpeed = 0.18 + (newIndex * 0.008);
        this.speed = Math.min(0.5, baseSpeed) * diffSettings.speedMultiplier;
    }

    tick(time) {
        if (!this.isPlaying) return;

        this.lastTime = time;

        if (this.currentBlock) {
            this.currentBlock[this.moveAxis] += this.speed * this.direction * 1.5;

            const limit = 13;
            if (this.currentBlock[this.moveAxis] > limit) {
                this.direction = -1;
            } else if (this.currentBlock[this.moveAxis] < -limit) {
                this.direction = 1;
            }
        }

        // Debris physics - realistic falling animation
        for (let i = this.debris.length - 1; i >= 0; i--) {
            const d = this.debris[i];

            // Gravity acceleration
            if (!d.velocityZ) d.velocityZ = 0;
            if (!d.velocityX) d.velocityX = (Math.random() - 0.5) * 0.15;
            if (!d.velocityY) d.velocityY = (Math.random() - 0.5) * 0.15;
            if (!d.rotationX) d.rotationX = 0;
            if (!d.rotationSpeed) d.rotationSpeed = (Math.random() - 0.5) * 0.08;

            // Apply gravity
            d.velocityZ -= 0.12; // Gravity

            // Apply velocities
            d.z += d.velocityZ;
            d.x += d.velocityX;
            d.y += d.velocityY;
            d.rotationX += d.rotationSpeed;

            // Remove when far below
            if (d.z < -40) {
                this.debris.splice(i, 1);
            }
        }

        // Fade effects
        if (this.perfectEffect) {
            this.perfectEffect.alpha -= 0.05;
            if (this.perfectEffect.alpha <= 0) {
                this.perfectEffect = null;
            }
        }

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.y -= 2;
            t.alpha -= 0.02;
            if (t.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    placeBlock() {
        if (!this.isPlaying || !this.currentBlock) return;

        const current = this.currentBlock;
        const prev = this.stack[this.stack.length - 1];
        const diffSettings = DIFFICULTY[this.difficulty];
        const TOLERANCE = diffSettings.tolerance;

        Audio.playTap();

        if (this.moveAxis === 'x') {
            const delta = current.x - prev.x;

            if (Math.abs(delta) < TOLERANCE) {
                this.handlePerfectPlacement(current, prev);
                return;
            }

            if (Math.abs(delta) >= prev.w) {
                this.gameOver();
                return;
            }

            const newW = prev.w - Math.abs(delta);
            let chopX, chopW, keepX;

            if (delta > 0) {
                keepX = prev.x + delta;
                chopX = keepX + newW;
                chopW = Math.abs(delta);
            } else {
                keepX = prev.x;
                chopX = current.x;
                chopW = Math.abs(delta);
            }

            current.x = keepX;
            current.w = newW;

            if (chopW > 0.01) {
                // Create debris with initial falling velocity
                this.debris.push({
                    x: chopX,
                    y: current.y,
                    z: current.z,
                    w: chopW,
                    d: current.d,
                    color: current.color,
                    velocityZ: 0.3, // Initial upward pop
                    velocityX: delta > 0 ? 0.15 : -0.15, // Fly away direction
                    velocityY: 0,
                    rotationX: 0,
                    rotationSpeed: (Math.random() - 0.5) * 0.1
                });
            }

            this.combo = 0;
            this.onComboChange(0);

        } else {
            const delta = current.y - prev.y;

            if (Math.abs(delta) < TOLERANCE) {
                this.handlePerfectPlacement(current, prev);
                return;
            }

            if (Math.abs(delta) >= prev.d) {
                this.gameOver();
                return;
            }

            const newD = prev.d - Math.abs(delta);
            let chopY, chopD, keepY;

            if (delta > 0) {
                keepY = prev.y + delta;
                chopY = keepY + newD;
                chopD = Math.abs(delta);
            } else {
                keepY = prev.y;
                chopY = current.y;
                chopD = Math.abs(delta);
            }

            current.y = keepY;
            current.d = newD;

            if (chopD > 0.01) {
                // Create debris with initial falling velocity
                this.debris.push({
                    x: current.x,
                    y: chopY,
                    z: current.z,
                    w: current.w,
                    d: chopD,
                    color: current.color,
                    velocityZ: 0.3, // Initial upward pop
                    velocityX: 0,
                    velocityY: delta > 0 ? 0.15 : -0.15, // Fly away direction
                    rotationX: 0,
                    rotationSpeed: (Math.random() - 0.5) * 0.1
                });
            }

            this.combo = 0;
            this.onComboChange(0);
        }

        this.stack.push(current);
        this.score++;
        this.onScoreChange(this.score);
        this.spawnBlock();
    }

    handlePerfectPlacement(current, prev) {
        current.x = prev.x;
        current.y = prev.y;
        current.w = prev.w;
        current.d = prev.d;

        this.combo++;
        this.onComboChange(this.combo);

        Audio.playPerfect();
        if (this.combo > 1) {
            Audio.playCombo(this.combo);
        }

        this.perfectEffect = {
            x: current.x,
            y: current.y,
            z: current.z,
            w: current.w,
            d: current.d,
            alpha: 1.0
        };

        if (this.combo >= 3) {
            this.addFloatingText(`${this.combo}x COMBO!`, '#FFD700');
        } else {
            this.addFloatingText('PERFECT!', '#FFFFFF');
        }

        this.renderer.addBurst(current.x + current.w / 2, current.y + current.d / 2, current.z);
        this.renderer.addShake(3);

        if (this.combo >= 3 && this.combo % 3 === 0) {
            const growAmount = 0.3;
            current.w = Math.min(this.baseSize, current.w + growAmount);
            current.d = Math.min(this.baseSize, current.d + growAmount);
            current.x -= growAmount / 2;
            current.y -= growAmount / 2;
            this.renderer.addShake(6);
        }

        this.stack.push(current);
        this.score++;
        this.onScoreChange(this.score);
        this.spawnBlock();
    }

    addFloatingText(text, color) {
        const block = this.currentBlock || this.stack[this.stack.length - 1];
        this.floatingTexts.push({
            text,
            color,
            x: block.x + block.w / 2,
            y: block.y + block.d / 2,
            z: block.z,
            alpha: 1.0
        });
    }

    gameOver() {
        this.isPlaying = false;
        this.endTime = Date.now();
        Audio.playGameOver();

        // Make the whole block fall with physics
        if (this.currentBlock) {
            this.debris.push({
                ...this.currentBlock,
                velocityZ: 0.2,
                velocityX: (Math.random() - 0.5) * 0.2,
                velocityY: (Math.random() - 0.5) * 0.2,
                rotationX: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.12
            });
        }
        this.currentBlock = null;
        this.onGameOver(this.score);
    }

    getPlayTime() {
        if (this.endTime > 0) {
            return Math.floor((this.endTime - this.startTime) / 1000);
        }
        return 0;
    }

    getFloatingTexts() {
        return this.floatingTexts;
    }
}

module.exports = Game;
