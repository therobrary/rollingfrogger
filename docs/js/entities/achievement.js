// Rolling-Frogger - Achievement Entity
// Simple data class for tracking achievement state

class Achievement {
  constructor(definition, savedState = null) {
    this.id = definition.id;
    this.name = definition.name;
    this.description = definition.description;
    this.condition = definition.condition;
    this.target = definition.target;
    this.reward = definition.reward;
    this.unlocked = savedState ? savedState.unlocked : false;
    this.progress = savedState ? savedState.progress : 0;
    this.unlockedAt = savedState ? savedState.unlockedAt : null;
  }

  unlock() {
    if (this.unlocked) return false;
    this.unlocked = true;
    this.progress = this.target;
    this.unlockedAt = Date.now();
    return true;
  }

  updateProgress(value) {
    if (this.unlocked) return;
    this.progress = Math.min(this.progress + value, this.target);
  }

  isComplete() {
    return this.unlocked || this.progress >= this.target;
  }

  toJSON() {
    return {
      id: this.id,
      unlocked: this.unlocked,
      progress: this.progress,
      unlockedAt: this.unlockedAt,
    };
  }

  static fromJSON(data) {
    const def = ACHIEVEMENT_DATA.getAchievementDef(data.id);
    if (!def) return null;
    return new Achievement(def, data);
  }

  static createAll(savedData = null) {
    const achievements = [];
    const savedMap = {};
    if (savedData && Array.isArray(savedData)) {
      for (const s of savedData) {
        savedMap[s.id] = s;
      }
    }
    for (const def of ACHIEVEMENT_DATA.achievements) {
      const saved = savedMap[def.id] || null;
      achievements.push(new Achievement(def, saved));
    }
    return achievements;
  }
}
