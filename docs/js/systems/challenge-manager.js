// Rolling-Frogger - Challenge Manager
// Manages daily challenges with 24-hour refresh cycle

const ChallengeManager = {
  _challenge: null,
  _progress: 0,
  _completed: false,
  _completedAt: null,

  init() {
    const saved = SaveSystem.load('challenges');
    if (saved) {
      this._challenge = saved.challenge || null;
      this._progress = saved.progress || 0;
      this._completed = !!saved.completed;
      this._completedAt = saved.completedAt || null;

      // Check if challenge needs refresh (24-hour cycle)
      if (this._challenge && !this._isSameDay(this._challenge.date, Date.now())) {
        this._generateNewChallenge();
        this.saveChallenge();
      }
    } else {
      this._generateNewChallenge();
      this.saveChallenge();
    }
    return this._challenge;
  },

  _isSameDay(timestamp1, timestamp2) {
    const d1 = new Date(timestamp1);
    const d2 = new Date(timestamp2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  },

  _generateNewChallenge() {
    const available = CHALLENGE_DATA.challenges;
    const randomChallenge = Phaser.Math.RND.pick(available);
    this._challenge = {
      ...randomChallenge,
      date: Date.now(),
    };
    this._progress = 0;
    this._completed = false;
    this._completedAt = null;
  },

  getDailyChallenge() {
    if (!this._challenge) {
      this.init();
    }

    // Refresh if needed
    if (this._challenge && !this._isSameDay(this._challenge.date, Date.now())) {
      this._generateNewChallenge();
      this.saveChallenge();
    }

    return this._challenge;
  },

  checkChallengeProgress(type, value) {
    if (!this._challenge || this._completed) return false;

    if (this._challenge.type === type) {
      this._progress += value || 1;

      if (this._progress >= this._challenge.target) {
        this.completeChallenge();
        return true;
      }
    }

    return false;
  },

  completeChallenge() {
    if (!this._challenge || this._completed) return null;

    this._completed = true;
    this._completedAt = Date.now();
    this.saveChallenge();

    // Award currency reward
    const reward = this._challenge.reward;
    try {
      const progress = SaveSystem.load('progress') || { currency: 0 };
      progress.currency = (progress.currency || 0) + reward;
      SaveSystem.save('progress', progress);
    } catch (e) {}

    return {
      challenge: this._challenge,
      reward: reward,
    };
  },

  isCompleted() {
    return !!this._completed;
  },

  getProgress() {
    return this._progress || 0;
  },

  getTarget() {
    return this._challenge ? this._challenge.target : 0;
  },

  getProgressPercent() {
    if (!this._challenge) return 0;
    return Math.min(100, (this._progress / this._challenge.target) * 100);
  },

  saveChallenge() {
    const data = {
      challenge: this._challenge,
      progress: this._progress,
      completed: this._completed,
      completedAt: this._completedAt,
    };
    SaveSystem.save('challenges', data);
  },
};
