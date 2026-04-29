// Rolling-Frogger - Score Manager System
// Handles score, hops, lives, high-score, and HUD updates
const ScoreManager = {

  _playSFX(key) {
    if (typeof AudioManager !== 'undefined') {
      AudioManager.playSFX(key);
    }
  },

  updateHUD(scene) {
    const equippedChar = CharacterRoster ? CharacterRoster.getEquippedCharacter() : null;
    const charName = equippedChar ? equippedChar.name : null;
    if (scene.isEndless && scene.isEndless()) {
      scene.hudRenderer.updateEndless(scene.score, scene.lives, scene.distance, scene.combo, scene.highScore, scene.currency, scene.shieldActive, scene.magnetActive);
    } else if (scene.isBonus && scene.isBonus()) {
      scene.hudRenderer.updateBonus(scene.score, scene.lives, scene.level, scene.hopsCompleted, scene.highScore, scene.currency, scene.shieldActive, scene.magnetActive, charName, scene._bonusModeId, scene._timeTrialRemaining, scene._nearMissEntities.length);
    } else {
      scene.hudRenderer.update(scene.score, scene.lives, scene.level, scene.hopsCompleted, scene.highScore, scene.currency, scene.shieldActive, scene.magnetActive, charName);
    }
  },

  initHighScore(scene) {
    try {
      const key = scene._bonusModeId
        ? `rollingfrogger_bonus_highscore_${scene._bonusModeId}`
        : ModeManager.getHighScoreKey(scene._mode);
      scene.highScore = parseInt(localStorage.getItem(key), 10) || 0;
    } catch(e) {
      scene.highScore = 0;
    }
  },

  onHopForward(scene) {
    scene.hopsCompleted++;
    this._playSFX('hop');
    let points = GameConfig.scorePerHop;

    // Apply difficulty director score multiplier
    if (scene._difficultyDirector) {
      points = Math.floor(points * scene._difficultyDirector.getScoreMultiplier());
    }

    scene.score += points;

    // Bonus for crossing middle road lanes
    if (LANE_DATA.rightRoadLanes.includes(scene.getPlayerLane())) {
      let bonus = GameConfig.scoreCrossingBonus;
      if (scene._difficultyDirector) {
        bonus = Math.floor(bonus * (scene._difficultyDirector.getScoreMultiplier() || 1));
      }
      scene.score += bonus;
    }
    return 'ok';
  },

  onHopBackward(scene) {
    if (scene.getPlayerLane() === LANE_DATA.medianLane) {
      scene.score += GameConfig.scoreMedianBonus;
    }
  },

  onPlayerMoved(scene, dx, dy) {
    const currentLane = scene.getPlayerLane();

    if (dy === -1) {
      this.onHopForward(scene);
    }

    if (dy === 1 && currentLane === LANE_DATA.medianLane) {
      this.onHopBackward(scene);
    }

    this.updateHUD(scene);
  },

  onLevelComplete(scene) {
    if (scene.isEndless && scene.isEndless()) {
      // In endless mode, level complete triggers a new section generation
      scene.gameActive = false;
      scene.physics.pause();
      let endlessPoints = GameConfig.scoreLevelComplete;
      if (scene._difficultyDirector) {
        endlessPoints = Math.floor(endlessPoints * scene._difficultyDirector.getScoreMultiplier());
      }
      scene.score += endlessPoints;
      scene.hopsCompleted = 0;
      scene.level++;
      AchievementManager.trackCurrency(scene.currency);
      ChallengeManager.checkChallengeProgress('score', scene.score);

      const flash = scene.add.rectangle(
        scene.gameWidth / 2,
        scene.gameHeight / 2,
        scene.gameWidth,
        scene.gameHeight,
        0x44ff88,
        0.5
      ).setDepth(200);

      scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: GameConfig.levelCompleteFlashMs,
        onComplete: () => {
          flash.destroy();
          // Generate new section ahead
          if (ScrollManager.tryApplyNextSection) {
            ScrollManager.tryApplyNextSection(scene);
          }
          scene.rebuildLevel();
          scene.showCountdown(`DISTANCE: ${scene.distance}`, () => {
            scene.gameActive = true;
            scene.physics.resume();
            this.updateHUD(scene);
          });
        }
      });
      return;
    }

    // Bonus mode level complete
    if (scene.isBonus && scene.isBonus()) {
      let bonusPoints = GameConfig.scoreLevelComplete;
      if (scene._difficultyDirector) {
        bonusPoints = Math.floor(bonusPoints * scene._difficultyDirector.getScoreMultiplier());
      }
      scene.score += Math.floor(bonusPoints * scene._bonusScoreMultiplier);
      scene.hopsCompleted = 0;
      scene.level++;
      ChallengeManager.checkChallengeProgress('levels', 1);

 

      const flash = scene.add.rectangle(
        scene.gameWidth / 2,
        scene.gameHeight / 2,
        scene.gameWidth,
        scene.gameHeight,
        0x44ff88,
        0.5
      ).setDepth(200);

      scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: GameConfig.levelCompleteFlashMs,
        onComplete: () => {
          flash.destroy();
          scene.rebuildLevel();
          scene.showCountdown(`LEVEL ${scene.level}`, () => {
            scene.gameActive = true;
            scene.physics.resume();
            this.updateHUD(scene);
          });
        }
      });
      return;
    }

    scene.gameActive = false;
    scene.physics.pause();
    let levelCompletePoints = GameConfig.scoreLevelComplete;
    if (scene._difficultyDirector) {
      levelCompletePoints = Math.floor(levelCompletePoints * scene._difficultyDirector.getScoreMultiplier());
    }
    scene.score += levelCompletePoints;

    AchievementManager.trackCurrency(scene.currency);
    AchievementManager.trackLevelComplete();

    this._playSFX('levelComplete');
    if (typeof AudioManager !== 'undefined') {
      AudioManager.stopMusic();
    }

    const flash = scene.add.rectangle(
      scene.gameWidth / 2,
      scene.gameHeight / 2,
      scene.gameWidth,
      scene.gameHeight,
      0x44ff88,
      0.5
    ).setDepth(200);

    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: GameConfig.levelCompleteFlashMs,
      onComplete: () => {
        flash.destroy();
        scene.hopsCompleted = 0;
        scene.level++;
        ChallengeManager.checkChallengeProgress('levels', 1);
        scene.rebuildLevel();
        scene.showCountdown(`LEVEL ${scene.level}`, () => {
          scene.gameActive = true;
          scene.physics.resume();
          this.updateHUD(scene);
        });
      }
    });
  },

  onDrown(scene) {
    // Zen mode: no death
    if (scene._bonusNoDeath || ModeManager.isZenMode()) {
      return;
    }

    // Hardcore mode: one hit death
    if (ModeManager.isHardcoreMode()) {
      if (scene._perfectMode) scene._perfectMode = false;
      scene.shieldActive = false;
      scene.magnetActive = false;
      scene.player.clearTint();
      if (scene.shieldIndicator) { scene.shieldIndicator.destroy(); scene.shieldIndicator = null; }
      if (scene.magnetIndicator) { scene.magnetIndicator.destroy(); scene.magnetIndicator = null; }
      AchievementManager.trackDeath();

      this._playSFX('death');

      // Track death for difficulty director
      if (scene._difficultyDirector) {
        scene._difficultyDirector.trackDeath(scene);
      }

      scene.cameras.main.shake(GameConfig.cameraShakeDuration, GameConfig.cameraShakeStrength);
      const flash = scene.add.rectangle(
        scene.gameWidth / 2,
        scene.gameHeight / 2,
        scene.gameWidth,
        scene.gameHeight,
        0xff0000,
        0.4
      ).setDepth(200);
      scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: GameConfig.deathFlashMs,
        onComplete: () => flash.destroy()
      });

      scene.gameActive = false;
      scene.physics.pause();
      ScoreManager.onGameOver(scene);
      this._saveHighScore(scene);
      scene.time.delayedCall(GameConfig.deathTransitionMs, () => {
        scene.scene.start('GameOverScene', { won: false, score: scene.score, level: scene.level, bonusMode: scene._bonusModeId });
      });
      return;
    }

    if (scene._perfectMode) scene._perfectMode = false;
    scene.lives--;
    scene.score = Math.max(0, scene.score - GameConfig.scorePenalty);
    scene.shieldActive = false;
    scene.magnetActive = false;
    scene.ridingEntity = null;
    scene.player.clearTint();
    if (scene.shieldIndicator) { scene.shieldIndicator.destroy(); scene.shieldIndicator = null; }
    if (scene.magnetIndicator) { scene.magnetIndicator.destroy(); scene.magnetIndicator = null; }
    AchievementManager.trackDeath();

    this._playSFX('death');

    // Track death for difficulty director
    if (scene._difficultyDirector) {
      scene._difficultyDirector.trackDeath(scene);
    }

    scene.cameras.main.shake(GameConfig.cameraShakeDuration, GameConfig.cameraShakeStrength);
    const flash = scene.add.rectangle(
      scene.gameWidth / 2,
      scene.gameHeight / 2,
      scene.gameWidth,
      scene.gameHeight,
      0xff0000,
      0.4
    ).setDepth(200);
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: GameConfig.deathFlashMs,
      onComplete: () => flash.destroy()
    });

    if (scene.lives <= 0) {
      ScoreManager.onGameOver(scene);
      this._saveHighScore(scene);
      scene.time.delayedCall(GameConfig.deathTransitionMs, () => {
        scene.scene.start('GameOverScene', { won: false, score: scene.score, level: scene.level, bonusMode: scene._bonusModeId });
      });
    } else {
      scene.hopsCompleted = 0;
      scene.gameActive = true;
      this.updateHUD(scene);
    }
  },

  onHitByVehicle(scene) {
    if (scene.gameActive === false) return;

    // Zen mode: no death, just flash and continue
    if (scene._bonusNoDeath || ModeManager.isZenMode()) {
      scene.player.setAlpha(0.3);
      scene.cameras.main.shake(100, 0.01);
      scene.time.delayedCall(300, () => {
        scene.player.setAlpha(1);
      });
      return;
    }

    // Hardcore mode: one hit death
    if (ModeManager.isHardcoreMode()) {
      if (scene._perfectMode) scene._perfectMode = false;
      scene.shieldActive = false;
      scene.magnetActive = false;
      scene.ridingEntity = null;
      scene.player.clearTint();
      if (scene.shieldIndicator) { scene.shieldIndicator.destroy(); scene.shieldIndicator = null; }
      if (scene.magnetIndicator) { scene.magnetIndicator.destroy(); scene.magnetIndicator = null; }
      AchievementManager.trackDeath();

      this._playSFX('death');

      // Track death for difficulty director
      if (scene._difficultyDirector) {
        scene._difficultyDirector.trackDeath(scene);
      }

      scene.gameActive = false;
      scene.cameras.main.shake(GameConfig.cameraShakeDuration, GameConfig.cameraShakeStrength);
      const flash = scene.add.rectangle(
        scene.gameWidth / 2,
        scene.gameHeight / 2,
        scene.gameWidth,
        scene.gameHeight,
        0xff0000,
        0.4
      ).setDepth(200);
      scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: GameConfig.deathFlashMs,
        onComplete: () => flash.destroy()
      });

      scene.player.setAlpha(0.3);
      scene.physics.pause();

      ScoreManager.onGameOver(scene);
      this._saveHighScore(scene);
      scene.time.delayedCall(GameConfig.deathTransitionMs, () => {
        scene.scene.start('GameOverScene', { won: false, score: scene.score, level: scene.level, bonusMode: scene._bonusModeId });
      });
      return;
    }

    scene.gameActive = false;

    if (scene._perfectMode) scene._perfectMode = false;
    scene.lives--;
    scene.score = Math.max(0, scene.score - GameConfig.scorePenalty);
    scene.shieldActive = false;
    scene.magnetActive = false;
    scene.ridingEntity = null;
    scene.player.clearTint();
    if (scene.shieldIndicator) { scene.shieldIndicator.destroy(); scene.shieldIndicator = null; }
    if (scene.magnetIndicator) { scene.magnetIndicator.destroy(); scene.magnetIndicator = null; }
    AchievementManager.trackDeath();

    this._playSFX('death');

    // Track death for difficulty director
    if (scene._difficultyDirector) {
      scene._difficultyDirector.trackDeath(scene);
    }

    scene.cameras.main.shake(GameConfig.cameraShakeDuration, GameConfig.cameraShakeStrength);
    const flash = scene.add.rectangle(
      scene.gameWidth / 2,
      scene.gameHeight / 2,
      scene.gameWidth,
      scene.gameHeight,
      0xff0000,
      0.4
    ).setDepth(200);
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: GameConfig.deathFlashMs,
      onComplete: () => flash.destroy()
    });

    scene.player.setAlpha(0.3);
    scene.physics.pause();

    scene.time.delayedCall(GameConfig.deathPauseMs, () => {
      scene.player.setPosition(GameConfig.gameWidthHalf, scene.startRowY);
      scene.player.setVelocity(0, 0);
      scene.player.setAlpha(1);
      if (ModeManager.isEndless()) {
        scene.cameras.main.setScroll(0, 0);
      }
      scene.physics.resume();

      if (scene.lives <= 0) {
        ScoreManager.onGameOver(scene);
        this._saveHighScore(scene);
        scene.time.delayedCall(GameConfig.deathTransitionMs, () => {
          scene.scene.start('GameOverScene', { won: false, score: scene.score, level: scene.level, bonusMode: scene._bonusModeId });
        });
      } else {
        scene.gameActive = true;
        this.updateHUD(scene);
      }
    });
  },

  _saveHighScore(scene) {
    try {
      if (scene.score > scene.highScore) {
        scene.highScore = scene.score;
        if (scene._bonusModeId) {
          BonusManager.saveBonusHighScore(scene._bonusModeId, scene.score, `Level ${scene.level} | Score: ${scene.score}`);
        } else {
          ModeManager.saveHighScore(scene._mode, scene.highScore, `Score: ${scene.score}`);
        }
      }
    } catch(e) {}
  },

  onReachGoal(scene) {
    if (scene.gameActive === false) return;

    const bay = GoalManager.checkGoalReached(scene);
    if (!bay) return;

    // Fill the bay for visual feedback
    GoalManager.fillBay(scene, bay.index);
    scene.score += GameConfig.scoreBayFill;
    this.updateHUD(scene);

    // Trigger level completion — onLevelComplete handles all state management
    scene.levelComplete();
  },

  onGameOver(scene) {
    if (!BonusManager.getBonusMode()) return;
    // Save final high score for any mode
    const stats = scene._bonusModeId
      ? `${BonusManager.getBonusMode().name} | Level ${scene.level} | Score: ${scene.score}`
      : `Score: ${scene.score}`;

    if (scene._bonusModeId) {
      BonusManager.saveBonusHighScore(scene._bonusModeId, scene.score, stats);
    } else {
      ModeManager.saveHighScore(scene._mode, scene.score, stats);
    }
  }
};
