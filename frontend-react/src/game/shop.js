import { TOWER_COST } from './constants.js';
import GAME_CONFIG from '../gameConfig.js';
import BlockchainService from '../services/BlockchainService.js';

/**
 * Sets up the in-game shop UI, creating clickable icons for each tower type.
 * Handles the interaction between clicking a shop item and initiating the drag process.
 *
 * @param {import("kaboom").KaboomCtx} k - The Kaboom.js context.
 * @param {import("./gameState.js").GameState} gameState - The game state manager.
 * @param {Function} onDragStart - The function to call when a shop item is clicked (from setupInput).
 * @param {string} walletAddress - The connected wallet address.
 * @param {Object} sbtStats - Stats from Soulbound Tokens.
 */
export function setupShop(k, gameState, onDragStart, walletAddress, sbtStats = {}, onMagicCardClick) {
    // Shop Background Panel
    k.add([
        k.rect(k.width(), 100),
        k.pos(0, 50),
        k.color(15, 23, 42), // --bg-primary
        k.opacity(0.9),
        k.z(100),
        "shop-bg"
    ]);

    // B-Cell (Always unlocked)
    createShopItem(k, gameState, onDragStart, 'bcell', "b-cell-neutral", GAME_CONFIG.towers.bCell.range, k.rgb(100, 200, 255), 0, sbtStats);

    // Macrophage (Unlockable)
    checkTowerUnlock(k, gameState, onDragStart, 'macrophage', "macrophage-idle-neutral", GAME_CONFIG.towers.macrophage.range, k.rgb(200, 100, 255), 9, walletAddress, sbtStats);

    // Platelet (Unlockable)
    checkTowerUnlock(k, gameState, onDragStart, 'platelet', "platelet-idle", GAME_CONFIG.towers.platelet.range, k.rgb(100, 255, 100), 6, walletAddress, sbtStats);

    // Basophil (Unlockable)
    checkTowerUnlock(k, gameState, onDragStart, 'basophil', "basophil-idle", GAME_CONFIG.towers.basophil.range, k.rgb(255, 150, 50), 3, walletAddress, sbtStats);

    // NK Cell (Unlockable)
    checkTowerUnlock(k, gameState, onDragStart, 'nkCell', "nk-cell-aim-down", GAME_CONFIG.towers.nkCell.range, k.rgb(255, 50, 50), 12, walletAddress, sbtStats);

    // --- Magic Cards ---
    // Heal
    checkMagicCardUnlock(k, gameState, 'heal', "magic-heal", k.rgb(0, 255, 0), walletAddress, onMagicCardClick);
    // Nuke
    checkMagicCardUnlock(k, gameState, 'nuke', "magic-nuke", k.rgb(255, 0, 0), walletAddress, onMagicCardClick);
    // Freeze
    checkMagicCardUnlock(k, gameState, 'freeze', "magic-freeze", k.rgb(0, 255, 255), walletAddress, onMagicCardClick);
    // Poison
    checkMagicCardUnlock(k, gameState, 'poison', "magic-poison", k.rgb(128, 0, 128), walletAddress, onMagicCardClick);
}

/**
 * Checks if a magic card is unlocked via BlockchainService.
 */
function checkMagicCardUnlock(k, gameState, type, sprite, color, walletAddress, onMagicCardClick) {
    createMagicCardShopItem(k, gameState, type, sprite, color, onMagicCardClick);

    if (walletAddress) {
        BlockchainService.checkMagicCard(walletAddress, type).then(owned => {
            if (owned) {
                gameState.magicCards[type].owned = true;
                updateMagicCardVisuals(k, type, true);
            }
        });
    }
}

