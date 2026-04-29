// Rolling-Frogger - Particle Manager
// Particle effects system for visual feedback
const ParticleManager = {
  _particles: [],
  _maxParticles: 100,
  _reducedMotion: false,

  init(reducedMotion) {
    this._particles = [];
    this._reducedMotion = reducedMotion || false;
  },

  createExplosion(x, y, color, count) {
    if (this._reducedMotion) return;
    count = count || 12;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 60 + Math.random() * 120;
      this._particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 1.5 + Math.random() * 1.5,
        size: 2 + Math.random() * 4,
        color: color,
        type: 'explosion'
      });
    }
    this._trim();
  },

  createTrail(x, y, color) {
    if (this._reducedMotion) return;
    this._particles.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
      life: 1,
      decay: 2 + Math.random(),
      size: 2 + Math.random() * 2,
      color: color,
      type: 'trail'
    });
    this._trim();
  },

  createSplash(x, y) {
    if (this._reducedMotion) return;
    for (let i = 0; i < 8; i++) {
      const angle = -Math.PI * Math.random();
      const speed = 40 + Math.random() * 80;
      this._particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life: 1,
        decay: 2 + Math.random(),
        size: 2 + Math.random() * 3,
        color: '#88ccff',
        type: 'splash'
      });
    }
    this._trim();
  },

  createCollect(x, y, color) {
    if (this._reducedMotion) return;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const speed = 30 + Math.random() * 40;
      this._particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 2 + Math.random(),
        size: 1.5 + Math.random() * 2.5,
        color: color || '#ffdd44',
        type: 'sparkle'
      });
    }
    this._trim();
  },

  update(dt) {
    if (this._reducedMotion) return;
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.life -= p.decay * dt;
      if (p.life <= 0) {
        this._particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.type === 'splash') {
        p.vy += 200 * dt;
      }
      if (p.type === 'trail') {
        p.vx *= 0.95;
        p.vy *= 0.95;
      }
    }
  },

  clear() {
    this._particles = [];
  },

  _trim() {
    while (this._particles.length > this._maxParticles) {
      this._particles.shift();
    }
  }
};
