export class ItemSpawner {
  constructor (scene) {
    this.scene = scene;
    this.items = [];
    this.spawnTimer = 0;
    this.spawnInterval = 3;
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
    const beltHeight = height * 0.15;
    const beltTop = height - beltHeight;

    let maxFaults = 1;
    if      (elapsedTime > 90) maxFaults = 3;
    else if (elapsedTime > 45) maxFaults = 2;

    const faults = Phaser.Math.Between(1, maxFaults);
    const totalFaults = faults;
    const container = this.scene.add.container(width + 50, beltTop - 40);
    const bg = this.scene.add.rectangle(0, 0, 80, 80, 0x444444).setStrokeStyle(2, 0x888888);
    container.add(bg);

    const indicators = [];
    for (let i = 0; i < faults; i++) {
      const y = -20 + (i * 20);
      const indicator = this.scene.add.rectangle(0, y, 50, 14, 0xff4444).setStrokeStyle(1, 0xcc0000);
      container.add(indicator);
      indicators.push(indicator);
    }

    container.setSize(80, 80);
    container.setInteractive();

    this.items.push({ sprite: container, faults, totalFaults, indicators, minigameType: "template" });
  }

  moveItems (beltSpeed, delta) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.paused) continue;
      item.sprite.x -= beltSpeed * 120 * (delta / 1000);

      // Check for items reaching the left edge
      if (item.sprite.x < -50) {
        const faults = item.faults;
        item.sprite.destroy();
        this.items.splice(i, 1);
        return { missed: true, faults };
      }
    }
    return null;
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
}

