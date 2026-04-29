// Rolling-Frogger - Goal Bay Entity
// Represents a single goal bay slot in the school lane

class GoalBay {
  constructor(index, x, y, scene) {
    this.index = index;
    this.x = x;
    this.y = y;
    this.filled = false;
    this.scene = scene;
    this.sprite = null;
    this.createSprite();
  }

  createSprite() {
    this.sprite = this.scene.add.image(this.x, this.y, 'tile_school')
      .setAlpha(0.3)
      .setDepth(5);
    this.sprite.setInteractive();
  }

  fill() {
    this.filled = true;
  }

  isEmpty() {
    return !this.filled;
  }

  getSprite() {
    return this.sprite;
  }

  updateVisuals() {
    if (!this.sprite) return;
    if (this.filled) {
      this.sprite.setAlpha(1);
      this.sprite.setTint(0x44ff88);
    } else {
      this.sprite.setAlpha(0.3);
      this.sprite.clearTint();
    }
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}
