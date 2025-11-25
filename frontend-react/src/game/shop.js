
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

<<<<<<< HEAD
export function setupShop(k, gameState, onDragStart, walletAddress) {
    // Shop Background Panel
    const shopBg = k.add([
        k.rect(k.width(), 100),
        k.pos(0, 50),
        k.color(15, 23, 42), // --bg-primary
        k.opacity(0.0), // Transparent, just for grouping if needed
        k.z(100),
        "shop-bg"
=======
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
>>>>>>> aeed8bb60a0c96a20954945c24ff645496a1fb94
    ]);

    const towers = [
        { type: 'bcell', sprite: 'b-cell-neutral', name: 'B-Cell', cost: TOWER_COST.bcell, range: GAME_CONFIG.towers.bCell.range, color: k.rgb(100, 200, 255) },
        { type: 'macrophage', sprite: 'macrophage-idle-neutral', name: 'Macrophage', cost: TOWER_COST.macrophage, range: GAME_CONFIG.towers.macrophage.range, color: k.rgb(200, 100, 255), unlockWave: 2 },
        { type: 'platelet', sprite: 'platelet-idle', name: 'Platelet', cost: TOWER_COST.platelet, range: GAME_CONFIG.towers.platelet.range, color: k.rgb(100, 255, 100), unlockWave: 4 },
        { type: 'basophil', sprite: 'basophil-idle', name: 'Basophil', cost: TOWER_COST.basophil, range: GAME_CONFIG.towers.basophil.range, color: k.rgb(255, 150, 50) }
    ];

    const startX = k.width() / 2 - (towers.length * 80) / 2;

    towers.forEach((tower, index) => {
        const xPos = startX + index * 100;

<<<<<<< HEAD
        // Tower Icon Container
        const container = k.add([
            k.rect(80, 90, { radius: 8 }),
            k.pos(xPos, 90),
            k.anchor("center"),
            k.color(30, 41, 59), // --bg-secondary
            k.outline(1, k.rgb(71, 85, 105)),
            k.area(),
            k.z(101),
            `shop-item-${tower.type}-container`
        ]);

        // Tower Sprite
        const sprite = k.add([
            k.sprite(tower.sprite),
            k.pos(xPos, 80),
            k.anchor("center"),
            k.scale(0.05),
            k.z(102),
            `shop-item-${tower.type}`
        ]);

        // Tower Name
        k.add([
            k.text(tower.name, { size: 12 }),
            k.pos(xPos, 115),
            k.anchor("center"),
            k.color(226, 232, 240),
            k.z(102)
        ]);

        // Cost Badge
        const costBadge = k.add([
            k.rect(50, 20, { radius: 4 }),
            k.pos(xPos, 60),
            k.anchor("center"),
            k.color(15, 23, 42),
            k.z(103)
        ]);

        k.add([
            k.text(`$${tower.cost}`, { size: 12, font: "monospace" }),
            k.pos(xPos, 60),
            k.anchor("center"),
            k.color(250, 204, 21), // Yellow
            k.z(104)
        ]);

        // Interaction
        container.onClick(() => {
            if (tower.unlockWave && !gameState.unlockedTowers[tower.type]) {
                k.shake(5);
                const lockMsg = k.add([
                    k.text(`Unlock at Wave ${tower.unlockWave}`, { size: 16 }),
                    k.pos(xPos, 150),
                    k.anchor("center"),
                    k.color(248, 113, 113),
                    k.z(200),
                    k.lifespan(2, { fade: 0.5 })
                ]);
                return;
=======
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
>>>>>>> aeed8bb60a0c96a20954945c24ff645496a1fb94
            }
            onDragStart(tower.type, tower.sprite, tower.range, tower.color);
        });

<<<<<<< HEAD
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
=======
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
>>>>>>> aeed8bb60a0c96a20954945c24ff645496a1fb94

        // Initial Locked State
        if (tower.unlockWave && !gameState.unlockedTowers[tower.type]) {
            sprite.color = k.rgb(100, 100, 100);
            sprite.opacity = 0.5;

            // Lock Icon
            k.add([
                k.text("🔒", { size: 24 }),
                k.pos(xPos, 80),
                k.anchor("center"),
                k.z(105),
                `lock-icon-${tower.type}`
            ]);
        }
<<<<<<< HEAD

        // Check unlock status if wallet connected
        if (tower.unlockWave && walletAddress) {
            BlockchainService.checkUnlockSBT(walletAddress, tower.type).then(unlocked => {
                if (unlocked) {
                    gameState.unlockedTowers[tower.type] = true;
                    updateTowerVisuals(k, tower.type, true);
                }
            });
        }
=======
        onDragStart(type, sprite, range, color, sbtStats[type]);
>>>>>>> aeed8bb60a0c96a20954945c24ff645496a1fb94
    });
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
