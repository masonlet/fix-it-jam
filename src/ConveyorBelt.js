import { LAYOUT, DEPTH } from "./config/Layout";
import { TUNING } from "./config/Tuning";

export class ConveyorBelt {
  constructor (scene) {
    this.scene = scene;
    const { width, height } = scene.scale;
    const beltHeight = height * LAYOUT.BELT_HEIGHT_PCT;
    this.sprite = scene.add.tileSprite(
      width / 2, height - beltHeight / 2,
      width, beltHeight,
      "belt-tile"
    ).setDepth(DEPTH.BELT);
  }

  update (beltSpeed, delta) {
    this.sprite.tilePositionX += beltSpeed * TUNING.BELT_BASE_PX_PER_SEC * (delta / 1000);
  }

  handleResize (width, height) {
    const beltHeight = height * LAYOUT.BELT_HEIGHT_PCT;
    this.sprite.setPosition(width / 2, height - beltHeight / 2);
    this.sprite.setSize(width, beltHeight);
  }
}
