// Rolling-Frogger - Pickup Entity
// Base class for collectible items that appear on lanes

class Pickup extends Phaser.Physics.Arcade.Image {

  constructor(scene, x, y, texture, type, points, currencyValue) {
    super(scene, x, y, texture);
    scene.physics.add.existing(this);

    this.type = type;
    this.points = points;
    this.currencyValue = currencyValue;
    this.active = true;
    this.bobPhase = Phaser.Math.Between(0, 6.28);
    this.collectionAnim = null;

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setDepth(6);
    this.setAlpha(0.9);
  }

  update(time) {
    if (!this.active) return;

    // Gentle bobbing animation
    this.bobPhase += 0.05;
    this.setTint(0xffffff);
    const bobY = Math.sin(this.bobPhase) * 2;
    this.y += (bobY - (this._bobOffset || 0)) * 0.1;
    if (!this._bobOffset) this._bobOffset = bobY;
  }

  collect(scene) {
    if (!this.active) return null;
    this.active = false;
    this.body.enable = false;

    // Flash effect
    const flash = scene.add.rectangle(this.x, this.y, 24, 24, 0xffff88, 0.8)
      .setDepth(7).setAlpha(1);
    scene.tweens.add({
      targets: flash,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    // Points popup
    if (this.points > 0) {
      const popup = scene.add.text(this.x, this.y - 16, `+${this.points}`, {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffdd44',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(7);
      scene.tweens.add({
        targets: popup,
        y: popup.y - 30,
        alpha: 0,
        duration: 600,
        onComplete: () => popup.destroy()
      });
    }

    if (this.currencyValue > 0) {
      const coinPopup = scene.add.text(this.x + 8, this.y - 8, `+${this.currencyValue} coin`, {
        fontSize: '10px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffaa00',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(7);
      scene.tweens.add({
        targets: coinPopup,
        y: coinPopup.y - 25,
        alpha: 0,
        duration: 700,
        onComplete: () => coinPopup.destroy()
      });
    }

    // Destroy the pickup sprite
    this.destroy();
    return { type: this.type, points: this.points, currencyValue: this.currencyValue };
  }
}
