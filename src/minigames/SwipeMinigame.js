import { DEPTH } from "../config/Depth";
import { SWIPE } from "../config/minigames/Swipe";

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
    this.cubeSize = width * SWIPE.LAYOUT.CUBE_SIZE_PCT;
    this.arrowSize = width * SWIPE.LAYOUT.ARROW_SIZE_PCT;
    this.threshold = height * SWIPE.TUNING.SWIPE_THRESHOLD_PCT;
    this.greenStartY = height; // below screen

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
      this.cx, this.cy, this.cubeSize, this.cubeSize, SWIPE.COLOUR.BROKEN_FILL
    ).setStrokeStyle(SWIPE.LAYOUT.STROKE_WIDTH, SWIPE.COLOUR.BROKEN_STROKE)
     .setDepth(DEPTH.MINIGAME);

    this.arrows = this.#drawArrows(this.cx, this.cy + this.cubeSize / 2 + this.arrowSize, 1, SWIPE.COLOUR.BROKEN_ARROW);
    this.arrowBounceTween = this.#startBounce(this.arrows, 1);
  }

  #spawnGreen () {
    this.piece = this.scene.add.rectangle(
      this.cx, this.greenStartY, this.cubeSize, this.cubeSize, SWIPE.COLOUR.FIXED_FILL
    ).setStrokeStyle(SWIPE.LAYOUT.STROKE_WIDTH, SWIPE.COLOUR.FIXED_STROKE)
     .setDepth(DEPTH.MINIGAME);
    this.pieceOffset = 0;
    this.arrowsVisible = true;

    this.arrows = this.#drawArrows(this.cx, this.greenStartY - this.cubeSize / 2 - this.arrowSize, -1, SWIPE.COLOUR.FIXED_ARROW);
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
    const amplitude = this.scene.scale.height * SWIPE.TUNING.BOUNCE_AMPLITUDE_PCT;
    return this.scene.tweens.add({
      targets: arrows,
      y: arrows.y + amplitude * direction,
      duration: SWIPE.TUNING.BOUNCE_PERIOD_MS / 2,
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
        duration: SWIPE.TUNING.ANIM_DURATION_MS,
        onComplete: () => {
          this.piece.destroy();
          this.piece = null;
          this.stageDelayTimer = this.scene.time.delayedCall(SWIPE.TUNING.STAGE_DELAY_MS, () => {
            this.stage = 2;
            this.#spawnGreen();
          });
        },
      });
    } else {
      this.advanceTween = this.scene.tweens.add({
        targets: this.piece,
        y: this.cy,
        duration: SWIPE.TUNING.ANIM_DURATION_MS,
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
    this.stageDelayTimer?.remove();
    this.piece?.destroy();
    this.arrows?.destroy();
  }

  onResize (width, height) {
    this.cx = width / 2;
    this.cy = height / 2;
    this.threshold = height * SWIPE.TUNING.SWIPE_THRESHOLD_PCT;
  }
}
