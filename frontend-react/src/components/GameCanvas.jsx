
import { useEffect, useRef, useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@onelabs/dapp-kit';
import { useNavigate } from 'react-router-dom';
import kaboom from 'kaboom';
import GAME_CONFIG from '../gameConfig.js';
import { UI_HEIGHT, getPaths, MAGIC_CARD_COSTS } from '../game/constants.js';
import { loadGameAssets } from '../game/assets.js';
import { setupGameUI, showDamageNumber } from '../game/ui.js';
import { GameState } from '../game/gameState.js';
import { setupShop, updateMagicCardCooldownVisuals, updateTowerVisuals, updateMagicCardVisuals } from '../game/shop.js';
import { setupInput } from '../game/interaction.js';
import { spawnWave, startNextWavePreparation, checkWaveCompletion, onWaveVictory } from '../game/waveManager.js';
import BlockchainService from '../services/BlockchainService.js';

function GameCanvas() {
    const [randomSeed, setRandomSeed] = useState(null);
    const [sbtStats, setSbtStats] = useState({});
    const canvasRef = useRef(null);
    const kRef = useRef(null);
    const account = useCurrentAccount();
    const client = useSuiClient();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch Blockchain Data
        const fetchData = async () => {
            if (account?.address) {
                const seed = await BlockchainService.getRandomness();
                setRandomSeed(seed);

                // Fetch SBT stats for towers
                const stats = await BlockchainService.getSBTStats(client, account.address);
                setSbtStats(stats);
            } else {
                // Default seed if no wallet connected
                setRandomSeed(Math.random());
            }
        };
        fetchData();
    }, [account]);

    useEffect(() => {
        // Don't initialize if already initialized or missing seed
        if (kRef.current || randomSeed === null) return;

        const initGame = () => {
            // Safety delay to ensure previous context is cleaned up
            setTimeout(() => {
                if (kRef.current) return; // Double check

                // Fixed logical resolution for consistent gameplay
                const LOGICAL_WIDTH = 1024;
                const LOGICAL_HEIGHT = 768;

                // Calculate scale to fit window while maintaining aspect ratio
                // We want to fit within the window minus some padding
                const availableWidth = window.innerWidth - 40;
                const availableHeight = window.innerHeight - 100;

                const scaleX = availableWidth / LOGICAL_WIDTH;
                const scaleY = availableHeight / LOGICAL_HEIGHT;
                const scale = Math.min(scaleX, scaleY);

                // Check if canvas element is ready
                if (!canvasRef.current) {
                    console.warn('Canvas element not ready yet');
                    return;
                }

                try {
                    const k = kaboom({
                        canvas: canvasRef.current,
                        background: [20, 20, 30],
                        width: LOGICAL_WIDTH,
                        height: LOGICAL_HEIGHT,
                        scale: scale, // Scale the entire game up/down
                        global: false,
                        debug: false, // Disable debug to prevent overlay crashes
                    });

                    kRef.current = k;
                    window.k = k; // For debugging

                    // Load Assets
                    loadGameAssets(k);

                    // Define Paths
                    const { path1Points, path2Points } = getPaths(k, LOGICAL_WIDTH);

                    // Define Game Scene
                    k.scene("main", () => {
                        // --- Background Texture (Organic Tissue) ---
                        // Spawn random "cells" in the background
                        for (let i = 0; i < 50; i++) {
                            k.add([
                                k.circle(k.rand(20, 100)),
                                k.pos(k.rand(0, k.width()), k.rand(0, k.height())),
                                k.color(30, 20, 40), // Dark purple/organic
                                k.opacity(0.05), // Reduced opacity
                                k.fixed(),
                                k.z(-10) // Behind everything
                            ]);
                        }

                        // --- Organic Obstacles (Bloons Style) ---
                        // Add some large "organs" or cell clusters in empty spaces
                        const obstacles = [
                            { pos: k.vec2(150, 350), size: 60, color: k.rgb(40, 20, 50) },
                            { pos: k.vec2(400, 150), size: 70, color: k.rgb(40, 20, 50) },
                            { pos: k.vec2(550, 450), size: 50, color: k.rgb(40, 20, 50) }
                        ];

                        obstacles.forEach(obs => {
                            k.add([
                                k.circle(obs.size),
                                k.pos(obs.pos),
                                k.color(obs.color),
                                k.opacity(0.4),
                                k.fixed(),
                                k.z(-5) // Behind paths but above background
                            ]);
                        });

                        // Draw Paths (Veins)
                        k.onDraw(() => {
                            const pulse = Math.sin(k.time() * 3) * 2; // Pulsing effect

                            // Main Path
                            // Glow/Bruise Layer
                            k.drawLines({
                                pts: path1Points,
                                width: 80,
                                color: k.rgb(50, 0, 0),
                                opacity: 0.2,
                                join: "round",
                                cap: "round",
                            });
                            // Outer Wall
                            k.drawLines({
                                pts: path1Points,
                                width: 70,
                                color: k.rgb(60, 5, 5), // Darker wall
                                join: "round",
                                cap: "round",
                            });
                            // Inner Stream (Blood)
                            k.drawLines({
                                pts: path1Points,
                                width: 55 + pulse,
                                color: k.rgb(180, 30, 30), // Vibrant blood red
                                join: "round",
                                cap: "round",
                            });
                        });

                        // Setup UI
                        const uiElements = setupGameUI(k, UI_HEIGHT);

                        // Initialize Game State
                        const gameState = new GameState(k, uiElements, (path) => {
                            // Cleanup Kaboom before navigating
                            try {
                                k.quit();
                            } catch (e) {
                                console.warn("Cleanup error:", e);
                            }
                            navigate(path);
                        });

                        // Load Magic Card Ownership
                        const magicTypes = ['heal', 'nuke', 'freeze', 'poison'];
                        magicTypes.forEach(type => {
                            // In a real app, we'd check blockchain/local storage here
                            // For now, we rely on the shop unlock state or force enable for testing if needed
                            // But let's respect the gameState.magicCards state which is updated by the shop
                        });

                        // Helper to activate magic card effects
                        function activateMagicCard(k, gameState, type) {
                            if (type === 'heal') {
                                gameState.updateHealth(50);
                                k.shake(5);
                                showMagicEffectText(k, "HEAL!", k.rgb(0, 255, 0));
                            } else if (type === 'nuke') {
                                k.get("enemy").forEach(e => {
                                    e.hp -= 500;
                                    showDamageNumber(k, e.pos, 500, gameState);
                                });
                                k.shake(20);
                                showMagicEffectText(k, "NUKE!", k.rgb(255, 0, 0));
                            } else if (type === 'freeze') {
                                k.get("enemy").forEach(e => {
                                    e.isFrozen = true;
                                    e.color = k.rgb(0, 255, 255); // Blue tint
                                    // Store original speed if not already stored
                                    if (!e.originalSpeed) e.originalSpeed = e.speed;
                                    e.speed = 0;

                                    // Unfreeze after 5 seconds
                                    k.wait(5, () => {
                                        if (e.exists()) {
                                            e.isFrozen = false;
                                            e.color = k.rgb(255, 255, 255);
                                            e.speed = e.originalSpeed;
                                        }
                                    });
                                });
                                showMagicEffectText(k, "FREEZE!", k.rgb(0, 255, 255));
                            } else if (type === 'poison') {
                                k.get("enemy").forEach(e => {
                                    e.isPoisoned = true;
                                    e.color = k.rgb(128, 0, 128); // Purple tint

                                    // Apply DoT
                                    const poisonInterval = k.loop(1, () => {
                                        if (!e.exists()) {
                                            poisonInterval.cancel();
                                            return;
                                        }
                                        e.hp -= 50;
                                        showDamageNumber(k, e.pos, 50, gameState);
                                    });

                                    // End poison after 10 seconds
                                    k.wait(10, () => {
                                        poisonInterval.cancel();
                                        if (e.exists()) {
                                            e.isPoisoned = false;
                                            e.color = k.rgb(255, 255, 255);
                                        }
                                    });
                                });
                                showMagicEffectText(k, "POISON!", k.rgb(128, 0, 128));
                            }
                        }

                        function showMagicEffectText(k, text, color) {
                            k.add([
                                k.text(text, { size: 48 }),
                                k.pos(k.width() / 2, k.height() / 2),
                                k.anchor("center"),
                                k.color(color),
                                k.lifespan(1),
                                k.fixed(),
                                k.z(200)
                            ]);
                        }

                        // Use randomness seed for something (e.g., initial money bonus)
                        if (randomSeed > 0.8) {
                            gameState.money += 50; // Lucky bonus!
                            k.add([
                                k.text("LUCKY BONUS! +$50", { size: 32, font: "monogram" }),
                                k.pos(k.width() / 2, k.height() / 2 + 80), // Moved down
                                k.anchor("center"),
                                k.color(255, 215, 0),
                                k.lifespan(3),
                                k.fixed(),
                                k.z(200)
                            ]);
                        }

                        // Setup Input (Drag & Drop)
                        const startDrag = setupInput(k, gameState, () => ({ path1Points, path2Points }));

                        // Setup Shop
                        setupShop(k, client, gameState, startDrag, account?.address, sbtStats,
                            // On Magic Card Click (Activate)
                            async (type) => {
                                if (gameState.magicCards[type].cooldownTimer > 0) return;
                                if (gameState.magicCards[type].count <= 0) return;

                                // Optimistic update? Or wait for chain?
                                // Let's wait for chain to be safe, or maybe optimistic for better UX?
                                // Given "updated to the backend as well", let's do chain first.
                                // But that might be slow.
                                // Let's try:
                                // 1. Check count > 0 (already done)
                                // 2. Call chain
                                // 3. If success, activate + decrement

                                console.log(`[Game] Using Magic Card: ${type}`);
                                const success = await BlockchainService.useMagicCard(client, account?.address, type, signAndExecute);

                                if (success) {
                                    gameState.magicCards[type].count--;
                                    // Update visual count
                                    const countText = k.get(`magic-count-${type}`);
                                    if (countText.length > 0) {
                                        countText[0].text = `x${gameState.magicCards[type].count}`;
                                    }

                                    activateMagicCard(k, gameState, type);
                                    gameState.magicCards[type].cooldownTimer = GAME_CONFIG.magicCards[type].cooldown;

                                    // If count becomes 0, lock it visually
                                    if (gameState.magicCards[type].count <= 0) {
                                        updateMagicCardVisuals(k, type, false);
                                    }
                                } else {
                                    console.log("[Game] Failed to use magic card");
                                }
                            },
                            // On Magic Card Purchase (Disabled in-game)
                            async (type, pos) => {
                                k.shake(2);
                                k.add([
                                    k.text("Please buy in store first!", { size: 14, font: "monospace" }),
                                    k.pos(pos.x, pos.y - 75),
                                    k.anchor("center"),
                                    k.color(248, 113, 113), // Red warning color
                                    k.z(200),
                                    k.lifespan(0.5, { fade: 0.5 })
                                ]);
                            }
                        );

                        // Wave Management Callbacks
                        const handleWaveVictory = async (walletAddress, signAndExecute) => {
                            // 1. Trigger Victory Visuals & Wait for Animation
                            await onWaveVictory(k, gameState, walletAddress, signAndExecute);

                            // The wave index has already been incremented by onWaveVictory
                            // So 'completedWave' is actually gameState.currentWaveIndex (which is now the NEXT wave number)
                            // Wait, let's check logic. 
                            // onWaveVictory: gameState.currentWaveIndex++
                            // So if we just finished Wave 1, currentWaveIndex became 2.
                            // So completedWave was currentWaveIndex - 1.
                            const completedWave = gameState.currentWaveIndex - 1;

                            // Check for automatic unlocks (Macrophage, etc.)
                            if (walletAddress && signAndExecute) {
                                // Wave 9 Victory -> Unlock Macrophage (for Wave 10)
                                if (completedWave === 9) {
                                    const hasMacrophage = await BlockchainService.checkUnlockSBT(walletAddress, 'macrophage');
                                    if (!hasMacrophage) {
                                        console.log("[Game] Unlocking Macrophage...");
                                        const success = await BlockchainService.mintMacrophageSBT(walletAddress, signAndExecute);
                                        if (success) {
                                            gameState.unlockedTowers.macrophage = true;
                                            updateTowerVisuals(k, 'macrophage', true);
                                        }
                                    }
                                }

                                // Wave 3 Victory -> Unlock Basophil (for Wave 4)
                                if (completedWave === 3) {
                                    const hasBasophil = await BlockchainService.checkUnlockSBT(walletAddress, 'basophil');
                                    if (!hasBasophil) {
                                        console.log("[Game] Unlocking Basophil...");
                                        const success = await BlockchainService.mintBasophilSBT(walletAddress, signAndExecute);
                                        if (success) {
                                            gameState.unlockedTowers.basophil = true;
                                            updateTowerVisuals(k, 'basophil', true);
                                        }
                                    }
                                }

                                // Wave 6 Victory -> Unlock Platelet (for Wave 7)
                                if (completedWave === 6) {
                                    const hasPlatelet = await BlockchainService.checkUnlockSBT(walletAddress, 'platelet');
                                    if (!hasPlatelet) {
                                        console.log("[Game] Unlocking Platelet...");
                                        const success = await BlockchainService.mintUnlockSBT(walletAddress, 'platelet', signAndExecute);
                                        if (success) {
                                            gameState.unlockedTowers.platelet = true;
                                            updateTowerVisuals(k, 'platelet', true);
                                        }
                                    }
                                }

                                // Wave 12 Victory -> Unlock NK Cell (for Wave 13)
                                if (completedWave === 12) {
                                    const hasNK = await BlockchainService.checkUnlockSBT(walletAddress, 'nk_cell');
                                    if (!hasNK) {
                                        console.log("[Game] Unlocking NK Cell...");
                                        const success = await BlockchainService.mintNKCellSBT(walletAddress, signAndExecute);
                                        if (success) {
                                            gameState.unlockedTowers.nkCell = true;
                                            updateTowerVisuals(k, 'nkCell', true);
                                        }
                                    }
                                }

                                // Wave Reward Roll (Wave 6+)
                                if (completedWave > 5) {
                                    console.log(`[Game] Wave ${completedWave} complete. Prompting for Magic Card reward...`);

                                    // Show "Claim Reward" Button
                                    const claimBtn = k.add([
                                        k.rect(400, 80, { radius: 8 }),
                                        k.pos(k.width() / 2, k.height() / 2 + 50),
                                        k.anchor("center"),
                                        k.color(255, 215, 0), // Gold
                                        k.outline(4, k.rgb(255, 255, 255)),
                                        k.area(),
                                        k.z(300),
                                        "claim-btn"
                                    ]);

                                    const btnText = k.add([
                                        k.text("✨ Roll for Magic Card! ✨", { size: 20, font: "monospace" }),
                                        k.pos(k.width() / 2, k.height() / 2 + 50),
                                        k.anchor("center"),
                                        k.color(0, 0, 0),
                                        k.z(301),
                                        "claim-text"
                                    ]);

                                    // Wait for user interaction
                                    await new Promise(resolve => {
                                        claimBtn.onClick(async () => {
                                            // Disable button
                                            claimBtn.color = k.rgb(100, 100, 100);
                                            btnText.text = "Rolling... Check Wallet";

                                            // 1. Snapshot current counts
                                            const prevCounts = { ...gameState.magicCards };
                                            // Deep copy counts specifically
                                            const prevHeal = prevCounts.heal.count;
                                            const prevNuke = prevCounts.nuke.count;
                                            const prevFreeze = prevCounts.freeze.count;
                                            const prevPoison = prevCounts.poison.count;

                                            // 2. Call Blockchain
                                            const success = await BlockchainService.claimWaveReward(client, walletAddress, completedWave, signAndExecute);

                                            if (success) {
                                                btnText.text = "Verifying Result...";

                                                // 3. Fetch updated inventory
                                                // Wait a moment for indexer? Usually local read after write is fast on Sui fullnodes but a small delay helps
                                                await new Promise(r => setTimeout(r, 1000));
                                                const newInventory = await BlockchainService.getMagicCardInventory(client, walletAddress);

                                                if (newInventory) {
                                                    // Update Game State
                                                    gameState.magicCards.heal.count = parseInt(newInventory.counts.heal || 0);
                                                    gameState.magicCards.nuke.count = parseInt(newInventory.counts.nuke || 0);
                                                    gameState.magicCards.freeze.count = parseInt(newInventory.counts.freeze || 0);
                                                    gameState.magicCards.poison.count = parseInt(newInventory.counts.poison || 0);

                                                    // Update Visuals
                                                    ['heal', 'nuke', 'freeze', 'poison'].forEach(type => {
                                                        updateMagicCardVisuals(k, type, gameState.magicCards[type].count > 0, gameState.magicCards[type].count);
                                                    });

                                                    // 4. Compare to find winner
                                                    let wonCard = null;
                                                    if (gameState.magicCards.heal.count > prevHeal) wonCard = "HEAL";
                                                    else if (gameState.magicCards.nuke.count > prevNuke) wonCard = "NUKE";
                                                    else if (gameState.magicCards.freeze.count > prevFreeze) wonCard = "FREEZE";
                                                    else if (gameState.magicCards.poison.count > prevPoison) wonCard = "POISON";

                                                    // 5. Display Result
                                                    if (wonCard) {
                                                        btnText.text = "🎉 WINNER! 🎉";
                                                        k.add([
                                                            k.text(`OBTAINED: ${wonCard} CARD!`, { size: 32, font: "monogram" }),
                                                            k.pos(k.width() / 2, k.height() / 2 + 120),
                                                            k.anchor("center"),
                                                            k.color(0, 255, 0), // Green
                                                            k.lifespan(4),
                                                            k.z(302)
                                                        ]);
                                                        // Celebration particles
                                                        for (let i = 0; i < 20; i++) {
                                                            k.add([
                                                                k.rect(5, 5),
                                                                k.pos(k.width() / 2, k.height() / 2 + 50),
                                                                k.color(k.rand(0, 255), k.rand(0, 255), k.rand(0, 255)),
                                                                k.move(k.Vec2.fromAngle(k.rand(0, 360)), k.rand(100, 300)),
                                                                k.lifespan(1),
                                                                k.z(302)
                                                            ]);
                                                        }
                                                    } else {
                                                        btnText.text = "No luck this time...";
                                                        k.add([
                                                            k.text("Try again next wave!", { size: 24 }),
                                                            k.pos(k.width() / 2, k.height() / 2 + 120),
                                                            k.anchor("center"),
                                                            k.color(200, 200, 200),
                                                            k.lifespan(3),
                                                            k.z(302)
                                                        ]);
                                                    }
                                                }
                                            } else {
                                                btnText.text = "Failed / Cancelled";
                                            }

                                            // Wait a bit before moving on
                                            setTimeout(() => {
                                                k.destroy(claimBtn);
                                                k.destroy(btnText);
                                                resolve();
                                            }, 3000); // Give time to read result
                                        });
                                    });
                                }
                            }

                            // Start Next Wave
                            startNextWavePreparation(k, gameState, () => {
                                spawnWave(k, gameState, () => ({ path1Points, path2Points }));
                            });
                        };

                        // Start First Wave
                        startNextWavePreparation(k, gameState, () => {
                            spawnWave(k, gameState, () => ({ path1Points, path2Points }));
                        });

                        // Game Loop for Wave Checking
                        k.onUpdate(() => {
                            if (gameState.isPaused) return; // Don't update when paused
                            checkWaveCompletion(k, gameState, handleWaveVictory, account?.address, signAndExecute);
                            // Update Magic Card Cooldowns
                            gameState.updateCooldowns(k.dt());

                            // Update UI for cooldowns
                            const magicTypes = ['heal', 'nuke', 'freeze', 'poison'];
                            magicTypes.forEach(type => {
                                if (gameState.magicCards[type].count > 0) {
                                    const t = gameState.magicCards[type].cooldownTimer;
                                    updateMagicCardCooldownVisuals(k, type, t);
                                }
                            });
                        });
                    });

                    // Start the game scene
                    k.go("main");
                } catch (err) {
                    console.error("Failed to initialize Kaboom:", err);
                }
            }, 100); // 100ms delay
        };

        initGame();

        // Cleanup on unmount
        return () => {
            try {
                if (kRef.current) {
                    kRef.current.quit();
                }
            } catch (e) {
                console.warn("Error cleaning up Kaboom:", e);
            } finally {
                kRef.current = null;
                window.k = null;
            }
        };
    }, [randomSeed]); // Re-run if seed changes

    return (
        <div className="game-canvas-container flex-center gradient-bg" style={{ minHeight: '100vh', paddingTop: '70px', position: 'relative' }}>
            <div className="canvas-wrapper glass-strong p-1" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <canvas ref={canvasRef} id="game-canvas" style={{ display: 'block', borderRadius: '12px' }}></canvas>
            </div>



            <button
                onClick={async () => {
                    if (confirm("⚠️ This will BURN all your game items (Macrophage, etc.) from the blockchain to reset your progress. Are you sure?")) {
                        if (account?.address) {
                            console.log("Initiating True Reset...");
                            const success = await BlockchainService.resetSBTs(client, account.address, signAndExecute);
                            if (!success) {
                                alert("Reset cancelled or failed.");
                                return;
                            }
                        }
                        localStorage.clear();
                        window.location.reload();
                    }
                }}
                style={{
                    position: 'absolute',
                    top: '80px', // Adjusted for padding
                    right: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    zIndex: 1000,
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                }}
            >
                RESET PROGRESS (BURN)
            </button>
            <button
                onClick={async () => {
                    if (!account?.address) {
                        alert("Please connect wallet first");
                        return;
                    }
                    console.log("Testing Mint...");
                    const success = await BlockchainService.mintMacrophageSBT(account.address, signAndExecute);
                    if (success) alert("Mint Success!");
                    else alert("Mint Failed - Check Console");
                }}
                style={{
                    position: 'absolute',
                    top: '120px', // Adjusted for padding
                    right: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#4444ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    zIndex: 1000,
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                }}
            >
                TEST MINT
            </button>
        </div>
    );
}

export default GameCanvas;
