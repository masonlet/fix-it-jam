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
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x444444);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0x555555);
    g.fillRect(0, 0, 32, 64);
    g.generateTexture("belt-tile", 64, 64);
    g.destroy();

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
