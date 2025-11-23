import { useEffect, useRef } from 'react';
import kaboom from 'kaboom';

function GameCanvas() {
    const canvasRef = useRef(null);
    const kRef = useRef(null);

    useEffect(() => {
        // Don't initialize if already initialized
        if (kRef.current) return;

        const initGame = async () => {
            const GAME_CONFIG = await import('../gameConfig.js').then(m => m.default || window.GAME_CONFIG);

            const k = kaboom({
                canvas: canvasRef.current,
                background: [20, 20, 30],
                width: 800,
                height: 600,
                scale: 1,
                global: false,
                debug: true,
            });

            kRef.current = k;

            // Load Assets
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

            // Import and run the game logic
            // For now, we'll just start a simple scene
            k.scene("main", () => {
                k.add([
                    k.text("Tower Defense Game Coming Soon", { size: 24 }),
                    k.pos(k.width() / 2, k.height() / 2),
                    k.anchor("center"),
                    k.color(255, 255, 255),
                ]);
            });

            k.go("main");
        };

        initGame();

        // Cleanup
        return () => {
            if (kRef.current) {
                // Kaboom doesn't have a built-in destroy method
                // but we can clear the canvas
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
            background: '#111'
        }}>
            <canvas
                ref={canvasRef}
                id="gameCanvas"
                style={{
                    background: '#222',
                    border: '2px solid #6ea8fe',
                    borderRadius: '8px',
                    cursor: 'crosshair',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
                }}
            />
        </div>
    );
}

export default GameCanvas;
