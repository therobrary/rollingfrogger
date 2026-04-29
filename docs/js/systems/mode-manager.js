// Rolling-Frogger - Mode Manager System
// Manages game mode state (classic vs endless) with localStorage persistence

const ModeManager = {
  STORAGE_KEY: 'rollingfrogger_mode',
  DEFAULT_MODE: 'classic',

  // Initialize mode from localStorage or default
  init() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === 'endless' || saved === 'classic') {
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
    if (mode !== 'classic' && mode !== 'endless') {
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

  // Get mode display name
  getModeLabel(mode) {
    const m = mode || this.getMode();
    return m === 'endless' ? 'Endless' : 'Classic';
  },

  // Get mode description
  getModeDescription(mode) {
    const m = mode || this.getMode();
    if (m === 'endless') {
      return 'Cross as far as you can! Distance-based scoring with near-miss bonuses.';
    }
    return 'Fill all 5 goal bays to complete each level.';
  },
};
