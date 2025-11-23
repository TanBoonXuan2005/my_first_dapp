
export function spawnEnemy(k, pathPoints, waveConfig, gameState) {
    const enemy = k.add([
        k.sprite("flu-virus"),
        k.pos(pathPoints[0]),
        k.anchor("center"),
        k.scale(0.06),
        k.area(),
        k.z(10),
        "enemy",
        {
            hp: waveConfig.enemyHp,           // Use wave-specific HP
            maxHp: waveConfig.enemyHp,
            speed: waveConfig.enemySpeed,     // Use wave-specific speed
            currentPointIndex: 0,
            path: pathPoints
        }
    ]);

    enemy.onUpdate(() => {
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
                death.timer += k.dt();
                death.opacity = 1 - (death.timer / 0.5);
                if (death.timer >= 0.5) k.destroy(death);
            });

            k.destroy(enemy);
            gameState.updateATP(5); // Award ATP
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
}
