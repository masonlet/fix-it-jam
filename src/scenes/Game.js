import { Scene } from "phaser";

export class Game extends Scene {
  constructor () {
    super("Game");
  }

  create () {
    // Variables
    this.score = 0;
    this.lives = 10;
    this.combo = 0;
    this.elapsedTime = 0;
    this.beltSpeed = 1;
    this.activeMinigame = null;

    const { width, height } = this.scale;

    // Lives
    this.livesText = this.add.text(width * 0.3, 20, this.getLivesDisplay(), {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5, 0);

    // Score
    this.scoreText = this.add.text(width * 0.7, 20, `Score: ${this.score}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5, 0);

    // Conveyor Belt
    const beltHeight = height * 0.15;
    this.belt = this.add.tileSprite(
      width / 2, height - beltHeight / 2,
      width, beltHeight,
      "belt-tile"
    );

    // Item spawning system
    this.items = [];
    this.spawnTimer = 0;
    this.spawnInterval = 3;
    
    // Minigames
    this.input.on("pointerdown", (pointer) => {
      if (this.activeMinigame) {
        this.fixItem();
        return;
      }

      for (const item of this.items) {
        if (item.sprite.getBounds().contains(pointer.x, pointer.y)) {
          this.openMinigame(item);
          break;
        }
      }
    });

    // Resizing
    this.scale.on("resize", this.handleResize, this);
  }

  update (time, delta) {
    this.elapsedTime += delta / 1000;

    // Update belt movement
    this.belt.tilePositionX += this.beltSpeed * 2;

    // Spawn items
    this.spawnTimer += delta / 1000;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnItem();
    }

    // Move items along belt
    const { width } = this.scale;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.paused) continue;
      item.sprite.x -= this.beltSpeed * 2;

      // Check for items reaching the left edge
      if (item.sprite.x < -50) {
        this.loseLife(item.faults);
        item.sprite.destroy();
        this.items.splice(i, 1);
      }
    }

    if (this.activeMinigame && this.minigameTimeLeft > 0) {
      this.minigameTimeLeft -= delta / 1000;
      const pct = Math.max(0, this.minigameTimeLeft / this.minigameTimeMax);
      this.timerBar.setScale(pct, 1);

      if (this.minigameTimeLeft <= 0) this.failMinigame();
    }

    // Difficulty ramping based on this.elapsedTime
    this.beltSpeed = 1 + (this.elapsedTime / 60);
    this.spawnInterval = Math.max(1.5, 3 - (this.elapsedTime / 40));
    if (!this.activeMinigame) {
      this.minigameTimeMax = Math.max(1.5, 3 - (this.elapsedTime / 60));
    }
  }

  getLivesDisplay() {
    return '⚡'.repeat(this.lives);
  }

  loseLife (count = 1) {
    this.lives = Math.max(0, this.lives - count);
    this.livesText.setText(this.getLivesDisplay());

    if (this.lives <= 0) this.gameOver();
  }

  addScore (points) {
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  spawnItem () {
    const { width, height } = this.scale;
    const beltHeight = height * 0.15;
    const beltTop = height - beltHeight;

    let maxFaults = 1;
    if (this.elapsedTime > 90) maxFaults = 3;
    else if (this.elapsedTime > 45) maxFaults = 2;

    const faults = Phaser.Math.Between(1, maxFaults);
    const totalFaults = faults;
    const container = this.add.container(width + 50, beltTop - 40);
    const bg = this.add.rectangle(0, 0, 80, 80, 0x444444).setStrokeStyle(2, 0x888888);
    container.add(bg);

    const indicators = [];
    for (let i = 0; i < faults; i++) {
      const y = -20 + (i * 20);
      const indicator = this.add.rectangle(0, y, 50, 14, 0xff4444).setStrokeStyle(1, 0xcc0000);
      container.add(indicator);
      indicators.push(indicator);
    }

    container.setSize(80, 80);
    container.setInteractive();

    this.items.push({ sprite: container, faults, totalFaults, indicators });
  }

  openMinigame (item ) {
    this.activeMinigame = item;
    item.paused = true;

    const { width, height } = this.scale;

    this.overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5).setDepth(10);

    this.popup = this.add.rectangle(width / 2, height / 2, 200, 150, 0x333333).setDepth(11).setStrokeStyle(2, 0x00cc66);

    this.popupText = this.add.text(width / 2, height / 2, "TAP TO FIX!", {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#00cc66",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(12);

    const barWidth = 160;
    this.timerBarBg = this.add.rectangle(width / 2, height / 2 + 40, barWidth, 12, 0x222222).setDepth(12);
    this.timerBar = this.add.rectangle(width / 2 - barWidth / 2, height / 2 + 40, barWidth, 12, 0x00cc66).setOrigin(0, 0.5).setDepth(13);

    this.minigameTimeLeft = 3;
    this.minigameTimeMax = 3;
  }

  failMinigame () {
    if (!this.activeMinigame) return;

    this.activeMinigame.paused = false;
    this.closeMinigame();
  }

  closeMinigame () {
    this.overlay.destroy();
    this.popup.destroy();
    this.popupText.destroy();
    this.timerBarBg.destroy();
    this.timerBar.destroy();
    this.activeMinigame = null;
  }

  fixItem () {
    if (!this.activeMinigame) return;

    const item = this.activeMinigame;
    item.faults--;

    const fixedIndex = item.totalFaults - item.faults - 1;
    if (item.indicators[fixedIndex]) {
      item.indicators[fixedIndex].setFillStyle(0x00cc66);
      item.indicators[fixedIndex].setStrokeStyle(1, 0x009944);
    }

    if (item.faults <= 0) {
      this.addScore(100 * item.totalFaults);
      item.sprite.destroy();
      this.items.splice(this.items.indexOf(item), 1);
    }
    else item.paused = false;

    this.closeMinigame();
  }

  gameOver () {
    this.scene.start("GameOver", {
      score: this.score,
      time: Math.floor(this.elapsedTime)
    });
  }

  handleResize (gameSize) {
    const { width, height } = gameSize;

    // Lives & Score
    this.livesText.setPosition(width * 0.3, 20);
    this.scoreText.setPosition(width * 0.7, 20);

    // Conveyor Belt
    const beltHeight = height * 0.15;
    this.belt.setPosition(width / 2, height - beltHeight / 2);
    this.belt.setSize(width, beltHeight);

    // Items
    
    // Minigames
  }

  shutdown () {
    this.scale.off("resize", this.handleResize, this);
  }
}
