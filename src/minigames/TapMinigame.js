import { DEPTH } from "../config/Depth";
import { TAP } from "../config/minigames/Tap";

export class TapMinigame {
  static useDefaultPopup = false;

  constructor (scene, cx, cy, onComplete) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.remaining = TAP.LAYOUT.BOX_COUNT;

    const width = scene.scale.width;
    const bgSize = width * TAP.LAYOUT.BG_SIZE_PCT;
    const boxSize = width * TAP.LAYOUT.BOX_SIZE_PCT;
    const spacing = width * TAP.LAYOUT.BOX_SPACING_PCT;
    const totalWidth = spacing * (TAP.LAYOUT.BOX_COUNT - 1);
    const startX = cx - totalWidth / 2;
    const buttonY = cy + bgSize * TAP.LAYOUT.BUTTON_Y_OFFSET_PCT;

    this.bg = scene.add.image(cx, cy, "tap-walkie")
      .setDisplaySize(bgSize, bgSize)
      .setDepth(DEPTH.MINIGAME);

    this.boxes = [];
    for (let i = 0; i < TAP.LAYOUT.BOX_COUNT; i++) {
      const box = scene.add.image(startX + i * spacing, buttonY, "tap-fault")
        .setDisplaySize(boxSize, boxSize)
        .setDepth(DEPTH.MINIGAME)
        .setInteractive();

      box.on("pointerdown", () => this.#hit(box));
      this.boxes.push(box);
    }
  }

  #hit (box) {
    if (box.fixed) return;
    box.fixed = true;
    box.setTexture("tap-fixed");
    this.scene.audio.play("tap-button");
    this.remaining--;
    if (this.remaining <= 0) {
      this.scene.audio.play("tap-complete");
      this.onComplete();
    }
  }

  destroy () {
    this.bg.destroy();
    this.boxes.forEach(b => b.destroy());
  }

  onResize (width, height) {
    const cx = width / 2;
    const cy = height / 2;
    const bgSize = width * TAP.LAYOUT.BG_SIZE_PCT;
    const boxSize = width * TAP.LAYOUT.BOX_SIZE_PCT;
    const spacing = width * TAP.LAYOUT.BOX_SPACING_PCT;
    const totalWidth = spacing * (TAP.LAYOUT.BOX_COUNT - 1);
    const startX = cx - totalWidth / 2;
    const buttonY = cy + bgSize * TAP.LAYOUT.BUTTON_Y_OFFSET_PCT;
    
    this.bg.setPosition(cx, cy).setDisplaySize(bgSize, bgSize);
    this.boxes.forEach((box, i) => {
      box.setPosition(startX + i * spacing, buttonY);
      box.setDisplaySize(boxSize, boxSize);
    });
  }
}
