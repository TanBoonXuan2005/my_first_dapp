
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

    return { healthText, atpText, waveNumberText };
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

export function showDamageNumber(k, pos, damage) {
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
