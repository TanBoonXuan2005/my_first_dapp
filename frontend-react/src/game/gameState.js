
import { showGameOver } from './ui.js';

/**
 * Manages the global state of the game, including player health, resources (ATP), and wave progress.
 * Acts as the central source of truth for game data and handles UI updates for these values.
 */
export class GameState {
    /**
     * Creates a new GameState instance.
     * @param {import("kaboom").KaboomCtx} k - The Kaboom.js context.
     * @param {Object} uiElements - Object containing references to UI text elements (healthText, atpText, etc.).
     */
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

        // Unlock state
        this.unlockedTowers = {
            macrophage: false,
            platelet: false
        };
    }

    /**
     * Updates the player's health and refreshes the UI.
     * Triggers game over if health drops to or below zero.
     * @param {number} amount - The amount to change health by (negative for damage, positive for healing).
     */
    updateHealth(amount) {
        this.playerHealth += amount;
        this.ui.healthText.text = `❤️ Health: ${this.playerHealth}`;

        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    /**
     * Updates the player's ATP (currency) and refreshes the UI.
     * Flashes the text color green for gains and red for spending.
     * @param {number} amount - The amount of ATP to add or subtract.
     */
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

    /**
     * Updates the wave number display on the UI.
     * @param {number} waveNumber - The current wave number to display.
     */
    updateWave(waveNumber) {
        if (this.ui.waveNumberText) {
            this.ui.waveNumberText.text = `Wave ${waveNumber}`;
        }
    }

    /**
     * Ends the game, setting the active state to false and displaying the Game Over screen.
     */
    gameOver() {
        this.gameActive = false;
        showGameOver(this.k);
    }
}
