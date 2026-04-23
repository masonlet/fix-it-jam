import { DEPTH } from "../config/Depth";
import { DRAG } from "../config/minigames/Drag";

export class DragMinigame {
  constructor (scene, cx, cy, onComplete) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.completed = false;

    const { width } = scene.scale;
    const pieceSize = width * DRAG.LAYOUT.PIECE_SIZE_PCT;
    const slotSize = width * DRAG.LAYOUT.SLOT_SIZE_PCT;

    this.startX = cx + width * DRAG.LAYOUT.START_OFFSET_X_PCT;
    this.startY = cy;
    this.slotX = cx + width * DRAG.LAYOUT.SLOT_OFFSET_X_PCT;
    this.slotY = cy;
    this.snapTolerance = pieceSize * DRAG.LAYOUT.SNAP_TOLERANCE_PCT;

    this.slot = scene.add.rectangle(
      this.slotX, this.slotY, slotSize, slotSize, DRAG.COLOUR.SLOT_FILL
    ).setStrokeStyle(DRAG.LAYOUT.STROKE_WIDTH, DRAG.COLOUR.SLOT_STROKE)
     .setDepth(DEPTH.MINIGAME);

    this.piece = scene.add.rectangle(
      this.startX, this.startY, pieceSize, pieceSize, DRAG.COLOUR.PIECE_FILL
    ).setStrokeStyle(DRAG.LAYOUT.STROKE_WIDTH, DRAG.COLOUR.PIECE_STROKE)
     .setDepth(DEPTH.MINIGAME)
     .setInteractive({ draggable: true });

    scene.input.setDraggable(this.piece);

    this.onDrag = (_, obj, x, y) => {
      if (obj !== this.piece) return;
      this.piece.setPosition(x, y);
      const dx = x - this.slotX;
      const dy = y - this.slotY;
      if (Math.hypot(dx, dy) <= this.snapTolerance) {
        this.slot.setFillStyle(DRAG.COLOUR.SLOT_HIGHLIGHT_FILL);
        this.slot.setStrokeStyle(DRAG.LAYOUT.STROKE_WIDTH, DRAG.COLOUR.SLOT_HIGHLIGHT_STROKE);
      } else {
        this.slot.setFillStyle(DRAG.COLOUR.SLOT_FILL);
        this.slot.setStrokeStyle(DRAG.LAYOUT.STROKE_WIDTH, DRAG.COLOUR.SLOT_STROKE);
      }
    };
    this.onDragEnd = (_, obj) => {
      if (obj !== this.piece || this.completed) return;
      const dx = this.piece.x - this.slotX;
      const dy = this.piece.y - this.slotY;
      if (Math.hypot(dx, dy) <= this.snapTolerance) {
        this.completed = true;
        this.piece.setPosition(this.slotX, this.slotY);
        this.onComplete();
      } else {
        this.piece.setPosition(this.startX, this.startY);
      }
    };

    scene.input.on("drag", this.onDrag);
    scene.input.on("dragend", this.onDragEnd);
  }

  destroy () {
    this.scene.input.off("drag", this.onDrag);
    this.scene.input.off("dragend", this.onDragEnd);
    this.piece.destroy();
    this.slot.destroy();
  }

  onResize (width, height) {
    const cx = width / 2;
    const cy = height / 2;
    const pieceSize = width * DRAG.LAYOUT.PIECE_SIZE_PCT;
    const slotSize = width * DRAG.LAYOUT.SLOT_SIZE_PCT;

    this.startX = cx + width * DRAG.LAYOUT.START_OFFSET_X_PCT;
    this.startY = cy;
    this.slotX = cx + width * DRAG.LAYOUT.SLOT_OFFSET_X_PCT;
    this.slotY = cy;
    this.snapTolerance = pieceSize * DRAG.LAYOUT.SNAP_TOLERANCE_PCT;

    this.slot.setPosition(this.slotX, this.slotY).setSize(slotSize, slotSize);
    if (this.completed) {
      this.piece.setPosition(this.slotX, this.slotY);
    } else {
      this.piece.setPosition(this.startX, this.startY);
    }
    this.piece.setSize(pieceSize, pieceSize);
  }
}
