import { LAYOUT, DEPTH } from "../config/Layout";
import { COLORS } from "../config/Colors";

export class TemplateMinigame {
  constructor (scene, cx, cy, onComplete) {
    this.scene = scene;
    this.onComplete = onComplete;

    this.text = scene.add.text(cx, cy, "TAP TO FIX!", {
      fontFamily: "Arial",
      fontSize: LAYOUT.MINIGAME_FONT_SIZE,
      color: COLORS.TEXT_MINIGAME,
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(DEPTH.MINIGAME).setInteractive();

    this.text.on("pointerdown", () => this.onComplete());
  }

  destroy () {
    this.text.destroy();
  }

  onResize (width, height) {
    this.text.setPosition(width / 2, height / 2);
  }
}
