import { Scene } from 'phaser';
import { YouTubePlayables } from '../YouTubePlayables';
import { Audio } from '../Audio';

export class GameOver extends Scene {
  constructor () {
    super('GameOver');
  }

  create (data = {}) {
    this.audio = new Audio(this);
    this.audio.register("button", "sfx-button");

    const score = data.score || 0;
    const time = data.time || 0;
    const highScore = this.registry.get("highScore") || 0;
    const isNewHigh = score > highScore;

    if (isNewHigh) this.registry.set("highScore", score);
 
    YouTubePlayables.sendScore(score);
    YouTubePlayables.saveData({
      highScore: isNewHigh ? score : highScore
    });

    const { width, height } = this.scale;

    // Game Over
    this.add.text(width / 2, height * 0.2, 'GAME OVER', {
      fontFamily: 'Arial',
      fontSize: '40px',
      color: '#ff4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Score
    this.add.text(width / 2, height * 0.35, `Score: ${score}`, {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Time survived
    this.add.text(width / 2, height * 0.45, `Time: ${time}s`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // New high score
    if (isNewHigh) {
      this.add.text(width / 2, height * 0.55, 'NEW HIGH SCORE!', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffcc00',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    }

    // Play again
    const playBtn = this.add.text(width / 2, height * 0.7, 'PLAY AGAIN', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#00cc66',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playBtn.on('pointerover', () => playBtn.setColor('#00ff88'));
    playBtn.on('pointerout', () => playBtn.setColor('#00cc66'));
    playBtn.on('pointerdown', () => {
      this.audio.play("button");
      this.scene.start('Game');
    });

    // Menu
    const menuBtn = this.add.text(width / 2, height * 0.8, 'MENU', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#888888'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setColor('#bbbbbb'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#888888'));
    menuBtn.on('pointerdown', () => {
      this.audio.play("button");
      this.scene.start('MainMenu');
    });

    // Handle resize
    this.scale.on('resize', this.handleResize, this);
  }

  handleResize (gameSize) {
    // Game Over
    
    // Score

    // Time survived

    // New high score

    // Play again

    // Menu
  }

  shutdown () {
    this.scale.off("resize", this.handleResize, this);
  }
}
