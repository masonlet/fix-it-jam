import { Scene } from "phaser";
import { ItemSpawner } from "../ItemSpawner";
import { MinigameManager } from "../MinigameManager";
import { TUNING } from "../config/Tuning";
import { LAYOUT, DEPTH } from "../config/Layout";
import { COLORS } from "../config/Colors";

export class Game extends Scene {
  constructor () {
    super("Game");
  }

  create () {
    // Variables
    this.score = 0;
    this.lives = TUNING.LIVES_START;
    this.combo = 0;
    this.elapsedTime = 0;
    this.beltSpeed = TUNING.BELT_SPEED_BASE;

    const { width, height } = this.scale;

    // Lives
    this.livesText = this.add.text(width * LAYOUT.LIVES_X_PCT, LAYOUT.HUD_Y, this.getLivesDisplay(), {
      fontFamily: 'Arial',
      fontSize: LAYOUT.LIVES_FONT_SIZE,
      color: COLORS.TEXT_LIVES
    }).setOrigin(0.5, 0);

    // Score
    this.scoreText = this.add.text(width * LAYOUT.SCORE_X_PCT, LAYOUT.HUD_Y, `Score: ${this.score}`, {
      fontFamily: 'Arial',
      fontSize: LAYOUT.SCORE_FONT_SIZE,
      color: COLORS.TEXT_SCORE 
    }).setOrigin(0.5, 0);

    // Conveyor Belt
    const beltHeight = height * LAYOUT.BELT_HEIGHT_PCT;
    this.belt = this.add.tileSprite(
      width / 2, height - beltHeight / 2,
      width, beltHeight,
      "belt-tile"
    ).setDepth(DEPTH.BELT);

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
      this.addScore(TUNING.SCORE_PER_FIX * result.item.totalFaults);
      this.spawner.removeItem(result.item);
    }
    
    // Resizing
    this.scale.on("resize", this.handleResize, this);
  }

  update (time, delta) {
    this.elapsedTime += delta / 1000;

    // Belt
    this.belt.tilePositionX += this.beltSpeed * TUNING.BELT_BASE_PX_PER_SEC * (delta / 1000);

    // Item Spawning
    this.spawner.update(delta, this.elapsedTime);

    // Item Movement
    const missed = this.spawner.moveItems(this.beltSpeed, delta);
    if (missed) this.loseLife(missed.faults);

    // Minigame
    this.minigame.update(delta);

    // Difficulty ramping based on this.elapsedTime
    this.beltSpeed = TUNING.BELT_SPEED_BASE + this.elapsedTime * TUNING.BELT_SPEED_RAMP_PER_SEC;
    this.spawner.spawnInterval = Math.max(
      TUNING.SPAWN_INTERVAL_MIN,
      TUNING.SPAWN_INTERVAL_START - this.elapsedTime * TUNING.SPAWN_INTERVAL_RAMP_PER_SEC
    );
    if (!this.minigame.isActive) this.minigame.timeMax = Math.max(
      TUNING.MINIGAME_TIME_MAX_MIN,
      TUNING.MINIGAME_TIME_MAX_START - this.elapsedTime * TUNING.MINIGAME_TIME_RAMP_PER_SEC
    );
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
    this.livesText.setPosition(width * LAYOUT.LIVES_X_PCT, LAYOUT.HUD_Y);
    this.scoreText.setPosition(width * LAYOUT.SCORE_X_PCT, LAYOUT.HUD_Y);
    const beltHeight = height * LAYOUT.BELT_HEIGHT_PCT; 
    this.belt.setPosition(width / 2, height - beltHeight / 2);
    this.belt.setSize(width, beltHeight);

    this.minigame.handleResize(width, height);
    this.spawner.handleResize(width, height);
  }

  shutdown () {
    this.scale.off("resize", this.handleResize, this);
  }
}
