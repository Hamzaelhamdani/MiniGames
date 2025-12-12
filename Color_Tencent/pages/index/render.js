/**
 * Render Engine - With Rotating Falling Debris
 */

const { getTheme, generateBlockColor } = require('./themes');

class Renderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;

    this.zoom = 1.0;
    this.baseZoom = 1.0;
    this.targetZoom = 1.0;
    this.cameraY = 0;
    this.shake = { x: 0, y: 0 };

    this.BLOCK_HEIGHT = 12;
    this.particles = [];
    this.burstParticles = [];

    this.theme = 'default';
    this.fontScale = 1.0;
    this.uiScale = 1.0;

    // Space starfield layers
    this.stars = [];
    this.starTime = 0;

    this.initStars();
  }

  setTheme(themeName) {
    this.theme = themeName;
  }

  initStars() {
    this.stars = [];

    // Background stars (small, slow, dim)
    const bgCount = Math.min(80, Math.floor(this.width * this.height / 8000));
    for (let i = 0; i < bgCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        r: Math.random() * 0.8 + 0.3,
        baseAlpha: Math.random() * 0.3 + 0.1,
        alpha: 0,
        speed: Math.random() * 0.15 + 0.05,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        layer: 'bg'
      });
    }

    // Mid-layer stars (medium, moderate speed)
    const midCount = Math.min(50, Math.floor(this.width * this.height / 14000));
    for (let i = 0; i < midCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        r: Math.random() * 1.2 + 0.5,
        baseAlpha: Math.random() * 0.4 + 0.2,
        alpha: 0,
        speed: Math.random() * 0.25 + 0.1,
        twinkleSpeed: Math.random() * 0.05 + 0.02,
        twinklePhase: Math.random() * Math.PI * 2,
        layer: 'mid'
      });
    }

    // Foreground stars (larger, faster, brighter)
    const fgCount = Math.min(25, Math.floor(this.width * this.height / 25000));
    for (let i = 0; i < fgCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        r: Math.random() * 1.8 + 0.8,
        baseAlpha: Math.random() * 0.5 + 0.4,
        alpha: 0,
        speed: Math.random() * 0.4 + 0.2,
        twinkleSpeed: Math.random() * 0.08 + 0.03,
        twinklePhase: Math.random() * Math.PI * 2,
        layer: 'fg',
        // Add subtle color variation for some foreground stars
        color: Math.random() > 0.7 ? this.getStarColor() : null
      });
    }

    // Shooting stars (rare, fast streaks)
    this.shootingStars = [];
    this.lastShootingStar = 0;
  }

  getStarColor() {
    const colors = [
      { r: 255, g: 220, b: 180 }, // Warm white
      { r: 200, g: 220, b: 255 }, // Cool blue
      { r: 255, g: 200, b: 200 }, // Soft red
      { r: 220, g: 255, b: 220 }, // Soft green
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  spawnShootingStar() {
    if (this.shootingStars.length >= 2) return;

    const startX = Math.random() * this.width * 0.7;
    const startY = Math.random() * this.height * 0.4;
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;

    this.shootingStars.push({
      x: startX,
      y: startY,
      length: 40 + Math.random() * 60,
      speed: 8 + Math.random() * 6,
      angle: angle,
      alpha: 0.9,
      trail: []
    });
  }

  updateDimensions(width, height) {
    this.width = width;
    this.height = height;

    this.baseZoom = Math.min(width / 380, height / 720) * 1.05;
    this.zoom = this.baseZoom;
    this.targetZoom = this.baseZoom;

    this.fontScale = Math.min(1.3, Math.max(0.75, width / 375));
    this.uiScale = Math.min(1.2, Math.max(0.8, Math.min(width / 375, height / 667)));

    this.initStars();
  }

  project(x, y, z) {
    const isoX = (x - y) * 25 * this.zoom + this.width / 2 + this.shake.x;
    const isoY = (x + y) * 15 * this.zoom - (z * 12 * this.zoom) + this.height / 1.6 + this.cameraY + this.shake.y;
    return { x: isoX, y: isoY };
  }

  drawBackground(score) {
    const t = getTheme(this.theme);
    const hueShift = (score * 1.5) % 40;

    // Draw gradient background
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, t.background.top(hueShift));
    grad.addColorStop(0.5, t.background.mid(hueShift));
    grad.addColorStop(1, t.background.bottom(hueShift));

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    const ctx = this.ctx;
    this.starTime += 0.016; // Approx 60fps timing

    // Randomly spawn shooting stars (rare)
    if (Math.random() < 0.002 && this.shootingStars.length < 2) {
      this.spawnShootingStar();
    }

    // Draw and animate all stars
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];

      // Slow downward drift (parallax)
      star.y += star.speed;

      // Twinkling effect using sine wave
      star.twinklePhase += star.twinkleSpeed;
      const twinkleFactor = 0.5 + 0.5 * Math.sin(star.twinklePhase);
      star.alpha = star.baseAlpha * (0.4 + 0.6 * twinkleFactor);

      // Wrap around when going off screen
      if (star.y > this.height + 5) {
        star.y = -5;
        star.x = Math.random() * this.width;
      }

      // Draw the star
      if (star.color) {
        // Colored star (for some foreground stars)
        ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.alpha})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();

      // Add glow effect for brighter/larger stars
      if (star.layer === 'fg' && star.alpha > 0.5) {
        ctx.beginPath();
        const glowGrad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 3);
        if (star.color) {
          glowGrad.addColorStop(0, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.alpha * 0.3})`);
        } else {
          glowGrad.addColorStop(0, `rgba(255, 255, 255, ${star.alpha * 0.3})`);
        }
        glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glowGrad;
        ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw and animate shooting stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];

      // Move shooting star
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.alpha -= 0.015;

      // Draw the shooting star with gradient trail
      const tailX = ss.x - Math.cos(ss.angle) * ss.length;
      const tailY = ss.y - Math.sin(ss.angle) * ss.length;

      const ssGrad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
      ssGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      ssGrad.addColorStop(0.7, `rgba(255, 255, 255, ${ss.alpha * 0.5})`);
      ssGrad.addColorStop(1, `rgba(255, 255, 255, ${ss.alpha})`);

      ctx.strokeStyle = ssGrad;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(ss.x, ss.y);
      ctx.stroke();

      // Bright head
      ctx.fillStyle = `rgba(255, 255, 255, ${ss.alpha})`;
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Remove if faded or off screen
      if (ss.alpha <= 0 || ss.x > this.width + 100 || ss.y > this.height + 100) {
        this.shootingStars.splice(i, 1);
      }
    }

    // Keep burst particles for perfect placement effects
    for (let i = this.burstParticles.length - 1; i >= 0; i--) {
      const p = this.burstParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.5;
      p.alpha -= 0.025;

      if (p.alpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        this.burstParticles.splice(i, 1);
      }
    }
  }

  generateColor(index) {
    return generateBlockColor(this.theme, index);
  }

  // Regular solid block
  drawBlock(x, y, z, w, d, colorData) {
    const p1 = this.project(x, y, z);
    const p2 = this.project(x + w, y, z);
    const p3 = this.project(x + w, y + d, z);
    const p4 = this.project(x, y + d, z);

    const h = this.BLOCK_HEIGHT * this.zoom;
    const ctx = this.ctx;

    let hue, sat, light;
    if (typeof colorData === 'object' && colorData.h !== undefined) {
      hue = colorData.h;
      sat = colorData.s;
      light = colorData.l;
    } else {
      hue = 40;
      sat = 85;
      light = 55;
    }

    // Front face
    ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light - 25}%)`;
    ctx.beginPath();
    ctx.moveTo(p4.x, p4.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p3.x, p3.y + h);
    ctx.lineTo(p4.x, p4.y + h);
    ctx.closePath();
    ctx.fill();

    // Left face
    const leftGrad = ctx.createLinearGradient(p1.x, p1.y, p4.x, p4.y + h);
    leftGrad.addColorStop(0, `hsl(${hue}, ${sat}%, ${light - 16}%)`);
    leftGrad.addColorStop(1, `hsl(${hue}, ${sat}%, ${light - 26}%)`);

    ctx.fillStyle = leftGrad;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.lineTo(p4.x, p4.y + h);
    ctx.lineTo(p1.x, p1.y + h);
    ctx.closePath();
    ctx.fill();

    // Right face
    const rightGrad = ctx.createLinearGradient(p2.x, p2.y, p3.x, p3.y + h);
    rightGrad.addColorStop(0, `hsl(${hue}, ${sat}%, ${light - 6}%)`);
    rightGrad.addColorStop(1, `hsl(${hue}, ${sat}%, ${light - 16}%)`);

    ctx.fillStyle = rightGrad;
    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p3.x, p3.y + h);
    ctx.lineTo(p2.x, p2.y + h);
    ctx.closePath();
    ctx.fill();

    // Top face
    const topGrad = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
    topGrad.addColorStop(0, `hsl(${hue}, ${sat}%, ${light + 6}%)`);
    topGrad.addColorStop(0.5, `hsl(${hue}, ${sat}%, ${light}%)`);
    topGrad.addColorStop(1, `hsl(${hue}, ${sat}%, ${light - 4}%)`);

    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fill();

    // Highlight
    const centerX = (p1.x + p2.x + p3.x + p4.x) / 4;
    const centerY = (p1.y + p2.y + p3.y + p4.y) / 4;
    const highlightGrad = ctx.createRadialGradient(
      centerX - 4, centerY - 4, 0,
      centerX, centerY, Math.max(w, d) * 10 * this.zoom
    );
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    highlightGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.04)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = highlightGrad;
    ctx.fill();

    ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light + 15}%, 0.2)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // Falling debris with rotation effect
  drawFallingDebris(obj) {
    const { x, y, z, w, d, color, rotationX } = obj;

    // Apply rotation offset to create tumbling effect
    const rotOffset = rotationX || 0;
    const tiltAmount = Math.sin(rotOffset) * 0.5;

    // Adjust z based on rotation for tumbling effect
    const adjustedZ = z + tiltAmount;

    const p1 = this.project(x, y, adjustedZ);
    const p2 = this.project(x + w, y, adjustedZ);
    const p3 = this.project(x + w, y + d, adjustedZ);
    const p4 = this.project(x, y + d, adjustedZ);

    // Shrink height based on rotation for perspective effect
    const h = this.BLOCK_HEIGHT * this.zoom * (0.8 + Math.abs(Math.cos(rotOffset)) * 0.2);
    const ctx = this.ctx;

    let hue, sat, light;
    if (typeof color === 'object' && color.h !== undefined) {
      hue = color.h;
      sat = color.s;
      light = color.l;
    } else {
      hue = 40;
      sat = 85;
      light = 55;
    }

    // Add fade based on how far fallen
    const alpha = Math.max(0, Math.min(1, (z + 30) / 30));

    ctx.globalAlpha = alpha;

    // Front face
    ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light - 25}%)`;
    ctx.beginPath();
    ctx.moveTo(p4.x, p4.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p3.x, p3.y + h);
    ctx.lineTo(p4.x, p4.y + h);
    ctx.closePath();
    ctx.fill();

    // Left face
    ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light - 20}%)`;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.lineTo(p4.x, p4.y + h);
    ctx.lineTo(p1.x, p1.y + h);
    ctx.closePath();
    ctx.fill();

    // Right face
    ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light - 10}%)`;
    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p3.x, p3.y + h);
    ctx.lineTo(p2.x, p2.y + h);
    ctx.closePath();
    ctx.fill();

    // Top face
    ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  render(world) {
    const stackLen = world.stack.length;
    const score = stackLen - 1;
    this.drawBackground(score > 0 ? score : 0);

    this.shake.x *= 0.85;
    this.shake.y *= 0.85;

    if (stackLen > 15) {
      this.targetZoom = this.baseZoom * Math.max(0.7, 1 - (stackLen - 15) * 0.01);
    } else {
      this.targetZoom = this.baseZoom;
    }
    this.zoom += (this.targetZoom - this.zoom) * 0.05;

    let targetY = (stackLen * 12 * this.zoom);
    if (stackLen > 3) {
      this.cameraY += (targetY - 100 * this.zoom - this.cameraY) * 0.08;
    } else {
      this.cameraY += (0 - this.cameraY) * 0.1;
    }

    // Draw pillar
    if (stackLen > 0) {
      const base = world.stack[0];
      this.drawPillar(base.x, base.y, base.z, base.w, base.d, base.color);
    }

    // Draw stacked blocks
    for (let i = 0; i < world.stack.length; i++) {
      const obj = world.stack[i];
      this.drawBlock(obj.x, obj.y, obj.z, obj.w, obj.d, obj.color);
    }

    // Draw current moving block
    if (world.currentBlock) {
      this.drawBlock(
        world.currentBlock.x,
        world.currentBlock.y,
        world.currentBlock.z,
        world.currentBlock.w,
        world.currentBlock.d,
        world.currentBlock.color
      );
    }

    // Draw falling debris with rotation
    for (let i = 0; i < world.debris.length; i++) {
      this.drawFallingDebris(world.debris[i]);
    }

    if (world.perfectEffect) {
      const eff = world.perfectEffect;
      const p1 = this.project(eff.x, eff.y, eff.z);
      const p2 = this.project(eff.x + eff.w, eff.y, eff.z);
      const p3 = this.project(eff.x + eff.w, eff.y + eff.d, eff.z);
      const p4 = this.project(eff.x, eff.y + eff.d, eff.z);

      this.ctx.strokeStyle = `rgba(255, 255, 255, ${eff.alpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.lineTo(p3.x, p3.y);
      this.ctx.lineTo(p4.x, p4.y);
      this.ctx.closePath();
      this.ctx.stroke();
    }

    if (world.floatingTexts) {
      const ctx = this.ctx;
      for (let i = 0; i < world.floatingTexts.length; i++) {
        const t = world.floatingTexts[i];
        const pos = this.project(t.x, t.y, t.z + 2);
        ctx.font = `bold ${16 * this.uiScale}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 255, 255, ${t.alpha})`;
        ctx.fillText(t.text, pos.x, pos.y - 18);
      }
    }

    this.drawUI(world);
  }

  drawUI(world) {
    const ctx = this.ctx;
    const fs = this.fontScale;
    const us = this.uiScale;
    ctx.textAlign = 'center';

    if (!world.isPlaying && !world.isGameOver) {
      const titleY = this.height * 0.28;
      const gap = 14 * us;

      ctx.font = `600 ${48 * fs}px -apple-system, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.fillText('CLIMB', this.width / 2, titleY);
      ctx.fillText('COLOR', this.width / 2, titleY + 52 * fs + gap);

      ctx.font = `500 ${14 * fs}px -apple-system, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fillText('TAP TO PLAY', this.width / 2, titleY + 115 * fs);

      if (world.highScore > 0) {
        ctx.font = `500 ${13 * fs}px -apple-system, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillText(`BEST: ${world.highScore}`, this.width / 2, titleY + 145 * fs);
      }

      ctx.font = `700 ${12 * fs}px -apple-system, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillText('Developed by: Marwane Traiki', this.width / 2, this.height * 0.93);

    } else if (world.isPlaying) {
      ctx.font = `200 ${68 * fs}px -apple-system, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.fillText(world.score.toString(), this.width / 2, this.height * 0.15);

      if (world.combo > 1) {
        ctx.font = `700 ${20 * fs}px -apple-system, sans-serif`;
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`${world.combo}x`, this.width / 2, this.height * 0.20);
      }

    } else if (world.isGameOver) {
      this.drawGameOverScreen(world);
    }
  }

  drawGameOverScreen(world) {
    const ctx = this.ctx;
    const fs = this.fontScale;
    const us = this.uiScale;
    const centerX = this.width / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, this.width, this.height);

    const cardWidth = Math.min(this.width * 0.88, 300 * us);
    const cardHeight = Math.min(this.height * 0.52, 340 * us);
    const cardX = (this.width - cardWidth) / 2;
    const cardY = (this.height - cardHeight) / 2 - 20 * us;
    const radius = 18 * us;
    const padding = 24 * us;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;

    ctx.fillStyle = 'rgba(25, 25, 45, 0.94)';
    ctx.beginPath();
    ctx.moveTo(cardX + radius, cardY);
    ctx.lineTo(cardX + cardWidth - radius, cardY);
    ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + radius);
    ctx.lineTo(cardX + cardWidth, cardY + cardHeight - radius);
    ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - radius, cardY + cardHeight);
    ctx.lineTo(cardX + radius, cardY + cardHeight);
    ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - radius);
    ctx.lineTo(cardX, cardY + radius);
    ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';

    ctx.font = `600 ${18 * fs}px -apple-system, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('GAME OVER', centerX, cardY + padding + 22 * us);

    const scoreY = cardY + padding + 85 * us;
    ctx.font = `700 ${58 * fs}px -apple-system, sans-serif`;
    if (world.isNewHighScore) {
      ctx.fillStyle = '#FFD700';
    } else {
      ctx.fillStyle = '#ffffff';
    }
    ctx.fillText(world.score.toString(), centerX, scoreY);

    let statsY = scoreY + 45 * us;
    if (world.isNewHighScore) {
      ctx.font = `700 ${13 * fs}px -apple-system, sans-serif`;
      ctx.fillStyle = '#FFD700';
      ctx.fillText('🏆 NEW HIGH SCORE!', centerX, scoreY + 32 * us);
      statsY += 30 * us;
    }

    const statSpacing = 55 * us;

    ctx.font = `500 ${11 * fs}px -apple-system, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillText('TIME', centerX - statSpacing, statsY);
    ctx.fillText('BEST', centerX + statSpacing, statsY);

    const minutes = Math.floor(world.playTime / 60);
    const seconds = world.playTime % 60;
    const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    ctx.font = `700 ${17 * fs}px -apple-system, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(timeStr, centerX - statSpacing, statsY + 22 * us);
    ctx.fillText(world.highScore.toString(), centerX + statSpacing, statsY + 22 * us);

    ctx.font = `500 ${13 * fs}px -apple-system, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('TAP TO RESTART', centerX, cardY + cardHeight - padding - 8 * us);

    ctx.font = `700 ${12 * fs}px -apple-system, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillText('Developed by: Marwane Traiki', centerX, this.height * 0.93);
  }

  addBurst(x, y, z) {
    const screenPos = this.project(x, y, z);
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      this.burstParticles.push({
        x: screenPos.x,
        y: screenPos.y,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2 - 2.5,
        r: 2,
        alpha: 1
      });
    }
  }

  addShake(intensity = 5) {
    this.shake.x = (Math.random() - 0.5) * intensity;
    this.shake.y = (Math.random() - 0.5) * intensity;
  }

  drawPillar(x, y, zTop, w, d, colorData) {
    const p1 = this.project(x, y, zTop);
    const p2 = this.project(x + w, y, zTop);
    const p3 = this.project(x + w, y + d, zTop);
    const p4 = this.project(x, y + d, zTop);

    const bottomY = this.height * 2;

    let hue = 40, sat = 85, light = 55;
    if (typeof colorData === 'object' && colorData.h !== undefined) {
      hue = colorData.h;
      sat = colorData.s;
      light = colorData.l;
    }

    // Front
    this.ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light - 25}%)`;
    this.ctx.beginPath();
    this.ctx.moveTo(p4.x, p4.y);
    this.ctx.lineTo(p3.x, p3.y);
    this.ctx.lineTo(p3.x, bottomY);
    this.ctx.lineTo(p4.x, bottomY);
    this.ctx.closePath();
    this.ctx.fill();

    // Left
    this.ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light - 22}%)`;
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p4.x, p4.y);
    this.ctx.lineTo(p4.x, bottomY);
    this.ctx.lineTo(p1.x, bottomY);
    this.ctx.closePath();
    this.ctx.fill();

    // Right
    this.ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light - 12}%)`;
    this.ctx.beginPath();
    this.ctx.moveTo(p2.x, p2.y);
    this.ctx.lineTo(p3.x, p3.y);
    this.ctx.lineTo(p3.x, bottomY);
    this.ctx.lineTo(p2.x, bottomY);
    this.ctx.closePath();
    this.ctx.fill();
  }
}

module.exports = Renderer;
