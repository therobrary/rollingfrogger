// Rolling-Frogger - Score Manager System
// Handles score, hops, lives, high-score, and HUD updates
const ScoreManager = {

  updateHUD(scene) {
    if (scene.isEndless && scene.isEndless()) {
      scene.hudRenderer.updateEndless(scene.score, scene.lives, scene.distance, scene.combo, scene.highScore, scene.currency, scene.shieldActive, scene.magnetActive);
    } else {
      scene.hudRenderer.update(scene.score, scene.lives, scene.level, scene.hopsCompleted, scene.highScore, scene.currency, scene.shieldActive, scene.magnetActive);
    }
  },

  initHighScore(scene) {
    try {
      scene.highScore = parseInt(localStorage.getItem('rollingfrogger_highscore'), 10) || 0;
    } catch(e) {
      scene.highScore = 0;
    }
  },

  onHopForward(scene) {
    scene.hopsCompleted++;
    scene.score += GameConfig.scorePerHop;

    // Bonus for crossing middle road lanes
    if (LANE_DATA.rightRoadLanes.includes(scene.getPlayerLane())) {
      scene.score += GameConfig.scoreCrossingBonus;
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
      scene.score += GameConfig.scoreLevelComplete;
      scene.hopsCompleted = 0;
      scene.level++;

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

    scene.gameActive = false;
    scene.physics.pause();
    scene.score += GameConfig.scoreLevelComplete;

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
    scene.lives--;
    scene.score = Math.max(0, scene.score - GameConfig.scorePenalty);
    scene.shieldActive = false;
    scene.magnetActive = false;
    scene.player.clearTint();
    if (scene.shieldIndicator) { scene.shieldIndicator.destroy(); scene.shieldIndicator = null; }
    if (scene.magnetIndicator) { scene.magnetIndicator.destroy(); scene.magnetIndicator = null; }

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
      try {
        if (scene.score > scene.highScore) {
          scene.highScore = scene.score;
          localStorage.setItem('rollingfrogger_highscore', scene.highScore);
        }
      } catch(e) {}
      scene.time.delayedCall(GameConfig.deathTransitionMs, () => {
        scene.scene.start('GameOverScene', { won: false, score: scene.score, level: scene.level });
      });
    } else {
      scene.hopsCompleted = 0;
      scene.gameActive = true;
      this.updateHUD(scene);
    }
  },

  onHitByVehicle(scene) {
    if (scene.gameActive === false) return;
    scene.gameActive = false;

    scene.lives--;
    scene.score = Math.max(0, scene.score - GameConfig.scorePenalty);
    scene.shieldActive = false;
    scene.magnetActive = false;
    scene.player.clearTint();
    if (scene.shieldIndicator) { scene.shieldIndicator.destroy(); scene.shieldIndicator = null; }
    if (scene.magnetIndicator) { scene.magnetIndicator.destroy(); scene.magnetIndicator = null; }

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
        try {
          if (scene.score > scene.highScore) {
            scene.highScore = scene.score;
            localStorage.setItem('rollingfrogger_highscore', scene.highScore);
          }
        } catch(e) {}
        scene.time.delayedCall(GameConfig.deathTransitionMs, () => {
          scene.scene.start('GameOverScene', { won: false, score: scene.score, level: scene.level });
        });
      } else {
        scene.gameActive = true;
        this.updateHUD(scene);
      }
    });
  },

  onReachGoal(scene) {
    if (scene.gameActive === false) return;

    const bay = GoalManager.checkGoalReached(scene);
    if (!bay) return;

    const filled = GoalManager.fillBay(scene, bay.index);
    if (!filled) return;

    scene.gameActive = false;
    scene.physics.pause();

    const filledCount = GoalManager.getFilledCount(scene);
    scene.hopsCompleted = filledCount;
    this.updateHUD(scene);

    if (GoalManager.allBaysFilled(scene)) {
      scene.time.delayedCall(500, () => {
        scene.levelComplete();
      });
    } else {
      scene.time.delayedCall(500, () => {
        scene.gameActive = true;
        scene.physics.resume();
        this.updateHUD(scene);
      });
    }
  }
};
