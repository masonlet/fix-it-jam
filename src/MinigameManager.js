export class MinigameManager {
  constructor (scene) {
    this.scene      = scene;
    this.timeMax    = 3;
    this.timeLeft   = 0;
    this.activeItem = null;
    this.overlay    = null;
    this.popup      = null;
    this.popupText  = null;
    this.timerBarBg = null;
    this.timerBar   = null;
  }

  get isActive () {
    return this.activeItem !== null;
  }

  open (item) {
    this.activeItem = item;
    item.paused = true;

    const { width, height } = this.scene.scale;

    this.overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5).setDepth(10);

    this.popup = this.scene.add.rectangle(width / 2, height / 2, 200, 150, 0x333333).setDepth(11).setStrokeStyle(2, 0x00cc66);

    this.popupText = this.scene.add.text(width / 2, height / 2, "TAP TO FIX!", {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#00cc66",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(12);

    const barWidth = 160;
    this.timerBarBg = this.scene.add.rectangle(width / 2, height / 2 + 40, barWidth, 12, 0x222222).setDepth(12);
    this.timerBar = this.scene.add.rectangle(width / 2 - barWidth / 2, height / 2 + 40, barWidth, 12, 0x00cc66).setOrigin(0, 0.5).setDepth(13);

    this.timeLeft = this.timeMax;
  }

  update (delta) {
    if (!this.activeItem || this.timeLeft <= 0) return;

    this.timeLeft -= delta / 1000;
    const pct = Math.max(0, this.timeLeft / this.timeMax);
    this.timerBar.setScale(pct, 1);

    if (this.timeLeft <= 0) {
      this.fail();
      return { failed: true };
    }

    return null;
  }

  fix () {
    if (!this.activeItem) return;

    const item = this.activeItem;
    item.faults--;

    const fixedIndex = item.totalFaults - item.faults - 1;
    if (item.indicators[fixedIndex]) {
      item.indicators[fixedIndex].setFillStyle(0x00cc66);
      item.indicators[fixedIndex].setStrokeStyle(1, 0x009944);
    }

    const result = { fixed: true, complete: item.faults <= 0, item };
    if (!result.complete) item.paused = false;
    
    this.close();
    return result;
  }

  fail () {
    if (!this.activeItem) return;

    this.activeItem.paused = false;
    this.close();
  }

  close () {
    this.overlay.destroy();
    this.popup.destroy();
    this.popupText.destroy();
    this.timerBarBg.destroy();
    this.timerBar.destroy();
    this.activeItem = null;
  }
}

