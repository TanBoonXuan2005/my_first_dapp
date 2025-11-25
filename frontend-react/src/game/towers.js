
import GAME_CONFIG from '../gameConfig.js';
import { showDamageNumber } from './ui.js';

export function placeBCell(k, dropPos, gameState) {
    const tower = k.add([
        k.sprite("b-cell-neutral"),
        k.pos(dropPos),
        k.anchor("center"),
        k.scale(0.075),
        k.z(50),
        "b-cell",
        {
            timer: 0,
            animFrame: 0,
            shootTimer: GAME_CONFIG.towers.bCell.attackSpeed,
            range: GAME_CONFIG.towers.bCell.range,
            attackSpeed: GAME_CONFIG.towers.bCell.attackSpeed,
            damage: GAME_CONFIG.towers.bCell.damage
        }
    ]);

    const idleFrames = ["b-cell-neutral", "b-cell-squash", "b-cell-neutral"];

    tower.onUpdate(() => {
        tower.timer += k.dt();
        if (tower.timer > 0.15) {
            tower.timer = 0;
            tower.animFrame = (tower.animFrame + 1) % idleFrames.length;
            tower.use(k.sprite(idleFrames[tower.animFrame]));
        }

        tower.shootTimer += k.dt();
        if (tower.shootTimer >= tower.attackSpeed) {
            const enemies = k.get("enemy");
            let nearestEnemy = null;
            let nearestDist = tower.range;

            for (const enemy of enemies) {
                const dist = tower.pos.dist(enemy.pos);
                if (dist <= tower.range && dist < nearestDist) {
                    nearestEnemy = enemy;
                    nearestDist = dist;
                }
            }

            if (nearestEnemy) {
                tower.shootTimer = 0;
                const projectile = k.add([
                    k.sprite("y-antibody"),
                    k.pos(tower.pos),
                    k.anchor("center"),
                    k.scale(0.04),
                    k.area(),
                    k.z(30),
                    "projectile",
                    {
                        speed: GAME_CONFIG.towers.bCell.projectileSpeed,
                        target: nearestEnemy,
                        damage: tower.damage
                    }
                ]);

                projectile.onUpdate(() => {
                    if (!projectile.target.exists()) {
                        k.destroy(projectile);
                        return;
                    }

                    const dir = projectile.target.pos.sub(projectile.pos).unit();
                    projectile.move(dir.scale(projectile.speed));

                    if (projectile.pos.dist(projectile.target.pos) < 20) {
                        showDamageNumber(k, projectile.target.pos, projectile.damage);
                        projectile.target.hp -= projectile.damage;
                        k.destroy(projectile);
                    }
                });
            }
        }
    });
}

export function placeMacrophage(k, dropPos, gameState) {
    const tower = k.add([
        k.sprite("macrophage-idle-neutral"),
        k.pos(dropPos),
        k.anchor("center"),
        k.scale(0.075),
        k.z(50),
        "macrophage",
        {
            attackTimer: GAME_CONFIG.towers.macrophage.attackSpeed,
            idleTimer: 0,
            idleFrame: 0,
            range: GAME_CONFIG.towers.macrophage.range,
            attackSpeed: GAME_CONFIG.towers.macrophage.attackSpeed,
            damage: GAME_CONFIG.towers.macrophage.damage,
            attackState: "idle"
        }
    ]);

    const idleFrames = ["macrophage-idle-neutral", "macrophage-idle-excited"];

    tower.onUpdate(() => {
        if (tower.attackState === "idle") {
            tower.idleTimer += k.dt();
            if (tower.idleTimer > 0.3) {
                tower.idleTimer = 0;
                tower.idleFrame = (tower.idleFrame + 1) % idleFrames.length;
                tower.use(k.sprite(idleFrames[tower.idleFrame]));
            }

            tower.attackTimer += k.dt();
            if (tower.attackTimer >= tower.attackSpeed) {
                const enemies = k.get("enemy");
                let hasEnemyInRange = false;

                for (const enemy of enemies) {
                    if (tower.pos.dist(enemy.pos) <= tower.range) {
                        hasEnemyInRange = true;
                        break;
                    }
                }

                if (hasEnemyInRange) {
                    tower.attackTimer = 0;
                    tower.attackState = "prepare";
                    tower.use(k.sprite("macrophage-prepare"));

                    k.wait(0.2, () => {
                        if (!tower.exists()) return;
                        tower.attackState = "attack";
                        tower.use(k.sprite("macrophage-attack"));

                        const enemies = k.get("enemy");
                        for (const enemy of enemies) {
                            if (tower.pos.dist(enemy.pos) <= tower.range) {
                                showDamageNumber(k, enemy.pos, tower.damage);
                                enemy.hp -= tower.damage;
                            }
                        }

                        k.wait(0.3, () => {
                            if (!tower.exists()) return;
                            tower.attackState = "idle";
                            tower.use(k.sprite(idleFrames[tower.idleFrame]));
                        });
                    });
                }
            }
        }
    });
}

