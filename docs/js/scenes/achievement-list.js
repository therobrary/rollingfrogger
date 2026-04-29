// Rolling-Frogger - Achievement List Scene
// Full-screen scrollable list of all achievements

class AchievementListScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AchievementListScene' });
  }

  create() {
    AchievementManager.init();
    ChallengeManager.init();

    const { width, height } = this.scale;
    const achievements = AchievementManager.getAchievements();

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    // Title
    this.add.text(width / 2, 40, 'ACHIEVEMENTS', {
      fontSize: '32px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44ff88',
      stroke: '#003322',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Progress summary
    const unlocked = AchievementManager.getUnlockedCount();
    const total = AchievementManager.getTotalCount();
    this.add.text(width / 2, 70, `${unlocked} of ${total} unlocked`, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#88aacc',
    }).setOrigin(0.5);

    // Create scrollable container
    const scrollY = 100;
    const scrollHeight = height - 140;
    const listContainer = this.add.container(0, scrollY);

    // Clip container for scrolling
    const clipGraphics = this.add.graphics();
    clipGraphics.lineStyle(0);
    clipGraphics.fillStyle(0x111122, 1);
    clipGraphics.fillRect(-width / 2, 0, width, scrollHeight);
    listContainer.add(clipGraphics);

    const itemHeight = 70;
    const startY = 10;

    for (let i = 0; i < achievements.length; i++) {
      const a = achievements[i];
      const isUnlocked = a.unlocked;
      const y = startY + i * itemHeight;

      const itemGroup = this.add.container(0, y);
      listContainer.add(itemGroup);

      // Background
      const bg = this.add.rectangle(0, 0, width - 40, itemHeight - 10, isUnlocked ? 0x1a2a1a : 0x111111)
        .setOrigin(0.5)
        .setStrokeStyle(1, isUnlocked ? 0x44ff88 : 0x333333);
      itemGroup.add(bg);

      // Icon
      const icon = this.add.text(-width / 2 + 30, -5, isUnlocked ? '\uD83C\uDFC6' : '\uD83D\uDD12', {
        fontSize: '20px',
      });
      itemGroup.add(icon);

      // Name
      const nameText = this.add.text(-width / 2 + 60, -12, a.name, {
        fontSize: '14px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: isUnlocked ? '#ffffff' : '#555555',
      });
      itemGroup.add(nameText);

      // Description
      const descText = this.add.text(-width / 2 + 60, 6, a.description, {
        fontSize: '11px',
        fontFamily: 'Arial, sans-serif',
        color: '#888888',
        wordWrap: { width: width - 140 },
      });
      itemGroup.add(descText);

      // Reward
      const rewardText = this.add.text(width / 2 - 30, -5, `+${a.reward}`, {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffdd44',
      }).setOrigin(1, 0.5);
      itemGroup.add(rewardText);

      // Progress bar for incomplete
      if (!isUnlocked && a.progress > 0) {
        const pct = Math.min(1, a.progress / a.target);
        const barBg = this.add.rectangle(width / 2 - 30, 14, width - 140, 4, 0x222222).setOrigin(1, 0.5);
        itemGroup.add(barBg);

        const barFill = this.add.rectangle(width / 2 - 30 - ((1 - pct) * (width - 140)) / 2, 14, (width - 140) * pct, 4, 0x44ff88).setOrigin(0.5);
        itemGroup.add(barFill);

        const progText = this.add.text(width / 2 - 30, 24, `${a.progress}/${a.target}`, {
          fontSize: '10px',
          fontFamily: 'Arial, sans-serif',
          color: '#666666',
        }).setOrigin(0.5);
        itemGroup.add(progText);
      }
    }

    // Make the list container scrollable
    const maxScrollY = Math.max(0, -(startY + achievements.length * itemHeight - scrollHeight + 20));

    this.input.on('pointermove', (pointer) => {
      if (!this.input.drag) return;
      const deltaY = pointer.deltaY;
      listContainer.y = Math.max(maxScrollY, Math.min(0, listContainer.y + deltaY));
    });

    // Back button
    const backBtn = this.add.rectangle(width / 2, height - 30, 160, 36, 0x224466)
      .setInteractive({ useHandCursor: true });
    const backText = this.add.text(width / 2, height - 30, 'BACK', {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44ff88',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    backBtn.on('pointerover', () => backBtn.setFillStyle(0x336688));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0x224466));
    backBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
