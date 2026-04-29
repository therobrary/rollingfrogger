// Rolling-Frogger - Accessibility System
// Accessibility settings and helpers for colorblind mode, reduced motion, and high contrast

const Accessibility = {
  _settings: {
    colorblindMode: 'none',
    reducedMotion: false,
    highContrast: false
  },

  init() {
    try {
      const saved = localStorage.getItem('rollingfrogger_accessibility');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.colorblindMode) this._settings.colorblindMode = parsed.colorblindMode;
        if (typeof parsed.reducedMotion === 'boolean') this._settings.reducedMotion = parsed.reducedMotion;
        if (typeof parsed.highContrast === 'boolean') this._settings.highContrast = parsed.highContrast;
      }
    } catch (e) {}
    if (this._settings.reducedMotion === false && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this._settings.reducedMotion = true;
    }
    return this._settings;
  },

  getColorblindMode() {
    return this._settings.colorblindMode;
  },

  getReducedMotion() {
    return this._settings.reducedMotion;
  },

  getHighContrast() {
    return this._settings.highContrast;
  },

  setColorblindMode(mode) {
    this._settings.colorblindMode = mode || 'none';
    this.saveSettings();
  },

  setReducedMotion(enabled) {
    this._settings.reducedMotion = !!enabled;
    this.saveSettings();
  },

  setHighContrast(enabled) {
    this._settings.highContrast = !!enabled;
    this.saveSettings();
  },

  saveSettings() {
    try {
      localStorage.setItem('rollingfrogger_accessibility', JSON.stringify(this._settings));
    } catch (e) {}
  },

  getVehicleColor(laneIndex, baseColor) {
    const mode = this._settings.colorblindMode;
    if (mode === 'deuteranopia') {
      return this._adjustForDeuteranopia(baseColor);
    } else if (mode === 'tritanopia') {
      return this._adjustForTritanopia(baseColor);
    } else if (mode === 'achromatopsia') {
      return this._adjustForAchromatopsia(baseColor);
    }
    return baseColor;
  },

  getLaneColor(baseColor) {
    const mode = this._settings.colorblindMode;
    if (mode === 'deuteranopia') {
      return this._adjustForDeuteranopia(baseColor);
    }
    return baseColor;
  },

  applyHighContrastStyle(scene, textObj) {
    if (!this._settings.highContrast) return;
    textObj.setStyle({
      stroke: '#ffffff',
      strokeThickness: 4
    });
  },

  getHighContrastBackgroundColor() {
    return this._settings.highContrast ? 0x000000 : 0x1a1a2e;
  },

  _adjustForDeuteranopia(color) {
    const r = ((color >> 16) & 0xff);
    const g = ((color >> 8) & 0xff);
    const b = (color & 0xff);
    const nr = Math.round(r * 0.567 + g * 0.433);
    const ng = Math.round(r * 0.558 + g * 0.442);
    const nb = Math.round(b * 0.8 + g * 0.2);
    return (nr << 16) | (ng << 8) | nb;
  },

  _adjustForTritanopia(color) {
    const r = ((color >> 16) & 0xff);
    const g = ((color >> 8) & 0xff);
    const b = (color & 0xff);
    const nr = Math.round(r * 0.9 + b * 0.1);
    const ng = Math.round(r * 0.3 + g * 0.7);
    const nb = Math.round(r * 0.3 + b * 0.7);
    return (nr << 16) | (ng << 8) | nb;
  },

  _adjustForAchromatopsia(color) {
    const r = ((color >> 16) & 0xff);
    const g = ((color >> 8) & 0xff);
    const b = (color & 0xff);
    const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
    return (gray << 16) | (gray << 8) | gray;
  }
};
