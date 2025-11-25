
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
        else if (selectedTowerType === "basophil") placeBasophil(k, dropPos, gameState);
        else if (selectedTowerType === "nkCell") placeNKCell(k, dropPos, gameState);

        selectedTowerType = null;
        selectedTowerStats = null;
    });

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
