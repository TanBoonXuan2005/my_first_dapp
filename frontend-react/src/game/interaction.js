
import { TOWER_COST, UI_HEIGHT, isPlacementFree, isOnPath } from './constants.js';
import { placeBCell, placeMacrophage, placePlatelet, placeBasophil, placeNKCell } from './towers.js';



/**
 * Sets up the input handling for the game, specifically for dragging and dropping towers.
 * Manages the state of the currently dragged item, validates placement, and deducts costs.
 *
 * @param {import("kaboom").KaboomCtx} k - The Kaboom.js context.
 * @param {import("./gameState.js").GameState} gameState - The game state manager.
 * @param {Function} getPaths - Function that returns the current path points { path1Points, path2Points }.
 * @returns {Function} startDrag - A function that can be called to initiate a drag operation (used by shop items).
 */
export function setupInput(k, gameState, getPaths) {
    let isDragging = false;
    let dragSprite = null;
    let rangeIndicator = null;
    let selectedTowerType = null;
    let selectedTowerStats = null;

    const { path1Points, path2Points } = getPaths();

    // Handle Dragging
    k.onUpdate(() => {
        if (gameState.isPaused) return; // Don't update when paused

        if (isDragging && dragSprite) {
            dragSprite.pos = k.mousePos();
            if (rangeIndicator) rangeIndicator.pos = k.mousePos();

            const mousePos = k.mousePos();
            const validPos = mousePos.y > UI_HEIGHT && !isOnPath(k, mousePos, path1Points, path2Points);
            dragSprite.color = validPos ? k.rgb(255, 255, 255) : k.rgb(255, 100, 100);
        }
    });

    // Handle Mouse Release
    k.onMouseRelease(() => {
        if (gameState.isPaused) return; // Don't process input when paused
        if (!isDragging) return;
        const dropPos = k.mousePos();
        isDragging = false;

        if (dragSprite) {
            k.destroy(dragSprite);
            dragSprite = null;
        }

        if (rangeIndicator) {
            k.destroy(rangeIndicator);
            rangeIndicator = null;
        }

        // Validate placement
        if (dropPos.y <= UI_HEIGHT || !isPlacementFree(k, dropPos, path1Points, path2Points)) {
            k.shake(5);
            return;
        }

        const cost = TOWER_COST[selectedTowerType];
        if (gameState.playerATP < cost) {
            // Not enough ATP
            const msg = k.add([
                k.text("Not enough ATP!", { size: 18 }),
                k.pos(k.width() / 2, 120),
                k.anchor("center"),
                k.color(255, 100, 100),
                k.z(200),
                k.opacity(1)
            ]);
            k.wait(2, () => k.destroy(msg));
            selectedTowerType = null;
            return;
        }

        // Deduct ATP
        gameState.updateATP(-cost);

        // Place tower
        if (selectedTowerType === "bcell") placeBCell(k, dropPos, gameState);
        else if (selectedTowerType === "macrophage") placeMacrophage(k, dropPos, gameState, selectedTowerStats);
        else if (selectedTowerType === "platelet") placePlatelet(k, dropPos, gameState, selectedTowerStats);
        else if (selectedTowerType === "basophil") placeBasophil(k, dropPos, gameState, selectedTowerStats);
        else if (selectedTowerType === "nkCell") placeNKCell(k, dropPos, gameState);

        selectedTowerType = null;
        selectedTowerStats = null;
    });

    // Handle Clicking on Placed Towers (Selection)
    k.onMousePress(() => {
        if (gameState.isPaused) return;
        if (isDragging) return;

        const mousePos = k.mousePos();

        // Check if we clicked on a tower
        const towerTags = ["b-cell", "macrophage", "platelet", "basophil", "nk-cell"];
        let clickedTower = null;
        let clickedType = null;

        for (const tag of towerTags) {
            const towers = k.get(tag);
            for (const t of towers) {
                if (t.pos.dist(mousePos) < 30) { // Approximate radius
                    clickedTower = t;
                    clickedType = tag;
                    break;
                }
            }
            if (clickedTower) break;
        }

        // Handle Selection/Deselection
        if (clickedTower) {
            // If we already have a selected tower, deselect it first (remove UI)
            if (gameState.selectedTower) {
                removeSelectionUI(k);
            }

            gameState.selectedTower = clickedTower;

            // Show Range Indicator
            const range = clickedTower.range || 100;
            gameState.selectionRange = k.add([
                k.circle(range),
                k.pos(clickedTower.pos),
                k.anchor("center"),
                k.opacity(0.2),
                k.color(255, 255, 255),
                k.outline(2, k.rgb(255, 255, 255)),
                k.z(49), // Below tower
                "selection-ui"
            ]);

            // Show Sell Button
            // Map tag to cost key (some tags might differ slightly from cost keys if not careful, but here they seem consistent enough or we map them)
            // TOWER_COST keys: bcell, macrophage, platelet, basophil, nkCell
            // Tags: b-cell, macrophage, platelet, basophil, nk-cell

            let costKey = clickedType;
            if (clickedType === "b-cell") costKey = "bcell";
            if (clickedType === "nk-cell") costKey = "nkCell";

            const refundAmount = Math.floor((TOWER_COST[costKey] || 0) / 2);

            gameState.sellBtn = k.add([
                k.rect(80, 30, { radius: 4 }),
                k.pos(clickedTower.pos.x, clickedTower.pos.y - 40),
                k.anchor("center"),
                k.color(255, 50, 50),
                k.area(),
                k.z(200),
                "selection-ui",
                "sell-btn"
            ]);

            gameState.sellText = k.add([
                k.text(`Sell ${refundAmount} ATP`, { size: 14 }),
                k.pos(clickedTower.pos.x, clickedTower.pos.y - 40),
                k.anchor("center"),
                k.color(255, 255, 255),
                k.z(201),
                "selection-ui"
            ]);

            gameState.sellBtn.onClick(() => {
                if (gameState.isPaused) return;

                gameState.updateATP(refundAmount);

                k.add([
                    k.text(`+${refundAmount} ATP`, { size: 20, font: "monospace" }),
                    k.pos(clickedTower.pos),
                    k.anchor("center"),
                    k.color(150, 255, 150),
                    k.z(200),
                    k.lifespan(1, { fade: 0.5 }),
                    k.move(k.vec2(0, -50), 30)
                ]);

                k.destroy(clickedTower);
                removeSelectionUI(k);
                gameState.selectedTower = null;
            });
        } else {
            // Clicked empty space
            // Check if we clicked the sell button itself (handled by onClick above usually, but let's be safe)
            // If we clicked outside, deselect
            // Note: k.onMousePress is global. If we clicked the sell button, this handler also fires.
            // However, the sell button's onClick will also fire.
            // We need to be careful not to deselect immediately if clicking the button.

            // Actually, checking if we clicked the sell button in this global handler is tricky without more logic.
            // A simpler way: if we clicked empty space AND didn't click the sell button.

            // Let's check if we are hovering the sell button
            const isHoveringSell = gameState.sellBtn && gameState.sellBtn.isHovering();

            if (!isHoveringSell) {
                removeSelectionUI(k);
                gameState.selectedTower = null;
            }
        }
    });

    function removeSelectionUI(k) {
        k.destroyAll("selection-ui");
        gameState.selectionRange = null;
        gameState.sellBtn = null;
        gameState.sellText = null;
    }

    /**
     * Initiates the dragging process for a specific tower type.
     * This function is returned by setupInput and is meant to be passed to the shop.
     *
     * @param {string} type - The type of tower (e.g., "bcell", "macrophage").
     * @param {string} spriteName - The sprite name to use for the drag ghost.
     * @param {number} range - The range of the tower to visualize during drag.
     * @param {import("kaboom").Color} color - The color for the range indicator.
     */
    return function startDrag(type, spriteName, range, color, stats = null) {
        if (gameState.isPaused) return; // Don't start drag when paused
        if (isDragging) return;

        // Deselect any selected tower when starting to drag a new one
        if (gameState.selectedTower) {
            removeSelectionUI(k);
            gameState.selectedTower = null;
        }

        isDragging = true;
        selectedTowerType = type;
        selectedTowerStats = stats;

        dragSprite = k.add([
            k.sprite(spriteName),
            k.pos(k.mousePos()),
            k.anchor("center"),
            k.scale(0.06),
            k.opacity(0.7),
            k.z(200),
            "drag-ghost"
        ]);

        rangeIndicator = k.add([
            k.circle(range),
            k.pos(k.mousePos()),
            k.anchor("center"),
            k.opacity(0.2),
            k.color(color),
            k.outline(2, color),
            k.z(199),
            "range-indicator"
        ]);
    };
}

