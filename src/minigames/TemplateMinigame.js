import { DEPTH } from "../config/Depth";
import { TEMPLATE } from "../config/minigames/Template";

export class TemplateMinigame {
  constructor (scene, cx, cy, onComplete) {
    this.scene = scene;
    this.onComplete = onComplete;

    this.text = scene.add.text(cx, cy, "TAP TO FIX!", {
      fontFamily: "Arial",
      fontSize: TEMPLATE.LAYOUT.FONT_SIZE,
      color: TEMPLATE.COLOUR.TEXT,
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
