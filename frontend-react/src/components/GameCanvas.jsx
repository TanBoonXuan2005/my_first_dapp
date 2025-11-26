
import { useEffect, useRef, useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@onelabs/dapp-kit';
import { useNavigate } from 'react-router-dom';
import kaboom from 'kaboom';
import GAME_CONFIG from '../gameConfig.js';
import { UI_HEIGHT, getPaths } from '../game/constants.js';
import { loadGameAssets } from '../game/assets.js';
import { setupGameUI, showDamageNumber } from '../game/ui.js';
import { GameState } from '../game/gameState.js';
import { setupShop, updateMagicCardCooldownVisuals } from '../game/shop.js';
import { setupInput } from '../game/interaction.js';
import { spawnWave, startNextWavePreparation, checkWaveCompletion, onWaveVictory } from '../game/waveManager.js';
import BlockchainService from '../services/BlockchainService.js';

function GameCanvas() {
    const [randomSeed, setRandomSeed] = useState(null);
    const [sbtStats, setSbtStats] = useState({});
    const [usdtBalance, setUsdtBalance] = useState(0);
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

                // Fetch USDT Balance
                const balance = await BlockchainService.getUSDTBalance(client, account.address);
                setUsdtBalance(balance);
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

                // Check if canvas element is ready
                if (!canvasRef.current) {
                    console.warn('Canvas element not ready yet');
                    return;
                }

                try {
                    const k = kaboom({
                        canvas: canvasRef.current,
                        background: [20, 20, 30],
                        width: canvasWidth,
                        height: canvasHeight,
                        scale: 1,
                        global: false,
                        debug: false, // Disable debug to prevent overlay crashes
                    });

                    kRef.current = k;
                    window.k = k; // For debugging

                    // Load Assets
                    loadGameAssets(k);

                    // Define Paths
                    const { path1Points, path2Points } = getPaths(k, canvasWidth);

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
                                k.pos(canvasWidth / 2, canvasHeight / 2),
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
                        setupShop(k, gameState, startDrag, account?.address, sbtStats, (type) => {
                            if (gameState.magicCards[type].cooldownTimer <= 0) {
                                activateMagicCard(k, gameState, type);
                                gameState.magicCards[type].cooldownTimer = GAME_CONFIG.magicCards[type].cooldown;
                            }
                        });

                        // Wave Management Callbacks
                        const handleWaveVictory = (walletAddress, signAndExecute) => {
                            onWaveVictory(k, gameState, () => {
                                startNextWavePreparation(k, gameState, () => {
                                    spawnWave(k, gameState, () => ({ path1Points, path2Points }));
                                });
                            }, walletAddress, signAndExecute);
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
                                if (gameState.magicCards[type].owned) {
                                    const t = gameState.magicCards[type].cooldownTimer;
                                    // Import this dynamically or ensure it's available
                                    // Since we can't easily import inside the loop without refactoring imports, 
                                    // we'll assume updateMagicCardCooldownVisuals is available or we need to import it at top level.
                                    // Wait, I need to import it at the top of the file first.
                                    // For now, let's use the imported function.
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

            {/* USDT Balance Display */}
            <div style={{
                position: 'absolute',
                top: '80px',
                left: '20px',
                color: '#00ff00',
                fontSize: '20px',
                fontWeight: 'bold',
                zIndex: 1000,
                fontFamily: 'monospace',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #00ff00'
            }}>
                USDT: {usdtBalance.toLocaleString()}
            </div>

            <button
                onClick={() => {
                    localStorage.clear();
                    window.location.reload();
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
                RESET CACHE
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
