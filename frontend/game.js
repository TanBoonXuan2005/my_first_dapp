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
            background: [30, 30, 30],
            width: 800,
            height: 600,
            scale: 1,
            global: false, // Do not import into global scope
            debug: true,
        });

        // Load Assets
        k.loadSprite("b-cell-neutral", "assets/animation_frames/B-Cells/B-Cell_Idle(Neutral Form).png");
        k.loadSprite("b-cell-squash", "assets/animation_frames/B-Cells/B-Cell_Idle(Squash Form).png");
        k.loadSprite("b-cell-stretch", "assets/animation_frames/B-Cells/B-Cell_Idle(Stretch Form).png");

        // Define Game Scene
        k.scene("main", () => {
            // Background
            k.add([
                k.rect(k.width(), k.height()),
                k.color(20, 20, 25),
                k.pos(0, 0),
            ]);

            // UI Text
            k.add([
                k.text("Click to place B-Cell", { size: 24 }),
                k.pos(20, 20),
                k.color(255, 255, 255),
            ]);

            // Tower Placement Logic
            k.onClick(() => {
                const p = k.mousePos();

                // Spawn B-Cell
                const bCell = k.add([
                    k.sprite("b-cell-neutral"),
                    k.pos(p),
                    k.anchor("center"),
                    k.scale(0.15),
                    "b-cell",
                    {
                        timer: 0,
                        frame: 0,
                    }
                ]);

                // Animation loop
                bCell.onUpdate(() => {
                    bCell.timer += k.dt();
                    if (bCell.timer > 0.2) {
                        bCell.timer = 0;
                        bCell.frame = (bCell.frame + 1) % 3;

                        if (bCell.frame === 0) bCell.use(k.sprite("b-cell-neutral"));
                        else if (bCell.frame === 1) bCell.use(k.sprite("b-cell-squash"));
                        else if (bCell.frame === 2) bCell.use(k.sprite("b-cell-stretch"));
                    }
                });
            });
        });

        // Start the scene
        k.go("main");
    }
});
