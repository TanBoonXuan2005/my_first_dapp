// BlockchainService.js
// Utility service for OneChain interactions using Move SDK
import { Transaction } from '@onelabs/sui/transactions';
import { PACKAGE_ID, MODULE_NAME, USDT_TREASURY_CAP_ID } from '../chainConfig';

const BlockchainService = {
    // Helper to format address
    formatAddress: (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },

    // SBT System - Check still uses localStorage as cache
    // In production, you'd query the blockchain for owned objects
    checkUnlockSBT: async (walletAddress, unlockType) => {
        if (!walletAddress) return false;
        const key = `sbt_${unlockType}_${walletAddress}`;
        const hasUnlock = localStorage.getItem(key) === 'true';
        console.log(`[SBT] Checking ${unlockType} unlock for ${walletAddress}: ${hasUnlock}`);
        return hasUnlock;
    },

    // REAL MINTING - Triggers blockchain transaction
    mintUnlockSBT: async (walletAddress, unlockType, signAndExecute) => {
        if (!walletAddress) {
            console.error("[Blockchain] No wallet address");
            return false;
        }

        if (!signAndExecute) {
            console.warn("[Blockchain] No signAndExecute function provided, using mock");
            // Fallback to localStorage if no signer
            localStorage.setItem(`sbt_${unlockType}_${walletAddress}`, 'true');
            return true;
        }

        try {
            const tx = new Transaction();
            const target = `${PACKAGE_ID}::${MODULE_NAME}::mint_${unlockType}`;

            console.log(`[Blockchain] 🔗 Preparing transaction: ${target}`);
            // tx.setGasBudget(10000000); // Let the wallet estimate gas
            tx.moveCall({
                target: target,
                arguments: []
            });

            return new Promise((resolve) => {
                signAndExecute(
                    { transaction: tx },
                    {
                        onSuccess: (result) => {
                            console.log(`[Blockchain] ✅ Successfully minted ${unlockType}!`);
                            console.log(`[Blockchain] Transaction digest: ${result.digest}`);
                            // Cache locally for faster checks
                            localStorage.setItem(`sbt_${unlockType}_${walletAddress}`, 'true');
                            resolve(true);
                        },
                        onError: (err) => {
                            console.error(`[Blockchain] ❌ Mint failed:`, err);
                            resolve(false);
                        }
                    }
                );
            });
        } catch (error) {
            console.error(`[Blockchain] Error preparing transaction:`, error);
            return false;
        }
    },

    checkMacrophageUnlock: async (walletAddress) => {
        return BlockchainService.checkUnlockSBT(walletAddress, 'macrophage');
    },

    mintMacrophageSBT: async (walletAddress, signAndExecute) => {
        return BlockchainService.mintUnlockSBT(walletAddress, 'macrophage', signAndExecute);
    },

    mintBasophilSBT: async (walletAddress, signAndExecute) => {
        return BlockchainService.mintUnlockSBT(walletAddress, 'basophil', signAndExecute);
    },

    mintNKCellSBT: async (walletAddress, signAndExecute) => {
        const success = await BlockchainService.mintUnlockSBT(walletAddress, 'nk_cell', signAndExecute);
        if (success) {
            // Also set camelCase key for frontend consistency
            localStorage.setItem(`sbt_nkCell_${walletAddress}`, 'true');
        }
        return success;
    },

    checkDefenderLicense: async (walletAddress) => {
        return BlockchainService.checkUnlockSBT(walletAddress, 'defender_license');
    },

    mintDefenderLicense: async (walletAddress, signAndExecute) => {
        return BlockchainService.mintUnlockSBT(walletAddress, 'defender_license', signAndExecute);
    },

    checkMagicCard: async (walletAddress, type) => {
        return BlockchainService.checkUnlockSBT(walletAddress, type);
    },

    purchaseMagicCard: async (walletAddress, type, cost, signAndExecute) => {
        if (!walletAddress || !signAndExecute) return false;

        try {
            const tx = new Transaction();

            if (cost > 0) {
                // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
                const costInMist = BigInt(Math.floor(cost * 1_000_000_000));

                // Split the gas coin to get the payment amount
                const [coin] = tx.splitCoins(tx.gas, [costInMist]);

                // Transfer to Treasury
                const TREASURY_ADDRESS = "0x7d20dcdb2bca4f508ea9613994683eb4e76e9c4ed274648c22d9353e543b99";
                tx.transferObjects([coin], TREASURY_ADDRESS);
                console.log(`[Blockchain] 🔗 Preparing purchase tx for ${type} (${cost} SUI)`);
            } else {
                console.log(`[Blockchain] 🔗 Preparing free claim tx for ${type}`);
                // For free claim, we just execute a transaction to prove active user/gas payment
                // We could add a dummy move call here if needed, but an empty tx (paying gas) is also a form of interaction
                // Or we can just transfer 0 coins? No, that's messy.
                // Let's just let the transaction go through. 
                // Note: Some wallets might warn about empty transactions. 
                // To be safe, let's just do a self-transfer of 1 MIST if we really wanted to, but let's try empty first.
            }

            return new Promise((resolve) => {
                signAndExecute(
                    { transaction: tx },
                    {
                        onSuccess: (result) => {
                            console.log(`[Blockchain] ✅ Transaction successful! Digest: ${result.digest}`);
                            // Unlock locally
                            localStorage.setItem(`sbt_${type}_${walletAddress}`, 'true');
                            resolve(true);
                        },
                        onError: (err) => {
                            console.error(`[Blockchain] ❌ Transaction failed:`, err);
                            resolve(false);
                        }
                    }
                );
            });
        } catch (error) {
            console.error(`[Blockchain] Error preparing transaction:`, error);
            return false;
        }
    },

    // Placeholder for future randomness
    getRandomness: async () => {
        const randomValue = Math.random();
        console.log(`[Randomness] Fetched from chain: ${randomValue}`);
        return randomValue;
    },

    // Dev Tools
    resetSBTs: async (client, walletAddress, signAndExecute) => {
        if (!client || !walletAddress || !signAndExecute) return false;

        try {
            console.log("[Blockchain] 🧹 Starting Reset (Burn) Process...");
            const tx = new Transaction();

            const macrophageType = `${PACKAGE_ID}::sbt::Macrophage`;
            const plateletType = `${PACKAGE_ID}::sbt::Platelet`;
            const basophilType = `${PACKAGE_ID}::sbt::Basophil`;
            const nkCellType = `${PACKAGE_ID}::sbt::NKCell`;
            const inventoryType = `${PACKAGE_ID}::inventory::Inventory`;

            // Fetch all owned objects of these types
            const { data } = await client.getOwnedObjects({
                owner: walletAddress,
                filter: {
                    MatchAny: [
                        { StructType: macrophageType },
                        { StructType: plateletType },
                        { StructType: basophilType },
                        { StructType: nkCellType },
                        { StructType: inventoryType }
                    ]
                },
                options: {
                    showContent: true,
                    showType: true
                }
            });

            if (data.length === 0) {
                console.log("[Blockchain] No SBTs found to burn.");
                return true;
            }

            console.log(`[Blockchain] Found ${data.length} items to burn.`);

            // Add burn commands to transaction
            data.forEach(obj => {
                const type = obj.data?.type;
                const objectId = obj.data?.objectId;

                if (type === macrophageType) {
                    tx.moveCall({ target: `${PACKAGE_ID}::game_core::burn_macrophage`, arguments: [tx.object(objectId)] });
                } else if (type === plateletType) {
                    tx.moveCall({ target: `${PACKAGE_ID}::game_core::burn_platelet`, arguments: [tx.object(objectId)] });
                } else if (type === basophilType) {
                    tx.moveCall({ target: `${PACKAGE_ID}::game_core::burn_basophil`, arguments: [tx.object(objectId)] });
                } else if (type === nkCellType) {
                    tx.moveCall({ target: `${PACKAGE_ID}::game_core::burn_nk_cell`, arguments: [tx.object(objectId)] });
                } else if (type === inventoryType) {
                    tx.moveCall({ target: `${PACKAGE_ID}::game_core::burn_inventory`, arguments: [tx.object(objectId)] });
                }
            });

            // Execute
            return new Promise((resolve) => {
                signAndExecute(
                    { transaction: tx },
                    {
                        onSuccess: (result) => {
                            console.log(`[Blockchain] 🔥 Successfully burned all items!`);
                            resolve(true);
                        },
                        onError: (err) => {
                            console.error(`[Blockchain] ❌ Burn failed:`, err);
                            resolve(false);
                        }
                    }
                );
            });

        } catch (error) {
            console.error("[Blockchain] Error resetting SBTs:", error);
            return false;
        }
    }
    ,

    getOwnedSBTs: async (walletAddress) => {
        if (!walletAddress) return [];
        const types = ['macrophage', 'platelet', 'basophil', 'nkCell', 'defender_license'];
        const owned = [];
        for (const type of types) {
            const has = await BlockchainService.checkUnlockSBT(walletAddress, type);
            if (has) owned.push(type);
        }
        return owned;
    },

    getSBTStats: async (client, walletAddress) => {
        if (!client || !walletAddress) return {};

        try {
            const macrophageType = `${PACKAGE_ID}::sbt::Macrophage`;
            const plateletType = `${PACKAGE_ID}::sbt::Platelet`;
            const basophilType = `${PACKAGE_ID}::sbt::Basophil`;
            const nkCellType = `${PACKAGE_ID}::sbt::NKCell`;

            const { data } = await client.getOwnedObjects({
                owner: walletAddress,
                filter: {
                    MatchAny: [
                        { StructType: macrophageType },
                        { StructType: plateletType },
                        { StructType: basophilType },
                        { StructType: nkCellType }
                    ]
                },
                options: {
                    showContent: true
                }
            });

            const stats = {};

            data.forEach(obj => {
                const content = obj.data?.content;
                if (content?.type === macrophageType) {
                    stats.macrophage = content.fields;
                } else if (content?.type === plateletType) {
                    stats.platelet = content.fields;
                } else if (content?.type === basophilType) {
                    stats.basophil = content.fields;
                } else if (content?.type === nkCellType) {
                    stats.nkCell = content.fields;
                }
            });

            console.log("[Blockchain] Fetched SBT Stats:", stats);
            return stats;
        } catch (error) {
            console.error("[Blockchain] Error fetching SBT stats:", error);
            return {};
        }
    },

    getUSDTBalance: async (client, walletAddress) => {
        if (!client || !walletAddress) return 0;
        try {
            const coinType = `${PACKAGE_ID}::usdt::USDT`;
            const { totalBalance } = await client.getBalance({
                owner: walletAddress,
                coinType: coinType
            });
            // Assuming 6 decimals for USDT
            return parseInt(totalBalance) / 1000000;
        } catch (err) {
            console.error("[Blockchain] Error fetching USDT balance:", err);
            return 0;
        }
    },

    mintUSDT: async (client, walletAddress, amount, signAndExecute) => {
        if (!client || !walletAddress || !signAndExecute) return false;

        try {
            // Use the shared TreasuryCap ID from config
            const treasuryCapId = USDT_TREASURY_CAP_ID;

            if (!treasuryCapId || treasuryCapId.includes("REPLACE")) {
                console.error("[Blockchain] USDT_TREASURY_CAP_ID not set!");
                alert("Please update USDT_TREASURY_CAP_ID in chainConfig.js after redeploying!");
                return false;
            }

            console.log(`[Blockchain] Using TreasuryCap: ${treasuryCapId}`);

            // 2. Prepare Transaction
            const tx = new Transaction();
            const target = `${PACKAGE_ID}::usdt::mint`;

            // Amount in smallest unit (6 decimals)
            const amountRaw = amount * 1000000;

            tx.moveCall({
                target: target,
                arguments: [
                    tx.object(treasuryCapId),
                    tx.pure.u64(amountRaw),
                    tx.pure.address(walletAddress)
                ]
            });

            // 3. Execute
            return new Promise((resolve) => {
                signAndExecute(
                    { transaction: tx },
                    {
                        onSuccess: (result) => {
                            console.log(`[Blockchain] ✅ Successfully minted ${amount} USDT!`);
                            resolve(true);
                        },
                        onError: (err) => {
                            console.error(`[Blockchain] ❌ Mint failed:`, err);
                            resolve(false);
                        }
                    }
                );
            });

        } catch (error) {
            console.error("[Blockchain] Error minting USDT:", error);
            return false;
        }
    },

    purchaseCell: async (client, walletAddress, cellType, price, signAndExecute) => {
        if (!client || !walletAddress || !signAndExecute) return false;

        try {
            console.log(`[Blockchain] Purchasing ${cellType} for ${price} USDT...`);
            const tx = new Transaction();

            // 1. Payment Logic (Burn/Transfer)
            // We transfer to 0x0 to simulate burning/payment
            const BURN_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const coinType = `${PACKAGE_ID}::usdt::USDT`;
            const priceRaw = price * 1000000; // 6 decimals

            // Get all USDT coins
            const { data: coins } = await client.getCoins({
                owner: walletAddress,
                coinType: coinType
            });

            // Filter out coins with 0 balance and sort by balance descending (optional, but good for gas)
            const validCoins = coins.filter(c => parseInt(c.balance) > 0);

            if (validCoins.length === 0) {
                alert("No USDT found in wallet!");
                return false;
            }

            // Select primary coin (the one we'll pay from)
            let primaryCoin = validCoins[0];
            let currentBalance = parseInt(primaryCoin.balance);
            const coinsToMerge = [];

            // Check if primary coin is enough, if not, find coins to merge
            if (currentBalance < priceRaw) {
                for (let i = 1; i < validCoins.length; i++) {
                    const coin = validCoins[i];
                    coinsToMerge.push(coin);
                    currentBalance += parseInt(coin.balance);

                    if (currentBalance >= priceRaw) break;
                }
            }

            if (currentBalance < priceRaw) {
                alert(`Insufficient USDT Balance! You have ${currentBalance / 1000000} USDT, but need ${price} USDT.`);
                return false;
            }

            // Merge coins if needed
            if (coinsToMerge.length > 0) {
                console.log(`[Blockchain] Merging ${coinsToMerge.length} coins into primary coin...`);
                tx.mergeCoins(
                    tx.object(primaryCoin.coinObjectId),
                    coinsToMerge.map(c => tx.object(c.coinObjectId))
                );
            }

            // Split coins
            const [paymentCoin] = tx.splitCoins(tx.object(primaryCoin.coinObjectId), [tx.pure.u64(priceRaw)]);

            // Transfer payment to burn address
            tx.transferObjects([paymentCoin], tx.pure.address(BURN_ADDRESS));

            // 2. Mint Logic
            // Map cell type to mint function
            let mintTarget = "";
            if (cellType === 'macrophage') mintTarget = `${PACKAGE_ID}::game_core::mint_macrophage`;
            else if (cellType === 'platelet') mintTarget = `${PACKAGE_ID}::game_core::mint_platelet`;
            else if (cellType === 'basophil') mintTarget = `${PACKAGE_ID}::game_core::mint_basophil`;
            else if (cellType === 'nkCell') mintTarget = `${PACKAGE_ID}::game_core::mint_nk_cell`;
            else {
                console.error("Unknown cell type:", cellType);
                return false;
            }

            tx.moveCall({
                target: mintTarget,
                arguments: []
            });

            // 3. Execute
            return new Promise((resolve) => {
                signAndExecute(
                    { transaction: tx },
                    {
                        onSuccess: (result) => {
                            console.log(`[Blockchain] ✅ Successfully purchased ${cellType}!`);
                            // Cache locally for immediate UI update
                            localStorage.setItem(`sbt_${cellType}_${walletAddress}`, 'true');
                            resolve(true);
                        },
                        onError: (err) => {
                            console.error(`[Blockchain] ❌ Purchase failed:`, err);
                            resolve(false);
                        }
                    }
                );
            });

        } catch (error) {
            console.error("[Blockchain] Error purchasing cell:", error);
            return false;
        }
    },

    // --- Magic Card Inventory (Single SBT) ---

    getMagicCardInventory: async (client, walletAddress) => {
        if (!client || !walletAddress) return null;
        try {
            const inventoryType = `${PACKAGE_ID}::inventory::Inventory`;
            const { data } = await client.getOwnedObjects({
                owner: walletAddress,
                filter: { StructType: inventoryType },
                options: { showContent: true }
            });

            if (data.length > 0) {
                const content = data[0].data?.content;
                return {
                    objectId: data[0].data?.objectId,
                    counts: content?.fields || { heal: 0, nuke: 0, freeze: 0, poison: 0 }
                };
            }
            return null;
        } catch (error) {
            console.error("[Blockchain] Error fetching Magic Card Inventory:", error);
            return null;
        }
    },

    createMagicCardInventory: async (walletAddress, signAndExecute) => {
        if (!walletAddress || !signAndExecute) return null;
        try {
            const tx = new Transaction();
            tx.moveCall({
                target: `${PACKAGE_ID}::game_core::create_inventory`,
                arguments: []
            });

            return new Promise((resolve) => {
                signAndExecute(
                    {
                        transaction: tx,
                        options: { showEffects: true }
                    },
                    {
                        onSuccess: (result) => {
                            console.log(`[Blockchain] ✅ Inventory created! Digest: ${result.digest}`);
                            // Find the created object ID
                            const created = result.effects?.created?.[0]?.reference?.objectId;
                            resolve(created || true);
                        },
                        onError: (err) => {
                            console.error(`[Blockchain] ❌ Create Inventory failed:`, err);
                            resolve(null);
                        }
                    }
                );
            });
        } catch (error) {
            console.error("[Blockchain] Error creating inventory:", error);
            return null;
        }
    },

    buyMagicCard: async (client, walletAddress, type, price, signAndExecute) => {
        if (!client || !walletAddress || !signAndExecute) return false;

        // 1. Check Inventory
        const inventory = await BlockchainService.getMagicCardInventory(client, walletAddress);
        const inventoryId = inventory?.objectId;

        try {
            const tx = new Transaction();

            // 2. Payment (Burn/Transfer)
            const BURN_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const coinType = `${PACKAGE_ID}::usdt::USDT`;
            const priceRaw = price * 1000000;

            const { data: coins } = await client.getCoins({
                owner: walletAddress,
                coinType: coinType
            });
            const validCoins = coins.filter(c => parseInt(c.balance) > 0);

            if (validCoins.length === 0) {
                alert("No USDT found!");
                return false;
            }

            let primaryCoin = validCoins[0];
            let currentBalance = parseInt(primaryCoin.balance);
            const coinsToMerge = [];

            if (currentBalance < priceRaw) {
                for (let i = 1; i < validCoins.length; i++) {
                    const coin = validCoins[i];
                    coinsToMerge.push(coin);
                    currentBalance += parseInt(coin.balance);
                    if (currentBalance >= priceRaw) break;
                }
            }

            if (currentBalance < priceRaw) {
                alert(`Insufficient USDT! Need ${price} USDT.`);
                return false;
            }

            if (coinsToMerge.length > 0) {
                tx.mergeCoins(
                    tx.object(primaryCoin.coinObjectId),
                    coinsToMerge.map(c => tx.object(c.coinObjectId))
                );
            }

            const [paymentCoin] = tx.splitCoins(tx.object(primaryCoin.coinObjectId), [tx.pure.u64(priceRaw)]);
            tx.transferObjects([paymentCoin], tx.pure.address(BURN_ADDRESS));

            // 3. Update or Create Inventory
            if (inventoryId) {
                // Normal update
                tx.moveCall({
                    target: `${PACKAGE_ID}::game_core::update_card_inventory`,
                    arguments: [
                        tx.object(inventoryId), // Inventory Object
                        tx.pure.vector('u8', new TextEncoder().encode(type)), // Card Type as vector<u8>
                        tx.pure.u64(1),                // Amount
                        tx.pure.bool(true)             // is_increase = true
                    ]
                });
            } else {
                // First time purchase: Create AND Add
                console.log("[Blockchain] First purchase! Creating inventory and adding card...");
                tx.moveCall({
                    target: `${PACKAGE_ID}::game_core::create_inventory_and_purchase`,
                    arguments: [
                        tx.pure.vector('u8', new TextEncoder().encode(type)),
                        tx.pure.u64(1)
                    ]
                });
            }

            return new Promise((resolve) => {
                signAndExecute(
                    { transaction: tx },
                    {
                        onSuccess: (result) => {
                            console.log(`[Blockchain] ✅ Purchased ${type}!`);
                            resolve(true);
                        },
                        onError: (err) => {
                            console.error(`[Blockchain] ❌ Purchase failed:`, err);
                            resolve(false);
                        }
                    }
                );
            });

        } catch (error) {
            console.error("[Blockchain] Error buying magic card:", error);
            return false;
        }
    },

    useMagicCard: async (client, walletAddress, type, signAndExecute) => {
        if (!client || !walletAddress || !signAndExecute) return false;

        const inventory = await BlockchainService.getMagicCardInventory(client, walletAddress);
        if (!inventory) return false;

        try {
            const tx = new Transaction();
            tx.moveCall({
                target: `${PACKAGE_ID}::game_core::update_card_inventory`,
                arguments: [
                    tx.object(inventory.objectId),
                    tx.pure.vector('u8', new TextEncoder().encode(type)),
                    tx.pure.u64(1),
                    tx.pure.bool(false) // is_increase = false (consume)
                ]
            });

            return new Promise((resolve) => {
                signAndExecute(
                    { transaction: tx },
                    {
                        onSuccess: (result) => {
                            console.log(`[Blockchain] ✅ Used ${type}!`);
                            resolve(true);
                        },
                        onError: (err) => {
                            console.error(`[Blockchain] ❌ Use failed:`, err);
                            resolve(false);
                        }
                    }
                );
            });
        } catch (error) {
            console.error("[Blockchain] Error using magic card:", error);
            return false;
        }
    },

    claimWaveReward: async (client, walletAddress, wave, signAndExecute) => {
        if (!client || !walletAddress || !signAndExecute) return false;

        // Only waves > 5 eligible
        if (wave <= 5) return false;

        console.log(`[Blockchain] 🎲 Rolling for Wave ${wave} Reward...`);

        // 1. Check Inventory
        const inventory = await BlockchainService.getMagicCardInventory(client, walletAddress);
        const inventoryId = inventory?.objectId;

        try {
            const tx = new Transaction();
            const RANDOM_OBJECT_ID = "0x8"; // Standard Random Object ID

            if (inventoryId) {
                // Existing inventory: claim_wave_reward
                tx.moveCall({
                    target: `${PACKAGE_ID}::game_core::claim_wave_reward`,
                    arguments: [
                        tx.object(inventoryId),
                        tx.pure.u64(wave),
                        tx.object(RANDOM_OBJECT_ID)
                    ]
                });
            } else {
                // No inventory: create_inventory_and_claim_reward
                console.log("[Blockchain] No inventory found. Creating one for reward claim...");
                tx.moveCall({
                    target: `${PACKAGE_ID}::game_core::create_inventory_and_claim_reward`,
                    arguments: [
                        tx.pure.u64(wave),
                        tx.object(RANDOM_OBJECT_ID)
                    ]
                });
            }

            return new Promise((resolve) => {
                signAndExecute(
                    { transaction: tx },
                    {
                        onSuccess: (result) => {
                            console.log(`[Blockchain] ✅ Reward Roll Transaction Success! Digest: ${result.digest}`);
                            // We don't know if they won or not without parsing events/effects, 
                            // but for now we just confirm the roll happened.
                            resolve(true);
                        },
                        onError: (err) => {
                            console.error(`[Blockchain] ❌ Reward Roll failed:`, err);
                            resolve(false);
                        }
                    }
                );
            });

        } catch (error) {
            console.error("[Blockchain] Error claiming wave reward:", error);
            return false;
        }
    }
};

export default BlockchainService;
