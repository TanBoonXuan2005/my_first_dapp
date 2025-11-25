
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
 */

const SPRITE_VERTICAL_POS = 65;
const TEXT_VERTICAL_POS = 100;
const COST_VERTICAL_POS = 120;

export function setupShop(k, gameState, onDragStart, walletAddress, sbtStats = {}) {
    // B-Cell
    const shopItemBCell = k.add([
        k.sprite("b-cell-neutral"),
        k.pos(120, SPRITE_VERTICAL_POS),
        k.anchor("center"),
        k.scale(0.06),
        k.z(101),
        k.area(),
        "shop-item-bcell"
    ]);

    k.add([
        k.text("B-Cell", { size: 14 }),
        k.pos(120, TEXT_VERTICAL_POS),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(101)
    ]);

    k.add([
        k.text(`Cost: ${TOWER_COST.bcell}`, { size: 12 }),
        k.pos(120, COST_VERTICAL_POS),
        k.anchor("center"),
        k.color(200, 200, 0),
        k.z(101)
    ]);

    shopItemBCell.onClick(() => {
        onDragStart("bcell", "b-cell-neutral", GAME_CONFIG.towers.bCell.range, k.rgb(100, 200, 255));
    });

    // Platelet (Unlockable)
    checkTowerUnlock(k, gameState, onDragStart, 'platelet', "platelet-idle", GAME_CONFIG.towers.platelet.range, k.rgb(100, 255, 100), 4, walletAddress, sbtStats);

    // Basophil (Unlockable)
    checkTowerUnlock(k, gameState, onDragStart, 'basophil', "basophil-idle", GAME_CONFIG.towers.basophil.range, k.rgb(255, 150, 50), 3, walletAddress, sbtStats);

    // Macrophage (Unlockable)
    checkTowerUnlock(k, gameState, onDragStart, 'macrophage', "macrophage-idle-neutral", GAME_CONFIG.towers.macrophage.range, k.rgb(200, 100, 255), 2, walletAddress, sbtStats);

    // NK Cell (Unlockable)
    checkTowerUnlock(k, gameState, onDragStart, 'nkCell', "nk-cell-aim-down", GAME_CONFIG.towers.nkCell.range, k.rgb(255, 50, 50), 9, walletAddress);
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
    // Position based on type (hardcoded for now)
    let xPos = 200;
    if (type === 'platelet') xPos = 280;
    if (type === 'macrophage') xPos = 200; // Wait, original positions were: BCell 120, Platelet 280, Basophil 360, Macrophage 200? 
    // Let's fix positions: BCell(120), Macrophage(200), Platelet(280), Basophil(360)
    // Actually, let's keep original layout but just lock them.
    // Original: BCell(120), Platelet(280), Basophil(360), Macrophage(200) -> This order is weird.
    // Let's assume: BCell(120), Macrophage(200), Platelet(280), Basophil(360).

    if (type === 'macrophage') xPos = 200;
    if (type === 'platelet') xPos = 280;
    if (type === 'basophil') xPos = 360;
    if (type === 'nkCell') xPos = 440;

    const shopItem = k.add([
        k.sprite(sprite),
        k.pos(xPos, SPRITE_VERTICAL_POS),
        k.anchor("center"),
        k.scale(0.06),
        k.z(101),
        k.area(),
        `shop-item-${type}`
    ]);

    // Initial visual state based on current gameState (likely false initially, updated soon after)
    if (!gameState.unlockedTowers[type]) {
        shopItem.color = k.rgb(100, 100, 100);
        shopItem.opacity = 0.5;
    }

    k.add([
        k.text(type.charAt(0).toUpperCase() + type.slice(1), { size: 14 }),
        k.pos(xPos, TEXT_VERTICAL_POS),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(101)
    ]);

    k.add([
        k.text(`Cost: ${TOWER_COST[type]}`, { size: 12 }),
        k.pos(xPos, COST_VERTICAL_POS),
        k.anchor("center"),
        k.color(200, 200, 0),
        k.z(101)
    ]);

    shopItem.onClick(() => {
        // Check dynamic state
        if (!gameState.unlockedTowers[type]) {
            k.shake(8);
            const lockMsg = k.add([
                k.text(`Complete Wave ${unlockWave} to unlock!`, { size: 18 }),
                k.pos(k.width() / 2, 120),
                k.anchor("center"),
                k.color(255, 100, 100),
                k.z(200),
                k.opacity(1)
            ]);
            k.wait(2, () => k.destroy(lockMsg));
            return;
        }
        onDragStart(type, sprite, range, color, sbtStats[type]);
    });
}

export function updateTowerVisuals(k, type, isUnlocked) {
    console.log(`[Shop] Updating ${type} visuals, unlocked: ${isUnlocked}`);
    const items = k.get(`shop-item-${type}`);
    console.log(`[Shop] Found ${items.length} items with tag shop-item-${type}`);
    if (items.length > 0) {
        const item = items[0];
        if (isUnlocked) {
            // Restore original sprite appearance
            item.color = k.rgb(255, 255, 255);
            item.opacity = 1;
            console.log(`[Shop] ${type} unlocked - color set to white`);
        } else {
            item.color = k.rgb(100, 100, 100);
            item.opacity = 0.5;
            console.log(`[Shop] ${type} locked - color set to gray`);
        }
    }
}

export default setupShop;
