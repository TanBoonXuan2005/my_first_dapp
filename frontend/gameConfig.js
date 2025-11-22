// Game Configuration - Edit these values to balance the game

const GAME_CONFIG = {
    // Tower Stats
    towers: {
        bCell: {
            range: 250,           // Attack range in pixels
            attackSpeed: 0.5,     // Time between shots in seconds (lower = faster)
            damage: 10,           // Damage per projectile
            projectileSpeed: 400  // Projectile movement speed (pixels/second)
        },
        macrophage: {
            range: 120,           // Short attack range in pixels
            attackSpeed: 2.0,     // Slow attack speed (2 seconds between attacks)
            damage: 50,           // High damage per attack
            isAreaDamage: true    // Deals damage in area
        },
        platelet: {
            range: 180,           // Medium attack range in pixels
            attackSpeed: 1.2,     // Medium attack speed (1.2 seconds between throws)
            damage: 5,            // Low damage per net
            projectileSpeed: 300, // Net projectile speed (pixels/second)
            slowEffect: 0.3,      // 30% slow (reduces speed by 30%)
            netDuration: 5.0      // Net stays on ground for 5 seconds
        }
    },

    // Enemy Stats
    enemies: {
        fluVirus: {
            hp: 80,               // Health points
            speed: 100,           // Movement speed (pixels/second)
        }
    },

    // Wave Configuration
    waves: {
        first: {
            enemyCount: 5,        // Number of enemies to spawn
            spawnDelay: 1.5       // Delay between spawns in seconds
        }
    }
};
