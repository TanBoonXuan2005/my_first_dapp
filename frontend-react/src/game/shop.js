
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
 * @param {string} walletAddress - The user's wallet address.
 * @param {object} sbtStats - The user's SBT stats.
 */

const SPRITE_VERTICAL_POS = 65;
const TEXT_VERTICAL_POS = 100;
const COST_VERTICAL_POS = 120;

export function setupShop(k, gameState, onDragStart, walletAddress, sbtStats = {}) {
    // Shop Background Panel (Glassmorphism) - Bottom Aligned
    const shopBg = k.add([
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

    const towers = [
        { type: 'bcell', sprite: 'b-cell-neutral', name: 'B-Cell', cost: TOWER_COST.bcell, range: GAME_CONFIG.towers.bCell.range, color: k.rgb(100, 200, 255) },
        { type: 'macrophage', sprite: 'macrophage-idle-neutral', name: 'Macrophage', cost: TOWER_COST.macrophage, range: GAME_CONFIG.towers.macrophage.range, color: k.rgb(200, 100, 255), unlockWave: 2 },
        { type: 'platelet', sprite: 'platelet-idle', name: 'Platelet', cost: TOWER_COST.platelet, range: GAME_CONFIG.towers.platelet.range, color: k.rgb(100, 255, 100), unlockWave: 4 },
        { type: 'basophil', sprite: 'basophil-idle', name: 'Basophil', cost: TOWER_COST.basophil, range: GAME_CONFIG.towers.basophil.range, color: k.rgb(255, 150, 50) }
    ];

    const startX = k.width() / 2 - (towers.length * 110) / 2 + 55; // Adjusted spacing

    towers.forEach((tower, index) => {
        const xPos = startX + index * 110;
        const baseY = k.height() - 55; // Center of the shop panel

        // Tower Icon Container (Glass Chip)
        const container = k.add([
            k.rect(90, 90, { radius: 12 }),
            k.pos(xPos, baseY),
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
            k.pos(xPos, baseY - 10),
            k.anchor("center"),
            k.scale(0.06), // Slightly larger
            k.z(102),
            `shop-item-${tower.type}`
        ]);

        // Tower Name
        k.add([
            k.text(tower.name, { size: 12, font: "monospace" }),
            k.pos(xPos, baseY + 30),
            k.anchor("center"),
            k.color(148, 163, 184), // Muted text
            k.z(102)
        ]);

        // Cost Badge (Pill style)
        const costBadge = k.add([
            k.rect(50, 20, { radius: 10 }),
            k.pos(xPos, baseY - 35),
            k.anchor("center"),
            k.color(15, 23, 42),
            k.outline(1, k.rgb(250, 204, 21)), // Yellow outline
            k.z(103)
        ]);

        k.add([
            k.text(`$${tower.cost}`, { size: 12, font: "monospace" }),
            k.pos(xPos, baseY - 35),
            k.anchor("center"),
            k.color(250, 204, 21), // Yellow
            k.z(104)
        ]);

        // Interaction
        container.onClick(() => {
            if (tower.unlockWave && !gameState.unlockedTowers[tower.type]) {
                k.shake(2);
                const lockMsg = k.add([
                    k.text(`Unlock Wave ${tower.unlockWave}`, { size: 14 }),
                    k.pos(xPos, baseY - 75), // Show above container
                    k.anchor("center"),
                    k.color(248, 113, 113),
                    k.z(200),
                    k.lifespan(1.5, { fade: 0.5 })
                ]);
                return;
            }
            onDragStart(tower.type, tower.sprite, tower.range, tower.color, sbtStats[tower.type]);
        });

        container.onHover(() => {
            container.color = k.rgb(51, 65, 85);
            container.outline.color = k.rgb(56, 189, 248); // Cyan highlight
            sprite.scale = k.vec2(0.07); // Slight zoom
            k.setCursor("pointer");
        });

        container.onHoverEnd(() => {
            container.color = k.rgb(30, 41, 59);
            container.outline.color = k.rgb(71, 85, 105);
            sprite.scale = k.vec2(0.06);
            k.setCursor("default");
        });

        // Initial Locked State
        if (tower.unlockWave && !gameState.unlockedTowers[tower.type]) {
            sprite.color = k.rgb(100, 100, 100);
            sprite.opacity = 0.5;

            // Lock Icon
            k.add([
                k.text("🔒", { size: 24 }),
                k.pos(xPos, baseY - 10),
                k.anchor("center"),
                k.z(105),
                `lock-icon-${tower.type}`
            ]);
        }

        // Check unlock status if wallet connected
        if (tower.unlockWave && walletAddress) {
            BlockchainService.checkUnlockSBT(walletAddress, tower.type).then(unlocked => {
                if (unlocked) {
                    gameState.unlockedTowers[tower.type] = true;
                    updateTowerVisuals(k, tower.type, true);
                }
            });
        }
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
