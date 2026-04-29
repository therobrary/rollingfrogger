// Rolling-Frogger - Audio Manager
// Web Audio API based sound effects and music management
// Falls back to silent if audio is not available

const AudioManager = {
  _ctx: null,
  _musicGain: null,
  _sfxGain: null,
  _musicVolume: 0.3,
  _sfxVolume: 0.7,
  _musicMuted: false,
  _sfxMuted: false,
  _currentMusic: null,
  _musicNodes: {},
  _initialized: false,

  init() {
    if (this._initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        this._initialized = true;
        this._disabled = true;
        return;
      }
      this._ctx = new AudioContext();
      this._musicGain = this._ctx.createGain();
      this._musicGain.connect(this._ctx.destination);
      this._musicGain.gain.value = this._musicVolume;
      this._sfxGain = this._ctx.createGain();
      this._sfxGain.connect(this._ctx.destination);
      this._sfxGain.gain.value = this._sfxVolume;
      this._initialized = true;
      this._disabled = false;
    } catch (e) {
      this._initialized = true;
      this._disabled = true;
    }
  },

  _ensureCtx() {
    if (!this._initialized) this.init();
    if (this._disabled || !this._ctx) return false;
    if (this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => {});
    }
    return true;
  },

  playSFX(key) {
    if (!this._ensureCtx()) return;
    if (this._sfxMuted) return;
    const generator = this._sfxGenerators[key];
    if (!generator) return;
    try {
      generator(this._ctx, this._sfxGain);
    } catch (e) {}
  },

  playMusic(key) {
    if (!this._ensureCtx()) return;
    if (this._musicMuted) return;
    this.stopMusic();
    const generator = this._musicGenerators[key];
    if (!generator) return;
    try {
      const node = generator(this._ctx, this._musicGain);
      if (node) {
        this._currentMusic = node;
      }
    } catch (e) {}
  },

  stopMusic() {
    if (this._currentMusic) {
      try {
        if (this._currentMusic.stop) {
          this._currentMusic.stop();
        }
        if (this._currentMusic.disconnect) {
          this._currentMusic.disconnect();
        }
      } catch (e) {}
      this._currentMusic = null;
    }
  },

  setVolume(type, value) {
    value = Math.max(0, Math.min(1, value));
    if (type === 'sfx') {
      this._sfxVolume = value;
      if (this._sfxGain) {
        this._sfxGain.gain.value = this._sfxMuted ? 0 : value;
      }
    } else if (type === 'music') {
      this._musicVolume = value;
      if (this._musicGain) {
        this._musicGain.gain.value = this._musicMuted ? 0 : value;
      }
    }
  },

  mute(type) {
    if (type === 'sfx') {
      this._sfxMuted = true;
      if (this._sfxGain) this._sfxGain.gain.value = 0;
    } else if (type === 'music') {
      this._musicMuted = true;
      if (this._musicGain) this._musicGain.gain.value = 0;
      this.stopMusic();
    }
  },

  unmute(type) {
    if (type === 'sfx') {
      this._sfxMuted = false;
      if (this._sfxGain) this._sfxGain.gain.value = this._sfxVolume;
    } else if (type === 'music') {
      this._musicMuted = false;
      if (this._musicGain) this._musicGain.gain.value = this._musicVolume;
    }
  },

  isSfxMuted() {
    return this._sfxMuted;
  },

  isMusicMuted() {
    return this._musicMuted;
  },

  _sfxGenerators: {
    hop(ctx, destination) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain).connect(destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    },

    crash(ctx, destination) {
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      source.connect(filter).connect(gain).connect(destination);
      source.start(ctx.currentTime);
    },

    collect(ctx, destination) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain).connect(destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    },

    levelComplete(ctx, destination) {
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.connect(gain).connect(destination);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    },

    death(ctx, destination) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain).connect(destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    },

    splash(ctx, destination) {
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 0.5;
      source.connect(filter).connect(gain).connect(destination);
      source.start(ctx.currentTime);
    },

    shield(ctx, destination) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain).connect(destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    },

    spawn(ctx, destination) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain).connect(destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    }
  },

  _musicGenerators: {
    ambient(ctx, destination) {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 130.81;
      osc2.frequency.value = 196;
      gain.gain.value = 0.06;
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(destination);
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      return { stop: () => { osc1.stop(); osc2.stop(); }, disconnect: () => { osc1.disconnect(); osc2.disconnect(); } };
    }
  }
};
