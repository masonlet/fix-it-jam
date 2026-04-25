import { DEPTH } from "../config/Depth";

const LAYOUT = {
  BOX_COUNT: 3,
  BOX_SIZE_PCT: 0.1,
  BOX_SPACING_PCT: 0.15,
  BG_SIZE_PCT: 0.5,
  BUTTON_Y_OFFSET_PCT: 0.2,
}

export class TapMinigame {
  static useDefaultPopup = false;

  constructor (scene, cx, cy, onComplete) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.remaining = LAYOUT.BOX_COUNT;

    const width = scene.scale.width;
    const bgSize = width * LAYOUT.BG_SIZE_PCT;
    const boxSize = width * LAYOUT.BOX_SIZE_PCT;
    const spacing = width * LAYOUT.BOX_SPACING_PCT;
    const totalWidth = spacing * (LAYOUT.BOX_COUNT - 1);
    const startX = cx - totalWidth / 2;
    const buttonY = cy + bgSize * LAYOUT.BUTTON_Y_OFFSET_PCT;

    this.bg = scene.add.image(cx, cy, "tap-walkie")
      .setDisplaySize(bgSize, bgSize)
      .setDepth(DEPTH.MINIGAME);

    this.boxes = [];
    for (let i = 0; i < LAYOUT.BOX_COUNT; i++) {
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
    const bgSize = width * LAYOUT.BG_SIZE_PCT;
    const boxSize = width * LAYOUT.BOX_SIZE_PCT;
    const spacing = width * LAYOUT.BOX_SPACING_PCT;
    const totalWidth = spacing * (LAYOUT.BOX_COUNT - 1);
    const startX = cx - totalWidth / 2;
    const buttonY = cy + bgSize * LAYOUT.BUTTON_Y_OFFSET_PCT;
    
    this.bg.setPosition(cx, cy).setDisplaySize(bgSize, bgSize);
    this.boxes.forEach((box, i) => {
      box.setPosition(startX + i * spacing, buttonY);
      box.setDisplaySize(boxSize, boxSize);
    });
  }
}
