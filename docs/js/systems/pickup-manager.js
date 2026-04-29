// Rolling-Frogger - Pickup Manager System
// Handles spawning, collection, effects, and currency tracking for pickups

const PickupManager = {

  createPickupGroup(scene) {
    scene.pickups = scene.physics.add.group({
      runChildUpdate: true
    });
    scene.currency = scene.currency || 0;
    scene.shieldActive = scene.shieldActive || false;
    scene.magnetActive = scene.magnetActive || false;
    if (this._currencyFlushTimer) clearTimeout(this._currencyFlushTimer);
    this._currencyFlushTimer = null;
    this._persistCurrency(scene);
    return scene.pickups;
  },

  spawnPickups(scene) {
    const group = scene.pickups;
    if (group.getLength() >= GameConfig.maxPickupsOnScreen) return;
    const roadLanes = LANE_DATA.roadLanes || [0, 1, 2, 4, 5, 6];
    const tileSize = LANE_DATA.TILE_SIZE;
    const gameWidth = scene.gameWidth;

    // Calculate vehicle positions to avoid overlap
    const vehicles = [];
    [scene.cars, scene.buses, scene.trucks].forEach(vehicleGroup => {
      vehicleGroup.getChildren().forEach(v => {
        if (v.active && v.body) {
          vehicles.push(v);
        }
      });
    });

    const isSafe = (x, y) => {
      for (const v of vehicles) {
        const hw = v.displayWidth / 2 + 10;
        const hh = v.displayHeight / 2 + 10;
        if (Math.abs(x - v.x) < hw && Math.abs(y - v.y) < hh) return false;
      }
      return true;
    };

    // Spawn weights: coin=50, star=25, shield=12, magnet=8, key=5 (total=100)
    const spawnWeights = [
      { type: 'coin', points: 0, currencyValue: 1, weight: 50, spriteKey: 'pickup_coin' },
      { type: 'star', points: 50, currencyValue: 0, weight: 25, spriteKey: 'pickup_star' },
      { type: 'shield', points: 0, currencyValue: 0, weight: 12, spriteKey: 'pickup_shield' },
      { type: 'magnet', points: 0, currencyValue: 0, weight: 8, spriteKey: 'pickup_magnet' },
      { type: 'key', points: 100, currencyValue: 5, weight: 5, spriteKey: 'pickup_key' }
    ];

    // Pick which lanes get pickups (2-4 lanes per level)
    const numLanes = Phaser.Math.Between(2, 4);
    const shuffledLanes = Phaser.Utils.Array.Shuffle([...roadLanes]);
    const chosenLanes = shuffledLanes.slice(0, numLanes);

    // Pickups per lane
    const pickupsPerLane = Phaser.Math.Between(1, 2);

    chosenLanes.forEach(laneIdx => {
      const laneY = LANE_DATA.getY(laneIdx, scene.gameHeight, tileSize);

      for (let p = 0; p < pickupsPerLane; p++) {
        // Weighted random selection
        const roll = Phaser.Math.Between(1, 100);
        let cumulative = 0;
        let selected = spawnWeights[0];
        for (const sw of spawnWeights) {
          cumulative += sw.weight;
          if (roll <= cumulative) {
            selected = sw;
            break;
          }
        }

        // Position with spacing
        const spacing = gameWidth / (pickupsPerLane + 1);
        const x = spacing * (p + 1) + Phaser.Math.Between(-30, 30);

        // Safety check - don't place on vehicles
        if (!isSafe(x, laneY)) continue;

        const pickup = new Pickup(
          scene, x, laneY,
          selected.spriteKey,
          selected.type,
          selected.points,
          selected.currencyValue
        );
        group.add(pickup);
      }
    });
  },

  checkPickupCollection(scene) {
    if (!scene.player || !scene.gameActive) return;

    const group = scene.pickups;
    const children = group.getChildren();

    for (const pickup of children) {
      if (!pickup.active) continue;

      const dx = scene.player.x - pickup.x;
      const dy = scene.player.y - pickup.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < GameConfig.pickupCollectionRadius) {
        this.collectPickup(scene, pickup);
      }
    }
  },

  collectPickup(scene, pickup) {
    const data = pickup.collect(scene);
    if (!data) return;

    // Play collection sound
    if (typeof AudioManager !== 'undefined') {
      AudioManager.playSFX('collect');
    }

    // Spawn collection particles
    if (typeof ParticleManager !== 'undefined') {
      const colors = { coin: '#ffdd44', star: '#ffaa44', shield: '#44aaff', magnet: '#ff4444', key: '#ffdd00' };
      ParticleManager.createCollect(pickup.x, pickup.y, colors[data.type] || '#ffffff');
    }

    // Track coins for achievements
    if (data.type === 'coin') {
      AchievementManager.trackCoin(true);
      ChallengeManager.checkChallengeProgress('coinsCollected', 1);
    }

    // Apply points
    if (data.points > 0) {
      scene.score += data.points;
      ScoreManager.updateHUD(scene);
    }

    // Apply currency
    if (data.currencyValue > 0) {
      this.addCurrency(scene, data.currencyValue);
    }

    // Track total currency for achievements
    AchievementManager.trackCurrency(scene.currency);

    // Apply type-specific effects
    this.applyPickupEffect(scene, data.type);
  },

  applyPickupEffect(scene, type) {
    switch (type) {
      case 'shield':
        if (typeof AudioManager !== 'undefined') {
          AudioManager.playSFX('shield');
        }
        if (!scene.shieldActive) {
          scene.shieldActive = true;
          scene.player.setTint(0x44aaff);

          // Shield visual indicator
          scene.shieldIndicator = scene.add.circle(
            scene.player.x, scene.player.y, 18, 0x44aaff, 0.3
          ).setDepth(9);
          scene.tweens.add({
            targets: scene.shieldIndicator,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0.1,
            duration: 500,
            yoyo: true,
            repeat: -1
          });

          ScoreManager.updateHUD(scene);
        }
        break;

      case 'magnet':
        if (!scene.magnetActive) {
          scene.magnetActive = true;
          if (!scene.shieldActive) {
            scene.player.setTint(0xff4444);
          }

          // Magnet visual indicator
          scene.magnetIndicator = scene.add.circle(
            scene.player.x, scene.player.y, 32, 0xff4444, 0.15
          ).setDepth(9);
          scene.tweens.add({
            targets: scene.magnetIndicator,
            scaleX: 2,
            scaleY: 2,
            alpha: 0.05,
            duration: 700,
            yoyo: true,
            repeat: -1
          });

          // Attract nearby pickups toward player (one-time on pickup)
          this.attractPickupsToPlayer(scene);

          // Magnet lasts 5 seconds
          scene.time.delayedCall(5000, () => {
            scene.magnetActive = false;
            if (scene.magnetIndicator) {
              scene.magnetIndicator.destroy();
              scene.magnetIndicator = null;
            }
            // Re-apply shield tint if shield is still active
            if (scene.shieldActive) {
              scene.player.setTint(0x44aaff);
            } else {
              scene.player.clearTint();
            }
            ScoreManager.updateHUD(scene);
          });

          ScoreManager.updateHUD(scene);
        }
        break;

      case 'key':
        // Key visual celebration
        const keyFlash = scene.add.rectangle(
          scene.gameWidth / 2, scene.gameHeight / 2,
          scene.gameWidth, scene.gameHeight,
          0xffdd00, 0.2
        ).setDepth(200);
        scene.tweens.add({
          targets: keyFlash,
          alpha: 0,
          duration: 800,
          onComplete: () => keyFlash.destroy()
        });
        break;
    }
  },

  checkShieldHit(scene, vehicle) {
    if (!scene.shieldActive) return false;

    // Consume shield
    scene.shieldActive = false;
    scene.player.clearTint();
    if (scene.shieldIndicator) {
      scene.shieldIndicator.destroy();
      scene.shieldIndicator = null;
    }

    // Shield break visual
    const shieldBreak = scene.add.circle(
      scene.player.x, scene.player.y, 10, 0x44aaff, 1
    ).setDepth(15);
    scene.tweens.add({
      targets: shieldBreak,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 400,
      onComplete: () => shieldBreak.destroy()
    });

    ChallengeManager.checkChallengeProgress('shieldBlocks', 1);

    ScoreManager.updateHUD(scene);
    return true;
  },

  clearPickups(scene) {
    const group = scene.pickups;
    if (group) {
      group.clear(true, true);
    }
    // Reset power-up state
    scene.shieldActive = false;
    scene.magnetActive = false;
    if (scene.player) scene.player.clearTint();
    // Clean up indicators
    if (scene.shieldIndicator) {
      scene.shieldIndicator.destroy();
      scene.shieldIndicator = null;
    }
    if (scene.magnetIndicator) {
      scene.magnetIndicator.destroy();
      scene.magnetIndicator = null;
    }
  },

  getCurrency(scene) {
    return scene.currency || 0;
  },

  addCurrency(scene, amount) {
    scene.currency = (scene.currency || 0) + amount;
    this._persistCurrency(scene);
    ScoreManager.updateHUD(scene);
    return scene.currency;
  },

  spendCurrency(scene, amount) {
    if ((scene.currency || 0) < amount) return false;
    scene.currency -= amount;
    this._persistCurrency(scene);
    ScoreManager.updateHUD(scene);
    return true;
  },

  _persistCurrency(scene) {
    if (!scene) return;
    if (this._currencyFlushTimer) clearTimeout(this._currencyFlushTimer);
    this._currencyFlushTimer = setTimeout(() => {
      try {
        const progress = SaveSystem.load('progress') || { currency: 0 };
        progress.currency = Math.max(progress.currency || 0, scene.currency);
        SaveSystem.save('progress', progress);
      } catch (e) {}
    }, 2000);
  },

  updateIndicators(scene) {
    if (!scene.player) return;
    const px = scene.player.x;
    const py = scene.player.y;
    if (scene.shieldIndicator) {
      scene.shieldIndicator.x = px;
      scene.shieldIndicator.y = py;
    }
    if (scene.magnetIndicator) {
      scene.magnetIndicator.x = px;
      scene.magnetIndicator.y = py;
    }
  },

  attractPickupsToPlayer(scene) {
    if (!scene.magnetActive || !scene.player) return;
    const group = scene.pickups;
    group.getChildren().forEach(p => {
      if (!p.active) return;
      const dx = scene.player.x - p.x;
      const dy = scene.player.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150 && dist > 0) {
        const force = 60 / Math.max(dist, 1);
        p.x += dx * force;
        p.y += dy * force;
      }
    });
  }
};
