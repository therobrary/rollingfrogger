// Rolling-Frogger - Achievement Popup
// Toast notification for achievement unlocks

const AchievementPopup = {
  _queue: [],
  _active: false,
  _container: null,

  init() {
    if (this._container) return this;
    this._container = document.createElement('div');
    this._container.id = 'achievement-popup-container';
    this._container.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    `;
    document.body.appendChild(this._container);
    return this;
  },

  show(achievement) {
    if (!achievement) return;

    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.style.cssText = `
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 2px solid #44ff88;
      border-radius: 8px;
      padding: 12px 16px;
      min-width: 260px;
      max-width: 320px;
      box-shadow: 0 4px 20px rgba(68, 255, 136, 0.3);
      opacity: 0;
      transform: translateX(100%);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: auto;
    `;

    popup.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="font-size: 20px;">🏆</div>
        <div>
          <div style="font-size: 11px; color: #44ff88; font-family: Arial, sans-serif; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Achievement Unlocked!</div>
          <div style="font-size: 15px; color: #ffffff; font-family: Arial, sans-serif; font-weight: bold; margin-top: 2px;">${achievement.name}</div>
          <div style="font-size: 12px; color: #88aacc; font-family: Arial, sans-serif; margin-top: 2px;">${achievement.description}</div>
        </div>
      </div>
      <div style="margin-top: 8px; font-size: 11px; color: #ffdd44; font-family: Arial, sans-serif;">+${achievement.reward} currency bonus</div>
    `;

    this._container.appendChild(popup);

    // Animate in
    requestAnimationFrame(() => {
      popup.style.opacity = '1';
      popup.style.transform = 'translateX(0)';
    });

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      popup.style.opacity = '0';
      popup.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (popup.parentNode) {
          popup.parentNode.removeChild(popup);
        }
      }, 300);
    }, 3000);
  },

  showBatch( unlocks) {
    for (const unlock of unlocks) {
      if (unlock && unlock.achievement) {
        this.show(unlock.achievement);
      }
    }
  },
};
