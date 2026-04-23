import { HUD } from "./config/Hud";

export class Hud {
  constructor (scene) {
    this.scene = scene;
    this.lives = 0;
    this.width = scene.scale.width;

    this.livesText = scene.add.text(this.width * HUD.LAYOUT.LIVES_X_PCT, HUD.LAYOUT.Y, "", {
      fontFamily: "Arial",
      fontSize: HUD.LAYOUT.LIVES_FONT_SIZE,
      color: HUD.COLOUR.LIVES
    }).setOrigin(0.5, 0);

    this.scoreText = scene.add.text(this.width * HUD.LAYOUT.SCORE_X_PCT, HUD.LAYOUT.Y, "", {
      fontFamily: "Arial",
      fontSize: HUD.LAYOUT.SCORE_FONT_SIZE,
      color: HUD.COLOUR.SCORE
    }).setOrigin(0.5, 0);
  }

  setLives (lives) {
    this.lives = lives;
    this.livesText.setText(this.#livesDisplay());
  }

  #livesDisplay () {
  return this.width < HUD.LAYOUT.COMPACT_WIDTH
    ? `⚡ ${this.lives}`
    : "⚡".repeat(this.lives);
  }

  setScore (score) {
    this.scoreText.setText(`Score: ${score}`);
  }

  handleResize (width) {
    this.width = width;
    this.livesText.setPosition(width * HUD.LAYOUT.LIVES_X_PCT, HUD.LAYOUT.Y);
    this.scoreText.setPosition(width * HUD.LAYOUT.SCORE_X_PCT, HUD.LAYOUT.Y);
    this.livesText.setText(this.#livesDisplay());
  }
}
