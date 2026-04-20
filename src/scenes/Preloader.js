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

    const item = this.make.graphics({ x: 0, y: 0, add: false });
    item.fillStyle(0xcc6633);
    item.fillRect(0, 0, 80, 80);
    item.lineStyle(3, 0xff0000);
    item.strokeRect(0, 0, 80, 80);
    item.generateTexture("item-placeholder", 80, 80);
    item.destroy();
  }

  create () {
    this.scene.start("MainMenu");
  }

  createLoadingBar () {
 
  }
}
