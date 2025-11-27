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
 * @param {Function} onMagicCardClick - Callback for magic card clicks.
 * @param {Function} onPurchase - Callback for purchasing items.
 */
export function setupShop(k, gameState, onDragStart, walletAddress, sbtStats = {}, onMagicCardClick, onPurchase) {
    // Shop Background Panel (Glassmorphism) - Bottom Aligned
    // User's Design Preference
    k.add([
        k.rect(k.width(), 110),
        k.pos(0, k.height() - 110),
        k.color(15, 23, 42), // Dark blue base
        k.opacity(0.85),
        k.z(100),
        "shop-bg"
    ]);

    // Top Border for Shop
    k.add([
        k.rect(k.width(), 2),
        k.pos(0, k.height() - 110),
        k.color(56, 189, 248), // Cyan accent
        k.opacity(0.5),
        k.z(100)
    ]);

    // Calculate centering for items
    // We have 5 towers (B-Cell, Macro, Platelet, Basophil, NK) + 4 Magic Cards
    // That's a lot for one row. Let's split them or just make a long row.
    // Let's try a single row first, centered.
    const towers = ['bcell', 'macrophage', 'platelet', 'basophil', 'nkCell'];
    const magic = ['heal', 'nuke', 'freeze', 'poison'];
    const totalItems = towers.length + magic.length;
    const itemWidth = 90;
    const spacing = 20;
    const totalWidth = totalItems * itemWidth + (totalItems - 1) * spacing;
    const startX = (k.width() - totalWidth) / 2 + itemWidth / 2;

    let currentIndex = 0;

    // --- Towers ---

    // B-Cell
    createMergedShopItem(k, gameState, onDragStart, 'bcell', "b-cell-neutral", GAME_CONFIG.towers.bCell.range, k.rgb(100, 200, 255), 0, sbtStats, startX, currentIndex++, false);

    // Macrophage
    checkTowerUnlock(k, gameState, onDragStart, 'macrophage', "macrophage-idle-neutral", GAME_CONFIG.towers.macrophage.range, k.rgb(200, 100, 255), 9, walletAddress, sbtStats, startX, currentIndex++);

    // Platelet
    checkTowerUnlock(k, gameState, onDragStart, 'platelet', "platelet-idle", GAME_CONFIG.towers.platelet.range, k.rgb(100, 255, 100), 6, walletAddress, sbtStats, startX, currentIndex++);

    // Basophil
    checkTowerUnlock(k, gameState, onDragStart, 'basophil', "basophil-idle", GAME_CONFIG.towers.basophil.range, k.rgb(255, 150, 50), 3, walletAddress, sbtStats, startX, currentIndex++);

    // NK Cell
    checkTowerUnlock(k, gameState, onDragStart, 'nkCell', "nk-cell-aim-down", GAME_CONFIG.towers.nkCell.range, k.rgb(255, 50, 50), 12, walletAddress, sbtStats, startX, currentIndex++);

    // --- Magic Cards ---
    // Heal
    checkMagicCardUnlock(k, gameState, 'heal', "magic-heal", k.rgb(0, 255, 0), walletAddress, onMagicCardClick, onPurchase, startX, currentIndex++);
    // Nuke
    checkMagicCardUnlock(k, gameState, 'nuke', "magic-nuke", k.rgb(255, 0, 0), walletAddress, onMagicCardClick, onPurchase, startX, currentIndex++);
    // Freeze
    checkMagicCardUnlock(k, gameState, 'freeze', "magic-freeze", k.rgb(0, 255, 255), walletAddress, onMagicCardClick, onPurchase, startX, currentIndex++);
    // Poison
    checkMagicCardUnlock(k, gameState, 'poison', "magic-poison", k.rgb(128, 0, 128), walletAddress, onMagicCardClick, onPurchase, startX, currentIndex++);
}

// Helper to handle async unlock check but reserve spot
function checkTowerUnlock(k, gameState, onDragStart, type, sprite, range, color, unlockWave, walletAddress, sbtStats, startX, index) {
    createMergedShopItem(k, gameState, onDragStart, type, sprite, range, color, unlockWave, sbtStats, startX, index, false);

    if (walletAddress) {
        BlockchainService.checkUnlockSBT(walletAddress, type).then(unlocked => {
            if (unlocked) {
                gameState.unlockedTowers[type] = true;
                updateTowerVisuals(k, type, true);
            }
        });
    }
}

function checkMagicCardUnlock(k, gameState, type, sprite, color, walletAddress, onMagicCardClick, onPurchase, startX, index) {
    createMergedShopItem(k, gameState, null, type, sprite, 0, color, 0, null, startX, index, true, onMagicCardClick, onPurchase);

    if (walletAddress) {
        BlockchainService.checkMagicCard(walletAddress, type).then(owned => {
            if (owned) {
                gameState.magicCards[type].owned = true;
                updateMagicCardVisuals(k, type, true);
            }
        });
    }
}

