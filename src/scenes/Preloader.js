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
     
  }

  create () {
    this.scene.start("MainMenu");
  }

  createLoadingBar () {
 
  }
}
