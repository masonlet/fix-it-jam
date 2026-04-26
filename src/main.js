import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { YouTubePlayables } from './YouTubePlayables';
import { WaveDash } from './WaveDash';

const config = {
  type: Phaser.AUTO,
  parent: 'gameParent',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    Boot,
    Preloader,
    MainMenu,
    Game,
    GameOver
  ],
  pixelArt: true,
};

YouTubePlayables.boot(async () => {
  const game = new Phaser.Game(config);
  await WaveDash.boot();

  const applyAudioState = (enabled) => { game.sound.mute = !enabled; }
  applyAudioState(YouTubePlayables.isAudioEnabled());
  YouTubePlayables.setAudioChangeCallback(applyAudioState);

  return game;
});
