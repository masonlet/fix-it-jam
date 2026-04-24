import { Scene } from "phaser";
import { YouTubePlayables } from "../YouTubePlayables";

export class Preloader extends Scene {
  constructor () {
    super("Preloader");
  }

  init () {
    this.createLoadingBar();
    YouTubePlayables.firstFrameReady();
  }

  preload () {
    this.load.audio("sfx-button", "assets/audio/button.wav");
    this.load.audio("sfx-oof", "assets/audio/oof.wav");
    this.load.audio("sfx-click", "assets/audio/click.wav");
    this.load.audio("sfx-death", "assets/audio/death.wav");
    this.load.audio("sfx-connect", "assets/audio/minigames/drag/connect.wav");

    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x444444);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0x555555);
    g.fillRect(0, 0, 32, 64);
    g.generateTexture("belt-tile", 64, 64);
    g.destroy();

    this.load.image("item-background", "assets/items/background.png");
    this.load.image("item-fault", "assets/items/fault.png");
    this.load.image("item-fixed", "assets/items/fixed.png");

    this.load.image("item-toaster", "assets/items/toaster.png");
    this.load.image("drag-plug", "assets/minigames/drag/plug.png");
    this.load.image("drag-socket", "assets/minigames/drag/socket.png");
  }

  create () {
    this.scene.start("MainMenu");
  }

  createLoadingBar () {
 
  }
}
