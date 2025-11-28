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
            attackSpeed: 1.0,     // Medium attack speed (1.2 seconds between throws)
            damage: 5,            // Low damage per net
            projectileSpeed: 500, // Net projectile speed (pixels/second) - increased for accuracy
            slowEffect: 0.8,      // 30% slow (reduces speed by 30%)
            netDuration: 3.0      // Net stays on ground for 5 seconds
        },
        basophil: {
            range: 200,           // Medium-long attack range in pixels
            attackSpeed: 1.5,     // Slow attack speed (1.5 seconds between throws)
            damage: 25,           // Area damage per bomb
            projectileSpeed: 500, // Bomb projectile speed (pixels/second)
            explosionRadius: 80   // Explosion damage radius in pixels
        },
        nkCell: {
            range: 750,           // Long attack range
            attackSpeed: 6.0,     // Slow attack speed
            damage: 1500,           // High single target damage
            projectileSpeed: 800  // Fast projectile
        }
    },

    // Magic Cards (Active Abilities)
    magicCards: {
        heal: {
            name: "Healing Pulse",
            description: "Restores 50 HP to your base.",
            cooldown: 60, // Seconds
            cost: 0, // Free to use once owned (SBT)
            color: "#00ff00"
        },
        nuke: {
            name: "Cytokine Storm",
            description: "Deals 500 damage to ALL enemies.",
            cooldown: 120, // Seconds
            cost: 0,
            color: "#ff0000"
        },
        freeze: {
            name: "Cryo Stasis",
            description: "Freezes all enemies for 5 seconds.",
            cooldown: 90,
            cost: 0,
            color: "#00ffff"
        },
        poison: {
            name: "Viral Toxin",
            description: "Deals 50 damage per second for 10 seconds.",
            cooldown: 60,
            cost: 0,
            color: "#800080"
        }
    },

    // Enemy Stats
    enemies: {
        fluVirus: {
            hp: 80,               // Health points
            speed: 100,           // Movement speed (pixels/second)
        },
        adenovirus: {
            hp: 200,
            speed: 80
        },
        hiv: {
            hp: 500,
            speed: 60
        }
    },

    // Wave Configuration - Progressive Difficulty
    // Procedural Wave Generation
    getWaveConfig: (waveIndex) => {
        const waveNumber = waveIndex + 1;

        // Determine Enemy Type
        let enemyType = 'fluVirus';
        let baseHp = 80;
        let baseSpeed = 100;

        if (waveNumber >= 15) {
            enemyType = 'mixed';
            baseHp = 600; // Even stronger base for late game
            baseSpeed = 70;
        } else if (waveNumber >= 12) {
            enemyType = 'hiv';
            baseHp = 500;
            baseSpeed = 60;
        } else if (waveNumber >= 6) {
            enemyType = 'adenovirus';
            baseHp = 200;
            baseSpeed = 80;
        }

        // Base stats
        const baseCount = 1;

        // Scaling factors
        const hpMultiplier = Math.pow(1.2, waveIndex); // +20% HP per wave
        const speedMultiplier = Math.min(2.5, 1 + (waveIndex * 0.05)); // +5% speed, max 2.5x

        // Calculate stats
        return {
            waveNumber: waveNumber,
            enemyCount: Math.floor(baseCount + (waveIndex / 3)), // +1 enemy every 3 waves
            spawnDelay: Math.max(0.5, 2.0 - (waveIndex * 0.1)), // Faster spawns, min 0.5s
            enemyHp: Math.floor(baseHp * hpMultiplier),
            enemySpeed: baseSpeed * speedMultiplier,
            enemyType: enemyType,
            preparationTime: 5 // Seconds between waves
        };
    }
};

export default GAME_CONFIG;