function createMagicCardShopItem(k, gameState, type, sprite, color, onMagicCardClick) {
    // Position logic for Magic Cards (Row 2)
    let xPos = 120;
    if (type === 'nuke') xPos = 200;
    if (type === 'freeze') xPos = 280;
    if (type === 'poison') xPos = 360;

    const yPos = 200; // Lower row

    // Container
    const container = k.add([
        k.rect(70, 90, { radius: 8 }),
        k.pos(xPos, yPos),
        k.anchor("center"),
        k.color(30, 41, 59),
        k.outline(1, k.rgb(71, 85, 105)),
        k.area(),
        k.z(101),
        `shop-item-magic-${type}-container`
    ]);

    // Sprite
    const spriteObj = k.add([
        k.sprite(sprite),
        k.pos(xPos, yPos - 10),
        k.anchor("center"),
        k.scale(0.1),
        k.z(102),
        `shop-item-magic-${type}`
    ]);

    // Name
    const nameMap = {
        'heal': 'Healing Pulse',
        'nuke': 'Cytokine Storm',
        'freeze': 'Cryo Stasis',
        'poison': 'Viral Toxin'
    };
    const name = nameMap[type] || type.charAt(0).toUpperCase() + type.slice(1);

    k.add([
        k.text(name, { size: 10, width: 65, align: 'center' }), // Smaller text to fit
        k.pos(xPos, yPos + 25),
        k.anchor("center"),
        k.color(226, 232, 240),
        k.z(102)
    ]);

    // Interaction (Minting/Buying or Using)
    container.onClick(() => {
        if (gameState.magicCards[type].owned) {
            if (onMagicCardClick) {
                onMagicCardClick(type);
            }
        } else {
            console.log(`Clicked locked magic card: ${type}`);
            // In a real implementation, this would open a modal to mint the SBT
        }
    });

    // Hover
    container.onHover(() => {
        container.color = k.rgb(51, 65, 85);
        container.outline.color = k.rgb(56, 189, 248);
        k.setCursor("pointer");
    });

    container.onHoverEnd(() => {
        container.color = k.rgb(30, 41, 59);
        container.outline.color = k.rgb(71, 85, 105);
        k.setCursor("default");
    });

    // Initial Locked State
    if (!gameState.magicCards[type].owned) {
        spriteObj.color = k.rgb(100, 100, 100);
        spriteObj.opacity = 0.5;

        // Ensure sprite is visible behind lock
        // The sprite is already added at z(102), lock is at z(105)

        k.add([
            k.text("🔒", { size: 24 }),
            k.pos(xPos, yPos - 10),
            k.anchor("center"),
            k.z(105),
            `lock-icon-magic-${type}`
        ]);
    }

    // Cooldown Overlay (Hidden by default)
    k.add([
        k.text("", { size: 20, font: "monospace" }),
        k.pos(xPos, yPos),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(110),
        `cooldown-text-magic-${type}`
    ]);
}

function updateMagicCardVisuals(k, type, isOwned) {
    const items = k.get(`shop-item-magic-${type}`);
    if (items.length > 0) {
        const item = items[0];
        if (isOwned) {
            item.color = k.rgb(255, 255, 255);
            item.opacity = 1;

            const lockIcons = k.get(`lock-icon-magic-${type}`);
            lockIcons.forEach(icon => k.destroy(icon));
        }
    }
}

export function updateMagicCardCooldownVisuals(k, type, cooldownTimer) {
    const texts = k.get(`cooldown-text-magic-${type}`);
    const containers = k.get(`shop-item-magic-${type}-container`);

    if (texts.length > 0) {
        texts[0].text = cooldownTimer > 0 ? Math.ceil(cooldownTimer) : "";
    }

    if (containers.length > 0) {
        // Dim the container if on cooldown
        containers[0].opacity = cooldownTimer > 0 ? 0.5 : 1;
    }
}
function checkTowerUnlock(k, gameState, onDragStart, type, sprite, range, color, unlockWave, walletAddress, sbtStats) {
    // Create item immediately
    createShopItem(k, gameState, onDragStart, type, sprite, range, color, unlockWave, sbtStats);

    // Update state asynchronously
    if (walletAddress) {
        BlockchainService.checkUnlockSBT(walletAddress, type).then(unlocked => {
            if (unlocked) {
                gameState.unlockedTowers[type] = true;
                updateTowerVisuals(k, type, true);
            }
        });
    }
}

