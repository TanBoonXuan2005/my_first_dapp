export const TOWER_COST = {
    bcell: 50,
    macrophage: 120,
    platelet: 80,
    basophil: 100,
    nkCell: 200
};

export const MAGIC_CARD_COSTS = {
    heal: 0,
    nuke: 0,
    freeze: 0,
    poison: 0
};

export const UI_HEIGHT = 60;

export function getPaths(k, canvasWidth) {
    // Single winding path (Bloons style)
    const path1Points = [
        k.vec2(0, 200),
        k.vec2(200, 200),
        k.vec2(300, 250),
        k.vec2(200, 350),
        k.vec2(100, 350),
        k.vec2(100, 500),
        k.vec2(300, 500),
        k.vec2(400, 400),
        k.vec2(500, 450),
        k.vec2(600, 400),
        k.vec2(canvasWidth, 400)
    ];

    // Path 2 is now identical to Path 1 (single path gameplay)
    const path2Points = [...path1Points];

    return { path1Points, path2Points };
}

// Helper functions
export function distToSegment(k, p, v, w) {
    const l2 = v.dist(w) * v.dist(w);
    if (l2 === 0) return p.dist(v);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projection = k.vec2(v.x + t * (w.x - v.x), v.y + t * (w.y - v.y));
    return p.dist(projection);
}

export function isOnPath(k, pos, path1Points, path2Points) {
    const pathWidth = 40;
    for (let i = 0; i < path1Points.length - 1; i++) {
        if (distToSegment(k, pos, path1Points[i], path1Points[i + 1]) < pathWidth) return true;
    }
    for (let i = 0; i < path2Points.length - 1; i++) {
        if (distToSegment(k, pos, path2Points[i], path2Points[i + 1]) < pathWidth) return true;
    }
    return false;
}

// Helper to check if a placement position is free (no overlap and not on path)
export function isPlacementFree(k, pos, path1Points, path2Points) {
    if (isOnPath(k, pos, path1Points, path2Points)) return false;
    // Check overlap with existing towers
    const towerTags = ["b-cell", "macrophage", "platelet", "basophil", "nk-cell"];
    for (const tag of towerTags) {
        const towers = k.get(tag);
        for (const t of towers) {
            if (t.pos.dist(pos) < 30) { // minimum distance between towers
                return false;
            }
        }
    }
    return true;
}
