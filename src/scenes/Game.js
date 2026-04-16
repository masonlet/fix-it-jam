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

    const { width, height } = this.scale;

    // Lives
    this.livesText = this.add.text(width / 2, 30, this.getLivesDisplay(), {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Score
    this.scoreText = this.add.text(width / 2, height - 30, `Score: ${this.score}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Conveyor Belt
    
    // Item spawning system
    
    // Minigames

    this.scale.on("resize", this.handleResize, this);
  }

  update (time, delta) {
    this.elapsedTime += delta / 1000;

    // Update belt movement

    // Move items along belt

    // Check for items reaching the left edge

    // Difficulty ramping based on this.elapsedTime
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
    // Lives

    // Score

    // Conveyor Belt
    
    // Items
    
    // Minigames
  }

  shutdown () {
    this.scale.off("resize", this.handleResize, this);
  }
}
