import { useEffect, useRef, useState } from 'react';
import kaboom from 'kaboom';
import GAME_CONFIG from '../gameConfig.js';

// Tower costs (ATP) for each tower type
const TOWER_COST = {
    bcell: 10,
    macrophage: 20,
    platelet: 15,
    basophil: 25,
};
import BlockchainService from '../services/BlockchainService.js';

function GameCanvas() {
    const [macrophageUnlocked, setMacrophageUnlocked] = useState(false);
    const canvasRef = useRef(null);
    const kRef = useRef(null);

    useEffect(() => {
        // Don't initialize if already initialized
        if (kRef.current) return;

        const initGame = () => {
            // Calculate responsive canvas size
            const maxWidth = Math.min(window.innerWidth - 40, 1200);
            const maxHeight = Math.min(window.innerHeight - 100, 800);
            const aspectRatio = 4 / 3;

            let canvasWidth = maxWidth;
            let canvasHeight = canvasWidth / aspectRatio;

            if (canvasHeight > maxHeight) {
                canvasHeight = maxHeight;
                canvasWidth = canvasHeight * aspectRatio;
            }

            const k = kaboom({
                canvas: canvasRef.current,
                background: [20, 20, 30],
                width: canvasWidth,
                height: canvasHeight,
                scale: 1,
                global: false,
                debug: true,
            });

            kRef.current = k;
            window.k = k; // For debugging

            // Load all assets with full paths (matching vanilla version structure)
            const v = Date.now();
            k.loadSprite("b-cell-neutral", `/assets/animation_frames/B-Cells/B-Cell_Idle(Neutral Form).png?v=${v}`);
            k.loadSprite("b-cell-squash", `/assets/animation_frames/B-Cells/B-Cell_Idle(Squash Form).png?v=${v}`);
            k.loadSprite("b-cell-stretch", `/assets/animation_frames/B-Cells/B-Cell_Idle(Stretch Form).png?v=${v}`);
            k.loadSprite("flu-virus", `/assets/animation_frames/Flu Virus/Flu-virus.png?v=${v}`);
            k.loadSprite("flu-virus-death", `/assets/animation_frames/Flu Virus/Flu-virus_Death.png?v=${v}`);
            k.loadSprite("y-antibody", `/assets/animation_frames/B-Cells/Y-Antibody_projectile.png?v=${v}`);
            k.loadSprite("macrophage-idle-neutral", `/assets/animation_frames/Macrophage/Macrophage_Idle(Neutral).png?v=${v}`);
            k.loadSprite("macrophage-idle-excited", `/assets/animation_frames/Macrophage/Macrophage_Idle(Excited).png?v=${v}`);
            k.loadSprite("macrophage-prepare", `/assets/animation_frames/Macrophage/Macrophage_Attack(Prepare_To_Eat).png?v=${v}`);
            k.loadSprite("macrophage-attack", `/assets/animation_frames/Macrophage/Macrophage_Attack(Big_Munch).png?v=${v}`);
            k.loadSprite("platelet-idle", `/assets/animation_frames/Platelet/Platelet_Idle.png?v=${v}`);
            k.loadSprite("platelet-idle2", `/assets/animation_frames/Platelet/Platelet_Idle1.png?v=${v}`);
            k.loadSprite("platelet-prepare", `/assets/animation_frames/Platelet/Platelet_PrepareToThrow.png?v=${v}`);
            k.loadSprite("platelet-throw", `/assets/animation_frames/Platelet/Platelet_AfterThrowSwing.png?v=${v}`);
            k.loadSprite("fibrin-projectile", `/assets/animation_frames/Platelet/Fibrin-net_Projectile.png?v=${v}`);
            k.loadSprite("fibrin-expanded", `/assets/animation_frames/Platelet/Fibrin-net_Expanded.png?v=${v}`);
            k.loadSprite("basophil-idle", `/assets/animation_frames/Basophil/Basophil_Idle.png?v=${v}`);
            k.loadSprite("basophil-idle2", `/assets/animation_frames/Basophil/Basophil_Idle1.png?v=${v}`);
            k.loadSprite("basophil-throw", `/assets/animation_frames/Basophil/Basophil_Throw.png?v=${v}`);
            k.loadSprite("bomb-projectile", `/assets/animation_frames/Basophil/Histamin_Bomb_Projectile.png?v=${v}`);
            k.loadSprite("explosion-effect", `/assets/animation_frames/Basophil/Explosion_Effect.png?v=${v}`);

            // Define Paths
            const path1Points = [
                k.vec2(0, 150),
                k.vec2(200, 150),
                k.vec2(300, 250),
                k.vec2(500, 250),
                k.vec2(600, 300),
                k.vec2(canvasWidth, 300)
            ];

            const path2Points = [
                k.vec2(0, 450),
                k.vec2(200, 450),
                k.vec2(300, 350),
                k.vec2(500, 350),
                k.vec2(600, 300),
                k.vec2(canvasWidth, 300)
            ];

            const UI_HEIGHT = 100;

            // Helper functions
            function distToSegment(p, v, w) {
                const l2 = v.dist(w) * v.dist(w);
                if (l2 === 0) return p.dist(v);
                let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
                t = Math.max(0, Math.min(1, t));
                const projection = k.vec2(v.x + t * (w.x - v.x), v.y + t * (w.y - v.y));
                return p.dist(projection);
            }

            function isOnPath(pos) {
                const pathWidth = 40;
                for (let i = 0; i < path1Points.length - 1; i++) {
                    if (distToSegment(pos, path1Points[i], path1Points[i + 1]) < pathWidth) return true;
                }
                for (let i = 0; i < path2Points.length - 1; i++) {
                    if (distToSegment(pos, path2Points[i], path2Points[i + 1]) < pathWidth) return true;
                }
                return false;
            }
            // Helper to check if a placement position is free (no overlap and not on path)
            function isPlacementFree(pos) {
                if (isOnPath(pos)) return false;
                // Check overlap with existing towers
                const towerTags = ["b-cell", "macrophage", "platelet", "basophil"];
                for (const tag of towerTags) {
                    const towers = k.get(tag);
                    for (const t of towers) {
                        if (t.pos.dist(pos) < 30) { // minimum distance between towers
                            return false;
                        }
                    }
                }
                return true;
            }
            function showDamageNumber(pos, damage) {
                const damageText = k.add([
                    k.text(`-${damage}`, { size: 20 }),
                    k.pos(pos.add(k.vec2(0, -30))),
                    k.anchor("center"),
                    k.color(255, 50, 50),
                    k.z(150),
                    k.opacity(1),
                    "damage-number"
                ]);

                let elapsed = 0;
                damageText.onUpdate(() => {
                    elapsed += k.dt();
                    damageText.pos.y -= k.dt() * 30;
                    damageText.opacity = 1 - (elapsed / 0.8);
                    if (elapsed >= 0.8) k.destroy(damageText);
                });
            }

            // Define Game Scene
            k.scene("main", () => {
                // Draw Paths
                k.onDraw(() => {
                    k.drawLines({
                        pts: path1Points,
                        width: 60,
                        color: k.rgb(60, 0, 0),
                        join: "round",
                        cap: "round",
                    });
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
                    k.z(100),
                    "ui-bg"
                ]);

                k.add([
                    k.text("SHOP", { size: 24, font: "monospace" }),
                    k.pos(40, 50),
                    k.anchor("center"),
                    k.color(255, 255, 255),
                    k.z(101)
                ]);

                // Game State
                let playerHealth = 100;
                let playerATP = 50;  // Starting ATP (currency)
                let gameActive = true;

                // Health Display
                const healthText = k.add([
                    k.text(`❤️ Health: ${playerHealth}`, { size: 20 }),
                    k.pos(k.width() - 120, 30),
                    k.anchor("center"),
                    k.color(255, 100, 100),
                    k.z(101),
                    "health-text"
                ]);

                // ATP Display (currency)
                const atpText = k.add([
                    k.text(`⚡ ATP: ${playerATP}`, { size: 20 }),
                    k.pos(k.width() - 120, 60),
                    k.anchor("center"),
                    k.color(100, 255, 255),
                    k.z(101),
                    "atp-text"
                ]);

                // Update health display
                function updateHealth(amount) {
                    playerHealth += amount;
                    healthText.text = `❤️ Health: ${playerHealth}`;

                    if (playerHealth <= 0) {
                        gameOver();
                    }
                }

                // Update ATP display
                function updateATP(amount) {
                    playerATP += amount;
                    atpText.text = `⚡ ATP: ${playerATP}`;

                    // Flash color on change
                    if (amount > 0) {
                        atpText.color = k.rgb(150, 255, 150); // Green for gain
                    } else {
                        atpText.color = k.rgb(255, 150, 150); // Red for spend
                    }
                    k.wait(0.2, () => {
                        atpText.color = k.rgb(100, 255, 255); // Back to cyan
                    });
                }

                // Game Over
                function gameOver() {
                    gameActive = false;
                    k.add([
                        k.text("GAME OVER", { size: 48 }),
                        k.pos(k.width() / 2, k.height() / 2 - 50),
                        k.anchor("center"),
                        k.color(255, 50, 50),
                        k.z(300)
                    ]);
                    k.add([
                        k.text("Refresh to try again", { size: 24 }),
                        k.pos(k.width() / 2, k.height() / 2 + 20),
                        k.anchor("center"),
                        k.color(200, 200, 200),
                        k.z(300)
                    ]);
                }

                // Shop Items
                const shopItemBCell = k.add([
                    k.sprite("b-cell-neutral"),
                    k.pos(120, 50),
                    k.anchor("center"),
                    k.scale(0.06),
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

                // Cost label
                k.add([
                    k.text(`Cost: ${TOWER_COST.bcell}`, { size: 12 }),
                    k.pos(120, 105),
                    k.anchor("center"),
                    k.color(200, 200, 0),
                    k.z(101)
                ]);


                // SBT System - Check if Macrophage is unlocked
                const walletState = JSON.parse(sessionStorage.getItem('walletState'));
                let isMacrophageUnlocked = false;
                let shopItemMacrophage = null;
                let macrophageLabel = null;

                // Function to create Macrophage shop item
                function createMacrophageShopItem() {
                    if (shopItemMacrophage) return; // Already exists

                    shopItemMacrophage = k.add([
                        k.sprite("macrophage-idle-neutral"),
                        k.pos(200, 50),
                        k.anchor("center"),
                        k.scale(0.06),
                        k.z(101),
                        k.area(),
                        "shop-item-macrophage"
                    ]);

                    macrophageLabel = k.add([
                        k.text("Macrophage", { size: 14 }),
                        k.pos(200, 85),
                        k.anchor("center"),
                        k.color(255, 255, 255),
                        k.z(101)
                    ]);

                    // Cost label
                    k.add([
                        k.text(`Cost: ${TOWER_COST.macrophage}`, { size: 12 }),
                        k.pos(200, 105),
                        k.anchor("center"),
                        k.color(200, 200, 0),
                        k.z(101)
                    ]);

                    // Set up click handler
                    setupMacrophageClickHandler();
                }

                // Set up Macrophage click handler
                function setupMacrophageClickHandler() {
                    if (!shopItemMacrophage) return;

                    shopItemMacrophage.onClick(() => {
                        // Check if Macrophage is locked (SBT not earned)
                        if (!isMacrophageUnlocked) {
                            k.shake(8);
                            // Show message
                            const lockMsg = k.add([
                                k.text("Complete Wave 1 to unlock!", { size: 18 }),
                                k.pos(k.width() / 2, 120),
                                k.anchor("center"),
                                k.color(255, 100, 100),
                                k.z(200),
                                k.opacity(1)
                            ]);
                            k.wait(2, () => k.destroy(lockMsg));
                            return;
                        }

                        if (isDragging) return;
                        isDragging = true;
                        selectedTowerType = "macrophage";
                        dragSprite = k.add([
                            k.sprite("macrophage-idle-neutral"),
                            k.pos(k.mousePos()),
                            k.anchor("center"),
                            k.scale(0.06),
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
                }

                if (walletState && walletState.address) {
                    BlockchainService.checkMacrophageUnlock(walletState.address).then(unlocked => {
                        isMacrophageUnlocked = unlocked;
                        setMacrophageUnlocked(unlocked);

                        if (unlocked) {
                            // Create the shop item if unlocked
                            createMacrophageShopItem();
                        }
                        // If not unlocked, don't create it at all - it will be created after victory
                    });
                } else {
                    // No wallet connected - Macrophage stays hidden
                    isMacrophageUnlocked = false;
                }

                const shopItemPlatelet = k.add([
                    k.sprite("platelet-idle"),
                    k.pos(280, 50),
                    k.anchor("center"),
                    k.scale(0.06),
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

                // Cost label
                k.add([
                    k.text(`Cost: ${TOWER_COST.platelet}`, { size: 12 }),
                    k.pos(280, 105),
                    k.anchor("center"),
                    k.color(200, 200, 0),
                    k.z(101)
                ]);

                const shopItemBasophil = k.add([
                    k.sprite("basophil-idle"),
                    k.pos(360, 50),
                    k.anchor("center"),
                    k.scale(0.06),
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

                // Cost label
                k.add([
                    k.text(`Cost: ${TOWER_COST.basophil}`, { size: 12 }),
                    k.pos(360, 105),
                    k.anchor("center"),
                    k.color(200, 200, 0),
                    k.z(101)
                ]);

                // Drag state
                let isDragging = false;
                let dragSprite = null;
                let rangeIndicator = null;
                let selectedTowerType = null;

                // Shop click handlers
                shopItemBCell.onClick(() => {
                    if (isDragging) return;
                    isDragging = true;
                    selectedTowerType = "bcell";
                    dragSprite = k.add([
                        k.sprite("b-cell-neutral"),
                        k.pos(k.mousePos()),
                        k.anchor("center"),
                        k.scale(0.06),
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

                shopItemPlatelet.onClick(() => {
                    if (isDragging) return;
                    isDragging = true;
                    selectedTowerType = "platelet";
                    dragSprite = k.add([
                        k.sprite("platelet-idle"),
                        k.pos(k.mousePos()),
                        k.anchor("center"),
                        k.scale(0.06),
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

                shopItemBasophil.onClick(() => {
                    if (isDragging) return;
                    isDragging = true;
                    selectedTowerType = "basophil";
                    dragSprite = k.add([
                        k.sprite("basophil-idle"),
                        k.pos(k.mousePos()),
                        k.anchor("center"),
                        k.scale(0.06),
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
                        if (rangeIndicator) rangeIndicator.pos = k.mousePos();
                        const validPos = k.mousePos().y > UI_HEIGHT && !isOnPath(k.mousePos());
                        dragSprite.color = validPos ? k.rgb(255, 255, 255) : k.rgb(255, 100, 100);
                    }
                });

                // Handle Mouse Release
                k.onMouseRelease(() => {
                    if (!isDragging) return;
                    const dropPos = k.mousePos();
                    isDragging = false;

                    if (dragSprite) {
                        k.destroy(dragSprite);
                        dragSprite = null;
                    }

                    if (rangeIndicator) {
                        k.destroy(rangeIndicator);
                        rangeIndicator = null;
                    }

                    // Validate placement
                    if (dropPos.y <= UI_HEIGHT || !isPlacementFree(dropPos)) {
                        k.shake(5);
                        return;
                    }

                    const cost = TOWER_COST[selectedTowerType];
                    if (playerATP < cost) {
                        // Not enough ATP
                        const msg = k.add([
                            k.text("Not enough ATP!", { size: 18 }),
                            k.pos(k.width() / 2, 120),
                            k.anchor("center"),
                            k.color(255, 100, 100),
                            k.z(200),
                            k.opacity(1)
                        ]);
                        k.wait(2, () => k.destroy(msg));
                        selectedTowerType = null;
                        return;
                    }

                    // Deduct ATP
                    updateATP(-cost);

                    // Place tower
                    if (selectedTowerType === "bcell") placeBCell(dropPos);
                    else if (selectedTowerType === "macrophage") placeMacrophage(dropPos);
                    else if (selectedTowerType === "platelet") placePlatelet(dropPos);
                    else if (selectedTowerType === "basophil") placeBasophil(dropPos);

                    selectedTowerType = null;
                });

                // Tower placement functions (abbreviated for space - I'll include full versions)
                function placeBCell(dropPos) {
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
                                        showDamageNumber(projectile.target.pos, projectile.damage);
                                        projectile.target.hp -= projectile.damage;
                                        k.destroy(projectile);
                                    }
                                });
                            }
                        }
                    });
                }

                function placeMacrophage(dropPos) {
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
                                                showDamageNumber(enemy.pos, tower.damage);
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

                function placePlatelet(dropPos) {
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

                                        const projectile = k.add([
                                            k.sprite("fibrin-projectile"),
                                            k.pos(tower.pos),
                                            k.anchor("center"),
                                            k.scale(0.05),
                                            k.z(30),
                                            "fibrin-projectile",
                                            {
                                                speed: GAME_CONFIG.towers.platelet.projectileSpeed,
                                                targetPos: targetPos,
                                                damage: tower.damage,
                                                hasLanded: false
                                            }
                                        ]);

                                        projectile.onUpdate(() => {
                                            if (projectile.hasLanded) return;
                                            const dir = projectile.targetPos.sub(projectile.pos);
                                            const dist = dir.len();

                                            if (dist < 15) {
                                                projectile.hasLanded = true;
                                                const landPos = projectile.pos.clone();
                                                k.destroy(projectile);

                                                const enemies = k.get("enemy");
                                                for (const enemy of enemies) {
                                                    if (enemy.pos.dist(landPos) < 30) {
                                                        showDamageNumber(enemy.pos, tower.damage);
                                                        enemy.hp -= tower.damage;
                                                    }
                                                }

                                                const net = k.add([
                                                    k.sprite("fibrin-expanded"),
                                                    k.pos(landPos),
                                                    k.anchor("center"),
                                                    k.scale(0.075),
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

                function placeBasophil(dropPos) {
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

                                    const projectile = k.add([
                                        k.sprite("bomb-projectile"),
                                        k.pos(tower.pos),
                                        k.anchor("center"),
                                        k.scale(0.05),
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

                                        if (dist < 15) {
                                            projectile.hasExploded = true;
                                            const explosionPos = projectile.pos.clone();
                                            k.destroy(projectile);

                                            const explosion = k.add([
                                                k.sprite("explosion-effect"),
                                                k.pos(explosionPos),
                                                k.anchor("center"),
                                                k.scale(0.1),
                                                k.z(40)
                                            ]);

                                            const enemies = k.get("enemy");
                                            for (const enemy of enemies) {
                                                if (enemy.pos.dist(explosionPos) <= GAME_CONFIG.towers.basophil.explosionRadius) {
                                                    showDamageNumber(enemy.pos, tower.damage);
                                                    enemy.hp -= tower.damage;
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
                                }
                            }
                        }
                    });
                }

                // Enemy spawning
                function spawnEnemy(pathPoints, waveConfig) {
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
                    ]); enemy.onUpdate(() => {
                        if (enemy.hp <= 0) {
                            enemy.use(k.sprite("flu-virus-death"));
                            enemy.speed = 0;
                            enemy.unuse("enemy");
                            enemy.use("dead-enemy");

                            // Enemy killed - increment processed counter
                            totalEnemiesProcessed++;
                            console.log(`[Enemy] Killed. Total processed: ${totalEnemiesProcessed}/${totalEnemiesSpawned}`);

                            // Wait a bit for cleanup, then check wave completion
                            k.wait(1.2, () => {
                                checkWaveCompletion();
                            });

                            k.wait(1, () => k.destroy(enemy));
                            return;
                        }


                        // Enemy reached the end - damage player
                        if (enemy.currentPointIndex >= enemy.path.length - 1) {
                            updateHealth(-10);
                            totalEnemiesProcessed++; // Enemy escaped - count as processed
                            console.log(`[Enemy] Escaped. Total processed: ${totalEnemiesProcessed}/${totalEnemiesSpawned}`);

                            k.destroy(enemy);

                            // Wait a bit for cleanup, then check wave completion
                            k.wait(0.5, () => {
                                checkWaveCompletion();
                            });
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
                        const dir = target.sub(enemy.pos).unit();
                        const effectiveSpeed = enemy.speed * slowMultiplier;
                        enemy.move(dir.scale(effectiveSpeed));

                        if (enemy.pos.dist(target) < 5) {
                            enemy.currentPointIndex++;
                        }
                    });
                }

                // Wave management
                let currentWaveIndex = 0;
                let totalEnemiesSpawned = 0;
                let totalEnemiesProcessed = 0; // Killed OR escaped
                let waveCompleted = false;
                let preparationCountdown = null;
                let waveNumberText = null;

                // Wave number display
                waveNumberText = k.add([
                    k.text(`Wave ${currentWaveIndex + 1}`, { size: 28 }),
                    k.pos(k.width() / 2, 30),
                    k.anchor("center"),
                    k.color(255, 255, 100),
                    k.z(101),
                    "wave-number-text"
                ]);

                async function spawnWave() {
                    const waveConfig = GAME_CONFIG.waves[currentWaveIndex];
                    if (!waveConfig) {
                        console.log("No more waves!");
                        return;
                    }

                    totalEnemiesSpawned = waveConfig.enemyCount;
                    totalEnemiesProcessed = 0;
                    waveCompleted = false;

                    console.log(`🌊 Starting Wave ${waveConfig.waveNumber}`);

                    for (let i = 0; i < waveConfig.enemyCount; i++) {
                        const path = i % 2 === 0 ? path1Points : path2Points;
                        spawnEnemy(path, waveConfig);
                        await k.wait(waveConfig.spawnDelay);
                    }
                }

                // Check wave completion - only when ALL enemies are gone
                function checkWaveCompletion() {
                    console.log(`[Wave Check] processed: ${totalEnemiesProcessed}/${totalEnemiesSpawned}, completed: ${waveCompleted}, active: ${gameActive}`);

                    if (!waveCompleted && totalEnemiesProcessed >= totalEnemiesSpawned && totalEnemiesSpawned > 0 && gameActive) {
                        // Double-check no enemies remain on the map
                        const remainingEnemies = k.get("enemy");
                        console.log(`[Wave Check] Remaining enemies: ${remainingEnemies.length}`);

                        if (remainingEnemies.length === 0) {
                            waveCompleted = true;

                            // Check if player won (has health remaining)
                            if (playerHealth > 0) {
                                console.log("[Wave Check] VICTORY!");
                                onWaveVictory();
                            } else {
                                console.log("[Wave Check] Lost (health = 0)");
                            }
                        }
                    }
                }

                // Wave Victory - player survives with health > 0
                async function onWaveVictory() {
                    console.log(`🎉 Wave ${currentWaveIndex + 1} Victory!`);
                    gameActive = false; // Pause game

                    // Show victory message
                    k.add([
                        k.text(`WAVE ${currentWaveIndex + 1} COMPLETE!`, { size: 40 }),
                        k.pos(k.width() / 2, k.height() / 2 - 100),
                        k.anchor("center"),
                        k.color(100, 255, 100),
                        k.z(250),
                        "victory-msg"
                    ]);

                    k.add([
                        k.text(`Health Remaining: ${playerHealth}`, { size: 24 }),
                        k.pos(k.width() / 2, k.height() / 2 - 50),
                        k.anchor("center"),
                        k.color(255, 255, 100),
                        k.z(250),
                        "health-msg"
                    ]);

                    // Check for SBT unlocks based on wave number
                    if (currentWaveIndex === 0 && walletState && walletState.address && !isMacrophageUnlocked) {
                        // Wave 1 complete - unlock Macrophage
                        await BlockchainService.mintMacrophageSBT(walletState.address);
                        isMacrophageUnlocked = true;
                        setMacrophageUnlocked(true);

                        // Create the Macrophage shop item now that it's unlocked
                        createMacrophageShopItem();

                        // Show unlock message below victory message
                        const celebrationMsg = k.add([
                            k.text("🎉 MACROPHAGE UNLOCKED!", { size: 32 }),
                            k.pos(k.width() / 2, k.height() / 2 + 20),
                            k.anchor("center"),
                            k.color(100, 255, 100),
                            k.z(250),
                            k.scale(0),
                        ]);

                        //  Animate celebration
                        let t = 0;
                        celebrationMsg.onUpdate(() => {
                            t += k.dt();
                            celebrationMsg.scale = Math.min(t * 2, 1);
                        });
                    }

                    // Check if there are more waves
                    if (currentWaveIndex < GAME_CONFIG.waves.length - 1) {
                        // More waves to go!
                        k.wait(3, () => {
                            currentWaveIndex++;
                            startNextWavePreparation();
                        });
                    } else {
                        // All waves complete!
                        k.add([
                            k.text("🏆 ALL WAVES COMPLETE! 🏆", { size: 36 }),
                            k.pos(k.width() / 2, k.height() / 2 + 80),
                            k.anchor("center"),
                            k.color(255, 215, 0),
                            k.z(250)
                        ]);
                    }
                }

                // Start preparation phase for next wave
                function startNextWavePreparation() {
                    // Clear victory messages
                    k.destroyAll("victory-msg");
                    k.destroyAll("health-msg");

                    gameActive = true; // Reactivate game for tower placement
                    const nextWave = GAME_CONFIG.waves[currentWaveIndex];

                    // Update wave number display
                    if (waveNumberText) {
                        waveNumberText.text = `Wave ${nextWave.waveNumber}`;
                    }

                    // Show preparation message
                    const prepMsg = k.add([
                        k.text(`Prepare for Wave ${nextWave.waveNumber}!`, { size: 32 }),
                        k.pos(k.width() / 2, k.height() / 2 - 50),
                        k.anchor("center"),
                        k.color(255, 200, 100),
                        k.z(250),
                        "prep-msg"
                    ]);

                    // Countdown timer
                    let timeRemaining = nextWave.preparationTime;
                    preparationCountdown = k.add([
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
                            spawnWave();
                        }
                    });
                }

                // Start first wave with preparation time
                startNextWavePreparation();
            });

            // Start the game scene immediately
            // Kaboom will handle sprite loading automatically
            k.go("main");
        };

        initGame();

        return () => {
            if (kRef.current) {
                kRef.current = null;
            }
        };
    }, []);

    return (
        <div id="game-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            minHeight: '100vh',
            background: '#111',
            padding: '1rem'
        }}>
            <canvas
                ref={canvasRef}
                id="gameCanvas"
                style={{
                    background: '#222',
                    border: '2px solid #6ea8fe',
                    borderRadius: '8px',
                    cursor: 'crosshair',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
                    maxWidth: '100%'
                }}
            />
        </div>
    );
}

export default GameCanvas;
