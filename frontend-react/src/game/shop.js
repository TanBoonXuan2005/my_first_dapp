
import { TOWER_COST } from './constants.js';
import GAME_CONFIG from '../gameConfig.js';
import BlockchainService from '../services/BlockchainService.js';

export function setupShop(k, gameState, onDragStart) {
    // B-Cell
    const shopItemBCell = k.add([
        k.sprite("b-cell-neutral"),
        k.pos(120, 50),
        k.anchor("center"),
        k.scale(0.06),
        k.z(101),
        k.area(),
        "shop-item-bcell"
    ]);

    k.add([
        k.text("B-Cell", { size: 14 }),
        k.pos(120, 85),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(101)
    ]);

    k.add([
        k.text(`Cost: ${TOWER_COST.bcell}`, { size: 12 }),
        k.pos(120, 105),
        k.anchor("center"),
        k.color(200, 200, 0),
        k.z(101)
    ]);

    shopItemBCell.onClick(() => {
        onDragStart("bcell", "b-cell-neutral", GAME_CONFIG.towers.bCell.range, k.rgb(100, 200, 255));
    });

    // Platelet
    const shopItemPlatelet = k.add([
        k.sprite("platelet-idle"),
        k.pos(280, 50),
        k.anchor("center"),
        k.scale(0.06),
        k.z(101),
        k.area(),
        "shop-item-platelet"
    ]);

    k.add([
        k.text("Platelet", { size: 14 }),
        k.pos(280, 85),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(101)
    ]);

    k.add([
        k.text(`Cost: ${TOWER_COST.platelet}`, { size: 12 }),
        k.pos(280, 105),
        k.anchor("center"),
        k.color(200, 200, 0),
        k.z(101)
    ]);

    shopItemPlatelet.onClick(() => {
        onDragStart("platelet", "platelet-idle", GAME_CONFIG.towers.platelet.range, k.rgb(100, 255, 100));
    });

    // Basophil
    const shopItemBasophil = k.add([
        k.sprite("basophil-idle"),
        k.pos(360, 50),
        k.anchor("center"),
        k.scale(0.06),
        k.z(101),
        k.area(),
        "shop-item-basophil"
    ]);

    k.add([
        k.text("Basophil", { size: 14 }),
        k.pos(360, 85),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(101)
    ]);

    k.add([
        k.text(`Cost: ${TOWER_COST.basophil}`, { size: 12 }),
        k.pos(360, 105),
        k.anchor("center"),
        k.color(200, 200, 0),
        k.z(101)
    ]);

    shopItemBasophil.onClick(() => {
        onDragStart("basophil", "basophil-idle", GAME_CONFIG.towers.basophil.range, k.rgb(255, 150, 50));
    });

    // Macrophage (Unlockable)
    checkMacrophageUnlock(k, onDragStart);
}

function checkMacrophageUnlock(k, onDragStart) {
    const walletState = JSON.parse(sessionStorage.getItem('walletState'));
    let isMacrophageUnlocked = false;

    if (walletState && walletState.address) {
        BlockchainService.checkMacrophageUnlock(walletState.address).then(unlocked => {
            isMacrophageUnlocked = unlocked;
            if (unlocked) {
                createMacrophageShopItem(k, onDragStart, true);
            } else {
                createMacrophageShopItem(k, onDragStart, false);
            }
        });
    } else {
        createMacrophageShopItem(k, onDragStart, false);
    }
}

function createMacrophageShopItem(k, onDragStart, isUnlocked) {
    const shopItemMacrophage = k.add([
        k.sprite("macrophage-idle-neutral"),
        k.pos(200, 50),
        k.anchor("center"),
        k.scale(0.06),
        k.z(101),
        k.area(),
        "shop-item-macrophage"
    ]);

    k.add([
        k.text("Macrophage", { size: 14 }),
        k.pos(200, 85),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(101)
    ]);

    k.add([
        k.text(`Cost: ${TOWER_COST.macrophage}`, { size: 12 }),
        k.pos(200, 105),
        k.anchor("center"),
        k.color(200, 200, 0),
        k.z(101)
    ]);

    shopItemMacrophage.onClick(() => {
        if (!isUnlocked) {
            k.shake(8);
            const lockMsg = k.add([
                k.text("Complete Wave 1 to unlock!", { size: 18 }),
                k.pos(k.width() / 2, 120),
                k.anchor("center"),
                k.color(255, 100, 100),
                k.z(200),
                k.opacity(1)
            ]);
            k.wait(2, () => k.destroy(lockMsg));
            return;
        }
        onDragStart("macrophage", "macrophage-idle-neutral", GAME_CONFIG.towers.macrophage.range, k.rgb(200, 100, 255));
    });
}
