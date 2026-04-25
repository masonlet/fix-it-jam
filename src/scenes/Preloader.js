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
    // Audio
    this.load.audio("sfx-button", "assets/audio/button.wav");
    this.load.audio("sfx-oof", "assets/audio/oof.wav");
    this.load.audio("sfx-click", "assets/audio/click.wav");
    this.load.audio("sfx-death", "assets/audio/death.wav");
    
    //   Minigames
    this.load.audio("sfx-fail", "assets/audio/minigames/fail.wav");
    this.load.audio("sfx-drag-connect", "assets/audio/minigames/drag/connect.wav");
    this.load.audio("sfx-tap-complete", "assets/audio/minigames/tap/complete.wav");
    this.load.audio("sfx-tap-button", "assets/audio/minigames/tap/button.wav");

    // Images
    //   Game
    this.load.image("belt-tile", "assets/game/belt.png");
    this.load.image("rectangle-border", "assets/game/rectangle-border.png");
    this.load.image("rectangle-insert", "assets/game/rectangle-insert.png");
    this.load.image("square-border", "assets/game/square-border.png");
    this.load.image("square-insert", "assets/game/square-insert.png");

    //   Items
    this.load.image("item-background", "assets/items/background.png");
    this.load.image("item-toaster", "assets/items/toaster.png");
    this.load.image("item-walkie", "assets/items/walkie.png");
    this.load.image("item-tire", "assets/items/tire.png");
    this.load.image("item-pipe", "assets/items/pipe.png");

    //   Minigames
    this.load.image("drag-plug", "assets/minigames/drag/plug.png");
    this.load.image("drag-socket", "assets/minigames/drag/socket.png");
    this.load.image("tap-walkie", "assets/minigames/tap/walkie-close.png");
    this.load.image("pump-body", "assets/minigames/pump/body.png");
    this.load.image("spin-pipe", "assets/minigames/spin/pipe.png");
    this.load.image("spin-valve", "assets/minigames/spin/valve.png");
  }

  create () {
    this.scene.start("MainMenu");
  }

  createLoadingBar () {
 
  }
}