function createShopItem(k, gameState, onDragStart, type, sprite, range, color, unlockWave, sbtStats) {
    // Position logic
    let xPos = 120;
    if (type === 'macrophage') xPos = 200;
    if (type === 'platelet') xPos = 280;
    if (type === 'basophil') xPos = 360;
    if (type === 'nkCell') xPos = 440;

    // Tower Icon Container
    const container = k.add([
        k.rect(70, 90, { radius: 8 }),
        k.pos(xPos, 90),
        k.anchor("center"),
        k.color(30, 41, 59), // --bg-secondary
        k.outline(1, k.rgb(71, 85, 105)),
        k.area(),
        k.z(101),
        `shop-item-${type}-container`
    ]);

    // Tower Sprite
    const spriteObj = k.add([
        k.sprite(sprite),
        k.pos(xPos, 80),
        k.anchor("center"),
        k.scale(0.05),
        k.z(102),
        `shop-item-${type}`
    ]);

    // Tower Name
    const name = type.charAt(0).toUpperCase() + type.slice(1);
    k.add([
        k.text(name, { size: 12 }),
        k.pos(xPos, 115),
        k.anchor("center"),
        k.color(226, 232, 240),
        k.z(102)
    ]);

    // Cost Badge
    k.add([
        k.rect(40, 18, { radius: 4 }),
        k.pos(xPos, 60),
        k.anchor("center"),
        k.color(15, 23, 42),
        k.z(103)
    ]);

    const cost = TOWER_COST[type] || 0;
    k.add([
        k.text(`$${cost}`, { size: 12, font: "monospace" }),
        k.pos(xPos, 60),
        k.anchor("center"),
        k.color(250, 204, 21), // Yellow
        k.z(104)
    ]);

    // Interaction
    container.onClick(() => {
        if (unlockWave && !gameState.unlockedTowers[type]) {
            k.shake(5);
            k.add([
                k.text(`Unlock at Wave ${unlockWave}`, { size: 16 }),
                k.pos(xPos, 150),
                k.anchor("center"),
                k.color(248, 113, 113),
                k.z(200),
                k.lifespan(2, { fade: 0.5 })
            ]);
            return;
        }
        onDragStart(type, sprite, range, color, sbtStats ? sbtStats[type] : null);
    });

    // Hover effects
    container.onHover(() => {
        container.color = k.rgb(51, 65, 85);
        container.outline.color = k.rgb(56, 189, 248);
        k.setCursor("pointer");
    });

    container.onHoverEnd(() => {
        container.color = k.rgb(30, 41, 59);
        container.outline.color = k.rgb(71, 85, 105);
        k.setCursor("default");
    });

    // Initial Locked State
    if (unlockWave && !gameState.unlockedTowers[type]) {
        spriteObj.color = k.rgb(100, 100, 100);
        spriteObj.opacity = 0.5;

        // Lock Icon
        k.add([
            k.text("🔒", { size: 24 }),
            k.pos(xPos, 80),
            k.anchor("center"),
            k.z(105),
            `lock-icon-${type}`
        ]);
    }
}

export function updateTowerVisuals(k, type, isUnlocked) {
    const items = k.get(`shop-item-${type}`);
    if (items.length > 0) {
        const item = items[0];
        if (isUnlocked) {
            item.color = k.rgb(255, 255, 255);
            item.opacity = 1;

            // Remove lock icon
            const lockIcons = k.get(`lock-icon-${type}`);
            lockIcons.forEach(icon => k.destroy(icon));
        } else {
            item.color = k.rgb(100, 100, 100);
            item.opacity = 0.5;
        }
    }
}

export default setupShop;
