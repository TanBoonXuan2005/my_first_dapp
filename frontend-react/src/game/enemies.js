
import { TOWER_COST } from './constants.js';

export function spawnEnemy(k, pathPoints, waveConfig, gameState, generation = 0, startPointIndex = 0) {
    const startPos = startPointIndex > 0 ? pathPoints[startPointIndex] : pathPoints[0];

    // Determine sprite based on enemy type
    let actualType = waveConfig.enemyType;
    if (actualType === 'mixed') {
        const rand = k.rand();
        if (rand < 0.33) actualType = 'fluVirus';
        else if (rand < 0.66) actualType = 'adenovirus';
        else actualType = 'hiv';
    }

    let spriteName = "flu-virus";
    if (actualType === 'adenovirus') spriteName = "adenovirus";
    else if (actualType === 'hiv') spriteName = "hiv";

    // Scale adjustments
    let scale = 0.06;
    if (actualType === 'adenovirus' && generation > 0) scale = 0.09; // Larger strong adenovirus

    const enemy = k.add([
        k.sprite(spriteName),
        k.pos(startPos),
        k.anchor("center"),
        k.scale(scale),
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
            duplicationTimer: 0,
            duplicationTimer: 0,
            type: actualType
        }
    ]);

    // Apply generation buffs (for Adenovirus split)
    if (generation > 0 && actualType === 'adenovirus') {
        enemy.hp *= 1.5;
        enemy.maxHp *= 1.5;
        enemy.damage *= 1.5; // If enemies deal damage directly (not implemented yet, but good for future)
    }

    enemy.onUpdate(() => {
        if (gameState.isPaused) return; // Don't update when paused

        // Duplication Logic (Flu Virus only)
        if (enemy.type === 'fluVirus' && enemy.generation < 2) {
            enemy.duplicationTimer += k.dt();
            if (enemy.duplicationTimer >= 2.0) { // Check every 2 seconds
                enemy.duplicationTimer = 0;
                if (k.rand() < 0.1) { // 10% chance to duplicate
                    // Duplicate!
                    const offset = k.vec2(k.rand(-20, 20), k.rand(-20, 20));
                    const newEnemy = spawnEnemy(k, pathPoints, waveConfig, gameState, enemy.generation + 1, enemy.currentPointIndex);
                    if (newEnemy) {
                        newEnemy.pos = enemy.pos.add(offset);
                    }

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
            let deathSprite = spriteName;
            if (spriteName === 'flu-virus') deathSprite = "flu-virus-death";
            else if (spriteName === 'hiv') deathSprite = "hiv-death";
            
            const death = k.add([
                k.sprite(deathSprite), // Use specific death sprite
                k.pos(enemy.pos),
                k.anchor("center"),
                k.scale(scale),
                k.z(9),
                "death-effect",
                { timer: 0 }
            ]);

            death.onUpdate(() => {
                if (gameState.isPaused) return;
                death.timer += k.dt();
                death.opacity = 1 - (death.timer / 0.5);
                if (death.timer >= 0.5) k.destroy(death);
            });

            k.destroy(enemy);

            // Special Death Abilities
            if (enemy.type === 'adenovirus' && enemy.generation === 0) {
                // Spawn Stronger Version
                const strongConfig = { ...waveConfig, enemyType: 'adenovirus' };
                // Manually boost stats for the spawn call, though we handle it in init too
                // Actually, passing generation 1 handles the scaling in init
                const strongEnemy = spawnEnemy(k, pathPoints, strongConfig, gameState, 1, enemy.currentPointIndex);
                if (strongEnemy) {
                    strongEnemy.pos = enemy.pos;
                    k.add([
                        k.text("Mutated!", { size: 20 }),
                        k.pos(enemy.pos.sub(0, 40)),
                        k.anchor("center"),
                        k.color(255, 50, 50),
                        k.lifespan(1.5),
                        k.move(k.UP, 30),
                        k.z(20)
                    ]);
                }
            } else if (enemy.type === 'hiv') {
                // HIV Death Logic: Target Strongest Tower (Highest ATP Cost)
                let strongestTower = null;
                let maxCost = -1;

                // Map TOWER_COST keys to Kaboom tags
                const towerMap = {
                    'bcell': 'b-cell',
                    'macrophage': 'macrophage',
                    'platelet': 'platelet',
                    'basophil': 'basophil',
                    'nkCell': 'nk-cell'
                };

                // Iterate over all tower types defined in TOWER_COST
                for (const [key, cost] of Object.entries(TOWER_COST)) {
                    const tag = towerMap[key];
                    const towers = k.get(tag);
                    
                    if (towers.length > 0) {
                        // If we find towers of this type, check if they are stronger (more expensive)
                        // or equal cost but maybe we pick the first one found
                        if (cost > maxCost) {
                            maxCost = cost;
                            strongestTower = towers[0]; // Pick the first one of this type
                        } else if (cost === maxCost) {
                            // Tie-breaker? Maybe random or just keep existing
                        }
                    }
                }

                if (strongestTower) {
                    k.destroy(strongestTower);
                    k.add([
                        k.text("INFECTED!", { size: 24 }),
                        k.pos(strongestTower.pos.sub(0, 40)),
                        k.anchor("center"),
                        k.color(128, 0, 128), // Purple
                        k.lifespan(1.5),
                        k.move(k.UP, 50),
                        k.z(100)
                    ]);
                    
                    // Visual explosion
                    k.add([
                        k.rect(60, 60),
                        k.pos(strongestTower.pos),
                        k.anchor("center"),
                        k.color(128, 0, 128),
                        k.opacity(0.8),
                        k.lifespan(0.3),
                        k.scale(1),
                        { update() { this.scale.x += 0.1; this.scale.y += 0.1; this.opacity -= 0.1; } }
                    ]);
                }
            }

            // Constant ATP drop
            const atpDrop = 10;
            gameState.updateATP(atpDrop); // Award ATP
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
