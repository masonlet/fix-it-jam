import { DEPTH } from "../config/Depth";

const TUNING = {
  REQUIRED_DISTANCE_MULT: 5,
}

const LAYOUT = {
  TRACK_WIDTH_PCT: 0.1,
  TRACK_HEIGHT_PCT: 0.35,
  HANDLE_HEIGHT_PCT: 0.04,
  BAR_WIDTH_PCT: 0.04,
  BAR_GAP_PCT: 0.05,
  STROKE_WIDTH: 2,
}

const COLOUR = {
  TRACK_FILL: 0x222222,
  TRACK_STROKE: 0x888888,
  HANDLE_FILL: 0x888888,
  HANDLE_STROKE: 0xcccccc,
  BAR_BG_FILL: 0x222222,
  BAR_FILL: 0x00cc66,
}

export class PumpMinigame {
  constructor (scene, cx, cy, onComplete) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.pumpedDistance = 0;
    this.lastY = null;
    this.pointerDown = false;

    const { width, height } = scene.scale;
    const trackWidth = width * LAYOUT.TRACK_WIDTH_PCT;
    const trackHeight = height * LAYOUT.TRACK_HEIGHT_PCT;
    const handleHeight = height * LAYOUT.HANDLE_HEIGHT_PCT;
    const barWidth = width * LAYOUT.BAR_WIDTH_PCT;
    const gap = width * LAYOUT.BAR_GAP_PCT;

    this.trackTop = cy - trackHeight / 2;
    this.trackBottom = cy + trackHeight / 2;
    this.requiredDistance = trackHeight * TUNING.REQUIRED_DISTANCE_MULT;

    const trackX = cx - (trackWidth + gap + barWidth) / 2 + trackWidth / 2;
    const barX = trackX + trackWidth / 2 + gap + barWidth / 2;

    // Track
    this.track = scene.add.rectangle(
      trackX, cy, trackWidth, trackHeight, COLOUR.TRACK_FILL
    ).setStrokeStyle(LAYOUT.STROKE_WIDTH, COLOUR.TRACK_STROKE)
     .setDepth(DEPTH.MINIGAME);

    // Handle
    this.handle = scene.add.rectangle(
      trackX, this.trackTop + handleHeight / 2,
      trackWidth, handleHeight, COLOUR.HANDLE_FILL
    ).setStrokeStyle(LAYOUT.STROKE_WIDTH, COLOUR.HANDLE_STROKE)
     .setDepth(DEPTH.MINIGAME);

    // Progress bar background
    this.barBg = scene.add.rectangle(
      barX, cy, barWidth, trackHeight, COLOUR.BAR_BG_FILL
    ).setStrokeStyle(LAYOUT.STROKE_WIDTH, COLOUR.TRACK_STROKE)
     .setDepth(DEPTH.MINIGAME);

    // Progress bar fill
    this.bar = scene.add.rectangle(
      barX, this.trackBottom,
      barWidth, trackHeight, COLOUR.BAR_FILL
    ).setOrigin(0.5, 1).setDepth(DEPTH.MINIGAME).setScale(1, 0);

    this.handleHeight = handleHeight;
    this.trackHeight = trackHeight;

    this.onPointerDown = (p) => { this.pointerDown = true; this.lastY = p.y; };
    this.onPointerMove = (p) => this.#handleMove(p);
    this.onPointerUp = () => { this.pointerDown = false; this.lastY = null; };

    scene.input.on("pointerdown", this.onPointerDown);
    scene.input.on("pointermove", this.onPointerMove);
    scene.input.on("pointerup", this.onPointerUp);
  }

  #handleMove (pointer) {
    if (!this.pointerDown) return;

    const y = pointer.y;
    const halfHandle = this.handleHeight / 2;
    const clampedY = Phaser.Math.Clamp(y, this.trackTop + halfHandle, this.trackBottom - halfHandle);
    this.handle.y = clampedY;

    if (this.lastY !== null && y > this.lastY) {
      this.pumpedDistance += y - this.lastY;
      const pct = Math.min(1, this.pumpedDistance / this.requiredDistance);
      this.bar.setScale(1, pct);
      if (pct >= 1) this.onComplete();
    }
    this.lastY = y;
  }

  destroy () {
    this.scene.input.off("pointerdown", this.onPointerDown);
    this.scene.input.off("pointermove", this.onPointerMove);
    this.scene.input.off("pointerup", this.onPointerUp);
    this.track.destroy();
    this.handle.destroy();
    this.barBg.destroy();
    this.bar.destroy();
  }

  onResize (width, height) {
    const cx = width / 2;
    const cy = height / 2;
    const trackWidth = width * LAYOUT.TRACK_WIDTH_PCT;
    const trackHeight = height * LAYOUT.TRACK_HEIGHT_PCT;
    const handleHeight = height * LAYOUT.HANDLE_HEIGHT_PCT;
    const barWidth = width * LAYOUT.BAR_WIDTH_PCT;
    const gap = width * LAYOUT.BAR_GAP_PCT;
    const trackX = cx - (trackWidth + gap + barWidth) / 2 + trackWidth / 2;
    const barX = trackX + trackWidth / 2 + gap + barWidth / 2;

    this.trackTop = cy - trackHeight / 2;
    this.trackBottom = cy + trackHeight / 2;
    this.requiredDistance = trackHeight * TUNING.REQUIRED_DISTANCE_MULT;
    this.handleHeight = handleHeight;
    this.trackHeight = trackHeight;

    const pct = Math.min(1, this.pumpedDistance / this.requiredDistance);
    this.track.setPosition(trackX, cy).setSize(trackWidth, trackHeight);
    this.handle.setPosition(trackX, this.trackTop + handleHeight / 2).setSize(trackWidth, handleHeight);
    this.barBg.setPosition(barX, cy).setSize(barWidth, trackHeight);
    this.bar.setPosition(barX, this.trackBottom).setSize(barWidth, trackHeight);
    this.bar.setScale(1, pct);
  }
}
