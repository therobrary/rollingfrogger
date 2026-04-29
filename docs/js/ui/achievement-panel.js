// Rolling-Frogger - Achievement Panel
// Modal overlay showing achievement list

const AchievementPanel = {
  _overlay: null,
  _isOpen: false,

  init() {
    this._createOverlay();
    return this;
  },

  _createOverlay() {
    this._overlay = document.createElement('div');
    this._overlay.id = 'achievement-panel';
    this._overlay.style.cssText = `
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      z-index: 9999;
      justify-content: center;
      align-items: center;
      font-family: Arial, sans-serif;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: #1a1a2e;
      border: 2px solid #44ff88;
      border-radius: 12px;
      padding: 24px;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    `;

    const title = document.createElement('div');
    title.style.cssText = `
      font-size: 24px;
      font-weight: bold;
      color: #44ff88;
    `;
    title.textContent = 'Achievements';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      background: #333;
      border: 1px solid #555;
      color: #fff;
      font-size: 18px;
      width: 36px;
      height: 36px;
      border-radius: 6px;
      cursor: pointer;
    `;
    closeBtn.onclick = () => this.close();

    header.appendChild(title);
    header.appendChild(closeBtn);
    content.appendChild(header);

    // Progress summary
    this._summary = document.createElement('div');
    this._summary.style.cssText = `
      font-size: 13px;
      color: #88aacc;
      margin-bottom: 16px;
      padding: 8px 12px;
      background: rgba(68, 255, 136, 0.1);
      border-radius: 6px;
    `;
    content.appendChild(this._summary);

    // List container
    this._list = document.createElement('div');
    this._list.style.cssText = `
      overflow-y: auto;
      flex: 1;
    `;
    content.appendChild(this._list);

    this._overlay.appendChild(content);
    document.body.appendChild(this._overlay);
  },

  open() {
    if (!AchievementManager.getAchievements() || !AchievementManager.getAchievements().length) {
      AchievementManager.init();
    }
    this._isOpen = true;
    this._render();
    this._overlay.style.display = 'flex';
  },

  close() {
    this._isOpen = false;
    this._overlay.style.display = 'none';
  },

  _render() {
    const achievements = AchievementManager.getAchievements();
    const unlocked = AchievementManager.getUnlockedCount();
    const total = AchievementManager.getTotalCount();

    this._summary.textContent = `${unlocked} of ${total} achievements unlocked`;

    this._list.innerHTML = '';

    for (const a of achievements) {
      const item = document.createElement('div');
      const isUnlocked = a.unlocked;

      item.style.cssText = `
        padding: 12px;
        margin-bottom: 8px;
        border-radius: 8px;
        border: 1px solid ${isUnlocked ? '#44ff88' : '#333'};
        background: ${isUnlocked ? 'rgba(68, 255, 136, 0.05)' : 'rgba(0, 0, 0, 0.3)'};
        opacity: ${isUnlocked ? 1 : 0.5};
      `;

      let progressText = '';
      if (!isUnlocked && a.progress > 0) {
        progressText = `<div style="font-size: 11px; color: #88aacc; margin-top: 4px;">Progress: ${a.progress}/${a.target}</div>`;
        // Show progress bar
        const pct = Math.min(100, (a.progress / a.target) * 100);
        progressText += `<div style="height: 3px; background: #222; border-radius: 2px; margin-top: 4px;"><div style="height: 100%; width: ${pct}%; background: #44ff88; border-radius: 2px;"></div></div>`;
      }

      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="font-size: 18px;">${isUnlocked ? '🏆' : '🔒'}</div>
          <div style="flex: 1;">
            <div style="font-size: 14px; font-weight: bold; color: ${isUnlocked ? '#ffffff' : '#666'};">${a.name}</div>
            <div style="font-size: 12px; color: #888;">${a.description}</div>
            ${progressText}
          </div>
          <div style="font-size: 11px; color: #ffdd44;">+${a.reward}</div>
        </div>
      `;

      this._list.appendChild(item);
    }
  },
};