export function placePlatelet(k, dropPos, gameState) {
    const tower = k.add([
        k.sprite("platelet-idle"),
        k.pos(dropPos),
        k.anchor("center"),
        k.scale(0.075),
        k.z(50),
        "platelet",
        {
            attackTimer: GAME_CONFIG.towers.platelet.attackSpeed,
            idleTimer: 0,
            idleFrame: 0,
            range: GAME_CONFIG.towers.platelet.range,
            attackSpeed: GAME_CONFIG.towers.platelet.attackSpeed,
            damage: GAME_CONFIG.towers.platelet.damage,
            attackState: "idle"
        }
    ]);

    const idleFrames = ["platelet-idle", "platelet-idle2"];

    tower.onUpdate(() => {
        if (tower.attackState === "idle") {
            tower.idleTimer += k.dt();
            if (tower.idleTimer > 0.3) {
                tower.idleTimer = 0;
                tower.idleFrame = (tower.idleFrame + 1) % idleFrames.length;
                tower.use(k.sprite(idleFrames[tower.idleFrame]));
            }

            tower.attackTimer += k.dt();
            if (tower.attackTimer >= tower.attackSpeed) {
                const enemies = k.get("enemy");
                let nearestEnemy = null;
                let nearestDist = tower.range;

                for (const enemy of enemies) {
                    const dist = tower.pos.dist(enemy.pos);
                    if (dist <= tower.range && dist < nearestDist) {
                        nearestEnemy = enemy;
                        nearestDist = dist;
                    }
                }

                if (nearestEnemy) {
                    tower.attackTimer = 0;
                    tower.attackState = "prepare";
                    tower.use(k.sprite("platelet-prepare"));
                    const targetPos = nearestEnemy.pos.clone();

                    k.wait(0.2, () => {
                        if (!tower.exists()) return;
                        tower.attackState = "throw";
                        tower.use(k.sprite("platelet-throw"));

                        // Update target to enemy's current position for better accuracy
                        let finalTargetPos = targetPos;
                        if (nearestEnemy && nearestEnemy.exists()) {
                            finalTargetPos = nearestEnemy.pos.clone();
                        }

                        const projectile = k.add([
                            k.sprite("fibrin-projectile"),
                            k.pos(tower.pos),
                            k.anchor("center"),
                            k.scale(0.05),
                            k.z(30),
                            "fibrin-projectile",
                            {
                                speed: GAME_CONFIG.towers.platelet.projectileSpeed * 1.2,
                                targetPos: finalTargetPos,
                                damage: tower.damage,
                                duration: GAME_CONFIG.towers.platelet.netDuration,
                                slowEffect: GAME_CONFIG.towers.platelet.slowEffect
                            }
                        ]);

                        const dir = finalTargetPos.sub(tower.pos).unit();

                        projectile.onUpdate(() => {
                            if (projectile.pos.dist(projectile.targetPos) < 20) {
                                k.destroy(projectile);
                                // Create net trap
                                const net = k.add([
                                    k.sprite("fibrin-expanded"),
                                    k.pos(projectile.targetPos),
                                    k.anchor("center"),
                                    k.scale(0.08),
                                    k.area(),
                                    k.z(20),
                                    "fibrin-net",
                                    {
                                        timer: 0,
                                        duration: projectile.duration,
                                        slowEffect: projectile.slowEffect,
                                        elapsed: 0
                                    }
                                ]);

                                net.onUpdate(() => {
                                    net.elapsed += k.dt();
                                    if (net.elapsed >= net.duration) k.destroy(net);
                                });
                            } else {
                                projectile.move(dir.unit().scale(projectile.speed));
                            }
                        });

                        k.wait(0.3, () => {
                            if (!tower.exists()) return;
                            tower.attackState = "idle";
                            tower.use(k.sprite(idleFrames[tower.idleFrame]));
                        });
                    });
                }
            }
        }
    });
}

