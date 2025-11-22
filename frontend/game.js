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
        const v = Date.now() + 2; // Force new version (v2)
        k.loadSprite("b-cell-neutral", `assets/animation_frames/B-Cells/B-Cell_Idle(Neutral Form).png?v=${v}`);
        k.loadSprite("b-cell-squash", `assets/animation_frames/B-Cells/B-Cell_Idle(Squash Form).png?v=${v}`);
        k.loadSprite("b-cell-stretch", `assets/animation_frames/B-Cells/B-Cell_Idle(Stretch Form).png?v=${v}`);
        k.loadSprite("flu-virus", `assets/animation_frames/Flu-virus.png?v=${v}`);
        k.loadSprite("y-antibody", `assets/animation_frames/B-Cells/Y-Antibody_projectile.png?v=${v}`);

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
            const shopItem = k.add([
                k.sprite("b-cell-neutral"),
                k.pos(120, 50), // Moved right
                k.anchor("center"),
                k.scale(0.12),
                k.z(101),
                k.area(),
                "shop-item"
            ]);

            k.add([
                k.text("B-Cell", { size: 14 }),
                k.pos(120, 85), // Adjusted to match new B-Cell position
                k.anchor("center"),
                k.color(255, 255, 255), // Pure white
                k.z(101)
            ]);

            // Dragging State
            let isDragging = false;
            let dragSprite = null;

            // Handle Drag Start
            shopItem.onClick(() => {
                if (isDragging) return;
                isDragging = true;

                // Create a ghost sprite that follows mouse
                // Using the neutral frame for dragging
                dragSprite = k.add([
                    k.sprite("b-cell-neutral"),
                    k.pos(k.mousePos()),
                    k.anchor("center"),
                    k.scale(0.12), // Match shop scale
                    k.opacity(0.7),
                    k.z(200),
                    "drag-ghost"
                ]);
            });

            // Handle Dragging
            k.onUpdate(() => {
                if (isDragging && dragSprite) {
                    dragSprite.pos = k.mousePos();

                    // Visual feedback for validity
                    const validPos = k.mousePos().y > UI_HEIGHT && !isOnPath(k.mousePos());
                    // If valid, show normal color (white tint = no tint). If invalid, show red.
                    dragSprite.color = validPos ? k.rgb(255, 255, 255) : k.rgb(255, 100, 100);
                }
            });

            // Handle Drag End (Mouse Release)
            k.onMouseRelease(() => {
                if (!isDragging) return;

                const dropPos = k.mousePos();
                isDragging = false;

                if (dragSprite) {
                    k.destroy(dragSprite);
                    dragSprite = null;
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

                // Place Tower
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
                        shootTimer: 0,
                        range: 250,
                        attackSpeed: 0.5,
                        damage: 10
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
                                    speed: 400,
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
                                    projectile.target.hp -= projectile.damage;
                                    k.destroy(projectile);
                                }
                            });
                        }
                    }
                });
            });

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
                        speed: 100,
                        currentPointIndex: 0,
                        path: pathPoints,
                        hp: 80,
                        maxHp: 80
                    }
                ]);

                enemy.onUpdate(() => {
                    // Check if dead
                    if (enemy.hp <= 0) {
                        k.destroy(enemy);
                        return;
                    }

                    if (enemy.currentPointIndex >= enemy.path.length - 1) {
                        k.destroy(enemy);
                        return;
                    }

                    const target = enemy.path[enemy.currentPointIndex + 1];
                    const dir = target.sub(enemy.pos).unit();
                    enemy.move(dir.scale(enemy.speed));

                    if (enemy.pos.dist(target) < 5) {
                        enemy.currentPointIndex++;
                    }
                });
            }

            // Spawn Wave
            async function spawnWave() {
                for (let i = 0; i < 5; i++) {
                    // Alternate paths
                    const path = i % 2 === 0 ? path1Points : path2Points;
                    spawnEnemy(path);
                    await k.wait(1.5); // Wait 1.5 seconds between spawns
                }
            }

            // Start the first wave
            spawnWave();
        });

        // Start the scene
        k.go("main");
    }
});
