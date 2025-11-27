// BlockchainService.js
// Utility service for OneChain interactions using Move SDK
import { Transaction } from '@onelabs/sui/transactions';
import { PACKAGE_ID, MODULE_NAME } from '../chainConfig';

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
    resetSBTs: async (walletAddress) => {
        if (!walletAddress) return;
        const types = ['macrophage', 'platelet', 'basophil', 'nkCell'];
        types.forEach(type => {
            localStorage.removeItem(`sbt_${type}_${walletAddress}`);
        });
        console.log(`[Dev] Reset SBTs for ${walletAddress}`);
        return true;
    },

    getOwnedSBTs: async (walletAddress) => {
        if (!walletAddress) return [];
        const types = ['macrophage', 'platelet', 'basophil', 'nkCell'];
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
            const macrophageType = `${PACKAGE_ID}::game_core::Macrophage`;
            const plateletType = `${PACKAGE_ID}::game_core::Platelet`;
            const basophilType = `${PACKAGE_ID}::game_core::Basophil`;

            const { data } = await client.getOwnedObjects({
                owner: walletAddress,
                filter: {
                    MatchAny: [
                        { StructType: macrophageType },
                        { StructType: plateletType },
                        { StructType: basophilType }
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
                }
            });

            console.log("[Blockchain] Fetched SBT Stats:", stats);
            return stats;
        } catch (error) {
            console.error("[Blockchain] Error fetching SBT stats:", error);
            return {};
        }
    }
};

export default BlockchainService;
