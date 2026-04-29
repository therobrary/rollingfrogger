// Rolling-Frogger - Character Data Model
// Defines the character roster with unlock and equip logic

const CHARACTER_DATA = {
  roster: [
    { id: 'student',      name: 'Student',       unlockCost: 0,     spriteKey: 'player',     description: 'Your everyday student. Always unlocked.', rarity: 'common' },
    { id: 'teacher',      name: 'Teacher',       unlockCost: 50,    spriteKey: 'player',    description: 'A strict teacher who still drives a school bus.', rarity: 'common' },
    { id: 'principal',    name: 'Principal',     unlockCost: 150,   spriteKey: 'player',    description: 'The school principal. Very important.', rarity: 'uncommon' },
    { id: 'mascot',       name: 'Mascot',        unlockCost: 300,   spriteKey: 'player',    description: 'The West Springfield Wildcat mascot.', rarity: 'uncommon' },
    { id: 'athlete',      name: 'Athlete',       unlockCost: 500,   spriteKey: 'player',    description: 'Star athlete of the school.', rarity: 'rare' },
    { id: 'nerd',         name: 'Nerd',          unlockCost: 750,   spriteKey: 'player',    description: 'Science club president. Very smart.', rarity: 'rare' },
    { id: 'artist',       name: 'Artist',        unlockCost: 1000,  spriteKey: 'player',    description: 'Creative spirit of the school.', rarity: 'epic' },
    { id: 'musician',     name: 'Musician',      unlockCost: 1500,  spriteKey: 'player',    description: 'Band director extraodinare.', rarity: 'epic' },
  ],

  rarityColors: {
    common: '#aaaaaa',
    uncommon: '#44ff44',
    rare: '#4488ff',
    epic: '#cc44ff',
  },

  get(id) {
    return this.roster.find(c => c.id === id) || null;
  },

  getIds() {
    return this.roster.map(c => c.id);
  },
};

class Character {
  constructor(data, unlocked = false, equipped = false) {
    this.id = data.id;
    this.name = data.name;
    this.unlockCost = data.unlockCost;
    this.spriteKey = data.spriteKey;
    this.description = data.description;
    this.rarity = data.rarity;
    this.unlocked = unlocked || this.unlockCost === 0;
    this.equipped = equipped;
  }

  isUnlocked() {
    return this.unlockCost === 0 || this.unlocked;
  }

  canUnlock(currency) {
    return !this.isUnlocked() && currency >= this.unlockCost;
  }

  unlock() {
    if (this.isUnlocked()) return false;
    this.unlocked = true;
    return true;
  }

  equip() {
    this.equipped = true;
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      unlocked: this.unlocked,
      equipped: this.equipped,
    };
  }

  static fromJSON(data) {
    const charData = CHARACTER_DATA.get(data.id);
    if (!charData) return null;
    return new Character(charData, data.unlocked, data.equipped);
  }
}
