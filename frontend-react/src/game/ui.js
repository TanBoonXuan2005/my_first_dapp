

export function setupGameUI(k, UI_HEIGHT) {
    // UI Background (Glassmorphism Panel)
    k.add([
        k.rect(k.width(), UI_HEIGHT),
        k.pos(0, 0),
        k.color(15, 23, 42), // Dark blue base
        k.opacity(0.85),
        k.z(100),
        "ui-bg"
    ]);

    // Bottom Border (Gradient-like line)
    k.add([
        k.rect(k.width(), 2),
        k.pos(0, UI_HEIGHT),
        k.color(56, 189, 248), // Cyan accent
        k.opacity(0.5),
        k.z(100)
    ]);

    // Shop Label (Styled)
    k.add([
        k.text("DEFENSE SYSTEMS", { size: 14, font: "monospace" }),
        k.pos(20, 20),
        k.color(148, 163, 184), // Muted text
        k.z(101)
    ]);

    // --- Stats Container (Right Side) ---
    const statsBg = k.add([
        k.rect(320, 50, { radius: 12 }),
        k.pos(k.width() - 420, 15), // Shifted left to avoid menu button
        k.color(30, 41, 59),
        k.outline(1, k.rgb(71, 85, 105)),
        k.z(101)
    ]);

    // Health Display
    const healthText = k.add([
        k.text("❤️ 100", { size: 20, font: "monospace" }),
        k.pos(k.width() - 380, 40), // Shifted left
        k.anchor("left"),
        k.color(248, 113, 113), // Red
        k.z(102),
        "health-text"
    ]);

    // Divider
    k.add([
        k.rect(2, 30),
        k.pos(k.width() - 260, 25), // Shifted left
        k.color(71, 85, 105),
        k.z(102)
    ]);

    // ATP Display
    const atpText = k.add([
        k.text("⚡ 50", { size: 20, font: "monospace" }),
        k.pos(k.width() - 240, 40), // Shifted left
        k.anchor("left"),
        k.color(56, 189, 248), // Cyan
        k.z(102),
        "atp-text"
    ]);

    // --- Wave Display (Center) ---
    const waveContainer = k.add([
        k.rect(180, 44, { radius: 22 }),
        k.pos(k.width() / 2, 40),
        k.anchor("center"),
        k.color(15, 23, 42),
        k.outline(2, k.rgb(56, 189, 248)),
        k.z(101)
    ]);

    const waveNumberText = k.add([
        k.text("WAVE 1", { size: 24, font: "monospace" }),
        k.pos(k.width() / 2, 40),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(102),
        "wave-text"
    ]);

    // --- Menu Button (Top Right) ---
    const menuBtn = k.add([
        k.rect(40, 40, { radius: 8 }),
        k.pos(k.width() - 60, 40),
        k.anchor("center"),
        k.color(30, 41, 59),
        k.outline(1, k.rgb(148, 163, 184)),
        k.area(),
        k.z(101),
        "menu-btn"
    ]);

    // Hamburger Icon (Simple lines)
    const iconColor = k.rgb(226, 232, 240);
    menuBtn.add([k.rect(20, 2), k.pos(0, -6), k.anchor("center"), k.color(iconColor)]);
    menuBtn.add([k.rect(20, 2), k.pos(0, 0), k.anchor("center"), k.color(iconColor)]);
    menuBtn.add([k.rect(20, 2), k.pos(0, 6), k.anchor("center"), k.color(iconColor)]);



    // Menu Button Hover Effects
    menuBtn.onHover(() => {
        menuBtn.color = k.rgb(51, 65, 85);
        menuBtn.outline.color = k.rgb(56, 189, 248);
        k.setCursor("pointer");
    });
    menuBtn.onHoverEnd(() => {
        menuBtn.color = k.rgb(30, 41, 59);
        menuBtn.outline.color = k.rgb(148, 163, 184);
        k.setCursor("default");
    });

    return { healthText, atpText, waveNumberText, menuBtn };
}

export function showPauseMenu(k, onResume, onRestart, onHome) {
    // Dark Overlay
    k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.color(0, 0, 0),
        k.opacity(0.8),
        k.fixed(),
        k.z(400),
        "pause-menu"
    ]);

    // Menu Container (Glassmorphism)
    const menuBox = k.add([
        k.rect(360, 420, { radius: 24 }),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.color(30, 41, 59),
        k.outline(2, k.rgb(56, 189, 248)),
        k.fixed(),
        k.z(401),
        "pause-menu"
    ]);

    // Title
    k.add([
        k.text("PAUSED", { size: 40, font: "monospace" }),
        k.pos(k.width() / 2, k.height() / 2 - 140),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.fixed(),
        k.z(402),
        "pause-menu"
    ]);

    // Helper to create styled buttons
    function createButton(text, yOffset, baseColor, hoverColor, onClick) {
        const btn = k.add([
            k.rect(260, 60, { radius: 12 }),
            k.pos(k.width() / 2, k.height() / 2 + yOffset),
            k.anchor("center"),
            k.color(baseColor),
            k.area(),
            k.fixed(),
            k.z(402),
            "pause-menu"
        ]);

        btn.add([
            k.text(text, { size: 20, font: "monospace" }),
            k.anchor("center"),
            k.color(255, 255, 255)
        ]);

        btn.onClick(onClick);

        // Hover Effect
        btn.onHover(() => {
            btn.color = hoverColor;
            btn.scale = k.vec2(1.05);
            k.setCursor("pointer");
        });
        btn.onHoverEnd(() => {
            btn.color = baseColor;
            btn.scale = k.vec2(1);
            k.setCursor("default");
        });

        return btn;
    }

    // RESUME Button (Primary Action - Cyan/Blue)
    createButton("RESUME GAME", -40, k.rgb(14, 165, 233), k.rgb(56, 189, 248), () => {
        k.destroyAll("pause-menu");
        onResume();
    });

    // RESTART Button (Secondary Action - Muted Blue)
    createButton("RESTART LEVEL", 40, k.rgb(51, 65, 85), k.rgb(71, 85, 105), () => {
        k.destroyAll("pause-menu");
        onRestart();
    });

    // HOME Button (Destructive/Exit - Reddish/Muted)
    createButton("EXIT TO HOME", 120, k.rgb(185, 28, 28), k.rgb(220, 38, 38), () => {
        k.destroyAll("pause-menu");
        onHome();
    });
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
