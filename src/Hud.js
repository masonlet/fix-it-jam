import { LAYOUT } from "./config/Layout";
import { COLORS } from "./config/Colors";

export class Hud {
  constructor (scene) {
    this.scene = scene;
    const { width } = scene.scale;

    this.livesText = scene.add.text(width * LAYOUT.LIVES_X_PCT, LAYOUT.HUD_Y, "", {
      fontFamily: "Arial",
      fontSize: LAYOUT.LIVES_FONT_SIZE,
      color: COLORS.TEXT_LIVES
    }).setOrigin(0.5, 0);

    this.scoreText = scene.add.text(width * LAYOUT.SCORE_X_PCT, LAYOUT.HUD_Y, "", {
      fontFamily: "Arial",
      fontSize: LAYOUT.SCORE_FONT_SIZE,
      color: COLORS.TEXT_SCORE
    }).setOrigin(0.5, 0);
  }

  setLives (lives) {
    this.livesText.setText("⚡".repeat(lives));
  }

  setScore (score) {
    this.scoreText.setText(`Score: ${score}`);
  }

  handleResize (width) {
    this.livesText.setPosition(width * LAYOUT.LIVES_X_PCT, LAYOUT.HUD_Y);
    this.scoreText.setPosition(width * LAYOUT.SCORE_X_PCT, LAYOUT.HUD_Y);
  }
}
