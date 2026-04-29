// Rolling-Frogger - Achievement Manager
// Tracks achievements, checks conditions, unlocks, and persists state

const AchievementManager = {
  _achievements: null,
  _trackedValues: {
    hops: 0,
    deaths: 0,
    levelsCompleted: 0,
    endlessTime: 0,
    coinsCollected: 0,
    maxNearMissCombo: 0,
    perfectLevels: 0,
    totalCurrency: 0,
    charactersPlayed: [],
  },

  init() {
    const saved = SaveSystem.load('achievements');
    const savedData = saved && saved.achievements ? saved.achievements : null;
    this._achievements = Achievement.createAll(savedData);
    this._loadTrackedValues(saved);
    return this._achievements;
  },

  _loadTrackedValues(saved) {
    if (!saved) return;
    if (typeof saved.hops === 'number') this._trackedValues.hops = saved.hops;
    if (typeof saved.deaths === 'number') this._trackedValues.deaths = saved.deaths;
    if (typeof saved.levelsCompleted === 'number') this._trackedValues.levelsCompleted = saved.levelsCompleted;
    if (typeof saved.endlessTime === 'number') this._trackedValues.endlessTime = saved.endlessTime;
    if (typeof saved.coinsCollected === 'number') this._trackedValues.coinsCollected = saved.coinsCollected;
    if (typeof saved.maxNearMissCombo === 'number') this._trackedValues.maxNearMissCombo = saved.maxNearMissCombo;
    if (typeof saved.perfectLevels === 'number') this._trackedValues.perfectLevels = saved.perfectLevels;
    if (typeof saved.totalCurrency === 'number') this._trackedValues.totalCurrency = saved.totalCurrency;
    if (Array.isArray(saved.charactersPlayed)) this._trackedValues.charactersPlayed = saved.charactersPlayed;
  },

  getAchievement(id) {
    if (!this._achievements) return null;
    return this._achievements.find(a => a.id === id) || null;
  },

  getAchievements() {
    return this._achievements || [];
  },

  getUnlockedCount() {
    return this._achievements ? this._achievements.filter(a => a.unlocked).length : 0;
  },

  getTotalCount() {
    return ACHIEVEMENT_DATA.getAchievementCount();
  },

  checkAchievement(id, value) {
    const achievement = this.getAchievement(id);
    if (!achievement || achievement.unlocked) return false;

    const tracked = this._trackedValues;
    const condition = achievement.condition;

    // Check if the tracked value meets the target
    switch (condition) {
      case 'hops':
        if (tracked.hops >= achievement.target) {
          return this.unlockAchievement(id);
        }
        break;
      case 'deaths':
        if (tracked.deaths >= achievement.target) {
          return this.unlockAchievement(id);
        }
        break;
      case 'levelsCompleted':
        if (tracked.levelsCompleted >= achievement.target) {
          return this.unlockAchievement(id);
        }
        break;
      case 'endlessTime':
        if (tracked.endlessTime >= achievement.target) {
          return this.unlockAchievement(id);
        }
        break;
      case 'coinsCollected':
        if (tracked.coinsCollected >= achievement.target) {
          return this.unlockAchievement(id);
        }
        break;
      case 'maxNearMissCombo':
        if (tracked.maxNearMissCombo >= achievement.target) {
          return this.unlockAchievement(id);
        }
        break;
      case 'perfectLevel':
        if (tracked.perfectLevels >= achievement.target) {
          return this.unlockAchievement(id);
        }
        break;
      case 'totalCurrency':
        if (tracked.totalCurrency >= achievement.target) {
          return this.unlockAchievement(id);
        }
        break;
      case 'charactersPlayed':
        if (tracked.charactersPlayed.length >= achievement.target) {
          return this.unlockAchievement(id);
        }
        break;
    }

    // Update progress for applicable achievements
    this._updateAchievementProgress(achievement, value);
    return false;
  },

  _updateAchievementProgress(achievement, value) {
    if (achievement.unlocked) return;

    const condition = achievement.condition;
    let updateAmount = 0;

    switch (condition) {
      case 'hops':
      case 'levelsCompleted':
      case 'perfectLevel':
      case 'deaths':
        updateAmount = value || 1;
        break;
      case 'endlessTime':
        updateAmount = value || 1;
        break;
      case 'coinsCollected':
      case 'maxNearMissCombo':
        updateAmount = value || 1;
        break;
      case 'totalCurrency':
        // For currency, update based on current total
        updateAmount = this._trackedValues.totalCurrency - achievement.progress;
        break;
      case 'charactersPlayed':
        updateAmount = value || 1;
        break;
    }

    if (updateAmount > 0) {
      achievement.updateProgress(updateAmount);
    }
  },

  unlockAchievement(id) {
    const achievement = this.getAchievement(id);
    if (!achievement || achievement.unlocked) return null;

    const unlocked = achievement.unlock();
    if (!unlocked) return null;

    // Award currency reward
    const reward = achievement.reward;
    try {
      const progress = SaveSystem.load('progress') || { currency: 0 };
      progress.currency = (progress.currency || 0) + reward;
      SaveSystem.save('progress', progress);
    } catch (e) {}

    // Save and show notification
    this.saveAchievements();

    // Show popup notification
    try {
      if (typeof AchievementPopup !== 'undefined') {
        AchievementPopup.init();
        AchievementPopup.show(achievement);
      }
    } catch (e) {}

    return {
      achievement: achievement,
      reward: reward,
    };
  },

  trackHop() {
    this._trackedValues.hops++;
    this.checkAchievement('first_steps');
  },

  trackDeath() {
    this._trackedValues.deaths++;
    this.checkAchievement('first_blood');
  },

  trackLevelComplete() {
    this._trackedValues.levelsCompleted++;
    this.checkAchievement('speed_runner');
  },

  trackEndlessTime(seconds) {
    this._trackedValues.endlessTime += seconds;
    this.checkAchievement('survivor');
    this.checkAchievement('marathon');
  },

  trackCoin(collected = true) {
    if (collected) {
      this._trackedValues.coinsCollected++;
      this.checkAchievement('collector');
    }
  },

  trackNearMissCombo(count) {
    if (count > this._trackedValues.maxNearMissCombo) {
      this._trackedValues.maxNearMissCombo = count;
    }
    this.checkAchievement('lucky');
  },

  trackPerfectLevel() {
    this._trackedValues.perfectLevels++;
    this.checkAchievement('frogger');
  },

  trackCurrency(total) {
    this._trackedValues.totalCurrency = Math.max(this._trackedValues.totalCurrency, total);
    this.checkAchievement('rich');
  },

  trackCharacterPlayed(charId) {
    const tracked = this._trackedValues.charactersPlayed;
    if (!tracked.includes(charId)) {
      tracked.push(charId);
    }
    this.checkAchievement('explorer');
  },

  saveAchievements() {
    if (!this._achievements) return;
    const data = {
      achievements: this._achievements.map(a => a.toJSON()),
      hops: this._trackedValues.hops,
      deaths: this._trackedValues.deaths,
      levelsCompleted: this._trackedValues.levelsCompleted,
      endlessTime: this._trackedValues.endlessTime,
      coinsCollected: this._trackedValues.coinsCollected,
      maxNearMissCombo: this._trackedValues.maxNearMissCombo,
      perfectLevels: this._trackedValues.perfectLevels,
      totalCurrency: this._trackedValues.totalCurrency,
      charactersPlayed: this._trackedValues.charactersPlayed,
    };
    SaveSystem.save('achievements', data);
  },
};
