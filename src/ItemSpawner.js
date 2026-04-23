import { DEPTH } from "./config/Depth";
import { BELT } from "./config/Belt";
import { ITEM } from "./config/Item";
import { GAME } from "./config/Game";
import { INDICATOR } from "./config/Indicator";
import { MINIGAME_TYPES } from "./config/MinigameTypes";
const TYPES = Object.values(MINIGAME_TYPES);

export class ItemSpawner {
  constructor (scene) {
    this.scene = scene;
    this.items = [];
    this.spawnTimer = 0;
    this.spawnInterval = GAME.TUNING.SPAWN_INTERVAL_START;
    this.width = scene.scale.width;
    this.height = scene.scale.height;
  }

  update (delta, elapsedTime) {
    this.spawnTimer += delta / 1000;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawn(elapsedTime);
    }
  }

  spawn  (elapsedTime) {
    const beltTop = this.height - (this.height * BELT.LAYOUT.HEIGHT_PCT);
    const itemSize = this.width * ITEM.LAYOUT.SIZE_PCT;

    let maxFaults = 1;
    if      (elapsedTime > GAME.TUNING.FAULTS_TIER_3_AT) maxFaults = 3;
    else if (elapsedTime > GAME.TUNING.FAULTS_TIER_2_AT) maxFaults = 2;

    const faults = Phaser.Math.Between(1, maxFaults);
    const totalFaults = faults;

    const container = this.scene.add.container(
      this.width + this.width * ITEM.LAYOUT.SPAWN_X_OFFSET_PCT,
      beltTop - itemSize / 2
    ).setDepth(DEPTH.ITEMS);

    const bg = this.scene.add.rectangle(
      0, 0, itemSize, itemSize, ITEM.COLOUR.FILL
    ).setStrokeStyle(ITEM.LAYOUT.STROKE_WIDTH, ITEM.COLOUR.STROKE);
    container.add(bg);

    const indicators = [];
    for (let i = 0; i < faults; i++) {
      const y = itemSize * INDICATOR.LAYOUT.Y_START_PCT + (i * itemSize * INDICATOR.LAYOUT.SPACING_PCT);
      const indicator = this.scene.add.rectangle(
        0, y,
        itemSize * INDICATOR.LAYOUT.WIDTH_PCT, itemSize * INDICATOR.LAYOUT.HEIGHT_PCT,
        INDICATOR.COLOUR.FAULT_FILL
      ).setStrokeStyle(INDICATOR.LAYOUT.STROKE_WIDTH, INDICATOR.COLOUR.FAULT_STROKE);
      container.add(indicator);
      indicators.push(indicator);
    }

    container.setSize(itemSize);
    this.items.push({
      sprite: container, bg, faults, totalFaults, indicators,
      minigameType: Phaser.Math.RND.pick(TYPES)
    });
  }

  moveItems (beltSpeed, delta) {
    const { width } = this.scene.scale;

    let missedFaults = 0;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.paused) continue;
      item.sprite.x -= beltSpeed * width * BELT.TUNING.BASE_SCREENS_PER_SEC * (delta / 1000);
      if (item.sprite.x < width * ITEM.LAYOUT.DESPAWN_X_PCT) {
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
    const itemSize = width * ITEM.LAYOUT.SIZE_PCT;
    const beltTop = height - height * BELT.LAYOUT.HEIGHT_PCT;
    const y = beltTop - itemSize / 2;
    const oldWidth = this.width ?? width;
    const xScale = width / oldWidth;

    for (const item of this.items) {
      item.sprite.x *= xScale;
      item.sprite.y = y;
      item.sprite.setSize(itemSize, itemSize);
      item.bg.setSize(itemSize, itemSize);
      item.indicators.forEach((ind, i) => {
        ind.setPosition(0, itemSize * INDICATOR.LAYOUT.Y_START_PCT + (i * itemSize * INDICATOR.LAYOUT.SPACING_PCT));
        ind.setSize(itemSize * INDICATOR.LAYOUT.WIDTH_PCT, itemSize * INDICATOR.LAYOUT.HEIGHT_PCT);
      });
    }

    this.width = width;
    this.height = height;
  }
}

