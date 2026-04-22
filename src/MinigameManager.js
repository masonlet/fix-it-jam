import { TemplateMinigame } from "./minigames/TemplateMinigame";

const MINIGAMES = {
  template: TemplateMinigame,
};

export class MinigameManager {
  constructor (scene) {
    this.scene = scene;
    this.timeMax  = 3;
    this.timeLeft = 0;
    this.activeItem      = null;
    this.currentMinigame = null;
    this.overlay    = null;
    this.popup      = null;
    this.timerBarBg = null;
    this.timerBar   = null;
  }

  get isActive () {
    return this.activeItem !== null;
  }

  open (item) {
    const { width, height } = this.scene.scale;
    this.activeItem = item;
    item.paused = true;

    // Overlay
    this.overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5).setDepth(10);

    // Popup
    this.popup = this.scene.add.rectangle(width / 2, height / 2, 200, 150, 0x333333).setDepth(11).setStrokeStyle(2, 0x00cc66);

    // Timer
    const barWidth = width * 0.6;
    this.timerBarBg = this.scene.add.rectangle(width / 2, height - 20, barWidth, 14, 0x222222).setStrokeStyle(2, 0x444444).setDepth(12);
    this.timerBar = this.scene.add.rectangle(width / 2 - barWidth / 2, height - 20, barWidth, 14, 0x00cc66).setOrigin(0, 0.5).setDepth(13);

    // Minigame
    const MinigameClass = MINIGAMES[item.minigameType] || TemplateMinigame;
    this.currentMinigame = new MinigameClass(
      this.scene,
      width / 2, height / 2,
      () => this.fix()
    );

    this.timeLeft = this.timeMax;
  }

  update (delta) {
    if (!this.activeItem || this.timeLeft <= 0) return;
    if (this.currentMinigame?.update) this.currentMinigame.update(delta);
    if (!this.activeItem) return;

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
    else if (this.scene.onFixComplete) this.scene.onFixComplete(result);

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
    this.timerBarBg.destroy();
    this.timerBar.destroy();
    this.activeItem = null;
    if (this.currentMinigame) {
      this.currentMinigame.destroy();
      this.currentMinigame = null;
    }
  }

  handleResize (width, height) {
    if (!this.activeItem) return;
    const barWidth = width * 0.6;
    this.overlay.setPosition(width / 2, height / 2).setSize(width, height);
    this.popup.setPosition(width / 2, height / 2);
    this.timerBarBg.setPosition(width / 2, height - 20).setSize(barWidth, 14);
    this.timerBar.setPosition(width / 2 - barWidth / 2, height - 20).setSize(barWidth, 14);
    const pct = Math.max(0, this.timeLeft / this.timeMax);
    this.timerBar.setScale(pct, 1);
    this.currentMinigame?.onResize?.(width, height);
  }
}

