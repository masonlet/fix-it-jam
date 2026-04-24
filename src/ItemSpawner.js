import { DEPTH } from "./config/Depth";
import { BELT } from "./config/Belt";
import { ITEM } from "./config/Item";
import { GAME } from "./config/Game";
import { INDICATOR } from "./config/Indicator";
import { ITEM_SPRITES } from "./config/ItemSprites";
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

    const faultTypes = Array.from(
      { length: faults },
      () => Phaser.Math.RND.pick(TYPES)
    );

    const spriteKey = faults === 1 ? ITEM_SPRITES[faultTypes[0]] : null;
    let bg;
    if (spriteKey) {
      bg = this.scene.add.image(0, 0, spriteKey)
        .setDisplaySize(itemSize, itemSize);
    } else {
      bg = this.scene.add.image(0, 0, "item-background")
        .setDisplaySize(itemSize, itemSize);
    }
    container.add(bg);

    const indicators = [];
    if (!spriteKey){
      for (let i = 0; i < faults; i++) {
        const y = itemSize * INDICATOR.LAYOUT.Y_START_PCT + (i * itemSize * INDICATOR.LAYOUT.SPACING_PCT);
         const indicator = this.scene.add.image(0, y, "item-fault")
          .setDisplaySize(itemSize * INDICATOR.LAYOUT.WIDTH_PCT, itemSize * INDICATOR.LAYOUT.HEIGHT_PCT);
        container.add(indicator);
        indicators.push(indicator);
      }
    }

    container.setSize(itemSize);

    this.items.push({ sprite: container, bg, faults, totalFaults, indicators, faultTypes });
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
      item.bg.setDisplaySize(itemSize, itemSize);
      item.indicators.forEach((ind, i) => {
        ind.setPosition(0, itemSize * INDICATOR.LAYOUT.Y_START_PCT + (i * itemSize * INDICATOR.LAYOUT.SPACING_PCT));
        ind.setDisplaySize(itemSize * INDICATOR.LAYOUT.WIDTH_PCT, itemSize * INDICATOR.LAYOUT.HEIGHT_PCT);
      });
    }

    this.width = width;
    this.height = height;
  }
}

