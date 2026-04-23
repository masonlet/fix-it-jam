import { DEPTH } from "../config/Depth";
import { SPIN } from "../config/minigames/Spin";

export class SpinMinigame {
  constructor (scene, cx, cy, onComplete) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.cx = cx;
    this.cy = cy;
    this.accumulatedDeg = 0;
    this.lastAngle = null;
    this.pointerDown = false;
    this.completed = false;

    const { width } = scene.scale;
    const boltSize = width * SPIN.LAYOUT.BOLT_SIZE_PCT;
    this.ringRadius = width * SPIN.LAYOUT.RING_RADIUS_PCT;
    this.ringThickness = width * SPIN.LAYOUT.RING_THICKNESS_PCT;

    // Bolt
    this.bolt = scene.add.rectangle(
      cx, cy, boltSize, boltSize, SPIN.COLOUR.BOLT_FILL
    ).setStrokeStyle(SPIN.LAYOUT.STROKE_WIDTH, SPIN.COLOUR.BOLT_STROKE)
     .setDepth(DEPTH.MINIGAME);

    // Progress ring
    this.ring = scene.add.graphics().setDepth(DEPTH.MINIGAME);
    this.#drawRing(0);

    this.onPointerDown = (p) => {
      this.pointerDown = true;
      this.lastAngle = Math.atan2(p.y - this.cy, p.x - this.cx);
    };
    this.onPointerMove = (p) => this.#handleMove(p);
    this.onPointerUp = () => {
      this.pointerDown = false;
      this.lastAngle = null;
    };

    scene.input.on("pointerdown", this.onPointerDown);
    scene.input.on("pointermove", this.onPointerMove);
    scene.input.on("pointerup", this.onPointerUp);
  }

  #handleMove (pointer) {
    if (!this.pointerDown || this.completed) return;
    const angle = Math.atan2(pointer.y - this.cy, pointer.x - this.cx);
    if (this.lastAngle !== null) {
      let delta = angle - this.lastAngle;
      // Handle wraparound
      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;
      // Only count clockwise
      if (delta > 0) {
        const deltaDeg = delta * 180 / Math.PI;
        this.accumulatedDeg += deltaDeg;
        this.bolt.rotation += delta;
        const pct = Math.min(1, this.accumulatedDeg / SPIN.TUNING.REQUIRED_ROTATION_DEG);
        this.#drawRing(pct);
        if (pct >= 1) {
          this.completed = true;
          this.onComplete();
        }
      }
    }
    this.lastAngle = angle;
  }

  #drawRing (pct) {
    this.ring.clear();
    // Background ring
    this.ring.lineStyle(this.ringThickness, SPIN.COLOUR.RING_BG);
    this.ring.strokeCircle(this.cx, this.cy, this.ringRadius);

    // Progress arc
    if (pct > 0) {
      this.ring.lineStyle(this.ringThickness, SPIN.COLOUR.RING_FILL);
      this.ring.beginPath();
      this.ring.arc(
        this.cx, this.cy, this.ringRadius,
        -Math.PI / 2,
        -Math.PI / 2 + pct * 2 * Math.PI,
        false
      );
      this.ring.strokePath();
    }
  }

  destroy () {
    this.scene.input.off("pointerdown", this.onPointerDown);
    this.scene.input.off("pointermove", this.onPointerMove);
    this.scene.input.off("pointerup", this.onPointerUp);
    this.bolt.destroy();
    this.ring.destroy();
  }

  onResize (width, height) {
    this.cx = width / 2;
    this.cy = height / 2;
    const boltSize = width * SPIN.LAYOUT.BOLT_SIZE_PCT;
    this.ringRadius = width * SPIN.LAYOUT.RING_RADIUS_PCT;
    this.ringThickness = width * SPIN.LAYOUT.RING_THICKNESS_PCT;

    this.bolt.setPosition(this.cx, this.cy).setSize(boltSize, boltSize);
    const pct = Math.min(1, this.accumulatedDeg / SPIN.TUNING.REQUIRED_ROTATION_DEG);
    this.#drawRing(pct);
  }
}
