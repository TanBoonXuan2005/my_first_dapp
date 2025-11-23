
import { showGameOver } from './ui.js';

export class GameState {
    constructor(k, uiElements) {
        this.k = k;
        this.ui = uiElements;
        this.playerHealth = 100;
        this.playerATP = 50;
        this.gameActive = true;
        this.currentWaveIndex = 0;

        // Wave tracking
        this.totalEnemiesSpawned = 0;
        this.totalEnemiesProcessed = 0;
        this.waveCompleted = false;
    }

    updateHealth(amount) {
        this.playerHealth += amount;
        this.ui.healthText.text = `❤️ Health: ${this.playerHealth}`;

        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    updateATP(amount) {
        this.playerATP += amount;
        this.ui.atpText.text = `⚡ ATP: ${this.playerATP}`;

        // Flash color on change
        if (amount > 0) {
            this.ui.atpText.color = this.k.rgb(150, 255, 150); // Green for gain
        } else {
            this.ui.atpText.color = this.k.rgb(255, 150, 150); // Red for spend
        }
        this.k.wait(0.2, () => {
            this.ui.atpText.color = this.k.rgb(100, 255, 255); // Back to cyan
        });
    }

    updateWave(waveNumber) {
        if (this.ui.waveNumberText) {
            this.ui.waveNumberText.text = `Wave ${waveNumber}`;
        }
    }

    gameOver() {
        this.gameActive = false;
        showGameOver(this.k);
    }
}
