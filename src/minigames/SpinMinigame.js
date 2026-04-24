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
    this.hintVisible = true;
    this.lastDrawnPct = 0;

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

    // Hint
    this.hint = this.#drawHint();
    this.hintTween = this.scene.tweens.add({
      targets: this.hint,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

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
        if (this.hintVisible) this.#hideHint();
        const deltaDeg = delta * 180 / Math.PI;
        this.accumulatedDeg += deltaDeg;
        this.bolt.rotation += delta;
        const pct = Math.min(1, this.accumulatedDeg / SPIN.TUNING.REQUIRED_ROTATION_DEG);
        if (Math.abs(pct - this.lastDrawnPct) >= 0.005) {
          this.#drawRing(pct);
          this.lastDrawnPct = pct;
        }
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

  #drawHint () {
    const g = this.scene.add.graphics().setDepth(DEPTH.MINIGAME);
    const hintRadius = this.ringRadius * 1.3;
    const startAngle = -Math.PI / 2;
    const endAngle = 0;

    // Curved line
    g.lineStyle(this.ringThickness, 0xffffff);
    g.beginPath();
    g.arc(this.cx, this.cy, hintRadius, startAngle, endAngle, false);
    g.strokePath();

    // Arrowhead
    const tipX = this.cx + hintRadius * Math.cos(endAngle);
    const tipY = this.cy + hintRadius * Math.sin(endAngle);
    const arrowSize = this.ringThickness * 3;
    g.fillStyle(0xffffff);
    g.fillTriangle(
      tipX, tipY + arrowSize,
      tipX - arrowSize, tipY - arrowSize / 2,
      tipX + arrowSize, tipY - arrowSize / 2
    );

    return g;
  }

  #hideHint () {
    if (!this.hintVisible) return;
    this.hintVisible = false;
    this.hintTween?.stop();
    this.hint?.destroy();
  }

  destroy () {
    this.scene.input.off("pointerdown", this.onPointerDown);
    this.scene.input.off("pointermove", this.onPointerMove);
    this.scene.input.off("pointerup", this.onPointerUp);
    this.bolt.destroy();
    this.ring.destroy();
    this.hintTween?.stop();
    this.hint?.destroy();
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

    if (this.hintVisible) {
      this.hint?.destroy();
      this.hint = this.#drawHint();
      this.hintTween?.stop();
      this.hintTween = this.scene.tweens.add({
        targets: this.hint,
        alpha: { from: 1, to: 0.3 },
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }
}
