import { TemplateMinigame } from "./minigames/TemplateMinigame";
import { TUNING } from "./config/Tuning";
import { LAYOUT, DEPTH } from "./config/Layout";
import { COLORS } from "./config/Colors";
import { MINIGAME_TYPES } from "./config/MinigameTypes";

const MINIGAMES = {
  [MINIGAME_TYPES.TEMPLATE]: TemplateMinigame,
};

export class MinigameManager {
  constructor (scene) {
    this.scene = scene;
    this.timeMax  = TUNING.MINIGAME_TIME_MAX_START;
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
    this.overlay = this.scene.add.rectangle(
      width / 2, height / 2, width, height,
      COLORS.OVERLAY_FILL, COLORS.OVERLAY_ALPHA
    ).setDepth(DEPTH.OVERLAY);

    // Popup
    this.popup = this.scene.add.rectangle(
      width / 2, height / 2,
      LAYOUT.POPUP_WIDTH, LAYOUT.POPUP_HEIGHT,
      COLORS.POPUP_FILL
    ).setDepth(DEPTH.POPUP)
     .setStrokeStyle(LAYOUT.POPUP_STROKE_WIDTH, COLORS.POPUP_STROKE);

    // Timer
    const barWidth = width * LAYOUT.TIMER_BAR_WIDTH_PCT;
    this.timerBarBg = this.scene.add.rectangle(
      width / 2, height - LAYOUT.TIMER_BAR_Y_OFFSET,
      barWidth, LAYOUT.TIMER_BAR_HEIGHT,
      COLORS.TIMER_BG_FILL
    ).setStrokeStyle(LAYOUT.TIMER_BAR_STROKE_WIDTH, COLORS.TIMER_BG_STROKE)
     .setDepth(DEPTH.TIMER_BG);

    this.timerBar = this.scene.add.rectangle(
      width / 2 - barWidth / 2, height - LAYOUT.TIMER_BAR_Y_OFFSET,
      barWidth, LAYOUT.TIMER_BAR_HEIGHT,
      COLORS.TIMER_BAR_FILL
    ).setOrigin(0, 0.5).setDepth(DEPTH.TIMER_BAR);

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
      item.indicators[fixedIndex].setFillStyle(COLORS.FIXED_FILL);
      item.indicators[fixedIndex].setStrokeStyle(LAYOUT.INDICATOR_STROKE_WIDTH, COLORS.FIXED_STROKE);
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
    const barWidth = width * LAYOUT.TIMER_BAR_WIDTH_PCT;
    this.overlay.setPosition(width / 2, height / 2).setSize(width, height);
    this.popup.setPosition(width / 2, height / 2);
    this.timerBarBg.setPosition(width / 2, height - LAYOUT.TIMER_BAR_Y_OFFSET).setSize(barWidth, LAYOUT.TIMER_BAR_HEIGHT);
    this.timerBar.setPosition(width / 2 - barWidth / 2, height - LAYOUT.TIMER_BAR_Y_OFFSET).setSize(barWidth, LAYOUT.TIMER_BAR_HEIGHT);
    const pct = Math.max(0, this.timeLeft / this.timeMax);
    this.timerBar.setScale(pct, 1);
    this.currentMinigame?.onResize?.(width, height);
  }
}

