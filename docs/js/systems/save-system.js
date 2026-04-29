// Rolling-Frogger - Save System
// Handles localStorage save/load with versioning and migration

const SaveSystem = {
  VERSION: 2,
  VERSION_KEY: 'rollingfrogger_version',
  PREFIX: 'rollingfrogger_',

  save(key, data) {
    try {
      const saveData = {
        version: this.VERSION,
        timestamp: Date.now(),
        data: data,
      };
      localStorage.setItem(this.PREFIX + key, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.warn('SaveSystem: Failed to save', key, e);
      return false;
    }
  },

  load(key) {
    try {
      const raw = localStorage.getItem(this.PREFIX + key);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.data) return null;

      // Handle version migration
      if (parsed.version && parsed.version < this.VERSION) {
        parsed.data = this.migrate(parsed.data, parsed.version);
        parsed.version = this.VERSION;
        // Save migrated data
        try {
          localStorage.setItem(this.PREFIX + key, JSON.stringify(parsed));
        } catch (e) {}
      }

      return parsed.data;
    } catch (e) {
      console.warn('SaveSystem: Failed to load', key, e);
      return null;
    }
  },

  delete(key) {
    try {
      localStorage.removeItem(this.PREFIX + key);
      return true;
    } catch (e) {
      console.warn('SaveSystem: Failed to delete', key, e);
      return false;
    }
  },

  exportSave() {
    const saveData = {};
    const keys = ['progress', 'characters', 'settings', 'achievements', 'challenges'];
    for (const key of keys) {
      const data = this.load(key);
      if (data) saveData[key] = data;
    }
    try {
      const accData = localStorage.getItem('rollingfrogger_accessibility');
      if (accData) saveData.accessibility = JSON.parse(accData);
    } catch (e) {}
    const exportObj = {
      version: this.VERSION,
      exportDate: new Date().toISOString(),
      gameData: saveData,
    };
    try {
      return JSON.stringify(exportObj);
    } catch (e) {
      return null;
    }
  },

  importSave(str) {
    try {
      const parsed = JSON.parse(str);
      if (!parsed || !parsed.gameData) return false;

      const keys = Object.keys(parsed.gameData);
      for (const key of keys) {
        this.save(key, parsed.gameData[key]);
      }
      return true;
    } catch (e) {
      console.warn('SaveSystem: Failed to import', e);
      return false;
    }
  },

  // Version migration: v1 -> v2
  migrate(data, fromVersion) {
    return data;
  },

  clearAll() {
    const keys = ['progress', 'characters', 'settings', 'achievements', 'challenges'];
    for (const key of keys) {
      this.delete(key);
    }
    try {
      localStorage.removeItem(this.VERSION_KEY);
      localStorage.removeItem('rollingfrogger_highscore');
      ['classic', 'endless', 'bonus'].forEach(m => {
        localStorage.removeItem(`rollingfrogger_highscore_${m}`);
        localStorage.removeItem(`rollingfrogger_beststats_${m}`);
      });
      localStorage.removeItem('rollingfrogger_mode');
      localStorage.removeItem('rollingfrogger_accessibility');
    } catch (e) {}
  },
};
