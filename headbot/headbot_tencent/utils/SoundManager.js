class SoundManager {
    constructor() {
        this.sounds = {}
        this.enabled = true
        this.sampleRate = 44100 // Standard CD quality
        this.init()
    }

    init() {
        try {
            // Generate sound files locally
            this.generateSound('jump', this.createJumpBuffer())
            this.generateSound('coin', this.createCoinBuffer())
            this.generateSound('hit', this.createHitBuffer())
            this.generateSound('death', this.createDeathBuffer())
            this.generateSound('warning', this.createWarningBuffer())
        } catch (e) {
            console.error('Sound generation failed:', e)
            this.enabled = false
        }
    }

    generateSound(name, pcmData) {
        if (!wx.getFileSystemManager) return

        // 1. Add WAV Header to PCM data
        const wavBuffer = this.createWavHeader(pcmData)
        
        // 2. Save to local temp file
        const fs = wx.getFileSystemManager()
        const path = `${wx.env.USER_DATA_PATH}/${name}.wav`
        
        try {
            fs.writeFileSync(path, wavBuffer, 'binary')
            
            // 3. Create Audio Context
            const ctx = wx.createInnerAudioContext()
            ctx.src = path
            this.sounds[name] = ctx
        } catch (e) {
            console.error(`Failed to write sound ${name}:`, e)
        }
    }

    playJump() { this.play('jump') }
    playCoin() { this.play('coin') }
    playHit() { this.play('hit') }
    playDeath() { this.play('death') }
    playWarning() { this.play('warning') }

    play(name) {
        if (!this.enabled || !this.sounds[name]) return
        // Stop current to allow rapid re-triggering
        this.sounds[name].stop()
        this.sounds[name].play()
    }

    // --- WAVE FILE GENERATION ---

    createWavHeader(pcmData) {
        const numChannels = 1
        const sampleRate = this.sampleRate
        const bitsPerSample = 16
        const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
        const blockAlign = numChannels * (bitsPerSample / 8)
        const dataSize = pcmData.byteLength
        const totalSize = 36 + dataSize

        const buffer = new ArrayBuffer(44 + dataSize)
        const view = new DataView(buffer)

        // RIFF Chunk
        this.writeString(view, 0, 'RIFF')
        view.setUint32(4, totalSize, true)
        this.writeString(view, 8, 'WAVE')

        // fmt Chunk
        this.writeString(view, 12, 'fmt ')
        view.setUint32(16, 16, true) // Chunk size
        view.setUint16(20, 1, true) // Audio format (1 = PCM)
        view.setUint16(22, numChannels, true)
        view.setUint32(24, sampleRate, true)
        view.setUint32(28, byteRate, true)
        view.setUint16(32, blockAlign, true)
        view.setUint16(34, bitsPerSample, true)

        // data Chunk
        this.writeString(view, 36, 'data')
        view.setUint32(40, dataSize, true)

        // Write PCM data
        const pcmView = new Int16Array(pcmData)
        const destView = new Int16Array(buffer, 44)
        destView.set(pcmView)

        return buffer
    }

    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i))
        }
    }

    // --- SOUND GENERATORS (PCM) ---

    createJumpBuffer() {
        const duration = 0.15
        const numSamples = Math.floor(this.sampleRate * duration)
        const buffer = new Int16Array(numSamples)
        
        // ROBOT JUMP: Fast square wave slide (8-bit style)
        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate
            const progress = i / numSamples
            // Stepped frequency for robotic feel
            const freq = 150 + Math.floor(450 * progress / 50) * 50 
            const volume = 1.0 - Math.pow(progress, 2)
            
            const val = Math.sin(2 * Math.PI * freq * t) > 0 ? 0.6 : -0.6
            
            buffer[i] = val * 32767 * 0.4 * volume
        }
        return buffer.buffer
    }

    createCoinBuffer() {
        const duration = 0.1
        const numSamples = Math.floor(this.sampleRate * duration)
        const buffer = new Int16Array(numSamples)
        
        // ROBOT COIN: Rapid dual-tone "Bling"
        // 0-50%: 1000Hz, 50-100%: 2000Hz
        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate
            const progress = i / numSamples
            
            const freq = progress < 0.5 ? 1000 : 2000
            const volume = 1.0 - progress * 0.5
            
            // Square wave
            const val = Math.sin(2 * Math.PI * freq * t) > 0 ? 0.6 : -0.6
            
            buffer[i] = val * 32767 * 0.3 * volume
        }
        return buffer.buffer
    }

    createHitBuffer() {
        const duration = 0.15
        const numSamples = Math.floor(this.sampleRate * duration)
        const buffer = new Int16Array(numSamples)
        
        // ROBOT HIT: Metallic Crunch (White noise + Low Square modulation)
        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate
            const progress = i / numSamples
            const volume = 1.0 - Math.pow(progress, 0.5) // Fast decay
            
            // White Noise
            const noise = Math.random() * 2 - 1
            
            // Low square wave modulation (bitcrush feel)
            const mod = Math.sin(2 * Math.PI * 50 * t) > 0 ? 1 : -1
            
            buffer[i] = (noise * 0.7 + mod * 0.3) * 32767 * 0.5 * volume
        }
        return buffer.buffer
    }

    createDeathBuffer() {
        const duration = 0.6
        const numSamples = Math.floor(this.sampleRate * duration)
        const buffer = new Int16Array(numSamples)
        
        // ROBOT DEATH: Power Down "Beee-ooo-www"
        // Descending stepped frequency
        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate
            const progress = i / numSamples
            
            // Descend from 800Hz to 50Hz in steps
            const freq = 800 - Math.floor(750 * progress / 20) * 20
            const volume = 1.0 - progress
            
            // Sawtooth for harshness
            const val = ((t * freq) % 1) * 2 - 1
            
            // Add stutter (amplitude modulation)
            const stutter = Math.sin(2 * Math.PI * 20 * t) > 0 ? 1 : 0
            
            buffer[i] = val * stutter * 32767 * 0.5 * volume
        }
        return buffer.buffer
    }

    createWarningBuffer() {
        const duration = 0.2
        const numSamples = Math.floor(this.sampleRate * duration)
        const buffer = new Int16Array(numSamples)
        
        // WARNING: Double Beep "Beep-Beep"
        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate
            const progress = i / numSamples
            
            // Two beeps
            const beep = Math.sin(2 * Math.PI * 10 * t) > 0 ? 1 : 0
            
            // High frequency sine wave
            const wave = Math.sin(2 * Math.PI * 1500 * t)
            
            buffer[i] = wave * beep * 32767 * 0.3
        }
        return buffer.buffer
    }
}

module.exports = SoundManager
