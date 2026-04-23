import { DEPTH } from "./config/Depth";
import { BELT } from "./config/Belt";
import { ITEM } from "./config/Item";
import { GAME } from "./config/Game";
import { INDICATOR } from "./config/Indicator";
import { MINIGAME_TYPES } from "./config/MinigameTypes";

export class ItemSpawner {
  constructor (scene) {
    this.scene = scene;
    this.items = [];
    this.spawnTimer = 0;
    this.spawnInterval = GAME.TUNING.SPAWN_INTERVAL_START;
  }

  update (delta, elapsedTime) {
    this.spawnTimer += delta / 1000;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawn(elapsedTime);
    }
  }

  spawn  (elapsedTime) {
    const { width, height } = this.scene.scale;
    const beltTop = height - (height * BELT.LAYOUT.HEIGHT_PCT);

    let maxFaults = 1;
    if      (elapsedTime > GAME.TUNING.FAULTS_TIER_3_AT) maxFaults = 3;
    else if (elapsedTime > GAME.TUNING.FAULTS_TIER_2_AT) maxFaults = 2;

    const faults = Phaser.Math.Between(1, maxFaults);
    const totalFaults = faults;

    const container = this.scene.add.container(
      width + ITEM.LAYOUT.SPAWN_X_OFFSET,
      beltTop - ITEM.LAYOUT.Y_OFFSET
    ).setDepth(DEPTH.ITEMS);
    const bg = this.scene.add.rectangle(
      0, 0, ITEM.LAYOUT.SIZE, ITEM.LAYOUT.SIZE, ITEM.COLOUR.FILL
    ).setStrokeStyle(ITEM.LAYOUT.STROKE_WIDTH, ITEM.COLOUR.STROKE);
    container.add(bg);

    const indicators = [];
    for (let i = 0; i < faults; i++) {
      const y = INDICATOR.LAYOUT.Y_START + (i * INDICATOR.LAYOUT.SPACING);
      const indicator = this.scene.add.rectangle(
        0, y,
        INDICATOR.LAYOUT.WIDTH, INDICATOR.LAYOUT.HEIGHT,
        INDICATOR.COLOUR.FAULT_FILL
      ).setStrokeStyle(INDICATOR.LAYOUT.STROKE_WIDTH, INDICATOR.COLOUR.FAULT_STROKE);
      container.add(indicator);
      indicators.push(indicator);
    }

    container.setSize(ITEM.LAYOUT.SIZE, ITEM.LAYOUT.SIZE);

    this.items.push({ sprite: container, faults, totalFaults, indicators, minigameType: MINIGAME_TYPES.TEMPLATE });
  }

  moveItems (beltSpeed, delta) {
    let missedFaults = 0;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.paused) continue;
      item.sprite.x -= beltSpeed * this.scene.scale.width * BELT.TUNING.BASE_SCREENS_PER_SEC * (delta / 1000);
      if (item.sprite.x < ITEM.LAYOUT.DESPAWN_X) {
        missedFaults += item.faults;
        item.sprite.destroy();
        this.items.splice(i, 1);
      }
    }
    return missedFaults > 0 ? { missed: true, faults: missedFaults } : null;
  }

  removeItem (item) {
    item.sprite.destroy();
    this.items.splice(this.items.indexOf(item), 1);
  }

  getItemAt (x, y) {
    for (const item of this.items) 
      if (item.sprite.getBounds().contains(x, y))
        return item;

    return null;
  }

  handleResize (width, height) {
    const y = height - height * BELT.LAYOUT.HEIGHT_PCT - ITEM.LAYOUT.Y_OFFSET;
    for (const item of this.items) item.sprite.y = y;
  }
}

