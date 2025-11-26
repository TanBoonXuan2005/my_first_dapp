
import { useEffect, useRef, useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@onelabs/dapp-kit';
import { useNavigate } from 'react-router-dom';
import kaboom from 'kaboom';
import GAME_CONFIG from '../gameConfig.js';
import { UI_HEIGHT, getPaths } from '../game/constants.js';
import { loadGameAssets } from '../game/assets.js';
import { setupGameUI, showDamageNumber } from '../game/ui.js';
import { GameState } from '../game/gameState.js';
import { setupShop } from '../game/shop.js';
import { setupInput } from '../game/interaction.js';
import { spawnWave, startNextWavePreparation, checkWaveCompletion, onWaveVictory } from '../game/waveManager.js';
import BlockchainService from '../services/BlockchainService.js';

function GameCanvas() {
    const [randomSeed, setRandomSeed] = useState(null);
    const canvasRef = useRef(null);
    const kRef = useRef(null);
    const account = useCurrentAccount();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch Blockchain Data
        const fetchData = async () => {
            if (account?.address) {
                const seed = await BlockchainService.getRandomness();
                setRandomSeed(seed);
                
                // Pre-fetch magic card ownership to pass to game state
                // We'll store this in a ref or just rely on the service cache if it's fast enough
                // But better to pass it to GameState
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

                        // Load Magic Card Ownership (Force Enabled for Testing)
                        // if (account?.address) {
                            // BlockchainService.checkMagicCard(account.address, 'heal').then(owned => {
                                const ownedHeal = true; // Force enable
                                gameState.magicCards.heal.owned = ownedHeal;
                                if (ownedHeal) {
                                    uiElements.magicBtns.heal.btn.opacity = 1;
                                    uiElements.magicBtns.heal.btn.onClick(() => {
                                        if (gameState.magicCards.heal.cooldownTimer <= 0) {
                                            gameState.updateHealth(50);
                                            gameState.magicCards.heal.cooldownTimer = GAME_CONFIG.magicCards.heal.cooldown;
                                            k.shake(5);
                                            k.add([
                                                k.text("HEAL!", { size: 32 }),
                                                k.pos(k.width()/2, k.height()/2),
                                                k.anchor("center"),
                                                k.color(0, 255, 0),
                                                k.lifespan(1),
                                                k.fixed(),
                                                k.z(200)
                                            ]);
                                        }
                                    });
                                }
                            // });

                            // BlockchainService.checkMagicCard(account.address, 'nuke').then(owned => {
                                const ownedNuke = true; // Force enable
                                gameState.magicCards.nuke.owned = ownedNuke;
                                if (ownedNuke) {
                                    uiElements.magicBtns.nuke.btn.opacity = 1;
                                    uiElements.magicBtns.nuke.btn.onClick(() => {
                                        if (gameState.magicCards.nuke.cooldownTimer <= 0) {
                                            // Damage all enemies
                                            k.get("enemy").forEach(e => {
                                                e.hp -= 500;
                                                // Show damage number
                                                showDamageNumber(k, e.pos, 500, gameState);
                                            });
                                            gameState.magicCards.nuke.cooldownTimer = GAME_CONFIG.magicCards.nuke.cooldown;
                                            k.shake(20);
                                            k.add([
                                                k.text("NUKE!", { size: 48 }),
                                                k.pos(k.width()/2, k.height()/2),
                                                k.anchor("center"),
                                                k.color(255, 0, 0),
                                                k.lifespan(1),
                                                k.fixed(),
                                                k.z(200)
                                            ]);
                                        }
                                    });
                                }
                            // });
                        // }

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
                        setupShop(k, gameState, startDrag, account?.address);

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
                            checkWaveCompletion(k, gameState, handleWaveVictory, account?.address, signAndExecute);
                            
                            // Update Magic Card Cooldowns
                            gameState.updateCooldowns(k.dt());
                            
                            // Update UI for cooldowns
                            if (gameState.magicCards.heal.owned) {
                                const t = gameState.magicCards.heal.cooldownTimer;
                                uiElements.magicBtns.heal.cdText.text = t > 0 ? Math.ceil(t) : "";
                                uiElements.magicBtns.heal.btn.opacity = t > 0 ? 0.5 : 1;
                            }
                            if (gameState.magicCards.nuke.owned) {
                                const t = gameState.magicCards.nuke.cooldownTimer;
                                uiElements.magicBtns.nuke.cdText.text = t > 0 ? Math.ceil(t) : "";
                                uiElements.magicBtns.nuke.btn.opacity = t > 0 ? 0.5 : 1;
                            }
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
        <div className="game-canvas-container">
            <canvas ref={canvasRef} id="game-canvas"></canvas>
        </div>
    );
}

export default GameCanvas;
