export class TemplateMinigame {
  constructor (scene, cx, cy, onComplete) {
    this.scene = scene;
    this.onComplete = onComplete;

    this.text = scene.add.text(cx, cy, "TAP TO FIX!", {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#00cc66",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(14).setInteractive();

    this.text.on("pointerdown", () => this.onComplete());
  }

  destroy () {
    this.text.destroy();
  }

  onResize (width, height) {
    this.text.setPosition(width / 2, height / 2);
  }
}
