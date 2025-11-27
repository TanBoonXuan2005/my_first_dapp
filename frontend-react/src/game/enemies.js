
export function spawnEnemy(k, pathPoints, waveConfig, gameState, generation = 0, startPointIndex = 0) {
    const startPos = startPointIndex > 0 ? pathPoints[startPointIndex] : pathPoints[0];

    const enemy = k.add([
        k.sprite("flu-virus"),
        k.pos(startPos),
        k.anchor("center"),
        k.scale(0.06),
        k.area(),
        k.z(10),
        "enemy",
        {
            hp: waveConfig.enemyHp,           // Use wave-specific HP
            maxHp: waveConfig.enemyHp,
            speed: waveConfig.enemySpeed,     // Use wave-specific speed
            currentPointIndex: startPointIndex,
            path: pathPoints,
            generation: generation,
            duplicationTimer: 0
        }
    ]);

    enemy.onUpdate(() => {
        if (gameState.isPaused) return; // Don't update when paused

        // Duplication Logic
        if (enemy.generation < 2) {
            enemy.duplicationTimer += k.dt();
            if (enemy.duplicationTimer >= 2.0) { // Check every 2 seconds
                enemy.duplicationTimer = 0;
                if (k.rand() < 0.1) { // 10% chance to duplicate
                    // Duplicate!
                    const offset = k.vec2(k.rand(-20, 20), k.rand(-20, 20));
                    // Spawn new enemy at current position + offset
                    // We need to pass the current path index so it doesn't start from beginning
                    const newEnemy = spawnEnemy(k, pathPoints, waveConfig, gameState, enemy.generation + 1, enemy.currentPointIndex);
                    if (newEnemy) {
                        newEnemy.pos = enemy.pos.add(offset);
                    }

                    // Visual effect for duplication
                    k.add([
                        k.text("Duplicate!", { size: 16 }),
                        k.pos(enemy.pos.sub(0, 30)),
                        k.anchor("center"),
                        k.color(255, 100, 255),
                        k.lifespan(1),
                        k.move(k.UP, 50),
                        k.z(20)
                    ]);
                }
            }
        }

        if (enemy.hp <= 0) {
            // Enemy defeated
            // Enemy defeated
            const death = k.add([
                k.sprite("flu-virus-death"),
                k.pos(enemy.pos),
                k.anchor("center"),
                k.scale(0.06),
                k.z(9),
                "death-effect",
                { timer: 0 }
            ]);

            death.onUpdate(() => {
                if (gameState.isPaused) return; // Don't update when paused
                death.timer += k.dt();
                death.opacity = 1 - (death.timer / 0.5);
                if (death.timer >= 0.5) k.destroy(death);
            });

            k.destroy(enemy);
            // Base ATP 10, +3% per wave
            const atpDrop = Math.floor(10 * Math.pow(1.03, gameState.currentWaveIndex));
            gameState.updateATP(atpDrop); // Award ATP
            gameState.totalEnemiesProcessed++;
            gameState.totalEnemiesProcessed++;
            return;
        }

        const nets = k.get("fibrin-net");
        let slowMultiplier = 1.0;
        for (const net of nets) {
            if (enemy.pos.dist(net.pos) < 50) {
                slowMultiplier = 1.0 - net.slowEffect;
                break;
            }
        }

        const target = enemy.path[enemy.currentPointIndex + 1];
        if (!target) {
            // Reached end of path
            k.destroy(enemy);
            gameState.updateHealth(-10);
            gameState.totalEnemiesProcessed++;
            gameState.totalEnemiesProcessed++;
            return;
        }

        const dir = target.sub(enemy.pos).unit();
        const effectiveSpeed = enemy.speed * slowMultiplier;
        enemy.move(dir.scale(effectiveSpeed));

        if (enemy.pos.dist(target) < 5) {
            enemy.currentPointIndex++;
        }
    });

    return enemy;
}
