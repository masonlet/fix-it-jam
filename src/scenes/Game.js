import { Scene } from "phaser";
import { ItemSpawner } from "../ItemSpawner";
import { MinigameManager } from "../MinigameManager";

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

    // Systems
    this.spawner = new ItemSpawner(this);
    this.minigame = new MinigameManager(this);

    // Input
    this.input.on("pointerdown", (pointer) => {
      if (this.minigame.isActive) return;
 
      const item = this.spawner.getItemAt(pointer.x, pointer.y);
      if (item) this.minigame.open(item);
    });

    this.onFixComplete = (result) => {
      this.addScore(100 * result.item.totalFaults);
      this.spawner.removeItem(result.item);
    }
    
    // Resizing
    this.scale.on("resize", this.handleResize, this);
  }

  update (time, delta) {
    this.elapsedTime += delta / 1000;

    // Belt
    this.belt.tilePositionX += this.beltSpeed * 2;

    // Item Spawning
    this.spawner.update(delta, this.elapsedTime);

    // Item Movement
    const missed = this.spawner.moveItems(this.beltSpeed);
    if (missed) this.loseLife(missed.faults);

    // Minigame
    this.minigame.update(delta);

    // Difficulty ramping based on this.elapsedTime
    this.beltSpeed = 1 + (this.elapsedTime / 60);
    this.spawner.spawnInterval = Math.max(1.5, 3 - (this.elapsedTime / 40));
    if (!this.minigame.isActive)
      this.minigame.timeMax = Math.max(1.5, 3 - (this.elapsedTime / 60));
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
  }

  shutdown () {
    this.scale.off("resize", this.handleResize, this);
  }
}
