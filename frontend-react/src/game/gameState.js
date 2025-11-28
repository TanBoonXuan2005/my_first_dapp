
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
     * @param {Function} navigate - React Router navigate function.
     */
    constructor(k, uiElements, navigate) {
        this.k = k;
        this.ui = uiElements;
        this.navigate = navigate;
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

        // Magic Cards State
        // Magic Cards State
        this.magicCards = {
            heal: { count: 0, cooldownTimer: 0 },
            nuke: { count: 0, cooldownTimer: 0 },
            freeze: { count: 0, cooldownTimer: 0 },
            poison: { count: 0, cooldownTimer: 0 }
        };

        this.isPaused = false;
        this.setupMenu();
    }

    setupMenu() {
        if (this.ui.menuBtn) {
            this.ui.menuBtn.onClick(() => {
                this.togglePause();
            });
        }
    }

    togglePause() {
        if (this.isPaused) return; // Already paused, prevent multiple menus

        this.isPaused = true;

        import('./ui.js').then(({ showPauseMenu }) => {
            showPauseMenu(
                this.k,
                () => { // onResume
                    this.isPaused = false;
                },
                () => { // onRestart
                    this.isPaused = false;
                    this.k.go("main");
                },
                () => { // onHome
                    this.isPaused = false;
                    this.navigate('/');
                }
            );
        });
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
     * Updates magic card cooldowns. Should be called in the game loop.
     * @param {number} dt - Delta time since last frame.
     */
    updateCooldowns(dt) {
        for (const key in this.magicCards) {
            if (this.magicCards[key].cooldownTimer > 0) {
                this.magicCards[key].cooldownTimer -= dt;
                if (this.magicCards[key].cooldownTimer < 0) {
                    this.magicCards[key].cooldownTimer = 0;
                }
            }
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
     * Handles game over scenario
     */
    gameOver() {
        console.log("💀 Game Over");
        this.gameActive = false;

        // Show Game Over UI
        this.k.add([
            this.k.rect(this.k.width(), this.k.height()),
            this.k.color(0, 0, 0),
            this.k.opacity(0.8),
            this.k.fixed(),
            this.k.z(300),
            "game-over-overlay"
        ]);

        this.k.add([
            this.k.text("GAME OVER", { size: 48, font: "monogram" }),
            this.k.pos(this.k.width() / 2, this.k.height() / 2 - 80),
            this.k.anchor("center"),
            this.k.color(255, 50, 50),
            this.k.fixed(),
            this.k.z(301),
            "game-over-text"
        ]);

        this.k.add([
            this.k.text(`Waves Completed: ${this.currentWaveIndex}`, { size: 24, font: "monogram" }),
            this.k.pos(this.k.width() / 2, this.k.height() / 2 - 20),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.fixed(),
            this.k.z(301),
            "game-over-stats"
        ]);

        // Restart Button
        const restartBtn = this.k.add([
            this.k.rect(200, 50, { radius: 8 }),
            this.k.pos(this.k.width() / 2 - 110, this.k.height() / 2 + 40),
            this.k.anchor("center"),
            this.k.color(70, 130, 180),
            this.k.area(),
            this.k.fixed(),
            this.k.z(301),
            "restart-btn"
        ]);

        this.k.add([
            this.k.text("RESTART", { size: 20, font: "monogram" }),
            this.k.pos(this.k.width() / 2 - 110, this.k.height() / 2 + 40),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.fixed(),
            this.k.z(302),
            "restart-btn-text"
        ]);

        restartBtn.onClick(() => {
            this.k.go("main");
        });

        restartBtn.onHover(() => {
            restartBtn.color = this.k.rgb(100, 160, 210);
        });

        restartBtn.onHoverEnd(() => {
            restartBtn.color = this.k.rgb(70, 130, 180);
        });

        // Home Button
        const homeBtn = this.k.add([
            this.k.rect(200, 50, { radius: 8 }),
            this.k.pos(this.k.width() / 2 + 110, this.k.height() / 2 + 40),
            this.k.anchor("center"),
            this.k.color(100, 100, 100),
            this.k.area(),
            this.k.fixed(),
            this.k.z(301),
            "home-btn"
        ]);

        this.k.add([
            this.k.text("HOME", { size: 20, font: "monogram" }),
            this.k.pos(this.k.width() / 2 + 110, this.k.height() / 2 + 40),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.fixed(),
            this.k.z(302),
            "home-btn-text"
        ]);

        homeBtn.onClick(() => {
            this.navigate('/');
        });

        homeBtn.onHover(() => {
            homeBtn.color = this.k.rgb(130, 130, 130);
        });

        homeBtn.onHoverEnd(() => {
            homeBtn.color = this.k.rgb(100, 100, 100);
        });
    }

    /**
     * Handles game victory (all waves completed)
     */
    gameVictory() {
        console.log("🎊 Victory! All waves completed!");
        this.gameActive = false;

        // Show Victory UI
        this.k.add([
            this.k.rect(this.k.width(), this.k.height()),
            this.k.color(0, 0, 0),
            this.k.opacity(0.8),
            this.k.fixed(),
            this.k.z(300),
            "victory-overlay"
        ]);

        this.k.add([
            this.k.text("VICTORY!", { size: 64, font: "monogram" }),
            this.k.pos(this.k.width() / 2, this.k.height() / 2 - 100),
            this.k.anchor("center"),
            this.k.color(255, 215, 0),
            this.k.fixed(),
            this.k.z(301),
            "victory-text"
        ]);

        this.k.add([
            this.k.text("All Waves Completed!", { size: 28, font: "monogram" }),
            this.k.pos(this.k.width() / 2, this.k.height() / 2 - 40),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.fixed(),
            this.k.z(301),
            "victory-subtitle"
        ]);

        this.k.add([
            this.k.text(`Final Health: ${this.playerHealth}`, { size: 20, font: "monogram" }),
            this.k.pos(this.k.width() / 2, this.k.height() / 2),
            this.k.anchor("center"),
            this.k.color(100, 255, 100),
            this.k.fixed(),
            this.k.z(301),
            "victory-stats"
        ]);

        // Restart Button
        const restartBtn = this.k.add([
            this.k.rect(200, 50, { radius: 8 }),
            this.k.pos(this.k.width() / 2 - 110, this.k.height() / 2 + 60),
            this.k.anchor("center"),
            this.k.color(70, 180, 130),
            this.k.area(),
            this.k.fixed(),
            this.k.z(301),
            "restart-btn"
        ]);

        this.k.add([
            this.k.text("PLAY AGAIN", { size: 20, font: "monogram" }),
            this.k.pos(this.k.width() / 2 - 110, this.k.height() / 2 + 60),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.fixed(),
            this.k.z(302),
            "restart-btn-text"
        ]);

        restartBtn.onClick(() => {
            this.k.go("main");
        });

        restartBtn.onHover(() => {
            restartBtn.color = this.k.rgb(100, 210, 160);
        });

        restartBtn.onHoverEnd(() => {
            restartBtn.color = this.k.rgb(70, 180, 130);
        });

        // Home Button
        const homeBtn = this.k.add([
            this.k.rect(200, 50, { radius: 8 }),
            this.k.pos(this.k.width() / 2 + 110, this.k.height() / 2 + 60),
            this.k.anchor("center"),
            this.k.color(100, 100, 100),
            this.k.area(),
            this.k.fixed(),
            this.k.z(301),
            "home-btn"
        ]);

        this.k.add([
            this.k.text("HOME", { size: 20, font: "monogram" }),
            this.k.pos(this.k.width() / 2 + 110, this.k.height() / 2 + 60),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.fixed(),
            this.k.z(302),
            "home-btn-text"
        ]);

        homeBtn.onClick(() => {
            this.navigate('/');
        });

        homeBtn.onHover(() => {
            homeBtn.color = this.k.rgb(130, 130, 130);
        });

        homeBtn.onHoverEnd(() => {
            homeBtn.color = this.k.rgb(100, 100, 100);
        });
    }
}
