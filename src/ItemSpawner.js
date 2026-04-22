import { TUNING } from "./config/Tuning";
import { LAYOUT, DEPTH } from "./config/Layout";
import { COLORS } from "./config/Colors";
import { MINIGAME_TYPES } from "./config/MinigameTypes";

export class ItemSpawner {
  constructor (scene) {
    this.scene = scene;
    this.items = [];
    this.spawnTimer = 0;
    this.spawnInterval = TUNING.SPAWN_INTERVAL_START;
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
    const beltHeight = height * LAYOUT.BELT_HEIGHT_PCT;
    const beltTop = height - beltHeight;

    let maxFaults = 1;
    if      (elapsedTime > TUNING.FAULTS_TIER_3_AT) maxFaults = 3;
    else if (elapsedTime > TUNING.FAULTS_TIER_2_AT) maxFaults = 2;

    const faults = Phaser.Math.Between(1, maxFaults);
    const totalFaults = faults;

    const container = this.scene.add.container(
      width + LAYOUT.ITEM_SPAWN_X_OFFSET,
      beltTop - LAYOUT.ITEM_Y_OFFSET
    ).setDepth(DEPTH.ITEMS);
    const bg = this.scene.add.rectangle(
      0, 0, LAYOUT.ITEM_SIZE, LAYOUT.ITEM_SIZE, COLORS.ITEM_FILL
    ).setStrokeStyle(LAYOUT.ITEM_STROKE_WIDTH, COLORS.ITEM_STROKE);
    container.add(bg);

    const indicators = [];
    for (let i = 0; i < faults; i++) {
      const y = LAYOUT.INDICATOR_Y_START + (i * LAYOUT.INDICATOR_SPACING);
      const indicator = this.scene.add.rectangle(
        0, y,
        LAYOUT.INDICATOR_WIDTH, LAYOUT.INDICATOR_HEIGHT,
        COLORS.FAULT_FILL
      ).setStrokeStyle(LAYOUT.INDICATOR_STROKE_WIDTH, COLORS.FAULT_STROKE);
      container.add(indicator);
      indicators.push(indicator);
    }

    container.setSize(LAYOUT.ITEM_SIZE, LAYOUT.ITEM_SIZE);

    this.items.push({ sprite: container, faults, totalFaults, indicators, minigameType: MINIGAME_TYPES.TEMPLATE });
  }

  moveItems (beltSpeed, delta) {
    let missedFaults = 0;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.paused) continue;
      item.sprite.x -= beltSpeed * TUNING.BELT_BASE_PX_PER_SEC * (delta / 1000);
      if (item.sprite.x < LAYOUT.ITEM_DESPAWN_X) {
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
    const y = height - height * LAYOUT.BELT_HEIGHT_PCT - LAYOUT.ITEM_Y_OFFSET;
    for (const item of this.items) item.sprite.y = y;
  }
}

