// Rolling-Frogger - Player Controller System
// Handles input setup and player movement execution
const PlayerController = {

  setupInput(scene) {
    scene.cursors = scene.input.keyboard.createCursorKeys();
    scene.wasd = scene.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D'
    });

    scene.input.on('pointerdown', (pointer) => {
      if (!scene.gameActive || scene.playerMoving) return;
      const { width, height } = scene.scale;
      const cx = width / 2;
      const cy = height / 2;
      let dx = 0, dy = 0;
      const px = pointer.x - cx;
      const py = pointer.y - cy;
      if (Math.abs(px) > Math.abs(py)) {
        dx = px > 0 ? 1 : -1;
      } else {
        dy = py > 0 ? 1 : -1;
      }
      if (dx !== 0 || dy !== 0) {
        this.executeMove(scene, dx, dy);
      }
    });
  },

  getKeyboardInput(cursors, wasd) {
    const left = cursors.left.isDown || wasd.left.isDown;
    const right = cursors.right.isDown || wasd.right.isDown;
    const up = cursors.up.isDown || wasd.up.isDown;
    const down = cursors.down.isDown || wasd.down.isDown;
    if (left) return { dx: -1, dy: 0 };
    if (right) return { dx: 1, dy: 0 };
    if (up) return { dx: 0, dy: -1 };
    if (down) return { dx: 0, dy: 1 };
    return { dx: 0, dy: 0 };
  },

  executeMove(scene, dx, dy) {
    let targetX = Phaser.Math.Wrap(
      scene.player.x + dx * LANE_DATA.TILE_SIZE,
      LANE_DATA.TILE_SIZE / 2,
      scene.gameWidth - LANE_DATA.TILE_SIZE / 2
    );
    if (scene.ridingEntity) {
      const carryOffset = scene.ridingEntity.speed * (GameConfig.moveDuration / 1000);
      targetX += carryOffset;
    }
    const maxY = scene.gameHeight - LANE_DATA.TILE_SIZE / 2;
    const minY = LANE_DATA.TILE_SIZE / 2;
    const targetY = Phaser.Math.Clamp(scene.player.y + dy * LANE_DATA.TILE_SIZE, minY, maxY);

    scene.playerMoving = true;
    scene.lastMoveTime = scene.time.now;

    const entityStartX = scene.ridingEntity ? scene.ridingEntity.x : null;

    scene.tweens.add({
      targets: scene.player,
      x: targetX,
      y: targetY,
      duration: GameConfig.moveDuration,
      ease: 'Linear',
      onStop: () => {
        scene.playerMoving = false;
      },
      onComplete: () => {
        scene.playerMoving = false;
        if (scene.ridingEntity && entityStartX !== null) {
          const entity = scene.ridingEntity;
          const actualDelta = entity.x - entityStartX;
          const expectedDelta = entity.speed * (GameConfig.moveDuration / 1000);
          scene.player.x = targetX + (actualDelta - expectedDelta);
        } else {
          scene.player.x = targetX;
        }
        scene.player.y = targetY;
        scene.onPlayerMoved(dx, dy);
      }
    });
  },

  handlePlayerMove(scene, time) {
    if (!scene.gameActive || scene.playerMoving) return;

    const { dx, dy } = this.getKeyboardInput(scene.cursors, scene.wasd);
    if (dx === 0 && dy === 0) return;
    if (time - scene.lastMoveTime < GameConfig.moveCooldown) return;

    this.executeMove(scene, dx, dy);
  }
};
