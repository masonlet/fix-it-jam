import { DEPTH } from "../config/Depth";
import { TAP } from "../config/minigames/Tap";

export class TapMinigame {
  constructor (scene, cx, cy, onComplete) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.remaining = TAP.LAYOUT.BOX_COUNT;

    const width = scene.scale.width;
    const boxSize = width * TAP.LAYOUT.BOX_SIZE_PCT;
    const spacing = width * TAP.LAYOUT.BOX_SPACING_PCT;
    const totalWidth = spacing * (TAP.LAYOUT.BOX_COUNT - 1);
    const startX = cx - totalWidth / 2;

    this.boxes = [];
    for (let i = 0; i < TAP.LAYOUT.BOX_COUNT; i++) {
      const box = scene.add.rectangle(
        startX + i * spacing, cy,
        boxSize, boxSize,
        TAP.COLOUR.FAULT_FILL
      ).setStrokeStyle(TAP.LAYOUT.BOX_STROKE_WIDTH, TAP.COLOUR.FAULT_STROKE)
       .setDepth(DEPTH.MINIGAME)
       .setInteractive();

      box.on("pointerdown", () => this.#hit(box));
      this.boxes.push(box);
    }
  }

  #hit (box) {
    if (box.fixed) return;
    box.fixed = true;
    box.setFillStyle(TAP.COLOUR.FIXED_FILL);
    box.setStrokeStyle(TAP.LAYOUT.BOX_STROKE_WIDTH, TAP.COLOUR.FIXED_STROKE);
    this.remaining--;
    if (this.remaining <= 0) this.onComplete();
  }

  destroy () {
    this.boxes.forEach(b => b.destroy());
  }

  onResize (width, height) {
    const boxSize = width * TAP.LAYOUT.BOX_SIZE_PCT;
    const spacing = width * TAP.LAYOUT.BOX_SPACING_PCT;
    const totalWidth = spacing * (TAP.LAYOUT.BOX_COUNT - 1);
    const startX = width / 2 - totalWidth / 2;
    this.boxes.forEach((box, i) => {
      box.setPosition(startX + i * spacing, height / 2);
      box.setSize(boxSize, boxSize);
    });
  }
}
