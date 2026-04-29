// Rolling-Frogger - Bonus Manager System
// Manages bonus/time-trial mode logic

const BonusManager = {
  STORAGE_PREFIX: 'rollingfrogger_bonus_',

  BONUS_MODES: [
    {
      id: 'time_trial',
      name: 'Time Trial',
      description: 'Beat the clock across lanes! Complete levels in 60 seconds.',
      icon: 'timer',
      color: '#ff4444',
      duration: 60,
      speedMultiplier: 1,
      scoreMultiplier: 1,
      noDeath: false
    },
    {
      id: 'no_miss',
      name: 'No Miss',
      description: 'Complete levels without any near misses.',
      icon: 'shield',
      color: '#44ffaa',
      speedMultiplier: 1,
      scoreMultiplier: 1.5,
      noDeath: false,
      strictNearMisses: true
    },
    {
      id: 'speed_run',
      name: 'Speed Run',
      description: 'Traffic is 2x speed but rewards are 3x!',
      icon: 'bolt',
      color: '#ffaa00',
      speedMultiplier: 2,
      scoreMultiplier: 3,
      noDeath: false
    },
    {
      id: 'zen_mode',
      name: 'Zen Mode',
      description: 'No death, just score accumulation. Relax and play.',
      icon: 'leaf',
      color: '#44aaff',
      speedMultiplier: 1,
      scoreMultiplier: 1,
      noDeath: true
    }
  ],

  init() {
    this._currentBonusMode = null;
    this._timeRemaining = 0;
    this._nearMissCount = 0;
    this._timerCallback = null;
    return this;
  },

  getBonusModes() {
    return this.BONUS_MODES.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      color: m.color,
      highScore: this.getBonusHighScore(m.id),
      bestStats: this.getBonusBestStats(m.id)
    }));
  },

  startBonusMode(modeId) {
    const mode = this.BONUS_MODES.find(m => m.id === modeId);
    if (!mode) {
      console.warn(`[BonusManager] Unknown bonus mode: ${modeId}`);
      return null;
    }

    this._currentBonusMode = { ...mode };
    this._nearMissCount = 0;
    this._timeRemaining = mode.duration || 0;

    const config = {
      mode: 'bonus',
      bonusModeId: modeId,
      speedMultiplier: mode.speedMultiplier,
      scoreMultiplier: mode.scoreMultiplier,
      noDeath: mode.noDeath,
      strictNearMisses: mode.strictNearMisses || false,
      timeTrialDuration: mode.duration || 0
    };

    return config;
  },

  getBonusMode() {
    return this._currentBonusMode;
  },

  isBonusMode() {
    return !!this._currentBonusMode;
  },

  isTimeTrial() {
    return this._currentBonusMode && this._currentBonusMode.id === 'time_trial';
  },

  isSpeedRun() {
    return this._currentBonusMode && this._currentBonusMode.id === 'speed_run';
  },

  isZenMode() {
    return this._currentBonusMode && this._currentBonusMode.id === 'zen_mode';
  },

  isNoMiss() {
    return this._currentBonusMode && this._currentBonusMode.id === 'no_miss';
  },

  getTimeRemaining() {
    return this._timeRemaining;
  },

  getTimeMultiplier() {
    return this._currentBonusMode ? this._currentBonusMode.speedMultiplier : 1;
  },

  getScoreMultiplier() {
    return this._currentBonusMode ? this._currentBonusMode.scoreMultiplier : 1;
  },

  hasNearMisses() {
    return this._currentBonusMode && this._currentBonusMode.strictNearMisses;
  },

  getNearMissCount() {
    return this._nearMissCount;
  },

  incrementNearMiss() {
    this._nearMissCount++;
    return this._nearMissCount;
  },

  resetNearMiss() {
    this._nearMissCount = 0;
  },

  decrementTime(delta) {
    if (!this.isTimeTrial()) return;
    this._timeRemaining = Math.max(0, this._timeRemaining - delta);
    return this._timeRemaining;
  },

  isTimeExpired() {
    return this.isTimeTrial() && this._timeRemaining <= 0;
  },

  getBonusHighScore(modeId) {
    try {
      return parseInt(localStorage.getItem(`${this.STORAGE_PREFIX}highscore_${modeId}`), 10) || 0;
    } catch (e) {
      return 0;
    }
  },

  getBonusBestStats(modeId) {
    try {
      return localStorage.getItem(`${this.STORAGE_PREFIX}beststats_${modeId}`) || '';
    } catch (e) {
      return '';
    }
  },

  saveBonusHighScore(modeId, score, stats) {
    try {
      const currentHigh = this.getBonusHighScore(modeId);
      if (score > currentHigh) {
        localStorage.setItem(`${this.STORAGE_PREFIX}highscore_${modeId}`, score);
        if (stats) {
          localStorage.setItem(`${this.STORAGE_PREFIX}beststats_${modeId}`, stats);
        }
      }
    } catch (e) {}
  },

  clearBonusData() {
    this.BONUS_MODES.forEach(m => {
      try {
        localStorage.removeItem(`${this.STORAGE_PREFIX}highscore_${m.id}`);
        localStorage.removeItem(`${this.STORAGE_PREFIX}beststats_${m.id}`);
      } catch (e) {}
    });
  }
};
