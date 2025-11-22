document.addEventListener("DOMContentLoaded", () => {
    const playBtn = document.getElementById("play-btn");
    const homeScreen = document.getElementById("home-screen");
    const gameContainer = document.getElementById("game-container");
    const canvas = document.getElementById("gameCanvas");

    let k = null;

    if (playBtn) {
        playBtn.addEventListener("click", () => {
            // Hide Home, Show Game
            homeScreen.style.display = "none";
            gameContainer.style.display = "flex";

            // Initialize Kaboom only when needed
            if (!k) {
                initGame();
            }
        });
    }

    function initGame() {
        k = kaboom({
            canvas: canvas,
            background: [20, 20, 30], // Dark biological background
            width: 800,
            height: 600,
            scale: 1,
            global: false,
            debug: true,
        });

        // Load Assets with cache busting
        const v = Date.now() + 8; // Force new version (v8)
        k.loadSprite("b-cell-neutral", `assets/animation_frames/B-Cells/B-Cell_Idle(Neutral Form).png?v=${v}`);
        k.loadSprite("b-cell-squash", `assets/animation_frames/B-Cells/B-Cell_Idle(Squash Form).png?v=${v}`);
        k.loadSprite("b-cell-stretch", `assets/animation_frames/B-Cells/B-Cell_Idle(Stretch Form).png?v=${v}`);
        k.loadSprite("flu-virus", `assets/animation_frames/Flu Virus/Flu-virus.png?v=${v}`);
        k.loadSprite("flu-virus-death", `assets/animation_frames/Flu Virus/Flu-virus_Death.png?v=${v}`);
        k.loadSprite("y-antibody", `assets/animation_frames/B-Cells/Y-Antibody_projectile.png?v=${v}`);
        k.loadSprite("macrophage-idle-neutral", `assets/animation_frames/Macrophage/Macrophage_Idle(Neutral).png?v=${v}`);
        k.loadSprite("macrophage-idle-excited", `assets/animation_frames/Macrophage/Macrophage_Idle(Excited).png?v=${v}`);
        k.loadSprite("macrophage-prepare", `assets/animation_frames/Macrophage/Macrophage_Attack(Prepare_To_Eat).png?v=${v}`);
        k.loadSprite("macrophage-attack", `assets/animation_frames/Macrophage/Macrophage_Attack(Big_Munch).png?v=${v}`);
        k.loadSprite("platelet-idle", `assets/animation_frames/Platelet/Platelet_Idle.png?v=${v}`);
        k.loadSprite("platelet-idle2", `assets/animation_frames/Platelet/Platelet_Idle1.png?v=${v}`);
        k.loadSprite("platelet-prepare", `assets/animation_frames/Platelet/Platelet_PrepareToThrow.png?v=${v}`);
        k.loadSprite("platelet-throw", `assets/animation_frames/Platelet/Platelet_AfterThrowSwing.png?v=${v}`);
        k.loadSprite("fibrin-projectile", `assets/animation_frames/Platelet/Fibrin-net_Projectile.png?v=${v}`);
        k.loadSprite("fibrin-expanded", `assets/animation_frames/Platelet/Fibrin-net_Expanded.png?v=${v}`);
        k.loadSprite("basophil-idle", `assets/animation_frames/Basophil/Basophil_Idle.png?v=${v}`);
        k.loadSprite("basophil-idle2", `assets/animation_frames/Basophil/Basophil_Idle1.png?v=${v}`);
        k.loadSprite("basophil-throw", `assets/animation_frames/Basophil/Basophil_Throw.png?v=${v}`);
        k.loadSprite("bomb-projectile", `assets/animation_frames/Basophil/Histamin_Bomb_Projectile.png?v=${v}`);
        k.loadSprite("explosion-effect", `assets/animation_frames/Basophil/Explosion_Effect.png?v=${v}`);

        // Define Paths (Waypoints)
        // Path 1: Top path
        const path1Points = [
            k.vec2(0, 150),
            k.vec2(200, 150),
            k.vec2(300, 250),
            k.vec2(500, 250),
            k.vec2(600, 300), // Convergence point
            k.vec2(800, 300)  // End
        ];

        // Path 2: Bottom path
        const path2Points = [
            k.vec2(0, 450),
            k.vec2(200, 450),
            k.vec2(300, 350),
            k.vec2(500, 350),
            k.vec2(600, 300), // Convergence point
            k.vec2(800, 300)  // End
        ];

        const UI_HEIGHT = 100;

        // Helper: Distance from point to line segment
        function distToSegment(p, v, w) {
            const l2 = v.dist(w) * v.dist(w);
            if (l2 === 0) return p.dist(v);
            let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
            t = Math.max(0, Math.min(1, t));
            const projection = k.vec2(v.x + t * (w.x - v.x), v.y + t * (w.y - v.y));
            return p.dist(projection);
        }

        // Helper: Check if point is on any path
        function isOnPath(pos) {
            const pathWidth = 40; // Half-width of the path (allowance)

            // Check Path 1
            for (let i = 0; i < path1Points.length - 1; i++) {
                if (distToSegment(pos, path1Points[i], path1Points[i + 1]) < pathWidth) {
                    return true;
                }
            }

            // Check Path 2
            for (let i = 0; i < path2Points.length - 1; i++) {
                if (distToSegment(pos, path2Points[i], path2Points[i + 1]) < pathWidth) {
                    return true;
                }
            }

            return false;
        }

        // Define Game Scene
        k.scene("main", () => {
            // Draw the Map/Path visually
            k.onDraw(() => {
                // Draw Path 1
                k.drawLines({
                    pts: path1Points,
                    width: 60,
                    color: k.rgb(60, 0, 0),
                    join: "round",
                    cap: "round",
                });

                // Draw Path 2
                k.drawLines({
                    pts: path2Points,
                    width: 60,
                    color: k.rgb(60, 0, 0),
                    join: "round",
                    cap: "round",
                });
            });

            // UI Background
            k.add([
                k.rect(k.width(), UI_HEIGHT),
                k.pos(0, 0),
                k.color(50, 50, 60),
                k.z(100), // Ensure UI is on top
                "ui-bg"
            ]);

            k.add([
                k.text("SHOP", { size: 24, font: "monospace" }), // Made slightly larger and monospace for style
                k.pos(40, 50), // Centered vertically on the left
                k.anchor("center"),
                k.color(255, 255, 255),
                k.z(101)
            ]);

            // Shop Item: B-Cell
            const shopItemBCell = k.add([
                k.sprite("b-cell-neutral"),
                k.pos(120, 50),
                k.anchor("center"),
                k.scale(0.12),
                k.z(101),
                k.area(),
                "shop-item-bcell"
            ]);

            k.add([
                k.text("B-Cell", { size: 14 }),
                k.pos(120, 85),
                k.anchor("center"),
                k.color(255, 255, 255),
                k.z(101)
            ]);

            // Shop Item: Macrophage
            const shopItemMacrophage = k.add([
                k.sprite("macrophage-idle-neutral"),
                k.pos(200, 50),
                k.anchor("center"),
                k.scale(0.12),
                k.z(101),
                k.area(),
                "shop-item-macrophage"
            ]);

            k.add([
                k.text("Macrophage", { size: 14 }),
                k.pos(200, 85),
                k.anchor("center"),
                k.color(255, 255, 255),
                k.z(101)
            ]);

            // Shop Item: Platelet
            const shopItemPlatelet = k.add([
                k.sprite("platelet-idle"),
                k.pos(280, 50),
                k.anchor("center"),
                k.scale(0.12),
                k.z(101),
                k.area(),
                "shop-item-platelet"
            ]);

            k.add([
                k.text("Platelet", { size: 14 }),
                k.pos(280, 85),
                k.anchor("center"),
                k.color(255, 255, 255),
                k.z(101)
            ]);

            // Shop Item: Basophil
            const shopItemBasophil = k.add([
                k.sprite("basophil-idle"),
                k.pos(360, 50),
                k.anchor("center"),
                k.scale(0.12),
                k.z(101),
                k.area(),
                "shop-item-basophil"
            ]);

            k.add([
                k.text("Basophil", { size: 14 }),
                k.pos(360, 85),
                k.anchor("center"),
                k.color(255, 255, 255),
                k.z(101)
            ]);

            // Dragging State
            let isDragging = false;
            let dragSprite = null;
            let rangeIndicator = null;
            let selectedTowerType = null;

            // Handle Drag Start - B-Cell
            shopItemBCell.onClick(() => {
                if (isDragging) return;
                isDragging = true;
                selectedTowerType = "bcell";

                dragSprite = k.add([
                    k.sprite("b-cell-neutral"),
                    k.pos(k.mousePos()),
                    k.anchor("center"),
                    k.scale(0.12),
                    k.opacity(0.7),
                    k.z(200),
                    "drag-ghost"
                ]);

                rangeIndicator = k.add([
                    k.circle(GAME_CONFIG.towers.bCell.range),
                    k.pos(k.mousePos()),
                    k.anchor("center"),
                    k.opacity(0.2),
                    k.color(100, 200, 255),
                    k.outline(2, k.rgb(100, 200, 255)),
                    k.z(199),
                    "range-indicator"
                ]);
            });

            // Handle Drag Start - Macrophage
            shopItemMacrophage.onClick(() => {
                if (isDragging) return;
                isDragging = true;
                selectedTowerType = "macrophage";

                dragSprite = k.add([
                    k.sprite("macrophage-idle-neutral"),
                    k.pos(k.mousePos()),
                    k.anchor("center"),
                    k.scale(0.12),
                    k.opacity(0.7),
                    k.z(200),
                    "drag-ghost"
                ]);

                rangeIndicator = k.add([
                    k.circle(GAME_CONFIG.towers.macrophage.range),
                    k.pos(k.mousePos()),
                    k.anchor("center"),
                    k.opacity(0.2),
                    k.color(200, 100, 255),
                    k.outline(2, k.rgb(200, 100, 255)),
                    k.z(199),
                    "range-indicator"
                ]);
            });

            // Handle Drag Start - Platelet
            shopItemPlatelet.onClick(() => {
                if (isDragging) return;
                isDragging = true;
                selectedTowerType = "platelet";

                dragSprite = k.add([
                    k.sprite("platelet-idle"),
                    k.pos(k.mousePos()),
                    k.anchor("center"),
                    k.scale(0.12),
                    k.opacity(0.7),
                    k.z(200),
                    "drag-ghost"
                ]);

                rangeIndicator = k.add([
                    k.circle(GAME_CONFIG.towers.platelet.range),
                    k.pos(k.mousePos()),
                    k.anchor("center"),
                    k.opacity(0.2),
                    k.color(100, 255, 100),
                    k.outline(2, k.rgb(100, 255, 100)),
                    k.z(199),
                    "range-indicator"
                ]);
            });

            // Handle Drag Start - Basophil
            shopItemBasophil.onClick(() => {
                if (isDragging) return;
                isDragging = true;
                selectedTowerType = "basophil";

                dragSprite = k.add([
                    k.sprite("basophil-idle"),
                    k.pos(k.mousePos()),
                    k.anchor("center"),
                    k.scale(0.12),
                    k.opacity(0.7),
                    k.z(200),
                    "drag-ghost"
                ]);

                rangeIndicator = k.add([
                    k.circle(GAME_CONFIG.towers.basophil.range),
                    k.pos(k.mousePos()),
                    k.anchor("center"),
                    k.opacity(0.2),
                    k.color(255, 150, 50),
                    k.outline(2, k.rgb(255, 150, 50)),
                    k.z(199),
                    "range-indicator"
                ]);
            });

            // Handle Dragging
            k.onUpdate(() => {
                if (isDragging && dragSprite) {
                    dragSprite.pos = k.mousePos();

                    // Update range indicator position
                    if (rangeIndicator) {
                        rangeIndicator.pos = k.mousePos();
                    }

                    // Visual feedback for validity
                    const validPos = k.mousePos().y > UI_HEIGHT && !isOnPath(k.mousePos());
                    // If valid, show normal color (white tint = no tint). If invalid, show red.
                    dragSprite.color = validPos ? k.rgb(255, 255, 255) : k.rgb(255, 100, 100);
                }
            });

            // Helper: Show damage number
            function showDamageNumber(pos, damage) {
                const damageText = k.add([
                    k.text(`-${damage}`, { size: 20 }),
                    k.pos(pos.add(k.vec2(0, -30))),
                    k.anchor("center"),
                    k.color(255, 50, 50), // Red
                    k.z(150),
                    k.opacity(1),
                    "damage-number"
                ]);

                // Animate: float up and fade out
                let elapsed = 0;
                damageText.onUpdate(() => {
                    elapsed += k.dt();
                    damageText.pos.y -= k.dt() * 30; // Float up
                    damageText.opacity = 1 - (elapsed / 0.8); // Fade out over 0.8s

                    if (elapsed >= 0.8) {
                        k.destroy(damageText);
                    }
                });
            }

            // Handle Drag End (Mouse Release)
            k.onMouseRelease(() => {
                if (!isDragging) return;

                const dropPos = k.mousePos();
                isDragging = false;

                if (dragSprite) {
                    k.destroy(dragSprite);
                    dragSprite = null;
                }

                // Remove range indicator
                if (rangeIndicator) {
                    k.destroy(rangeIndicator);
                    rangeIndicator = null;
                }

                // Validate Placement
                // 1. Must be below UI
                if (dropPos.y <= UI_HEIGHT) return;

                // 2. Must NOT be on path
                if (isOnPath(dropPos)) {
                    // Optional: Show error effect
                    k.shake(5);
                    return;
                }

                // Place Tower based on selectedTowerType
                if (selectedTowerType === "bcell") {
                    placeBCell(dropPos);
                } else if (selectedTowerType === "macrophage") {
                    placeMacrophage(dropPos);
                } else if (selectedTowerType === "platelet") {
                    placePlatelet(dropPos);
                } else if (selectedTowerType === "basophil") {
                    placeBasophil(dropPos);
                }

                selectedTowerType = null;
            });

            // Function to place B-Cell tower
            function placeBCell(dropPos) {
                const bCell = k.add([
                    k.sprite("b-cell-neutral"),
                    k.pos(dropPos),
                    k.anchor("center"),
                    k.scale(0.15),
                    k.opacity(1),
                    k.color(255, 255, 255),
                    k.z(50),
                    "b-cell",
                    {
                        timer: 0,
                        animFrame: 0,
                        shootTimer: GAME_CONFIG.towers.bCell.attackSpeed, // Start ready to attack
                        range: GAME_CONFIG.towers.bCell.range,
                        attackSpeed: GAME_CONFIG.towers.bCell.attackSpeed,
                        damage: GAME_CONFIG.towers.bCell.damage
                    }
                ]);

                // Animation loop
                // Cycle: Neutral -> Squash -> Neutral ...
                // This creates a "breathing" or "bouncing" effect without stretching
                const idleFrames = ["b-cell-neutral", "b-cell-squash", "b-cell-neutral"];

                bCell.onUpdate(() => {
                    // Idle animation
                    bCell.timer += k.dt();
                    if (bCell.timer > 0.15) {
                        bCell.timer = 0;
                        bCell.animFrame = (bCell.animFrame + 1) % idleFrames.length;
                        bCell.use(k.sprite(idleFrames[bCell.animFrame]));
                    }

                    // Combat logic
                    bCell.shootTimer += k.dt();
                    if (bCell.shootTimer >= bCell.attackSpeed) {
                        // Find nearest enemy in range
                        const enemies = k.get("enemy");
                        let nearestEnemy = null;
                        let nearestDist = bCell.range;

                        for (const enemy of enemies) {
                            const dist = bCell.pos.dist(enemy.pos);
                            if (dist <= bCell.range && dist < nearestDist) {
                                nearestEnemy = enemy;
                                nearestDist = dist;
                            }
                        }

                        // Shoot at nearest enemy
                        if (nearestEnemy) {
                            bCell.shootTimer = 0;

                            // Create projectile
                            const projectile = k.add([
                                k.sprite("y-antibody"),
                                k.pos(bCell.pos),
                                k.anchor("center"),
                                k.scale(0.08),
                                k.area(),
                                k.z(30),
                                "projectile",
                                {
                                    speed: GAME_CONFIG.towers.bCell.projectileSpeed,
                                    target: nearestEnemy,
                                    damage: bCell.damage
                                }
                            ]);

                            projectile.onUpdate(() => {
                                if (!projectile.target.exists()) {
                                    k.destroy(projectile);
                                    return;
                                }

                                const dir = projectile.target.pos.sub(projectile.pos).unit();
                                projectile.move(dir.scale(projectile.speed));

                                // Check collision
                                if (projectile.pos.dist(projectile.target.pos) < 20) {
                                    // Show damage number
                                    showDamageNumber(projectile.target.pos, projectile.damage);

                                    // Apply damage
                                    projectile.target.hp -= projectile.damage;
                                    k.destroy(projectile);
                                }
                            });
                        }
                    }
                });
            }

            // Function to place Macrophage tower
            function placeMacrophage(dropPos) {
                const macrophage = k.add([
                    k.sprite("macrophage-idle-neutral"),
                    k.pos(dropPos),
                    k.anchor("center"),
                    k.scale(0.15),
                    k.opacity(1),
                    k.color(255, 255, 255),
                    k.z(50),
                    "macrophage",
                    {
                        attackTimer: GAME_CONFIG.towers.macrophage.attackSpeed, // Start ready to attack
                        idleTimer: 0,
                        idleFrame: 0,
                        range: GAME_CONFIG.towers.macrophage.range,
                        attackSpeed: GAME_CONFIG.towers.macrophage.attackSpeed,
                        damage: GAME_CONFIG.towers.macrophage.damage,
                        attackState: "idle" // States: "idle", "prepare", "attack"
                    }
                ]);

                const idleFrames = ["macrophage-idle-neutral", "macrophage-idle-excited"];

                macrophage.onUpdate(() => {
                    if (macrophage.attackState === "idle") {
                        // Idle animation cycle
                        macrophage.idleTimer += k.dt();
                        if (macrophage.idleTimer > 0.3) { // Change idle frame every 0.3s
                            macrophage.idleTimer = 0;
                            macrophage.idleFrame = (macrophage.idleFrame + 1) % idleFrames.length;
                            macrophage.use(k.sprite(idleFrames[macrophage.idleFrame]));
                        }

                        // Check for attack
                        macrophage.attackTimer += k.dt();
                        if (macrophage.attackTimer >= macrophage.attackSpeed) {
                            // Check for enemies in range
                            const enemies = k.get("enemy");
                            let hasEnemyInRange = false;

                            for (const enemy of enemies) {
                                const dist = macrophage.pos.dist(enemy.pos);
                                if (dist <= macrophage.range) {
                                    hasEnemyInRange = true;
                                    break;
                                }
                            }

                            // Start attack sequence if enemies in range
                            if (hasEnemyInRange) {
                                macrophage.attackTimer = 0;
                                macrophage.attackState = "prepare";
                                macrophage.use(k.sprite("macrophage-prepare"));

                                // Transition to attack after prepare animation
                                k.wait(0.2, () => {
                                    if (!macrophage.exists()) return;

                                    macrophage.attackState = "attack";
                                    macrophage.use(k.sprite("macrophage-attack"));

                                    // Deal area damage
                                    const enemies = k.get("enemy");
                                    for (const enemy of enemies) {
                                        const dist = macrophage.pos.dist(enemy.pos);
                                        if (dist <= macrophage.range) {
                                            showDamageNumber(enemy.pos, macrophage.damage);
                                            enemy.hp -= macrophage.damage;
                                        }
                                    }

                                    // Return to idle after attack
                                    k.wait(0.3, () => {
                                        if (!macrophage.exists()) return;
                                        macrophage.attackState = "idle";
                                        macrophage.use(k.sprite(idleFrames[macrophage.idleFrame]));
                                    });
                                });
                            }
                        }
                    }
                });
            }

            // Function to place Platelet tower
            function placePlatelet(dropPos) {
                const platelet = k.add([
                    k.sprite("platelet-idle"),
                    k.pos(dropPos),
                    k.anchor("center"),
                    k.scale(0.15),
                    k.opacity(1),
                    k.color(255, 255, 255),
                    k.z(50),
                    "platelet",
                    {
                        attackTimer: GAME_CONFIG.towers.platelet.attackSpeed, // Start ready to attack
                        idleTimer: 0,
                        idleFrame: 0,
                        range: GAME_CONFIG.towers.platelet.range,
                        attackSpeed: GAME_CONFIG.towers.platelet.attackSpeed,
                        damage: GAME_CONFIG.towers.platelet.damage,
                        attackState: "idle" // States: "idle", "prepare", "throw"
                    }
                ]);

                const idleFrames = ["platelet-idle", "platelet-idle2"];

                platelet.onUpdate(() => {
                    if (platelet.attackState === "idle") {
                        // Idle animation cycle
                        platelet.idleTimer += k.dt();
                        if (platelet.idleTimer > 0.3) {
                            platelet.idleTimer = 0;
                            platelet.idleFrame = (platelet.idleFrame + 1) % idleFrames.length;
                            platelet.use(k.sprite(idleFrames[platelet.idleFrame]));
                        }

                        // Check for attack
                        platelet.attackTimer += k.dt();
                        if (platelet.attackTimer >= platelet.attackSpeed) {
                            // Find nearest enemy in range
                            const enemies = k.get("enemy");
                            let nearestEnemy = null;
                            let nearestDist = platelet.range;

                            for (const enemy of enemies) {
                                const dist = platelet.pos.dist(enemy.pos);
                                if (dist <= platelet.range && dist < nearestDist) {
                                    nearestEnemy = enemy;
                                    nearestDist = dist;
                                }
                            }

                            // Start throw sequence if enemy in range
                            if (nearestEnemy) {
                                platelet.attackTimer = 0;
                                platelet.attackState = "prepare";
                                platelet.use(k.sprite("platelet-prepare"));

                                const targetEnemy = nearestEnemy;
                                const targetPos = targetEnemy.pos.clone();

                                // Transition to throw after prepare animation
                                k.wait(0.2, () => {
                                    if (!platelet.exists()) return;

                                    platelet.attackState = "throw";
                                    platelet.use(k.sprite("platelet-throw"));

                                    // Create fibrin net projectile
                                    const projectile = k.add([
                                        k.sprite("fibrin-projectile"),
                                        k.pos(platelet.pos),
                                        k.anchor("center"),
                                        k.scale(0.1),
                                        k.z(30),
                                        "fibrin-projectile",
                                        {
                                            speed: GAME_CONFIG.towers.platelet.projectileSpeed,
                                            targetPos: targetPos,
                                            damage: platelet.damage,
                                            hasLanded: false
                                        }
                                    ]);

                                    projectile.onUpdate(() => {
                                        if (projectile.hasLanded) return;

                                        const dir = projectile.targetPos.sub(projectile.pos);
                                        const dist = dir.len();

                                        if (dist < 5) {
                                            // Projectile landed
                                            projectile.hasLanded = true;
                                            const landPos = projectile.pos.clone();
                                            k.destroy(projectile);

                                            // Deal damage to enemy at landing spot
                                            const enemiesNearLanding = k.get("enemy");
                                            for (const enemy of enemiesNearLanding) {
                                                if (enemy.pos.dist(landPos) < 30) {
                                                    showDamageNumber(enemy.pos, GAME_CONFIG.towers.platelet.damage);
                                                    enemy.hp -= GAME_CONFIG.towers.platelet.damage;
                                                }
                                            }

                                            // Create expanded net at landing location
                                            const expandedNet = k.add([
                                                k.sprite("fibrin-expanded"),
                                                k.pos(landPos),
                                                k.anchor("center"),
                                                k.scale(0.15),
                                                k.opacity(0.6),
                                                k.z(5),
                                                k.area(),
                                                "fibrin-net",
                                                {
                                                    slowEffect: GAME_CONFIG.towers.platelet.slowEffect,
                                                    duration: GAME_CONFIG.towers.platelet.netDuration,
                                                    elapsed: 0
                                                }
                                            ]);

                                            // Remove net after duration
                                            expandedNet.onUpdate(() => {
                                                expandedNet.elapsed += k.dt();
                                                if (expandedNet.elapsed >= expandedNet.duration) {
                                                    k.destroy(expandedNet);
                                                }
                                            });
                                        } else {
                                            projectile.move(dir.unit().scale(projectile.speed));
                                        }
                                    });

                                    // Return to idle after throw
                                    k.wait(0.3, () => {
                                        if (!platelet.exists()) return;
                                        platelet.attackState = "idle";
                                        platelet.use(k.sprite(idleFrames[platelet.idleFrame]));
                                    });
                                });
                            }
                        }
                    }
                });
            }

            // Function to place Basophil tower
            function placeBasophil(dropPos) {
                const basophil = k.add([
                    k.sprite("basophil-idle"),
                    k.pos(dropPos),
                    k.anchor("center"),
                    k.scale(0.15),
                    k.opacity(1),
                    k.color(255, 255, 255),
                    k.z(50),
                    "basophil",
                    {
                        attackTimer: GAME_CONFIG.towers.basophil.attackSpeed, // Start ready to attack
                        idleTimer: 0,
                        idleFrame: 0,
                        range: GAME_CONFIG.towers.basophil.range,
                        attackSpeed: GAME_CONFIG.towers.basophil.attackSpeed,
                        damage: GAME_CONFIG.towers.basophil.damage,
                        attackState: "idle"
                    }
                ]);

                const idleFrames = ["basophil-idle", "basophil-idle2"];

                basophil.onUpdate(() => {
                    if (basophil.attackState === "idle") {
                        basophil.idleTimer += k.dt();
                        if (basophil.idleTimer > 0.3) {
                            basophil.idleTimer = 0;
                            basophil.idleFrame = (basophil.idleFrame + 1) % idleFrames.length;
                            basophil.use(k.sprite(idleFrames[basophil.idleFrame]));
                        }

                        basophil.attackTimer += k.dt();
                        if (basophil.attackTimer >= basophil.attackSpeed) {
                            const enemies = k.get("enemy");
                            let nearestEnemy = null;
                            let nearestDist = basophil.range;

                            for (const enemy of enemies) {
                                const dist = basophil.pos.dist(enemy.pos);
                                if (dist <= basophil.range && dist < nearestDist) {
                                    nearestEnemy = enemy;
                                    nearestDist = dist;
                                }
                            }

                            if (nearestEnemy) {
                                basophil.attackTimer = 0;
                                basophil.attackState = "throw";
                                basophil.use(k.sprite("basophil-throw"));

                                const targetPos = nearestEnemy.pos.clone();

                                const projectile = k.add([
                                    k.sprite("bomb-projectile"),
                                    k.pos(basophil.pos),
                                    k.anchor("center"),
                                    k.scale(0.1),
                                    k.z(30),
                                    {
                                        speed: GAME_CONFIG.towers.basophil.projectileSpeed,
                                        targetPos: targetPos,
                                        hasExploded: false
                                    }
                                ]);

                                projectile.onUpdate(() => {
                                    if (projectile.hasExploded) return;

                                    const dir = projectile.targetPos.sub(projectile.pos);
                                    const dist = dir.len();

                                    // Explode when close to target
                                    if (dist < 15) {
                                        projectile.hasExploded = true;
                                        const explosionPos = projectile.pos.clone();
                                        k.destroy(projectile);

                                        const explosion = k.add([
                                            k.sprite("explosion-effect"),
                                            k.pos(explosionPos),
                                            k.anchor("center"),
                                            k.scale(0.2),
                                            k.z(40)
                                        ]);

                                        const enemies = k.get("enemy");
                                        for (const enemy of enemies) {
                                            if (enemy.pos.dist(explosionPos) <= GAME_CONFIG.towers.basophil.explosionRadius) {
                                                showDamageNumber(enemy.pos, GAME_CONFIG.towers.basophil.damage);
                                                enemy.hp -= GAME_CONFIG.towers.basophil.damage;
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
                                    if (!basophil.exists()) return;
                                    basophil.attackState = "idle";
                                    basophil.use(k.sprite(idleFrames[basophil.idleFrame]));
                                });
                            }
                        }
                    }
                });
            }

            // Enemy Logic
            function spawnEnemy(pathPoints) {
                const enemy = k.add([
                    k.sprite("flu-virus"),
                    k.pos(pathPoints[0]),
                    k.anchor("center"),
                    k.scale(0.12),
                    k.area(),
                    k.z(10), // Below towers
                    "enemy",
                    {
                        speed: GAME_CONFIG.enemies.fluVirus.speed,
                        currentPointIndex: 0,
                        path: pathPoints,
                        hp: GAME_CONFIG.enemies.fluVirus.hp,
                        maxHp: GAME_CONFIG.enemies.fluVirus.hp
                    }
                ]);

                enemy.onUpdate(() => {
                    // Check if dead
                    if (enemy.hp <= 0) {
                        // Change to death sprite
                        enemy.use(k.sprite("flu-virus-death"));

                        // Stop movement
                        enemy.speed = 0;

                        // Remove from enemy tag so towers stop targeting
                        enemy.unuse("enemy");
                        enemy.use("dead-enemy");

                        // Destroy after 1 second
                        k.wait(1, () => {
                            k.destroy(enemy);
                        });
                        return;
                    }

                    if (enemy.currentPointIndex >= enemy.path.length - 1) {
                        k.destroy(enemy);
                        return;
                    }

                    // Check if enemy is on a fibrin net
                    const nets = k.get("fibrin-net");
                    let slowMultiplier = 1.0;
                    for (const net of nets) {
                        if (enemy.pos.dist(net.pos) < 50) { // Within net range
                            slowMultiplier = 1.0 - net.slowEffect; // 30% slow = 0.7x speed
                            break;
                        }
                    }

                    const target = enemy.path[enemy.currentPointIndex + 1];
                    const dir = target.sub(enemy.pos).unit();
                    const effectiveSpeed = enemy.speed * slowMultiplier;
                    enemy.move(dir.scale(effectiveSpeed));

                    if (enemy.pos.dist(target) < 5) {
                        enemy.currentPointIndex++;
                    }
                });
            }

            // Spawn Wave
            async function spawnWave() {
                for (let i = 0; i < GAME_CONFIG.waves.first.enemyCount; i++) {
                    // Alternate paths
                    const path = i % 2 === 0 ? path1Points : path2Points;
                    spawnEnemy(path);
                    await k.wait(GAME_CONFIG.waves.first.spawnDelay);
                }
            }

            // Start the first wave
            spawnWave();
        });

        // Start the scene
        k.go("main");
    }
});
