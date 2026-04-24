export class Audio {
  constructor (scene) {
    this.scene = scene;
    this.sounds = {};
  }

  register (key, assetKey) {
    this.sounds[key] = this.scene.sound.add(assetKey);
  }

  play (key) {
    this.sounds[key]?.play();
  }
}
