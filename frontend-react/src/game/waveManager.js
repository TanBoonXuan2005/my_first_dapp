
import GAME_CONFIG from '../gameConfig.js';
import { spawnEnemy } from './enemies.js';
import { showVictoryMessage } from './ui.js';

export async function spawnWave(k, gameState, getPaths) {
    const waveConfig = GAME_CONFIG.getWaveConfig(gameState.currentWaveIndex);

    // Safety check (though infinite now)
    if (!waveConfig) {
        console.log("Error generating wave config");
        return;
    }

    gameState.totalEnemiesSpawned = waveConfig.enemyCount;
    gameState.totalEnemiesProcessed = 0;
    gameState.waveCompleted = false;

    console.log(`🌊 Starting Wave ${waveConfig.waveNumber}`);
    const { path1Points, path2Points } = getPaths();

    for (let i = 0; i < waveConfig.enemyCount; i++) {
        if (!gameState.gameActive) break; // Stop spawning if game over
        // Always use path1Points for single path gameplay
        const path = path1Points;
        spawnEnemy(k, path, waveConfig, gameState);

        // Pause-aware wait
        await pauseAwareWait(k, gameState, waveConfig.spawnDelay);
    }
}

// Helper function for pause-aware waiting
function pauseAwareWait(k, gameState, duration) {
    return new Promise((resolve) => {
        let elapsed = 0;
        const waiter = k.add([
            k.pos(0, 0),
            { elapsed: 0 }
        ]);

        waiter.onUpdate(() => {
            if (gameState.isPaused) return; // Don't count time when paused

            waiter.elapsed += k.dt();
            if (waiter.elapsed >= duration) {
                k.destroy(waiter);
                resolve();
            }
        });
    });
}

export function startNextWavePreparation(k, gameState, spawnWaveCallback) {
    // Clear victory messages
    k.destroyAll("victory-msg");
    k.destroyAll("health-msg");

    gameState.gameActive = true; // Reactivate game for tower placement
    const nextWave = GAME_CONFIG.getWaveConfig(gameState.currentWaveIndex);

    // Update wave number display
    gameState.updateWave(nextWave.waveNumber);

    // Show preparation message
    const prepMsg = k.add([
        k.text(`Prepare for Wave ${nextWave.waveNumber}!`, { size: 32 }),
        k.pos(k.width() / 2, k.height() / 2 - 100), // Moved up
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
        "countdown",
        { elapsed: 0 }
    ]);

    // Use onUpdate instead of k.loop to respect pause state
    preparationCountdown.onUpdate(() => {
        if (gameState.isPaused) return; // Don't update when paused

        preparationCountdown.elapsed += k.dt();
        if (preparationCountdown.elapsed >= 1) {
            preparationCountdown.elapsed = 0;
            timeRemaining--;
            if (preparationCountdown.exists()) {
                preparationCountdown.text = `${timeRemaining}s`;
            }

            if (timeRemaining <= 0) {
                k.destroy(prepMsg);
                if (preparationCountdown) k.destroy(preparationCountdown);
                spawnWaveCallback();
            }
        }
    });
}

export function checkWaveCompletion(k, gameState, onWaveVictory, walletAddress, signAndExecute) {
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
                onWaveVictory(walletAddress, signAndExecute);
            } else {
                console.log("[Wave Check] Lost (health = 0)");
            }
        }
    }
}

import { updateTowerVisuals } from './shop.js';

export async function onWaveVictory(k, gameState, walletAddress, signAndExecute) {
    console.log(`🎉 Wave ${gameState.currentWaveIndex + 1} Victory!`);
    gameState.gameActive = false; // Pause game

    showVictoryMessage(k, gameState.currentWaveIndex + 1, gameState.playerHealth);

    // Celebration effect (pause-aware)
    for (let i = 0; i < 10; i++) {
        (async () => {
            await pauseAwareWait(k, gameState, i * 0.1);
            k.add([
                k.circle(10),
                k.pos(k.rand(0, k.width()), 0),
                k.color(k.rand(100, 255), k.rand(100, 255), k.rand(100, 255)),
                k.lifespan(2),
                k.move(k.DOWN, k.rand(100, 300)),
                k.z(200)
            ]);
        })();
    }

    // Increment wave index for next wave
    gameState.currentWaveIndex++;
    console.log(`[Wave] Progressing to wave ${gameState.currentWaveIndex + 1}`);

    // Wait for celebration to finish (3 seconds)
    // We return this promise so the caller can decide what to do next
    return pauseAwareWait(k, gameState, 3);
}
