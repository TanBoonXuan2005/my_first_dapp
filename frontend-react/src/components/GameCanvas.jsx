
import { useEffect, useRef, useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@onelabs/dapp-kit';
import { useNavigate } from 'react-router-dom';
import kaboom from 'kaboom';
import GAME_CONFIG from '../gameConfig.js';
import { UI_HEIGHT, getPaths } from '../game/constants.js';
import { loadGameAssets } from '../game/assets.js';
import { setupGameUI } from '../game/ui.js';
import { GameState } from '../game/gameState.js';
import { setupShop } from '../game/shop.js';
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
                const stats = await BlockchainService.getSBTStats(client, account.address);
                setSbtStats(stats);
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
                        // --- Background Texture (Organic Tissue) ---
                        // Spawn random "cells" in the background
                        for (let i = 0; i < 50; i++) {
                            k.add([
                                k.circle(k.rand(20, 100)),
                                k.pos(k.rand(0, canvasWidth), k.rand(0, canvasHeight)),
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

                        // Use randomness seed for something (e.g., initial money bonus)
                        if (randomSeed > 0.8) {
                            gameState.money += 50; // Lucky bonus!
                            k.add([
                                k.text("LUCKY BONUS! +$50", { size: 32, font: "monogram" }),
                                k.pos(canvasWidth / 2, canvasHeight / 2 + 80), // Moved down
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
                        setupShop(k, gameState, startDrag, account?.address, sbtStats);

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
        <div className="game-canvas-container flex-center gradient-bg" style={{ minHeight: '100vh', paddingTop: '70px' }}>
            <div className="canvas-wrapper glass-strong p-1" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <canvas ref={canvasRef} id="game-canvas" style={{ display: 'block', borderRadius: '12px' }}></canvas>
            </div>
        </div>
    );
}

export default GameCanvas;
