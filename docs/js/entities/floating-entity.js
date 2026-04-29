// Rolling-Frogger - Floating Entity Base Class
// Represents a log or turtle that floats across river lanes

class FloatingEntity extends Phaser.Physics.Arcade.Image {

  constructor(scene, x, y, texture, type) {
    super(scene, x, y, texture);
    scene.physics.add.existing(this);

    this.type = type;
    this.speed = 0;
    this.direction = 1;
    this.width = 56;
    this.onWrap = null;
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
  }

  setSpeed(speed) {
    this.speed = speed;
    this.direction = speed >= 0 ? 1 : -1;
  }

  update(dt) {
    const moveAmount = this.speed * dt;
    this.x += moveAmount;

    const margin = this.width / 2 + 40;
    const left = -margin;
    const right = this.scene.gameWidth + margin;

    let wrapped = false;
    let wrapDeltaX = 0;
    if (this.direction > 0 && this.x > right) {
      wrapDeltaX = left - this.x;
      this.x = left;
      wrapped = true;
    } else if (this.direction < 0 && this.x < left) {
      wrapDeltaX = right - this.x;
      this.x = right;
      wrapped = true;
    }
    if (wrapped && this.onWrap) {
      this.onWrap(wrapDeltaX);
    }
  }

  getBounds() {
    return {
      left: this.x - this.width / 2,
      right: this.x + this.width / 2,
      top: this.y - this.height / 2,
      bottom: this.y + this.height / 2
    };
  }

  containsPlayer(player) {
    const bounds = this.getBounds();
    return (
      player.x >= bounds.left &&
      player.x <= bounds.right &&
      player.y >= bounds.top &&
      player.y <= bounds.bottom
    );
  }
}
