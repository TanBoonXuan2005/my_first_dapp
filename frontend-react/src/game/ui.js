
export function setupGameUI(k, UI_HEIGHT) {
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

    // Health Display
    const healthText = k.add([
        k.text("❤️ Health: 100", { size: 20 }),
        k.pos(k.width() - 120, 30),
        k.anchor("center"),
        k.color(255, 100, 100),
        k.z(101),
        "health-text"
    ]);

    // ATP Display (currency)
    const atpText = k.add([
        k.text("⚡ ATP: 50", { size: 20 }),
        k.pos(k.width() - 120, 60),
        k.anchor("center"),
        k.color(100, 255, 255),
        k.z(101),
        "atp-text"
    ]);

    // Wave Number Display
    const waveNumberText = k.add([
        k.text("Wave 1", { size: 24 }),
        k.pos(k.width() / 2, 30),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(101),
        "wave-text"
    ]);

    // Menu Button
    const menuBtn = k.add([
        k.rect(80, 30, { radius: 4 }),
        k.pos(k.width() - 50, 30),
        k.anchor("center"),
        k.color(70, 70, 80),
        k.area(),
        k.z(101),
        "menu-btn"
    ]);

    k.add([
        k.text("MENU", { size: 16 }),
        k.pos(k.width() - 50, 30),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(102)
    ]);

    // Magic Card Buttons
    const magicBtns = {};
    const magicConfig = [
        { type: 'heal', label: 'HEAL', color: k.rgb(0, 255, 0), y: 100 },
        { type: 'nuke', label: 'NUKE', color: k.rgb(255, 0, 0), y: 150 }
    ];

    magicConfig.forEach(cfg => {
        const btn = k.add([
            k.rect(80, 30, { radius: 4 }),
            k.pos(k.width() - 50, cfg.y),
            k.anchor("center"),
            k.color(cfg.color),
            k.area(),
            k.z(101),
            k.opacity(0.5), // Disabled by default
            `magic-btn-${cfg.type}`
        ]);

        k.add([
            k.text(cfg.label, { size: 14 }),
            k.pos(k.width() - 50, cfg.y),
            k.anchor("center"),
            k.color(0, 0, 0),
            k.z(102)
        ]);
        
        // Cooldown overlay
        const cdText = k.add([
            k.text("", { size: 14 }),
            k.pos(k.width() - 50, cfg.y),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(103)
        ]);

        magicBtns[cfg.type] = { btn, cdText };
    });

    return { healthText, atpText, waveNumberText, menuBtn, magicBtns };
}

export function showGameOver(k) {
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

export function showVictoryMessage(k, waveNumber, playerHealth) {
    k.add([
        k.text(`WAVE ${waveNumber} COMPLETE!`, { size: 40 }),
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
        k.color(200, 200, 200),
        k.z(250),
        "health-msg"
    ]);
}

export function showDamageNumber(k, pos, damage, gameState) {
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
        if (gameState && gameState.isPaused) return; // Don't update when paused
        elapsed += k.dt();
        damageText.pos.y -= k.dt() * 30;
        damageText.opacity = 1 - (elapsed / 0.8);
        if (elapsed >= 0.8) k.destroy(damageText);
    });
}

export function showPauseMenu(k, onResume, onRestart, onHome) {
    // Overlay
    const overlay = k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.color(0, 0, 0),
        k.opacity(0.7),
        k.fixed(),
        k.z(400),
        "pause-menu"
    ]);

    const menuBox = k.add([
        k.rect(300, 300, { radius: 8 }),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.color(50, 50, 60),
        k.fixed(),
        k.z(401),
        "pause-menu"
    ]);

    k.add([
        k.text("PAUSED", { size: 32 }),
        k.pos(k.width() / 2, k.height() / 2 - 100),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.fixed(),
        k.z(402),
        "pause-menu"
    ]);

    // Helper to create buttons
    function createButton(text, yOffset, onClick) {
        const btn = k.add([
            k.rect(200, 50, { radius: 4 }),
            k.pos(k.width() / 2, k.height() / 2 + yOffset),
            k.anchor("center"),
            k.color(80, 80, 90),
            k.area(),
            k.fixed(),
            k.z(402),
            "pause-menu-btn" // Tag for easier cleanup if needed, though we destroy by tag "pause-menu"
        ]);

        btn.add([
            k.text(text, { size: 20 }),
            k.anchor("center"),
            k.color(255, 255, 255)
        ]);

        btn.onClick(onClick);
        btn.onHover(() => btn.color = k.rgb(100, 100, 110));
        btn.onHoverEnd(() => btn.color = k.rgb(80, 80, 90));

        // Add "pause-menu" tag to button for group destruction
        btn.use("pause-menu");
        return btn;
    }

    createButton("RESUME", -30, () => {
        k.destroyAll("pause-menu");
        onResume();
    });

    createButton("RESTART", 40, () => {
        k.destroyAll("pause-menu");
        onRestart();
    });

    createButton("HOME", 110, () => {
        k.destroyAll("pause-menu");
        onHome();
    });
}