export function placeBasophil(k, dropPos, gameState) {
    const tower = k.add([
        k.sprite("basophil-idle"),
        k.pos(dropPos),
        k.anchor("center"),
        k.scale(0.075),
        k.z(50),
        "basophil",
        {
            attackTimer: GAME_CONFIG.towers.basophil.attackSpeed,
            idleTimer: 0,
            idleFrame: 0,
            range: GAME_CONFIG.towers.basophil.range,
            attackSpeed: GAME_CONFIG.towers.basophil.attackSpeed,
            damage: GAME_CONFIG.towers.basophil.damage,
            attackState: "idle"
        }
    ]);

    const idleFrames = ["basophil-idle", "basophil-idle2"];

    tower.onUpdate(() => {
        if (tower.attackState === "idle") {
            tower.idleTimer += k.dt();
            if (tower.idleTimer > 0.3) {
                tower.idleTimer = 0;
                tower.idleFrame = (tower.idleFrame + 1) % idleFrames.length;
                tower.use(k.sprite(idleFrames[tower.idleFrame]));
            }

            tower.attackTimer += k.dt();
            if (tower.attackTimer >= tower.attackSpeed) {
                const enemies = k.get("enemy");
                let nearestEnemy = null;
                let nearestDist = tower.range;

                for (const enemy of enemies) {
                    const dist = tower.pos.dist(enemy.pos);
                    if (dist <= tower.range && dist < nearestDist) {
                        nearestEnemy = enemy;
                        nearestDist = dist;
                    }
                }

                if (nearestEnemy) {
                    tower.attackTimer = 0;
                    tower.attackState = "throw";
                    tower.use(k.sprite("basophil-throw"));
                    const targetPos = nearestEnemy.pos.clone();

                    k.wait(0.2, () => {
                        if (!tower.exists()) return;

                        // Update target to enemy's current position for better accuracy
                        let finalTargetPos = targetPos;
                        if (nearestEnemy && nearestEnemy.exists()) {
                            finalTargetPos = nearestEnemy.pos.clone();
                        }

                        const projectile = k.add([
                            k.sprite("bomb-projectile"),
                            k.pos(tower.pos),
                            k.anchor("center"),
                            k.scale(0.05),
                            k.z(30),
                            "bomb-projectile",
                            {
                                speed: GAME_CONFIG.towers.basophil.projectileSpeed * 1.5, // Faster projectile
                                targetPos: finalTargetPos,
                                damage: tower.damage,
                                aoeRadius: GAME_CONFIG.towers.basophil.explosionRadius
                            }
                        ]);

                        const dir = finalTargetPos.sub(tower.pos).unit();

                        projectile.onUpdate(() => {
                            if (projectile.pos.dist(projectile.targetPos) < 20) {
                                k.destroy(projectile);
                                // Explosion
                                const explosion = k.add([
                                    k.sprite("explosion-effect"),
                                    k.pos(projectile.targetPos),
                                    k.anchor("center"),
                                    k.scale(0.1),
                                    k.z(40),
                                    "explosion"
                                ]);

                                // Deal AOE damage
                                const enemies = k.get("enemy");
                                for (const enemy of enemies) {
                                    if (enemy.pos.dist(projectile.targetPos) <= projectile.aoeRadius) {
                                        showDamageNumber(k, enemy.pos, projectile.damage);
                                        enemy.hp -= projectile.damage;
                                    }
                                }

                                k.wait(0.3, () => {
                                    if (explosion.exists()) k.destroy(explosion);
                                });
                            } else {
                                projectile.move(dir.unit().scale(projectile.speed));
                            }
                        });

                        k.wait(0.3, () => {
                            if (!tower.exists()) return;
                            tower.attackState = "idle";
                            tower.use(k.sprite(idleFrames[tower.idleFrame]));
                        });
                    });
                }
            }
        }
    });
}

