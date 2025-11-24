
import GAME_CONFIG from '../gameConfig.js';
import { spawnEnemy } from './enemies.js';
import { showVictoryMessage } from './ui.js';
import BlockchainService from '../services/BlockchainService.js';

export async function spawnWave(k, gameState, getPaths) {
    const waveConfig = GAME_CONFIG.waves[gameState.currentWaveIndex];
    if (!waveConfig) {
        console.log("No more waves!");
        return;
    }

    gameState.totalEnemiesSpawned = waveConfig.enemyCount;
    gameState.totalEnemiesProcessed = 0;
    gameState.waveCompleted = false;

    console.log(`🌊 Starting Wave ${waveConfig.waveNumber}`);
    const { path1Points, path2Points } = getPaths();

    for (let i = 0; i < waveConfig.enemyCount; i++) {
        if (!gameState.gameActive) break; // Stop spawning if game over
        const path = i % 2 === 0 ? path1Points : path2Points;
        spawnEnemy(k, path, waveConfig, gameState);
        await k.wait(waveConfig.spawnDelay);
    }
}

export function startNextWavePreparation(k, gameState, spawnWaveCallback) {
    // Clear victory messages
    k.destroyAll("victory-msg");
    k.destroyAll("health-msg");

    gameState.gameActive = true; // Reactivate game for tower placement
    const nextWave = GAME_CONFIG.waves[gameState.currentWaveIndex];

    // Update wave number display
    gameState.updateWave(nextWave.waveNumber);

    // Show preparation message
    const prepMsg = k.add([
        k.text(`Prepare for Wave ${nextWave.waveNumber}!`, { size: 32 }),
        k.pos(k.width() / 2, k.height() / 2 - 50),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(250)
    ]);

    let timeRemaining = nextWave.preparationTime;
    const preparationCountdown = k.add([
        k.text(`${timeRemaining}s`, { size: 48 }),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(250),
        "countdown"
    ]);

    const countdownInterval = k.loop(1, () => {
        timeRemaining--;
        if (preparationCountdown && preparationCountdown.exists()) {
            preparationCountdown.text = `${timeRemaining}s`;
        }

        if (timeRemaining <= 0) {
            countdownInterval.cancel();
            k.destroy(prepMsg);
            if (preparationCountdown) k.destroy(preparationCountdown);
            spawnWaveCallback();
        }
    });
}

export function checkWaveCompletion(k, gameState, onWaveVictory) {
    console.log(`[Wave Check] processed: ${gameState.totalEnemiesProcessed}/${gameState.totalEnemiesSpawned}, completed: ${gameState.waveCompleted}, active: ${gameState.gameActive}`);

    if (!gameState.waveCompleted && gameState.totalEnemiesProcessed >= gameState.totalEnemiesSpawned && gameState.totalEnemiesSpawned > 0 && gameState.gameActive) {
        // Double-check no enemies remain on the map
        const remainingEnemies = k.get("enemy");
        console.log(`[Wave Check] Remaining enemies: ${remainingEnemies.length}`);

        if (remainingEnemies.length === 0) {
            gameState.waveCompleted = true;

            // Check if player won (has health remaining)
            if (gameState.playerHealth > 0) {
                console.log("[Wave Check] VICTORY!");
                onWaveVictory();
            } else {
                console.log("[Wave Check] Lost (health = 0)");
            }
        }
    }
}

import { updateTowerVisuals } from './shop.js';

export async function onWaveVictory(k, gameState, startNextWavePreparationCallback) {
    console.log(`🎉 Wave ${gameState.currentWaveIndex + 1} Victory!`);
    gameState.gameActive = false; // Pause game

    showVictoryMessage(k, gameState.currentWaveIndex + 1, gameState.playerHealth);

    // Check for Unlocks
    const walletState = JSON.parse(sessionStorage.getItem('walletState'));
    if (walletState && walletState.address) {
        // Wave 2 Victory -> Unlock Macrophage
        if (gameState.currentWaveIndex + 1 === 2) {
            const unlocked = await BlockchainService.checkUnlockSBT(walletState.address, 'macrophage');
            if (!unlocked) {
                console.log("Minting Macrophage SBT...");
                const success = await BlockchainService.mintUnlockSBT(walletState.address, 'macrophage');
                if (success) {
                    // Update Game State Immediately
                    gameState.unlockedTowers.macrophage = true;
                    updateTowerVisuals(k, 'macrophage', true);

                    k.add([
                        k.text("Macrophage Unlocked!", { size: 32 }),
                        k.pos(k.width() / 2, k.height() / 2 + 50),
                        k.anchor("center"),
                        k.color(255, 215, 0),
                        k.lifespan(3),
                        k.z(250)
                    ]);
                }
            }
        }

        // Wave 4 Victory -> Unlock Platelet
        if (gameState.currentWaveIndex + 1 === 4) {
            const unlocked = await BlockchainService.checkUnlockSBT(walletState.address, 'platelet');
            if (!unlocked) {
                console.log("Minting Platelet SBT...");
                const success = await BlockchainService.mintUnlockSBT(walletState.address, 'platelet');
                if (success) {
                    // Update Game State Immediately
                    gameState.unlockedTowers.platelet = true;
                    updateTowerVisuals(k, 'platelet', true);

                    k.add([
                        k.text("Platelet Unlocked!", { size: 32 }),
                        k.pos(k.width() / 2, k.height() / 2 + 50),
                        k.anchor("center"),
                        k.color(255, 215, 0),
                        k.lifespan(3),
                        k.z(250)
                    ]);
                }
            }
        }
    }

    // Celebration effect
    for (let i = 0; i < 10; i++) {
        k.wait(i * 0.1, () => {
            k.add([
                k.circle(10),
                k.pos(k.rand(0, k.width()), 0),
                k.color(k.rand(100, 255), k.rand(100, 255), k.rand(100, 255)),
                k.lifespan(2),
                k.move(k.DOWN, k.rand(100, 300)),
                k.z(200)
            ]);
        });
    }

    // Check if all waves completed (victory condition)
    const totalWaves = GAME_CONFIG.waves.length;
    if (gameState.currentWaveIndex + 1 >= totalWaves) {
        console.log("🎉 All waves completed!");
        k.wait(3, () => {
            gameState.gameVictory();
        });
        return;
    }

    // Increment wave index for next wave
    gameState.currentWaveIndex++;
    console.log(`[Wave] Progressing to wave ${gameState.currentWaveIndex + 1}`);

    // Continue to next wave preparation
    k.wait(3, () => {
        startNextWavePreparationCallback();
    });
}
