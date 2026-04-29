// Rolling-Frogger - Character Roster System
// Manages character unlock/equip state with save system persistence

const CharacterRoster = {
  STORAGE_KEY: 'characters',
  _characters: null,

  init() {
    if (this._characters !== null) return this._characters;

    const saved = SaveSystem.load(this.STORAGE_KEY);
    this._characters = this.loadCharacters(saved);
    return this._characters;
  },

  loadCharacters(saved) {
    const chars = [];
    if (saved && Array.isArray(saved.chars)) {
      for (const sd of saved.chars) {
        const char = Character.fromJSON(sd);
        if (char) chars.push(char);
      }
    }

    // Fill in any missing characters with defaults
    for (const data of CHARACTER_DATA.roster) {
      if (!chars.find(c => c.id === data.id)) {
        const isDefault = data.unlockCost === 0;
        chars.push(new Character(data, isDefault, isDefault));
      }
    }

    // Ensure exactly one character is equipped
    const equipped = chars.find(c => c.equipped);
    if (!equipped) {
      const student = chars.find(c => c.id === 'student');
      if (student) student.equip();
    }

    return chars;
  },

  _getChar(id) {
    return this._characters.find(c => c.id === id) || null;
  },

  getCharacter(id) {
    return this._getChar(id);
  },

  getUnlockedCharacters() {
    return this._characters.filter(c => c.isUnlocked());
  },

  getEquippedCharacter() {
    return this._characters.find(c => c.equipped) || this._characters[0];
  },

  getEquippedId() {
    return this.getEquippedCharacter().id;
  },

  getEquippedSpriteKey() {
    return this.getEquippedCharacter().spriteKey;
  },

  unlockCharacter(id, currency) {
    const char = this._getChar(id);
    if (!char || char.isUnlocked()) return false;
    if (!char.canUnlock(currency)) return false;

    char.unlock();
    this.saveCharacters();
    return true;
  },

  equipCharacter(id) {
    const char = this._getChar(id);
    if (!char || !char.isUnlocked()) return false;

    // Unequip all others
    this._characters.forEach(c => { c.equipped = false; });
    char.equip();
    this.saveCharacters();
    return true;
  },

  saveCharacters() {
    const data = {
      version: 1,
      chars: this._characters.map(c => c.toJSON()),
    };
    SaveSystem.save(this.STORAGE_KEY, data);
  },

  resetProgress() {
    // Keep only the default character unlocked and equipped
    this._characters = [];
    const studentData = CHARACTER_DATA.get('student');
    this._characters.push(new Character(studentData, true, true));

    // Unlock nothing else
    for (const data of CHARACTER_DATA.roster) {
      if (data.id !== 'student') {
        this._characters.push(new Character(data, false, false));
      }
    }

    this.saveCharacters();

    // Also clear currency and progress
    SaveSystem.delete('progress');
  },
};
