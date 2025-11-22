// Game Configuration - Edit these values to balance the game

const GAME_CONFIG = {
    // Tower Stats
    towers: {
        bCell: {
            range: 250,           // Attack range in pixels
            attackSpeed: 0.5,     // Time between shots in seconds (lower = faster)
            damage: 10,           // Damage per projectile
            projectileSpeed: 400  // Projectile movement speed (pixels/second)
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