/**
 * Unified Shop Item Creator
 * Merges User's "Glass Chip" design with Friend's functionality
 */
function createMergedShopItem(k, gameState, onDragStart, type, sprite, range, color, unlockWave, sbtStats, startX, index, isMagic = false, onMagicClick = null, onPurchase = null) {
    const itemWidth = 90;
    const spacing = 20;
    const xPos = startX + index * (itemWidth + spacing);
    const baseY = k.height() - 55; // Bottom aligned

    // Container (User's Glass Chip Design)
    const container = k.add([
        k.rect(90, 90, { radius: 12 }),
        k.pos(xPos, baseY),
        k.anchor("center"),
        k.color(30, 41, 59), // --bg-secondary
        k.outline(1, k.rgb(71, 85, 105)),
        k.area(),
        k.z(101),
        isMagic ? `shop-item-magic-${type}-container` : `shop-item-${type}-container`
    ]);

    // Sprite
    const spriteObj = k.add([
        k.sprite(sprite),
        k.pos(xPos, baseY - 10),
        k.anchor("center"),
        k.scale(isMagic ? 0.1 : 0.06),
        k.z(102),
        isMagic ? `shop-item-magic-${type}` : `shop-item-${type}`
    ]);

    // Name
    const nameMap = {
        'heal': 'Heal',
        'nuke': 'Nuke',
        'freeze': 'Freeze',
        'poison': 'Poison'
    };
    const displayName = isMagic ? (nameMap[type] || type) : (type.charAt(0).toUpperCase() + type.slice(1));

    k.add([
        k.text(displayName, { size: 12, font: "monospace" }),
        k.pos(xPos, baseY + 30),
        k.anchor("center"),
        k.color(148, 163, 184), // Muted text
        k.z(102)
    ]);

    // Cost Badge (Only for Towers)
    if (!isMagic) {
        const cost = TOWER_COST[type] || 0;
        k.add([
            k.rect(50, 20, { radius: 10 }),
            k.pos(xPos, baseY - 35),
            k.anchor("center"),
            k.color(15, 23, 42),
            k.outline(1, k.rgb(250, 204, 21)),
            k.z(103)
        ]);

        k.add([
            k.text(`$${cost}`, { size: 12, font: "monospace" }),
            k.pos(xPos, baseY - 35),
            k.anchor("center"),
            k.color(250, 204, 21),
            k.z(104)
        ]);
    }

    // Interaction
    container.onClick(() => {
        if (isMagic) {
            if (gameState.magicCards[type].owned) {
                if (onMagicClick) onMagicClick(type);
            } else {
                // Purchase Logic
                if (onPurchase) {
                    onPurchase(type, k.vec2(xPos, baseY));
                } else {
                    k.shake(2);
                }
            }
        } else {
            // Tower Logic
            if (unlockWave && !gameState.unlockedTowers[type]) {
                k.shake(2);
                k.add([
                    k.text(`Unlock Wave ${unlockWave}`, { size: 14 }),
                    k.pos(xPos, baseY - 75),
                    k.anchor("center"),
                    k.color(248, 113, 113),
                    k.z(200),
                    k.lifespan(1.5, { fade: 0.5 })
                ]);
                return;
            }
            onDragStart(type, sprite, range, color, sbtStats ? sbtStats[type] : null);
        }
    });

    // Hover Effects (User's Design)
    container.onHover(() => {
        container.color = k.rgb(51, 65, 85);
        container.outline.color = k.rgb(56, 189, 248);
        spriteObj.scale = isMagic ? k.vec2(0.11) : k.vec2(0.07);
        k.setCursor("pointer");
    });

    container.onHoverEnd(() => {
        container.color = k.rgb(30, 41, 59);
        container.outline.color = k.rgb(71, 85, 105);
        spriteObj.scale = isMagic ? k.vec2(0.1) : k.vec2(0.06);
        k.setCursor("default");
    });

    // Initial Locked State
    const isLocked = isMagic ? !gameState.magicCards[type].owned : (unlockWave && !gameState.unlockedTowers[type]);

    if (isLocked) {
        spriteObj.color = k.rgb(100, 100, 100);
        spriteObj.opacity = 0.5;

        k.add([
            k.text("🔒", { size: 24 }),
            k.pos(xPos, baseY - 10),
            k.anchor("center"),
            k.z(105),
            isMagic ? `lock-icon-magic-${type}` : `lock-icon-${type}`
        ]);
    }

    // Cooldown Overlay (Magic Only)
    if (isMagic) {
        k.add([
            k.text("", { size: 20, font: "monospace" }),
            k.pos(xPos, baseY),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(110),
            `cooldown-text-magic-${type}`
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
            const lockIcons = k.get(`lock-icon-${type}`);
            lockIcons.forEach(icon => k.destroy(icon));
        }
    }
}

export function updateMagicCardVisuals(k, type, isOwned) {
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
        containers[0].opacity = cooldownTimer > 0 ? 0.5 : 1;
    }
}

export default setupShop;
