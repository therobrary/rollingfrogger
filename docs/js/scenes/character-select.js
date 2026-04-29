// Rolling-Frogger - Character Selection Scene
// Grid-based character picker with unlock and equip actions

class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  create() {
    CharacterRoster.init();
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    // Title
    this.add.text(width / 2, 40, 'SELECT CHARACTER', {
      fontSize: '32px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44ff88',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Currency display
    const currencyText = this.add.text(width / 2, 65, `Coins: ${this.getCurrency()}`, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffaa00',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this._currencyText = currencyText;

    // Character grid
    const characters = CharacterRoster.getUnlockedCharacters();
    const lockedChars = CHARACTER_DATA.roster.filter(c => !characters.find(u => u.id === c.id));
    const allChars = [...characters, ...lockedChars];

    const cols = 4;
    const cardWidth = Math.min(130, (width - 80) / cols - 10);
    const cardHeight = cardWidth * 1.3;
    const startX = (width - (cols * (cardWidth + 10) - 10)) / 2;
    const startY = 90;

    this._equipBtns = [];
    this._unlockBtns = [];
    this._cardBg = [];

    allChars.forEach((charData, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + 10) + cardWidth / 2;
      const y = startY + row * (cardHeight + 15) + cardHeight / 2;

      this.createCard(x, y, cardWidth, cardHeight, charData, index);
    });

    // Back button
    this._createBackButton(width);
  }

  createCard(x, y, w, h, charData, index) {
    const char = CharacterRoster.getCharacter(charData.id);
    const isUnlocked = char.isUnlocked();
    const isEquipped = char.equipped;
    const currency = this.getCurrency();
    const canAfford = currency >= charData.unlockCost;

    // Card background
    let bgColor = isEquipped ? 0x226644 : (isUnlocked ? 0x222244 : 0x111122);
    const bg = this.add.rectangle(x, y, w, h, bgColor)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this._cardBg.push(bg);

    // Border for equipped
    if (isEquipped) {
      bg.setStrokeStyle(3, 0x44ff88);
    }

    // Rarity border
    const rarityColor = CHARACTER_DATA.rarityColors[charData.rarity] || 0x888888;
    bg.setAlpha(1);

    // Sprite placeholder (colored circle since we use same sprite key)
    const circleColor = isEquipped ? 0x44ff88 : rarityColor;
    this.add.circle(x, y - 10, Math.min(w, h) * 0.25, circleColor).setAlpha(0.6);

    // Character name
    this.add.text(x, y + 10, charData.name, {
      fontSize: Math.max(11, w / 8) + 'px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: isEquipped ? '#44ff88' : '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Rarity label
    this.add.text(x, y + 25, charData.rarity.toUpperCase(), {
      fontSize: Math.max(9, w / 12) + 'px',
      fontFamily: 'Arial, sans-serif',
      color: rarityColor,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Description (truncated)
    const desc = charData.description.substring(0, 25) + (charData.description.length > 25 ? '...' : '');
    this.add.text(x, y + 40, desc, {
      fontSize: Math.max(8, w / 14) + 'px',
      fontFamily: 'Arial, sans-serif',
      color: '#888899',
      wordWrap: { width: w - 10 },
      align: 'center'
    }).setOrigin(0.5);

    // Button area
    const btnY = y + h / 2 - 10;
    const btnW = w - 10;
    const btnH = 24;

    if (isEquipped) {
      // Equipped label
      this.add.text(x, btnY, 'EQUIPPED', {
        fontSize: '12px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: '#44ff88',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
    } else if (isUnlocked) {
      // Equip button
      const equipBtn = this.add.rectangle(x, btnY, btnW, btnH, 0x226644)
        .setInteractive({ useHandCursor: true });
      const equipText = this.add.text(x, btnY, 'EQUIP', {
        fontSize: '12px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: '#44ff88',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      equipBtn.on('pointerover', () => equipBtn.setFillStyle(0x338855));
      equipBtn.on('pointerout', () => equipBtn.setFillStyle(0x226644));
      equipBtn.on('pointerdown', () => {
        CharacterRoster.equipCharacter(charData.id);
        this.scene.start('CharacterSelectScene');
      });
      this._equipBtns.push(equipBtn);
    } else {
      // Unlock button
      const unlockBtn = this.add.rectangle(x, btnY, btnW, btnH, canAfford ? 0x664400 : 0x333333)
        .setInteractive({ useHandCursor: true });
      const costText = `${charData.unlockCost}`;
      const unlockText = this.add.text(x, btnY, `UNLOCK\n${costText}`, {
        fontSize: '11px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: canAfford ? '#ffaa00' : '#666666',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center'
      }).setOrigin(0.5);

      unlockBtn.on('pointerover', () => {
        if (canAfford) unlockBtn.setFillStyle(0x886600);
      });
      unlockBtn.on('pointerout', () => {
        if (canAfford) unlockBtn.setFillStyle(0x664400);
        else unlockBtn.setFillStyle(0x333333);
      });
      unlockBtn.on('pointerdown', () => {
        if (this.spendCurrency(charData.unlockCost)) {
          CharacterRoster.unlockCharacter(charData.id, charData.unlockCost);
          this.scene.start('CharacterSelectScene');
        }
      });
      this._unlockBtns.push(unlockBtn);
    }
  }

  _createBackButton(width) {
    const btnX = width / 2;
    const btnY = this.scale.height - 40;

    const backBtn = this.add.rectangle(btnX, btnY, 140, 36, 0x333355)
      .setInteractive({ useHandCursor: true });
    const backText = this.add.text(btnX, btnY, 'BACK', {
      fontSize: '18px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    backBtn.on('pointerover', () => backBtn.setFillStyle(0x444466));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0x333355));
    backBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  getCurrency() {
    const progress = SaveSystem.load('progress');
    return progress ? (progress.currency || 0) : 0;
  },

  spendCurrency(amount) {
    const progress = SaveSystem.load('progress') || { currency: 0 };
    if (progress.currency < amount) return false;
    progress.currency -= amount;
    SaveSystem.save('progress', progress);
    return true;
  },
}
