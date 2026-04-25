import { DEPTH } from "../config/Depth";

const LAYOUT = {
  CUBE_SIZE_PCT: 0.12,
  ARROW_SIZE_PCT: 0.05,
  STROKE_WIDTH: 2,
}

const TUNING = {
  SWIPE_THRESHOLD_PCT: 0.15,
  ANIM_DURATION_MS: 300,
  BOUNCE_AMPLITUDE_PCT: 0.015,
  BOUNCE_PERIOD_MS: 1000,
}

const COLOUR = {
  BROKEN_FILL: 0xff4444,
  BROKEN_STROKE: 0xcc0000,
  BROKEN_ARROW: 0xaa2222,
  FIXED_FILL: 0x00cc66,
  FIXED_STROKE: 0x009944,
  FIXED_ARROW: 0x007733,
}

export class SwipeMinigame {
  constructor (scene, cx, cy, onComplete) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.cx = cx;
    this.cy = cy;
    this.stage = 1;
    this.lastY = null;
    this.pointerDown = false;
    this.pieceOffset = 0;
    this.arrowsVisible = true;

    const { width, height } = scene.scale;
    this.cubeSize = width * LAYOUT.CUBE_SIZE_PCT;
    this.arrowSize = width * LAYOUT.ARROW_SIZE_PCT;
    this.threshold = height * TUNING.SWIPE_THRESHOLD_PCT;
    this.greenStartY = height * 0.9;

    this.#spawnRed();

    this.onPointerDown = (p) => {
      this.pointerDown = true;
      this.lastY = p.y;
    };
    this.onPointerMove = (p) => this.#handleMove(p);
    this.onPointerUp = () => {
      this.pointerDown = false;
      this.lastY = null;
    };

    scene.input.on("pointerdown", this.onPointerDown);
    scene.input.on("pointermove", this.onPointerMove);
    scene.input.on("pointerup", this.onPointerUp);
  }

  #spawnRed () {
    this.piece = this.scene.add.rectangle(
      this.cx, this.cy, this.cubeSize, this.cubeSize, COLOUR.BROKEN_FILL
    ).setStrokeStyle(LAYOUT.STROKE_WIDTH, COLOUR.BROKEN_STROKE)
     .setDepth(DEPTH.MINIGAME);

    this.arrows = this.#drawArrows(this.cx, this.cy + this.cubeSize / 2 + this.arrowSize, 1, COLOUR.BROKEN_ARROW);
    this.arrowBounceTween = this.#startBounce(this.arrows, 1);
  }

  #spawnGreen () {
    this.piece = this.scene.add.rectangle(
      this.cx, this.greenStartY, this.cubeSize, this.cubeSize, COLOUR.FIXED_FILL
    ).setStrokeStyle(LAYOUT.STROKE_WIDTH, COLOUR.FIXED_STROKE)
     .setDepth(DEPTH.MINIGAME);
    this.pieceOffset = 0;
    this.arrowsVisible = true;

    this.arrows = this.#drawArrows(this.cx, this.greenStartY - this.cubeSize / 2, -1, COLOUR.FIXED_ARROW);
    this.arrowBounceTween = this.#startBounce(this.arrows, -1);
  }

  #drawArrows (x, y, direction, color) {
    const group = this.scene.add.container(x, y).setDepth(DEPTH.MINIGAME);
    const spacing = this.arrowSize * 0.8;
    for (let i = 0; i < 3; i++) {
      const tri = this.scene.add.triangle(
        0, i * spacing * direction,
        0, 0,
        this.arrowSize, 0,
        this.arrowSize / 2, this.arrowSize * direction,
        color
      ).setOrigin(0.5, direction > 0 ? 0 : 1);
      group.add(tri);
    }
    return group;
  }

  #startBounce (arrows, direction) {
    const amplitude = this.scene.scale.height * TUNING.BOUNCE_AMPLITUDE_PCT;
    return this.scene.tweens.add({
      targets: arrows,
      y: arrows.y + amplitude * direction,
      duration: TUNING.BOUNCE_PERIOD_MS / 2,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  #hideArrows () {
    if (!this.arrowsVisible) return;
    this.arrowsVisible = false;
    this.arrowBounceTween?.stop();
    this.arrows?.destroy();
  }

  #handleMove (pointer) {
    if (!this.pointerDown) return;
    if (this.lastY !== null) {
      const delta = pointer.y - this.lastY;
      const valid = this.stage === 1 ? delta > 0 : delta < 0;
      if (valid) {
        this.pieceOffset += Math.abs(delta);
        const sign = this.stage === 1 ? 1 : -1;
        this.piece.y += delta;
        if (this.arrowsVisible) this.#hideArrows();
        if (this.pieceOffset >= this.threshold) this.#advance();
      }
    }
    this.lastY = pointer.y;
  }

  #advance () {
    this.pointerDown = false;
    this.lastY = null;
    if (this.stage === 1) {
      this.advanceTween = this.scene.tweens.add({
        targets: this.piece,
        y: this.scene.scale.height + this.cubeSize,
        duration: TUNING.ANIM_DURATION_MS,
        onComplete: () => {
          this.piece.destroy();
          this.piece = null;
          this.stage = 2;
          this.#spawnGreen();
        },
      });
    } else {
      this.advanceTween = this.scene.tweens.add({
        targets: this.piece,
        y: this.cy,
        duration: TUNING.ANIM_DURATION_MS,
        onComplete: () => this.onComplete(),
      });
    }
  }

  destroy () {
    this.scene.input.off("pointerdown", this.onPointerDown);
    this.scene.input.off("pointermove", this.onPointerMove);
    this.scene.input.off("pointerup", this.onPointerUp);
    this.arrowBounceTween?.stop();
    this.advanceTween?.stop();
    this.piece?.destroy();
    this.arrows?.destroy();
  }

  onResize (width, height) {
    this.cx = width / 2;
    this.cy = height / 2;
    this.threshold = height * TUNING.SWIPE_THRESHOLD_PCT;
  }
}
