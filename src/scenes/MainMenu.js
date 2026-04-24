import { Scene } from "phaser";
import { YouTubePlayables } from "../YouTubePlayables";
import { Audio } from "../Audio";

export class MainMenu extends Scene {
  constructor () {
    super("MainMenu");
  }

  create () {
    this.audio = new Audio(this);
    this.audio.register("button", "sfx-button");

     const { width, height } = this.scale;

    // Title
    this.add.text(width / 2, height * 0.35, "FIX IT!", {
      fontFamily: "Arial",
      fontSize: "64px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // High Score
    const highScore = this.registry.get("highScore") || 0;
    this.add.text(width / 2, height * 0.5, `High Score: ${highScore}`, {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#aaaaaa"
    }).setOrigin(0.5);

    // Tap to start
    const prompt = this.add.text(width / 2, height * 0.65, "TAP TO START", {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#00cc66",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Pulse animation on the prompt
    this.tweens.add({
      targets: prompt,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    this.input.on("pointerdown", () => {
      this.audio.play("button");
      this.scene.start("Game");
    });

    YouTubePlayables.gameReady();
  }
}
