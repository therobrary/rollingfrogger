// Rolling-Frogger - Mode Manager System
// Manages game mode state (classic, endless, bonus) with localStorage persistence

const ModeManager = {
  STORAGE_KEY: 'rollingfrogger_mode',
  DEFAULT_MODE: 'classic',
  VALID_MODES: ['classic', 'endless', 'bonus'],

  // Initialize mode from localStorage or default
  init() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === 'endless' || saved === 'classic' || saved === 'bonus') {
        this._currentMode = saved;
      } else {
        this._currentMode = this.DEFAULT_MODE;
      }
    } catch (e) {
      this._currentMode = this.DEFAULT_MODE;
    }
    return this._currentMode;
  },

  // Set the game mode
  setMode(mode) {
    if (!this.VALID_MODES.includes(mode)) {
      mode = this.DEFAULT_MODE;
    }
    this._currentMode = mode;
    try {
      localStorage.setItem(this.STORAGE_KEY, mode);
    } catch (e) {
      // localStorage may be unavailable
    }
    return mode;
  },

  // Get the current game mode
  getMode() {
    if (!this._currentMode) {
      this.init();
    }
    return this._currentMode;
  },

  // Check if currently in endless mode
  isEndless() {
    return this.getMode() === 'endless';
  },

  // Check if currently in classic mode
  isClassic() {
    return this.getMode() === 'classic';
  },

  // Check if currently in bonus mode
  isBonus() {
    return this.getMode() === 'bonus';
  },

  // Check if in any bonus sub-mode (delegated to BonusManager)
  isBonusSubMode(subModeId) {
    if (!this.isBonus()) return false;
    return BonusManager && BonusManager.getBonusMode() && BonusManager.getBonusMode().id === subModeId;
  },

  // Get mode display name
  getModeLabel(mode) {
    const m = mode || this.getMode();
    if (m === 'endless') return 'Endless';
    if (m === 'bonus') return 'Bonus';
    return 'Classic';
  },

  // Get mode description
  getModeDescription(mode) {
    const m = mode || this.getMode();
    if (m === 'endless') {
      return 'Cross as far as you can! Distance-based scoring with near-miss bonuses.';
    }
    if (m === 'bonus') {
      return 'Time Trial, No Miss, Speed Run, and Zen Mode challenges.';
    }
    return 'Fill all 5 goal bays to complete each level.';
  },

  // Get mode-specific high score key
  getHighScoreKey(mode) {
    const m = mode || this.getMode();
    return `rollingfrogger_highscore_${m}`;
  },

  // Get mode-specific best stats key
  getBestStatsKey(mode) {
    const m = mode || this.getMode();
    return `rollingfrogger_beststats_${m}`;
  },

  // Save mode-specific high score
  saveHighScore(mode, score, stats) {
    const key = this.getHighScoreKey(mode);
    const statsKey = this.getBestStatsKey(mode);
    try {
      const currentHigh = parseInt(localStorage.getItem(key), 10) || 0;
      if (score > currentHigh) {
        localStorage.setItem(key, score);
        if (stats) {
          localStorage.setItem(statsKey, stats);
        }
      }
    } catch (e) {}
  },

  // Get mode-specific high score
  getHighScore(mode) {
    const key = this.getHighScoreKey(mode);
    try {
      return parseInt(localStorage.getItem(key), 10) || 0;
    } catch (e) {
      return 0;
    }
  },

  // Get mode-specific best stats
  getBestStats(mode) {
    const key = this.getBestStatsKey(mode);
    try {
      return localStorage.getItem(key) || '';
    } catch (e) {
      return '';
    }
  }
};
