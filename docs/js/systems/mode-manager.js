// Rolling-Frogger - Mode Manager System
// Manages game mode state (classic, endless, bonus) with localStorage persistence

const ModeManager = {
  STORAGE_KEY: 'rollingfrogger_mode',
  DIFFICULTY_KEY: 'rollingfrogger_difficulty',
  DEFAULT_MODE: 'classic',
  VALID_MODES: ['classic', 'endless', 'bonus'],
  VALID_DIFFICULTIES: ['easy', 'normal', 'hard', 'zen', 'hardcore'],
  DEFAULT_DIFFICULTY: 'normal',
  _currentDifficulty: 'normal',
  _zenModeActive: false,
  _hardcoreModeActive: false,

  // Initialize mode from localStorage or default
  init() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === 'endless' || saved === 'classic' || saved === 'bonus') {
        this._currentMode = saved;
      } else {
        this._currentMode = this.DEFAULT_MODE;
      }
      const savedDifficulty = localStorage.getItem(this.DIFFICULTY_KEY);
      if (this.VALID_DIFFICULTIES.includes(savedDifficulty)) {
        this._currentDifficulty = savedDifficulty;
      } else {
        this._currentDifficulty = this.DEFAULT_DIFFICULTY;
      }
      // Check for special modes
      this._zenModeActive = this._currentDifficulty === 'zen';
      this._hardcoreModeActive = this._currentDifficulty === 'hardcore';
    } catch (e) {
      this._currentMode = this.DEFAULT_MODE;
      this._currentDifficulty = this.DEFAULT_DIFFICULTY;
      this._zenModeActive = false;
      this._hardcoreModeActive = false;
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
  },

  // Get current difficulty
  getDifficulty() {
    return this._currentDifficulty;
  },

  // Set difficulty
  setDifficulty(difficulty) {
    if (!this.VALID_DIFFICULTIES.includes(difficulty)) {
      difficulty = this.DEFAULT_DIFFICULTY;
    }
    this._currentDifficulty = difficulty;
    this._zenModeActive = difficulty === 'zen';
    this._hardcoreModeActive = difficulty === 'hardcore';
    try {
      localStorage.setItem(this.DIFFICULTY_KEY, difficulty);
    } catch (e) {}
    return difficulty;
  },

  // Check if zen mode is active
  isZenMode() {
    return this._zenModeActive;
  },

  // Check if hardcore mode is active
  isHardcoreMode() {
    return this._hardcoreModeActive;
  },

  // Check if mode has no death
  hasNoDeath() {
    return this._zenModeActive;
  },

  // Check if mode is one-hit death
  isOneHitDeath() {
    return this._hardcoreModeActive;
  },

  // Get difficulty label
  getDifficultyLabel() {
    const d = this._currentDifficulty;
    if (d === 'zen') return 'Zen';
    if (d === 'hardcore') return 'Hardcore';
    if (d === 'easy') return 'Easy';
    if (d === 'hard') return 'Hard';
    return 'Normal';
  },

  // Get difficulty description
  getDifficultyDescription() {
    const d = this._currentDifficulty;
    if (d === 'zen') return BalanceData.zenMode.description;
    if (d === 'hardcore') return BalanceData.hardcoreMode.description;
    const config = BalanceData.getModeConfig(d);
    return config ? config.description : BalanceData.difficultyModes.normal.description;
  },

  // Get all difficulty options for UI
  getDifficultyOptions() {
    return this.VALID_DIFFICULTIES.map(key => ({
      key: key,
      label: BalanceData.getModeConfig(key).label,
      description: BalanceData.getModeConfig(key).description
    }));
  }
};
