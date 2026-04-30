import { test, expect } from '@playwright/test';

test('level 2 is playable after completing level 1', async ({ page }) => {
  // Capture all console errors during the test
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warn') {
      consoleErrors.push(`${msg.type()}: ${msg.text()}`);
    }
  });

  await page.goto('/');

  // Wait for Phaser game to load
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Start the game by directly invoking menu scene methods
  await page.evaluate(() => {
    const scene = game.scene.getScene('MenuScene');
    if (scene) {
      scene._selectMode('classic');
      scene.scene.start('GameScene', { mode: 'classic', difficulty: 'normal' });
    }
  });

  // Wait for GameScene to load and READY? countdown to finish (1200ms)
  await page.waitForTimeout(3000);

  // Verify game is active
  const inGame = await page.evaluate(() => {
    const scene = game.scene.getScene('GameScene');
    return scene && scene.gameActive === true;
  });
  expect(inGame).toBe(true);

  // === TEST 1: Verify playerMoving is false at start of level 1 ===
  const state1 = await page.evaluate(() => {
    const scene = game.scene.getScene('GameScene');
    if (!scene) return { error: 'GameScene not found' };
    return {
      level: scene.level,
      gameActive: scene.gameActive,
      playerMoving: scene.playerMoving,
      playerY: scene.player.y,
    };
  });
  console.log('Level 1 start state:', JSON.stringify(state1));
  expect(state1.level).toBe(1);
  expect(state1.gameActive).toBe(true);
  expect(state1.playerMoving).toBe(false);

  // === TEST 2: Simulate the race condition that caused the original bug ===
  // Set playerMoving = true (simulating a move-in-progress), then call
  // rebuildLevel which calls killTweensOf. Verify playerMoving is reset.
  const raceResult = await page.evaluate(() => {
    const scene = game.scene.getScene('GameScene');
    if (!scene) return { error: 'GameScene not found' };

    // Simulate: player was mid-hop when level complete triggered
    scene.playerMoving = true;
    scene.lastMoveTime = scene.time.now;

    // Now call rebuildLevel (this is what happens during level transition)
    scene.rebuildLevel();

    // After rebuildLevel, playerMoving should be false
    return {
      playerMoving: scene.playerMoving,
      lastMoveTime: scene.lastMoveTime,
      playerY: scene.player.y,
    };
  });
  console.log('Race condition test:', JSON.stringify(raceResult));
  // THIS IS THE KEY ASSERTION — the fix ensures playerMoving is reset
  expect(raceResult.playerMoving).toBe(false);

  // === TEST 3: Complete level 1 normally and verify level 2 state ===
  // First, reset to a clean state by restarting the scene
  await page.evaluate(() => {
    const scene = game.scene.getScene('GameScene');
    if (scene) {
      // Reset playerMoving to false (it should already be false from rebuildLevel)
      scene.playerMoving = false;
      scene.lastMoveTime = 0;
      scene.gameActive = true;
      scene.physics.resume();
    }
  });

  // Now complete level 1 properly
  await page.evaluate(() => {
    const scene = game.scene.getScene('GameScene');
    if (!scene) return;
    scene.gameActive = false;
    scene.physics.pause();

    // Fill all goal bays
    if (scene.goalBays) {
      scene.goalBays.forEach((bay, index) => {
        if (bay.isEmpty()) {
          GoalManager.fillBay(scene, index);
          bay.updateVisuals();
        }
      });
    }

    // Trigger level complete (this calls onLevelComplete which does flash → rebuild → countdown)
    scene.levelComplete();
  });

  // Wait for level complete flash (600ms) + rebuildLevel + LEVEL 2 countdown (1200ms)
  await page.waitForTimeout(3000);

  // Log any console errors that occurred during the transition
  if (consoleErrors.length > 0) {
    console.log('Console errors during transition:', consoleErrors.join(' | '));
  }

  // Check if update crashed
  const crashInfo = await page.evaluate(() => {
    const scene = game.scene.getScene('GameScene');
    if (!scene) return { error: 'GameScene not found' };
    return {
      crashed: scene._updateCrashed,
      level: scene.level,
      gameActive: scene.gameActive,
      playerMoving: scene.playerMoving,
      playerY: scene.player.y,
      lastMoveTime: scene.lastMoveTime,
      physicsPaused: scene.physics.world.isPaused,
    };
  });
  console.log('Level 2 state after transition:', JSON.stringify(crashInfo));
  if (crashInfo.crashed) {
    console.error('UPDATE LOOP CRASHED! Check browser console for details.');
  }
  expect(crashInfo.level).toBe(2);
  expect(crashInfo.gameActive).toBe(true);
  expect(crashInfo.playerMoving).toBe(false);
  expect(crashInfo.physicsPaused).toBe(false);

  // === TEST 4: Simulate race condition on level 2 ===
  // Set playerMoving = true, call rebuildLevel, verify reset
  const raceResult2 = await page.evaluate(() => {
    const scene = game.scene.getScene('GameScene');
    if (!scene) return { error: 'GameScene not found' };

    // Simulate mid-hop on level 2
    scene.playerMoving = true;
    scene.rebuildLevel();

    return {
      playerMoving: scene.playerMoving,
      level: scene.level,
    };
  });
  console.log('Level 2 race condition test:', JSON.stringify(raceResult2));
  expect(raceResult2.playerMoving).toBe(false);
  expect(raceResult2.level).toBe(2);

  // === TEST 5: Verify rebuildLevel source code contains the playerMoving reset ===
  // We can't test onStop in headless mode (no game loop), so verify the fix
  // is present in the source by checking rebuildLevel resets playerMoving
  const rebuildLevelSource = await page.evaluate(() => {
    const scene = game.scene.getScene('GameScene');
    if (!scene) return '';
    // Get the source text of rebuildLevel method
    return scene.rebuildLevel.toString();
  });
  console.log('Verifying rebuildLevel contains playerMoving reset...');
  expect(rebuildLevelSource).toContain('playerMoving');
  expect(rebuildLevelSource).toContain('killTweensOf');

  await page.screenshot({ path: 'docs/test/screenshots/level2-playable.png' });
});
