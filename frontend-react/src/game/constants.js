
export const TOWER_COST = {
    bcell: 10,
    macrophage: 20,
    platelet: 15,
    basophil: 25,
};

export const UI_HEIGHT = 135;

export function getPaths(k, canvasWidth) {
    const path1Points = [
        k.vec2(0, 165),
        k.vec2(200, 165),
        k.vec2(300, 265),
        k.vec2(500, 265),
        k.vec2(600, 315),
        k.vec2(canvasWidth, 300)
    ];

    const path2Points = [
        k.vec2(0, 450),
        k.vec2(200, 450),
        k.vec2(300, 350),
        k.vec2(500, 350),
        k.vec2(600, 300),
        k.vec2(canvasWidth, 300)
    ];

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
    const towerTags = ["b-cell", "macrophage", "platelet", "basophil"];
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