export function placeNKCell(k, dropPos, gameState) {
    const tower = k.add([
        k.sprite("nk-cell-aim-down"),
        k.pos(dropPos),
        k.anchor("center"),
        k.scale(0.075),
        k.z(50),
        "nk-cell",
        {
            shootTimer: GAME_CONFIG.towers.nkCell.attackSpeed,
            range: GAME_CONFIG.towers.nkCell.range,
            attackSpeed: GAME_CONFIG.towers.nkCell.attackSpeed,
            damage: GAME_CONFIG.towers.nkCell.damage,
            currentDir: "down"
        }
    ]);

    tower.onUpdate(() => {
        tower.shootTimer += k.dt();

        // Find nearest enemy
        const enemies = k.get("enemy");
        let nearestEnemy = null;
        let nearestDist = tower.range;

        for (const enemy of enemies) {
            const dist = tower.pos.dist(enemy.pos);
            if (dist <= tower.range && dist < nearestDist) {
                nearestEnemy = enemy;
                nearestDist = dist;
            }
        }

        if (nearestEnemy) {
            // Update direction based on enemy position
            const dx = nearestEnemy.pos.x - tower.pos.x;
            const dy = nearestEnemy.pos.y - tower.pos.y;

            let newSprite = "nk-cell-aim-down";
            let flipX = false;

            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal aim
                newSprite = "nk-cell-aim-side";
                if (dx < 0) flipX = true; // Face left
            } else {
                // Vertical aim
                if (dy < 0) newSprite = "nk-cell-aim-up";
                else newSprite = "nk-cell-aim-down";
            }

            tower.use(k.sprite(newSprite));
            tower.flipX = flipX;

            // Shoot
            if (tower.shootTimer >= tower.attackSpeed) {
                tower.shootTimer = 0;

                // Use side-1 or up-1 for shooting frame if available, otherwise just shoot
                // For simplicity, we just spawn projectile

                const projectile = k.add([
                    k.sprite("y-antibody"), // Reusing antibody for now
                    k.pos(tower.pos),
                    k.anchor("center"),
                    k.scale(0.04),
                    k.area(),
                    k.z(30),
                    "projectile",
                    {
                        speed: GAME_CONFIG.towers.nkCell.projectileSpeed,
                        target: nearestEnemy,
                        damage: tower.damage
                    }
                ]);

                projectile.onUpdate(() => {
                    if (!projectile.target.exists()) {
                        k.destroy(projectile);
                        return;
                    }

                    const dir = projectile.target.pos.sub(projectile.pos).unit();
                    projectile.move(dir.scale(projectile.speed));

                    if (projectile.pos.dist(projectile.target.pos) < 20) {
                        showDamageNumber(k, projectile.target.pos, projectile.damage);
                        projectile.target.hp -= projectile.damage;
                        k.destroy(projectile);
                    }
                });
            }
        }
    });
}
