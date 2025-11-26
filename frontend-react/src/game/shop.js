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
export function setupShop(k, gameState, onDragStart, walletAddress, sbtStats = {}) {
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
    checkTowerUnlock(k, gameState, onDragStart, 'macrophage', "macrophage-idle-neutral", GAME_CONFIG.towers.macrophage.range, k.rgb(200, 100, 255), 2, walletAddress, sbtStats);

    // Platelet (Unlockable)
    checkTowerUnlock(k, gameState, onDragStart, 'platelet', "platelet-idle", GAME_CONFIG.towers.platelet.range, k.rgb(100, 255, 100), 4, walletAddress, sbtStats);

    // Basophil (Unlockable)
    checkTowerUnlock(k, gameState, onDragStart, 'basophil', "basophil-idle", GAME_CONFIG.towers.basophil.range, k.rgb(255, 150, 50), 3, walletAddress, sbtStats);

    // NK Cell (Unlockable)
    checkTowerUnlock(k, gameState, onDragStart, 'nkCell', "nk-cell-aim-down", GAME_CONFIG.towers.nkCell.range, k.rgb(255, 50, 50), 9, walletAddress, sbtStats);
}

/**
 * Checks if a tower is unlocked via BlockchainService.
 */
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
